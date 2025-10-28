"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useState } from "react";
import type { JSX } from "react";
// import TeacherForm from "./forms/TeacherForm";
// import StudentForm from "./forms/StudentForm";

const TeacherForm = dynamic(() => import("./forms/TeacherForm"), {
  loading: () => <h1>Chargement...</h1>,
});

const StudentForm = dynamic(() => import("./forms/StudentForm"), {
  loading: () => <h1>Chargement...</h1>,
});

const forms: {
  [key: string]: (type: "create" | "update", data?: any) => React.JSX.Element;
} = {
  teacher: (type, data) => <TeacherForm type={type} data={data} />,
  student: (type, data) => <StudentForm type={type} data={data} />,
};

const FormModal = ({
  table,
  type,
  data,
  id,
}: {
  table:
    | "teacher"
    | "student"
    | "parent"
    | "subject"
    | "class"
    | "lesson"
    | "exam"
    | "assignment"
    | "result"
    | "attendance"
    | "event"
    | "announcement";
  type: "create" | "update" | "delete";
  data?: any;
  id?: number;
}) => {
  const size = type === "create" ? "w-8 h-8" : "w-7 h-7";
  const bgColor = type === "create" ? "bg-green-500" : "bg-blue-300";

  const [open, setOpen] = useState(false);

  // Seul le modal de teacher est afficher, il y'a certainement une erreur dans la condition
  const Form = () => {
    return type === "delete" && id ? (
      <form className="p-6 flex flex-col gap-6">
        <p className="text-center text-gray-700 font-medium">
          Voulez-vous vraiment supprimer cet élément de la liste ?
        </p>
        <div className="flex justify-center gap-4">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="bg-gray-300 hover:bg-gray-400 text-black py-2 px-4 rounded-md cursor-pointer"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md cursor-pointer"
          >
            Supprimer
          </button>
        </div>
      </form>
    ) : type === "create" || type === "update" ? (
      forms[table](type, data)
    ) : (
      "Formulaire introuvable"
    );
  };

  return (
    <>
      <button
        className={`${size} flex items-center justify-center rounded-full cursor-pointer ${bgColor}`}
        onClick={() => setOpen(true)}
      >
        <Image src={`/${type}.png`} alt="" width={16} height={16} />
      </button>
      {open && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded-md relative w-[90%] md:w-[70%] lg:w-[60%] xl:w-[50%] 2xl:w-[40%]">
            <Form />
            <div
              className="absolute top-4 right-4 cursor-pointer"
              onClick={() => setOpen(false)}
            >
              <Image src="/close.png" alt="" width={14} height={14} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FormModal;
