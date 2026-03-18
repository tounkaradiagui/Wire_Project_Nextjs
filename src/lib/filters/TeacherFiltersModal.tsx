"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Filter } from "lucide-react";


const TeacherFiltersModal = ({ classes, subjects }: any) => {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [open, setOpen] = useState(false);

    const [classId, setClassId] = useState(searchParams.get("classId") || "");
    const [subjectId, setSubjectId] = useState(searchParams.get("subjectId") || "");
    const [sex, setSex] = useState(searchParams.get("sex") || "");

    const applyFilters = () => {
        const params = new URLSearchParams(searchParams.toString());

        if (classId) {
            params.set("classId", classId);
        } else {
            params.delete("classId");
        }
        if (subjectId) {
            params.set("subjectId", subjectId);
        } else {
            params.delete("subjectId");
        }
        if (sex) {
            params.set("sex", sex);
        } else {
            params.delete("sex");
        }

        params.set("page", "1");

        router.push(`?${params.toString()}`);
        setOpen(false);
    };

    const resetFilters = () => {
        const params = new URLSearchParams(searchParams.toString());

        params.delete("classId");
        params.delete("subjectId");
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
                    <div className="bg-white p-6 rounded-xl w-87.5 space-y-4">

                        <h2 className="font-semibold">Filtres enseignants</h2>

                        {/* Classe */}
                        <select
                            value={classId}
                            onChange={(e) => setClassId(e.target.value)}
                            className="w-full border p-2 rounded"
                        >
                            <option value="">Toutes les classes</option>
                            {classes.map((c: any) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>

                        {/* Matière */}
                        <select
                            value={subjectId}
                            onChange={(e) => setSubjectId(e.target.value)}
                            className="w-full border p-2 rounded"
                        >
                            <option value="">Toutes les matières</option>
                            {subjects.map((s: any) => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>

                        {/* Genre */}
                        <select
                            value={sex}
                            onChange={(e) => setSex(e.target.value)}
                            className="w-full border p-2 rounded"
                        >
                            <option value="">Tous</option>
                            <option value="MALE">Masculin</option>
                            <option value="FEMALE">Féminin</option>
                        </select>

                        <div className="flex justify-between">
                            <button onClick={resetFilters} className="text-red-500 text-sm cursor-pointer">
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

export default TeacherFiltersModal;