"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { assignmentSchema } from "@/lib/formValidationSchemas";
import { createAssignment, updateAssignment } from "@/lib/actions";
import { Dispatch, SetStateAction, startTransition, useActionState, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const AssignmentForm = ({
    setOpen,
    type,
    data,
    relatedData,
}: {
    setOpen: Dispatch<SetStateAction<boolean>>;
    type: "create" | "update";
    data?: any;
    relatedData?: any;
}) => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(assignmentSchema),
    });


    const [state, formAction, isPending] = useActionState(
        type === "create" ? createAssignment : updateAssignment,
        {
            success: false,
            error: null as string | null,
        }
    );

    // Gérer les messages de succès et d'erreur après la soumission du formulaire, en affichant des notifications toast et en rafraîchissant la page après une action réussie
    const [serverError, setServerError] = useState<string | null>(null);

    const onSubmit = handleSubmit((data) => {
        startTransition(() => {
            setServerError(null)
            formAction(data);
        });
    });

    const router = useRouter();

    useEffect(() => {
        if (state.success) {
            toast.success(
                `Le devoir a été ${type === "create" ? "ajoutée avec succès" : "mise à jour avec succès"
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
            setServerError(state.error);
            toast.error(state.error, {
                style: {
                    background: "#dc2626",
                    color: "#ffffff",
                    fontWeight: "bold",
                    fontSize: "14px",
                },
            });
            router.refresh();
        }
    }, [state.success, state.error, type, router, setOpen]);

    // Récupérer la liste des cours pour le sélecteur de cours, en vérifiant que relatedData.lessons est un tableau avant de l'utiliser pour éviter les erreurs
    const lessons = Array.isArray(relatedData?.lessons)
        ? relatedData.lessons
        : [];

    return (
        <div className="max-h-[80vh] overflow-y-auto p-6">
            <form onSubmit={onSubmit} className="flex flex-col gap-8">
                {/* Header */}
                <h1 className="text-xl font-semibold">{type === "create" ? "Ajouter un devoir" : "Modifier un devoir"}</h1>
                <span className="text-sm text-gray-600 font-semibold border-b pb-1">
                    Renseignez les détails du devoir
                </span>

                {/* Form fields */}
                <div className="flex justify-between flex-wrap gap-4">
                    <InputField
                        label="Titre"
                        name="title"
                        defaultValue={data?.title}
                        register={register}
                        error={errors?.title}
                        inputClassName="text-sm py-2"
                    />
                    <InputField
                        label="Date de début"
                        name="startDate"
                        defaultValue={data?.startDate}
                        register={register}
                        error={errors?.startDate}
                        inputClassName="text-sm py-2"
                        type="date"
                    />
                    <InputField
                        label="Date de remise"
                        name="dueDate"
                        defaultValue={data?.dueDate}
                        register={register}
                        error={errors?.dueDate}
                        inputClassName="text-sm py-2"
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

                    {/* Lessons */}
                    <div className="flex flex-col gap-2 rounded-full md:w-1/4">
                        <label>
                            Cours
                        </label>

                        <select
                            {...register("lessonId")}
                            defaultValue={data?.teachers}
                            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                        >
                            {lessons.map(
                                (lesson: { id: number; name: string; }) => (
                                    <option key={lesson.id} value={lesson.id}>
                                        {lesson.name}
                                    </option>
                                )
                            )}
                        </select>

                        {errors.lessonId && (
                            <span className="text-[11px] text-red-500">
                                {errors.lessonId.message?.toString()}
                            </span>
                        )}
                    </div>
                </div>

                {/* Server error */}
                {serverError && (
                    <span className="text-[11px] text-red-500">
                        {serverError}
                    </span>
                )}

                {/* Actions */}
                <button
                    type="submit"
                    disabled={isPending}
                    className={`p-2 rounded-md text-white transition
                    ${isPending
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-blue-500 hover:bg-blue-600 cursor-pointer"}
                    `}
                >
                    {isPending
                        ? "Chargement..."
                        : type === "create"
                            ? "Enregistrer"
                            : "Valider"}
                </button>
            </form>
        </div >
    );
};

export default AssignmentForm;
