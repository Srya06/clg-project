// Skeleton loading screen for AI Mentor chat page
export default function AIChatLoading() {
  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-w-5xl mx-auto animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="h-14 w-14 rounded-2xl bg-white/5" />
          <div className="space-y-2">
            <div className="h-6 w-28 rounded bg-white/5" />
            <div className="h-3 w-40 rounded bg-white/5" />
          </div>
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-9 rounded-xl bg-white/5" />
          <div className="h-9 w-9 rounded-xl bg-white/5" />
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 rounded-3xl bg-white/5 border border-white/5 p-6 space-y-6">
        {/* AI message placeholder */}
        <div className="flex gap-3 items-start">
          <div className="h-8 w-8 rounded-xl bg-white/5 shrink-0" />
          <div className="space-y-2 max-w-[80%]">
            <div className="h-4 w-72 rounded bg-white/5" />
            <div className="h-4 w-56 rounded bg-white/5" />
          </div>
        </div>
      </div>

      {/* Input bar */}
      <div className="mt-6 rounded-3xl bg-white/5 border border-white/5 p-4">
        <div className="h-12 w-full rounded-2xl bg-white/5" />
      </div>
    </div>
  );
}
