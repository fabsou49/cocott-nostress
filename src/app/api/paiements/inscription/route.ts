import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { getCommissionConfig, validatePromoCode, applyRegistrationDiscount } from "@/lib/utils/offers";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "SUPPLIER") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const supplier = await prisma.supplierProfile.findUnique({ where: { userId: session.user.id } });
  if (!supplier) return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });
  if (supplier.registrationPaid) return NextResponse.json({ error: "Inscription déjà payée" }, { status: 400 });

  const { origin, promoCode } = await req.json().catch(() => ({ origin: process.env.NEXTAUTH_URL, promoCode: null }));

  // Fetch dynamic registration fee
  const config = await getCommissionConfig();
  let finalAmountCents = config.registrationFeeCents;
  let offerId: string | null = null;

  // Apply promo code if provided
  if (promoCode) {
    const result = await validatePromoCode(promoCode, "REGISTRATION");
    if (result.valid && result.offer) {
      finalAmountCents = applyRegistrationDiscount(config.registrationFeeCents, result.offer);
      offerId = result.offer.id;
    }
  }

  // If final amount is 0€ — activate immediately, no Stripe needed
  if (finalAmountCents === 0) {
    await prisma.$transaction(async (tx) => {
      await tx.supplierProfile.update({
        where: { id: supplier.id },
        data: { registrationPaid: true, registrationPaidAt: new Date() },
      });

      await tx.payment.create({
        data: {
          userId: session.user.id,
          type: "REGISTRATION",
          amount: 0,
          status: "SUCCEEDED",
          referenceId: supplier.id,
          referenceType: "SUPPLIER_PROFILE",
        },
      });

      if (offerId) {
        const offer = await tx.promoOffer.findUnique({ where: { id: offerId } });
        if (offer) {
          const alreadyRedeemed = await tx.promoRedemption.findUnique({
            where: { offerId_supplierId: { offerId, supplierId: supplier.id } },
          });
          if (!alreadyRedeemed) {
            await tx.promoRedemption.create({
              data: {
                offerId,
                supplierId: supplier.id,
                originalAmountCents: config.registrationFeeCents,
                finalAmountCents: 0,
              },
            });
            await tx.promoOffer.update({
              where: { id: offerId },
              data: { currentUses: { increment: 1 } },
            });
          }
        }
      }
    });

    return NextResponse.json({ free: true, url: `${origin}/fournisseur/tableau-de-bord?inscription=success` });
  }

  // Create or retrieve Stripe customer
  let customerId = supplier.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: session.user.email!,
      name: session.user.name!,
      metadata: { userId: session.user.id, supplierId: supplier.id },
    });
    customerId = customer.id;
    await prisma.supplierProfile.update({
      where: { id: supplier.id },
      data: { stripeCustomerId: customerId },
    });
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "eur",
          product_data: {
            name: "Inscription Fournisseur - Cocott NoStress",
            description: promoCode
              ? `Code promo ${promoCode.toUpperCase()} appliqué`
              : "Frais d'inscription unique pour accéder à la plateforme",
          },
          unit_amount: finalAmountCents,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${origin}/fournisseur/tableau-de-bord?inscription=success`,
    cancel_url: `${origin}/fournisseur/inscription-paiement?cancelled=true`,
    metadata: {
      type: "REGISTRATION",
      userId: session.user.id,
      supplierId: supplier.id,
      offerId: offerId ?? "",
      originalAmountCents: String(config.registrationFeeCents),
    },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
