// src/modules/habitaciones/components/HabitacionForm.tsx
/**
 * Formulario para crear/editar habitaciones
 * Diseño actualizado para coincidir con módulos de housekeeping y mantenimiento
 */

import { useState, useEffect } from 'react';
import { Save, X, Loader2 } from 'lucide-react';
import { useCatalogos } from '../hooks/useHabitaciones';
import type { Habitacion } from '../types/habitacion';

interface HabitacionFormProps {
  readonly habitacion?: Habitacion;
  readonly onSubmit: (data: HabitacionFormData) => void;
  readonly onCancel: () => void;
  readonly loading?: boolean;
}

export interface HabitacionFormData {
  nombre: string;
  numero: string;
  piso: number;
  capacidad: number;
  medida: string;
  descripcion: string;
  tipo_habitacion_id: number;
  id_estado_hab: number;
  precio_base?: number;
  moneda?: string;
}

export function HabitacionForm({ habitacion, onSubmit, onCancel, loading = false }: Readonly<HabitacionFormProps>) {
  const { tipos, estados, loading: catalogosLoading } = useCatalogos();

  const [formData, setFormData] = useState<HabitacionFormData>({
    nombre: habitacion?.nombre || '',
    numero: habitacion?.numero || '',
    piso: habitacion?.piso || 1,
    capacidad: habitacion?.capacidad || 1,
    medida: habitacion?.medida || '',
    descripcion: habitacion?.descripcion || '',
    tipo_habitacion_id: habitacion?.tipo.id_tipo_hab || 0,
    id_estado_hab: habitacion?.estado.id_estado_hab || 0,
    precio_base: habitacion?.precio_base ? Number.parseFloat(habitacion.precio_base) : undefined,
    moneda: habitacion?.moneda || 'CRC',
  });

  useEffect(() => {
    if (habitacion) {
      setFormData({
        nombre: habitacion.nombre,
        numero: habitacion.numero,
        piso: habitacion.piso,
        capacidad: habitacion.capacidad,
        medida: habitacion.medida,
        descripcion: habitacion.descripcion,
        tipo_habitacion_id: habitacion.tipo.id_tipo_hab,
        id_estado_hab: habitacion.estado.id_estado_hab,
        precio_base: habitacion.precio_base ? Number.parseFloat(habitacion.precio_base) : undefined,
        moneda: habitacion.moneda || 'CRC',
      });
    }
  }, [habitacion]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    let processedValue: string | number | undefined = value;

    if (['piso', 'capacidad', 'tipo_habitacion_id', 'id_estado_hab'].includes(name)) {
      processedValue = Number(value);
    } else if (name === 'precio_base') {
      processedValue = value === '' ? undefined : Number.parseFloat(value);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: processedValue,
    }));
  };

  if (catalogosLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Nombre */}
        <div>
          <label htmlFor="nombre" className="block text-sm font-medium text-slate-700 mb-2">
            Nombre *
          </label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
            className="w-full px-4 py-2.5 bg-white/80 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            placeholder="Ej: Suite Presidencial"
          />
        </div>

        {/* Número */}
        <div>
          <label htmlFor="numero" className="block text-sm font-medium text-slate-700 mb-2">
            Número *
          </label>
          <input
            type="text"
            id="numero"
            name="numero"
            value={formData.numero}
            onChange={handleChange}
            required
            maxLength={20}
            className="w-full px-4 py-2.5 bg-white/80 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            placeholder="Ej: 101, 202-A, Suite-01"
          />
          <p className="mt-1.5 text-xs text-slate-500">
            Acepta letras, números y guiones. Máx 20 caracteres.
          </p>
        </div>

        {/* Piso */}
        <div>
          <label htmlFor="piso" className="block text-sm font-medium text-slate-700 mb-2">
            Piso *
          </label>
          <input
            type="number"
            id="piso"
            name="piso"
            value={formData.piso}
            onChange={handleChange}
            required
            min="1"
            className="w-full px-4 py-2.5 bg-white/80 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Capacidad */}
        <div>
          <label htmlFor="capacidad" className="block text-sm font-medium text-slate-700 mb-2">
            Capacidad *
          </label>
          <input
            type="number"
            id="capacidad"
            name="capacidad"
            value={formData.capacidad}
            onChange={handleChange}
            required
            min="1"
            className="w-full px-4 py-2.5 bg-white/80 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Medida */}
        <div>
          <label htmlFor="medida" className="block text-sm font-medium text-slate-700 mb-2">
            Medida (m²) *
          </label>
          <input
            type="text"
            id="medida"
            name="medida"
            value={formData.medida}
            onChange={handleChange}
            required
            maxLength={255}
            className="w-full px-4 py-2.5 bg-white/80 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            placeholder="Ej: 45m²"
          />
        </div>

        {/* Tipo */}
        <div>
          <label htmlFor="tipo_habitacion_id" className="block text-sm font-medium text-slate-700 mb-2">
            Tipo *
          </label>
          <select
            id="tipo_habitacion_id"
            name="tipo_habitacion_id"
            value={formData.tipo_habitacion_id}
            onChange={handleChange}
            required
            className="w-full px-4 py-2.5 bg-white/80 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
          >
            <option value={0}>Seleccione un tipo</option>
            {tipos.map((tipo) => (
              <option key={tipo.id_tipo_hab} value={tipo.id_tipo_hab}>
                {tipo.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Estado */}
        <div>
          <label htmlFor="id_estado_hab" className="block text-sm font-medium text-slate-700 mb-2">
            Estado *
          </label>
          <select
            id="id_estado_hab"
            name="id_estado_hab"
            value={formData.id_estado_hab}
            onChange={handleChange}
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

        {/* Precio Base */}
        <div>
          <label htmlFor="precio_base" className="block text-sm font-medium text-slate-700 mb-2">
            Precio Base
          </label>
          <input
            type="number"
            id="precio_base"
            name="precio_base"
            value={formData.precio_base ?? ''}
            onChange={handleChange}
            step="0.01"
            min="0"
            className="w-full px-4 py-2.5 bg-white/80 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            placeholder="0.00"
          />
        </div>

        {/* Moneda */}
        <div>
          <label htmlFor="moneda" className="block text-sm font-medium text-slate-700 mb-2">
            Moneda
          </label>
          <select
            id="moneda"
            name="moneda"
            value={formData.moneda || 'CRC'}
            onChange={handleChange}
            className="w-full px-4 py-2.5 bg-white/80 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
          >
            <option value="CRC">CRC (Colones)</option>
            <option value="USD">USD (Dólares)</option>
          </select>
        </div>
      </div>

      {/* Descripción */}
      <div>
        <label htmlFor="descripcion" className="block text-sm font-medium text-slate-700 mb-2">
          Descripción *
        </label>
        <textarea
          id="descripcion"
          name="descripcion"
          value={formData.descripcion}
          onChange={handleChange}
          required
          rows={4}
          className="w-full px-4 py-2.5 bg-white/80 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none"
          placeholder="Descripción de la habitación..."
        />
      </div>

      {/* Botones */}
      <div className="flex justify-end gap-3 pt-5 border-t border-slate-200">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="inline-flex items-center gap-2 px-5 py-2.5 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          <X className="h-4 w-4" />
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium shadow-sm hover:shadow-md"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              {habitacion ? 'Actualizar' : 'Crear Habitación'}
            </>
          )}
        </button>
      </div>
    </form>
  );
}