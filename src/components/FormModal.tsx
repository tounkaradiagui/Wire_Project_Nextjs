"use client";

import dynamic from "next/dynamic";
import {
  useState,
  Dispatch,
  SetStateAction,
  useEffect,
  useActionState,
} from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { deleteSession, deleteEvent, deleteAnnouncement, deleteAttendance, deleteResult, deleteAssignment, deleteLesson, deleteTeacher, deleteClass, deleteSubject, deleteStudent, deleteExam, deleteParent } from "@/lib/actions";
import { FormContainerProps } from "./FormContainer";
import {
  Plus,
  Pencil,
  Trash2,
  X,
} from "lucide-react";

// Mapping des actions de suppression pour chaque type d'entité, utilisé dans les formulaires de suppression
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
  attendance: deleteAttendance,
  announcement: deleteAnnouncement,
  event: deleteEvent,
  session: deleteSession,
};

// Import dynamique des formulaires pour éviter de charger tous les composants de formulaire à la fois, ce qui améliore les performances et réduit le temps de chargement initial de la page
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

const AttendanceForm = dynamic(() => import("./forms/AttendanceForm"), {
  loading: () => <h1>Chargement...</h1>,
});

const AnnouncementForm = dynamic(() => import("./forms/AnnouncementForm"), {
  loading: () => <h1>Chargement...</h1>,
});

const EventForm = dynamic(() => import("./forms/EventForm"), {
  loading: () => <h1>Chargement...</h1>,
});

const UserForm = dynamic(() => import("./forms/UserForm"), {
  loading: () => <h1>Chargement...</h1>,
});

const SessionForm = dynamic(() => import("./forms/SessionForm"), {
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
  // Chaque clé correspond à une table de la base de données et la valeur est une fonction qui retourne le composant 
  // de formulaire correspondant, avec les props nécessaires pour gérer l'ouverture du modal, le type d'action (création ou mise à jour), 
  // les données de l'élément à modifier (le cas échéant) et les données liées pour les listes déroulantes
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

  attendance: (setOpen, type, data, relatedData) => (
    <AttendanceForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),

  announcement: (setOpen, type, data, relatedData) => (
    < AnnouncementForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),

  event: (setOpen, type, data, relatedData) => (
    < EventForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),

  user: (setOpen, type, data, relatedData) => (
    <UserForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),

  session: (setOpen, type, data, relatedData) => (
    <SessionForm
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

  // État local pour gérer l'ouverture du modal, utilisé pour afficher ou masquer le formulaire en fonction de l'action de l'utilisateur (création, mise à jour ou suppression)
  const [open, setOpen] = useState(false);

  // Composant de formulaire à afficher dans le modal, déterminé dynamiquement en fonction de la table ciblée du type d'action (supprimé)
  const Form = () => {
    const action = deleteActionMap[table as keyof typeof deleteActionMap];
    const [state, formAction, isPending] = useActionState(action as any, {
      success: false,
      error: false,
    } as any);

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
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 cursor-pointer px-4 rounded-md transition"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isPending}
            className={`
              py-2 px-4 rounded-md text-white font-medium transition-all cursor-pointer
              ${isPending
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-red-600 hover:bg-red-700 active:scale-95"}
            `}
          >
            {isPending ? "Chargement..." : "Supprimer"}
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
        onClick={() => setOpen(true)}
        className={`
          ${size}
          flex items-center justify-center rounded
          text-white transition-all cursor-pointer
          ${type === "create" && "bg-green-500 hover:bg-green-600"}
          ${type === "update" && "bg-blue-500 hover:bg-blue-600"}
          ${type === "delete" && "bg-red-500 hover:bg-red-600"}
        `}
      >
        {type === "create" && <Plus size={18} />}
        {type === "update" && <Pencil size={16} />}
        {type === "delete" && <Trash2 size={16} />}
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded-md relative w-[90%] md:w-[70%] lg:w-[60%] xl:w-[50%] 2xl:w-[40%]">
            <Form />
            <div
              className="absolute top-4 right-4 cursor-pointer"
              onClick={() => setOpen(false)}
            >
              <X
                size={18}
                className="text-gray-500 hover:text-gray-800 transition"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FormModal;
