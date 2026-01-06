"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { ExamSchemaInput, examSchema } from "@/lib/formValidationSchemas";
import { createExam, updateExam } from "@/lib/actions";
import { Dispatch, SetStateAction, startTransition, useActionState, useEffect } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { BookOpen, Users, Save, X, Loader2 } from "lucide-react";

const ExamForm = ({
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
    } = useForm<ExamSchemaInput>({
        resolver: zodResolver(examSchema),
    });


  const [state, formAction, isPending] = useActionState(
    type === "create" ? createExam : updateExam,
    {
      success: false,
      error: false,
    }
  );

  const onSubmit = handleSubmit((data) => {
      startTransition(() => {
        formAction(data);
    });
  });

  const router = useRouter();

    useEffect(() => {
        if (state.success) {
        toast.success(
            `L'examen a été ${
            type === "create" ? "ajoutée avec succès" : "mise à jour avec succès"
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
    }, [state.success, state.error]);

    const lessons = Array.isArray(relatedData?.lessons)
        ? relatedData.lessons
        : [];

  return (
    <div className="max-h-[80vh] overflow-y-auto p-6">
        <form onSubmit={onSubmit} className="flex flex-col gap-8">
            {/* Header */}
            <h1 className="text-xl font-semibold">{type === "create" ? "Ajouter un nouvel examen" : "Modifier un examen"}</h1>
            <span className="text-sm text-gray-600 font-semibold border-b pb-1">
                Renseignez les détails de l'exam
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
                    name="startTime"
                    defaultValue={data?.startTime}
                    register={register}
                    error={errors?.startTime}
                    inputClassName="text-sm py-2"
                    type="datetime-local"
                />
                <InputField
                    label="Date de fin"
                    name="endTime"
                    defaultValue={data?.endTime}
                    register={register}
                    error={errors?.endTime}
                    inputClassName="text-sm py-2"
                    type="datetime-local"
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
                <div className="md:col-span-2 flex flex-col gap-1">
                    <label className="flex items-center gap-1 text-xs font-medium text-gray-600">
                        <Users className="w-3.5 h-3.5" />
                        Lessons
                    </label>

                    <select
                        {...register("lessonId")}
                        defaultValue={data?.teachers}
                        className="min-h-[96px] rounded-md border border-gray-300 text-xs p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
            {state.error && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                ❌ Une erreur est survenue. Veuillez réessayer.
                </div>
            )}

            {/* Actions */}
            <button className="bg-blue-500 text-white p-2 rounded-md cursor-pointer">
                {type === "create" ? "Enregistrer" : "Valider"}
            </button>
        </form>
    </div>
  );
};

export default ExamForm;
