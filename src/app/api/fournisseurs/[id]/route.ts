import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const supplier = await prisma.supplierProfile.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      companyName: true,
      description: true,
      averageRating: true,
      totalRatings: true,
      createdAt: true,
      user: { select: { name: true } },
      ratings: {
        select: {
          id: true,
          score: true,
          comment: true,
          createdAt: true,
          client: { select: { companyName: true, user: { select: { name: true } } } },
          project: { select: { title: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  });

  if (!supplier) return NextResponse.json({ error: "Fournisseur introuvable" }, { status: 404 });

  return NextResponse.json(supplier);
}
