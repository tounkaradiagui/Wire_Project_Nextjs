"use client";

import { useState } from "react";
import { FaqItem } from "@/lib/types";

export default function FaqSection({ items }: { items: FaqItem[] }) {
  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null);

  return (
    <section id="faq" className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <div className="mx-auto mb-10 max-w-2xl text-center">
        <span className="text-xs font-bold uppercase tracking-widest text-[#1B5FC1] sm:text-sm">FAQ</span>
        <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-[#0F2D56] sm:text-3xl">
          Questions fréquentes
        </h2>
      </div>
      <div className="flex flex-col gap-3">
        {items.map((item) => {
          const open = openId === item.id;
          return (
            <div key={item.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <button
                onClick={() => setOpenId(open ? null : item.id)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                aria-expanded={open}
              >
                <span className="text-sm font-semibold text-[#0F2D56] sm:text-base">{item.question}</span>
                <span
                  className="shrink-0 text-xl text-[#1B5FC1] transition-transform"
                  style={{ transform: open ? "rotate(45deg)" : "rotate(0deg)" }}
                >
                  +
                </span>
              </button>
              {open && (
                <div className="px-5 pb-4 text-sm leading-relaxed text-slate-600">{item.answer}</div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
