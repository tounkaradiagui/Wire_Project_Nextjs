"use server";

import prisma from "@/lib/prisma";

import { auth } from "@clerk/nextjs/server";

import {
    RequestStatus,
    Role,
} from "@prisma/client";

import {
    createClerkAdmin,
    deleteClerkUser,
} from "./clerk";

import {
    createSchool,
    createAdminProfile,
    createAdmin,
    createSchoolProvision,
    updateRequest,
} from "./school";

import { createSubscription } from "./subscription";

import { logProvisionAudit } from "./audit";

import { sendSchoolCredentials } from "./email";

import {
    generatePassword,
    generateSchoolSlug
} from "./helpers";

import { SchoolProvisionInput } from "@/lib/validations/schoolProvisionSchema";

type CurrentState = {
    success: boolean;
    error: string | null;
};

export async function provisionSchool(
    currentState: CurrentState,
    data: SchoolProvisionInput
): Promise<CurrentState> {

    let clerkUserId: string | null = null;

    console.log("========== DATA RECU ==========");
    console.log(JSON.stringify(data, null, 2));
    console.log("===============================");

    try {

        //----------------------------------------------------------
        // Vérification des droits
        //----------------------------------------------------------

        const { sessionClaims, userId } = await auth();

        const role = (
            sessionClaims?.metadata as {
                role?: string;
            }
        )?.role;

        if (role !== "super_admin") {
            return {
                success: false,
                error: "Accès refusé.",
            };
        }

        //----------------------------------------------------------
        // Demande
        //----------------------------------------------------------

        const request =
            await prisma.schoolRegistrationRequest.findUnique({
                where: {
                    id: data.requestId,
                },
            });

        if (!request) {
            return {
                success: false,
                error: "Demande introuvable.",
            };
        }

        if (request.status !== RequestStatus.PENDING) {
            return {
                success: false,
                error: "Cette demande a déjà été traitée.",
            };
        }

        //----------------------------------------------------------
        // Vérifie que cette demande n'a jamais été provisionnée
        //----------------------------------------------------------

        const existingProvision =
            await prisma.schoolProvision.findUnique({
                where: {
                    requestId: request.id,
                },
            });

        if (existingProvision) {
            return {
                success: false,
                error: "Cette école existe déjà.",
            };
        }

        //----------------------------------------------------------
        // Super Admin connecté
        //----------------------------------------------------------

        const currentUser =
            await prisma.userProfile.findUnique({
                where: {
                    clerkId: userId!,
                },
            });

        //----------------------------------------------------------
        // Mot de passe
        //----------------------------------------------------------

        const password =
            data.password || generatePassword();

        //----------------------------------------------------------
        // Création Clerk
        //----------------------------------------------------------

        const clerkUser =
            await createClerkAdmin({
                ...data,
                password,
            });

        clerkUserId = clerkUser.id;

        //----------------------------------------------------------
        // Transaction Prisma
        //----------------------------------------------------------

        console.log("DATA =", data);
        console.log("schoolName =", data.schoolName);

        const slug = await generateSchoolSlug(data.schoolName);


        const result = await prisma.$transaction(async (tx) => {

            const school = await createSchool(
                tx,
                slug,
                data
            );

            const profile = await createAdminProfile(
                tx,
                school.id,
                clerkUser.id,
                data
            );

            await createAdmin(
                tx,
                profile.id,
                school.id,
                data
            );

            const subscription = await createSubscription(
                tx,
                school.id,
                data
            );

            await updateRequest(
                tx,
                request.id,
                school.id,
                clerkUser.id,
                currentUser?.id
            );

            await createSchoolProvision(
                tx,
                request.id,
                school.id,
                subscription.id,
                clerkUser.id,
                password
            );

            return { school };
        });

        //----------------------------------------------------------
        // Audit
        //----------------------------------------------------------

        await logProvisionAudit({
            schoolId: result.school.id,
            schoolName: result.school.name,
        });

        //----------------------------------------------------------
        // Email
        //----------------------------------------------------------
        try {
            await sendSchoolCredentials({
                email: data.email,
                schoolName: result.school.name,
                username: data.username,
                password,
            });
            
        } catch (err) {
            console.error("Impossible d'envoyer le mail :", err);
        }

        //----------------------------------------------------------
        // Success
        //----------------------------------------------------------

        return {
            success: true,
            error: null,
        };

    }

    catch (error) {

        console.error(error);

        //----------------------------------------------------------
        // Rollback Clerk
        //----------------------------------------------------------

        if (clerkUserId) {

            try {

                await deleteClerkUser(clerkUserId);

            }

            catch (rollbackError) {

                console.error(
                    "Rollback Clerk échoué :",
                    rollbackError
                );

            }

        }

        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Une erreur est survenue.",
        };

    }

}