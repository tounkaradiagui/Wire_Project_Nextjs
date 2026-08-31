"use server";

import { CreateSchoolSchemaInput } from "@/lib/validations/schoolFormSchemas";
import prisma from '@/lib/prisma';
import slugify from "slugify";
import { file } from "node_modules/zod/v4/classic/external.cjs";
import { SchoolStatus } from "@prisma/client";
import { randomUUID } from 'crypto';
import { createClerkClient } from "@clerk/nextjs/server";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { logAction } from "@/lib/logs/audit"
import { Role, AuditAction } from "@prisma/client"
import { isDatabaseConnectionError } from "@/lib/helpers/db-error";

const MAX_APPLICATIONS = 2;

type currentState = { success: boolean; error: string | null; };

// Create School Action
export const createSchool = async (
    currentState: currentState,
    data: CreateSchoolSchemaInput
) => {
    try {
        // Vérifier que le slug est unique
        let slug = slugify(data.schoolName, {
            lower: true,
            strict: true,
            locale: "fr",
        });

        let counter = 1;

        while (
            await prisma.school.findUnique({
                where: { slug },
            })
        ) {
            slug = `${slugify(data.schoolName, {
                lower: true,
                strict: true,
                locale: "fr",
            })}-${counter++}`;
        }

        // Vérifier que le nom est unique
        const existingSchool = await prisma.school.findFirst({
            where: {
                name: data.schoolName,
            },
        });

        if (existingSchool) {
            return {
                success: false,
                error: "Une école portant ce nom existe déjà.",
            };
        }

        await prisma.school.create({
            data: {
                slug,
                name: data.schoolName,

                city: data.city,
                country: data.country,
                address: data.address,

                email: data.email || null,
                phone: data.phone || null,
                website: data.website || null,

                description: data.description,

                logoUrl: data.logoUrl,
                bannerUrl: data.bannerUrl,

                language: data.language,
                timezone: data.timezone,

                maxStudents: data.studentsCount,

                status: SchoolStatus.ACTIVE,
                isVerified: true,

                contactName: data.contactName,
                contactEmail: data.contactEmail,
                contactPhone: data.contactPhone,
            },
        });

        return {
            success: true,
            error: null,
        };
    } catch (error) {
        return {
            success: false,
            error: "Erreur lors de la création de l'école.",
        };
    }
};

// Update School Action
export const updateSchool = async (
    currentState: currentState,
    data: CreateSchoolSchemaInput
) => {
    try {
        if (!data.id) {
            return {
                success: false,
                error: "Identifiant de l'école manquant.",
            };
        }

        await prisma.school.update({
            where: {
                id: data.id,
            },
            data: {
                name: data.schoolName,

                city: data.city,
                country: data.country,
                address: data.address,

                email: data.email || null,
                phone: data.phone || null,
                website: data.website || null,

                description: data.description,

                logoUrl: data.logoUrl,
                bannerUrl: data.bannerUrl,

                language: data.language,
                timezone: data.timezone,

                maxStudents: data.studentsCount,

                status: data.status,

                isVerified: data.isVerified,
            },
        });

        return {
            success: true,
            error: null,
        };
    } catch (error) {
        return {
            success: false,
            error: "Erreur lors de la mise à jour de l'école.",
        };
    }
};

// Delete School Action
export const deleteSchool = async (
    currentState: currentState,
    data: FormData
) => {
    const id = data.get("id") as string;

    try {
        await prisma.school.update({
            where: {
                id,
            },
            data: {
                isDeleted: true,
                deletedAt: new Date(),
                status: "INACTIVE",
            },
        });

        return {
            success: true,
            error: null,
        };
    } catch (error) {
        return {
            success: false,
            error:
                "Impossible de supprimer cette école. Elle possède probablement des utilisateurs ou des données associées.",
        };
    }
};

export const deleteSchoolRequest = async (
    currentState: currentState,
    data: FormData
) => {
    const id = data.get("id") as string;

    try {
        await prisma.schoolRegistrationRequest.update({
            where: {
                id,
            },
            data: {
                status: "REJECTED",
            },
        });

        return {
            success: true,
            error: null,
        };
    } catch (error) {
        return {
            success: false,
            error:
                "Impossible de supprimer cette école. Elle possède probablement des utilisateurs ou des données associées.",
        };
    }
};

export const getApplicationCountByEmail = async (
    email: string
) => {
    return prisma.teacherApplication.count({
        where: {
            email: email.toLowerCase(),
        },
    });
};

