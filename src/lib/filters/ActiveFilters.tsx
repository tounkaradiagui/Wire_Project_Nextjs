"use client";

import { useSearchParams } from "next/navigation";

interface Props {
    classes?: { id: number; name: string }[];
    grades?: { id: number; level: number }[];
    subjects?: { id: number; name: string }[];
    lessons?: { id: number; name: string }[];
    sessions?: {id: string; date?: Date; lesson?: { name?: string };}[];
    teachers?: { id: string; name: string; surname?: string }[];
    students?: { id: string; name: string; surname?: string }[];
    parents?: { id: string; name: string; surname?: string }[];
    admins?: { id: string; name: string; surname?: string }[];
}

const ActiveFilters = ({
    classes = [],
    sessions = [],
    grades = [],
    subjects = [],
    lessons = [],
    teachers = [],
    students = [],
    parents = [],
    admins = [],
}: Props) => {
    const searchParams = useSearchParams();

    const filters = [
        { key: "classId", label: "Classe" },
        { key: "gradeId", label: "Niveau" },
        { key: "subjectId", label: "Matière" },
        { key: "lessonId", label: "Cours" },
        { key: "sessionId", label: "Séance" },
        { key: "sex", label: "Genre" },
        { key: "teacherId", label: "Enseignant" },
        { key: "studentId", label: "Elève" },
        { key: "parentId", label: "Parent" },
        { key: "adminId", label: "Administrateur" },
        { key: "status", label: "Statut" },
        { key: "date", label: "Date" },
        { key: "studentName", label: "Élève" },
        { key: "type", label: "Type" },
        { key: "minScore", label: "Score min" },
        { key: "maxScore", label: "Score max" },
    ];

    const getDisplayValue = (key: string, value: string) => {
        switch (key) {
            /* ================= SEX ================= */
            case "sex":
                return value === "MALE"
                    ? "Masculin"
                    : value === "FEMALE"
                        ? "Féminin"
                        : value;

            /* ================= Users ================= */
            case "role":
                return value === "ADMIN"
                    ? "Administrateur"
                    : value === "TEACHER"
                        ? "Enseignant"
                        : value === "PARENT"
                            ? "Parent"
                            : value === "STUDENT"
                                ? "Élève"
                                : value;

            /* ================= STATUS ================= */
            case "status":
                // 🔥 gérer les 2 cas : attendance + lesson
                switch (value) {
                    case "ABSENT":
                        return "Absent";
                    case "LATE":
                        return "En retard";
                    case "PRESENT":
                        return "Présent";
                    case "finished":
                        return "Cours terminé";
                    case "upcoming":
                        return "À venir";
                    case "active":
                        return "Actif";
                    case "banned":
                        return "Banni";
                    default:
                        return value;
                }

            /* ================= RELATIONS ================= */
            case "classId":
                return (
                    classes.find((c) => c.id === Number(value))?.name ||
                    "Classe inconnue"
                );

            case "gradeId":
                return (
                    grades.find((g) => g.id === Number(value))?.level ||
                    "Niveau inconnu"
                );

            case "subjectId":
                return (
                    subjects.find((s) => s.id === Number(value))?.name ||
                    "Matière inconnue"
                );

            case "lessonId":
                return (
                    lessons.find((l) => l.id === Number(value))?.name ||
                    "Cours inconnu"
                );
                      
           
            case "sessionId": {
                const session = sessions.find((s) => s.id === value);

                if (!session) return "Séance inconnue";

                return `${session?.date
                    ? new Date(session?.date).toLocaleDateString("fr-FR")
                    : "Date inconnue"} - ${session?.lesson?.name ?? "Cours inconnu"}`;
            }
            
            case "teacherId": {
                const teacher = teachers.find((t) => t.id === value);
                return teacher
                    ? `${teacher.name} ${teacher.surname ?? ""}`
                    : `ID: ${value}`;
            }
            case "studentId": {
                const student = students.find((s) => s.id === value);
                return student
                    ? `${student.name} ${student.surname ?? ""}`
                    : `ID: ${value}`;
            }
            case "parentId": {
                const parent = parents.find((p) => p.id === value);
                return parent
                    ? `${parent.name} ${parent.surname ?? ""}`
                    : `ID: ${value}`;
            }
            case "adminId": {
                const admin = admins.find((a) => a.id === value);
                return admin
                    ? `${admin.name} ${admin.surname ?? ""}`
                    : `ID: ${value}`;
            }

            /* ================= TYPE ================= */
            case "type":
                return value === "Exam"
                    ? "Examen"
                    : value === "Assignment"
                        ? "Devoir"
                        : value;

            /* ================= DATE ================= */
            case "date":
                return new Date(value).toLocaleDateString("fr-FR");

            default:
                return value;
        }
    };

    return (
        <div className="flex gap-2 flex-wrap mt-2" >
            {
                filters.map((f) => {
                    const value = searchParams.get(f.key);
                    if (!value) return null;

                    return (
                        <span
                            key={f.key}
                            className={`px-2 py-1 rounded text-xs
                            ${f.key === "status"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-blue-100 text-blue-700"
                                }
                            `
                            }
                        >
                            {f.label}: {getDisplayValue(f.key, value)}
                        </span>
                    );
                })
            }
        </div >
    );
};

export default ActiveFilters;