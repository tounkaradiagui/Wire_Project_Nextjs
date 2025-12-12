export default function TableSkeleton() {
  return (
    <div className="bg-white p-4 rounded-md animate-pulse">
      {/* HEADER SKELETON */}
      <div className="flex items-center justify-between mb-4">
        <div className="h-6 w-40 bg-gray-200 rounded"></div>

        <div className="flex items-center gap-3">
          <div className="h-10 w-40 bg-gray-200 rounded"></div>
          <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
          <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
        </div>
      </div>

      {/* TABLE SKELETON */}
      <div className="w-full overflow-hidden rounded-md border">
        {/* Table Header */}
        <div className="grid grid-cols-3 bg-gray-100 p-3">
          <div className="h-4 w-24 bg-gray-300 rounded"></div>
          <div className="h-4 w-24 bg-gray-300 rounded hidden md:block"></div>
          <div className="h-4 w-16 bg-gray-300 rounded"></div>
        </div>

        {/* Table Rows */}
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="grid grid-cols-3 items-center p-4 border-t"
          >
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
              <div className="h-4 w-32 bg-gray-300 rounded"></div>
            </div>

            <div className="hidden md:flex gap-2">
              <div className="h-4 w-12 bg-gray-300 rounded"></div>
              <div className="h-4 w-20 bg-gray-300 rounded"></div>
            </div>

            <div className="flex gap-3 justify-end">
              <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
              <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Skeleton */}
      <div className="flex justify-end mt-4 gap-2">
        <div className="h-8 w-8 bg-gray-200 rounded"></div>
        <div className="h-8 w-8 bg-gray-200 rounded"></div>
        <div className="h-8 w-8 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
}
