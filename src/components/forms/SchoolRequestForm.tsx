"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    schoolRegistrationRequestSchema,
    SchoolRegistrationRequestInput,
} from "@/lib/formValidationSchemas";
import { submitSchoolRegistrationRequest } from "@/lib/actions.additions";

export default function SchoolRequestForm() {
    const [submitted, setSubmitted] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
    } = useForm({
        resolver: zodResolver(schoolRegistrationRequestSchema),
    });

    const onSubmit = async (data: SchoolRegistrationRequestInput) => {
        setServerError(null);
        const result = await submitSchoolRegistrationRequest(data);
        if (result.success) {
            setSubmitted(true);
            reset();
        } else {
            setServerError(result.message);
        }
    };

    if (submitted) {
        return (
            <div className="rounded-2xl bg-white p-8 text-center shadow-xl">
                <div className="mb-3 text-4xl">✅</div>
                <h3 className="text-lg font-bold text-[#0F2D56]">Demande envoyée !</h3>
                <p className="mt-2 text-sm text-slate-600">
                    Notre équipe vous contactera sous 48 heures avec vos identifiants de connexion.
                </p>
                <button
                    onClick={() => setSubmitted(false)}
                    className="mt-5 rounded-lg border border-[#1B5FC1] px-4 py-2 text-sm font-semibold text-[#1B5FC1]"
                >
                    Envoyer une autre demande
                </button>
            </div>
        );
    }

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-3 rounded-2xl bg-white p-6 shadow-xl sm:p-7"
        >
            <h3 className="text-base font-bold text-[#0F2D56]">Demande de création d&apos;espace</h3>

            <Field label="Nom de l'établissement" error={errors.schoolName?.message} required>
                <input {...register("schoolName")} className="form-input" placeholder="Ex : Ecole Bianson Dembele" />
            </Field>

            <div className="grid grid-cols-2 gap-3">
                <Field label="Ville" error={errors.city?.message} required>
                    <input {...register("city")} className="form-input" placeholder="Bamako" />
                </Field>
                <Field label="Pays" error={errors.country?.message} required>
                    <input {...register("country")} className="form-input" placeholder="Mali" />
                </Field>
            </div>

            <Field label="Votre nom complet" error={errors.contactName?.message} required>
                <input {...register("contactName")} className="form-input" placeholder="M. / Mme ..." />
            </Field>

            <Field label="Email" error={errors.email?.message} required>
                <input {...register("email")} type="email" className="form-input" placeholder="contact@ecole.ml" />
            </Field>

            <Field label="Téléphone" error={errors.phone?.message}>
                <input {...register("phone")} className="form-input" placeholder="+223 76 29 22 70" />
            </Field>

            <Field label="Nombre d'élèves estimé" error={errors.studentsCount?.message}>
                <input {...register("studentsCount")} type="number" className="form-input" placeholder="200" />
            </Field>

            <Field label="Message (optionnel)" error={errors.message?.message}>
                <textarea
                    {...register("message")}
                    rows={3}
                    className="form-input resize-y"
                    placeholder="Décrivez brièvement votre établissement..."
                />
            </Field>

            {serverError && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{serverError}</p>
            )}

            <button
                type="submit"
                disabled={isSubmitting}
                className="mt-2 w-full rounded-lg bg-linear-to-r from-[#1B5FC1] to-[#3EAAF5] px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
            >
                {isSubmitting ? "Envoi en cours..." : "Envoyer la demande →"}
            </button>

            <style jsx global>{`
        .form-input {
          width: 100%;
          padding: 0.6rem 0.75rem;
          border: 1.5px solid #d6e0ef;
          border-radius: 8px;
          font-size: 0.875rem;
          outline: none;
        }
        .form-input:focus {
          border-color: #1b5fc1;
        }
      `}</style>
        </form>
    );
}

function Field({
    label,
    error,
    required,
    children,
}: {
    label: string;
    error?: string;
    required?: boolean;
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-600">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            {children}
            {error && <span className="text-xs text-red-500">{error}</span>}
        </div>
    );
}
