"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { subjectSchema } from "@/lib/formValidationSchemas";
import { createSubject, updateSubject } from "@/lib/actions";
import { Dispatch, SetStateAction, useActionState, useEffect, startTransition } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { BookOpen, Users, Save, X, Loader2 } from "lucide-react";

const SubjectForm = ({
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
    resolver: zodResolver(subjectSchema),
  });

  const [state, formAction, isPending] = useActionState(
    type === "create" ? createSubject : updateSubject,
    {
      success: false,
      error: null as string | null,
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
        `La matière a été ${type === "create" ? "ajoutée avec succès" : "mise à jour avec succès"
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

  const teachers = Array.isArray(relatedData?.teachers)
    ? relatedData.teachers
    : [];

  return (
    <form onSubmit={onSubmit} className="bg-white rounded-xl p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-base font-semibold text-gray-800">
            <BookOpen className="w-4 h-4 text-blue-600" />
            {type === "create" ? "Nouvelle matière" : "Modifier la matière"}
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Renseignez le nom de la matière et assignez les enseignants
          </p>
        </div>
      </div>

      {/* Form fields */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <div className="md:col-span-3">
          <InputField
            label="Nom de la matière"
            name="name"
            defaultValue={data?.name}
            register={register}
            error={errors?.name}
            inputClassName="text-sm py-2"
          />
        </div>

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

        {/* Teachers */}
        <div className="md:col-span-2 flex flex-col gap-1">
          <label className="flex items-center gap-1 text-xs font-medium text-gray-600">
            <Users className="w-3.5 h-3.5" />
            Enseignants
          </label>

          <select
            multiple
            {...register("teachers")}
            defaultValue={data?.teachers}
            className="min-h-24 rounded-md border border-gray-300 text-xs p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            {teachers.map(
              (teacher: { id: string; name: string; surname: string }) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.name} {teacher.surname}
                </option>
              )
            )}
          </select>

          {errors.teachers && (
            <span className="text-[11px] text-red-500">
              {errors.teachers.message?.toString()}
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
      <div className="flex justify-end gap-2 pt-4">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-600 hover:text-gray-900"
        >
          <X className="w-3.5 h-3.5" />
          Annuler
        </button>

        <button
          type="submit"
          disabled={isPending}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs
      rounded-md text-white transition
      ${isPending
              ? "bg-blue-300 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
            }`}
        >
          {isPending ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Save className="w-3.5 h-3.5" />
          )}
          {type === "create" ? "Enregistrer" : "Mettre à jour"}
        </button>
      </div>
    </form>
  );
};

export default SubjectForm;