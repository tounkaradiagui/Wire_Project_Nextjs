"use client";

import { ITEM_PER_PAGE } from "@/lib/settings";
import { useRouter, useSearchParams } from "next/navigation";

const Pagination = ({ page, count }: { page: number; count: number }) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const hasPrev = page > 1;
  const hasNext = page < Math.ceil(count / ITEM_PER_PAGE);

  const changePage = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="p-4 flex items-center justify-between text-gray-600">
      
      {/* Précédent */}
      <button
        disabled={!hasPrev}
        onClick={() => changePage(page - 1)}
        className={`px-4 py-2 rounded-md text-xs font-semibold transition
          ${hasPrev ? "bg-blue-500 text-white hover:bg-blue-600 cursor-pointer" : "bg-gray-300 text-gray-400 cursor-not-allowed"}`}
      >
        Précédent
      </button>

      {/* Numéros */}
      <div className="flex items-center gap-2 text-sm">
        {Array.from({ length: Math.ceil(count / ITEM_PER_PAGE) }, (_, i) => {
          const pageIndex = i + 1;
          return (
            <button
              key={pageIndex}
              onClick={() => changePage(pageIndex)}
              className={`px-2 py-1 rounded-sm transition 
                ${page === pageIndex ? "bg-blue-600 text-white" : "text-gray-600 hover:text-blue-600"}`}
            >
              {pageIndex}
            </button>
          );
        })}
      </div>

      {/* Suivant */}
      <button
        disabled={!hasNext}
        onClick={() => changePage(page + 1)}
        className={`px-4 py-2 rounded-md text-xs font-semibold transition
          ${hasNext ? "bg-blue-500 text-white hover:bg-blue-600 cursor-pointer" : "bg-gray-300 text-gray-400 cursor-not-allowed"}`}
      >
        Suivant
      </button>

    </div>
  );
};

export default Pagination;
