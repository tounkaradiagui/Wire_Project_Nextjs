"use client";

import { useState } from "react";
import QRCode from "react-qr-code";
import { useRef } from "react";
import * as htmlToImage from "html-to-image";

interface Student {
    id: string;
    verificationToken: string;
    cardNumber: string;
    nom: string;
    prenom: string;
    sexe: string;
    naissance: any;
    validite: string;
    adresse: string;
    rue: string;
    classe: any;
    ecole: string;
    telephone: string;
    email: string;
    photo?: string;
}

export default function SchoolIDCard({ student }: { student: Student }) {
    const [flipped, setFlipped] = useState(false);
    const secureUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify/${student.verificationToken}`;
    // console.log(student.verificationToken);

    const cardRef = useRef<HTMLDivElement>(null);
    const downloadCard = async () => {
        if (!cardRef.current) return;

        const dataUrl = await htmlToImage.toPng(cardRef.current, {
            quality: 1,
            pixelRatio: 2, // meilleure qualité
        });

        const link = document.createElement("a");
        link.download = `carte-${student.nom}-${student.prenom}.png`;
        link.href = dataUrl;
        link.click();
    };

    return (
        <div className="flex flex-col items-center gap-4 p-6">
            <div
                ref={cardRef}
                className="w-195 h-75 perspective cursor-pointer"
                onClick={() => setFlipped(!flipped)}
            >
                <div
                    className={`relative w-full h-full transition-transform duration-700 transform-style-preserve-3d
                         ${flipped ? "rotate-y-180" : ""}`}
                >
                    {/* FRONT */}
                    <div className="absolute w-full h-full backface-hidden rounded-2xl shadow-xl overflow-hidden flex">

                        {/* LEFT (BLUE DESIGN) */}
                        <div className="w-[40%] bg-linear-to-b from-blue-600 to-purple-700 text-white p-4 flex flex-col justify-between">
                            <div className="text-sm font-semibold text-start">
                                {student.ecole}
                                <br />
                                <span className="text-xs opacity-80">Carte d'identité scolaire</span>
                            </div>

                            {/* PHOTO ID STYLE (RECTANGULAIRE) */}
                            <div className="flex justify-center">
                                <div className="w-32 h-40 bg-white rounded-md overflow-hidden border-2 border-white">
                                    {student.photo && (
                                        <img
                                            src={student.photo}
                                            alt="student"
                                            className="w-full h-full object-cover"
                                        />
                                    )}
                                </div>
                            </div>

                            <p className="font-semibold">ID: {student.cardNumber}</p>
                            <div className="bg-white/20 px-3 py-2 rounded-lg text-xs">
                                <p className="opacity-70">Adresse</p>
                                <p className="font-semibold">{student.adresse}</p>
                            </div>
                        </div>

                        {/* RIGHT (INFOS) */}
                        <div className="flex-1 bg-gray-50 p-6 text-gray-800">
                            <div className="flex justify-between text-sm mb-4">
                                <div>
                                    <p className="text-gray-500">Année académique</p>
                                    <p className="font-semibold">2026-2027</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-gray-500">Valide jusqu'au</p>
                                    <p className="font-semibold">{student.validite}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-500">Nom</p>
                                    <p className="font-medium">{student.nom}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Prénom</p>
                                    <p className="font-medium">{student.prenom}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Sexe</p>
                                    <p>{student.sexe === "MALE" ? "M" : "F"}</p>
                                </div>

                                <div>
                                    <p className="text-gray-500">Date de naissance</p>
                                    <p>{student.naissance}</p>
                                </div>

                                <div>
                                    <p className="text-gray-500">Téléphone</p>
                                    <p>{student.telephone}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Classe</p>
                                    <p>{student.classe}</p>
                                </div>
                            </div>

                            <div className="flex items-end justify-end mt-6">
                                <div className="text-right text-xs">
                                    <div className="border-t w-32 mb-1"></div>
                                    <p>Signature du Directeur</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* BACK */}
                    <div className="absolute w-full h-full backface-hidden rotate-y-180 bg-blue-600 text-white rounded-2xl shadow-xl p-6">
                        <div className="text-center text-lg font-semibold">
                            République du Mali
                        </div>
                        <div className="text-center text-sm mt-1">
                            Un Peuple - Un But - Une Foi
                        </div>

                        <div className="mt-6 flex justify-between">
                            <div className="flex items-center justify-center w-40 h-28 bg-white rounded-md overflow-hidden">
                                <img
                                    src="/mali-map-flag.png"
                                    alt="Carte du Mali"
                                    className="w-full h-full object-contain"
                                />
                            </div>
                            <div className="absolute bottom-4 left-6 text-xs text-white">
                                <p>{student.ecole}</p>
                                <p>Bamako / Niamakoro Cité Unicef - Rive Droite</p>
                                <p>Tel: +223 76292270 / Email: bianson@gmail.com</p>
                            </div>

                            <div className="bg-white p-3 rounded">
                                <QRCode value={secureUrl} size={80} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <p className="text-xs text-gray-500">Clique sur la carte pour la retourner</p>

            <button
                onClick={downloadCard}
                className="bg-blue-600 text-white cursor-pointer px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
                📥 Télécharger la carte
            </button>
        </div>
    );
}


