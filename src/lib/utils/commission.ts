import { SUCCESS_COMMISSION_RATE, FAILURE_COMMISSION_RATE } from "@/lib/stripe";

export function calculateCommission(
  bidAmount: number,
  type: "SUCCESS" | "FAILURE"
): { rate: number; amount: number } {
  const rate = type === "SUCCESS" ? SUCCESS_COMMISSION_RATE : FAILURE_COMMISSION_RATE;
  const amount = Math.round(bidAmount * rate * 100) / 100;
  return { rate, amount };
}
