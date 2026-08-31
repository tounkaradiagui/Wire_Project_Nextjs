import Image from "next/image";
import Link from "next/link";
import { School } from "@prisma/client";

export default function SchoolCard({ school }: { school: School }) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      {/* Banner */}
      <div className="relative h-36 w-full bg-slate-100 sm:h-40">
        <Image
          src={school.bannerUrl ?? "/default-banner.png"}
          alt={`Bannière ${school.name}`}
          fill
          className="object-cover transition duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent" />
        {/* Logo overlapping banner */}
        <span className="absolute -bottom-6 left-4 h-14 w-14 overflow-hidden rounded-xl border-4 border-white bg-white shadow-md">
          <Image src={school.logoUrl || "/default-logo.png"} alt={`Logo ${school.name}`} fill className="object-cover" sizes="56px" />
        </span>
        <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-[#0F2D56]">
          {school.plan === "PREMIUM" ? "Premium" : "Partenaire"}
        </span>
      </div>

      {/* Body */}
      <div className="px-4 pb-5 pt-9">
        <h3 className="text-base font-bold text-[#0F2D56]">🏫 {school.name}</h3>
        <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
          📍 {school.city}, {school.country}
        </p>
        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-slate-600">
          {school.description}
        </p>
        <div className="mt-4 flex gap-4 text-xs text-slate-500">
          <span>🎓 {school.maxStudents ?? 0} élèves</span>
          <span>👨‍🏫 {"--"} enseignants</span>
        </div>

        <div className="mt-5 flex gap-2">
          <Link
            href={`/ecoles/${school.id}`}
            className="flex-1 rounded-lg border border-[#1B5FC1] px-3 py-2 text-center text-xs font-semibold text-[#1B5FC1] transition hover:bg-[#1B5FC1]/5 sm:text-sm"
          >
            Voir les détails
          </Link>
          <Link
            href={`/ecoles/${school.id}#postuler`}
            className="flex-1 rounded-lg bg-linear-to-r from-[#1B5FC1] to-[#3EAAF5] px-3 py-2 text-center text-xs font-semibold text-white transition hover:opacity-90 sm:text-sm"
          >
            Postuler
          </Link>
        </div>
      </div>
    </article>
  );
}
