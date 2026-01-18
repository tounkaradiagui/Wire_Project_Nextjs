"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { AttendanceSchemaInput, attendanceSchema } from "@/lib/formValidationSchemas";
import { createAttendance, updateAttendance } from "@/lib/actions";
import { Dispatch, SetStateAction, startTransition, useActionState, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import InputField from "../InputField";
import Image from "next/image";
import { CldUploadWidget } from "next-cloudinary";


type AttendanceFormProps = {
    setOpen: Dispatch<SetStateAction<boolean>>;
    type: "create" | "update";
    data?: any;
    relatedData?: any;
    role?: "admin" | "teacher" | "parent";
};


const AttendanceForm = ({
    setOpen,
    type,
    data,
    relatedData,
    role,
}: AttendanceFormProps) => {

    const router = useRouter();

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<AttendanceSchemaInput>({
        resolver: zodResolver(attendanceSchema),
        defaultValues: {
            status: role === "parent" ? "ABSENT" : data?.status ?? "PRESENT",
        },
    });


    const status = watch("status");

    const [image, setImage] = useState<any>(null);

    const [state, formAction, isPending] = useActionState(
        type === "create" ? createAttendance : updateAttendance,
        { success: false, error: null as string | null, }
    );

    const onSubmit = handleSubmit((data) => {
        startTransition(() => {
            setServerError(null)
            formAction({ ...data, image: image?.secure_url });
        });
    });

    const [serverError, setServerError] = useState<string | null>(null);


    useEffect(() => {
        if (state.success) {
            toast.success(
                `L'absence a été ${type === "create" ? "ajoutée avec succès" : "mise à jour avec succès"
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


    return (
        <div className="max-h-[80vh] overflow-y-auto p-6">
            <form onSubmit={onSubmit} className="flex flex-col gap-6">

                <h1 className="text-xl font-semibold">
                    {type === "create" ? "Enregistrer une absence" : "Modifier une absence"}
                </h1>

                <span className="text-sm text-gray-600 font-semibold border-b pb-1">
                    Renseignez les détails de l'absence
                </span>

                {/* ROW 1 : STUDENT + LESSON */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                        <label>Élève</label>
                        <select
                            {...register("studentId")}
                            disabled={role === "parent"}
                            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm"
                        >
                            {relatedData?.students?.map((student) => (
                                <option key={student.id} value={student.id}>
                                    {student.name} {student.surname}
                                </option>
                            ))}
                        </select>
                        {errors.studentId && (
                            <p className="text-xs text-red-500">{errors.studentId.message}</p>
                        )}
                    </div>

                    <div className="flex flex-col gap-1">
                        <label>Cours</label>
                        <select
                            {...register("lessonId", { valueAsNumber: true })}
                            disabled={role === "parent"}
                            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm"
                        >
                            {relatedData?.lessons?.map((lesson) => (
                                <option key={lesson.id} value={lesson.id}>
                                    {lesson.name}
                                </option>
                            ))}
                        </select>

                        {serverError && (
                            <span className="text-xs text-red-500">{serverError}</span>
                        )}
                    </div>
                </div>

                {/* ROW 2 : DATE + STATUS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField
                        label="Date"
                        name="date"
                        defaultValue={data?.date}
                        register={register}
                        error={errors?.date}
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
                    <div className="flex flex-col gap-1">
                        <label>Statut</label>
                        <select
                            {...register("status")}
                            disabled={role === "parent"}
                            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm"
                        >
                            <option value="PRESENT">Présent</option>
                            <option value="ABSENT">Absent</option>
                            <option value="LATE">En retard</option>
                        </select>
                    </div>
                </div>

                {/* CONDITIONAL : ABSENCE */}
                {status === "ABSENT" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        {/* COMMENT */}
                        <div className="flex flex-col gap-1 md:col-span-2">
                            <label>Commentaire / justification</label>
                            <textarea
                                {...register("comment")}
                                className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm min-h-[90px]"
                                placeholder="Ex : Maladie, rendez-vous médical..."
                            />
                            {errors.comment && (
                                <p className="text-xs text-red-500">{errors.comment.message}</p>
                            )}
                        </div>

                        {/* PROOF */}
                        <div className="flex flex-col gap-1 md:col-span-2">
                            <label>Justificatif (image ou PDF)</label>
                            <input
                                type="file"
                                accept="image/*,application/pdf"
                                className="text-sm"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    // upload handler
                                }}
                            />
                            {errors.proofUrl && (
                                <p className="text-xs text-red-500">{errors.proofUrl.message}</p>
                            )}
                        </div>
                        <div className="flex flex-col gap-2 rounded-full md:w-1/4">
                            <input type="hidden" name="image" value={image?.secure_url || ""} />
                            <CldUploadWidget
                                uploadPreset="school"
                                onSuccess={(result: any, { widget }) => {
                                    setImage(result.info);
                                    widget.close();
                                }}
                            >
                                {({ open }) => (
                                    <div
                                        onClick={() => open()}
                                        className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 transition p-2 rounded-md cursor-pointer text-sm border border-gray-300"
                                    >
                                        <Image src="/upload.png" alt="upload" width={28} height={28} />
                                        <span>Télécharger une photo</span>
                                    </div>
                                )}
                            </CldUploadWidget>
                        </div>

                    </div>
                )}

                {/* ACTION */}
                <button
                    disabled={isPending}
                    className="bg-blue-600 text-white py-2 rounded-md disabled:opacity-50"
                >
                    {isPending ? "Enregistrement..." : "Valider"}
                </button>

            </form>
        </div>

    );
};

export default AttendanceForm;
