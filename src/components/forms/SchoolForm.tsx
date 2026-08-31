"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import Image from "next/image";
import {
    Dispatch,
    SetStateAction,
    useActionState,
    useEffect,
    useState,
    startTransition,
} from "react";
import {
    createSchoolSchema,
    CreateSchoolSchemaInput,
} from "@/lib/validations/schoolFormSchemas";
import {
    createSchool,
    updateSchool,
} from "@/lib/actions/schools";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { CldUploadWidget } from "next-cloudinary";

const SchoolForm = ({
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
        resolver: zodResolver(createSchoolSchema),

        defaultValues: {
            schoolName: data?.name ?? "",
            city: data?.city ?? "",
            country: data?.country ?? "",
            address: data?.address ?? "",

            email: data?.email ?? "",
            phone: data?.phone ?? "",
            website: data?.website ?? "",

            description: data?.description ?? "",

            language: data?.language ?? "fr",
            timezone: data?.timezone ?? "Africa/Bamako",

            studentsCount: data?.maxStudents ?? undefined,

            plan: data?.plan ?? "FREE",

            trialEndsAt: data?.trialEndsAt
                ? new Date(data.trialEndsAt).toISOString().split("T")[0]
                : "",

            subscriptionEndsAt: data?.subscriptionEndsAt
                ? new Date(data.subscriptionEndsAt).toISOString().split("T")[0]
                : "",

            contactName: data?.contactName ?? "",
            contactEmail: data?.contactEmail ?? "",
            contactPhone: data?.contactPhone ?? "",
        },
    });

    const [state, formAction, isPending] = useActionState(
        type === "create" ? createSchool : updateSchool,
        {
            success: false,
            error: null,
        }
    );

    const [logo, setLogo] = useState<any>(data?.logoUrl ?? null);
    const [banner, setBanner] = useState<any>(data?.bannerUrl ?? null);

    const router = useRouter();

    const onSubmit = handleSubmit((values) => {

        startTransition(() => {

            formAction({

                ...values,

                id: data?.id,

                logoUrl:
                    typeof logo === "string"
                        ? logo
                        : logo?.secure_url,

                bannerUrl:
                    typeof banner === "string"
                        ? banner
                        : banner?.secure_url,
            });

        });

    });

    useEffect(() => {

        if (state.success) {

            toast.success(
                type === "create"
                    ? "École créée avec succès."
                    : "École mise à jour avec succès."
            );

            setOpen(false);

            router.refresh();
        }

        if (state.error) {

            toast.error(state.error);

        }

    }, [state]);

    return (
        <div className="max-h-[80vh] overflow-y-auto p-6">

            <form
                onSubmit={onSubmit}
                className="flex flex-col gap-8"
            >

                <h1 className="text-xl font-semibold">

                    {type === "create"
                        ? "Ajouter une école"
                        : "Modifier une école"}

                </h1>

                {/* Informations générales */}

                <span className="font-semibold text-gray-600 border-b pb-1">
                    Informations générales
                </span>

                <div className="flex flex-wrap gap-4">

                    <InputField
                        label="Nom de l'école"
                        name="schoolName"
                        register={register}
                        error={errors.schoolName}
                    />

                    <InputField
                        label="Ville"
                        name="city"
                        register={register}
                        error={errors.city}
                    />

                    <InputField
                        label="Pays"
                        name="country"
                        register={register}
                        error={errors.country}
                    />

                    <InputField
                        label="Adresse"
                        name="address"
                        register={register}
                        error={errors.address}
                    />

                    <InputField
                        label="Nombre maximum d'élèves"
                        name="studentsCount"
                        type="number"
                        register={register}
                        error={errors.studentsCount}
                    />

                </div>

                {/* Contact */}

                <span className="font-semibold text-gray-600 border-b pb-1">
                    Coordonnées
                </span>

                <div className="flex flex-wrap gap-4">

                    <InputField
                        label="Email"
                        name="email"
                        register={register}
                        error={errors.email}
                    />

                    <InputField
                        label="Téléphone"
                        name="phone"
                        register={register}
                        error={errors.phone}
                    />

                    <InputField
                        label="Site web"
                        name="website"
                        register={register}
                        error={errors.website}
                    />

                </div>

                {/* Responsable */}

                <span className="font-semibold text-gray-600 border-b pb-1">
                    Responsable
                </span>

                <div className="flex flex-wrap gap-4">

                    <InputField
                        label="Nom"
                        name="contactName"
                        register={register}
                        error={errors.contactName}
                    />

                    <InputField
                        label="Email"
                        name="contactEmail"
                        register={register}
                        error={errors.contactEmail}
                    />

                    <InputField
                        label="Téléphone"
                        name="contactPhone"
                        register={register}
                        error={errors.contactPhone}
                    />

                </div>

                {/* Description */}

                <div className="flex flex-col gap-2">

                    <label>Description</label>

                    <textarea
                        rows={5}
                        className="ring-1 ring-gray-300 rounded-md p-3"
                        {...register("description")}
                    />

                </div>

                {/* Plan */}

                <div className="flex flex-wrap gap-4">

                    <div className="flex flex-col gap-2 md:w-1/4">

                        <label>Plan</label>

                        <select
                            {...register("plan")}
                            className="ring-1 ring-gray-300 rounded-md p-2"
                        >
                            <option value="FREE">Gratuit</option>
                            <option value="BASIC">Basic</option>
                            <option value="PREMIUM">Premium</option>
                            <option value="ENTERPRISE">Enterprise</option>
                        </select>

                    </div>

                    <InputField
                        label="Fin période d'essai"
                        name="trialEndsAt"
                        type="date"
                        register={register}
                        error={errors.trialEndsAt}
                    />

                    <InputField
                        label="Fin abonnement"
                        name="subscriptionEndsAt"
                        type="date"
                        register={register}
                        error={errors.subscriptionEndsAt}
                    />

                </div>

                {/* Upload Logo */}

                <div className="flex gap-10 flex-wrap">

                    <div>

                        <CldUploadWidget
                            uploadPreset="school"
                            onSuccess={(result: any) =>
                                setLogo(result.info)
                            }
                        >

                            {({ open }) => (

                                <button
                                    type="button"
                                    onClick={() => open()}
                                    className="bg-gray-100 p-2 rounded-md border"
                                >
                                    Télécharger le logo
                                </button>

                            )}

                        </CldUploadWidget>

                        {logo && (

                            <Image
                                src={
                                    typeof logo === "string"
                                        ? logo
                                        : logo.secure_url
                                }
                                alt=""
                                width={120}
                                height={120}
                                className="rounded-md mt-3"
                            />

                        )}

                    </div>

                    <div>

                        <CldUploadWidget
                            uploadPreset="school"
                            onSuccess={(result: any) =>
                                setBanner(result.info)
                            }
                        >

                            {({ open }) => (

                                <button
                                    type="button"
                                    onClick={() => open()}
                                    className="bg-gray-100 p-2 rounded-md border"
                                >
                                    Télécharger la bannière
                                </button>

                            )}

                        </CldUploadWidget>

                        {banner && (

                            <Image
                                src={
                                    typeof banner === "string"
                                        ? banner
                                        : banner.secure_url
                                }
                                alt=""
                                width={250}
                                height={120}
                                className="rounded-md mt-3"
                            />

                        )}

                    </div>

                </div>

                {data && (
                    <InputField
                        hidden
                        label=""
                        name="id"
                        defaultValue={data.id}
                        register={register}
                        error={errors.id}
                    />
                )}

                {state.error && (
                    <div className="text-red-500">
                        {state.error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isPending}
                    className="bg-blue-600 text-white rounded-md py-2"
                >

                    {isPending
                        ? "Enregistrement..."
                        : type === "create"
                            ? "Créer l'école"
                            : "Mettre à jour"}

                </button>

            </form>

        </div>
    );
};

export default SchoolForm;