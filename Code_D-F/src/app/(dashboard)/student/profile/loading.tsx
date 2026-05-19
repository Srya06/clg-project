// Skeleton loading screen for student profile page
export default function ProfileLoading() {
  return (
    <div className="space-y-8 pb-12 max-w-4xl mx-auto animate-pulse">
      {/* Profile header */}
      <div className="rounded-3xl bg-white/5 border border-white/5 p-8">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="h-24 w-24 rounded-full bg-white/5 shrink-0" />
          <div className="flex-1 space-y-3 text-center md:text-left">
            <div className="h-8 w-48 rounded-2xl bg-white/5 mx-auto md:mx-0" />
            <div className="h-4 w-64 rounded bg-white/5 mx-auto md:mx-0" />
            <div className="flex gap-2 justify-center md:justify-start">
              <div className="h-6 w-20 rounded-full bg-white/5" />
              <div className="h-6 w-24 rounded-full bg-white/5" />
            </div>
          </div>
          <div className="h-12 w-32 rounded-xl bg-white/5" />
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl bg-white/5 border border-white/5 p-4 space-y-2">
            <div className="h-3 w-16 rounded bg-white/5" />
            <div className="h-7 w-20 rounded bg-white/5" />
          </div>
        ))}
      </div>

      {/* Form sections */}
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="rounded-3xl bg-white/5 border border-white/5 p-6 space-y-4">
          <div className="h-6 w-40 rounded bg-white/5" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, j) => (
              <div key={j} className="h-12 rounded-xl bg-white/5" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
