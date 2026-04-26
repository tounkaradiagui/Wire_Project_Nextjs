"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { resultSchema } from "@/lib/formValidationSchemas";
import { createResult, updateResult } from "@/lib/actions";
import { Dispatch, SetStateAction, startTransition, useActionState, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import InputField from "../InputField";

const ResultForm = ({
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
        resolver: zodResolver(resultSchema),
        defaultValues: {
            score: data?.score ?? 0,
            studentId: data?.studentId ?? "",
            termId: data?.termId ?? undefined,
            examId: data?.examId ?? undefined,
            assignmentId: data?.assignmentId ?? undefined,
            appreciation: data?.appreciation ?? "",
        },
    });

    const [state, formAction, isPending] = useActionState(
        type === "create" ? createResult : updateResult,
        { success: false, error: null as string | null }
    );

    const router = useRouter();
    const [serverError, setServerError] = useState<string | null>(null);

    const onSubmit = handleSubmit(
        (data) => {
            console.log("✅ VALID DATA", data);
            startTransition(() => {
                setServerError(null);
                formAction(data);
            });
        },
        (errors) => {
            console.log("❌ FORM ERRORS", errors);
        }
    );

    useEffect(() => {
        if (state.success) {
            toast.success(`La note a été ${type === "create" ? "ajoutée avec succès" : "mise à jour avec succès"
                }`);
            setOpen(false);
            router.refresh();
        }

        if (state.error) {
            setServerError(state.error);
            toast.error(
                typeof state.error === "string"
                    ? state.error
                    : "Erreur serveur"
            );
        }
    }, [state.success, state.error, type, router, setOpen]);

    // Récupérer les données liées (examens, devoirs, élèves, trimestres) tout en assurant que ce sont des tableaux
    const exams = relatedData?.exams ?? [];
    const assignments = relatedData?.assignments ?? [];
    const students = relatedData?.students ?? [];
    const terms = relatedData?.terms ?? [];

    return (
        <form onSubmit={onSubmit} className="flex flex-col gap-6 p-6">
            <h1 className="text-xl font-semibold">
                {type === "create" ? "Ajouter une note" : "Modifier une note"}
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                    <InputField
                        label="Note"
                        name="score"
                        type="number"
                        register={register}
                        error={errors.score}
                        defaultValue={data?.score}
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
                </div>

                {/* Student */}
                <div className="flex flex-col gap-1">
                    <label>Élève</label>
                    <select {...register("studentId")} className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full">
                        <option value="">Sélectionner</option>
                        {students.map((s: any) => (
                            <option key={s.id} value={s.id}>
                                {s.name} {s.surname}
                            </option>
                        ))}
                    </select>
                    {errors.studentId && (
                        <span className="text-red-500 text-xs">
                            {errors.studentId.message}
                        </span>
                    )}
                </div>
            </div>

            {/* Term */}
            <div>
                <label>Trimestre</label>
                <select
                    {...register("termId")}
                    className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                    defaultValue={data?.termId}
                >
                    <option value="">Sélectionner</option>
                    {terms.map((t: any) => (
                        <option key={t.id} value={t.id}>
                            {t.name}
                        </option>
                    ))}
                </select>
                {errors.termId && (
                    <span className="text-red-500 text-xs">
                        {errors.termId.message}
                    </span>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Exam */}
                <div className="flex flex-col gap-1">
                    <label>Examen (optionnel)</label>
                    <select {...register("examId")}
                        className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full">
                        <option value="">Choisir</option>
                        {exams.map((e: any) => (
                            <option key={e.id} value={e.id}>
                                {e.title}
                            </option>
                        ))}
                    </select>
                    {
                        errors.examId && (
                            <span className="text-red-500 text-xs">
                                {errors.examId.message}
                            </span>
                        )
                    }


                    {/* Assignment */}
                    <div className="flex flex-col gap-1">
                        <label>Dévoir (optionnel)</label>
                        <select {...register("assignmentId")} className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full">
                            <option value="">Choisir</option>
                            {assignments.map((a: any) => (
                                <option key={a.id} value={a.id}>
                                    {a.title}
                                </option>
                            ))}
                        </select>
                    </div>
                    {
                        errors.assignmentId && (
                            <span className="text-red-500 text-xs">
                                {errors.assignmentId.message}
                            </span>
                        )
                    }
                </div>

                {/* Global error */}
                {serverError && (
                    <span className="text-xs text-red-500">{serverError}</span>
                )}

                <div>
                    <label>Appréciation (optionnel)</label>
                    <textarea
                        {...register("appreciation")}
                        className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                        defaultValue={data?.appreciation}
                    />
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
            </div>
        </form >
    );
};

export default ResultForm;
