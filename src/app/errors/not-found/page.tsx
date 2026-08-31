"use client";

import Link from "next/link";
import { SearchX } from "lucide-react";

const NotFoundPage = () => {
    return (
        <div className="h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
            <div className="bg-yellow-100 p-4 rounded-full mb-4">
                <SearchX className="text-yellow-600" size={40} />
            </div>
            <h1 className="text-2xl font-semibold text-gray-800">
                Page introuvable
            </h1>
            <p className="text-gray-500 mt-2 max-w-md">
                La page que vous cherchez n'existe pas ou a été déplacée.
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

export default NotFoundPage;