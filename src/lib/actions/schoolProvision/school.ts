"use server";

import { randomUUID } from "crypto";

import { Prisma, Role, SchoolStatus, RequestStatus } from "@prisma/client";

import { SchoolProvisionInput } from "@/lib/validations/schoolProvisionSchema";

import { generateSchoolSlug } from "./helpers";

/**
 * Création de l'école
 */
export async function createSchool(
    tx: Prisma.TransactionClient,
    slug: string,
    data: SchoolProvisionInput
) {
    return tx.school.create({
        data: {
            slug,

            name: data.schoolName,

            city: data.city,

            country: data.country,

            email: data.email,

            phone: data.phone,

            contactName: `${data.adminFirstName} ${data.adminLastName}`,

            contactEmail: data.email,

            contactPhone: data.phone,

            maxStudents: data.studentsCount,

            status: SchoolStatus.ACTIVE,

            isVerified: true,
        },
    });
}

/**
 * Création du profil utilisateur
 */
export async function createAdminProfile(
    tx: Prisma.TransactionClient,
    schoolId: string,
    clerkUserId: string,
    data: SchoolProvisionInput
) {
    return tx.userProfile.create({
        data: {
            id: randomUUID(),

            clerkId: clerkUserId,

            schoolId,

            username: data.username,

            email: data.email,

            role: Role.ADMIN,

            firstName: data.adminFirstName,

            lastName: data.adminLastName,
        },
    });
}


export async function updateRequest(
    tx: Prisma.TransactionClient,
    requestId: string,
    schoolId: string,
    clerkUserId: string,
    processedById?: string
) {
    return tx.schoolRegistrationRequest.update({
        where: {
            id: requestId,
        },
        data: {
            status: RequestStatus.VALIDATED,

            reviewedAt: new Date(),

            completedAt: new Date(),

            reviewNote: "Demande approuvée",

            createdSchoolId: schoolId,

            clerkUserId,

            adminCreated: true,

            subscriptionCreated: true,

            processedById,
        },
    });
}

/**
 * Création de l'administrateur
 */
export async function createAdmin(
    tx: Prisma.TransactionClient,
    profileId: string,
    schoolId: string,
    data: SchoolProvisionInput
) {
    return tx.admin.create({
        data: {
            id: profileId,

            userProfileId: profileId,

            schoolId,

            username: data.username,

            name: data.adminFirstName,

            surname: data.adminLastName,

            email: data.email,

            phone: data.phone,
        },
    });
}

/**
 * Enregistrement du provisionnement
 */
export async function createSchoolProvision(
    tx: Prisma.TransactionClient,
    requestId: string,
    schoolId: string,
    subscriptionId: string,
    clerkUserId: string,
    generatedPassword: string
) {
    return tx.schoolProvision.create({
        data: {
            requestId,

            schoolId,

            subscriptionId,

            clerkUserId,

            generatedPassword,

            completedAt: new Date(),
        },
    });
}