export async function submitTeacherApplication(
    formData: FormData
) {
    try {

        const schoolId = formData.get("schoolId") as string;
        const fullName = formData.get("fullName") as string;
        const email = (formData.get("email") as string).toLowerCase();
        const phone = formData.get("phone") as string;
        const coverLetter = formData.get("coverLetter") as string;

        const cvUrl = formData.get("cvUrl") as string;
        const cvFileName = formData.get("cvFileName") as string;

        const school = await prisma.school.findUnique({
            where: {
                id: schoolId,
            },
        });

        if (!school) {
            return {
                success: false,
                message: "École introuvable.",
            };
        }

        const count = await prisma.teacherApplication.count({
            where: {
                email,
            },
        });

        if (count >= MAX_APPLICATIONS) {
            return {
                success: false,
                message: "Limite de candidatures atteinte.",
            };
        }

        await prisma.teacherApplication.create({
            data: {
                schoolId,
                fullName,
                email,
                phone,
                coverLetter,
                cvUrl,
                cvFileName,
            },
        });

        return {
            success: true,
            message: "Votre candidature a été envoyée.",
        };
    } catch (error) {
        return {
            success: false,
            message: "Impossible d'envoyer votre candidature.",
        };
    }
}


export async function validateSchoolRegistrationRequest(
    requestId: string
) {
    try {
        const request = await prisma.schoolRegistrationRequest.findUnique({
            where: {
                id: requestId,
            },
        });

        if (!request) {
            return {
                success: false,
                message: "Demande introuvable.",
            };
        }

        if (request.status !== "PENDING") {
            return {
                success: false,
                message: "Cette demande a déjà été traitée.",
            };
        }

        const existingSchool = await prisma.school.findFirst({
            where: {
                OR: [
                    {
                        name: request.schoolName,
                    },
                    {
                        email: request.email,
                    },
                ],
            },
        });

        if (existingSchool) {
            return {
                success: false,
                message: "Une école existe déjà avec ce nom ou cette adresse email.",
            };
        }

        let slug = slugify(request.schoolName, {
            lower: true,
            strict: true,
            locale: "fr",
        });

        let counter = 1;

        while (
            await prisma.school.findUnique({
                where: {
                    slug,
                },
            })
        ) {
            slug = `${slugify(request.schoolName, {
                lower: true,
                strict: true,
                locale: "fr",
            })}-${counter++}`;
        }

        await prisma.$transaction(async (tx) => {
            await tx.school.create({
                data: {
                    slug,

                    name: request.schoolName,

                    city: request.city,

                    country: request.country,

                    email: request.email,

                    phone: request.phone,

                    maxStudents: request.studentsCount,

                    contactName: request.contactName,

                    contactEmail: request.email,

                    status: "ACTIVE",

                    isVerified: true,

                },
            });

            await tx.schoolRegistrationRequest.update({
                where: {
                    id: request.id,
                },
                data: {
                    status: "VALIDATED",
                    reviewedAt: new Date(),
                },
            });

            await tx.auditLog.create({
                data: {
                    id: randomUUID(),

                    action: AuditAction.CREATE_SCHOOL_REQUEST,

                    entityType: "SchoolRegistrationRequest",

                    entityId: request.id,

                    description: `Validation de la demande d'espace de ${request.schoolName}`,
                },
            });
        });

        revalidatePath("/super_admin/schools-request");
        revalidatePath("/super_admin/schools-list");

        return {
            success: true,
            message: "Demande approuvée.",
        };
    } catch (error) {
        console.error(error);

        return {
            success: false,
            message: "Impossible de valider cette demande.",
        };
    }
}

export async function rejectSchoolRegistrationRequest(
    requestId: string,
    reason?: string
) {
    try {
        const request = await prisma.schoolRegistrationRequest.findUnique({
            where: {
                id: requestId,
            },
        });

        if (!request) {
            return {
                success: false,
                message: "Demande introuvable.",
            };
        }

        if (request.status !== "PENDING") {
            return {
                success: false,
                message: "Cette demande est déjà traitée.",
            };
        }

        await prisma.$transaction(async (tx) => {
            await tx.schoolRegistrationRequest.update({
                where: {
                    id: request.id,
                },
                data: {
                    status: "REJECTED",
                    reviewNote: reason,
                    reviewedAt: new Date(),
                },
            });

            await tx.auditLog.create({
                data: {
                    id: randomUUID(),

                    action: AuditAction.UPDATE_SCHOOL_REQUEST,

                    entityType: "SchoolRegistrationRequest",

                    entityId: request.id,

                    description: `Refus de la demande d'espace de ${request.schoolName}`,
                },
            });
        });

        revalidatePath("/super_admin/schools-request");

        return {
            success: true,
            message: "Demande refusée.",
        };
    } catch (error) {
        console.error(error);

        return {
            success: false,
            message: "Impossible de refuser cette demande.",
        };
    }
}