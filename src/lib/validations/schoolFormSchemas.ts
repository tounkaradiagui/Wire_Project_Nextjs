import { z } from "zod";
import { SchoolStatus, SubscriptionPlan } from "@prisma/client";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ACCEPTED_TYPES = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/webp",
];

export const teacherApplicationSchema = z.object({
    schoolId: z.string(),

    fullName: z
        .string()
        .min(3, "Le nom complet est requis"),

    phone: z
        .string()
        .min(8, "Numéro invalide"),

    email: z
        .string()
        .email("Adresse email invalide"),

    coverLetter: z
        .string()
        .min(30, "Votre lettre de motivation est trop courte."),

    cvUrl: z.string().url({
        message: "Veuillez uploader votre CV.",
    }),

    cvFileName: z.string().min(1),
});

export type TeacherApplicationInput = z.infer<typeof teacherApplicationSchema>;

export const createSchoolSchema = z.object({
    id: z.string().optional(),

    // Informations de l'école
    schoolName: z.string().min(2, {
        message: "Le nom de l'école est requis",
    }),

    city: z.string().min(2, {
        message: "La ville est requise",
    }),

    country: z.string().min(2, {
        message: "Le pays est requis",
    }),

    address: z.string().optional(),

    // Contact de l'école
    email: z
        .string()
        .email({
            message: "Adresse email invalide",
        })
        .optional()
        .or(z.literal("")),

    phone: z.string().optional(),

    website: z
        .string()
        .url({
            message: "URL du site web invalide",
        })
        .optional()
        .or(z.literal("")),

    // Responsable de l'établissement
    contactName: z.string().min(2, {
        message: "Le nom du responsable est requis",
    }),

    contactEmail: z.string().email({
        message: "Email du responsable invalide",
    }),

    contactPhone: z.string().optional(),

    // Informations complémentaires
    studentsCount: z.coerce.number().min(0).optional(),

    description: z.string().optional(),

    logoUrl: z.string().optional(),

    bannerUrl: z.string().optional(),

    language: z.string().default("fr"),

    timezone: z.string().default("Africa/Abidjan"),

    // Abonnement
    plan: z.nativeEnum(SubscriptionPlan),

    status: z.nativeEnum(SchoolStatus).default(SchoolStatus.ACTIVE),

    trialEndsAt: z.coerce.date().optional(),

    subscriptionEndsAt: z.coerce.date().optional(),

    isVerified: z.boolean().default(true),
});

export type CreateSchoolSchemaInput = z.infer<typeof createSchoolSchema>;