export default function TableSkeleton() {
  return (
    <div className="bg-white rounded-xl p-4 shadow animate-pulse">
      {/* ===== Top Header ===== */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        {/* Title */}
        <div className="h-6 w-48 bg-gray-200 rounded" />

        {/* Search + actions */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-56 bg-gray-200 rounded-full" />
          <div className="h-10 w-10 bg-gray-200 rounded-full" />
          <div className="h-10 w-10 bg-gray-200 rounded-full" />
          <div className="h-10 w-10 bg-gray-200 rounded-full" />
        </div>
      </div>

      {/* ===== Table ===== */}
      <div className="overflow-hidden rounded-lg border">
        {/* Table Header (blue bar equivalent) */}
        <div className="grid grid-cols-6 gap-4 bg-blue-500 p-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-4 bg-blue-300/70 rounded"
            />
          ))}
        </div>

        {/* Table Rows */}
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="grid grid-cols-6 gap-4 items-center p-4 border-t"
          >
            {/* Infos (avatar + name) */}
            <div className="flex items-center gap-3 col-span-1">
              <div className="h-10 w-10 bg-gray-200 rounded-full" />
              <div className="h-4 w-28 bg-gray-300 rounded" />
            </div>

            {/* Identifiant */}
            <div className="h-4 w-24 bg-gray-300 rounded" />

            {/* Niveau */}
            <div className="h-4 w-20 bg-gray-300 rounded" />

            {/* Téléphone */}
            <div className="h-4 w-28 bg-gray-300 rounded" />

            {/* Adresse */}
            <div className="h-4 w-32 bg-gray-300 rounded" />

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <div className="h-9 w-9 bg-gray-200 rounded-full" />
              <div className="h-9 w-9 bg-gray-200 rounded-full" />
            </div>
          </div>
        ))}
      </div>

      {/* ===== Pagination ===== */}
      <div className="flex items-center justify-between mt-6">
        <div className="h-9 w-28 bg-gray-200 rounded" />

        <div className="flex gap-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className="h-8 w-8 bg-gray-200 rounded"
            />
          ))}
        </div>

        <div className="h-9 w-28 bg-gray-200 rounded" />
      </div>
    </div>
  );
}
