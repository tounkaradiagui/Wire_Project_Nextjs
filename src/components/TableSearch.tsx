"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent } from "react";

const TableSearch = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

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
        className="w-[200px] p-2 bg-transparent outline-none"
      />
    </form>
  );
};

export default TableSearch;