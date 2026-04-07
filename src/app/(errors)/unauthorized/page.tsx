"use client";

import Link from "next/link";
import { ShieldX } from "lucide-react";

const UnauthorizedPage = () => {
    return (
        <div className="h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
            <div className="bg-red-100 p-4 rounded-full mb-4">
                <ShieldX className="text-red-600" size={40} />
            </div>
            <h1 className="text-2xl font-semibold text-gray-800">
                Accès non autorisé
            </h1>
            <p className="text-gray-500 mt-2 max-w-md">
                Vous n'avez pas les permissions nécessaires pour accéder à cette page.
            </p>
            <div className="flex gap-4 mt-6">
                <Link
                    href="/"
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                    Retour à l'accueil
                </Link>
            </div>
        </div>
    );
};

export default UnauthorizedPage;