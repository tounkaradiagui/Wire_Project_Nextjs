"use client";

import Link from "next/link";
import { ServerCrash, RefreshCcw } from "lucide-react";

const ServerErrorPage = () => {
    return (
        <div className="h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
            <div className="bg-orange-100 p-4 rounded-full mb-4">
                <ServerCrash className="text-orange-600" size={40} />
            </div>
            <h1 className="text-2xl font-semibold text-gray-800">
                Erreur serveur
            </h1>
            <p className="text-gray-500 mt-2 max-w-md">
                Une erreur inattendue s'est produite. Notre équipe a été notifiée.
                Réessayez dans quelques instants.
            </p>
            <div className="flex gap-4 mt-6">
                <button
                    onClick={() => window.location.reload()}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                    <RefreshCcw size={16} />
                    Réessayer
                </button>
                <Link
                    href="/"
                    className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                    Retour à l'accueil
                </Link>
            </div>
        </div>
    );
};

export default ServerErrorPage;