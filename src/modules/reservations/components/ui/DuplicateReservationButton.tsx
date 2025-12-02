/**
 * Duplicate Reservation Button & Dialog
 * 
 * Permite clonar una reserva existente ajustando las fechas
 * Útil para huéspedes recurrentes o reservas similares
 */

import React, { useState } from 'react';
import { Copy, Calendar, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { validateDateRange, getMinCheckInDate, getMinCheckOutDate } from '../../utils/dateValidation';

interface ReservationData {
  id: string;
  guestId: string;
  guestName: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfAdults: number;
  numberOfChildren: number;
  numberOfInfants: number;
  numberOfGuests: number;
  rooms?: Array<{ id: string; name: string }>;
  services?: Array<{ id: string; name: string }>;
  specialRequests?: string;
}

interface DuplicateReservationButtonProps {
  reservation: ReservationData;
  className?: string;
  variant?: 'button' | 'icon';
}

export const DuplicateReservationButton: React.FC<DuplicateReservationButtonProps> = ({
  reservation,
  className = '',
  variant = 'button',
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newCheckIn, setNewCheckIn] = useState('');
  const [newCheckOut, setNewCheckOut] = useState('');
  const navigate = useNavigate();

  const minCheckIn = getMinCheckInDate();
  const minCheckOut = newCheckIn ? getMinCheckOutDate(newCheckIn) : minCheckIn;

  const dateValidation = validateDateRange(newCheckIn, newCheckOut, {
    minStayNights: 1,
    maxStayNights: 365,
  });

  const handleDuplicate = () => {
    if (!dateValidation.isValid) return;

    // Prepare reservation data for duplication
    const duplicateData = {
      guestId: reservation.guestId,
      checkInDate: newCheckIn,
      checkOutDate: newCheckOut,
      numberOfAdults: reservation.numberOfAdults,
      numberOfChildren: reservation.numberOfChildren,
      numberOfInfants: reservation.numberOfInfants,
      roomIds: reservation.rooms?.map((r: { id: string }) => r.id) || [],
      additionalServices: reservation.services?.map((s: { id: string }) => s.id) || [],
      specialRequests: reservation.specialRequests || '',
      isDuplicate: true,
      originalReservationId: reservation.id,
    };

    // Navigate to create form with pre-filled data
    navigate('/reservations/create', { 
      state: { 
        duplicateFrom: reservation.id,
        formData: duplicateData 
      } 
    });
  };

  const buttonContent = variant === 'icon' ? (
    <button
      onClick={() => setIsDialogOpen(true)}
      className={`p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors ${className}`}
      title="Duplicar reserva"
    >
      <Copy size={18} />
    </button>
  ) : (
    <button
      onClick={() => setIsDialogOpen(true)}
      className={`flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors ${className}`}
    >
      <Copy size={16} />
      <span className="text-sm font-medium">Duplicar Reserva</span>
    </button>
  );

  return (
    <>
      {buttonContent}

      {/* Dialog */}
      {isDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Copy size={20} className="text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">Duplicar Reserva</h2>
              </div>
              <button
                onClick={() => setIsDialogOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-4 space-y-4">
              {/* Original Reservation Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs font-medium text-blue-800 mb-1">Reserva Original</p>
                <div className="text-sm text-blue-900">
                  <p className="font-medium">{reservation.guestName}</p>
                  <p className="text-xs text-blue-700">
                    {reservation.checkInDate} → {reservation.checkOutDate}
                  </p>
                  <p className="text-xs text-blue-700">
                    {reservation.rooms?.length || 0} habitación(es) • {reservation.numberOfGuests} huéspedes
                  </p>
                </div>
              </div>

              {/* New Dates */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-3">Seleccione nuevas fechas</p>
                <div className="space-y-3">
                  <div>
                    <label className="flex items-center gap-1 text-xs font-medium text-gray-700 mb-1">
                      <Calendar size={14} />
                      Nueva fecha de Check-in
                    </label>
                    <input
                      type="date"
                      value={newCheckIn}
                      onChange={(e) => setNewCheckIn(e.target.value)}
                      min={minCheckIn}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-1 text-xs font-medium text-gray-700 mb-1">
                      <Calendar size={14} />
                      Nueva fecha de Check-out
                    </label>
                    <input
                      type="date"
                      value={newCheckOut}
                      onChange={(e) => setNewCheckOut(e.target.value)}
                      min={minCheckOut}
                      disabled={!newCheckIn}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              {/* Validation Messages */}
              {newCheckIn && newCheckOut && !dateValidation.isValid && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-xs font-medium text-red-800">{dateValidation.error}</p>
                  {dateValidation.suggestedFix && (
                    <p className="text-xs text-red-700 mt-1">💡 {dateValidation.suggestedFix}</p>
                  )}
                </div>
              )}

              {dateValidation.isValid && dateValidation.warning && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                  <p className="text-xs font-medium text-yellow-800">{dateValidation.warning}</p>
                  {dateValidation.suggestedFix && (
                    <p className="text-xs text-yellow-700 mt-1">💡 {dateValidation.suggestedFix}</p>
                  )}
                </div>
              )}

              {/* Info */}
              <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
                <p className="text-xs text-gray-600">
                  ℹ️ Se copiarán todos los detalles de la reserva original (habitaciones, servicios, huésped) 
                  con las nuevas fechas seleccionadas. Podrá modificarlos antes de confirmar.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
              <button
                onClick={() => setIsDialogOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDuplicate}
                disabled={!dateValidation.isValid}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Copy size={16} />
                Continuar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DuplicateReservationButton;
