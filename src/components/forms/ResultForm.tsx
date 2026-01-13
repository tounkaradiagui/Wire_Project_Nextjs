"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { ResultSchemaInput, resultSchema } from "@/lib/formValidationSchemas";
import { createResult, updateResult } from "@/lib/actions";
import { Dispatch, SetStateAction, startTransition, useActionState, useEffect } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

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
    } = useForm<ResultSchemaInput>({
        resolver: zodResolver(resultSchema),
    });


    const [state, formAction, isPending] = useActionState(
        type === "create" ? createResult : updateResult,
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
                `Le résultat a été ${type === "create" ? "ajoutée avec succès" : "mise à jour avec succès"
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

    const exams = Array.isArray(relatedData?.exams)
        ? relatedData.exams
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
                        label="Note"
                        name="score"
                        defaultValue={data?.score}
                        register={register}
                        error={errors?.score}
                        inputClassName="text-sm py-2"
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

                    {/* Trimestre */}
                    <div className="flex flex-col gap-2 rounded-full md:w-1/4">
                        <label>
                            Trimestre
                        </label>

                        <select
                            {...register("examId")}
                            defaultValue={data?.teachers}
                            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                        >
                            {exams.map(
                                (exam: { id: number; title: string; }) => (
                                    <option key={exam.id} value={exam.id}>
                                        {exam.title}
                                    </option>
                                )
                            )}
                        </select>

                        {errors.examId && (
                            <span className="text-[11px] text-red-500">
                                {errors.examId.message?.toString()}
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

export default ResultForm;
