"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { startTransition, useActionState, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { eventSchema } from "@/lib/formValidationSchemas";
import { createEvent, updateEvent } from "@/lib/actions";

const EventForm = ({
  setOpen,
  type,
  data,
  relatedData,
}: {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  type: "create" | "update";
  data?: any;
  relatedData?: any;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(eventSchema),
  });

  const [state, formAction, isPending] = useActionState(
    type === "create" ? createEvent : updateEvent,
    {
      success: false,
      error: null as string | null,
    }
  );

  const [serverError, setServerError] = useState<string | null>(null);

  const onSubmit = handleSubmit((data) => {
    startTransition(() => {
      setServerError(null)
      formAction(data);
    });
  });

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast.success(
        `L'événement a été ${type === "create" ? "ajoutée avec succès" : "mise à jour avec succès"
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

  const classes = relatedData?.eventClasses || [];

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">Ajouter un nouvel événement</h1>
      {/* SECTION 1 */}
      <span className="text-sm text-gray-600 font-semibold border-b pb-1">
        Informations de base
      </span>

      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Tite de l'l'événement"
          name="title"
          defaultValue={data?.title}
          register={register}
          error={errors?.title}
        />
        <InputField
          label="Date de début"
          name="startTime"
          defaultValue={data?.startTime}
          register={register}
          error={errors?.startTime}
          inputClassName="text-sm py-2"
          type="datetime-local"
        />
        <InputField
          label="Date de fin"
          name="endTime"
          defaultValue={data?.endTime}
          register={register}
          error={errors?.endTime}
          inputClassName="text-sm py-2"
          type="datetime-local"
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

        {/* Classe */}
        <div className="flex flex-col gap-2 rounded-full md:w-1/4">
          <label>Classe</label>
          <select
            {...register("classId")}
            defaultValue=""
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
          >
            <option value="">Toutes les classes</option>
            {classes.map((c: any) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {errors.classId && (
            <span className="text-[11px] text-red-500">
              {errors.classId.message?.toString()}
            </span>
          )}
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1 md:col-span-2">
          <label>Description</label>
          <textarea
            {...register("description")}
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm min-h-22.5"
            placeholder="Description..."
          />
          {errors.description && (
            <p className="text-xs text-red-500">{errors.description.message}</p>
          )}
        </div>
      </div>
      {/* Global error */}
      {serverError && (
        <span className="text-xs text-red-500">{serverError}</span>
      )}

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
  );
};

export default EventForm;
