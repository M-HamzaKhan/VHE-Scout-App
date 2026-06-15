export default function Loading() {
  return (
    <div className="bg-[#eef1f8] min-h-svh">
      <div className="bg-[#2563eb] border-b border-[#1d4ed8] px-5 py-4 flex items-center justify-between">
        <div>
          <div className="h-5 w-20 bg-blue-400 rounded animate-pulse" />
          <div className="h-3 w-44 bg-blue-400 rounded animate-pulse mt-1.5" />
        </div>
        <div className="h-7 w-16 bg-blue-400 rounded-lg animate-pulse" />
      </div>
      <div className="px-3 py-3 flex flex-col gap-1.5">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 shadow-sm px-4 py-4 border-l-4 border-l-gray-200 animate-pulse">
            <div className="flex justify-between items-start">
              <div className="flex flex-col gap-2 flex-1">
                <div className="h-5 w-48 bg-gray-200 rounded" />
                <div className="h-3 w-36 bg-gray-200 rounded" />
                <div className="h-5 w-20 bg-gray-200 rounded-full" />
              </div>
              <div className="h-5 w-14 bg-gray-200 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
