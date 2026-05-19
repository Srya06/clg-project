// Skeleton loading screen for student dashboard
export default function StudentDashboardLoading() {
  return (
    <div className="space-y-8 pb-12 animate-pulse">
      {/* Header skeleton */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-3">
          <div className="h-12 w-72 rounded-2xl bg-white/5" />
          <div className="h-5 w-80 rounded-xl bg-white/5" />
        </div>
        <div className="flex gap-3">
          <div className="h-12 w-32 rounded-xl bg-white/5" />
          <div className="h-12 w-40 rounded-xl bg-white/5" />
        </div>
      </div>

      {/* Stats grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-3xl bg-white/5 border border-white/5 p-6 space-y-4">
            <div className="flex justify-between">
              <div className="h-11 w-11 rounded-2xl bg-white/5" />
              <div className="h-5 w-16 rounded-md bg-white/5" />
            </div>
            <div className="space-y-2">
              <div className="h-3 w-24 rounded bg-white/5" />
              <div className="h-8 w-32 rounded bg-white/5" />
            </div>
          </div>
        ))}
      </div>

      {/* Main content skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 rounded-3xl bg-white/5 border border-white/5 p-6 space-y-4">
          <div className="h-6 w-48 rounded bg-white/5" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 w-full rounded-2xl bg-white/5" />
          ))}
        </div>
        <div className="space-y-6">
          <div className="rounded-3xl bg-white/5 border border-white/5 p-6 space-y-4">
            <div className="h-6 w-40 rounded bg-white/5" />
            <div className="h-16 w-full rounded-2xl bg-white/5" />
            <div className="h-16 w-full rounded-2xl bg-white/5" />
          </div>
          <div className="rounded-3xl bg-white/5 border border-white/5 p-6 space-y-4">
            <div className="h-6 w-32 rounded bg-white/5" />
            <div className="h-16 w-full rounded-2xl bg-white/5" />
          </div>
        </div>
      </div>
    </div>
  );
}
