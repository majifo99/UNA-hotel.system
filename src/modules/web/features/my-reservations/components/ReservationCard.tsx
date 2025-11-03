/**
 * ReservationCard Component
 * 
 * Tarjeta que muestra el resumen de una reserva individual
 * con información clave y acciones disponibles.
 * 
 * Características:
 * - Muestra estado de la reserva con badge de color
 * - Información de fechas, habitación y montos
 * - Botones de acción según estado
 * - Diseño responsivo
 * 
 * @module components/web
 */

import React from 'react';
import { Calendar, MapPin, Users, CreditCard, Eye, Edit, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Reservation } from '../../../../reservations/types/entities';
import { formatCurrency } from '../../../utils';

export interface ReservationCardProps {
  readonly reservation: Reservation;
  readonly onCancel?: (id: string) => void;
  readonly isLoading?: boolean;
}

/**
 * Mapeo de estados a colores y etiquetas
 */
const STATUS_CONFIG: Record<Reservation['status'], { label: string; colorClass: string }> = {
  pending: { label: 'Pendiente', colorClass: 'bg-amber-100 text-amber-800 border-amber-200' },
  confirmed: { label: 'Confirmada', colorClass: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  cancelled: { label: 'Cancelada', colorClass: 'bg-rose-100 text-rose-800 border-rose-200' },
  checked_in: { label: 'Check-in', colorClass: 'bg-blue-100 text-blue-800 border-blue-200' },
  checked_out: { label: 'Finalizada', colorClass: 'bg-gray-100 text-gray-800 border-gray-200' },
  no_show: { label: 'No-show', colorClass: 'bg-gray-200 text-gray-700 border-gray-300' },
  waiting: { label: 'En espera', colorClass: 'bg-orange-100 text-orange-800 border-orange-200' },
  completed: { label: 'Completada', colorClass: 'bg-slate-100 text-slate-700 border-slate-200' },
};

export const ReservationCard: React.FC<ReservationCardProps> = ({
  reservation,
  onCancel,
  isLoading = false
}) => {
  const statusConfig = STATUS_CONFIG[reservation.status] || STATUS_CONFIG.pending;
  const canEdit = reservation.status === 'pending' || reservation.status === 'confirmed';
  const canCancel = canEdit && reservation.status !== 'cancelled';

  // Calcular número de noches
  const checkInDate = new Date(reservation.checkInDate);
  const checkOutDate = new Date(reservation.checkOutDate);
  const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));

  // Formatear fechas
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-neutral-200 overflow-hidden hover:shadow-lg transition-shadow duration-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/80 text-sm font-medium">Código de Reserva</p>
            <p className="text-white text-xl font-bold">{reservation.confirmationNumber}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${statusConfig.colorClass}`}>
            {statusConfig.label}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Fechas */}
        <div className="flex items-start space-x-3">
          <Calendar className="w-5 h-5 text-neutral-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-neutral-600 font-medium">Fechas de Estadía</p>
            <p className="text-neutral-900 font-semibold">
              {formatDate(checkInDate)} - {formatDate(checkOutDate)}
            </p>
            <p className="text-sm text-neutral-600 mt-1">
              {nights} {nights === 1 ? 'noche' : 'noches'}
            </p>
          </div>
        </div>

        {/* Habitación */}
        <div className="flex items-start space-x-3">
          <MapPin className="w-5 h-5 text-neutral-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-neutral-600 font-medium">Habitación</p>
            <p className="text-neutral-900 font-semibold">
              {reservation.room?.number || 'Por asignar'}
            </p>
            {reservation.roomType && (
              <p className="text-sm text-neutral-600 mt-1">{reservation.roomType}</p>
            )}
          </div>
        </div>

        {/* Huéspedes */}
        <div className="flex items-start space-x-3">
          <Users className="w-5 h-5 text-neutral-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-neutral-600 font-medium">Huéspedes</p>
            <p className="text-neutral-900 font-semibold">
              {reservation.numberOfAdults} {reservation.numberOfAdults === 1 ? 'adulto' : 'adultos'}
              {reservation.numberOfChildren > 0 && (
                <>, {reservation.numberOfChildren} {reservation.numberOfChildren === 1 ? 'niño' : 'niños'}</>
              )}
            </p>
          </div>
        </div>

        {/* Precio */}
        <div className="flex items-start space-x-3 pt-4 border-t border-neutral-200">
          <CreditCard className="w-5 h-5 text-neutral-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-neutral-600 font-medium">Total a Pagar</p>
            <p className="text-neutral-900 text-2xl font-bold">
              {formatCurrency(reservation.total)}
            </p>
            {reservation.depositRequired > 0 && (
              <p className="text-sm text-amber-600 mt-1">
                Depósito requerido: {formatCurrency(reservation.depositRequired)}
              </p>
            )}
          </div>
        </div>

        {/* Notas y requisitos especiales */}
        {reservation.specialRequests && (
          <div className="pt-4 border-t border-neutral-200">
            <p className="text-sm text-neutral-600 font-medium mb-1">Requisitos Especiales</p>
            <p className="text-neutral-700 text-sm">{reservation.specialRequests}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="bg-neutral-50 px-6 py-4 flex items-center justify-end space-x-3 border-t border-neutral-200">
        <Link
          to={`/mis-reservas/${reservation.id}`}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-md hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
        >
          <Eye className="w-4 h-4 mr-2" />
          Ver Detalle
        </Link>

        {canEdit && (
          <Link
            to={`/mis-reservas/${reservation.id}/editar`}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-primary-700 bg-white border border-primary-300 rounded-md hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
          >
            <Edit className="w-4 h-4 mr-2" />
            Modificar
          </Link>
        )}

        {canCancel && onCancel && (
          <button
            type="button"
            onClick={() => onCancel(reservation.id)}
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-rose-700 bg-white border border-rose-300 rounded-md hover:bg-rose-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <XCircle className="w-4 h-4 mr-2" />
            {isLoading ? 'Cancelando...' : 'Cancelar'}
          </button>
        )}
      </div>
    </div>
  );
};
