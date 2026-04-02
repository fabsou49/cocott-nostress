import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

// POST: client pays the accepted bid amount into escrow
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session || session.user.role !== "CLIENT") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { origin } = await req.json().catch(() => ({}));

  const client = await prisma.clientProfile.findUnique({ where: { userId: session.user.id } });
  if (!client) return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });

  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: {
      bids: { where: { status: "ACCEPTED" }, include: { supplier: true } },
    },
  });

  if (!project || project.clientId !== client.id) {
    return NextResponse.json({ error: "Projet introuvable" }, { status: 404 });
  }
  if (project.status !== "IN_REVIEW") {
    return NextResponse.json({ error: "Ce projet n'est pas en attente de paiement" }, { status: 400 });
  }
  if (project.escrowPaymentIntentId) {
    return NextResponse.json({ error: "Un paiement est déjà en cours" }, { status: 400 });
  }

  const acceptedBid = project.bids[0];
  if (!acceptedBid) return NextResponse.json({ error: "Aucune offre acceptée" }, { status: 400 });

  if (!acceptedBid.supplier.stripeAccountActive) {
    return NextResponse.json(
      { error: "Le fournisseur n'a pas encore connecté son compte de paiement" },
      { status: 400 }
    );
  }

  const amountCents = Math.round(Number(acceptedBid.amount) * 100);

  // Create or retrieve Stripe customer for client
  let customerId = client.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: session.user.email!,
      name: session.user.name!,
      metadata: { userId: session.user.id, clientId: client.id },
    });
    customerId = customer.id;
    await prisma.clientProfile.update({
      where: { id: client.id },
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
            name: `Paiement projet : ${project.title}`,
            description: `Offre de ${acceptedBid.supplier.companyName || "le fournisseur"} — ${Number(acceptedBid.amount).toLocaleString("fr-FR")}€`,
          },
          unit_amount: amountCents,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${origin}/client/projets/${project.id}?paiement=success`,
    cancel_url: `${origin}/client/projets/${project.id}?paiement=cancelled`,
    metadata: {
      type: "ESCROW",
      projectId: project.id,
      bidId: acceptedBid.id,
      supplierId: acceptedBid.supplierId,
      userId: session.user.id,
    },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
