"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { SubjectSchemaInput, subjectSchema } from "@/lib/formValidationSchemas";
import { createSubject } from "@/lib/actions";
import {
  Dispatch,
  SetStateAction,
  useActionState,
  startTransition,
  useEffect,
} from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const SubjectForm = ({
  setOpen,
  type,
  data,
}: {
  setOpen: Dispatch<SetStateAction<boolean>>;
  type: "create" | "update";
  data?: any;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SubjectSchemaInput>({
    resolver: zodResolver(subjectSchema),
  });

  const [state, formAction] = useActionState(createSubject, {
    success: false,
    error: false,
  });

  const onSubmit = handleSubmit((formData) => {
    startTransition(() => {
      formAction(formData);
    });
  });

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast.success(
        `La matière a été ${
          type === "create" ? "ajoutée avec succès" : "mise à jour avec succès"
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

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create"
          ? "Ajouter une nouvelle matière"
          : "Mettre à jour une matière"}
      </h1>

      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Nom de la matière"
          name="name"
          defaultValue={data?.name}
          register={register}
          error={errors?.name}
        />
      </div>

      {/* Affichage de l’erreur Prisma */}
      {state.error && (
        <span className="text-red-500">
          Erreur de serveur : vérifiez le nom de la matière ou réessayez.
        </span>
      )}

      <button className="bg-blue-500 text-white p-2 rounded-md cursor-pointer">
        {type === "create" ? "Enregistrer" : "Valider"}
      </button>
    </form>
  );
};

export default SubjectForm;
