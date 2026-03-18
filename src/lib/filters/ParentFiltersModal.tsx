"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Filter } from "lucide-react";

const ParentFiltersModal = ({ classes }: any) => {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [open, setOpen] = useState(false);

    const [classId, setClassId] = useState(searchParams.get("classId") || "");
    const [sex, setSex] = useState(searchParams.get("sex") || "");
    const [studentName, setStudentName] = useState(searchParams.get("studentName") || "");

    const applyFilters = () => {
        const params = new URLSearchParams(searchParams.toString());

        if (classId) params.set("classId", classId)
        else params.delete("classId");

        if (sex) params.set("sex", sex)
        else params.delete("sex");

        if (studentName) params.set("studentName", studentName)
        else params.delete("studentName");

        params.set("page", "1");

        router.push(`?${params.toString()}`);
        setOpen(false);
    };

    const resetFilters = () => {
        router.push("?");
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

                        <h2 className="font-semibold">Filtres parents</h2>

                        {/* Classe enfant */}
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

                        {/* Nom élève */}
                        <input
                            type="text"
                            placeholder="Nom élève"
                            value={studentName}
                            onChange={(e) => setStudentName(e.target.value)}
                            className="w-full border p-2 rounded"
                        />

                        <div className="flex justify-between">
                            <button onClick={resetFilters} className="text-red-500  cursor-pointer text-sm">
                                Reset
                            </button>

                            <button
                                onClick={applyFilters}
                                className="bg-blue-500  cursor-pointer text-white px-4 py-2 rounded"
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

export default ParentFiltersModal;