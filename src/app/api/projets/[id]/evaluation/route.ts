import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createRatingSchema } from "@/lib/validations/rating";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session || session.user.role !== "CLIENT") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const client = await prisma.clientProfile.findUnique({ where: { userId: session.user.id } });
  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: { bids: { where: { status: "ACCEPTED" } } },
  });

  if (!project || project.clientId !== client?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  if (project.status !== "COMPLETED") {
    return NextResponse.json({ error: "Le projet doit être terminé pour soumettre une évaluation" }, { status: 400 });
  }

  const acceptedBid = project.bids[0];
  if (!acceptedBid) {
    return NextResponse.json({ error: "Aucun fournisseur sélectionné" }, { status: 400 });
  }

  const body = await req.json();
  const parsed = createRatingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  // Create rating and recalculate supplier average in a transaction
  const [rating] = await prisma.$transaction(async (tx) => {
    const newRating = await tx.rating.create({
      data: {
        projectId: params.id,
        supplierId: acceptedBid.supplierId,
        clientId: client.id,
        score: parsed.data.score,
        comment: parsed.data.comment,
      },
    });

    // Recalculate supplier average rating
    const allRatings = await tx.rating.findMany({
      where: { supplierId: acceptedBid.supplierId },
      select: { score: true },
    });
    const totalRatings = allRatings.length;
    const averageRating = allRatings.reduce((sum, r) => sum + r.score, 0) / totalRatings;

    await tx.supplierProfile.update({
      where: { id: acceptedBid.supplierId },
      data: { averageRating, totalRatings },
    });

    return [newRating];
  });

  return NextResponse.json(rating, { status: 201 });
}
