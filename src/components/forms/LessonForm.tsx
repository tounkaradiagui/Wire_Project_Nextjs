"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import {
    LessonSchemaInput,
    lessonSchema,
} from "@/lib/formValidationSchemas";
import { createLesson, updateLesson } from "@/lib/actions";
import {
    Dispatch,
    SetStateAction,
    useActionState,
    useEffect,
    startTransition,
} from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const LessonForm = ({
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
    } = useForm<LessonSchemaInput>({
        resolver: zodResolver(lessonSchema),
        defaultValues: data,
    });

    const [state, formAction, isPending] = useActionState(
        type === "create" ? createLesson : updateLesson,
        { success: false, error: false }
    );

    const router = useRouter();

    const onSubmit = handleSubmit((formData) => {
        startTransition(() => {
            formAction(formData);
        });
    });

    useEffect(() => {
        if (state.success) {
            toast.success(
                type === "create"
                    ? "Cours ajouté avec succès"
                    : "Cours mis à jour avec succès"
            );
            setOpen(false);
            router.refresh();
        }

        if (state.error) {
            toast.error("Erreur serveur, veuillez réessayer");
        }
    }, [state, type, setOpen, router]);

    return (
        <div className="max-h-[80vh] overflow-y-auto p-6">
            <form onSubmit={onSubmit} className="flex flex-col gap-8">
                {/* Header */}
                <h1 className="text-xl font-semibold">
                    {type === "create" ? "Ajouter un cours" : "Modifier un cours"}
                </h1>

                <span className="text-sm text-gray-600 font-semibold border-b pb-1">
                    Informations du cours
                </span>

                <div className="flex justify-between flex-wrap gap-4">
                    {/* Titre */}
                    <InputField
                        label="Titre du cours"
                        name="name"
                        register={register}
                        error={errors.name}
                        inputClassName="text-sm py-2"
                        defaultValue={data?.name}
                    />


                    {/* Date de début */}
                    <InputField
                        label="Date de début"
                        name="startTime"
                        type="datetime-local"
                        register={register}
                        error={errors.startTime}
                        inputClassName="text-sm mb-2"
                        defaultValue={data?.startTime}
                    />

                    {/* Date de fin */}
                    <InputField
                        label="Date de fin"
                        name="endTime"
                        type="datetime-local"
                        register={register}
                        error={errors.endTime}
                        defaultValue={data?.endTime}
                        inputClassName="text-sm py-2"
                    />

                    {data && (
                        <InputField
                            name="id"
                            label="ID"
                            defaultValue={data.id}
                            register={register}
                            hidden
                        />
                    )}

                    {/* Jour */}
                    <div className="flex flex-col gap-2 rounded-full md:w-1/4">
                        <label>Jour</label>
                        <select
                            {...register("day")}
                            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                        >
                            <option value="">Sélectionner un jour</option>
                            {relatedData?.days?.map((day: any) => (
                                <option key={day.value} value={day.value}>
                                    {day.label}
                                </option>
                            ))}
                        </select>
                        {errors.day && (
                            <p className="text-xs text-red-500">{errors.day.message}</p>
                        )}
                    </div>

                    {/* Classe */}
                    <div className="flex flex-col gap-2 rounded-full md:w-1/4">
                        <label>Classe</label>
                        <select
                            {...register("classId")}
                            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                        >
                            <option value="">Sélectionner une classe</option>
                            {relatedData?.classes?.map((c: any) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                        {errors.classId && (
                            <p className="text-xs text-red-500">{errors.classId.message}</p>
                        )}
                    </div>

                    {/* Matière */}
                    <div className="flex flex-col gap-2 rounded-full md:w-1/4">
                        <label >Matière</label>
                        <select
                            {...register("subjectId")}
                            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                        >
                            <option value="">Sélectionner une matière</option>
                            {relatedData?.subjects?.map((s: any) => (
                                <option key={s.id} value={s.id}>
                                    {s.name}
                                </option>
                            ))}
                        </select>
                        {errors.subjectId && (
                            <p className="text-xs text-red-500">{errors.subjectId.message}</p>
                        )}
                    </div>

                    {/* Enseignant */}
                    <div className="flex flex-col gap-2 rounded-full md:w-1/4">
                        <label >Enseignant</label>
                        <select
                            {...register("teacherId")}
                            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                        >
                            <option value="">Sélectionner un enseignant</option>
                            {relatedData?.teachers?.map((t: any) => (
                                <option key={t.id} value={t.id}>
                                    {t.name} {t.surname}
                                </option>
                            ))}
                        </select>
                        {errors.teacherId && (
                            <p className="text-xs text-red-500">
                                {errors.teacherId.message}
                            </p>
                        )}
                    </div>
                </div>

                <button
                    disabled={isPending}
                    className="bg-blue-500 text-white p-2 rounded-md disabled:opacity-50 cursor-pointer"
                >
                    {type === "create" ? "Enregistrer" : "Mettre à jour"}
                </button>
            </form>
        </div>
    );
};

export default LessonForm;