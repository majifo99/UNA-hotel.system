/**
 * Formulario para agregar cargos a un folio
 * 
 * Permite agregar cargos generales (sin cliente) o individuales (asociados a un cliente).
 * Incluye validación con Zod y manejo de estados con React Query.
 */

import React, { useState } from 'react';
import { z } from 'zod';
import { DollarSign, FileText, User, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useAgregarCargo } from '../hooks/useAgregarCargo';
import type { ClienteFolio } from '../types/folio.types';

// ============================================================================
// VALIDACIÓN CON ZOD
// ============================================================================

/**
 * Schema de validación para el formulario de cargo
 */
const cargoSchema = z.object({
  monto: z
    .number({ message: 'El monto debe ser un número' })
    .positive('El monto debe ser mayor a 0')
    .multipleOf(0.01, 'El monto debe tener máximo 2 decimales'),
  
  descripcion: z
    .string({ message: 'La descripción es requerida' })
    .min(3, 'La descripción debe tener al menos 3 caracteres')
    .max(255, 'La descripción no puede exceder 255 caracteres')
    .trim(),
  
  cliente_id: z
    .number()
    .nullable()
});

type CargoFormData = z.infer<typeof cargoSchema>;

// ============================================================================
// PROPS DEL COMPONENTE
// ============================================================================

interface AgregarCargoFormProps {
  /**
   * ID del folio al que se agregará el cargo
   */
  folioId: number;
  
  /**
   * Lista de clientes/huéspedes disponibles para asignar el cargo
   */
  clientes: ClienteFolio[];
  
  /**
   * Callback ejecutado cuando el cargo se agrega exitosamente
   */
  onSuccess?: () => void;
  
  /**
   * Callback ejecutado cuando se cancela la operación
   */
  onCancel?: () => void;
  
  /**
   * Mostrar el formulario en modo compacto
   * @default false
   */
  compact?: boolean;
}

// ============================================================================
// COMPONENTE
// ============================================================================

/**
 * Formulario para agregar cargos al folio
 * 
 * @example
 * ```tsx
 * <AgregarCargoForm
 *   folioId={23}
 *   clientes={huespedes}
 *   onSuccess={() => {
 *     toast.success('Cargo agregado');
 *     cerrarModal();
 *   }}
 * />
 * ```
 */
