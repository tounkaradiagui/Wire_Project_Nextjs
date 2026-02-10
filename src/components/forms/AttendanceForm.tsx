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
    } = useForm({
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
        console.log(data)
        startTransition(() => {
            setServerError(null)
            formAction({ ...data, proofUrl: image?.secure_url });
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
                            defaultValue={data?.studentId}
                            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm"
                        >
                            {relatedData?.students?.map(
                                (student: { id: string; name: string; surname: string }) => (
                                    <option key={student.id} value={student.id}>
                                        {student.name} {student.surname}
                                    </option>
                                )
                            )}
                            {/* {relatedData?.students?.map((student) => (
                                <option key={student.id} value={student.id}>
                                    {student.name} {student.surname}
                                </option>
                            ))} */}
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
                            defaultValue={data?.lessonId}
                            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm"
                        >
                            {relatedData?.lessons?.map(
                                (lesson: { id: number; name: string }) => (
                                    <option key={lesson.id} value={lesson.id}>
                                        {lesson.name}
                                    </option>
                                )
                            )}
                            {/* {relatedData?.lessons?.map((lesson) => (
                                <option key={lesson.id} value={lesson.id}>
                                    {lesson.name}
                                </option>
                            ))} */}
                        </select>
                        {errors.lessonId && (
                            <p className="text-xs text-red-500">{errors.lessonId.message}</p>
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
                            defaultValue={data?.status}
                            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm"
                        >
                            <option value="PRESENT">Présent</option>
                            <option value="ABSENT">Absent</option>
                            <option value="LATE">En retard</option>
                        </select>
                        {errors.status && (
                            <p className="text-xs text-red-500">{errors.status.message}</p>
                        )}

                    </div>
                </div>
                {serverError && (
                    <span className="text-xs text-red-500">{serverError}</span>
                )}

                {/* CONDITIONAL : ABSENCE */}
                {status === "ABSENT" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        {/* COMMENT */}
                        <div className="flex flex-col gap-1 md:col-span-2">
                            <label>Commentaire / justification</label>
                            <textarea
                                {...register("comment")}
                                className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm min-h-22.5"
                                placeholder="Ex : Maladie, rendez-vous médical..."
                            />
                            {errors.comment && (
                                <p className="text-xs text-red-500">{errors.comment.message}</p>
                            )}
                        </div>

                        {/* PROOF */}
                        <div className="flex flex-col gap-2">
                            <input
                                type="hidden"
                                name="proofUrl"
                                value={image?.secure_url || ""}
                            />

                            <CldUploadWidget
                                uploadPreset="school"
                                options={{
                                    resourceType: "auto",
                                    multiple: false,
                                    folder: "attendance",
                                    //access_mode: "public", / / ✅ OBLIGATOIRE POUR PDF
                                    maxFiles: 1,
                                    maxFileSize: 5_000_000,
                                    clientAllowedFormats: ["jpg", "jpeg", "png", "pdf"],
                                }}
                                onSuccess={(result: any, { widget }) => {
                                    const file = result.info;

                                    setImage({
                                        secure_url: file.secure_url,
                                        public_id: file.public_id,
                                        resource_type: file.resource_type,
                                    });

                                    widget.close();
                                }}
                            >
                                {({ open }) => (
                                    <button
                                        type="button"
                                        onClick={() => open()}
                                        className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 p-2 rounded-full text-sm"
                                    >
                                        <Image src="/upload.png" alt="upload" width={20} height={20} />
                                        <span>Télécharger une preuve</span>
                                    </button>
                                )}
                            </CldUploadWidget>
                        </div>


                    </div>
                )
                }

                {/* ACTION */}
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
            </form >
        </div >

    );
};

export default AttendanceForm;
