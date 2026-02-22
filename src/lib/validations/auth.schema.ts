import { z } from "zod";

/**
 * Login Schema
 */
export const loginSchema = z.object({
  identifier: z
    .string({
      message: "L'identifiant est requis",
    })
    .min(3, "L'identifiant doit contenir au moins 3 caractères")
    .max(50, "Identifiant trop long")
    .trim(),

  password: z
    .string({
      message: "Le mot de passe est requis",
    })
    .min(6, "Le mot de passe doit contenir au moins 6 caractères")
    .max(100, "Mot de passe trop long"),
});

export type LoginSchema = z.infer<typeof loginSchema>;


/**
 * Register Schema (optionnel pour plus tard)
 */
export const registerSchema = z.object({
  firstName: z
    .string()
    .min(2, "Le prénom est trop court")
    .max(50),

  lastName: z
    .string()
    .min(2, "Le nom est trop court")
    .max(50),

  email: z
    .string()
    .email("Email invalide"),

  password: z
    .string()
    .min(8, "Minimum 8 caractères")
    .regex(/[A-Z]/, "Doit contenir une majuscule")
    .regex(/[0-9]/, "Doit contenir un chiffre"),
});

export type RegisterSchema = z.infer<typeof registerSchema>;
