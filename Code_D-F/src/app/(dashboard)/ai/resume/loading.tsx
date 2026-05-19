// Skeleton loading screen for Resume Auditor page
export default function ResumeAuditorLoading() {
  return (
    <div className="space-y-8 pb-12 max-w-5xl mx-auto animate-pulse">
      {/* Header */}
      <div className="text-center space-y-4 py-8">
        <div className="mx-auto h-20 w-20 rounded-3xl bg-white/5" />
        <div className="mx-auto h-10 w-64 rounded-2xl bg-white/5" />
        <div className="mx-auto h-4 w-96 rounded bg-white/5" />
      </div>

      {/* Target role input */}
      <div className="rounded-3xl bg-white/5 border border-white/5 p-6 space-y-3">
        <div className="h-3 w-24 rounded bg-white/5" />
        <div className="h-12 w-full rounded-xl bg-white/5" />
      </div>

      {/* Drop zone */}
      <div className="rounded-[40px] bg-white/5 border border-white/5 p-20 flex flex-col items-center gap-4">
        <div className="h-24 w-24 rounded-full bg-white/5" />
        <div className="h-6 w-48 rounded-2xl bg-white/5" />
        <div className="h-4 w-32 rounded bg-white/5" />
      </div>

      {/* Button */}
      <div className="h-14 w-full rounded-2xl bg-white/5" />
    </div>
  );
}
