"use client";

import { useEffect, useState } from "react";
import { useHistorialMantenimientos } from "../hooks/useHistorialMantenimientos";
import PrintStyles from "../../housekeeping/components/UI/PrintStyles"; // reutilizado
import SolLogo from "../../../assets/Lanaku.png"; // ajusta import
// Si ya tienes FilterBarHistoriales genérica, reutilízala:
import FilterBarHistoriales from "../../housekeeping/components/FilterBarHistoriales";

const HOUR12 = false;
const BRAND_GREEN = "#1F392A";

function fmtDatetime(v?: string | null) {
  if (!v || v === "—" || v === "-") return "—";
  const clean = typeof v === "string" ? v.replaceAll(/(\.\d{3})\d+(Z)?$/g, "$1$2") : v;
  const d = new Date(String(clean));
  if (Number.isNaN(d.getTime())) return String(v);
  return new Intl.DateTimeFormat("es-CR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: HOUR12,
  }).format(d);
}
type KV = Record<string, unknown>;
const FIELDS_ORDER = [
  "notas","prioridad","fecha_inicio","fecha_final",
  "id_usuario_asigna","id_usuario_reporta","inicio","final",
  "asignado","reporte","estado",
];
const LABELS: Record<string,string> = {
  notas:"Notas", prioridad:"Prioridad", fecha_inicio:"Fecha Inicio", fecha_final:"Fecha Final",
  id_usuario_asigna:"Id Usuario Asigna", id_usuario_reporta:"Id Usuario Reporta",
  inicio:"Inicio", final:"Final", asignado:"Asignado", reporte:"Reporte", estado:"Estado",
};
const HIDDEN_KEYS = new Set<string>(["fecha_reporte"]);

