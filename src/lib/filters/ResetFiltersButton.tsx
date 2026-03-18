"use client";

import { useRouter } from "next/navigation";
import { RotateCcw } from "lucide-react";

const ResetFiltersButton = () => {
    const router = useRouter();

    return (
        <button
            onClick={() => router.push("?")}
            className="flex items-center gap-1 px-3 py-1.5 rounded-md
            bg-red-50 hover:bg-red-100 text-red-600 transition cursor-pointer"
        >
            <RotateCcw size={16} />
            <span className="text-sm">Reset Filtres</span>
        </button>

    );
};

export default ResetFiltersButton;