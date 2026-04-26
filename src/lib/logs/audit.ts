import prisma from "@/lib/prisma"
import { headers } from "next/headers"
import { randomUUID } from "crypto"
import { AuditAction, Role } from "@prisma/client"

// Types propres (important pour éviter les erreurs)
type AuditLogParams = {
    action: AuditAction
    entityType: string
    entityId?: string

    performedById?: string
    role?: Role

    description?: string

    before?: any
    after?: any
    metadata?: any

    isSoftDelete?: boolean
}

// Récupération des infos request
export async function getRequestContext() {
    try {
        // Essayer de récupérer les headers de la requête pour extraire l'IP, le user-agent, etc. (fonctionne dans le contexte d'une requête HTTP)
        const h = await headers()

        return {
            ipAddress:
                h.get("x-forwarded-for") ||
                h.get("x-real-ip") ||
                "unknown",

            userAgent: h.get("user-agent") || "unknown",

            requestId: randomUUID(),
        }
    } catch {
        // headers() peut échouer hors contexte request (ex: cron, scripts)
        return {
            ipAddress: "system",
            userAgent: "system",
            requestId: randomUUID(),
        }
    }
}

// Nettoyage des données (évite JSON énorme ou undefined)
function cleanData(data: any) {
    if (!data) return undefined

    try {
        return JSON.parse(JSON.stringify(data))
    } catch {
        return undefined
    }

}

// Fonction principale
export async function logAction(params: AuditLogParams) {
    try {
        const {
            action,
            entityType,
            entityId,
            performedById,
            role,
            description,
            before,
            after,
            metadata,
            isSoftDelete,
        } = params

        // Récupérer le contexte de la requête (IP, user-agent, requestId) pour enrichir les logs et pouvoir faire du tracing en cas de besoin
        const { ipAddress, userAgent, requestId } = await getRequestContext()

        await prisma.auditLog.create({
            data: {
                action,
                entityType,
                entityId,

                performedById,
                role,

                description,

                before: cleanData(before),
                after: cleanData(after),
                metadata: cleanData(metadata),

                isSoftDelete: isSoftDelete ?? false,

                ipAddress,
                userAgent,
                requestId,
            },
        })
    } catch (error) {
        console.error("AUDIT LOG ERROR:", error)
    }
}