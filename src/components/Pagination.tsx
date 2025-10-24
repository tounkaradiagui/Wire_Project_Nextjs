"use client";

const Pagination = () => {
  return (
    <div className="p-4 flex items-center justify-between text-gray-600">
      <button
        className="bg-blue-200 text-gray-600 px-4 py-2 rounded-md text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        disabled
      >
        Précédent
      </button>
      <div className="flex items-center gap-2 text-sm">
        <button className="px-2 rounded-sm bg-blue-500  text-white">1</button>
        <button className="px-2 rounded-sm">2</button>
        <button className="px-2 rounded-sm">3</button>
        ...
        <button className="px-2 rounded-sm">10</button>
      </div>
      <button className="bg-blue-200 text-gray-600 px-4 py-2 rounded-md text-xs font-semibold cursor-pointer">
        Suivant
      </button>
    </div>
  );
};

export default Pagination;
