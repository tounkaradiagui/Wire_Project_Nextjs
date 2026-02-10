"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { resultSchema } from "@/lib/formValidationSchemas";
import { createResult, updateResult } from "@/lib/actions";
import { Dispatch, SetStateAction, startTransition, useActionState, useEffect } from "react";
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
    });

    const [state, formAction, isPending] = useActionState(
        type === "create" ? createResult : updateResult,
        { success: false, error: null as string | null }
    );

    const router = useRouter();

    const onSubmit = handleSubmit((data) => {
        startTransition(() => {
            formAction(data);
        });
    });

    useEffect(() => {
        if (state.success) {
            toast.success("Note enregistrée avec succès");
            setOpen(false);
            router.refresh();
        }

        if (state.error) {
            toast.error(
                typeof state.error === "string"
                    ? state.error
                    : "Erreur serveur"
            );
        }
    }, [state]);

    const exams = relatedData?.exams ?? [];
    const assignments = relatedData?.assignments ?? [];
    const students = relatedData?.students ?? [];

    return (
        <form onSubmit={onSubmit} className="flex flex-col gap-6 p-6">
            <h1 className="text-xl font-semibold">
                {type === "create" ? "Ajouter une note" : "Modifier une note"}
            </h1>

            <InputField
                label="Note"
                name="score"
                type="number"
                register={register}
                error={errors.score}
                defaultValue={data?.score}
            />

            {/* Student */}
            <div>
                <label>Élève</label>
                <select {...register("studentId")} className="input">
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

            {/* Exam */}
            <div>
                <label>Examen (optionnel)</label>
                <select {...register("examId")} className="input">
                    <option value="">---</option>
                    {exams.map((e: any) => (
                        <option key={e.id} value={e.id}>
                            {e.title}
                        </option>
                    ))}
                </select>
            </div>

            {/* Assignment */}
            <div>
                <label>Devoir (optionnel)</label>
                <select {...register("assignmentId")} className="input">
                    <option value="">---</option>
                    {assignments.map((a: any) => (
                        <option key={a.id} value={a.id}>
                            {a.title}
                        </option>
                    ))}
                </select>
            </div>

            {/* Global error */}
            {errors.examId && (
                <span className="text-red-500 text-xs">
                    {errors.examId.message}
                </span>
            )}

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
    );
};

export default ResultForm;
