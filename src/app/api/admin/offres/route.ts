import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createOfferSchema } from "@/lib/validations/offers";

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const offers = await prisma.promoOffer.findMany({
    include: { _count: { select: { redemptions: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(offers);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = createOfferSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const data = parsed.data;

  // FIXED_CENTS only makes sense for REGISTRATION target
  if (data.target === "COMMISSION_RATE" && data.discountType === "FIXED_CENTS") {
    return NextResponse.json(
      { error: "Les offres sur commission doivent utiliser un pourcentage" },
      { status: 400 }
    );
  }

  if (data.discountType === "PERCENTAGE" && Number(data.discountValue) > 100) {
    return NextResponse.json({ error: "La réduction ne peut pas dépasser 100%" }, { status: 400 });
  }

  const existing = await prisma.promoOffer.findUnique({ where: { code: data.code } });
  if (existing) {
    return NextResponse.json({ error: "Ce code promo existe déjà" }, { status: 409 });
  }

  const offer = await prisma.promoOffer.create({
    data: {
      code: data.code,
      description: data.description,
      target: data.target,
      discountType: data.discountType,
      discountValue: data.discountValue,
      durationMonths: data.durationMonths ?? null,
      maxUses: data.maxUses ?? null,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      active: data.active,
    },
  });

  return NextResponse.json(offer, { status: 201 });
}
