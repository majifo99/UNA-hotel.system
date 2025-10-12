// Tailwind-only loaders

export function FancySpinner({
  size = 40,
  center = false,
  label = "Cargando",
}: Readonly<{ size?: number; center?: boolean; label?: string }>) {
  // spinner con borde transparente en el tope + animate-spin (Tailwind)
  return (
    <div
      className={`flex ${center ? "items-center justify-center" : ""}`}
      aria-label={label}
    >
      <div
        className="rounded-full border-4 border-emerald-600 border-t-transparent animate-spin"
        style={{ width: size, height: size }}
      />
    </div>
  );
}

export function BarLoader() {
  return (
    <div className="h-1 w-full bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-[pulse_1.2s_ease-in-out_infinite]" />
  );
}

export function InitialDashSkeleton() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="h-8 w-56 bg-slate-200/80 rounded-md animate-pulse" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, idx) => (
          <div key={idx} className="relative overflow-hidden p-6 rounded-xl bg-white border-2 border-slate-200 shadow-sm">
            <div className="h-4 w-24 bg-slate-200 rounded mb-3 animate-pulse" />
            <div className="h-10 w-32 bg-slate-200 rounded mb-4 animate-pulse" />
            <div className="h-6 w-40 bg-slate-100 rounded animate-pulse" />
          </div>
        ))}
      </div>
      <div className="bg-white/60 rounded-lg px-4 py-3 border border-slate-200/60">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-64 bg-slate-200 rounded-lg animate-pulse" />
            <div className="h-9 w-48 bg-slate-200 rounded-lg animate-pulse" />
          </div>
          <div className="h-4 w-32 bg-slate-200 rounded animate-pulse" />
        </div>
        <div className="mt-3 flex gap-3">
          <div className="h-9 w-40 bg-slate-200 rounded-lg animate-pulse" />
          <div className="h-9 w-40 bg-slate-200 rounded-lg animate-pulse" />
          <div className="h-9 w-40 bg-slate-200 rounded-lg animate-pulse" />
          <div className="h-9 w-24 bg-slate-200 rounded-lg animate-pulse" />
        </div>
      </div>
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="grid grid-cols-7 gap-4 px-4 py-4 border-b border-slate-100">
            <div className="h-4 w-4 bg-slate-200 rounded animate-pulse" />
            <div className="h-4 w-28 bg-slate-200 rounded animate-pulse" />
            <div className="h-4 w-20 bg-slate-200 rounded animate-pulse" />
            <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
            <div className="h-4 w-40 bg-slate-200 rounded animate-pulse" />
            <div className="h-4 w-40 bg-slate-200 rounded animate-pulse" />
            <div className="h-8 w-24 bg-slate-200 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function TableLoader() {
  return (
    <div className="bg-white border border-emerald-200 rounded-xl overflow-hidden">
      <div className="h-1 bg-emerald-400/60 animate-pulse" />
      <div className="divide-y divide-slate-100">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="grid grid-cols-7 gap-4 px-4 py-4 animate-pulse">
            <div className="h-4 w-4 bg-slate-200 rounded" />
            <div className="h-4 w-28 bg-slate-200 rounded" />
            <div className="h-4 w-20 bg-slate-200 rounded" />
            <div className="h-4 w-24 bg-slate-200 rounded" />
            <div className="h-4 w-40 bg-slate-200 rounded" />
            <div className="h-4 w-40 bg-slate-200 rounded" />
            <div className="h-8 w-24 bg-slate-200 rounded justify-self-end" />
          </div>
        ))}
      </div>
    </div>
  );
}
