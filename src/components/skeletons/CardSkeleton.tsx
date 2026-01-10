const CardSkeleton = () => {
    return (
        <div className="h-28 rounded-xl bg-white dark:bg-gray-800 shadow p-4 animate-pulse flex flex-col justify-between" >
            <div className="flex items-center justify-between">
                <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full" />
            </div>

            <div className="space-y-2">
                <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
        </div >
    );
};

export default CardSkeleton;
