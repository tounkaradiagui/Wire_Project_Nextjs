"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Filter } from "lucide-react";

const UserFiltersModal = () => {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [open, setOpen] = useState(false);

    const [role, setRole] = useState(searchParams.get("role") || "");
    const [status, setStatus] = useState(searchParams.get("status") || "");
    const [date, setDate] = useState(searchParams.get("date") || "");

    const applyFilters = () => {
        const params = new URLSearchParams(searchParams.toString());

        if (role) params.set("role", role);
        else params.delete("role");

        if (status) params.set("status", status);
        else params.delete("status");

        if (date) params.set("date", date);
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
            {/* BUTTON */}
            <button
                onClick={() => setOpen(true)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 transition cursor-pointer"
            >
                <Filter size={16} />
                <span className="text-sm">Filtrer</span>
            </button>

            {/* MODAL */}
            {open && (
                <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-xl w-80 space-y-4">

                        <h2 className="font-semibold">Filtres utilisateurs</h2>

                        {/* ROLE */}
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="w-full border p-2 rounded"
                        >
                            <option value="">Tous les rôles</option>
                            <option value="ADMIN">Administrateur</option>
                            <option value="TEACHER">Enseignant</option>
                            <option value="PARENT">Parent</option>
                            <option value="STUDENT">Élève</option>
                        </select>

                        {/* STATUS */}
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="w-full border p-2 rounded"
                        >
                            <option value="">Tous les statuts</option>
                            <option value="active">Actif</option>
                            <option value="banned">Banni</option>
                        </select>

                        {/* DATE */}
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full border p-2 rounded"
                        />

                        {/* ACTIONS */}
                        <div className="flex justify-between">
                            <button
                                onClick={resetFilters}
                                className="text-red-500 cursor-pointer text-sm"
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

export default UserFiltersModal;