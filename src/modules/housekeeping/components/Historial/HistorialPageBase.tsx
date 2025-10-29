// src/modules/housekeeping/components/Historial/HistorialPageBase.tsx
/**
 * Componente base reutilizable para páginas de historial
 * Elimina duplicidad entre HistorialLimpiezasPage y HistorialMantenimientosPage
 */
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import FilterBarHistoriales from "../FilterBarHistoriales";
import SolLogo from "../../../../assets/Lanaku.png";
import PrintStyles from "../UI/PrintStyles";
import { HISTORIAL_CONFIG } from "./HistorialComponents";

const { BRAND_GREEN } = HISTORIAL_CONFIG;

export interface HistorialPageConfig {
  pageTitle: string;
  pageSubtitle?: string;
  printTitle: string;
  printSubtitle?: string;
  tableHeaders: string[];
}

export interface HistorialPageData {
  data: any[];
  total: number;
  perPage: number;
  q: string;
  desde?: string;
  hasta?: string;
  setPage: (page: number) => void;
  setPerPage: (perPage: number) => void;
  setQ: (q: string) => void;
  setDesde: (desde: string | undefined) => void;
  setHasta: (hasta: string | undefined) => void;
  loading: boolean;
  error: Error | null;
}

export interface HistorialPageBaseProps {
  config: HistorialPageConfig;
  hookData: HistorialPageData;
  renderTableRow: (item: any, index: number) => ReactNode;
}

/**
 * Componente base para páginas de historial con impresión y filtros
 */
export function HistorialPageBase({ config, hookData, renderTableRow }: HistorialPageBaseProps) {
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
  } = hookData;

  const rows = data ?? [];
  const [printAllMode, setPrintAllMode] = useState(false);
  const [previousPerPage, setPreviousPerPage] = useState(perPage);

  const triggerPrintCurrent = () => globalThis.print?.();

  const triggerPrintAllFiltered = () => {
    setPrintAllMode(true);
    setPreviousPerPage(perPage);
    setPage(1);
    setPerPage(1000);
    setTimeout(() => globalThis.print?.(), 400);
  };

  useEffect(() => {
    const handleAfterPrint = () => {
      if (printAllMode) {
        setPerPage(previousPerPage);
        setPrintAllMode(false);
      }
    };
    globalThis.addEventListener?.("afterprint", handleAfterPrint);
    return () => globalThis.removeEventListener?.("afterprint", handleAfterPrint);
  }, [printAllMode, previousPerPage, setPerPage]);

  const renderTableBody = () => {
    if (loading && rows.length === 0) {
      return (
        <tr>
          <td colSpan={6} className="px-4 py-3 text-center text-slate-500">
            Cargando...
          </td>
        </tr>
      );
    }
    if (error && rows.length === 0) {
      return (
        <tr>
          <td colSpan={6} className="px-4 py-3 text-center text-red-600">
            {error.message}
          </td>
        </tr>
      );
    }
    if (rows.length === 0) {
      return (
        <tr>
          <td colSpan={6} className="px-4 py-6 text-center text-slate-500">
            Sin resultados.
          </td>
        </tr>
      );
    }

    return rows.map((item, index) => renderTableRow(item, index));
  };

  return (
    <div className="min-h-screen bg-white text-[#0f172a]">
      <PrintStyles
        areaId="print-area"
        pageSize="A4"
        margin="10mm"
        tableFontSize={10}
        brandColor={BRAND_GREEN}
      />

      {/* Header (no print) */}
      <header className="no-print bg-white/80 backdrop-blur-sm border-b border-slate-200/60 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-slate-50 ring-1 ring-slate-200 shadow flex items-center justify-center overflow-hidden">
              <img src={SolLogo} alt="Lanaku" className="w-10 h-10 object-contain" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">{config.pageTitle}</h1>
              <p className="text-sm text-slate-600">
                {config.pageSubtitle ?? "Hoja consolidada • lista para imprimir"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={triggerPrintCurrent}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 shadow-sm"
            >
              Imprimir esta página
            </button>
            <button
              onClick={triggerPrintAllFiltered}
              className="rounded-lg border border-emerald-300 px-4 py-2 text-sm font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 shadow-sm"
            >
              Imprimir filtro (todo)
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="px-4 py-6">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="no-print">
            <FilterBarHistoriales
              q={q}
              desde={desde}
              hasta={hasta}
              perPage={perPage}
              total={total}
              onChange={(next) => {
                if (next.q !== undefined) setQ(next.q);
                if (next.desde !== undefined) setDesde(next.desde);
                if (next.hasta !== undefined) setHasta(next.hasta);
                if (next.perPage !== undefined) setPerPage(next.perPage);
                setPage(1);
              }}
            />
          </div>

          {/* Print area */}
          <section
            id="print-area"
            className="rounded-2xl bg-white shadow ring-1 ring-slate-200 p-0 print:shadow-none print:ring-0"
          >
            <div className="print-header print-only">
              <img src={SolLogo} alt="Lanaku" className="print-logo" />
              <div>
                <div className="print-title">{config.printTitle}</div>
                <div className="print-sub">{config.printSubtitle ?? "Listado consolidado"}</div>
              </div>
            </div>

            <div className="overflow-x-auto print-allow-overflow">
              <table className="hist-table w-full text-sm">
                <thead style={{ backgroundColor: BRAND_GREEN, color: "white" }}>
                  <tr>
                    {config.tableHeaders.map((header) => (
                      <th
                        key={header}
                        className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">{renderTableBody()}</tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
