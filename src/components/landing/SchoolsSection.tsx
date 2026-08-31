import Link from "next/link";
import { School } from "@prisma/client";
import SchoolCard from "./SchoolCard";

type SchoolsSectionProps = {
    schools: School[];
};

export default function SchoolsSection({
    schools,
}: SchoolsSectionProps) {
    const preview = schools.slice(0, 6);

    return (
        <section id="ecoles" className="bg-white py-16 sm:py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-12 flex flex-col items-center text-center">
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#1B5FC1]">
                        Écoles partenaires
                    </span>

                    <h2 className="mt-2 text-3xl font-extrabold text-[#0F2D56] sm:text-4xl">
                        Découvrez nos écoles partenaires
                    </h2>

                    <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                        Des établissements qui utilisent Wagadu School pour gérer leurs
                        élèves, enseignants, emplois du temps, notes et bien plus encore.
                    </p>
                </div>

                {/* Empty State */}
                {schools.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 py-16 text-center">
                        <h3 className="text-lg font-semibold text-slate-700">
                            Aucune école disponible
                        </h3>

                        <p className="mt-2 text-sm text-slate-500">
                            Les écoles partenaires apparaîtront ici dès leur validation.
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Liste */}
                        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
                            {preview.map((school) => (
                                <SchoolCard
                                    key={school.id}
                                    school={school}
                                />
                            ))}
                        </div>

                        {/* Voir toutes */}
                        {schools.length > 6 && (
                            <div className="mt-12 flex justify-center">
                                <Link
                                    href="/ecoles"
                                    className="rounded-xl border border-[#1B5FC1] px-6 py-3 text-sm font-semibold text-[#1B5FC1] transition hover:bg-[#1B5FC1] hover:text-white"
                                >
                                    Voir toutes les écoles ({schools.length})
                                </Link>
                            </div>
                        )}
                    </>
                )}
            </div>
        </section>
    );
}