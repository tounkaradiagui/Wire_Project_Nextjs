import prisma from "@/lib/prisma";

import { auth } from "@clerk/nextjs/server";

import {
    RequestStatus,
    SchoolRegistrationRequest,
} from "@prisma/client";

import { SchoolProvisionInput } from "@/lib/validations/schoolProvisionSchema";

/**
 * Vérifie que l'utilisateur connecté est Super Admin
 */
export async function ensureSuperAdmin() {
    const { sessionClaims, userId } = await auth();

    const role = (sessionClaims?.metadata as {
        role?: string;
    })?.role;

    if (role !== "super_admin") {
        throw new Error("Accès refusé.");
    }

    return userId!;
}

/**
 * Vérifie que la demande existe
 */
export async function ensureRequestExists(
    requestId: string
): Promise<SchoolRegistrationRequest> {
    const request =
        await prisma.schoolRegistrationRequest.findUnique({
            where: {
                id: requestId,
            },
        });

    if (!request) {
        throw new Error("Demande introuvable.");
    }

    return request;
}

/**
 * Vérifie que la demande est toujours en attente
 */
export function ensureRequestPending(
    request: SchoolRegistrationRequest
) {
    if (request.status !== RequestStatus.PENDING) {
        throw new Error(
            "Cette demande a déjà été traitée."
        );
    }
}

/**
 * Vérifie qu'elle n'a jamais été provisionnée
 */
export async function ensureNotProvisioned(
    requestId: string
) {
    const provision =
        await prisma.schoolProvision.findUnique({
            where: {
                requestId,
            },
        });

    if (provision) {
        throw new Error(
            "Cette demande a déjà été provisionnée."
        );
    }
}

/**
 * Vérifie l'unicité du username
 */
export async function ensureUsernameAvailable(
    username: string
) {
    const profile =
        await prisma.userProfile.findUnique({
            where: {
                username,
            },
        });

    if (profile) {
        throw new Error(
            "Ce nom d'utilisateur existe déjà."
        );
    }
}

/**
 * Vérifie l'unicité de l'email
 */
export async function ensureEmailAvailable(
    email: string
) {
    const profile =
        await prisma.userProfile.findUnique({
            where: {
                email,
            },
        });

    if (profile) {
        throw new Error(
            "Cette adresse email est déjà utilisée."
        );
    }
}

/**
 * Lance toutes les validations métier
 */
export async function validateProvision(
    data: SchoolProvisionInput
) {
    const userId =
        await ensureSuperAdmin();

    const request =
        await ensureRequestExists(
            data.requestId
        );

    ensureRequestPending(request);

    await ensureNotProvisioned(
        request.id
    );

    await ensureUsernameAvailable(
        data.username
    );

    await ensureEmailAvailable(
        data.email
    );

    return {
        currentUserId: userId,
        request,
    };
}