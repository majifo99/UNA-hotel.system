// src/modules/housekeeping/components/Historial/HistorialComponents.tsx
/**
 * Componentes compartidos para páginas de historial
 * Reutilizados por HistorialLimpiezasPage y HistorialMantenimientosPage
 */

import { formatDatetime, parseJsonSafe, asPrimitiveString, toDisplayString } from "../../utils/formatters";

type KV = Record<string, unknown>;

const FIELDS_ORDER = [
  "notas", "prioridad", "fecha_inicio", "fecha_final",
  "id_usuario_asigna", "id_usuario_reporta", "inicio", "final",
  "asignado", "reporte", "estado",
];

const LABELS: Record<string, string> = {
  notas: "Notas",
  prioridad: "Prioridad",
  fecha_inicio: "Fecha Inicio",
  fecha_final: "Fecha Final",
  id_usuario_asigna: "Id Usuario Asigna",
  id_usuario_reporta: "Id Usuario Reporta",
  inicio: "Inicio",
  final: "Final",
  asignado: "Asignado",
  reporte: "Reporte",
  estado: "Estado",
};

const HIDDEN_KEYS = new Set<string>(["fecha_reporte"]);

/**
 * Componente para mostrar badge de prioridad con colores
 */
export function PriorityPill({ value }: Readonly<{ value?: string }>) {
  if (!value) return <span>—</span>;
  const v = String(value).toLowerCase();
  const styleMap: Record<string, string> = {
    alta: "bg-rose-100 text-rose-700 ring-rose-200",
    media: "bg-sky-100 text-sky-700 ring-sky-200",
    baja: "bg-emerald-100 text-emerald-700 ring-emerald-200",
  };
  const cls = styleMap[v] ?? "bg-slate-100 text-slate-700 ring-slate-200";
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ${cls}`}>
      {v}
    </span>
  );
}

/**
 * Componente para mostrar un objeto JSON como lista de key-value
 */
export function ValueBlock({ json }: Readonly<{ json: string | KV | null | undefined }>) {
  const original = parseJsonSafe<KV>(json) ?? {};
  const obj: KV = Object.fromEntries(
    Object.entries(original).filter(([k]) => !HIDDEN_KEYS.has(k))
  );

  const orderedKnown = FIELDS_ORDER.filter((k) => k in obj);
  const remaining = Object.keys(obj).filter((k) => !FIELDS_ORDER.includes(k));
  const keys = [...orderedKnown, ...remaining];

  if (Object.keys(obj).length === 0) {
    return <span className="text-slate-500">—</span>;
  }

  return (
    <div className="space-y-1.5">
      {keys.map((k) => {
        const label =
          LABELS[k] ??
          k.replaceAll("_", " ").replaceAll(/\b\w/g, (s) => s.toUpperCase());

        const val = obj[k];
        const isDateKey = /fecha|inicio|final|reporte/i.test(k);

        let content: React.ReactNode;
        if (k === "prioridad") {
          content = <PriorityPill value={asPrimitiveString(val)} />;
        } else if (isDateKey) {
          content = formatDatetime(asPrimitiveString(val) ?? undefined);
        } else {
          content = toDisplayString(val);
        }

        return (
          <div key={k} className="flex items-center gap-2 break-inside-avoid">
            <span className="kv-label shrink-0 text-[11px] font-medium text-slate-500 w-32">
              {label}
            </span>
            <span className="text-sm leading-5 break-words">{content}</span>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Constantes de configuración para páginas de historial
 */
export const HISTORIAL_CONFIG = {
  HOUR12: false,
  BRAND_GREEN: "#1F392A",
} as const;
