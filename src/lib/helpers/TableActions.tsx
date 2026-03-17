"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Filter, ArrowUpDown } from "lucide-react";

const TableActions = () => {
    const router = useRouter();
    const searchParams = useSearchParams();

    // helper pour garder les params existants
    const updateParams = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set(key, value);
        router.push(`?${params.toString()}`);
    };

    // toggle sort
    const handleSort = () => {
        const currentOrder = searchParams.get("sortOrder") || "desc";
        const newOrder = currentOrder === "asc" ? "desc" : "asc";

        updateParams("sortBy", "name");
        updateParams("sortOrder", newOrder);
    };

    // Filtre simple
    const handleFilter = () => {
        updateParams("sex", "MALE");
        updateParams("classId", "2");
        updateParams("gradeId", "1");
    };

    return (
        <div className="flex items-center gap-4">
            <button
                onClick={handleFilter}
                className="flex items-center gap-1 px-3 py-1.5 rounded-md
        bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
            >
                <Filter size={16} />
                <span className="text-sm">Filtrer</span>
            </button>

            <button
                onClick={handleSort}
                className="flex items-center gap-1 px-3 py-1.5 rounded-md
        bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
            >
                <ArrowUpDown size={16} />
                <span className="text-sm">Trier</span>
            </button>
        </div>
    );
};

export default TableActions;