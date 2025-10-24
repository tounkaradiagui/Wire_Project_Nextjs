"use client";

import Image from "next/image";

const TableSearch = () => {
  return (
    <div className="w-full md:w-auto items-center gap-2 ring-[1.5px] flex ring-gray-300 px-2 rounded-full text-xs">
      <Image src="/search.png" alt="search" width={14} height={14} />
      <input
        type="text"
        placeholder="Rechercher..."
        className="w-[200px] p-2 bg-transparent outline-none"
      />
    </div>
  );
};

export default TableSearch;
