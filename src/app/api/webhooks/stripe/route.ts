import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { getEffectiveCommissionRates } from "@/lib/utils/offers";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error("Webhook signature error:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const { type, userId, supplierId } = session.metadata || {};

    if (type === "ESCROW") {
      const { projectId, bidId, supplierId: escrowSupplierId } = session.metadata || {};
      if (projectId && bidId && escrowSupplierId) {
        const paymentIntentId = session.payment_intent as string;
        await prisma.$transaction(async (tx) => {
          await tx.project.update({
            where: { id: projectId },
            data: { status: "IN_PROGRESS", escrowPaymentIntentId: paymentIntentId },
          });
          await tx.payment.upsert({
            where: { stripePaymentIntentId: paymentIntentId },
            create: {
              userId: userId!,
              type: "ESCROW",
              amount: (session.amount_total ?? 0) / 100,
              status: "SUCCEEDED",
              stripePaymentIntentId: paymentIntentId,
              referenceId: projectId,
              referenceType: "PROJECT",
            },
            update: {},
          });
        });
      }
    }

    if (type === "SPONSORING" && supplierId) {
      const { days } = session.metadata || {};
      const daysNum = parseInt(days ?? "0", 10);
      if (daysNum > 0) {
        const supplier = await prisma.supplierProfile.findUnique({ where: { id: supplierId } });
        const base = supplier?.sponsoredUntil && supplier.sponsoredUntil > new Date()
          ? supplier.sponsoredUntil
          : new Date();
        const sponsoredUntil = new Date(base.getTime() + daysNum * 24 * 60 * 60 * 1000);

        await prisma.$transaction(async (tx) => {
          await tx.supplierProfile.update({
            where: { id: supplierId },
            data: { sponsoredUntil },
          });
          await tx.payment.upsert({
            where: { stripePaymentIntentId: session.payment_intent as string },
            create: {
              userId: userId!,
              type: "SPONSORING",
              amount: (session.amount_total ?? 0) / 100,
              status: "SUCCEEDED",
              stripePaymentIntentId: session.payment_intent as string,
              referenceId: supplierId,
              referenceType: "SUPPLIER_PROFILE",
            },
            update: {},
          });
        });
      }
    }

    if (type === "REGISTRATION" && supplierId) {
      const { offerId, originalAmountCents } = session.metadata || {};
      const finalAmountCents = session.amount_total ?? Number(originalAmountCents ?? 10000);

      await prisma.$transaction(async (tx) => {
        await tx.supplierProfile.update({
          where: { id: supplierId },
          data: { registrationPaid: true, registrationPaidAt: new Date() },
        });

        await tx.payment.upsert({
          where: { stripePaymentIntentId: session.payment_intent as string },
          create: {
            userId: userId!,
            type: "REGISTRATION",
            amount: finalAmountCents / 100,
            status: "SUCCEEDED",
            stripePaymentIntentId: session.payment_intent as string,
            referenceId: supplierId,
            referenceType: "SUPPLIER_PROFILE",
          },
          update: {},
        });

        // Record promo redemption if applicable
        if (offerId) {
          const offer = await tx.promoOffer.findUnique({ where: { id: offerId } });
          if (offer) {
            const alreadyRedeemed = await tx.promoRedemption.findUnique({
              where: { offerId_supplierId: { offerId, supplierId } },
            });
            if (!alreadyRedeemed) {
              const commissionDiscountUntil =
                offer.target === "COMMISSION_RATE" && offer.durationMonths
                  ? new Date(Date.now() + offer.durationMonths * 30 * 24 * 60 * 60 * 1000)
                  : null;

              await tx.promoRedemption.create({
                data: {
                  offerId,
                  supplierId,
                  originalAmountCents: Number(originalAmountCents ?? 10000),
                  finalAmountCents,
                  commissionDiscountUntil,
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
    }
  }

  if (event.type === "payment_intent.payment_failed") {
    const intent = event.data.object as Stripe.PaymentIntent;
    await prisma.payment.updateMany({
      where: { stripePaymentIntentId: intent.id },
      data: { status: "FAILED" },
    });
  }

  return NextResponse.json({ received: true });
}
