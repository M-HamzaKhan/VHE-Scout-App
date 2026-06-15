export default function Loading() {
  return (
    <div className="bg-[#eef1f8] min-h-svh">
      <div className="bg-[#2563eb] border-b border-[#1d4ed8] px-5 py-4 flex items-center justify-between">
        <div>
          <div className="h-5 w-20 bg-blue-400 rounded animate-pulse" />
          <div className="h-3 w-32 bg-blue-400 rounded animate-pulse mt-1.5" />
        </div>
        <div className="h-7 w-28 bg-blue-400 rounded-full animate-pulse" />
      </div>
      <div className="px-4 py-4 flex flex-col gap-3">
        <div className="flex gap-3">
          <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm px-4 py-4 text-center animate-pulse">
            <div className="h-2.5 w-20 bg-gray-200 rounded mx-auto mb-3" />
            <div className="h-8 w-16 bg-gray-200 rounded mx-auto mb-1" />
            <div className="h-2.5 w-16 bg-gray-200 rounded mx-auto" />
          </div>
          <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm px-4 py-4 text-center animate-pulse">
            <div className="h-2.5 w-16 bg-gray-200 rounded mx-auto mb-3" />
            <div className="h-8 w-16 bg-gray-200 rounded mx-auto mb-1" />
            <div className="h-2.5 w-20 bg-gray-200 rounded mx-auto" />
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-4 py-4 animate-pulse">
          <div className="flex justify-between mb-3">
            <div className="h-4 w-24 bg-gray-200 rounded" />
            <div className="h-4 w-28 bg-gray-200 rounded" />
          </div>
          <div className="h-2 bg-gray-200 rounded-full" />
        </div>
      </div>
    </div>
  )
}
