"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { classSchema } from "@/lib/formValidationSchemas";
import { createClass, updateClass } from "@/lib/actions";
import { Dispatch, SetStateAction, useActionState, useEffect, startTransition, useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

type Grade = {
  id: number;
  name?: string;
  level: number;
  cycle: "FIRST" | "SECOND";
};

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

  const [serverError, setServerError] = useState<string | null>(null);

  const onSubmit = handleSubmit((formData) => {
    startTransition(() => {
      setServerError(null)
      formAction(formData);
    });
  });

  const router = useRouter();

  useEffect(() => {
    if (state.error) {
      setServerError(state.error);
      toast.error("Erreur serveur, veuillez réessayer");
    }

    if (state.success) {
      toast.success(
        `La classe a été ${type === "create"
          ? "ajoutée avec succès"
          : "mise à jour avec succès"
        }`
      );
      setOpen(false);
      router.refresh();
    }
  }, [state.success, state.error, type, setOpen, router]);

  // Récupérer les niveaux depuis les données liées tout en assurant que c'est un tableau
  const grades = Array.isArray(relatedData?.grades) ? relatedData.grades : [];

  // Labels pour les cycles
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

          {/* Niveau */}
          <div className="flex flex-col gap-1">
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
            </select>

            {errors.gradeId && (
              <span className="text-[10px] text-red-500">
                {errors.gradeId.message?.toString()}
              </span>
            )}
          </div>

        </div >

        {/* Global error */}
        {
          serverError && (
            <span className="text-xs text-red-500">{serverError}</span>
          )
        }

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
      </form >
    </div >
  );
};

export default ClassForm;
