import { prisma } from "@/lib/prisma";
import type { CommissionConfig, PromoOffer } from "@prisma/client";

export async function getCommissionConfig(): Promise<CommissionConfig> {
  const config = await prisma.commissionConfig.findUnique({ where: { id: "global" } });
  if (!config) {
    // Fallback if seed hasn't run
    return {
      id: "global",
      successRate: 0.10 as unknown as CommissionConfig["successRate"],
      failureRate: 0.05 as unknown as CommissionConfig["failureRate"],
      registrationFeeCents: 10000,
      updatedAt: new Date(),
    };
  }
  return config;
}

export async function getEffectiveCommissionRates(supplierId: string): Promise<{
  successRate: number;
  failureRate: number;
}> {
  const config = await getCommissionConfig();
  const baseSuccess = Number(config.successRate);
  const baseFailure = Number(config.failureRate);

  // Check for an active commission discount redemption
  const activeDiscount = await prisma.promoRedemption.findFirst({
    where: {
      supplierId,
      commissionDiscountUntil: { gt: new Date() },
      offer: { target: "COMMISSION_RATE", active: true },
    },
    include: { offer: true },
  });

  if (!activeDiscount) return { successRate: baseSuccess, failureRate: baseFailure };

  const { successRate, failureRate } = applyCommissionDiscount(
    baseSuccess,
    baseFailure,
    activeDiscount.offer
  );
  return { successRate, failureRate };
}

export async function validatePromoCode(
  code: string,
  target: "REGISTRATION" | "COMMISSION_RATE"
): Promise<{ valid: boolean; offer?: PromoOffer; error?: string }> {
  const offer = await prisma.promoOffer.findUnique({ where: { code: code.toUpperCase() } });

  if (!offer) return { valid: false, error: "Code promo introuvable" };
  if (!offer.active) return { valid: false, error: "Ce code promo n'est plus actif" };
  if (offer.target !== target) return { valid: false, error: "Ce code ne s'applique pas à cette opération" };
  if (offer.expiresAt && offer.expiresAt < new Date()) return { valid: false, error: "Ce code promo a expiré" };
  if (offer.maxUses !== null && offer.currentUses >= offer.maxUses) {
    return { valid: false, error: "Ce code promo a atteint son nombre maximum d'utilisations" };
  }

  return { valid: true, offer };
}

export function applyRegistrationDiscount(baseFeeCents: number, offer: PromoOffer): number {
  if (offer.discountType === "PERCENTAGE") {
    const discount = Math.round(baseFeeCents * (Number(offer.discountValue) / 100));
    return Math.max(0, baseFeeCents - discount);
  }
  // FIXED_CENTS
  return Math.max(0, baseFeeCents - Number(offer.discountValue));
}

export function applyCommissionDiscount(
  baseSuccessRate: number,
  baseFailureRate: number,
  offer: PromoOffer
): { successRate: number; failureRate: number } {
  if (offer.discountType === "PERCENTAGE") {
    const factor = 1 - Number(offer.discountValue) / 100;
    return {
      successRate: Math.max(0, baseSuccessRate * factor),
      failureRate: Math.max(0, baseFailureRate * factor),
    };
  }
  // FIXED_CENTS doesn't make sense for rate discounts — treat as percentage
  return { successRate: baseSuccessRate, failureRate: baseFailureRate };
}
