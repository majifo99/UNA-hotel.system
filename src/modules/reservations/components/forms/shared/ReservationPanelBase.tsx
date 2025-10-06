/**
 * Shared Reservation Panel Base
 * 
 * Componente base para paneles de reserva (Edit/Cancel) que elimina duplicación estructural.
 * Provee layout consistente, validaciones compartidas y helpers de formato.
 * 
 * @module components/forms/shared
 */

import React from 'react';
import { X, AlertCircle } from 'lucide-react';
import type { Reservation } from '../../../types';
import { Alert } from '../../../../../components/ui/Alert';

/**
 * Props del contenedor base de panel
 */
export interface PanelBaseProps {
  /** Tipo de panel para estilos condicionales */
  variant: 'edit' | 'cancel';
  /** Título del panel */
  title: string;
  /** Subtítulo o mensaje adicional */
  subtitle?: string;
  /** Reserva asociada */
  reservation: Reservation;
  /** Callback al cerrar */
  onClose: () => void;
  /** Contenido del formulario */
  children: React.ReactNode;
  /** Error de mutación para mostrar alerta */
  mutationError?: boolean;
  /** Mensaje de error personalizado */
  errorMessage?: string;
}

/**
 * Contenedor base para paneles de reserva con header consistente
 */
export const ReservationPanelBase: React.FC<PanelBaseProps> = ({
  variant,
  title,
  subtitle,
  reservation,
  onClose,
  children,
  mutationError,
  errorMessage,
}) => {
  const borderColor = variant === 'edit' ? 'border-emerald-500' : 'border-rose-500';
  const bgColor = variant === 'edit' ? 'bg-emerald-50' : 'bg-rose-50';
  const icon = variant === 'edit' ? '✏️' : '🚫';

  return (
    <div className={`mb-6 rounded-2xl border-2 ${borderColor} bg-white shadow-xl`}>
      {/* Header consistente */}
      <div className={`flex items-center justify-between border-b border-slate-200 ${bgColor} px-6 py-4`}>
        <div>
          <h2 className="text-xl font-semibold text-slate-900">{icon} {title}</h2>
          {subtitle && (
            <p className={`text-sm font-medium ${variant === 'cancel' ? 'text-rose-600' : 'text-slate-600'}`}>
              {subtitle}
            </p>
          )}
          <p className="text-sm text-slate-600">
            Confirmación: <span className="font-mono font-semibold">{reservation.confirmationNumber}</span>
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          aria-label="Cerrar panel"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Body con alerta condicional */}
      <div className="space-y-6 px-6 py-6">
        {mutationError && (
          <Alert
            type="error"
            title={variant === 'edit' ? 'No se pudo guardar los cambios' : 'No se pudo cancelar la reserva'}
            message={errorMessage || 'Intenta nuevamente o verifica tu conexión.'}
          />
        )}
        {children}
      </div>
    </div>
  );
};

/**
 * Props para input de formulario
 */
export interface FormInputProps {
  id: string;
  label: string;
  type: 'text' | 'date' | 'number' | 'email';
  required?: boolean;
  value?: string | number;
  error?: string;
  helperText?: string;
  min?: number;
  max?: number;
  maxLength?: number;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  className?: string;
  register?: unknown;
}

/**
 * Input de formulario reutilizable con estilos consistentes
 */
export const FormInput: React.FC<FormInputProps> = ({
  id,
  label,
  type,
  required,
  error,
  helperText,
  min,
  max,
  maxLength,
  placeholder,
  disabled,
  readOnly,
  className,
  register,
}) => {
  const inputClasses = `w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 ${
    error ? 'border-rose-300 bg-rose-50' : 'border-slate-200'
  } ${readOnly ? 'bg-slate-50' : ''} ${className || ''}`;

  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-slate-700">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      <input
        id={id}
        type={type}
        min={min}
        max={max}
        maxLength={maxLength}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        className={inputClasses}
        {...(register as object)}
      />
      {error ? (
        <p className="mt-1 flex items-center gap-1 text-xs text-rose-600">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      ) : helperText ? (
        <p className="mt-1 text-xs text-slate-500">{helperText}</p>
      ) : null}
    </div>
  );
};

/**
 * Props para select de formulario
 */
