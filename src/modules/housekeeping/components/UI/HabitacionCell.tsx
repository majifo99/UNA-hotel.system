

export default function HabitacionCell({
  numero,
  tipoNombre,
  piso,
}: Readonly<{ numero?: string; tipoNombre?: string; piso?: string | number }>) {
  return (
    <div className="flex flex-col">
      <span className="font-semibold text-gray-900">{numero ?? "—"}</span>
      <span className="text-xs text-slate-600">
        {tipoNombre ? ` ${tipoNombre}` : "Tipo: —"} · {typeof piso !== "undefined" ? `Piso: ${String(piso)}` : "Piso: —"}
      </span>
    </div>
  );
}
