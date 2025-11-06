/**
 * Common Reservation Form Components
 * 
 * Componentes reutilizables compartidos entre Edit y Cancel panels.
 * Reduce duplicación y mantiene consistencia visual.
 * 
 * @module components/common/reservationFormComponents
 */

import React from 'react';
import { AlertTriangle } from 'lucide-react';
import type { Reservation } from '../../types';

/**
 * Header con información básica de la reserva
 */
export interface HeaderSectionProps {
  title: string;
  reservation: Reservation;
  description?: string;
}

export const HeaderSection: React.FC<HeaderSectionProps> = ({ title, reservation, description }) => (
  <div className="mb-6 border-b border-slate-200 pb-4">
    <h2 className="text-2xl font-semibold text-slate-900">{title}</h2>
    <p className="mt-1 text-sm text-slate-500">
      Confirmación: <span className="font-mono font-semibold">{reservation.confirmationNumber}</span>
    </p>
    {reservation.guest && (
      <p className="mt-1 text-sm text-slate-600">
        {reservation.guest.firstName} {reservation.guest.firstLastName}
      </p>
    )}
    {description && <p className="mt-2 text-sm text-slate-600">{description}</p>}
  </div>
);

/**
 * Resumen visual de huésped
 */
export interface GuestSummaryProps {
  reservation: Reservation;
}

export const GuestSummary: React.FC<GuestSummaryProps> = ({ reservation }) => {
  if (!reservation.guest) return null;

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <h3 className="text-sm font-medium text-slate-700">Información del huésped</h3>
      <div className="mt-2 space-y-1">
        <p className="text-sm text-slate-900">
          {reservation.guest.firstName} {reservation.guest.firstLastName} {reservation.guest.secondLastName || ''}
        </p>
        {reservation.guest.email && (
          <p className="text-xs text-slate-600">{reservation.guest.email}</p>
        )}
        {reservation.guest.phone && (
          <p className="text-xs text-slate-600">{reservation.guest.phone}</p>
        )}
      </div>
    </div>
  );
};

/**
 * Campo de input con label y error
 */
export interface FormFieldProps {
  id: string;
  label: string;
  type?: 'text' | 'date' | 'number' | 'email';
  value: string | number;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  min?: number;
  max?: number;
  maxLength?: number;
  placeholder?: string;
  onChange: (value: string) => void;
  helperText?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  id,
  label,
  type = 'text',
  value,
  error,
  required,
  disabled,
  min,
  max,
  maxLength,
  placeholder,
  onChange,
  helperText,
}) => (
  <div>
    <label htmlFor={id} className="mb-1 block text-sm font-medium text-slate-700">
      {label} {required && <span className="text-rose-500">*</span>}
    </label>
    <input
      id={id}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      min={min}
      max={max}
      maxLength={maxLength}
      placeholder={placeholder}
      className={`w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 ${
        error ? 'border-rose-300 bg-rose-50' : 'border-slate-200'
      } ${disabled ? 'cursor-not-allowed bg-slate-50' : ''}`}
    />
    {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
    {helperText && !error && <p className="mt-1 text-xs text-slate-500">{helperText}</p>}
  </div>
);

/**
 * Selector de habitación
 */
export interface RoomSelectorProps {
  value: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  onChange: (value: string) => void;
  roomTypes: Array<{ type: string; name: string; capacity?: number }>;
}

export const RoomSelector: React.FC<RoomSelectorProps> = ({
  value,
  error,
  required,
  disabled,
  onChange,
  roomTypes,
}) => (
  <div>
    <label htmlFor="roomType" className="mb-1 block text-sm font-medium text-slate-700">
      Tipo de habitación {required && <span className="text-rose-500">*</span>}
    </label>
    <select
      id="roomType"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={`w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 ${
        error ? 'border-rose-300 bg-rose-50' : 'border-slate-200'
      } ${disabled ? 'cursor-not-allowed bg-slate-50' : ''}`}
    >
      <option value="">Selecciona una opción</option>
      {roomTypes.map((type) => (
        <option key={type.type} value={type.type}>
          {type.name} {type.capacity ? `(Capacidad: ${type.capacity})` : ''}
        </option>
      ))}
    </select>
    {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
  </div>
);

/**
 * Campo de textarea para solicitudes
 */
export interface RequestFieldProps {
  value: string;
  error?: string;
  disabled?: boolean;
  maxLength?: number;
  onChange: (value: string) => void;
}

export const RequestField: React.FC<RequestFieldProps> = ({
  value,
  error,
  disabled,
  maxLength = 300,
  onChange,
}) => (
  <div>
    <label htmlFor="specialRequests" className="mb-1 block text-sm font-medium text-slate-700">
      Solicitudes especiales
    </label>
    <textarea
      id="specialRequests"
      rows={3}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      maxLength={maxLength}
      className={`w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 ${
        error ? 'border-rose-300 bg-rose-50' : 'border-slate-200'
      } ${disabled ? 'cursor-not-allowed bg-slate-50' : ''}`}
      placeholder="Ej: Cama extra, vista al mar, piso alto..."
    />
    {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
    <p className="mt-1 text-xs text-slate-500">Máximo {maxLength} caracteres</p>
  </div>
);

/**
 * Botones de acción (Cancelar y Confirmar)
 */
export interface ActionButtonsProps {
  onCancel: () => void;
  onConfirm: () => void;
  confirmLabel: string;
  cancelLabel?: string;
  isLoading?: boolean;
  confirmDisabled?: boolean;
  confirmVariant?: 'primary' | 'danger';
  LoadingIcon?: React.ComponentType<{ className?: string }>;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  onCancel,
  onConfirm,
  confirmLabel,
  cancelLabel = 'Cancelar',
  isLoading,
  confirmDisabled,
  confirmVariant = 'primary',
  LoadingIcon,
}) => {
  const confirmStyles =
    confirmVariant === 'danger'
      ? 'bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300'
      : 'bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300';

  return (
    <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
      <button
        type="button"
        onClick={onCancel}
        className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
        disabled={isLoading}
      >
        {cancelLabel}
      </button>
      <button
        type="button"
        onClick={onConfirm}
        disabled={isLoading || confirmDisabled}
        className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm transition disabled:cursor-not-allowed ${confirmStyles}`}
      >
        {isLoading && LoadingIcon && <LoadingIcon className="h-4 w-4 animate-spin" />}
        {confirmLabel}
      </button>
    </div>
  );
};

/**
 * Alerta de advertencia genérica
 */
export interface WarningAlertProps {
  title: string;
  message: string;
}

export const WarningAlert: React.FC<WarningAlertProps> = ({ title, message }) => (
  <div className="mb-6 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
    <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
    <div className="text-sm">
      <p className="font-semibold text-amber-900">{title}</p>
      <p className="mt-1 text-amber-700">{message}</p>
    </div>
  </div>
);

/**
 * Helper: formatea fecha ISO a YYYY-MM-DD para input[type="date"]
 */
// eslint-disable-next-line react-refresh/only-export-components
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
