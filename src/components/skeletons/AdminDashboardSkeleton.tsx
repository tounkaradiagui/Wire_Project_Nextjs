export default function AdminDashboardSkeleton() {
  return (
    <div className="p-4 flex flex-col md:flex-row gap-4 animate-pulse">
      {/* ================= LEFT ================= */}
      <div className="w-full lg:w-2/3 flex flex-col gap-8">
        {/* ===== User Cards ===== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-32 rounded-xl bg-gray-200"
            />
          ))}
        </div>

        {/* ===== Middle Charts ===== */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Count Chart */}
          <div className="w-full lg:w-1/3 h-112.5 bg-gray-200 rounded-xl" />

          {/* Attendance Chart */}
          <div className="w-full lg:w-2/3 h-112.5 bg-gray-200 rounded-xl" />
        </div>

        {/* ===== Finance Chart ===== */}
        <div className="w-full h-125 bg-gray-200 rounded-xl" />
      </div>

      {/* ================= RIGHT ================= */}
      <div className="w-full lg:w-1/3 flex flex-col gap-8">
        {/* Calendar */}
        <div className="h-95 bg-gray-200 rounded-xl" />

        {/* Events */}
        <div className="h-40 bg-gray-200 rounded-xl" />

        {/* Announcements */}
        <div className="h-55 bg-gray-200 rounded-xl" />
      </div>
    </div>
  );
}
