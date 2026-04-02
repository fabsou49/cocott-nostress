import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { validatePromoCode, applyRegistrationDiscount, getCommissionConfig } from "@/lib/utils/offers";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "SUPPLIER") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { code } = await req.json();
  if (!code) return NextResponse.json({ error: "Code requis" }, { status: 400 });

  const result = await validatePromoCode(code, "REGISTRATION");
  if (!result.valid || !result.offer) {
    return NextResponse.json({ valid: false, error: result.error }, { status: 200 });
  }

  const config = await getCommissionConfig();
  const finalAmountCents = applyRegistrationDiscount(config.registrationFeeCents, result.offer);
  const savingsCents = config.registrationFeeCents - finalAmountCents;

  return NextResponse.json({
    valid: true,
    offerId: result.offer.id,
    description: result.offer.description,
    originalAmountCents: config.registrationFeeCents,
    finalAmountCents,
    savingsCents,
  });
}
