import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createProjectSchema } from "@/lib/validations/project";
import { detectContactInfo } from "@/lib/utils/detectContact";

// GET: list projects (suppliers see OPEN projects, clients see their own)
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || "OPEN";
  const category = searchParams.get("category");

  if (session.user.role === "CLIENT") {
    const client = await prisma.clientProfile.findUnique({
      where: { userId: session.user.id },
    });
    if (!client) return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });

    const projects = await prisma.project.findMany({
      where: {
        clientId: client.id,
        ...(status !== "ALL" && { status: status as never }),
      },
      include: {
        _count: { select: { bids: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // Include referencePrice for clients viewing their own projects
    return NextResponse.json(projects);
  }

  if (session.user.role === "SUPPLIER" || session.user.role === "ADMIN") {
    const projects = await prisma.project.findMany({
      where: {
        status: "OPEN",
        ...(category && { category }),
      },
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        deadline: true,
        status: true,
        createdAt: true,
        // referencePrice is NOT included
        client: {
          select: {
            companyName: true,
            user: { select: { name: true } },
          },
        },
        _count: { select: { bids: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(projects);
  }

  return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
}

// POST: create project (CLIENT only)
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "CLIENT") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = createProjectSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const client = await prisma.clientProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!client) return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });

  // Block contact info in project descriptions
  const checkTitle = detectContactInfo(parsed.data.title);
  if (checkTitle.found) {
    return NextResponse.json(
      { error: `Les coordonnées personnelles (${checkTitle.label}) ne sont pas autorisées dans le titre du projet.` },
      { status: 400 }
    );
  }
  const checkDesc = detectContactInfo(parsed.data.description);
  if (checkDesc.found) {
    return NextResponse.json(
      { error: `Les coordonnées personnelles (${checkDesc.label}) ne sont pas autorisées dans la description du projet. Les échanges doivent rester sur la plateforme.` },
      { status: 400 }
    );
  }

  const project = await prisma.project.create({
    data: {
      clientId: client.id,
      title: parsed.data.title,
      description: parsed.data.description,
      category: parsed.data.category,
      deadline: parsed.data.deadline ? new Date(parsed.data.deadline) : null,
      referencePrice: parsed.data.referencePrice,
      status: "OPEN",
    },
  });

  return NextResponse.json(project, { status: 201 });
}
