"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { ClassSchemaInput, classSchema } from "@/lib/formValidationSchemas";
import { createClass, updateClass } from "@/lib/actions";
import { Dispatch, SetStateAction, useActionState, useEffect } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Users,
  Save,
  X,
  Loader2,
  School,
  UserCircle,
  Layers,
} from "lucide-react";

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
  } = useForm<ClassSchemaInput>({
    resolver: zodResolver(classSchema),
  });

  const [state, formAction, isPending] = useActionState(
    type === "create" ? createClass : updateClass,
    {
      success: false,
      error: false,
    }
  );

  const onSubmit = handleSubmit((formData) => {
    formAction(formData);
  });

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast.success(
        `La classe a été ${
          type === "create" ? "ajoutée avec succès" : "mise à jour avec succès"
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
    <form onSubmit={onSubmit} className="bg-white rounded-xl p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between border-b pb-3">
        <div>
          <h1 className="flex items-center gap-2 text-sm font-semibold">
            <BookOpen className="w-4 h-4 text-blue-600" />
            {type === "create" ? "Nouvelle matière" : "Modifier la matière"}
          </h1>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
            Renseignez les informations de la classe
          </p>
        </div>
      </div>

      {/* Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {/* Nom */}
        <InputField
          label="Nom de la classe"
          name="name"
          defaultValue={data?.name}
          register={register}
          error={errors?.name}
          inputClassName="text-sm py-2"
          icon={<School className="w-4 h-4" />}
        />
        {/* Capacité */}
        <InputField
          label="Nombre de places"
          name="capacity"
          defaultValue={data?.capacity}
          register={register}
          error={errors?.capacity}
          inputClassName="pl-9 py-2 text-xs"
          icon={<Users className="w-4 h-4" />}
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
        <div className="flex flex-col gap-1">
          <label className="flex items-center gap-1 text-[11px] font-medium">
            <UserCircle className="w-4 h-4" />
            Superviseur
          </label>

          <select
            {...register("supervisorId")}
            defaultValue={data?.supervisorId ?? ""}
            className="h-9 rounded-md border bg-transparent px-2 text-xs
            focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">Sélectionner</option>
            {teachers.map(
              (teacher: { id: string; name: string; surname: string }) => (
                <option
                  key={teacher.id}
                  defaultValue={teacher.id}
                  selected={data && teacher.id === data.supervisorId}
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
          <label className="flex items-center gap-1 text-[11px] font-medium">
            <Layers className="w-4 h-4" />
            Niveau
          </label>

          <select
            {...register("gradeId")}
            defaultValue={data?.gradeId ?? ""}
            className="h-9 rounded-md border bg-transparent px-2 text-xs
            focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">Sélectionner</option>
            {grades.map((grade: { id: number; level: number }) => (
              <option
                key={grade.id}
                value={grade.id}
                selected={data && grade.id === data.gradeId}
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
      <div className="flex justify-end gap-2 pt-3 border-t">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="flex items-center gap-1 px-3 py-1.5 text-[11px] text-gray-500 hover:text-gray-800"
        >
          <X className="w-3.5 h-3.5" />
          Annuler
        </button>

        <button
          type="submit"
          disabled={isPending}
          className={`flex items-center gap-1 px-4 py-1.5 rounded-md text-[11px] text-white
          ${
            isPending
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

export default ClassForm;
