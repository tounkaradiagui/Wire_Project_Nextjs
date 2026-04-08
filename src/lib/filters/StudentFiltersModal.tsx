"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Filter } from "lucide-react";


interface Props {
    classes: { id: number; name: string }[];
    grades: { id: number; level: number }[];
}

const FiltersModal = ({ classes, grades }: Props) => {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [open, setOpen] = useState(false);

    const [classId, setClassId] = useState(searchParams.get("classId") || "");
    const [gradeId, setGradeId] = useState(searchParams.get("gradeId") || "");
    const [sex, setSex] = useState(searchParams.get("sex") || "");

    const applyFilters = () => {
        const params = new URLSearchParams(searchParams.toString());

        if (classId) {
            params.set("classId", classId);
        } else {
            params.delete("classId");
        }
        if (gradeId) {
            params.set("gradeId", gradeId);
        } else {
            params.delete("gradeId");
        }
        if (sex) {
            params.set("sex", sex);
        } else {
            params.delete("sex");
        }

        params.set("page", "1"); // reset pagination

        router.push(`?${params.toString()}`);
        setOpen(false);
    };

    const resetFilters = () => {
        const params = new URLSearchParams(searchParams.toString());

        params.delete("classId");
        params.delete("gradeId");
        params.delete("sex");

        router.push(`?${params.toString()}`);
        setOpen(false);
    };

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-md
                bg-gray-100 hover:bg-gray-200 text-gray-700 transition cursor-pointer"
            >
                <Filter size={16} />
                <span className="text-sm">Filtrer</span>
            </button>

            {open && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-87.5 space-y-4 shadow-lg">
                        <h2 className="text-lg font-semibold">Filtres</h2>

                        {/* Classe */}
                        <select
                            value={classId}
                            onChange={(e) => setClassId(e.target.value)}
                            className="w-full border p-2 rounded"
                        >
                            <option value="">Toutes les classes</option>
                            {classes?.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>

                        {/* Niveau */}
                        <select
                            value={gradeId}
                            onChange={(e) => setGradeId(e.target.value)}
                            className="w-full border p-2 rounded"
                        >
                            <option value="">Tous les niveaux</option>
                            {grades?.map((g) => (
                                <option key={g.id} value={g.id}>
                                    Niveau {g.level}
                                </option>
                            ))}
                        </select>

                        {/* Genre */}
                        <select
                            value={sex}
                            onChange={(e) => setSex(e.target.value)}
                            className="w-full border p-2 rounded"
                        >
                            <option value="">Tous</option>
                            <option value="MALE">Garçon</option>
                            <option value="FEMALE">Fille</option>
                        </select>

                        {/* Actions */}
                        <div className="flex justify-between">
                            <button
                                onClick={resetFilters}
                                className="text-sm text-red-500 cursor-pointer"
                            >
                                Reset
                            </button>

                            <button
                                onClick={applyFilters}
                                className="bg-blue-500 text-white px-4 py-2 rounded cursor-pointer"
                            >
                                Appliquer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default FiltersModal;