export const AgregarCargoForm: React.FC<AgregarCargoFormProps> = ({
  folioId,
  clientes,
  onSuccess,
  onCancel,
  compact = false
}) => {
  // Debug: verificar clientes recibidos
  React.useEffect(() => {
    console.log('📝 AgregarCargoForm - Clientes recibidos:', clientes);
    console.log('📝 AgregarCargoForm - Tipo:', typeof clientes, Array.isArray(clientes));
    console.log('📝 AgregarCargoForm - Cantidad:', clientes?.length ?? 0);
    if (clientes && clientes.length > 0) {
      console.log('📝 AgregarCargoForm - Primer cliente:', clientes[0]);
    }
  }, [clientes]);

  // Estado del formulario
  const [formData, setFormData] = useState<CargoFormData>({
    monto: 0,
    descripcion: '',
    cliente_id: null
  });

  // Estado de validación
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Estado de mensajes
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Hook para agregar cargo
  const { agregarCargo, isLoading, error: mutationError, reset } = useAgregarCargo({
    onSuccess: (data) => {
      setSuccessMessage(data.message || 'Cargo agregado exitosamente');
      
      // Resetear formulario después de 2 segundos
      setTimeout(() => {
        resetForm();
        setSuccessMessage(null);
        onSuccess?.();
      }, 2000);
    },
    onError: (error) => {
      console.error('Error al agregar cargo:', error);
    }
  });

  /**
   * Resetea el formulario a su estado inicial
   */
  const resetForm = () => {
    setFormData({
      monto: 0,
      descripcion: '',
      cliente_id: null
    });
    setErrors({});
    reset();
  };

  /**
   * Maneja cambios en los inputs del formulario
   */
  const handleInputChange = (
    field: keyof CargoFormData,
    value: string | number | null
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpiar error del campo al escribir
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  /**
   * Valida el formulario antes de enviar
   */
  const validateForm = (): boolean => {
    try {
      cargoSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.issues.forEach(err => {
          if (err.path[0]) {
            newErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  /**
   * Maneja el envío del formulario
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar datos
    if (!validateForm()) {
      return;
    }

    try {
      await agregarCargo(folioId, formData);
    } catch (error) {
      console.error('Error en submit:', error);
    }
  };

  // Determinar si es cargo general o individual
  const esCargoGeneral = formData.cliente_id === null;

  return (
    <form onSubmit={handleSubmit} className={compact ? 'space-y-3' : 'space-y-4'}>
      {/* Mensaje de éxito */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-green-800 font-medium">¡Éxito!</p>
            <p className="text-green-700 text-sm mt-1">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Mensaje de error */}
      {mutationError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-800 font-medium">Error al agregar cargo</p>
            <p className="text-red-700 text-sm mt-1">{mutationError.message}</p>
          </div>
        </div>
      )}

      {/* Campo: Monto */}
      <div>
        <label htmlFor="monto" className="block text-sm font-medium text-gray-700 mb-2">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-gray-500" />
            Monto del Cargo
          </div>
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
          <input
            id="monto"
            type="number"
            step="0.01"
            min="0"
            value={formData.monto || ''}
            onChange={(e) => handleInputChange('monto', parseFloat(e.target.value) || 0)}
            className={`
              w-full pl-8 pr-4 py-2 border rounded-lg
              focus:outline-none focus:ring-2 focus:ring-blue-500
              ${errors.monto ? 'border-red-300 bg-red-50' : 'border-gray-300'}
            `}
            placeholder="0.00"
            disabled={isLoading}
          />
        </div>
        {errors.monto && (
          <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {errors.monto}
          </p>
        )}
      </div>

      {/* Campo: Descripción */}
      <div>
        <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-2">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-gray-500" />
            Descripción
          </div>
        </label>
        <textarea
          id="descripcion"
          value={formData.descripcion}
          onChange={(e) => handleInputChange('descripcion', e.target.value)}
          rows={compact ? 2 : 3}
          className={`
            w-full px-4 py-2 border rounded-lg
            focus:outline-none focus:ring-2 focus:ring-blue-500
            resize-none
            ${errors.descripcion ? 'border-red-300 bg-red-50' : 'border-gray-300'}
          `}
          placeholder="Ej: Cargo por late checkout, Consumo minibar - Bebidas, etc."
          disabled={isLoading}
        />
        {errors.descripcion && (
          <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {errors.descripcion}
          </p>
        )}
        <p className="text-gray-500 text-xs mt-1">
          {formData.descripcion.length}/255 caracteres
        </p>
      </div>

      {/* Campo: Cliente */}
      <div>
        <label htmlFor="cliente_id" className="block text-sm font-medium text-gray-700 mb-2">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-gray-500" />
            Asignar a
          </div>
        </label>
        <select
          id="cliente_id"
          value={formData.cliente_id?.toString() || 'general'}
          onChange={(e) => {
            const value = e.target.value === 'general' ? null : parseInt(e.target.value);
            handleInputChange('cliente_id', value);
          }}
          className={`
            w-full px-4 py-2 border rounded-lg
            focus:outline-none focus:ring-2 focus:ring-blue-500
            ${errors.cliente_id ? 'border-red-300 bg-red-50' : 'border-gray-300'}
          `}
          disabled={isLoading}
        >
          <option value="general">Cargo General (sin asignar a cliente)</option>
          {Array.isArray(clientes) && clientes.length > 0 ? (
            clientes.map(cliente => (
              <option key={cliente.id_cliente} value={cliente.id_cliente}>
                {cliente.nombre} {cliente.es_titular ? '(Titular)' : ''}
              </option>
            ))
          ) : (
            <option disabled>No hay clientes disponibles</option>
          )}
        </select>
        {errors.cliente_id && (
          <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {errors.cliente_id}
          </p>
        )}
        <p className="text-gray-500 text-xs mt-1">
          {esCargoGeneral 
            ? 'Este cargo no estará asociado a ningún cliente específico'
            : 'Este cargo se asignará directamente al cliente seleccionado'
          }
        </p>
      </div>

      {/* Botones de acción */}
      <div className="flex gap-3 pt-4 border-t border-gray-200">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="
              flex-1 px-4 py-2 
              bg-gray-100 text-gray-700 rounded-lg
              hover:bg-gray-200 
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors
            "
          >
            Cancelar
          </button>
        )}
        
        <button
          type="submit"
          disabled={isLoading}
          className="
            flex-1 px-4 py-2 
            bg-blue-600 text-white rounded-lg
            hover:bg-blue-700 
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors
            flex items-center justify-center gap-2
          "
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Agregando...
            </>
          ) : (
            <>
              <DollarSign className="w-4 h-4" />
              Agregar Cargo
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default AgregarCargoForm;
