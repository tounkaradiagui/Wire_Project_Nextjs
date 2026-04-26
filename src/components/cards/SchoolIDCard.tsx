"use client";

import { useState, useRef } from "react";
import QRCode from "react-qr-code";
import * as htmlToImage from "html-to-image";
import { createRoot } from "react-dom/client";
import jsPDF from "jspdf";

// Définition du type Student 
interface Student {
    id: string;
    verificationToken: string;
    cardNumber: string;
    nom: string;
    prenom: string;
    sexe: string;
    naissance: string;
    validite: string;
    adresse: string;
    rue: string;
    classe: string;
    ecole: string;
    telephone: string;
    email: string;
    photo?: string;
    schoolYear: string
}

export default function SchoolIDCard({ student }: { student: Student }) {
    const [flipped, setFlipped] = useState(false);
    const secureUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify/${student.verificationToken}`;
    const cardRef = useRef<HTMLDivElement>(null);

    // Composant pour export
    const CardExport = ({
        student,
        side,
    }: {
        student: Student;
        side: "front" | "back";
    }) => {
        if (side === "back") {
            return (
                <div
                    className="w-195 h-87.5 text-white p-6 relative flex flex-col justify-between rounded-2xl shadow-xl"
                    style={{ backgroundColor: "#1D4ED8" }} // Bleu fixe pour export
                >
                    {/* Header */}
                    <div className="text-center">
                        <p className="text-lg font-bold">République du Mali</p>
                        <p className="text-sm">Un Peuple - Un But - Une Foi</p>
                    </div>

                    {/* Middle: Map - School Info - QR */}
                    <div className="flex justify-between items-center flex-1 mt-4 mb-4">
                        <div className="w-40 h-28 bg-white rounded-md overflow-hidden flex items-center justify-center">
                            <img
                                src="/mali-map-flag.png"
                                className="w-full h-full object-contain"
                                alt="Carte du Mali"
                            />
                        </div>

                        <div className="flex-1 text-center text-white mx-4">
                            <p className="font-semibold">{student.ecole}</p>
                            <p>Bamako / Niamakoro Cité Unicef</p>
                            <p>Tel: {student.telephone}</p>
                            <p>Email: {student.email}</p>
                        </div>

                        <div className="bg-white p-3 rounded">
                            <QRCode value={secureUrl} size={80} />
                        </div>
                    </div>

                </div>
            );
        }

        // FRONT
        return (
            <div className="w-195 h-87.5 flex shadow-xl overflow-hidden">
                {/* LEFT */}
                <div className="w-[40%] bg-linear-to-b from-blue-600 to-purple-700 text-white p-4 flex flex-col justify-between">
                    <div className="text-sm font-semibold text-start">
                        {student.ecole}
                        <br />
                        <span className="text-xs opacity-80">Carte d'identité scolaire</span>
                    </div>

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
                            <p className="font-semibold">{student.schoolYear}</p>
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
        );
    };

    // Télechargement de la carte (recto ou verso) en format PNG
    const downloadCard = async () => {
        const container = document.createElement("div");
        document.body.appendChild(container);

        const root = createRoot(container);
        root.render(<CardExport student={student} side={flipped ? "back" : "front"} />);

        await new Promise((r) => setTimeout(r, 300));

        const node = container.firstChild as HTMLElement;

        const dataUrl = await htmlToImage.toPng(node, {
            pixelRatio: 3,
            backgroundColor: flipped ? "#1D4ED8" : "white",
        });

        const link = document.createElement("a");
        link.download = `carte-${student.nom}-${flipped ? "verso" : "recto"}.png`;
        link.href = dataUrl;
        link.click();

        root.unmount();
        document.body.removeChild(container);
    };

    // Téléchargement de la carte en format PDF (recto + verso)
    const downloadPDF = async () => {
        const container = document.createElement("div");
        document.body.appendChild(container);

        const root = createRoot(container);

        // FRONT
        root.render(<CardExport student={student} side="front" />);
        await new Promise((r) => setTimeout(r, 300));

        const frontNode = container.firstChild as HTMLElement;

        const frontImg = await htmlToImage.toPng(frontNode, {
            pixelRatio: 3,
            backgroundColor: "white",
        });

        // BACK
        root.render(<CardExport student={student} side="back" />);
        await new Promise((r) => setTimeout(r, 300));

        const backNode = container.firstChild as HTMLElement;

        const backImg = await htmlToImage.toPng(backNode, {
            pixelRatio: 3,
            backgroundColor: "#1D4ED8",
        });

        // PDF A4
        const pdf = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4",
        });

        // Dimensions carte (ratio respecté)
        const cardWidth = 85.6; // mm
        const cardHeight = (300 / 780) * cardWidth;

        // Centrage horizontal
        const x = (210 - cardWidth) / 2;

        // RECTO (haut)
        pdf.addImage(frontImg, "PNG", x, 30, cardWidth, cardHeight);

        // VERSO (bas)
        pdf.addImage(backImg, "PNG", x, 160, cardWidth, cardHeight);

        pdf.save(`carte-${student.nom}.pdf`);

        root.unmount();
        document.body.removeChild(container);
    };

    return (
        <div className="flex flex-col items-center gap-4 p-6">
            {/* Carte avec flip */}
            <div
                className="w-195 h-87.5 perspective cursor-pointer"
                onClick={() => setFlipped(!flipped)}
            >
                <div
                    className={`relative w-full h-full transition-transform duration-700 transform-style-preserve-3d ${flipped ? "rotate-y-180" : ""
                        }`}
                >
                    {/* FRONT */}
                    <div className="absolute w-full h-full backface-hidden">
                        <CardExport student={student} side="front" />
                    </div>

                    {/* BACK */}
                    <div className="absolute w-full h-full backface-hidden rotate-y-180">
                        <CardExport student={student} side="back" />
                    </div>
                </div>
            </div>

            <p className="text-xs text-gray-500">Cliquez sur la carte pour la retourner</p>
            <div className="flex gap-3">
                {/* PNG */}
                <button
                    onClick={downloadCard}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                    📥 Télécharger ({flipped ? "verso" : "recto"}) Image
                </button>

                {/* PDF */}
                <button
                    onClick={downloadPDF}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                >
                    📄 Recto / Verso PDF
                </button>
            </div>
        </div>
    );
}