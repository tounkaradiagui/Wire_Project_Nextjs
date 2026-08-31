import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import slugify from "slugify";

/**
 * Génère un mot de passe sécurisé
 */
export function generatePassword(length = 12): string {
    const chars =
        "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789@#$%";

    let password = "";

    for (let i = 0; i < length; i++) {
        password += chars.charAt(
            Math.floor(Math.random() * chars.length)
        );
    }

    return password;
}

/**
 * Génère un username à partir du prénom + nom.
 *
 * Exemple :
 * Moussa
 * =>
 * moussa
 *
 * Si déjà utilisé :
 * moussa1
 * moussa2
 */
export async function generateUsername(
    tx: Prisma.TransactionClient,
    firstName: string,
): Promise<string> {
    const base = slugify(`${firstName}`, {
        lower: true,
        strict: true,
        locale: "fr",
    });

    let username = base;
    let counter = 1;

    while (
        await tx.userProfile.findUnique({
            where: {
                username,
            },
        })
    ) {
        username = `${base}${counter++}`;
    }

    return username;
}

/**
 * Génère un slug unique pour l'école.
 */
export async function generateSchoolSlug(
    schoolName: string
): Promise<string> {

    console.log("typeof =", typeof schoolName);
    console.log("value =", schoolName);

    const base = slugify(String(schoolName), {
        lower: true,
        strict: true,
        locale: "fr",
    });

    console.log("base =", base);

    return base;
}



/**
 * Calcule la date de fin d'abonnement.
 */
export function buildSubscriptionEndDate(
    trialDays: number,
    customEndDate?: Date
): Date {
    if (customEndDate) {
        return customEndDate;
    }

    const now = new Date();

    return new Date(
        now.getTime() + trialDays * 24 * 60 * 60 * 1000
    );
}

/**
 * Nettoie un numéro de téléphone.
 */
export function normalizePhone(
    phone?: string | null
): string | null {
    if (!phone) return null;

    return phone.replace(/\s+/g, "").trim();
}

/**
 * Concatène prénom + nom.
 */
export function buildFullName(
    firstName: string,
    lastName: string
): string {
    return `${firstName.trim()} ${lastName.trim()}`;
}

/**
 * Génère le nom affiché de l'admin.
 */
export function buildAdminDisplayName(
    firstName: string,
    lastName: string
): {
    name: string;
    surname: string;
} {
    return {
        name: firstName.trim(),
        surname: lastName.trim(),
    };
}