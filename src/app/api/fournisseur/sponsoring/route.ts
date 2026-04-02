import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { getSponsoringPackage } from "@/lib/utils/sponsoring";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "SUPPLIER") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const supplier = await prisma.supplierProfile.findUnique({ where: { userId: session.user.id } });
  if (!supplier) return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });
  if (!supplier.registrationPaid) {
    return NextResponse.json({ error: "Inscription requise" }, { status: 403 });
  }

  const { packageId, origin } = await req.json().catch(() => ({}));
  const pkg = getSponsoringPackage(packageId);
  if (!pkg) return NextResponse.json({ error: "Package invalide" }, { status: 400 });

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
            name: `Mise en avant ${pkg.label} — Cocott NoStress`,
            description: pkg.description,
          },
          unit_amount: pkg.priceCents,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${origin}/fournisseur/visibilite?success=1`,
    cancel_url: `${origin}/fournisseur/visibilite?cancelled=1`,
    metadata: {
      type: "SPONSORING",
      userId: session.user.id,
      supplierId: supplier.id,
      packageId: pkg.id,
      days: String(pkg.days),
    },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
