"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { HeroSlide } from "@/lib/types";

export default function HeroSlider({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0);

  const next = useCallback(() => {
    setIndex((i) => (i + 1) % slides.length);
  }, [slides.length]);

  const prev = () => setIndex((i) => (i - 1 + slides.length) % slides.length);

  useEffect(() => {
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next]);

  const slide = slides[index];

  return (
    <section className="relative overflow-hidden bg-[#0F2D56]">
      <div className="relative h-120 sm:h-140 lg:h-155">
        {slides.map((s, i) => (
          <div
            key={s.id}
            className="absolute inset-0 transition-opacity duration-700"
            style={{ opacity: i === index ? 1 : 0, pointerEvents: i === index ? "auto" : "none" }}
          >
            <Image
              src={s.imageUrl}
              alt={s.title}
              fill
              priority={i === 0}
              className="object-cover"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-linear-to-t from-[#0F2D56] via-[#0F2D56]/70 to-[#0F2D56]/30" />
          </div>
        ))}

        {/* Slide content */}
        <div className="relative z-10 mx-auto flex h-full max-w-3xl flex-col items-center justify-center px-4 text-center sm:px-6">
          <span className="mb-4 inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-white/85 sm:text-sm">
            {slide.eyebrow}
          </span>
          <h1 className="text-balance text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
            {slide.title}
          </h1>
          <p className="mt-4 max-w-xl text-sm text-white/75 sm:text-base lg:text-lg">
            {slide.description}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="#demande-demo"
              className="rounded-lg border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20 sm:text-base"
            >
              Demander une démo
            </Link>
            <Link
              href="#creer-mon-ecole"
              className="rounded-lg bg-white px-6 py-3 text-sm font-semibold text-[#1B5FC1] shadow-lg transition hover:opacity-90 sm:text-base"
            >
              Créer mon école
            </Link>
          </div>
        </div>

        {/* Arrows - hidden on small screens to save space */}
        <button
          aria-label="Diapositive précédente"
          onClick={prev}
          className="absolute left-2 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/25 sm:flex"
        >
          ‹
        </button>
        <button
          aria-label="Diapositive suivante"
          onClick={next}
          className="absolute right-2 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/25 sm:flex"
        >
          ›
        </button>

        {/* Dots */}
        <div className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 gap-2">
          {slides.map((s, i) => (
            <button
              key={s.id}
              aria-label={`Aller à la diapositive ${i + 1}`}
              onClick={() => setIndex(i)}
              className="h-2 rounded-full transition-all"
              style={{
                width: i === index ? "24px" : "8px",
                background: i === index ? "#FFFFFF" : "rgba(255,255,255,.4)",
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
