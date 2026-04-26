"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent } from "react";

const TableSearch = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Gérer la soumission du formulaire de recherche, en mettant à jour les paramètres de recherche dans l'URL pour refléter la nouvelle requête de recherche, 
  // ce qui permet de filtrer les données affichées dans la table en fonction de la recherche effectuée par l'utilisateur
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const value = (e.currentTarget[0] as HTMLInputElement).value.trim();

    const params = new URLSearchParams(searchParams);

    if (value) {
      params.set("search", value);
      // Reset pagination
      params.set("page", "1");
    } else {
      params.delete("search");
      params.set("page", "1");
    }

    // Naviguer vers la même page avec les nouveaux paramètres de recherche, ce qui déclenchera une nouvelle requête pour récupérer 
    // les données filtrées en fonction de la recherche
    router.push(`?${params.toString()}`);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full md:w-auto items-center gap-2 ring-[1.5px] flex ring-gray-300 px-2 rounded-full text-xs"
    >
      <Image src="/search.png" alt="search" width={14} height={14} />
      <input
        type="text"
        placeholder="Rechercher..."
        defaultValue={searchParams.get("search") || ""}
        className="w-50 p-2 bg-transparent outline-none"
      />
    </form>
  );
};

export default TableSearch;