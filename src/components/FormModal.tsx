"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import {
  useState,
  Dispatch,
  SetStateAction,
  useEffect,
  useActionState,
} from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { deleteResult, deleteAssignment, deleteLesson, deleteTeacher, deleteClass, deleteSubject, deleteStudent, deleteExam, deleteParent } from "@/lib/actions";
import { FormContainerProps } from "./FormContainer";

const deleteActionMap = {
  subject: deleteSubject,
  teacher: deleteTeacher,
  student: deleteStudent,
  class: deleteClass,
  exam: deleteExam,
  parent: deleteParent,
  lesson: deleteLesson,
  assignment: deleteAssignment,
  result: deleteResult,
  // announcement: deleteAnnouncement,
  // attendance: deleteAttendance,
  // event: deleteEvent,
  // student: deleteStudent,
};

const TeacherForm = dynamic(() => import("./forms/TeacherForm"), {
  loading: () => <h1>Chargement...</h1>,
});

const StudentForm = dynamic(() => import("./forms/StudentForm"), {
  loading: () => <h1>Chargement...</h1>,
});

const SubjectForm = dynamic(() => import("./forms/SubjectForm"), {
  loading: () => <h1>Chargement...</h1>,
});

const ClassForm = dynamic(() => import("./forms/ClassForm"), {
  loading: () => <h1>Chargement...</h1>,
});

const ExamForm = dynamic(() => import("./forms/ExamForm"), {
  loading: () => <h1>Chargement...</h1>,
});

const ParentForm = dynamic(() => import("./forms/ParentForm"), {
  loading: () => <h1>Chargement...</h1>,
});

const LessonForm = dynamic(() => import("./forms/LessonForm"), {
  loading: () => <h1>Chargement...</h1>,
});

const AssignmentForm = dynamic(() => import("./forms/AssignmentForm"), {
  loading: () => <h1>Chargement...</h1>,
});

const ResultForm = dynamic(() => import("./forms/ResultForm"), {
  loading: () => <h1>Chargement...</h1>,
});

const forms: {
  [key: string]: (
    setOpen: Dispatch<SetStateAction<boolean>>,
    type: "create" | "update",
    data?: any,
    relatedData?: any
  ) => React.JSX.Element;
} = {
  subject: (setOpen, type, data, relatedData) => (
    <SubjectForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  class: (setOpen, type, data, relatedData) => (
    <ClassForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  teacher: (setOpen, type, data, relatedData) => (
    <TeacherForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  student: (setOpen, type, data, relatedData) => (
    <StudentForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  parent: (setOpen, type, data, relatedData) => (
    <ParentForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),

  exam: (setOpen, type, data, relatedData) => (
    <ExamForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),

  lesson: (setOpen, type, data, relatedData) => (
    <LessonForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),

  assignment: (setOpen, type, data, relatedData) => (
    <AssignmentForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),

  result: (setOpen, type, data, relatedData) => (
    <ResultForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
};

const FormModal = ({
  table,
  type,
  data,
  id,
  relatedData,
}: FormContainerProps & { relatedData?: any }) => {
  const size = type === "create" ? "w-8 h-8" : "w-7 h-7";
  const bgColor = type === "create" ? "bg-green-500" : "bg-blue-300";

  const [open, setOpen] = useState(false);

  const Form = () => {
    const [state, formAction, isPending] = useActionState(deleteActionMap[table], {
      success: false,
      error: false,
    });

    const router = useRouter();

    useEffect(() => {
      if (state.success) {
        toast.success(`Elément supprimé avec succès" !`, {
          style: {
            background: "dark",
            color: "#ffffff",
            fontWeight: "bold",
            fontSize: "14px",
          },
        });
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

    return type === "delete" && id ? (
      <form action={formAction} className="p-6 flex flex-col gap-6">
        <input type="text | number" defaultValue={id} name="id" hidden />
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
            disabled={isPending}
            className={`"bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md cursor-pointer
                    ${isPending
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-red-600 hover:bg-red-700 cursor-pointer"}
                    `}
          >
            {isPending
              ? "Chargement..."
              : type === "delete"
                ? "Supprimer"
                : "Suppression"}
          </button>

        </div>
      </form>
    ) : type === "create" || type === "update" ? (
      forms[table](setOpen, type, data, relatedData)
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
