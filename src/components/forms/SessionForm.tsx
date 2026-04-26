"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { sessionSchema } from "@/lib/formValidationSchemas";
import { createSession, updateSession } from "@/lib/actions";
import {
  Dispatch,
  SetStateAction,
  startTransition,
  useActionState,
  useEffect,
  useState,
} from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import InputField from "../InputField";

type SessionFormProps = {
  setOpen: Dispatch<SetStateAction<boolean>>;
  type: "create" | "update";
  data?: any;
  relatedData?: any;
};

// Formater une date au format "dd/MM/yyyy"
export const formatDate = (date: Date | string) => {
  const d = new Date(date);

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  return `${day}/${month}/${year}`;
};

// Formater une date au format "dd/MM/yyyyTHH:mm" pour les champs datetime-local
export const formatDateTimeLocal = (date: Date | string) => {
  const d = new Date(date);

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");

  return `$${day}/${month}/${year}T${hours}:${minutes}`;
};

const SessionForm = ({
  setOpen,
  type,
  data,
  relatedData,
}: SessionFormProps) => {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(sessionSchema),
    defaultValues: data
      ? {
        ...data,
        date: formatDate(data.date),
        startTime: formatDateTimeLocal(data.startTime),
        endTime: formatDateTimeLocal(data.endTime),
      }
      : {},
  });

  const [serverError, setServerError] = useState<string | null>(null);

  const [state, formAction, isPending] = useActionState(
    type === "create" ? createSession : updateSession,
    { success: false, error: null as string | null }
  );

  const onSubmit = handleSubmit((data) => {
    console.log("SUBMIT TRIGGERED", data);
    startTransition(() => {
      setServerError(null);
      formAction(data);
    });
  });

  useEffect(() => {
    if (state.success) {
      toast.success(
        `La séance a été ${type === "create" ? "créée avec succès" : "mise à jour avec succès"
        }`
      );
      setOpen(false);
      router.refresh();
    }

    if (state.error) {
      toast.error(state.error || "Erreur serveur");
    }
    console.log("STATE:", state);
  }, [state.success, state.error, type, router, setOpen]);

  return (
    <div className="max-h-[80vh] overflow-y-auto p-6">
      <form onSubmit={onSubmit} className="flex flex-col gap-6 p-6">
        <h1 className="text-xl font-semibold">
          {type === "create"
            ? "Créer une séance"
            : "Modifier la séance"}
        </h1>

        <span className="text-sm text-gray-600 font-semibold border-b pb-1">
          Renseignez les informations de la séance
        </span>

        {/* LESSON */}
        <div className="flex flex-col gap-1">
          <label>Cours</label>
          <select
            {...register("lessonId")}
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm"
          >
            <option value="">Sélectionner un cours</option>
            {relatedData?.lessons?.map(
              (lesson: { id: number; name: string }) => (
                <option key={lesson.id} value={lesson.id}>
                  {lesson.name}
                </option>
              )
            )}
          </select>
        </div>

        {/* DATE */}
        <InputField
          label="Date"
          name="date"
          type="date"
          register={register}
          error={errors.date}
        />

        {/* START + END */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="Heure de début"
            name="startTime"
            type="datetime-local"
            register={register}
            error={errors.startTime}
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

          <InputField
            label="Heure de fin"
            name="endTime"
            type="datetime-local"
            register={register}
            error={errors.endTime}
          />
        </div>

        {/* ROOM */}
        <InputField
          label="Salle"
          name="room"
          register={register}
          error={errors.room}
        />

        {serverError && (
          <span className="text-xs text-red-500">
            {serverError}
          </span>
        )}

        {/* ACTION */}
        <button
          type="submit"
          disabled={isPending}
          className="bg-blue-600 text-white py-2 rounded-md disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isPending && (
            <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          )}
          {isPending
            ? "Enregistrement..."
            : type === "create"
              ? "Créer la séance"
              : "Mettre à jour"}
        </button>
      </form>
    </div>
  );
};

export default SessionForm;