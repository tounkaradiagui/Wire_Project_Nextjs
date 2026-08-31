"use server";

import { Prisma, SubscriptionStatus } from "@prisma/client";

import { SchoolProvisionInput } from "@/lib/validations/schoolProvisionSchema";

import { buildSubscriptionEndDate } from "./helpers";

/**
 * Création de l'abonnement de l'école.
 */
export async function createSubscription(
    tx: Prisma.TransactionClient,
    schoolId: string,
    data: SchoolProvisionInput
) {
    const startsAt = new Date();

    const endsAt = buildSubscriptionEndDate(
        data.trialDays,
        data.subscriptionEndsAt
    );

    return tx.subscription.create({
        data: {
            schoolId,

            plan: data.plan,

            status:
                data.trialDays > 0
                    ? SubscriptionStatus.TRIAL
                    : SubscriptionStatus.ACTIVE,

            startsAt,

            endsAt,

            trialEndsAt:
                data.trialDays > 0
                    ? endsAt
                    : null,

            autoRenew: false,

            currency: "USD",
        },
    });
}