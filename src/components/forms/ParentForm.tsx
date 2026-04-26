"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { parentSchema } from "@/lib/formValidationSchemas";
import { Dispatch, SetStateAction, useActionState, useEffect, useState, startTransition } from "react";
import { createParent, updateParent } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

const ParentForm = ({
    type,
    data,
    setOpen,
    relatedData
}: {
    type: "create" | "update";
    data?: any;
    setOpen: Dispatch<SetStateAction<boolean>>;
    relatedData?: any;
}) => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(parentSchema),
        defaultValues: {
            username: data?.username ?? "",
            email: data?.email ?? "",
            name: data?.name ?? "",
            surname: data?.surname ?? "",
            phone: data?.phone ?? "",
            address: data?.address ?? "",
            birthday: data?.birthday ?? "",
            sex: data?.sex ?? "",
        },
    });

    const [state, formAction, isPending] = useActionState(
        type === "create" ? createParent : updateParent,
        {
            success: false,
            error: null as string | null,
        }
    );

    const onSubmit = handleSubmit((data) => {
        startTransition(() => {
            formAction(data);
        });
    });

    // Gérer les notifications et la fermeture du formulaire en fonction du résultat de l'action
    const router = useRouter();

    useEffect(() => {
        if (state.success) {
            toast.success(
                `Le parent a été ${type === "create" ? "ajoutée avec succès" : "mise à jour avec succès"
                }`,
                {
                    style: {
                        background: "dark",
                        color: "#ffffff",
                        fontWeight: "bold",
                        fontSize: "14px",
                    },
                }
            );
            setOpen(false);
            router.refresh();
        }

        if (state.error) {
            toast.error("Erreur serveur, veuillez réessayer", {
                style: {
                    background: "#f87171",
                    color: "#ffffff",
                    fontWeight: "bold",
                    fontSize: "14px",
                },
            });
            router.refresh();
        }
    }, [state, router, type, setOpen]);

    return (
        <div className="max-h-[80vh] overflow-y-auto p-6">
            <form className="flex flex-col gap-8" onSubmit={onSubmit}>
                <h1 className="text-xl font-semibold">{type === "create" ? "Ajouter un nouveau parent" : "Modifier un parent"}</h1>
                {/* SECTION 1 */}
                <span className="text-sm text-gray-600 font-semibold border-b pb-1">
                    Information de connexion
                </span>

                <div className="flex justify-between flex-wrap gap-4">
                    <InputField
                        label="Username"
                        name="username"
                        defaultValue={data?.username}
                        register={register}
                        error={errors?.username}
                    />
                    <InputField
                        label="Adresse email"
                        name="email"
                        type="email"
                        defaultValue={data?.email}
                        register={register}
                        error={errors?.email}
                    />
                    <InputField
                        label="Mot de passe"
                        name="password"
                        type="password"
                        defaultValue={data?.password}
                        register={register}
                        error={errors?.password}
                    />
                </div>
                <span className="text-sm text-gray-600 font-semibold border-b pb-1">
                    Information personnelle
                </span>

                <div className="flex justify-between flex-wrap gap-4">
                    <InputField
                        label="Prénom"
                        name="name"
                        defaultValue={data?.name}
                        register={register}
                        error={errors?.name}
                    />
                    <InputField
                        label="Nom"
                        name="surname"
                        defaultValue={data?.surname}
                        register={register}
                        error={errors?.surname}
                    />
                    <InputField
                        label="Téléphone"
                        name="phone"
                        defaultValue={data?.phone}
                        register={register}
                        error={errors?.phone}
                    />
                    <InputField
                        label="Adresse"
                        name="address"
                        defaultValue={data?.address}
                        register={register}
                        error={errors?.address}
                    />

                    <InputField
                        label="Date de naissance"
                        name="birthday"
                        defaultValue={data?.birthday}
                        register={register}
                        error={errors?.birthday}
                        type="date"
                    />

                    {data && (
                        <InputField
                            label="ID"
                            name="id"
                            defaultValue={data?.id}
                            register={register}
                            error={errors?.id}
                            hidden
                        />
                    )}

                    <div className="flex flex-col gap-2 rounded-full md:w-1/4">
                        <label htmlFor="">Genre</label>
                        <select
                            key={data?.id}
                            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                            {...register("sex")}
                            defaultValue={data?.sex}
                        >
                            <option value="">Selectionner</option>
                            <option value="MALE">Masculin</option>
                            <option value="FEMALE">Feminin</option>
                        </select>
                        {errors.sex && (
                            <p className="text-xs text-red-500">
                                {errors.sex.message?.toString()}
                            </p>
                        )}
                    </div>
                    {/* Server error */}
                    {state.error && (
                        <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                            ❌ Une erreur est survenue. Veuillez réessayer.
                        </div>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={isPending}
                    className="bg-blue-600 text-white py-2 rounded-md cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {isPending && (
                        <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    )}
                    <span>
                        {isPending
                            ? "Enregistrement..."
                            : type === "create"
                                ? "Enregistrer"
                                : "Valider"}
                    </span>
                </button>

            </form>
        </div>
    );
};

export default ParentForm;
