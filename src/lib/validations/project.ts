import { z } from "zod";

export const createProjectSchema = z.object({
  title: z.string().min(5, "Le titre doit contenir au moins 5 caractères").max(100),
  description: z.string().min(20, "La description doit contenir au moins 20 caractères"),
  category: z.string().optional(),
  deadline: z.string().optional(),
  referencePrice: z
    .number({ invalid_type_error: "Veuillez entrer un prix valide" })
    .positive("Le prix doit être positif")
    .max(1000000, "Le prix maximum est 1 000 000€"),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
