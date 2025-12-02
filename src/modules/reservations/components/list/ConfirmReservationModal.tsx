import React from 'react';
import { CheckCircle, X } from 'lucide-react';
import type { Reservation } from '../../types';

interface ConfirmReservationModalProps {
  reservation: Reservation | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reservation: Reservation) => void;
  isLoading?: boolean;
}

export const ConfirmReservationModal: React.FC<ConfirmReservationModalProps> = ({
  reservation,
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}) => {
  if (!isOpen || !reservation) return null;

  const guestName = reservation.guest
    ? `${reservation.guest.firstName} ${reservation.guest.firstLastName ?? ''}`.trim()
    : `Cliente #${reservation.guestId}`;

  const handleConfirm = () => {
    onConfirm(reservation);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">Confirmar Reserva</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-lg transition-colors"
            disabled={isLoading}
          >
            <X className="h-5 w-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900 mb-3">
              <strong>¿Confirmar esta reserva?</strong>
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-blue-700 font-medium">Código:</span>
                <span className="font-mono font-bold text-blue-900">{reservation.confirmationNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700 font-medium">Huésped:</span>
                <span className="text-blue-900 font-semibold">{guestName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700 font-medium">Check-in:</span>
                <span className="text-blue-900">
                  {reservation.checkInDate ? new Date(reservation.checkInDate).toLocaleDateString('es-ES') : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700 font-medium">Check-out:</span>
                <span className="text-blue-900">
                  {reservation.checkOutDate ? new Date(reservation.checkOutDate).toLocaleDateString('es-ES') : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-xs text-amber-800">
              <strong>Nota educativa:</strong> Al confirmar, el estado cambiará de "Pendiente" a "Confirmada". 
              Esto es útil para sistemas de gestión hotelera donde las reservas requieren validación antes de ser definitivas.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-gray-50 px-6 py-4 flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 rounded-lg border-2 border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Confirmando...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                Confirmar Reserva
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