export interface FormSelectProps {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  options: Array<{ value: string; label: string }>;
  register?: unknown;
}

/**
 * Select de formulario reutilizable
 */
export const FormSelect: React.FC<FormSelectProps> = ({
  id,
  label,
  required,
  error,
  disabled,
  options,
  register,
}) => {
  const selectClasses = `w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 ${
    error ? 'border-rose-300 bg-rose-50' : 'border-slate-200'
  }`;

  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-slate-700">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      <select
        id={id}
        disabled={disabled}
        className={selectClasses}
        {...(register as object)}
      >
        <option value="">Selecciona una opción</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 flex items-center gap-1 text-xs text-rose-600">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}
    </div>
  );
};

/**
 * Props para textarea de formulario
 */
export interface FormTextareaProps {
  id: string;
  label: string;
  rows?: number;
  maxLength?: number;
  placeholder?: string;
  error?: string;
  helperText?: string;
  register?: unknown;
}

/**
 * Textarea de formulario reutilizable
 */
export const FormTextarea: React.FC<FormTextareaProps> = ({
  id,
  label,
  rows = 3,
  maxLength,
  placeholder,
  error,
  helperText,
  register,
}) => {
  const textareaClasses = `w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 ${
    error ? 'border-rose-300 bg-rose-50' : 'border-slate-200'
  }`;

  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <textarea
        id={id}
        rows={rows}
        maxLength={maxLength}
        placeholder={placeholder}
        className={textareaClasses}
        {...(register as object)}
      />
      {error && (
        <p className="mt-1 flex items-center gap-1 text-xs text-rose-600">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}
      {helperText && !error && <p className="mt-1 text-xs text-slate-500">{helperText}</p>}
    </div>
  );
};

/**
 * Convierte fecha ISO a formato YYYY-MM-DD para input[type="date"]
 */
export const formatDateForInput = (isoDate: string | undefined): string => {
  if (!isoDate) return '';
  try {
    const date = new Date(isoDate);
    if (!Number.isFinite(date.getTime())) return '';
    return date.toISOString().split('T')[0];
  } catch {
    return '';
  }
};

/**
 * Formateador para moneda costarricense (Colones)
 */
export const colonFormatter = new Intl.NumberFormat('es-CR', {
  style: 'currency',
  currency: 'CRC',
  maximumFractionDigits: 0,
});

/**
 * Calcula número de noches entre dos fechas
 */
export const calculateNights = (checkIn: string | undefined, checkOut: string | undefined): number | null => {
  if (!checkIn || !checkOut) return null;
  try {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const diff = Math.round((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : null;
  } catch {
    return null;
  }
};

/**
 * Props para botones de acción
 */
export interface ActionButtonsProps {
  /** Variante del botón primario */
  variant: 'danger' | 'primary';
  /** Texto del botón de cancelar */
  cancelLabel: string;
  /** Texto del botón primario */
  confirmLabel: string;
  /** Handler al cancelar */
  onCancel: () => void;
  /** Handler al confirmar */
  onConfirm: () => void;
  /** Deshabilitar botones durante carga */
  disabled?: boolean;
  /** Deshabilitar solo el botón de confirmación */
  confirmDisabled?: boolean;
  /** Mostrar spinner en botón de confirmación */
  isLoading?: boolean;
}

/**
 * Botones de acción reutilizables para paneles de reserva
 */
export const ActionButtons: React.FC<ActionButtonsProps> = ({
  variant,
  cancelLabel,
  confirmLabel,
  onCancel,
  onConfirm,
  disabled,
  confirmDisabled,
  isLoading,
}) => {
  const primaryClass = variant === 'danger' 
    ? 'bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300'
    : 'bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300';

  return (
    <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
      <button
        type="button"
        onClick={onCancel}
        className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
        disabled={disabled}
      >
        {cancelLabel}
      </button>
      <button
        type={variant === 'primary' ? 'submit' : 'button'}
        onClick={variant === 'danger' ? onConfirm : undefined}
        disabled={disabled || confirmDisabled || isLoading}
        className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm transition disabled:cursor-not-allowed ${primaryClass}`}
      >
        {isLoading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" aria-hidden />}
        {confirmLabel}
      </button>
    </div>
  );
};
