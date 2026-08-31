"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState, useTransition } from "react";
import { searchPartnerSchools } from "@/lib/actions.additions";
import { PartnerSchool } from "@/lib/types";

const NAV_LINKS = [
  { href: "#fonctionnalites", label: "Fonctionnalités" },
  { href: "#ecoles", label: "Écoles partenaires" },
  { href: "#temoignages", label: "Témoignages" },
  { href: "#faq", label: "FAQ" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PartnerSchool[]>([]);
  const [isPending, startTransition] = useTransition();
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => {
    if (query.trim().length === 0) {
      setResults([]);
      return;
    }
    const timeout = setTimeout(() => {
      startTransition(async () => {
        const data = await searchPartnerSchools(query);
        setResults(data.slice(0, 6));
      });
    }, 250);
    return () => clearTimeout(timeout);
  }, [query]);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#0F2D56] to-[#1B5FC1] text-base font-extrabold text-white">
            E
          </span>
          <span className="text-lg font-extrabold tracking-tight text-[#0F2D56]">
            Wagadu
          </span>
        </Link>

        {/* Desktop nav links */}
        <nav className="hidden items-center gap-6 lg:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-slate-600 transition hover:text-[#1B5FC1]"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Search + CTA */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="relative" ref={searchRef}>
            <button
              aria-label="Rechercher une école"
              onClick={() => setSearchOpen((o) => !o)}
              className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 sm:w-auto sm:gap-2 sm:rounded-lg sm:border sm:border-slate-200 sm:px-3"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <span className="hidden text-sm sm:inline">Rechercher une école</span>
            </button>

            {searchOpen && (
              <div className="absolute right-0 mt-2 w-[300px] rounded-xl border border-slate-200 bg-white p-3 shadow-xl sm:w-[360px]">
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Nom, ville ou pays de l'école..."
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#1B5FC1]"
                />
                <div className="mt-2 max-h-72 overflow-y-auto">
                  {isPending && (
                    <p className="px-1 py-2 text-xs text-slate-400">Recherche...</p>
                  )}
                  {!isPending && query.trim() && results.length === 0 && (
                    <p className="px-1 py-2 text-xs text-slate-400">
                      Aucune école trouvée pour « {query} ».
                    </p>
                  )}
                  {results.map((school) => (
                    <Link
                      key={school.id}
                      href={`/ecoles/${school.id}`}
                      onClick={() => setSearchOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-slate-50"
                    >
                      <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-slate-100">
                        <Image src={school.logoUrl} alt={school.name} fill className="object-cover" sizes="36px" />
                      </span>
                      <span>
                        <span className="block text-sm font-semibold text-slate-800">
                          {school.name}
                        </span>
                        <span className="block text-xs text-slate-500">
                          {school.city}, {school.country}
                        </span>
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Link
            href="/sign-in"
            className="hidden rounded-lg border border-[#1B5FC1] px-4 py-2 text-sm font-semibold text-[#1B5FC1] transition hover:bg-[#1B5FC1]/5 sm:inline-block"
          >
            Connexion
          </Link>
          <Link
            href="#creer-mon-ecole"
            className="hidden rounded-lg bg-gradient-to-r from-[#1B5FC1] to-[#3EAAF5] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 sm:inline-block"
          >
            Créer mon école
          </Link>

          {/* Mobile burger */}
          <button
            aria-label="Ouvrir le menu"
            onClick={() => setMobileOpen((o) => !o)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 lg:hidden"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {mobileOpen ? <path d="M18 6 6 18M6 6l12 12" /> : <path d="M3 12h18M3 6h18M3 18h18" />}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-slate-100 bg-white px-4 pb-4 pt-2 lg:hidden">
          <nav className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                {link.label}
              </a>
            ))}
            <Link
              href="/sign-in"
              className="mt-2 rounded-lg border border-[#1B5FC1] px-3 py-2 text-center text-sm font-semibold text-[#1B5FC1]"
            >
              Connexion
            </Link>
            <Link
              href="#creer-mon-ecole"
              className="rounded-lg bg-gradient-to-r from-[#1B5FC1] to-[#3EAAF5] px-3 py-2 text-center text-sm font-semibold text-white"
            >
              Créer mon école
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
