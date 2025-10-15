// src/modules/housekeeping/pages/HistorialLimpiezasPage.tsx
"use client";

import { useEffect,  useState } from "react";
import { useHistorialLimpiezas } from "../hooks/useHistorialLimpiezas";
import FilterBarHistoriales from "../components/FilterBarHistoriales";
import SolLogo from "../../../assets/Lanaku.png";
// Si tu PrintStyles está en src/ui/PrintStyles.tsx usa esta ruta con alias:
import PrintStyles from "../../housekeeping/components/UI/PrintStyles";

/** --- Helpers de formato --- */
const HOUR12 = false;

function fmtDatetime(v?: string | null) {
  if (!v || v === "—" || v === "-") return "—";
  const clean = typeof v === "string" ? v.replace(/(\.\d{3})\d+(Z)?$/, "$1$2") : v;
  const d = new Date(String(clean));
  if (Number.isNaN(d.getTime())) return String(v);
  return new Intl.DateTimeFormat("es-CR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: HOUR12,
  }).format(d);
}

type KV = Record<string, unknown>;

/** Orden sugerido al mostrar llaves conocidas */
const FIELDS_ORDER = [
  "notas",
  "prioridad",
  "fecha_inicio",
  "fecha_final",
  "id_usuario_asigna",
  "id_usuario_reporta",
  "inicio",
  "final",
  "asignado",
  "reporte",
  "estado",
];

/** Etiquetas amigables */
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

/** Claves a ocultar dentro de Valor anterior / Valor nuevo */
const HIDDEN_KEYS = new Set<string>(["fecha_reporte"]);

function parseJsonSafe(value?: string | KV | null): KV | null {
  if (!value) return null;
  if (typeof value === "object") return value;
  try {
    return JSON.parse(value);
  } catch {
    return { raw: value } as KV;
  }
}
function asPrimitiveString(v: unknown): string | undefined {
  if (v === null || v === undefined) return undefined;
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  return undefined;
}
function toDisplay(v: unknown): string {
  if (v === null || v === undefined || v === "") return "—";
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  try {
    const j = JSON.stringify(v);
    return j === "{}" || j === "[]" ? "—" : j;
  } catch {
    return "—";
  }
}

function PriorityPill({ value }: Readonly<{ value?: string }>) {
  if (!value) return <span>—</span>;
  const v = String(value).toLowerCase();
  const styleMap: Record<string, string> = {
    alta: "bg-rose-100 text-rose-700 ring-rose-200",
    media: "bg-sky-100 text-sky-700 ring-sky-200",
    baja: "bg-emerald-100 text-emerald-700 ring-emerald-200",
  };
  const cls = styleMap[v] ?? "bg-slate-100 text-slate-700 ring-slate-200";
  return (
    <span className={`pill inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${cls}`}>
      {v}
    </span>
  );
}

