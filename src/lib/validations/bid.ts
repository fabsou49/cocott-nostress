import { z } from "zod";

export const createBidSchema = z.object({
  amount: z
    .number({ invalid_type_error: "Veuillez entrer un montant valide" })
    .positive("Le montant doit être positif")
    .max(1000000),
  coverLetter: z.string().min(50, "Votre présentation doit contenir au moins 50 caractères").optional(),
  estimatedDays: z.number().int().positive().max(365).optional(),
});

export type CreateBidInput = z.infer<typeof createBidSchema>;
