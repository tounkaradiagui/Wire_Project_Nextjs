import { Feature } from "@/lib/types";
import { JSX } from "react";

const ICONS: Record<string, JSX.Element> = {
  users: <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />,
  "calendar-x": <path d="M19 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2ZM16 2v4M8 2v4M3 10h18m-9 4 4 4m0-4-4 4" />,
  "file-text": <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6ZM14 2v6h6M16 13H8M16 17H8M10 9H8" />,
  "credit-card": <path d="M2 7a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7ZM2 11h20" />,
  clock: <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20ZM12 6v6l4 2" />,
  "message-circle": <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z" />,
};

export default function FeaturesSection({ features }: { features: Feature[] }) {
  return (
    <section id="fonctionnalites" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <span className="text-xs font-bold uppercase tracking-widest text-[#1B5FC1] sm:text-sm">
          Fonctionnalités
        </span>
        <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-[#0F2D56] sm:text-3xl">
          Tout ce dont votre école a besoin
        </h2>
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <div
            key={f.id}
            className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#F0F6FF] text-[#1B5FC1]">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {ICONS[f.icon]}
              </svg>
            </div>
            <h3 className="text-base font-bold text-[#0F2D56]">✔ {f.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{f.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
