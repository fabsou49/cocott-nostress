import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createBidSchema } from "@/lib/validations/bid";
import { detectContactInfo } from "@/lib/utils/detectContact";

// GET: list bids (CLIENT owner sees all bids for their project)
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const project = await prisma.project.findUnique({ where: { id: params.id } });
  if (!project) return NextResponse.json({ error: "Projet introuvable" }, { status: 404 });

  if (session.user.role === "CLIENT") {
    const client = await prisma.clientProfile.findUnique({ where: { userId: session.user.id } });
    if (project.clientId !== client?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }
  } else if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const bids = await prisma.bid.findMany({
    where: { projectId: params.id },
    include: {
      supplier: {
        select: {
          id: true,
          companyName: true,
          averageRating: true,
          totalRatings: true,
          user: { select: { name: true } },
        },
      },
    },
    orderBy: { submittedAt: "asc" },
  });

  return NextResponse.json(bids);
}

// POST: submit a bid (SUPPLIER only, registration must be paid)
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session || session.user.role !== "SUPPLIER") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const supplier = await prisma.supplierProfile.findUnique({ where: { userId: session.user.id } });
  if (!supplier) return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });

  if (!supplier.registrationPaid) {
    return NextResponse.json(
      { error: "Vous devez finaliser votre inscription (paiement de 100€) pour soumettre des offres" },
      { status: 403 }
    );
  }

  const project = await prisma.project.findUnique({ where: { id: params.id } });
  if (!project || project.status !== "OPEN") {
    return NextResponse.json({ error: "Ce projet n'accepte plus d'offres" }, { status: 400 });
  }

  const body = await req.json();
  const parsed = createBidSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  // Block contact info to prevent off-platform transactions
  if (parsed.data.coverLetter) {
    const check = detectContactInfo(parsed.data.coverLetter);
    if (check.found) {
      return NextResponse.json(
        { error: `Les coordonnées personnelles (${check.label}) ne sont pas autorisées dans les lettres de motivation. Les échanges doivent rester sur la plateforme.` },
        { status: 400 }
      );
    }
  }

  // Check if supplier already bid on this project
  const existing = await prisma.bid.findUnique({
    where: { projectId_supplierId: { projectId: params.id, supplierId: supplier.id } },
  });
  if (existing) {
    return NextResponse.json({ error: "Vous avez déjà soumis une offre pour ce projet" }, { status: 409 });
  }

  const bid = await prisma.bid.create({
    data: {
      projectId: params.id,
      supplierId: supplier.id,
      amount: parsed.data.amount,
      coverLetter: parsed.data.coverLetter,
      estimatedDays: parsed.data.estimatedDays,
    },
  });

  return NextResponse.json(bid, { status: 201 });
}
