"use client";

import {
    Dispatch,
    SetStateAction,
    startTransition,
    useActionState,
    useEffect,
} from "react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

import InputField from "../InputField";

import {
    schoolProvisionSchema,
    SchoolProvisionInput,
} from "@/lib/validations/schoolProvisionSchema";

import {
    SubscriptionPlan,
} from "@prisma/client";

import { provisionSchool } from "@/lib/actions/schoolProvision/provisionSchool";

function generatePassword(length = 12) {
    const chars =
        "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789@#$";

    let password = "";

    for (let i = 0; i < length; i++) {
        password += chars.charAt(
            Math.floor(Math.random() * chars.length)
        );
    }

    return password;
}

export default function SchoolProvisionForm({
    data,
    setOpen,
}: {
    data: any;
    setOpen: Dispatch<SetStateAction<boolean>>;
}) {

    const router = useRouter();

    const names = data.contactName?.split(" ") ?? [];

    const firstName = names[0] ?? "";

    const lastName = names.slice(1).join(" ");

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(
            schoolProvisionSchema
        ),

        defaultValues: {

            requestId: data.id,

            //---------------- SCHOOL ----------------

            schoolName: data.schoolName,

            city: data.city,

            country: data.country,

            studentsCount:
                data.studentsCount ?? 500,

            //---------------- ADMIN ----------------

            adminFirstName: firstName,

            adminLastName: lastName,

            username: "",

            email: data.email,

            phone: data.phone ?? "",

            password: generatePassword(),

            //---------------- SUBSCRIPTION ----------------

            plan: SubscriptionPlan.STANDARD,

            trialDays: 30,
        },
    });

    const [state, formAction, isPending] =
        useActionState(provisionSchool, {
            success: false,
            error: null,
        });

    const onSubmit = handleSubmit((values) => {

        startTransition(() => {

            formAction(values);

        });

    });

    useEffect(() => {

        if (state.success) {

            toast.success(
                "L'espace école a été créé avec succès.",
                {
                    style: {
                        background: "#18181b",
                        color: "#fff",
                    },
                }
            );

            setOpen(false);

            router.refresh();

        }

        if (state.error) {

            toast.error(state.error);

        }

    }, [state, router, setOpen]);

    return (

        <div className="max-h-[80vh] overflow-y-auto p-6">

            <form
                onSubmit={onSubmit}
                className="flex flex-col gap-8"
            >

                <h1 className="text-xl font-semibold">
                    Provisionnement de l'espace école
                </h1>

                {/* ================= ECOLE ================= */}

                <div>

                    <h2 className="mb-4 border-b pb-2 text-sm font-semibold text-gray-600">
                        Informations de l'établissement
                    </h2>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                        <InputField
                            label="Nom de l'école"
                            name="schoolName"
                            register={register}
                            error={errors.schoolName}
                        />

                        <InputField
                            label="Ville"
                            name="city"
                            register={register}
                            error={errors.city}
                        />

                        <InputField
                            label="Pays"
                            name="country"
                            register={register}
                            error={errors.country}
                        />

                        <InputField
                            label="Nombre maximal d'élèves"
                            name="studentsCount"
                            type="number"
                            register={register}
                            error={errors.studentsCount}
                        />

                    </div>

                </div>

                {/* ================= ADMIN ================= */}

                <div>

                    <h2 className="mb-4 border-b pb-2 text-sm font-semibold text-gray-600">
                        Administrateur
                    </h2>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                        <InputField
                            label="Prénom"
                            name="adminFirstName"
                            register={register}
                            error={errors.adminFirstName}
                        />

                        <InputField
                            label="Nom"
                            name="adminLastName"
                            register={register}
                            error={errors.adminLastName}
                        />

                        <InputField
                            label="Nom d'utilisateur"
                            name="username"
                            register={register}
                            error={errors.username}
                        />

                        <InputField
                            label="Adresse email"
                            name="email"
                            type="email"
                            register={register}
                            error={errors.email}
                        />

                        <InputField
                            label="Téléphone"
                            name="phone"
                            register={register}
                            error={errors.phone}
                        />

                        <InputField
                            label="Mot de passe temporaire"
                            name="password"
                            register={register}
                            error={errors.password}
                        />

                    </div>

                </div>

                {/* ================= ABONNEMENT ================= */}

                <div>

                    <h2 className="mb-4 border-b pb-2 text-sm font-semibold text-gray-600">
                        Abonnement
                    </h2>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                        <div className="flex flex-col gap-2">

                            <label className="text-sm">
                                Plan
                            </label>

                            <select
                                className="rounded-md border border-gray-300 p-2 text-sm"
                                {...register("plan")}
                            >

                                <option value={SubscriptionPlan.FREE}>
                                    Starter
                                </option>

                                <option value={SubscriptionPlan.STANDARD}>
                                    Standard
                                </option>

                                <option value={SubscriptionPlan.PREMIUM}>
                                    Premium
                                </option>

                            </select>

                            {errors.plan && (
                                <p className="text-xs text-red-500">
                                    {errors.plan.message}
                                </p>
                            )}

                        </div>

                        <InputField
                            label="Période d'essai (jours)"
                            name="trialDays"
                            type="number"
                            register={register}
                            error={errors.trialDays}
                        />

                    </div>

                </div>

                <input
                    type="hidden"
                    {...register("requestId")}
                />

                {state.error && (

                    <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">

                        {state.error}

                    </div>

                )}

                <button
                    type="submit"
                    disabled={isPending}
                    className="flex items-center justify-center gap-2 rounded-md bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
                >

                    {isPending && (

                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />

                    )}

                    {isPending
                        ? "Création en cours..."
                        : "Créer l'espace école"}

                </button>

            </form>

        </div>

    );

}