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
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 flex flex-col items-center gap-2 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-[#1B5FC1] sm:text-sm">
            Écoles partenaires
          </span>

          <h2 className="text-2xl font-extrabold tracking-tight text-[#0F2D56] sm:text-3xl">
            Nos écoles partenaires
          </h2>

          <p className="max-w-xl text-sm text-slate-600 sm:text-base">
            Des établissements qui font confiance à Wagadu pour leur gestion
            au quotidien.
          </p>
        </div>

        {/* Liste des écoles */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {preview.map((school) => (
            <SchoolCard
              key={school.id}
              school={school}
            />
          ))}
        </div>

        {/* Bouton voir toutes */}
        {schools.length > 6 && (
          <div className="mt-10 text-center">
            <Link
              href="/ecoles"
              className="inline-flex items-center gap-1 rounded-lg border border-[#1B5FC1] px-5 py-2.5 text-sm font-semibold text-[#1B5FC1] transition hover:bg-[#1B5FC1]/5"
            >
              Voir toutes les écoles →
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}