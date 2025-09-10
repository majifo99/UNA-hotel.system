import { FilterBar } from "../components/FilterBar";
import { MaintenanceTable } from "../components/MaintenanceTable";
import { useMaintenance } from "../hooks/useMaintenance";

// Icons (lucide-react)
import { Bell, FileText, LogOut, Wrench} from "lucide-react";

export default function MantenimientoPage() {
  const { filtered, metrics, query, setQuery, status, setStatus, loading } = useMaintenance();
  const disponibles = Math.max(0, metrics.total - (metrics.pending + metrics.inProgress));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 text-[#0f172a]">
      <div className="mx-auto max-w-7xl py-6">
        {/* HEADER */}
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-3xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-br from-teal-600 to-teal-700">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                  <Wrench className="w-4 h-4 text-teal-700" />
                </div>
              </div>
              <div>
                <h1 className="text-[22px] font-semibold leading-6">Dashboard de mantenimiento</h1>
                <p className="text-sm text-slate-600">Área de mantenimiento – control y seguimiento</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                className="inline-flex items-center gap-2 rounded-lg  px-4 py-2 text-sm font-medium text-slate-700 bg-white/80 hover:bg-white "
                aria-label="Notificaciones"
              >
                <span className="inline-flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  <span className="rounded-md bg-rose-600 px-2 py-0.5 text-white text-sm">2</span>
                </span>
              </button>

              <button className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 bg-white/80 hover:bg-white shadow-sm">
                <FileText className="h-4 w-4" />
                Reporte
              </button>
              <button className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 bg-white/80 hover:bg-white shadow-sm">
                <LogOut className="h-4 w-4" />
                Cerrar sesión
              </button>
            </div>
          </div>

          {/* MÉTRICAS (estilo HK) */}
          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                <div className="flex items-center gap-3 px-3 py-2 bg-red-50 rounded-lg border border-red-100">
                  <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-sm font-medium text-slate-700">Pendientes</span>
                  <span className="text-xl font-bold text-red-600">{metrics.pending}</span>
                </div>

                <div className="flex items-center gap-3 px-3 py-2 bg-blue-50 rounded-lg border border-blue-100">
                  <span className="h-2 w-2 rounded-full bg-blue-500" />
                  <span className="text-sm font-medium text-slate-700">En proceso</span>
                  <span className="text-xl font-bold text-blue-600">{metrics.inProgress}</span>
                </div>

                <div className="flex items-center gap-3 px-3 py-2 bg-emerald-50 rounded-lg border border-emerald-100">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-sm font-medium text-slate-700">Completados</span>
                  <span className="text-xl font-bold text-emerald-600">{metrics.done}</span>
                </div>

                <div className="flex items-center gap-3 px-3 py-2 bg-sky-50 rounded-lg border border-sky-100">
                  <span className="h-2 w-2 rounded-full bg-sky-500" />
                  <span className="text-sm font-medium text-slate-700">Disponibles</span>
                  <span className="text-xl font-bold text-sky-600">{disponibles}</span>
                </div>
              </div>

              <div className="text-sm text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
                Total: {metrics.total} mantenimientos
              </div>
            </div>
          </div>
        </header>

        {/* BARRA DE BÚSQUEDA / FILTROS / ACCIONES */}
        <div className="mt-4 rounded-3xl  bg-white/80 backdrop-blur-sm">
          <div className="px-6 py-4">
            <FilterBar
              query={query}
              onQuery={setQuery}
              status={status}
              onStatus={setStatus}
              total={filtered.length}
            />
          </div>
        </div>

        {/* TABLA */}
        <div className="px-0 sm:px-1 md:px-2 lg:px-0 mt-4">
          {loading ? (
            <div className="mx-6 grid place-items-center rounded-2xl  bg-white p-16 text-gray-500">
              Cargando mantenimiento...
            </div>
          ) : (
            <div className="mx-6">
              <MaintenanceTable items={filtered} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
