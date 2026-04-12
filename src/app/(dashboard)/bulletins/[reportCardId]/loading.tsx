export default function Loading() {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 animate-pulse">
      <div className="flex justify-between">
        <div className="h-4 w-32 bg-gray-200 rounded" />
        <div className="h-9 w-40 bg-gray-200 rounded-lg" />
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 space-y-4">
          <div className="flex justify-between">
            <div className="h-4 w-24 bg-gray-200 rounded" />
            <div className="h-4 w-32 bg-gray-200 rounded" />
          </div>
          <div className="h-7 w-72 bg-gray-200 rounded mx-auto" />
          <div className="grid grid-cols-2 gap-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-4 w-48 bg-gray-100 rounded" />
            ))}
          </div>
        </div>

        {/* Table rows */}
        <div className="divide-y divide-gray-100">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="flex gap-4 px-4 py-3">
              <div className="h-4 w-40 bg-gray-100 rounded" />
              <div className="h-4 w-12 bg-gray-100 rounded ml-auto" />
              <div className="h-4 w-12 bg-gray-100 rounded" />
              <div className="h-4 w-8 bg-gray-100 rounded" />
              <div className="h-4 w-14 bg-gray-200 rounded" />
              <div className="h-4 w-14 bg-gray-100 rounded" />
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 flex gap-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-9 w-32 bg-gray-100 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  )
}