import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { getEffectiveCommissionRates } from "@/lib/utils/offers";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: {
      client: {
        select: { id: true, companyName: true, user: { select: { name: true } } },
      },
      _count: { select: { bids: true } },
    },
  });

  if (!project) return NextResponse.json({ error: "Projet introuvable" }, { status: 404 });

  // Check ownership for CLIENT
  if (session.user.role === "CLIENT") {
    const client = await prisma.clientProfile.findUnique({ where: { userId: session.user.id } });
    if (project.clientId !== client?.id) {
      // Return without referencePrice
      const { referencePrice, ...safeProject } = project;
      void referencePrice;
      return NextResponse.json(safeProject);
    }
    return NextResponse.json(project);
  }

  // Suppliers and admins never see referencePrice
  if (session.user.role === "SUPPLIER") {
    const { referencePrice, ...safeProject } = project;
    void referencePrice;
    return NextResponse.json(safeProject);
  }

  return NextResponse.json(project);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const project = await prisma.project.findUnique({ where: { id: params.id } });
  if (!project) return NextResponse.json({ error: "Projet introuvable" }, { status: 404 });

  // Only client owner or admin
  if (session.user.role === "CLIENT") {
    const client = await prisma.clientProfile.findUnique({ where: { userId: session.user.id } });
    if (project.clientId !== client?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }
  } else if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const body = await req.json();
  const allowedFields = ["status", "title", "description", "category", "deadline"];
  const updateData: Record<string, unknown> = {};
  for (const field of allowedFields) {
    if (body[field] !== undefined) updateData[field] = body[field];
  }

  // Handle project completion/failure — transfer or refund via Stripe
  if (body.status === "COMPLETED" || body.status === "FAILED") {
    const acceptedBid = await prisma.bid.findFirst({
      where: { projectId: params.id, status: "ACCEPTED" },
      include: { supplier: { select: { stripeAccountId: true } } },
    });

    if (acceptedBid && project.escrowPaymentIntentId) {
      const commissionType = body.status === "COMPLETED" ? "SUCCESS" : "FAILURE";
      const { successRate, failureRate } = await getEffectiveCommissionRates(acceptedBid.supplierId);
      const rate = commissionType === "SUCCESS" ? successRate : failureRate;
      const baseAmount = Number(acceptedBid.amount);
      const commissionAmount = Math.round(baseAmount * rate * 100) / 100;
      const baseAmountCents = Math.round(baseAmount * 100);
      const commissionCents = Math.round(commissionAmount * 100);
      const transferCents = baseAmountCents - commissionCents;

      let stripeTransferId: string | null = null;
      let stripeRefundId: string | null = null;

      if (body.status === "COMPLETED" && acceptedBid.supplier.stripeAccountId && transferCents > 0) {
        // Transfer (bid amount - commission) to supplier
        const transfer = await stripe.transfers.create({
          amount: transferCents,
          currency: "eur",
          destination: acceptedBid.supplier.stripeAccountId,
          source_transaction: project.escrowPaymentIntentId,
          metadata: { projectId: params.id, bidId: acceptedBid.id },
        });
        stripeTransferId = transfer.id;
      } else if (body.status === "FAILED") {
        // Refund client (bid amount - failure commission) — platform keeps the commission
        const paymentIntent = await stripe.paymentIntents.retrieve(project.escrowPaymentIntentId);
        const chargeId = typeof paymentIntent.latest_charge === "string"
          ? paymentIntent.latest_charge
          : paymentIntent.latest_charge?.id;
        if (chargeId && transferCents > 0) {
          const refund = await stripe.refunds.create({
            charge: chargeId,
            amount: transferCents, // refund amount = bid - failure commission
            metadata: { projectId: params.id, reason: "project_failed" },
          });
          stripeRefundId = refund.id;
        }
      }

      await prisma.commission.upsert({
        where: { projectId: params.id },
        create: {
          projectId: params.id,
          bidId: acceptedBid.id,
          baseAmount,
          commissionRate: rate,
          commissionAmount,
          type: commissionType,
          status: "PAID",
          stripeTransferId,
          stripeRefundId,
          paidAt: new Date(),
        },
        update: {},
      });
    } else if (acceptedBid) {
      // No escrow — just record commission as pending
      const commissionType = body.status === "COMPLETED" ? "SUCCESS" : "FAILURE";
      const { successRate, failureRate } = await getEffectiveCommissionRates(acceptedBid.supplierId);
      const rate = commissionType === "SUCCESS" ? successRate : failureRate;
      const baseAmount = Number(acceptedBid.amount);
      const commissionAmount = Math.round(baseAmount * rate * 100) / 100;
      await prisma.commission.upsert({
        where: { projectId: params.id },
        create: {
          projectId: params.id,
          bidId: acceptedBid.id,
          baseAmount,
          commissionRate: rate,
          commissionAmount,
          type: commissionType,
          status: "PENDING",
        },
        update: {},
      });
    }
  }

  const updated = await prisma.project.update({
    where: { id: params.id },
    data: updateData,
  });

  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session || session.user.role !== "CLIENT") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const project = await prisma.project.findUnique({ where: { id: params.id } });
  if (!project) return NextResponse.json({ error: "Projet introuvable" }, { status: 404 });

  const client = await prisma.clientProfile.findUnique({ where: { userId: session.user.id } });
  if (project.clientId !== client?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  if (!["DRAFT", "OPEN"].includes(project.status)) {
    return NextResponse.json({ error: "Ce projet ne peut pas être supprimé" }, { status: 400 });
  }

  await prisma.project.update({
    where: { id: params.id },
    data: { status: "CANCELLED" },
  });

  return NextResponse.json({ success: true });
}
