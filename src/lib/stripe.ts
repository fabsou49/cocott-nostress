import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia" as never,
});

export const REGISTRATION_FEE_CENTS = 10000; // 100€
export const SUCCESS_COMMISSION_RATE = 0.10; // 10%
export const FAILURE_COMMISSION_RATE = 0.05; // 5%
