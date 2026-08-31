"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  teacherApplicationSchema,
  TeacherApplicationInput,
} from "@/lib/validations/schoolFormSchemas";
import { submitTeacherApplication, getApplicationCountByEmail } from "@/lib/actions/schools";
import { CldUploadWidget } from "next-cloudinary";

const MAX_APPLICATIONS = 2;
const STORAGE_KEY = "edumanage_teacher_application_count";

/**
 * Garde-fou côté client (UX immédiate) basé sur localStorage par appareil/navigateur.
 * La vérification définitive et infalsifiable reste côté serveur dans
 * submitTeacherApplication, indexée par email (voir lib/actions.ts).
 */
function getLocalApplicationCount(): number {
  if (typeof window === "undefined") return 0;
  return Number(window.localStorage.getItem(STORAGE_KEY) || "0");
}

function incrementLocalApplicationCount() {
  if (typeof window === "undefined") return;
  const next = getLocalApplicationCount() + 1;
  window.localStorage.setItem(STORAGE_KEY, String(next));
}

export default function TeacherApplicationForm({ schoolId }: { schoolId: string }) {
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [blocked, setBlocked] = useState(getLocalApplicationCount() >= MAX_APPLICATIONS);

  const [cv, setCv] = useState<any>(null);

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<TeacherApplicationInput>({
    resolver: zodResolver(teacherApplicationSchema),
    defaultValues: { schoolId },
  });

  const email = watch("email");

  // Vérification serveur en temps réel quand l'email est renseigné (avant soumission).
  const checkEmailLimit = async () => {
    if (!email || !email.includes("@")) return;
    setCheckingEmail(true);
    try {
      const count = await getApplicationCountByEmail(email);
      if (count >= MAX_APPLICATIONS) {
        setError("email", {
          message: `Cette adresse a déjà soumis ${count} candidatures. Limite atteinte (${MAX_APPLICATIONS} maximum).`,
        });
      }
    } finally {
      setCheckingEmail(false);
    }
  };

  const onSubmit = async (data: TeacherApplicationInput) => {
    setServerError(null);

    const formData = new FormData();
    formData.append("schoolId", data.schoolId);
    formData.append("fullName", data.fullName);
    formData.append("phone", data.phone);
    formData.append("email", data.email);
    formData.append("coverLetter", data.coverLetter);

    formData.append("cvUrl", data.cvUrl);
    formData.append("cvFileName", data.cvFileName);

    const result = await submitTeacherApplication(formData);

    if (result.success) {
      incrementLocalApplicationCount();
      const newCount = getLocalApplicationCount();
      setRemaining(Math.max(MAX_APPLICATIONS - newCount, 0));
      setBlocked(newCount >= MAX_APPLICATIONS);
      setSubmitted(true);
      reset();
      setCv(null);

    } else {
      setServerError(result.message);
      if (result.message.toLowerCase().includes("limite")) {
        setBlocked(true);
      }
    }
  };

  if (blocked && !submitted) {
    return (
      <div id="postuler" className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
        <div className="mb-2 text-3xl">🚫</div>
        <h3 className="text-base font-bold text-amber-800">Limite de candidatures atteinte</h3>
        <p className="mt-2 text-sm text-amber-700">
          Vous avez déjà envoyé {MAX_APPLICATIONS} candidatures, le maximum autorisé par candidat.
          Vous ne pouvez plus postuler depuis cet appareil ou avec cette adresse email.
        </p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div id="postuler" className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
        <div className="mb-2 text-3xl">✅</div>
        <h3 className="text-base font-bold text-emerald-800">Candidature envoyée !</h3>
        <p className="mt-2 text-sm text-emerald-700">
          {remaining && remaining > 0
            ? `Votre candidature a bien été transmise. Il vous reste ${remaining} candidature possible.`
            : "Votre candidature a bien été transmise. Vous avez atteint le nombre maximal de candidatures autorisées."}
        </p>
        {remaining !== null && remaining > 0 && (
          <button
            onClick={() => setSubmitted(false)}
            className="mt-4 rounded-lg border border-emerald-400 px-4 py-2 text-sm font-semibold text-emerald-700"
          >
            Postuler à une autre école
          </button>
        )}
      </div>
    );
  }

  return (
    <form
      id="postuler"
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div>
        <h3 className="text-base font-bold text-[#0F2D56]">Postuler comme enseignant·e</h3>
        <p className="mt-1 text-xs text-slate-500">
          Limite : {MAX_APPLICATIONS} candidatures maximum par candidat, toutes écoles confondues.
        </p>
      </div>

      <input type="hidden" {...register("schoolId")} value={schoolId} />

      <Field label="Nom complet" error={errors.fullName?.message} required>
        <input {...register("fullName")} className="form-input" placeholder="Prénom Nom" />
      </Field>

      <Field label="Numéro de téléphone" error={errors.phone?.message} required>
        <input {...register("phone")} className="form-input" placeholder="+223 76 29 22 70" />
      </Field>

      <Field label="Email" error={errors.email?.message} required hint={checkingEmail ? "Vérification..." : undefined}>
        <input
          {...register("email", { onBlur: checkEmailLimit })}
          type="email"
          className="form-input"
          placeholder="vous@exemple.com"
        />
      </Field>

      <Field
        label="CV"
        error={errors.cvUrl?.message}
        required
      >
        <CldUploadWidget
          uploadPreset="school"
          options={{
            resourceType: "auto",
          }}
          onSuccess={(result: any, { widget }) => {

            setCv(result.info);

            setValue(
              "cvUrl",
              result.info.secure_url,
              { shouldValidate: true }
            );

            setValue(
              "cvFileName",
              result.info.original_filename
            );

            widget.close();
          }}
        >
          {({ open }) => (
            <button
              type="button"
              onClick={() => open()}
              className="rounded-lg bg-[#1B5FC1] px-4 py-2 text-white"
            >
              Choisir un CV
            </button>
          )}
        </CldUploadWidget>

        {cv && (
          <p className="text-xs text-slate-500 mt-2">
            📎 {cv.original_filename}
          </p>
        )}

        <input
          type="hidden"
          {...register("cvUrl")}
        />

        <input
          type="hidden"
          {...register("cvFileName")}
        />
      </Field>

      <Field label="Lettre de motivation" error={errors.coverLetter?.message} required>
        <textarea
          {...register("coverLetter")}
          rows={5}
          className="form-input resize-y"
          placeholder="Présentez-vous et expliquez votre motivation à rejoindre cet établissement..."
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
        {isSubmitting ? "Envoi en cours..." : "Envoyer ma candidature"}
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
  hint,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-slate-600">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {hint && <span className="text-xs text-slate-400">{hint}</span>}
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}