function parseJsonSafe(value?: string | KV | null): KV | null {
  if (!value) return null;
  if (typeof value === "object") return value;
  try { return JSON.parse(value); } catch { return { raw: value } as KV; }
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
  try { const j = JSON.stringify(v); return j === "{}" || j === "[]" ? "—" : j; } catch { return "—"; }
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
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ${cls}`}>{v}</span>;
}

function ValueBlock({ json }: Readonly<{ json: string | KV | null | undefined }>) {
  const original = parseJsonSafe(json) ?? {};
  const obj: KV = Object.fromEntries(Object.entries(original).filter(([k]) => !HIDDEN_KEYS.has(k)));
  const orderedKnown = FIELDS_ORDER.filter((k) => k in obj);
  const remaining = Object.keys(obj).filter((k) => !FIELDS_ORDER.includes(k));
  const keys = [...orderedKnown, ...remaining];
  if (Object.keys(obj).length === 0) return <span className="text-slate-500">—</span>;

  return (
    <div className="space-y-1.5">
      {keys.map((k) => {
        const label = LABELS[k] ?? k.replaceAll("_"," ").replaceAll(/\b\w/g, s => s.toUpperCase());
        const val = obj[k];
        const isDateKey = /fecha|inicio|final|reporte/i.test(k);
        let content: React.ReactNode;
        if (k === "prioridad") content = <PriorityPill value={asPrimitiveString(val)} />;
        else if (isDateKey) content = fmtDatetime(asPrimitiveString(val) ?? undefined);
        else content = toDisplay(val);
        return (
          <div key={k} className="flex items-center gap-2 break-inside-avoid">
            <span className="kv-label shrink-0 text-[11px] font-medium text-slate-500 w-32">{label}</span>
            <span className="text-sm leading-5 break-words">{content}</span>
          </div>
        );
      })}
    </div>
  );
}

function getMantCode(h: any): string {
  return (h.id_mantenimiento ?? h.mantenimiento?.id_mantenimiento ?? "—").toString();
}

export default function HistorialMantenimientosPage() {
  const {
    data, total, perPage, q, desde, hasta,
    setPage, setPerPage, setQ, setDesde, setHasta,
    loading, error,
  } = useHistorialMantenimientos({ page: 1, per_page: 20, q: "" }, { keepPreviousData: true });

  const rows = data ?? [];
  const [printAll, setPrintAll] = useState(false);
  const [prevPerPage, setPrevPerPage] = useState(perPage);

  const handlePrintCurrent = () => globalThis.print?.();
  const handlePrintAllFiltered = () => {
    setPrintAll(true);
    setPrevPerPage(perPage);
    setPage(1);
    setPerPage(1000);
    setTimeout(() => globalThis.print?.(), 400);
  };

  useEffect(() => {
    const onAfterPrint = () => {
      if (printAll) { setPerPage(prevPerPage); setPrintAll(false); }
    };
    globalThis.addEventListener?.("afterprint", onAfterPrint);
    return () => globalThis.removeEventListener?.("afterprint", onAfterPrint);
  }, [printAll, prevPerPage, setPerPage]);

  const renderRows = () => {
    if (loading && rows.length === 0) {
      return (<tr><td colSpan={6} className="px-4 py-3 text-center text-slate-500">Cargando...</td></tr>);
    }
    if (error && rows.length === 0) {
      return (<tr><td colSpan={6} className="px-4 py-3 text-center text-red-600">{error.message}</td></tr>);
    }
    if (rows.length === 0) {
      return (<tr><td colSpan={6} className="px-4 py-6 text-center text-slate-500">Sin resultados.</td></tr>);
    }

    return rows.map((h: any, idx: number) => (
      <tr key={h.id_historial_mant ?? `${getMantCode(h)}-${idx}`} className="align-top odd:bg-slate-50/50 hover:bg-slate-100/60 transition-colors break-inside-avoid">
        <td className="px-4 py-2">
          <span className="inline-flex min-w-[40px] justify-center rounded-md bg-slate-100 px-2 py-1 text-sm font-semibold ring-1 ring-slate-200">
            {getMantCode(h)}
          </span>
        </td>
        <td className="px-4 py-2 whitespace-nowrap text-slate-700">{fmtDatetime(h.fecha)}</td>
        <td className="px-4 py-2 font-medium text-slate-800">{h.evento ?? "—"}</td>
        <td className="px-4 py-2 text-slate-700">{h.actor?.nombre ?? h.actor?.email ?? "—"}</td>
        <td className="px-4 py-2"><ValueBlock json={h.valor_anterior} /></td>
        <td className="px-4 py-2"><ValueBlock json={h.valor_nuevo} /></td>
      </tr>
    ));
  };

  return (
    <div className="min-h-screen bg-white text-[#0f172a]">
      <PrintStyles areaId="print-area" pageSize="A4" margin="10mm" tableFontSize={10} brandColor={BRAND_GREEN} />

      <header className="no-print bg-white/80 backdrop-blur-sm border-b border-slate-200/60 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-slate-50 ring-1 ring-slate-200 shadow flex items-center justify-center overflow-hidden">
              <img src={SolLogo} alt="Lanaku" className="w-10 h-10 object-contain" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">Historiales de mantenimiento</h1>
              <p className="text-sm text-slate-600">Hoja consolidada • lista para imprimir</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={handlePrintCurrent} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 shadow-sm">
              Imprimir esta página
            </button>
            <button onClick={handlePrintAllFiltered} className="rounded-lg border border-emerald-300 px-4 py-2 text-sm font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 shadow-sm">
              Imprimir filtro (todo)
            </button>
          </div>
        </div>
      </header>

      <main className="px-4 py-6">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="no-print">
            <FilterBarHistoriales
              q={q} desde={desde} hasta={hasta} perPage={perPage} total={total}
              onChange={(next) => {
                if (next.q !== undefined) setQ(next.q);
                if (next.desde !== undefined) setDesde(next.desde);
                if (next.hasta !== undefined) setHasta(next.hasta);
                if (next.perPage !== undefined) setPerPage(next.perPage);
                setPage(1);
              }}
            />
          </div>

          <section id="print-area" className="rounded-2xl bg-white shadow ring-1 ring-slate-200 p-0 print:shadow-none print:ring-0">
            <div className="print-header print-only">
              <img src={SolLogo} alt="Lanaku" className="print-logo" />
              <div>
                <div className="print-title">Historiales de mantenimiento</div>
                <div className="print-sub">Listado consolidado</div>
              </div>
            </div>

            <div className="overflow-x-auto print-allow-overflow">
              <table className="hist-table w-full text-sm">
                <thead style={{ backgroundColor: BRAND_GREEN, color: "white" }}>
                  <tr>
                    {["Mantenimiento", "Fecha", "Evento", "Actor", "Valor anterior", "Valor nuevo"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">{renderRows()}</tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
