import { useEffect, useMemo, useState } from "react";
import { Wrench, UserCheck, CheckCircle2, Clock } from "lucide-react";
import DetailModal from "../UI/DetailModal";
import type { MantenimientoItem } from "../../types/mantenimiento";

import FinalizarMantenimientoModal from "./FinalizarMantenimientoModal";
import { formatDatetime } from "../../../housekeeping/utils/formatters";

type Props = Readonly<{
  open: boolean;
  mantenimientoId: number | null;
  onClose: () => void;
  onFinalized?: () => void; // Callback when finalized successfully
  item?: MantenimientoItem | null; // ✨ Recibir el item directamente para evitar fetch
}>;
const BRAND = "#304D3C";
const { Card, Label } = DetailModal;

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

export default function MantenimientoDetailModal({ open, onClose, onFinalized, item: itemProp }: Props) {
  const [loading, setLoading] = useState(false);
  const [item, setItem] = useState<MantenimientoItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showFinalizarModal, setShowFinalizarModal] = useState(false);


  // ✨ Si recibimos el item como prop, usarlo directamente (optimistic)
  useEffect(() => {
    if (itemProp) {
      setItem(itemProp);
      setLoading(false);
      setError(null);
    }
  }, [itemProp]);

 
        
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const titulo = useMemo(() => `Habitación ${item?.habitacion?.numero ?? "—"}`, [item]);
  const isFinalizado = item?.fecha_final !== null && item?.fecha_final !== undefined;

  /**
   * Handle finalizar button click
   */
  const handleFinalizarClick = () => {
    setShowFinalizarModal(true);
  };

  /**
   * Handle finalization success
   */
  const handleFinalizationSuccess = (updated?: MantenimientoItem) => {
    setShowFinalizarModal(false);
    // Update local item
    if (updated) {
      setItem(updated);
    }
    // Call parent callback
    onFinalized?.();
  };

  return (
    <>
      <DetailModal
        open={open}
        onClose={onClose}
        title={titulo}
        icon={<Wrench className="w-5 h-5 text-white" />}
        finishedAt={item?.fecha_final ?? null}
        brand={BRAND}
        maxWidthClass="max-w-4xl"
        // Add Finalizar button in footer if not already finalized
        footer={
          <div className="flex items-center justify-between w-full">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              Cerrar
            </button>
            {!isFinalizado && item && (
              <button
                type="button"
                onClick={handleFinalizarClick}
                className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors"
              >
                <CheckCircle2 className="h-4 w-4" />
                Finalizar Mantenimiento
              </button>
            )}
          </div>
        }
      >
      <div className="px-6 py-6">
        {loading && <div className="text-sm text-slate-500 py-10 text-center">Cargando detalles…</div>}
        {error && <div className="text-sm text-rose-600 py-10 text-center">Error: {error}</div>}
        {!loading && !error && item && (
          <div className="space-y-6">
            {/* Información Principal - Grid de 3 columnas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Habitación */}
              <Card className="bg-gradient-to-br from-slate-50 to-slate-100/50">
                <Label brand={BRAND}>HABITACIÓN</Label>
                <div className="mt-4 space-y-3">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Tipo</span>
                    <div className="flex-1 border-b border-dotted border-slate-300"></div>
                    <strong className="text-sm text-slate-800">{item.habitacion?.tipo?.nombre ?? "—"}</strong>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Piso</span>
                    <div className="flex-1 border-b border-dotted border-slate-300"></div>
                    <strong className="text-sm text-slate-800">{item.habitacion?.piso ?? "—"}</strong>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Prioridad</span>
                    <div className="flex-1 border-b border-dotted border-slate-300"></div>
                    <strong className="text-sm text-slate-800 capitalize">{item.prioridad ?? "—"}</strong>
                  </div>
                </div>
              </Card>

              {/* Programación */}
              <Card className="bg-gradient-to-br from-purple-50/50 to-purple-100/30">
                <Label brand={BRAND}>PROGRAMACIÓN</Label>
                <div className="mt-4 space-y-3">
                 
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-white/40 border border-slate-200/50">
                    <Clock className="w-5 h-5 mt-0.5 text-purple-600 flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Fin</div>
                      <div className="text-sm font-semibold text-slate-700">
                        {formatDatetime(item.fecha_final)}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Asignación */}
              <Card className="bg-gradient-to-br from-emerald-50/50 to-emerald-100/30">
                <Label brand={BRAND}>ASIGNACIÓN</Label>
                <div className="mt-4 space-y-3">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-white/60 border border-emerald-200/50">
                    <UserCheck className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: BRAND }} />
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Asignado a</div>
                      <div className="text-sm font-semibold text-slate-800 truncate">
                        {item.usuario_asignado?.nombre ?? "Sin asignar"}
                      </div>
                    </div>
                  </div>
                  {item.usuario_reporta && (
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-white/40 border border-slate-200/50">
                      <UserCheck className="w-5 h-5 mt-0.5 text-slate-400 flex-shrink-0" />
                      <div className="min-w-0">
                        <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Reportado por</div>
                        <div className="text-sm font-semibold text-slate-700 truncate">
                          {item.usuario_reporta.nombre}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* Notas y Descripción - Full width */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Notas */}
              <div className="border-l-4 border-l-emerald-700">
                <Card>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-700"></div>
                    <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wide">Notas</h3>
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed min-h-[60px] whitespace-pre-wrap">
                    {item.notas || <span className="text-slate-400 italic">Sin notas</span>}
                  </p>
                </Card>
              </div>

              {/* Descripción */}
              <div className="border-l-4 border-l-slate-300">
                <Card>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-1.5 w-1.5 rounded-full bg-slate-400"></div>
                    <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wide">Descripción de la habitación</h3>
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed min-h-[60px] whitespace-pre-wrap">
                    {getRoomDescription(item)}
                  </p>
                </Card>
              </div>
            </div>


           
             
            
          </div>
        )}
      </div>
    </DetailModal>

      {/* Finalizar Mantenimiento Modal */}
      <FinalizarMantenimientoModal
        isOpen={showFinalizarModal}
        onClose={() => setShowFinalizarModal(false)}
        item={item}
        onFinalized={handleFinalizationSuccess}
      />
    </>
  );
}
