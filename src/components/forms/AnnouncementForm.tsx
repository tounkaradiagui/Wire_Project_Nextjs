"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";
import InputField from "../InputField";
import Image from "next/image";

const schema = z.object({
  username: z
    .string()
    .min(3, {
      message: "Le nom d'utilisateur doit contenir au moins 3 caractères.",
    })
    .max(20, {
      message: "Le nom d'utilisateur ne doit pas dépasser 20 caractères.",
    }),
  email: z.string().email({ message: "Adresse email invalide" }),
  password: z
    .string()
    .min(4, { message: "Le mot de passe doit contenir au moins 4 caractères." })
    .max(20, {
      message: "Le mot de passe ne doit pas dépasser 20 caractères.",
    }),
  firstName: z.string().min(1, { message: "Le prénom est obligatoire" }),
  lastName: z.string().min(1, { message: "Le nom est obligatoire" }),
  phone: z.string().min(1, { message: "Le numéro est obligatoire" }),
  birthday: z.date({ message: "Le date de naissance est obligatoire" }),
  address: z.string().min(1, { message: "L'adresse est obligatoire" }),
  sex: z.enum(["male", "female"], { message: "Le genre est réquis !" }),
  bloodType: z.string().min(1, { message: "Le type saguin est réquis !" }),
  image: z.instanceof(File, { message: "L'image est réquis !" }),
});

type Inputs = z.infer<typeof schema>;

const AnnouncementForm = ({
  type,
  data,
}: {
  type: "create" | "update";
  data?: any;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>({
    resolver: zodResolver(schema),
  });

  const onSubmit = handleSubmit((data) => {
    console.log(data);
  });

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">Ajouter un nouvel élève</h1>
      {/* SECTION 1 */}
      <span className="text-sm text-gray-600 font-semibold border-b pb-1">
        Information de connexion
      </span>

      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Username"
          name="username"
          defaultValue={data?.username}
          register={register}
          error={errors?.username}
        />
        <InputField
          label="Adresse Email"
          name="email"
          type="email"
          defaultValue={data?.email}
          register={register}
          error={errors?.email}
        />
        <InputField
          label="Mot de passe"
          name="password"
          type="password"
          defaultValue={data?.password}
          register={register}
          error={errors?.password}
        />
      </div>
      <span className="text-sm text-gray-600 font-semibold border-b pb-1">
        Information personnelle
      </span>

      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Prénom"
          name="firstName"
          defaultValue={data?.firstName}
          register={register}
          error={errors?.firstName}
        />
        <InputField
          label="Nom"
          name="lastName"
          defaultValue={data?.lastName}
          register={register}
          error={errors?.lastName}
        />
        <InputField
          label="Numéro de téléphone"
          name="phone"
          defaultValue={data?.phone}
          register={register}
          error={errors?.phone}
        />
        <InputField
          label="Adresse"
          name="address"
          defaultValue={data?.address}
          register={register}
          error={errors?.address}
        />
        <InputField
          label="Type Saguin"
          name="bloodType"
          defaultValue={data?.bloodType}
          register={register}
          error={errors?.bloodType}
        />
        <InputField
          label="Date de naissance"
          name="birthday"
          defaultValue={data?.birthday}
          register={register}
          error={errors?.birthday}
          type="date"
        />

        <div className="flex flex-col gap-2 rounded-full md:w-1/4">
          <label htmlFor="">Genre</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("sex")}
            defaultValue={data?.sex}
          >
            <option value="">Selectionner</option>
            <option value="male">Masculin</option>
            <option value="female">Feminin</option>
          </select>
          {errors.sex && (
            <p className="text-xs text-red-500">
              {errors.sex.message?.toString()}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2 rounded-full md:w-1/4 mt-4">
          <label
            htmlFor="image"
            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 transition p-2 rounded-md cursor-pointer text-sm border border-gray-300"
          >
            <Image src="/upload.png" alt="" width={28} height={28} />
            <span>Télécharger une photo</span>
          </label>
          <input
            id="image"
            type="file"
            {...register("image")}
            className="hidden"
          />

          {errors?.image && (
            <p className="text-xs text-red-500">
              {errors.image.message?.toString()}
            </p>
          )}
        </div>
      </div>

      <button className="bg-blue-500 text-white p-2 rounded-md cursor-pointer">
        {type === "create" ? "Enregistrer" : "Valider"}
      </button>
    </form>
  );
};

export default AnnouncementForm;
