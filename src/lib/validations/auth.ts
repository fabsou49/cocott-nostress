import { z } from "zod";

export const registerClientSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide"),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  companyName: z.string().optional(),
});

export const registerSupplierSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide"),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  companyName: z.string().min(2, "Le nom ou pseudo professionnel est requis"),
  description: z.string().min(20, "La description doit contenir au moins 20 caractères").optional(),
  skills: z.array(z.string()).default([]),
  experienceLevel: z.enum(["JUNIOR", "INTERMEDIATE", "SENIOR", "EXPERT"]).optional(),
});

export type RegisterClientInput = z.infer<typeof registerClientSchema>;
export type RegisterSupplierInput = z.infer<typeof registerSupplierSchema>;
