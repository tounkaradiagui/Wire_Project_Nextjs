"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import {
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
    } = useForm({
        resolver: zodResolver(lessonSchema),
        defaultValues: {
            name: data?.name ?? "",
            startDate: data?.startDate ?? "",
            dueDate: data?.dueDate ?? "",
            weekDay: data?.weekDay ?? "",
            startHour: data?.startHour ?? "",
            endHour: data?.endHour ?? "",
            }
    });

    const [state, formAction, isPending] = useActionState(
        type === "create" ? createLesson : updateLesson,
        { success: false, error: null as string | null, }
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
            toast.error(state.error || "Erreur serveur");
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
                        name="startDate"
                        type="date"
                        register={register}
                        error={errors.startDate}
                        inputClassName="text-sm mb-2"
                        defaultValue={data?.startDate}
                    />

                    {/* Date de fin */}
                    <InputField
                        label="Date de fin"
                        name="dueDate"
                        type="date"
                        register={register}
                        error={errors.dueDate}
                        defaultValue={data?.dueDate}
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

                    {/* Classe */}
                    <div className="flex flex-col gap-2 rounded-full md:w-1/4">
                        <label>Classe</label>
                        <select
                            {...register("classId", { valueAsNumber: true })}
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
                            <span className="text-[11px] text-red-500">
                                {errors.classId.message?.toString()}
                            </span>
                        )}
                    </div>

                    {/* Matière */}
                    <div className="flex flex-col gap-2 rounded-full md:w-1/4">
                        <label >Matière</label>
                        <select
                            {...register("subjectId", { valueAsNumber: true })}
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
                            <span className="text-[11px] text-red-500">
                                {errors.subjectId.message?.toString()}
                            </span>
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
                            <span className="text-[11px] text-red-500">
                                {errors.teacherId.message?.toString()}
                            </span>
                        )}
                    </div>

                    {/* Jour */}
                    <div className="flex flex-col gap-2 md:w-1/4">
                        <label>Jour</label>
                        <select
                            {...register("weekDay", { valueAsNumber: true })}
                            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                        >
                            <option value="">Sélectionner un jour</option>
                            {relatedData?.weekDays?.map((d: any) => (
                            <option key={d.value} value={d.value}>
                                {d.label}
                            </option>
                            ))}
                        </select>

                        {errors.weekDay && (
                            <span className="text-[11px] text-red-500">
                            {errors.weekDay.message?.toString()}
                            </span>
                        )}
                    </div>

                   <div className="flex flex-col gap-2 md:w-1/4">
                        <label>Heure de début</label>
                        <select
                            {...register("startHour", { valueAsNumber: true })}
                            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm"
                        >
                            <option value="">Heure</option>
                            {Array.from({ length: 24 }).map((_, i) => (
                            <option key={i} value={i}>
                                {i.toString().padStart(2, "0")}:00
                            </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-col gap-2 md:w-1/4">
                        <label>Heure de fin</label>
                        <select
                            {...register("endHour", { valueAsNumber: true })}
                            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm"
                        >
                            <option value="">Heure</option>
                            {Array.from({ length: 24 }).map((_, i) => (
                            <option key={i} value={i}>
                                {i.toString().padStart(2, "0")}:00
                            </option>
                            ))}
                        </select>
                    </div>

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

export default LessonForm;