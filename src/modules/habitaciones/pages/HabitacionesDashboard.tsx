// src/modules/habitaciones/pages/HabitacionesDashboard.tsx
/**
 * Dashboard principal de gestión de habitaciones
 */

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useHabitaciones, useCreateHabitacion, useUpdateHabitacion, useChangeEstado } from '../hooks/useHabitaciones';
import { RoomsTable } from '../components/RoomsTable';
import { Modal } from '../components/Modal';
import { HabitacionForm, type HabitacionFormData } from '../components/HabitacionForm';
import { CambiarEstadoModal } from '../components/CambiarEstadoModal';
import type { Habitacion } from '../types/habitacion';

export default function HabitacionesDashboard() {
  const {
    habitaciones,
    loading,
    error,
    total,
  } = useHabitaciones({ perPage: 100 });

  // Estado para modales
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEstadoModalOpen, setIsEstadoModalOpen] = useState(false);
  const [selectedHabitacion, setSelectedHabitacion] = useState<Habitacion | null>(null);

  // Mutaciones
  const createMutation = useCreateHabitacion();
  const updateMutation = useUpdateHabitacion();
  const changeEstadoMutation = useChangeEstado();

  // Handlers
  const handleCreate = async (data: HabitacionFormData) => {
    try {
      await createMutation.mutateAsync(data);
      setIsCreateModalOpen(false);
    } catch (err) {
      console.error('Error creating habitacion:', err);
    }
  };

  const handleEdit = (habitacion: Habitacion) => {
    setSelectedHabitacion(habitacion);
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (data: HabitacionFormData) => {
    if (!selectedHabitacion) return;
    try {
      await updateMutation.mutateAsync({ id: selectedHabitacion.id_habitacion, data });
      setIsEditModalOpen(false);
      setSelectedHabitacion(null);
    } catch (err) {
      console.error('Error updating habitacion:', err);
    }
  };

  const handleOpenEstadoModal = (habitacion: Habitacion) => {
    setSelectedHabitacion(habitacion);
    setIsEstadoModalOpen(true);
  };

  const handleChangeEstado = async (idHabitacion: number, idEstado: number) => {
    try {
      await changeEstadoMutation.mutateAsync({ id: idHabitacion, idEstado });
      setIsEstadoModalOpen(false);
      setSelectedHabitacion(null);
    } catch (err) {
      console.error('Error changing estado:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Gestión de Habitaciones
              </h1>
              <p className="text-slate-600 mt-1">
                Administra el inventario de habitaciones del hotel
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-3xl font-bold text-[#304D3C]">{total}</div>
                <div className="text-sm text-slate-600">Total Habitaciones</div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium shadow-sm hover:shadow-md"
              >
                <Plus className="h-5 w-5" />
                Nueva Habitación
              </button>
            </div>
          </div>
        </div>

        {/* Métricas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <MetricCard
            title="Disponibles"
            value={habitaciones.filter(h => h.estado.nombre.toLowerCase().includes('disponible')).length}
            color="green"
          />
          <MetricCard
            title="Ocupadas"
            value={habitaciones.filter(h => h.estado.nombre.toLowerCase().includes('ocupada')).length}
            color="red"
          />
          <MetricCard
            title="Mantenimiento"
            value={habitaciones.filter(h => h.estado.nombre.toLowerCase().includes('mantenimiento')).length}
            color="orange"
          />
          <MetricCard
            title="Total"
            value={habitaciones.length}
            color="blue"
          />
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-red-800 text-sm font-medium">⚠️ {error}</p>
          </div>
        )}

        {/* Tabla de habitaciones */}
        <RoomsTable
          habitaciones={habitaciones}
          loading={loading}
          onEdit={handleEdit}
          onChangeEstado={handleOpenEstadoModal}
        />

        {/* Modal crear habitación */}
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Nueva Habitación"
        >
          <HabitacionForm
            onSubmit={handleCreate}
            onCancel={() => setIsCreateModalOpen(false)}
            loading={createMutation.isPending}
          />
        </Modal>

        {/* Modal editar habitación */}
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedHabitacion(null);
          }}
          title="Editar Habitación"
        >
          <HabitacionForm
            habitacion={selectedHabitacion || undefined}
            onSubmit={handleUpdate}
            onCancel={() => {
              setIsEditModalOpen(false);
              setSelectedHabitacion(null);
            }}
            loading={updateMutation.isPending}
          />
        </Modal>

        {/* Modal cambiar estado */}
        <CambiarEstadoModal
          isOpen={isEstadoModalOpen}
          onClose={() => {
            setIsEstadoModalOpen(false);
            setSelectedHabitacion(null);
          }}
          habitacion={selectedHabitacion}
          onSubmit={handleChangeEstado}
          loading={changeEstadoMutation.isPending}
        />
      </div>
    </div>
  );
}

// Componente de métrica
interface MetricCardProps {
  readonly title: string;
  readonly value: number;
  readonly color: 'green' | 'red' | 'orange' | 'blue';
}

function MetricCard({ title, value, color }: Readonly<MetricCardProps>) {
  const colorStyles = {
    green: 'bg-green-50 border-green-200 text-green-700',
    red: 'bg-red-50 border-red-200 text-red-700',
    orange: 'bg-orange-50 border-orange-200 text-orange-700',
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
  };

  return (
    <div className={`rounded-xl border p-4 ${colorStyles[color]}`}>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm font-medium mt-1">{title}</div>
    </div>
  );
}
