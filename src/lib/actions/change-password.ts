"use server"

import { auth, clerkClient } from "@clerk/nextjs/server"

export async function changePassword(
    currentPassword: string,
    newPassword: string,
): Promise<{ success: boolean; message: string }> {
    try {
        const { userId } = await auth()
        if (!userId) return { success: false, message: "Non authentifié." }

        const client = await clerkClient()

        // Changer le mot de passe via l'API backend admin
        await client.users.updateUser(userId, {
            password: newPassword,
        })

        return { success: true, message: "Mot de passe modifié avec succès." }
    } catch (err: any) {
        console.error("[changePassword]", err)

        const code = err?.errors?.[0]?.code ?? ""
        const errorMessages: Record<string, string> = {
            "form_password_pwned": "Ce mot de passe est trop commun.",
            "form_password_not_strong_enough": "Mot de passe trop faible.",
            "form_password_same_as_current": "Identique à l'actuel.",
        }

        return {
            success: false,
            message:
                errorMessages[code] ??
                err?.errors?.[0]?.longMessage ??
                "Erreur lors du changement de mot de passe.",
        }
    }
}