import { SubscriptionPlan } from "@prisma/client";
import { z } from "zod";

export const schoolProvisionSchema = z.object({
    // ─────────────────────────────────────
    // Demande
    // ─────────────────────────────────────
    requestId: z.string().min(1),

    // ─────────────────────────────────────
    // École
    // ─────────────────────────────────────
    schoolName: z
        .string()
        .min(2, "Le nom de l'école est obligatoire"),

    city: z
        .string()
        .min(2, "La ville est obligatoire"),

    country: z
        .string()
        .min(2, "Le pays est obligatoire"),

    studentsCount: z.coerce
        .number()
        .min(1, "Le nombre d'élèves doit être supérieur à 0"),

    // ─────────────────────────────────────
    // Administrateur
    // ─────────────────────────────────────
    adminFirstName: z
        .string()
        .min(2, "Le prénom est obligatoire"),

    adminLastName: z
        .string()
        .min(2, "Le nom est obligatoire"),

    username: z
        .string()
        .min(4, "Minimum 4 caractères")
        .max(30, "Maximum 30 caractères")
        .regex(
            /^[a-zA-Z0-9._-]+$/,
            "Caractères autorisés : lettres, chiffres, . _ -"
        ),

    email: z
        .string()
        .email("Adresse email invalide"),

    phone: z
        .string()
        .optional(),

    password: z
        .string()
        .min(8, "Minimum 8 caractères"),

    // ─────────────────────────────────────
    // Abonnement
    // ─────────────────────────────────────
    plan: z.nativeEnum(SubscriptionPlan),

    trialDays: z.coerce
        .number()
        .min(0)
        .max(365),

    // facultatif
    subscriptionEndsAt: z
        .coerce
        .date()
        .optional(),
});

export type SchoolProvisionInput =
    z.infer<typeof schoolProvisionSchema>;