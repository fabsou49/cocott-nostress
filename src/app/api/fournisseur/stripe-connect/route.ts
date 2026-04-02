import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

// POST: create or resume Stripe Connect Express onboarding
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "SUPPLIER") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { origin } = await req.json().catch(() => ({}));
  const supplier = await prisma.supplierProfile.findUnique({ where: { userId: session.user.id } });
  if (!supplier) return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });

  let accountId = supplier.stripeAccountId;

  // Create a new Express account if not yet created
  if (!accountId) {
    const account = await stripe.accounts.create({
      type: "express",
      country: "FR",
      email: session.user.email!,
      capabilities: { transfers: { requested: true } },
      business_type: "individual",
      metadata: { userId: session.user.id, supplierId: supplier.id },
    });
    accountId = account.id;
    await prisma.supplierProfile.update({
      where: { id: supplier.id },
      data: { stripeAccountId: accountId },
    });
  }

  // Check if already fully onboarded
  const account = await stripe.accounts.retrieve(accountId);
  if (account.details_submitted) {
    await prisma.supplierProfile.update({
      where: { id: supplier.id },
      data: { stripeAccountActive: true },
    });
    return NextResponse.json({ alreadyActive: true });
  }

  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${origin}/fournisseur/paiements?refresh=1`,
    return_url: `${origin}/fournisseur/paiements?connected=1`,
    type: "account_onboarding",
  });

  return NextResponse.json({ url: accountLink.url });
}

// GET: check current Connect account status
export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "SUPPLIER") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const supplier = await prisma.supplierProfile.findUnique({
    where: { userId: session.user.id },
    select: { stripeAccountId: true, stripeAccountActive: true },
  });
  if (!supplier) return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });

  // Re-check Stripe if we have an account but not marked active
  if (supplier.stripeAccountId && !supplier.stripeAccountActive) {
    const account = await stripe.accounts.retrieve(supplier.stripeAccountId);
    if (account.details_submitted) {
      await prisma.supplierProfile.update({
        where: { userId: session.user.id },
        data: { stripeAccountActive: true },
      });
      return NextResponse.json({ active: true });
    }
  }

  return NextResponse.json({ active: supplier.stripeAccountActive });
}
