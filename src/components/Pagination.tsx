"use client";

import { ITEM_PER_PAGE } from "@/lib/settings";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Pagination = ({ page, count }: { page: number; count: number }) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Calculer le nombre total de pages en fonction du nombre total d'éléments et du nombre d'éléments par page, et ne pas afficher la pagination si le nombre total de pages est inférieur ou égal à 1
  const totalPages = Math.ceil(count / ITEM_PER_PAGE);
  if (totalPages <= 1) return null;

  // Déterminer si les boutons "Précédent" et "Suivant" doivent être activés ou désactivés en fonction de la page actuelle et du nombre total de pages
  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  // Fonction pour changer de page, qui met à jour les paramètres de recherche dans l'URL pour refléter la nouvelle page sélectionnée, ce qui permet 
  // de naviguer entre les pages sans recharger la page entière et de conserver les autres paramètres de recherche intacts
  const changePage = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`?${params.toString()}`);
  };

  // 👉 pages visibles (max 5)
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p >= page - 2 && p <= page + 2
  );

  return (
    <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-gray-600">

      {/* Précédent */}
      <button
        disabled={!hasPrev}
        onClick={() => changePage(page - 1)}
        className={`flex items-center gap-1 px-3 py-1 rounded-md text-xs font-semibold transition
          ${hasPrev ? "bg-blue-500 text-white hover:bg-blue-600" : "bg-gray-300 text-gray-400 cursor-not-allowed"}`}
      >
        <ChevronLeft size={14} />
        Précédent
      </button>

      {/* Numéros */}
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => changePage(p)}
          className={`px-3 py-1 rounded-md text-sm transition
            ${p === page ? "bg-blue-600 text-white" : "bg-white border hover:bg-blue-50"}`}
        >
          {p}
        </button>
      ))}

      {/* Suivant */}
      <button
        disabled={!hasNext}
        onClick={() => changePage(page + 1)}
        className={`flex items-center gap-1 px-3 py-1 rounded-md text-xs font-semibold transition
          ${hasNext ? "bg-blue-500 text-white hover:bg-blue-600" : "bg-gray-300 text-gray-400 cursor-not-allowed"}`}
      >
        Suivant
        <ChevronRight size={14} />
      </button>
    </div>
  );
};

export default Pagination;
