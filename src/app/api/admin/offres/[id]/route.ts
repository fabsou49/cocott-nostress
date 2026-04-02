import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const body = await req.json();

  const offer = await prisma.promoOffer.update({
    where: { id: params.id },
    data: {
      ...(body.active !== undefined && { active: body.active }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.maxUses !== undefined && { maxUses: body.maxUses }),
      ...(body.expiresAt !== undefined && { expiresAt: body.expiresAt ? new Date(body.expiresAt) : null }),
    },
  });

  return NextResponse.json(offer);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const offer = await prisma.promoOffer.findUnique({
    where: { id: params.id },
    include: { _count: { select: { redemptions: true } } },
  });

  if (!offer) return NextResponse.json({ error: "Offre introuvable" }, { status: 404 });
  if (offer._count.redemptions > 0) {
    return NextResponse.json(
      { error: "Impossible de supprimer une offre déjà utilisée" },
      { status: 400 }
    );
  }

  await prisma.promoOffer.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
