"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { studentSchema } from "@/lib/formValidationSchemas";
import {
    Dispatch, SetStateAction, useActionState,
    useEffect, useState, startTransition
} from "react";
import { createStudent, updateStudent } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Image from "next/image";
import { CldUploadWidget } from "next-cloudinary";
import ParentSelect from "@/components/ParentSelect";


// Définir le type pour les grades, utilisé pour grouper les options dans le select des niveaux
type Grade = {
    id: number;
    name?: string;
    level: number;
    cycle: "FIRST" | "SECOND";
};

const StudentForm = ({
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
        setValue,
        watch,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(studentSchema),
        // Pré-remplir les champs du formulaire en cas de mise à jour, sinon laisser vides pour la création
        defaultValues: {
            username: data?.username ?? "",
            email: data?.email ?? "",
            name: data?.name ?? "",
            surname: data?.surname ?? "",
            phone: data?.phone ?? "",
            address: data?.address ?? "",
            birthday: data?.birthday ?? "",
            sex: data?.sex ?? "",
            gradeId: data?.gradeId ?? undefined,
            classId: data?.classId ?? undefined,
            parentId: data?.parentId ?? "",
        },
    });

    const [state, formAction, isPending] = useActionState(
        type === "create" ? createStudent : updateStudent,
        { success: false, error: null as string | null }
    );


    const grades = Array.isArray(relatedData?.grades) ? relatedData.grades : [];

    // Labels pour les cycles, utilisés dans le select des niveaux
    const cycleLabel = {
        FIRST: "1er Cycle",
        SECOND: "2eme Cycle",
    };

    // Grouper les niveaux
    const groupedGrades = (grades as Grade[]).reduce<
        Record<Grade["cycle"], Grade[]>
    >((acc, grade) => {
        if (!acc[grade.cycle]) acc[grade.cycle] = [];
        acc[grade.cycle].push(grade);
        return acc;
    }, {
        FIRST: [],
        SECOND: [],
    });

    // Gérer l'état de l'image uploadée via Cloudinary
    const [image, setImage] = useState<any>(null);

    const onSubmit = handleSubmit(
        (data) => {
            console.log("✅ DATA SOUMIS:", data); // debug
            startTransition(() => {
                formAction({ ...data, image: image?.secure_url });
            });
        },
        (errors) => {
            console.log("❌ ERREURS VALIDATION:", errors); // debug
        }
    );

    const router = useRouter();

    useEffect(() => {
        if (state.success) {
            toast.success(
                `L'élève a été ${type === "create" ? "ajouté" : "mis à jour"} avec succès`
            );
            setOpen(false);
            router.refresh();
        }

        if (state.error) {
            toast.error(state.error); // 🔥 Afficher l'erreur EXACTE du serveur
        }
    }, [state, router, type, setOpen]);

    const { classes } = relatedData;

    return (
        <div className="max-h-[80vh] overflow-y-auto p-6">
            <form className="flex flex-col gap-8" onSubmit={onSubmit}>
                <h1 className="text-xl font-semibold">
                    {type === "create" ? "Ajouter un nouvel élève" : "Modifier un élève"}
                </h1>

                {/* SECTION 1 */}
                <span className="text-sm text-gray-600 font-semibold border-b pb-1">
                    Information de connexion
                </span>

                <div className="flex justify-between flex-wrap gap-4">
                    <InputField label="Username" name="username"
                        defaultValue={data?.username} register={register}
                        error={errors?.username} />
                    <InputField label="Adresse email" name="email" type="email"
                        defaultValue={data?.email} register={register}
                        error={errors?.email} />
                    <InputField label="Mot de passe" name="password" type="password"
                        defaultValue={data?.password} register={register}
                        error={errors?.password} />
                </div>

                {/* SECTION 2 */}
                <span className="text-sm text-gray-600 font-semibold border-b pb-1">
                    Information personnelle
                </span>

                <div className="flex flex-col gap-2 rounded-full md:w-1/4">
                    <CldUploadWidget uploadPreset="school"
                        onSuccess={(result: any, { widget }) => {
                            setImage(result.info);
                            widget.close();
                        }}>
                        {({ open }) => (
                            <div onClick={() => open()}
                                className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 transition p-2 rounded-md cursor-pointer text-sm border border-gray-300">
                                <Image src="/upload.png" alt="upload" width={28} height={28} />
                                <span>Télécharger une photo</span>
                            </div>
                        )}
                    </CldUploadWidget>
                </div>

                <div className="flex justify-between flex-wrap gap-4">
                    <InputField label="Prénom" name="name" defaultValue={data?.name}
                        register={register} error={errors?.name} />
                    <InputField label="Nom" name="surname" defaultValue={data?.surname}
                        register={register} error={errors?.surname} />
                    <InputField label="Téléphone" name="phone" defaultValue={data?.phone}
                        register={register} error={errors?.phone} />
                    <InputField label="Adresse" name="address" defaultValue={data?.address}
                        register={register} error={errors?.address} />
                    <InputField label="Type Sanguin" name="bloodType"
                        defaultValue={data?.bloodType} register={register}
                        error={errors?.bloodType} />
                    <InputField label="Date de naissance" name="birthday"
                        defaultValue={data?.birthday} register={register}
                        error={errors?.birthday} type="date" />

                    {data && (
                        <InputField label="ID" name="id" defaultValue={data?.id}
                            register={register} error={errors?.id} hidden />
                    )}

                    <div className="flex flex-col gap-2 md:w-1/4">
                        <label>Genre</label>
                        <select className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                            {...register("sex")} defaultValue={data?.sex}>
                            <option value="">Selectionner</option>
                            <option value="MALE">Masculin</option>
                            <option value="FEMALE">Feminin</option>
                        </select>
                        {errors.sex && <p className="text-xs text-red-500">{errors.sex.message}</p>}
                    </div>

                    <div className="flex flex-col gap-2 md:w-1/4">
                        <label>Niveau</label>
                        <select
                            {...register("gradeId")}
                            defaultValue={data?.gradeId ?? ""}
                            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                        >
                            <option value="">Sélectionner</option>

                            {Object.entries(groupedGrades).map(([cycle, grades]) => (
                                <optgroup
                                    key={cycle}
                                    label={cycleLabel[cycle as keyof typeof cycleLabel]}
                                >
                                    {grades
                                        .sort((a, b) => a.level - b.level)
                                        .map((grade) => (
                                            <option key={grade.id} value={grade.id}>
                                                {grade.name ?? `${grade.level}ème Année`}
                                            </option>
                                        ))}
                                </optgroup>
                            ))}

                            {errors.gradeId && (
                                <span className="text-[10px] text-red-500">
                                    {errors.gradeId.message?.toString()}
                                </span>
                            )}
                        </select>
                    </div>

                    <div className="flex flex-col gap-2 md:w-1/4">
                        <label>Classe</label>
                        <select className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                            {...register("classId")} defaultValue={data?.classId}>
                            <option value="">Sélectionner</option>
                            {classes.map((classItem: {
                                id: number; name: string;
                                capacity: number; _count: { students: number }
                            }) => (
                                <option value={classItem.id} key={classItem.id}>
                                    {classItem.name} - {classItem._count.students}/{classItem.capacity} Capacité
                                </option>
                            ))}
                        </select>
                        {errors.classId && <p className="text-xs text-red-500">{errors.classId.message}</p>}
                    </div>

                    {/* 🔥 FIX PRINCIPAL - ParentSelect met à jour RHF via setValue */}
                    <div className="flex flex-col gap-2 w-full">
                        <ParentSelect
                            defaultValue={data?.parentId}
                            onSelect={(parent: any) => {
                                const id = typeof parent === "string"
                                    ? parent
                                    : parent?.id;
                                // 🔥 Met à jour RHF directement
                                setValue("parentId", id ?? "", {
                                    shouldValidate: true, // déclenche la validation
                                    shouldDirty: true,
                                });
                            }}
                        />
                        {/* Champ caché géré par RHF */}
                        <input type="hidden" {...register("parentId")} />
                        {errors.parentId && (
                            <p className="text-xs text-red-500">{errors.parentId.message}</p>
                        )}
                    </div>

                    {/* Server error */}
                    {state.error && (
                        <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md w-full">
                            ❌ {state.error}
                        </div>
                    )}
                </div>

                <button type="submit" disabled={isPending}
                    className="bg-blue-600 text-white py-2 rounded-md cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2">
                    {isPending && (
                        <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    )}
                    <span>
                        {isPending ? "Enregistrement..." : type === "create" ? "Enregistrer" : "Valider"}
                    </span>
                </button>
            </form>
        </div>
    );
};

export default StudentForm;