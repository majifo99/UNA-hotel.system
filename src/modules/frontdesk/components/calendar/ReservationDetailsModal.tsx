import React from 'react';
import { X, User, Calendar, Users, Baby, Info } from 'lucide-react';
import type { CalendarReservation } from '../../services/frontdeskReservationService';

interface ReservationDetailsModalProps {
  reservation: CalendarReservation | null;
  onClose: () => void;
}

const ReservationDetailsModal: React.FC<ReservationDetailsModalProps> = ({ reservation, onClose }) => {
  if (!reservation) return null;

  const getStatusColor = (status: 'pending' | 'confirmed' | 'cancelled'): string => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
    }
  };

  const getStatusText = (status: 'pending' | 'confirmed' | 'cancelled'): string => {
    switch (status) {
      case 'confirmed':
        return 'Confirmada';
      case 'pending':
        return 'Pendiente';
      case 'cancelled':
        return 'Cancelada';
    }
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateNights = (): number => {
    const diffTime = Math.abs(reservation.endDate.getTime() - reservation.startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/20 animate-backdropFadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-fadeIn">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-[#1A3636] to-[#40534C] text-white p-6 rounded-t-2xl">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">Detalles de Reserva</h2>
              <div className="flex items-center gap-2">
                <span className="text-sm opacity-90">Habitación {reservation.roomNumber}</span>
                <span className="text-sm opacity-70">•</span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border-2 ${getStatusColor(reservation.status)}`}>
                  {getStatusText(reservation.status)}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Cerrar"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Guest Information */}
          <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-100">
            <div className="flex items-center gap-2 mb-3">
              <User className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Información del Huésped</h3>
            </div>
            <p className="text-lg font-bold text-gray-900">{reservation.guestName}</p>
          </div>

          {/* Stay Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Check-in */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-gray-600">Check-in</span>
              </div>
              <p className="font-semibold text-gray-900 capitalize">
                {formatDate(reservation.startDate)}
              </p>
            </div>

            {/* Check-out */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-red-600" />
                <span className="text-sm font-medium text-gray-600">Check-out</span>
              </div>
              <p className="font-semibold text-gray-900 capitalize">
                {formatDate(reservation.endDate)}
              </p>
            </div>
          </div>

          {/* Nights */}
          <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Info className="w-5 h-5 text-purple-600" />
                <span className="font-medium text-gray-900">Duración de la estadía</span>
              </div>
              <span className="text-2xl font-bold text-purple-600">
                {calculateNights()} {calculateNights() === 1 ? 'noche' : 'noches'}
              </span>
            </div>
          </div>

          {/* Occupancy */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-3">Ocupación</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{reservation.adults}</p>
                <p className="text-xs text-gray-600">Adultos</p>
              </div>
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <User className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{reservation.children}</p>
                <p className="text-xs text-gray-600">Niños</p>
              </div>
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <Baby className="w-6 h-6 text-purple-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{reservation.infants}</p>
                <p className="text-xs text-gray-600">Bebés</p>
              </div>
            </div>
          </div>

          {/* Room Information */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-3">Información de la Habitación</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Número de Habitación</span>
                <span className="font-bold text-gray-900">{reservation.roomNumber}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total de Huéspedes</span>
                <span className="font-bold text-gray-900">
                  {reservation.adults + reservation.children + reservation.infants}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-gray-50 p-6 rounded-b-2xl border-t border-gray-200">
          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 border-2 border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Cerrar
            </button>
            <button
              className="px-6 py-2 bg-gradient-to-r from-[#1A3636] to-[#40534C] text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
              onClick={() => {
                // Aquí puedes agregar la lógica para ver más detalles o editar
                console.log('Ver detalles completos de reserva:', reservation.id);
              }}
            >
              Ver Detalles Completos
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReservationDetailsModal;
