export default function ChartSkeleton() {
    return (
        <div className="w-full h-full bg-white dark:bg-gray-800 rounded-xl shadow p-4 animate-pulse flex flex-col">
            {/* Title */}
            <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-4" />

            {/* Chart body */}
            <div className="flex-1 flex items-end gap-2">
                {Array.from({ length: 12 }).map((_, i) => (
                    <div
                        key={i}
                        className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-t"
                        style={{ height: `${30 + i * 4}%` }}
                    />
                ))}
            </div>
        </div>
    );
}
