"use server";

import { Prisma, SchoolRegistrationRequest, RequestStatus } from "@prisma/client";

/**
 * Marque une demande comme provisionnée.
 */
export async function completeSchoolRequest(
    tx: Prisma.TransactionClient,
    request: SchoolRegistrationRequest,
    schoolId: string,
    clerkUserId: string,
    processedById?: string | null
) {
    return tx.schoolRegistrationRequest.update({
        where: {
            id: request.id,
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
 * Remet une demande en attente.
 * (utile plus tard si on implémente un rollback complet)
 */
export async function resetSchoolRequest(
    tx: Prisma.TransactionClient,
    requestId: string
) {
    return tx.schoolRegistrationRequest.update({
        where: {
            id: requestId,
        },
        data: {
            status: RequestStatus.PENDING,

            reviewedAt: null,

            completedAt: null,

            reviewNote: null,

            createdSchoolId: null,

            clerkUserId: null,

            adminCreated: false,

            subscriptionCreated: false,

            processedById: null,
        },
    });
}

/**
 * Rejette une demande.
 */
export async function rejectSchoolRequest(
    tx: Prisma.TransactionClient,
    requestId: string,
    reason: string,
    processedById?: string | null
) {
    return tx.schoolRegistrationRequest.update({
        where: {
            id: requestId,
        },
        data: {
            status: RequestStatus.REJECTED,

            reviewedAt: new Date(),

            reviewNote: reason,

            processedById,
        },
    });
}