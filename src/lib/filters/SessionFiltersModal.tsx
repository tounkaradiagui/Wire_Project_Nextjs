"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Filter } from "lucide-react"

const SessionFiltersModal = ({
    classes,
    teachers,
    lessons,
}: any) => {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [open, setOpen] = useState(false);

    const [classId, setClassId] = useState(searchParams.get("classId") || "");
    const [teacherId, setTeacherId] = useState(searchParams.get("teacherId") || "");
    const [lessonId, setLessonId] = useState(searchParams.get("lessonId") || "");
    const [date, setDate] = useState(searchParams.get("date") || "");

    const applyFilters = () => {
        const params = new URLSearchParams(searchParams.toString());

        if (classId) params.set("classId", classId)
        else params.delete("classId");

        if (teacherId) params.set("teacherId", teacherId)
        else params.delete("teacherId");

        if (lessonId) params.set("lessonId", lessonId)
        else params.delete("lessonId");

        if (date) params.set("date", date)
        else params.delete("date");

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
                <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-xl w-87.5 space-y-4">

                        <h2 className="font-semibold">Filtres séances</h2>

                        {/* Classe */}
                        <select
                            value={classId}
                            onChange={(e) => setClassId(e.target.value)}
                            className="w-full border p-2 rounded"
                        >
                            <option value="">Toutes classes</option>
                            {classes.map((c: any) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>

                        {/* Cours */}
                        <select
                            value={lessonId}
                            onChange={(e) => setLessonId(e.target.value)}
                            className="w-full border p-2 rounded"
                        >
                            <option value="">Tous cours</option>
                            {lessons.map((l: any) => (
                                <option key={l.id} value={l.id}>{l.name}</option>
                            ))}
                        </select>

                        {/* Enseignant */}
                        <select
                            value={teacherId}
                            onChange={(e) => setTeacherId(e.target.value)}
                            className="w-full border p-2 rounded"
                        >
                            <option value="">Tous enseignants</option>
                            {teachers.map((t: any) => (
                                <option key={t.id} value={t.id}>
                                    {t.name} {t.surname}
                                </option>
                            ))}
                        </select>

                        {/* Date */}
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full border p-2 rounded"
                        />

                        <div className="flex justify-between">
                            <button onClick={resetFilters} className="text-red-500 cursor-pointer text-sm">
                                Reset
                            </button>

                            <button
                                onClick={applyFilters}
                                className="bg-blue-500 cursor-pointer text-white px-4 py-2 rounded"
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

export default SessionFiltersModal;