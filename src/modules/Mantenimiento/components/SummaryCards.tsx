

function Pill({
  dotClass, label, value,
}: Readonly<{ dotClass: string; label: string; value: number | string }>) {
  return (
    <div className="inline-flex items-center gap-2 rounded-xl border bg-white px-3 py-2 shadow-sm">
      <span className={`h-2.5 w-2.5 rounded-full ${dotClass}`} />
      <span className="text-sm text-gray-600">{label}</span>
      <span className="ml-1 rounded-md bg-gray-100 px-2 py-0.5 text-sm font-semibold text-gray-800">{value}</span>
    </div>
  );
}

export function SummaryCards({
  pending, inProgress, done, total,
}: Readonly<{ pending: number; inProgress: number; done: number; total: number }>) {
  return (
    <div className="flex flex-wrap gap-3">
      <Pill dotClass="bg-rose-300" label="Pendientes" value={pending} />
      <Pill dotClass="bg-indigo-300" label="En proceso" value={inProgress} />
      <Pill dotClass="bg-emerald-300" label="Completados" value={done} />
      <Pill dotClass="bg-blue-300" label="Disponibles" value={Math.max(0, total - (pending + inProgress))} />
    </div>
  );
}
