"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import Image from "next/image";
import { studentSchema, StudentSchemaInput } from "@/lib/formValidationSchemas";
import { Dispatch, SetStateAction, useActionState, useEffect, useState, startTransition } from "react";
import { createStudent, updateStudent } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { CldUploadWidget } from "next-cloudinary";
import ParentSelect from "@/components/ParentSelect";


const StudentForm = ({
  type,
  data,
  setOpen,
  relatedData
}: {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: any;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StudentSchemaInput>({
    resolver: zodResolver(studentSchema),
  });

  const [state, formAction, isPending] = useActionState(
    type === "create" ? createStudent : updateStudent,
    {
      success: false,
      error: false,
    }
  );

  const [image, setImage] = useState<any>(null);

  const [parentId, setParentId] = useState<string | null>(null);

  const onSubmit = handleSubmit((data) => {
    console.log(data)
    startTransition(() => {
      formAction({ ...data, image: image?.secure_url });
    });
  });

  const router = useRouter();

    useEffect(() => {
      if (state.success) {
        toast.success(
          `L'élève a été ${
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
    }, [state, router, type, setOpen]);

    const {grades, classes} = relatedData;

  return (
    <div className="max-h-[80vh] overflow-y-auto p-6">
      <form className="flex flex-col gap-8" onSubmit={onSubmit}>
        <h1 className="text-xl font-semibold">{type === "create" ? "Ajouter un nouvel élève" : "Modifier un élève"}</h1>
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
            label="Adresse email"
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

        <div className="flex flex-col gap-2 rounded-full md:w-1/4">
          <input type="hidden" name="image" value={image?.secure_url || ""} />
          <CldUploadWidget
              uploadPreset="school"
              onSuccess={(result: any, { widget }) => {
              setImage(result.info);
              widget.close();
            }}
          >
            {({ open }) => (
              <div
                onClick={() => open()}
                className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 transition p-2 rounded-md cursor-pointer text-sm border border-gray-300"
              >
                <Image src="/upload.png" alt="upload" width={28} height={28} />
                <span>Télécharger une photo</span>
              </div>
            )}
          </CldUploadWidget>
        </div>

        <div className="flex justify-between flex-wrap gap-4">
          <InputField
            label="Prénom"
            name="name"
            defaultValue={data?.name}
            register={register}
            error={errors?.name}
          />
          <InputField
            label="Nom"
            name="surname"
            defaultValue={data?.surname}
            register={register}
            error={errors?.surname}
          />
          <InputField
            label="Téléphone"
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
            defaultValue={data?.birthday.toISOString().split("T")[0]}
            register={register}
            error={errors?.birthday}
            type="date"
          />

          {/* Parent search/select */}
          <ParentSelect
            onSelect={(parent) => {
              setParentId(parent.id); // 🔴 ID EXACT de la DB
            }}
          />
          {/* <input type="hidden" name="parentId" value={parentId ?? ""} /> */}
          <InputField
            label="Parent"
            name="parentId"
            defaultValue="parentId1"
            register={register}
            error={errors.parentId}
            
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

          <div className="flex flex-col gap-2 rounded-full md:w-1/4">
            <label htmlFor="">Genre</label>
            <select
              key={data.id}
              className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
              {...register("sex")}
              defaultValue={data?.sex}
            >
              <option value="">Selectionner</option>
              <option value="MALE">Masculin</option>
              <option value="FEMALE">Feminin</option>
            </select>
            {errors.sex && (
              <p className="text-xs text-red-500">
                {errors.sex.message?.toString()}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2 rounded-full md:w-1/4">
            <label htmlFor="">Niveau</label>
            <select
              className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
              {...register("gradeId")}
              defaultValue={data?.gradeId}
            >
              <option value="">Sélectionner</option>
              {grades.map((grade: { id: number; level: string }) => (
                <option
                  value={grade.id} key={grade.id}
                >
                  {grade.level}
                </option>
              ))}
            </select>
            {errors.gradeId && (
              <p className="text-xs text-red-500">
                {errors.gradeId.message?.toString()}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2 rounded-full md:w-1/4">
            <label htmlFor="">Classe</label>
            <select
              className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
              {...register("classId")}
              defaultValue={data?.classId}
            >
              <option value="">Sélectionner</option>
              {classes.map((classItem: { id: number; name: string; capacity:number; _count: {students:number} }) => (
                <option
                 value={classItem.id} key={classItem.id}
                >
                  {classItem.name} - {" "} {classItem._count.students + "/" + classItem.capacity} {" "} Capacité
                </option>
              ))}
            </select>
            {errors.classId && (
              <p className="text-xs text-red-500">
                {errors.classId.message?.toString()}
              </p>
            )}
          </div>
          
          {/* Server error */}
          {state.error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
              ❌ Une erreur est survenue. Veuillez réessayer.
            </div>
          )}
        </div>

        <button className="bg-blue-500 text-white p-2 rounded-md cursor-pointer">
          {type === "create" ? "Enregistrer" : "Valider"}
        </button>
      </form>
    </div>
  );
};

export default StudentForm;
