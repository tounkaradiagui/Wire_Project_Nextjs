"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { userSchema } from "@/lib/formValidationSchemas";
import {
  Dispatch,
  SetStateAction,
  useActionState,
  useEffect,
  startTransition,
} from "react";
import { createUser, updateUser } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

const UserForm = ({ setOpen, type, data, relatedData }:
  {
    type: "create" | "update";
    data?: any;
    setOpen: Dispatch<SetStateAction<boolean>>;
    relatedData?: any;
  }
) => {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(userSchema)
  });

  const [state, formAction, isPending] = useActionState(
    type === "create" ? createUser : updateUser,
    {
      success: false,
      error: null as string | null,
    }
  );

  // Gérer la soumission du formulaire 
  const onSubmit = handleSubmit((formData) => {
    startTransition(() => {
      formAction({
        ...formData,
        id: formData.id!,
      });
    });
  });

  useEffect(() => {
    if (state.success) {
      toast.success(
        `Utilisateur ${type === "create" ? "créé" : "mis à jour"
        } avec succès`,
        {
          style: {
            background: "#111827",
            color: "#fff",
            fontWeight: "bold",
          },
        }
      );
      setOpen(false);
      router.refresh();
    }

    if (state.error) {
      toast.error(state.error || "Erreur serveur", {
        style: {
          background: "#ef4444",
          color: "#fff",
          fontWeight: "bold",
        },
      });
    }
  }, [state, router, type, setOpen]);

  return (
    <div className="max-h-[80vh] overflow-y-auto p-6">
      <form className="flex flex-col gap-6" onSubmit={onSubmit}>
        <h1 className="text-xl font-semibold">
          {type === "create"
            ? "Ajouter un nouvel utilisateur"
            : "Modifier un utilisateur"}
        </h1>

        {/* SECTION IDENTITÉ */}
        <span className="text-sm text-gray-600 font-semibold border-b pb-1">
          Informations personnelles
        </span>

        <div className="flex flex-wrap gap-4">
          <InputField
            label="Prénom"
            name="firstName"
            register={register}
            error={errors.firstName}
          />
          <InputField
            label="Nom"
            name="lastName"
            register={register}
            error={errors.lastName}
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

        </div>

        {/* SECTION CONNEXION */}
        <span className="text-sm text-gray-600 font-semibold border-b pb-1">
          Informations de connexion
        </span>

        <div className="flex flex-wrap gap-4">
          <InputField
            label="Username"
            name="username"
            register={register}
            error={errors.username}
          />

          <InputField
            label="Adresse email"
            name="email"
            type="email"
            defaultValue={data?.email}
            register={register}
            error={errors.email}
          />

          {type === "create" && (
            <InputField
              label="Mot de passe"
              name="password"
              type="password"
              register={register}
              error={errors.password}
            />
          )}

          {/* Rôle */}
          <div className="flex flex-col w-full md:w-[48%]">
            <label className="text-sm font-medium mb-1">Rôle</label>
            <select
              {...register("role")}
              className="border rounded-md p-2"
            >
              <option value="ADMIN">Admin</option>
              <option value="TEACHER">Enseignant</option>
              <option value="PARENT">Parent</option>
              <option value="STUDENT">Elève</option>
            </select>
            {errors.role && (
              <p className="text-red-500 text-sm mt-1">
                {errors.role.message as string}
              </p>
            )}
          </div>
        </div>

        {/* SUBMIT */}
        <button
          type="submit"
          disabled={isPending}
          className="bg-blue-600 text-white py-2 rounded-md disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
        >
          {isPending && (
            <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin cursor-notallow" />
          )}

          {isPending
            ? "Enregistrement..."
            : type === "create"
              ? "Créer l'utilisateur"
              : "Mettre à jour"}
        </button>
      </form>
    </div>
  );
};

export default UserForm;