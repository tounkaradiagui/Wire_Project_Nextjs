"use client";

import { useSearchParams } from "next/navigation";

interface Props {
    classes?: { id: number; name: string }[];
    grades?: { id: number; level: number }[];
    subjects?: { id: number; name: string }[];
    teachers?: { id: string; name: string }[];
}

const ActiveFilters = ({
    classes = [],
    grades = [],
    subjects = [],
    teachers = [],
}: Props) => {
    const searchParams = useSearchParams();

    const filters = [
        { key: "classId", label: "Classe" },
        { key: "gradeId", label: "Niveau" },
        { key: "subjectId", label: "Matière" },
        { key: "sex", label: "Genre" },
        { key: "teacherId", label: "Enseignant" },
        { key: "status", label: "Statut" },
        { key: "date", label: "Date" },
        { key: "studentName", label: "Élève" },
        { key: "type", label: "Type" },
        { key: "minScore", label: "Score min" },
        { key: "maxScore", label: "Score max" },
    ];

    const getDisplayValue = (key: string, value: string) => {
        switch (key) {
            case "sex":
                return value === "MALE"
                    ? "Masculin"
                    : value === "FEMALE"
                        ? "Féminin"
                        : value;

            case "status":
                return value === "ABSENT"
                    ? "Absent"
                    : value === "LATE"
                        ? "En retard"
                        : value === "PRESENT"
                            ? "Présent"
                            : value;

            case "classId":
                return classes.find((c) => c.id === parseInt(value))?.name || value;

            case "gradeId":
                return (
                    grades.find((g) => g.id === parseInt(value))?.level || value
                );

            case "subjectId":
                return (
                    subjects.find((s) => s.id === parseInt(value))?.name || value
                );

            case "teacherId":
                return (
                    teachers.find((t) => t.id === value)?.name || value
                );

            case "date":
                return new Date(value).toLocaleDateString("fr-FR");

            default:
                return value;
        }
    };

    return (
        <div className="flex gap-2 flex-wrap mt-2">
            {filters.map((f) => {
                const value = searchParams.get(f.key);
                if (!value) return null;

                return (
                    <span
                        key={f.key}
                        className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs"
                    >
                        {f.label}: {getDisplayValue(f.key, value)}
                    </span>
                );
            })}
        </div>
    );
};

export default ActiveFilters;