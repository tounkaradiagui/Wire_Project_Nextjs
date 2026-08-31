"use server";

import { AuditAction } from "@prisma/client";

import { logAction } from "@/lib/logs/audit";

type LogProvisionAuditParams = {
    schoolId: string;
    schoolName: string;
};

export async function logProvisionAudit({
    schoolId,
    schoolName,
}: LogProvisionAuditParams) {
    await logAction({
        action: AuditAction.CREATE_SCHOOL,

        entityType: "School",

        entityId: schoolId,

        description: `Création de l'espace école "${schoolName}"`,
    });
}