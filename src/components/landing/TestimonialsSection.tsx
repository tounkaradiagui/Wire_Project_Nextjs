import Image from "next/image";
import { Testimonial } from "@/lib/types";

export default function TestimonialsSection({ items }: { items: Testimonial[] }) {
  return (
    <section id="temoignages" className="bg-[#F8FAFC] py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-[#1B5FC1] sm:text-sm">
            Témoignages
          </span>
          <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-[#0F2D56] sm:text-3xl">
            Ce que disent nos écoles partenaires
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((t) => (
            <figure key={t.id} className="flex flex-col rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <div className="mb-3 flex gap-1 text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill={i < t.rating ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                ))}
              </div>
              <blockquote className="flex-1 text-sm leading-relaxed text-slate-600">
                « {t.quote} »
              </blockquote>
              <figcaption className="mt-5 flex items-center gap-3 border-t border-slate-100 pt-4">
                <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-slate-100">
                  <Image src={t.avatarUrl} alt={t.authorName} fill className="object-cover" sizes="40px" />
                </span>
                <span>
                  <span className="block text-sm font-semibold text-[#0F2D56]">{t.authorName}</span>
                  <span className="block text-xs text-slate-500">
                    {t.authorRole} — {t.schoolName}
                  </span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
