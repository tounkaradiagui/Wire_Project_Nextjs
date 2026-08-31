"use server";

import { createClerkClient } from "@clerk/nextjs/server";
import { SchoolProvisionInput } from "@/lib/validations/schoolProvisionSchema";

const clerk = createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY,
});

/**
 * Vérifie qu'aucun utilisateur Clerk ne possède déjà cet email.
 */
export async function ensureClerkEmailAvailable(
    email: string
) {
    const users = await clerk.users.getUserList({
        emailAddress: [email],
    });

    if (users.data.length > 0) {
        throw new Error(
            "Cette adresse email existe déjà dans Clerk."
        );
    }
}

/**
 * Vérifie qu'aucun utilisateur Clerk ne possède déjà ce username.
 */
export async function ensureClerkUsernameAvailable(
    username: string
) {
    const users = await clerk.users.getUserList({
        username: [username],
    });

    if (users.data.length > 0) {
        throw new Error(
            "Ce nom d'utilisateur existe déjà dans Clerk."
        );
    }
}

/**
 * Vérifie les identifiants avant toute création.
 */
export async function validateClerkIdentifiers(
    email: string,
    username: string
) {
    await ensureClerkEmailAvailable(email);

    await ensureClerkUsernameAvailable(username);
}

/**
 * Création de l'administrateur dans Clerk.
 */
export async function createClerkAdmin(
    data: SchoolProvisionInput
) {
    return clerk.users.createUser({
        username: data.username,

        password: data.password,

        emailAddress: [data.email],

        firstName: data.adminFirstName,

        lastName: data.adminLastName,

        skipPasswordChecks: false,

        skipPasswordRequirement: false,

        publicMetadata: {
            role: "admin",
        },
    });
}

/**
 * Suppression d'un utilisateur Clerk.
 * Utilisée lors du rollback.
 */
export async function deleteClerkUser(
    clerkUserId: string
) {
    try {
        await clerk.users.deleteUser(clerkUserId);
    } catch (error) {
        console.error(
            "Rollback Clerk impossible :",
            error
        );
    }
}

/**
 * Mise à jour des métadonnées.
 * Peut servir plus tard pour ajouter schoolId, plan, etc.
 */
export async function updateClerkMetadata(
    clerkUserId: string,
    metadata: Record<string, unknown>
) {
    return clerk.users.updateUser(clerkUserId, {
        publicMetadata: metadata,
    });
}