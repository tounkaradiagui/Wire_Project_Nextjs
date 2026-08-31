"use client";

import { useEffect, useRef, useState } from "react";
import { PlatformStat } from "@/lib/types";

function Counter({ value, suffix }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const duration = 1200;
          const start = performance.now();
          const tick = (now: number) => {
            const progress = Math.min((now - start) / duration, 1);
            setDisplay(Math.round(value * progress));
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [value]);

  return (
    <div ref={ref} className="text-3xl font-extrabold tracking-tight text-[#0F2D56] sm:text-4xl">
      {display.toLocaleString("fr-FR")}
      {suffix}
    </div>
  );
}

export default function StatsSection({ stats }: { stats: PlatformStat[] }) {
  return (
    <section className="border-y border-slate-200 bg-[#F0F6FF] py-10 sm:py-12">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 sm:grid-cols-4 sm:gap-8 sm:px-6 lg:px-8">
        {stats.map((s) => (
          <div key={s.id} className="text-center">
            <Counter value={s.value} suffix={s.suffix} />
            <div className="mt-1 text-xs font-medium text-slate-600 sm:text-sm">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
