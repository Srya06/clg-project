// Skeleton loading screen for roadmap page
export default function RoadmapLoading() {
  return (
    <div className="space-y-8 pb-12 animate-pulse">
      {/* Header skeleton */}
      <div className="flex flex-col md:flex-row justify-between gap-6">
        <div className="space-y-3">
          <div className="h-4 w-32 rounded bg-white/5" />
          <div className="h-10 w-64 rounded-2xl bg-white/5" />
          <div className="h-4 w-80 rounded bg-white/5" />
        </div>
        <div className="flex flex-col gap-3 min-w-[260px]">
          <div className="h-11 w-full rounded-xl bg-white/5" />
          <div className="h-11 w-full rounded-xl bg-white/5" />
        </div>
      </div>

      {/* Tabs skeleton */}
      <div className="h-12 w-80 rounded-xl bg-white/5" />

      {/* Timeline skeleton */}
      <div className="relative space-y-12">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-start gap-6">
            <div className="h-10 w-10 rounded-full bg-white/5 shrink-0" />
            <div className="flex-1 rounded-3xl bg-white/5 border border-white/5 p-6 space-y-4">
              <div className="h-5 w-40 rounded bg-white/5" />
              <div className="h-4 w-64 rounded bg-white/5" />
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className="h-12 w-full rounded-xl bg-white/5" />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