function ValueBlock({ json }: Readonly<{ json: string | KV | null | undefined }>) {
  const original = parseJsonSafe(json) ?? {};
  // Filtrar claves ocultas
  const obj: KV = Object.fromEntries(Object.entries(original).filter(([k]) => !HIDDEN_KEYS.has(k)));

  const orderedKnown = FIELDS_ORDER.filter((k) => k in obj);
  const remaining = Object.keys(obj).filter((k) => !FIELDS_ORDER.includes(k));
  const keys = [...orderedKnown, ...remaining];

  if (Object.keys(obj).length === 0) return <span className="text-slate-500">—</span>;

  return (
    <div className="space-y-1">
      {keys.map((k) => {
        const label = LABELS[k] ?? k.replace(/_/g, " ").replace(/\b\w/g, (s) => s.toUpperCase());
        const val = (obj)[k];

        if (k === "prioridad") {
          return (
            <div key={k} className="flex items-center gap-2">
              <span className="text-xs text-slate-500 w-28">{label}</span>
              <PriorityPill value={asPrimitiveString(val)} />
            </div>
          );
        }

        const isDateKey = /fecha|inicio|final|reporte/i.test(k);
        return (
          <div key={k} className="flex items-center gap-2">
            <span className="text-xs text-slate-500 w-28">{label}</span>
            <span className="text-sm break-all">
              {isDateKey ? fmtDatetime(asPrimitiveString(val) ?? undefined) : toDisplay(val)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/** número real de habitación (no id de limpieza) */
function getRoomNumber(h: any): string {
  return (
    h.numero_habitacion ??
    h.habitacion_num ??
    h.habitacion?.numero ??
    h.room_number ??
    h.num_habitacion ??
    h.id_habitacion ??
    "—"
  ).toString();
}

/** --- Page --- */
export default function HistorialLimpiezasPage() {
  const {
    data,
    total,
    perPage,
    q,
    desde,
    hasta,
    setPage,
    setPerPage,
    setQ,
    setDesde,
    setHasta,
    loading,
    error,
  } = useHistorialLimpiezas({ page: 1, per_page: 20, q: "" }, { keepPreviousData: true });

  const rows = data ?? [];
 

  /** --- Impresión --- */
  const [printAll, setPrintAll] = useState(false);
  const [prevPerPage, setPrevPerPage] = useState(perPage);

  const handlePrintCurrent = () => window.print();

  const handlePrintAllFiltered = () => {
    setPrintAll(true);
    setPrevPerPage(perPage);
    setPage(1);
    setPerPage(1000); // traer todas las filas del filtro
    setTimeout(() => window.print(), 400);
  };

  useEffect(() => {
    const onAfterPrint = () => {
      if (printAll) {
        setPerPage(prevPerPage);
        setPrintAll(false);
      }
    };
    window.addEventListener("afterprint", onAfterPrint);
    return () => window.removeEventListener("afterprint", onAfterPrint);
  }, [printAll, prevPerPage, setPerPage]);

  const renderRows = () => {
    if (loading && rows.length === 0) {
      return (
        <tr data-print-hide>
          <td className="px-4 py-4" colSpan={6}>
            Cargando...
          </td>
        </tr>
      );
    }
    if (error && rows.length === 0) {
      return (
        <tr data-print-hide>
          <td className="px-4 py-4 text-red-600" colSpan={6}>
            {error.message}
          </td>
        </tr>
      );
    }
    if (rows.length === 0) {
      return (
        <tr>
          <td className="px-4 py-6 text-slate-500" colSpan={6}>
            Sin resultados.
          </td>
        </tr>
      );
    }

    return rows.map((h: any) => (
      <tr key={h.id_historial_limp} className="border-t border-slate-100 align-top break-avoid">
        <td className="px-4 py-4">
          <span className="badge inline-flex min-w-[42px] justify-center rounded-xl bg-slate-50 px-2.5 py-1.5 text-sm font-semibold ring-1 ring-slate-200">
            {getRoomNumber(h)}
          </span>
        </td>
        <td className="px-4 py-4 whitespace-nowrap">{fmtDatetime(asPrimitiveString(h.fecha))}</td>
        <td className="px-4 py-4 font-medium">{h.evento ?? "—"}</td>
        <td className="px-4 py-4">{h.actor?.nombre ?? h.actor?.email ?? "—"}</td>
        <td className="px-4 py-4">
          <ValueBlock json={h.valor_anterior} />
        </td>
        <td className="px-4 py-4">
          <ValueBlock json={h.valor_nuevo} />
        </td>
      </tr>
    ));
  };

  return (
    <div className="min-h-screen bg-white text-[#0f172a]">
      {/* Estilos de impresión (solo header + tabla) */}
      <PrintStyles areaId="print-area" pageSize="A4" margin="12mm" tableFontSize={11} />

      {/* Header UI (no se imprime) */}
      <header className="no-print bg-white/80 backdrop-blur-sm border-b border-slate-200/60 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-slate-50 ring-1 ring-slate-200 shadow flex items-center justify-center overflow-hidden">
              <img src={SolLogo} alt="Lanaku" className="w-10 h-10 object-contain" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">Historiales de limpieza</h1>
              <p className="text-sm text-slate-600">Hoja consolidada • lista para imprimir</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrintCurrent}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 shadow-sm"
            >
              Imprimir esta página
            </button>
            <button
              onClick={handlePrintAllFiltered}
              className="rounded-lg border border-emerald-300 px-4 py-2 text-sm font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 shadow-sm"
              title="Imprime todas las filas que coinciden con tu filtro actual"
            >
              Imprimir filtro (todo)
            </button>
          </div>
        </div>
      </header>

      {/* Contenido */}
      <main className="px-4 py-6">
        <div className="max-w-7xl mx-auto space-y-4">
          {/* Filter Bar (no se imprime) */}
          <div className="no-print">
            <FilterBarHistoriales
              q={q}
              desde={desde}
              hasta={hasta}
              perPage={perPage}
              total={total}
              onChange={(next) => {
                if (typeof next.q !== "undefined") setQ(next.q);
                if (typeof next.desde !== "undefined") setDesde(next.desde);
                if (typeof next.hasta !== "undefined") setHasta(next.hasta);
                if (typeof next.perPage !== "undefined") setPerPage(next.perPage);
                setPage(1);
              }}
            />
          </div>

          {/* ÁREA QUE SE IMPRIME */}
          <section
            id="print-area"
            className="rounded-2xl bg-white shadow ring-1 ring-slate-200 p-0 print:shadow-none print:ring-0"
          >
            {/* Encabezado SOLAMENTE para impresión */}
            <div className="print-header print-only">
              <img src={SolLogo} alt="Lanaku" className="print-logo" />
              <div>
                <div className="print-title">Historiales de limpieza</div>
                <div className="print-sub">Listado consolidado</div>
              </div>
            </div>

            {/* Tabla */}
            <div className="overflow-x-auto print-allow-overflow">
              <table className="hist-table w-full text-sm">
                {/* Anchos fijos para evitar cabeceras rotas */}
                <colgroup>
                  <col style={{ width: "16mm" }} />
                  <col style={{ width: "34mm" }} />
                  <col style={{ width: "28mm" }} />
                  <col style={{ width: "40mm" }} />
                  <col />
                  <col />
                </colgroup>

                <thead>
                  <tr>
                    <th>Habitación</th>
                    <th>Fecha</th>
                    <th>Evento</th>
                    <th>Actor</th>
                    <th>Valor anterior</th>
                    <th>Valor nuevo</th>
                  </tr>
                </thead>
                <tbody>{renderRows()}</tbody>
              </table>
            </div>

           
          </section>
        </div>
      </main>
    </div>
  );
}
