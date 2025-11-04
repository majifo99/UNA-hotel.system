import { useEffect, useMemo, useState } from "react";
import { Wrench, CalendarDays, Clock, UserCheck, BadgeCheck } from "lucide-react";
import DetailModal, { fmtDateTime } from "../UI/DetailModal";
import type { MantenimientoItem } from "../../types/mantenimiento";
import { mantenimientoService } from "../../services/maintenanceService";

type Props = Readonly<{ open: boolean; mantenimientoId: number | null; onClose: () => void }>;
const BRAND = "#304D3C";
const { Card, Label, Pill } = DetailModal;

const getRoomDescription = (item: any): string => {
  if (!item?.habitacion) return "—";
  const direct =
    item.habitacion.descripcion ?? item.habitacion.descripcion_habitacion ??
    item.habitacion.desc ?? item.habitacion.detalle ?? item.habitacion.detalles ??
    item.habitacion.caracteristicas;
  if (typeof direct === "string" && direct.trim()) return direct;
  const fromTipo = item.habitacion.tipo?.descripcion;
  if (typeof fromTipo === "string" && fromTipo.trim()) return fromTipo;
  const weird = item.habitacion.Descripcion ?? item.habitacion.DescripcionHabitacion ?? item.habitacion.DESCRIPCION;
  return (typeof weird === "string" && weird.trim()) ? weird : "—";
};

export default function MantenimientoDetailModal({ open, mantenimientoId, onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const [item, setItem] = useState<MantenimientoItem | null>(null);
  const [error, setError] = useState<string | null>(null);

  // demo historial
  const history = [
    { fecha: "22/9/2025", usuario: "Ana García", texto: "Se cambió filtro A/C", estado: "Completado" },
    { fecha: "21/9/2025", usuario: "María López", texto: "Revisión inicial", estado: "Completado" },
  ];

  useEffect(() => {
    if (!open || !mantenimientoId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await mantenimientoService.getMantenimientoById(mantenimientoId);
        if (!cancelled) setItem(res.data);
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? "Error cargando detalles");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [open, mantenimientoId]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const titulo = useMemo(() => `Habitación ${item?.habitacion?.numero ?? "—"}`, [item]);
  const estadoNombre = (item as any)?.estado?.nombre ?? "—";

  return (
    <DetailModal
      open={open}
      onClose={onClose}
      title={titulo}
      icon={<Wrench className="w-5 h-5 text-white" />}
      finishedAt={item?.fecha_final ?? null}
      brand={BRAND}
      maxWidthClass="max-w-4xl"
    >
      <div className="px-6 py-5">
        {loading && <div className="text-sm text-slate-500 py-10 text-center">Cargando detalles…</div>}
        {error && <div className="text-sm text-rose-600 py-10 text-center">Error: {error}</div>}
        {!loading && !error && item && (
          <>
            {/* Resumen */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6">
              <Card className="md:col-span-3">
                <Label brand={BRAND}>ESTADO</Label>
                <div className="mt-2">
                  <Pill tone={estadoNombre?.toLowerCase() === "completado" ? "green" : "rose"}>{estadoNombre}</Pill>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-y-1 text-sm text-slate-700">
                  <div className="col-span-2">
                    <span className="text-slate-500">Tipo: </span>
                    <strong>{item.habitacion?.tipo?.nombre ?? "—"}</strong>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-500">Piso: </span>
                    <strong>{item.habitacion?.piso ?? "—"}</strong>
                  </div>
                </div>
              </Card>

              <Card className="md:col-span-5">
                <Label brand={BRAND}>PROGRAMACIÓN</Label>
                <div className="text-sm mt-2 space-y-2 text-slate-700">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-4 h-4" />
                    <span>Inicio: <strong>{fmtDateTime(item.fecha_inicio)}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>Fin: <strong>{fmtDateTime(item.fecha_final)}</strong></span>
                  </div>
                </div>
              </Card>

              <Card className="md:col-span-4">
                <Label brand={BRAND}>ASIGNACIÓN</Label>
                <div className="text-sm mt-2 text-slate-700">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4" style={{ color: BRAND }} />
                    <span>
                      Responsable: <strong>{item.usuario_asignado?.nombre ?? (item as any)?.asignador?.name ?? "—"}</strong>
                    </span>
                  </div>
                  {item.usuario_reporta?.nombre && (
                    <div className="mt-1">
                      <span className="text-slate-500">Reportado por: </span>
                      <strong>{item.usuario_reporta?.nombre}</strong>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* Notas y descripción */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6">
              <Card className="md:col-span-5">
                <div className="text-slate-700 font-medium mb-2">Notas</div>
                <p className="text-sm text-slate-700 min-h-10">{item.notas ?? "—"}</p>
              </Card>
              <Card className="md:col-span-7">
                <div className="text-slate-700 font-medium mb-2">Descripción de la habitación</div>
                <p className="text-sm text-slate-700 min-h-10">{getRoomDescription(item)}</p>
              </Card>
            </div>

            {/* Historial */}
            <Card>
              <div className="text-slate-700 font-medium mb-3">Historial de mantenimiento</div>
              <div className="space-y-3">
                {history.map((h) => (
                  <div key={`${h.fecha}-${h.usuario}-${h.estado}`}
                    className="grid grid-cols-1 md:grid-cols-12 items-center gap-3 rounded-lg border border-slate-200/70 p-3">
                    <div className="md:col-span-3">
                      <div className="text-sm font-medium text-slate-900">{h.fecha}</div>
                      <div className="text-xs text-slate-600">{h.usuario}</div>
                    </div>
                    <div className="md:col-span-9 flex items-center justify-between gap-3">
                      <Pill tone="green"><span className="inline-flex items-center gap-1"><BadgeCheck className="w-3 h-3" /> {h.estado}</span></Pill>
                      <div className="text-xs text-slate-600">{h.texto}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </>
        )}
      </div>
    </DetailModal>
  );
}
