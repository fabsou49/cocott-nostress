import { z } from "zod";

export const commissionConfigSchema = z.object({
  successRate: z.number().min(0).max(100),
  failureRate: z.number().min(0).max(100),
  registrationFeeEuros: z.number().min(0).max(10000),
});

export const createOfferSchema = z.object({
  code: z.string().min(2).max(32).transform((v) => v.toUpperCase()),
  description: z.string().min(5).max(200),
  target: z.enum(["REGISTRATION", "COMMISSION_RATE"]),
  discountType: z.enum(["PERCENTAGE", "FIXED_CENTS"]),
  discountValue: z.number().positive(),
  durationMonths: z.number().int().positive().nullable().optional(),
  maxUses: z.number().int().positive().nullable().optional(),
  expiresAt: z.string().nullable().optional(),
  active: z.boolean().default(true),
});

export type CommissionConfigInput = z.infer<typeof commissionConfigSchema>;
export type CreateOfferInput = z.infer<typeof createOfferSchema>;
