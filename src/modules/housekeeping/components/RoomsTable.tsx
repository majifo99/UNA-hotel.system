import { useMemo } from "react";
import { ArrowUpDown, CheckCircle2, XCircle, UserCheck, Pencil } from "lucide-react";
import type { Prioridad, LimpiezaItem } from "../types/limpieza";
import { useLimpiezasTable } from "../hooks/useLimpiezasTable";
import type { ColumnKey, SortKey } from "../types/table";

const cn = (...xs: Array<string | false | null | undefined>) =>
  xs.filter(Boolean).join(" ");

function Pill({
  children,
  tone = "slate",
}: Readonly<{ children: React.ReactNode; tone?: "slate" | "blue" | "orange" | "rose" | "teal" }>) {
  const map = {
    slate: "bg-slate-50 border-slate-200 text-slate-700",
    blue: "bg-blue-50 border-blue-200 text-blue-700",
    orange: "bg-orange-50 border-orange-200 text-orange-700",
    rose: "bg-rose-50 border-rose-200 text-rose-700",
    teal: "bg-teal-50 border-teal-200 text-teal-700",
  } as const;
  return <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium border", map[tone])}>{children}</span>;
}

function PrioridadBadge({ prioridad }: Readonly<{ prioridad?: Prioridad | null }>) {
  if (!prioridad) return <Pill>—</Pill>;
  const tone: Record<Prioridad, "slate" | "blue" | "orange" | "rose"> = {
    baja: "slate",
    media: "blue",
    alta: "orange",
    urgente: "rose",
  };
  return <Pill tone={tone[prioridad]}>{prioridad.toUpperCase()}</Pill>;
}

function EstadoBadge({ finalizada, nombre }: Readonly<{ finalizada: boolean; nombre?: string }>) {
  const text = finalizada ? "Limpia" : nombre ?? "—";
  const isClean = finalizada || text.toLowerCase() === "limpia";
  return <Pill tone={isClean ? "teal" : "slate"}>{text}</Pill>;
}

type Props = { onEdit?: (item: LimpiezaItem) => void };

// Mapa de columnas visibles -> SortKey que entiende el hook
const SORT_MAP: Record<ColumnKey, SortKey | null> = {
  numero: "habitacion",
  tipo: "tipo",
  piso: "piso",
  estado: "estado",
  prioridad: "prioridad",
  asignador: null, // no ordenable
  fecha_inicio: "fecha_inicio",
  fecha_final: "fecha_final",
};

