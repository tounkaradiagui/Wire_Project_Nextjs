"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { classSchema } from "@/lib/formValidationSchemas";
import { createClass, updateClass } from "@/lib/actions";
import { Dispatch, SetStateAction, useActionState, useEffect, startTransition } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const ClassForm = ({
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
    resolver: zodResolver(classSchema),
  });

  const [state, formAction, isPending] = useActionState(
    type === "create" ? createClass : updateClass,
    {
      success: false,
      error: null as string | null,
    }
  );

  const onSubmit = handleSubmit((formData) => {
    startTransition(() => {
      formAction(formData);
    });
  });

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast.success(
        `La classe a été ${type === "create" ? "ajoutée avec succès" : "mise à jour avec succès"
        }`
      );
      setOpen(false);
      router.refresh();
    }

    if (state.error) {
      toast.error("Erreur serveur, veuillez réessayer");
    }
  }, [state.success, state.error, type, setOpen, router]);

  //   const { teachers, grades } = relatedData;

  const teachers = Array.isArray(relatedData?.teachers)
    ? relatedData.teachers
    : [];

  const grades = Array.isArray(relatedData?.grades) ? relatedData.grades : [];

  return (
    <div className="max-h-[80vh] overflow-y-auto p-6">
      <form onSubmit={onSubmit} className="flex flex-col gap-8">
        {/* Header */}
        <h1 className="text-xl font-semibold">{type === "create" ? "Ajouter une nouvelle classe" : "Modifier une classe"}</h1>
        {/* SECTION 1 */}
        <span className="text-sm text-gray-600 font-semibold border-b pb-1">
          Renseignez les informations de la classe
        </span>


        {/* Fields */}
        <div className="flex justify-between flex-wrap gap-4">
          {/* Nom */}
          <InputField
            label="Nom de la classe"
            name="name"
            defaultValue={data?.name}
            register={register}
            error={errors?.name}
            inputClassName="text-sm py-2"
          />
          {/* Capacité */}
          <InputField
            label="Nombre de places"
            name="capacity"
            defaultValue={data?.capacity}
            register={register}
            error={errors?.capacity}
            inputClassName="pl-9 py-2 text-xs"
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

          {/* Superviseur */}
          <div className="flex flex-col gap-2 rounded-full md:w-1/4">
            <label htmlFor="">
              Superviseur
            </label>

            <select
              {...register("supervisorId")}
              defaultValue={data?.supervisorId ?? ""}
              className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            >
              <option value="">Sélectionner</option>
              {teachers.map(
                (teacher: { id: string; name: string; surname: string }) => (
                  <option
                    key={teacher.id}
                    value={teacher.id}
                  >
                    {teacher.name} {teacher.surname}
                  </option>
                )
              )}
            </select>

            {errors.supervisorId && (
              <span className="text-[10px] text-red-500">
                {errors.supervisorId.message?.toString()}
              </span>
            )}
          </div>

          {/* Niveau */}
          <div className="flex flex-col gap-1">
            <label >
              Niveau
            </label>

            <select
              {...register("gradeId")}
              defaultValue={data?.gradeId ?? ""}
              className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            >
              <option value="">Sélectionner</option>
              {grades.map((grade: { id: number; level: number }) => (
                <option
                  key={grade.id}
                  value={grade.id}
                >
                  Niveau {grade.level}
                </option>
              ))}
            </select>

            {errors.gradeId && (
              <span className="text-[10px] text-red-500">
                {errors.gradeId.message?.toString()}
              </span>
            )}
          </div>

        </div>
        {/* Error */}
        {state.error && (
          <div className="text-[11px] text-red-600 bg-red-50 dark:bg-red-900/30 p-2 rounded">
            Une erreur est survenue, veuillez réessayer.
          </div>
        )}

        {/* Actions */}
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

export default ClassForm;
