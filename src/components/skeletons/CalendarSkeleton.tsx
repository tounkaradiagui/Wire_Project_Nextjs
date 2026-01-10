export default function CalendarSkeleton() {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 animate-pulse">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>

            {/* Week days */}
            <div className="grid grid-cols-7 gap-2 mb-2">
                {Array.from({ length: 7 }).map((_, i) => (
                    <div
                        key={i}
                        className="h-4 bg-gray-200 dark:bg-gray-700 rounded"
                    />
                ))}
            </div>

            {/* Days */}
            <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: 35 }).map((_, i) => (
                    <div
                        key={i}
                        className="h-10 bg-gray-200 dark:bg-gray-700 rounded"
                    />
                ))}
            </div>
        </div>
    );
}