export default function LimpiezasTable({ onEdit }: Readonly<Props>) {
  const {
    loading,
    error,
    items,
    pagination,
    selectedIds,
    toggleOne,
    toggleAllPage,
    gotoPage,
    handleSort,
    finalizarLimpieza,
  } = useLimpiezasTable({ initialFilters: { per_page: 10, pendientes: false } });

  const totalPages = pagination.last_page;

  const columns = useMemo<ReadonlyArray<{ key: ColumnKey; label: string }>>(
    () => [
      { key: "numero", label: "Número" },
      { key: "tipo", label: "Tipo" },
      { key: "piso", label: "Piso" },
      { key: "estado", label: "Estado" },
      { key: "prioridad", label: "Prioridad" },
      { key: "asignador", label: "Asignador" },
      { key: "fecha_inicio", label: "Inicio" },
      { key: "fecha_final", label: "Fin" },
    ],
    []
  );

  if (loading && items.length === 0) return <div className="text-center text-slate-500 py-10 text-sm">Cargando…</div>;
  if (error) return <div className="text-center text-rose-600 py-10 text-sm">Error: {error}</div>;
  if (items.length === 0) return <div className="text-center text-slate-500 py-10 text-sm">No hay limpiezas para mostrar.</div>;

  const onToggleEstado = (item: LimpiezaItem) => {
    const finalizada = Boolean(item.fecha_final);
    if (!finalizada) {
      finalizarLimpieza(item.id_limpieza, {
        fecha_final: new Date().toISOString(),
        notas: item.notas ?? null,
      });
    } else {
      alert("Aún no implementamos 'marcar sucia'.");
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3">
                <input
                  type="checkbox"
                  checked={items.length > 0 && items.every((r) => selectedIds.includes(r.id_limpieza))}
                  onChange={toggleAllPage}
                  className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                />
              </th>

              {columns.map((c) => {
                const sortKey = SORT_MAP[c.key];
                const isSortable = Boolean(sortKey);

                return (
                  <th
                    key={c.key}
                    className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider"
                  >
                    {isSortable ? (
                      <button
                        type="button"
                        onClick={() => handleSort(sortKey as SortKey)}
                        className="flex items-center gap-1 hover:text-slate-900 transition-colors"
                      >
                        {c.label}
                        <ArrowUpDown className="w-3 h-3" />
                      </button>
                    ) : (
                      <span className="text-slate-600">{c.label}</span>
                    )}
                  </th>
                );
              })}

              <th className="px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider text-right">
                Acciones
              </th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-slate-100">
            {items.map((item) => {
              const isSelected = selectedIds.includes(item.id_limpieza);
              const finalizada = Boolean(item.fecha_final);

              const numero = item.habitacion?.numero_habitacion ?? "—";
              const tipo = item.habitacion?.tipo ?? "—";
              const piso = (item.habitacion as any)?.piso ?? (item.habitacion as any)?.nivel ?? "—";

              return (
                <tr
                  key={item.id_limpieza}
                  className={cn("hover:bg-slate-50/50 transition-colors", isSelected && "bg-teal-50/30")}
                >
                  {/* Checkbox */}
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleOne(item.id_limpieza)}
                      className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                    />
                  </td>

                  {/* Número */}
                  <td className="px-4 py-3 text-sm text-slate-900 font-semibold">{numero}</td>

                  {/* Tipo */}
                  <td className="px-4 py-3 text-sm text-slate-700">{tipo}</td>

                  {/* Piso */}
                  <td className="px-4 py-3 text-sm text-slate-700">{piso}</td>

                  {/* Estado */}
                  <td className="px-4 py-3">
                    <EstadoBadge finalizada={finalizada} nombre={item.estadoHabitacion?.nombre} />
                  </td>

                  {/* Prioridad */}
                  <td className="px-4 py-3">
                    <PrioridadBadge prioridad={item.prioridad ?? null} />
                  </td>

                  {/* Asignador */}
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {item.asignador ? (
                      <div className="flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-teal-600" />
                        {item.asignador.name}
                      </div>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>

                  {/* Fechas */}
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {new Date(item.fecha_inicio).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {item.fecha_final ? new Date(item.fecha_final).toLocaleString() : <span className="text-slate-400">—</span>}
                  </td>

                  {/* Acciones */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        type="button"
                        onClick={() => onToggleEstado(item)}
                        title={finalizada ? "Marcar sucia" : "Marcar limpia"}
                        aria-label={finalizada ? "Marcar sucia" : "Marcar limpia"}
                        className={cn(
                          "inline-flex items-center justify-center w-8 h-8 rounded-full border transition hover:scale-105",
                          finalizada ? "border-rose-300 hover:bg-rose-50" : "border-green-300 hover:bg-green-50"
                        )}
                      >
                        {finalizada ? (
                          <XCircle className="w-5 h-5 text-rose-600" />
                        ) : (
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => onEdit?.(item)}
                        title="Editar"
                        aria-label="Editar"
                        className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-slate-300 text-slate-700 hover:bg-slate-50 transition hover:scale-105"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* paginación */}
      <div className="flex justify-center items-center gap-1 py-5 bg-white border-t border-slate-100">
        <button
          onClick={() => gotoPage(pagination.current_page - 1)}
          disabled={pagination.current_page <= 1}
          className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-teal-600 disabled:opacity-30"
          aria-label="Página anterior"
        >
          ←
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            onClick={() => gotoPage(p)}
            className={cn(
              "w-8 h-8 rounded-md text-sm transition-colors",
              pagination.current_page === p ? "text-teal-700 font-semibold bg-slate-100" : "text-slate-500 hover:text-teal-600"
            )}
          >
            {p}
          </button>
        ))}

        <button
          onClick={() => gotoPage(pagination.current_page + 1)}
          disabled={pagination.current_page >= totalPages}
          className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-teal-600 disabled:opacity-30"
          aria-label="Página siguiente"
        >
          →
        </button>
      </div>
    </div>
  );
}
