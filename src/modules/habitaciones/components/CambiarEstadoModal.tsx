// src/modules/habitaciones/components/CambiarEstadoModal.tsx
/**
 * Modal para cambiar el estado de una habitación
 * Diseño actualizado para coincidir con módulos de housekeeping y mantenimiento
 */

import { useState } from 'react';
import { Save, X, Loader2 } from 'lucide-react';
import { Modal } from './Modal';
import { useCatalogos } from '../hooks/useHabitaciones';
import type { Habitacion } from '../types/habitacion';

interface CambiarEstadoModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly habitacion: Habitacion | null;
  readonly onSubmit: (idHabitacion: number, idEstado: number) => void;
  readonly loading?: boolean;
}

export function CambiarEstadoModal({
  isOpen,
  onClose,
  habitacion,
  onSubmit,
  loading = false,
}: Readonly<CambiarEstadoModalProps>) {
  const { estados, loading: catalogosLoading } = useCatalogos();
  const [selectedEstado, setSelectedEstado] = useState<number>(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (habitacion && selectedEstado > 0) {
      onSubmit(habitacion.id_habitacion, selectedEstado);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Cambiar Estado - Habitación ${habitacion?.numero || ''}`}
    >
      {catalogosLoading ? (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Estado actual */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
            <p className="text-sm font-medium text-emerald-700 mb-1">Estado actual:</p>
            <p className="text-lg font-semibold text-emerald-900">{habitacion?.estado.nombre}</p>
          </div>

          {/* Nuevo estado */}
          <div>
            <label htmlFor="nuevo-estado" className="block text-sm font-medium text-slate-700 mb-2">
              Nuevo Estado *
            </label>
            <select
              id="nuevo-estado"
              value={selectedEstado}
              onChange={(e) => setSelectedEstado(Number(e.target.value))}
              required
              className="w-full px-4 py-2.5 bg-white/80 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            >
              <option value={0}>Seleccione un estado</option>
              {estados.map((estado) => (
                <option key={estado.id_estado_hab} value={estado.id_estado_hab}>
                  {estado.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-5 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              <X className="h-4 w-4" />
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || selectedEstado === 0}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium shadow-sm hover:shadow-md"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Actualizando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Cambiar Estado
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}