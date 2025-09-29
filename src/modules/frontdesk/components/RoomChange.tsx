import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Home, Users, MessageSquare } from 'lucide-react';
import { useRoomChange } from '../hooks/useRoomChange';
import { useInputValidation } from '../../../hooks/useInputValidation';
import { ROUTES } from '../../../router/routes';
import type { RoomChangeData, RoomChangeReason } from '../types/roomChange';

// Mock data para habitaciones disponibles
const mockAvailableRooms = [
  { id: 1, number: '101', type: 'Standard', capacity: 2, isAvailable: true },
  { id: 2, number: '102', type: 'Standard', capacity: 2, isAvailable: true },
  { id: 3, number: '201', type: 'Deluxe', capacity: 4, isAvailable: true },
  { id: 4, number: '202', type: 'Deluxe', capacity: 4, isAvailable: false },
  { id: 5, number: '301', type: 'Suite', capacity: 6, isAvailable: true },
];

type LocalState = {
  currentRoomNumber: string;
  newRoomId: number | '';
  changeDate: string;
  adultos: number;
  ninos: number;
  bebes: number;
  reason: RoomChangeReason | '';
  motivo: string;
  observaciones: string;
  guestName: string;
  reservationId: string;
};

const RoomChange = () => {
  const navigate = useNavigate();
  const { validateAndChangeRoom, isChangingRoom, error } = useRoomChange();
  useInputValidation();

  const [formData, setFormData] = useState<LocalState>({
    currentRoomNumber: '101', // Mock current room
    newRoomId: '',
    changeDate: new Date().toISOString().split('T')[0],
    adultos: 2,
    ninos: 0,
    bebes: 0,
    reason: '',
    motivo: '',
    observaciones: '',
    guestName: 'Juan Pérez', // Mock guest name
    reservationId: 'RES-001', // Mock reservation ID
  });

  // Opciones de motivos de cambio
  const changeReasons = [
    { value: 'guest_request', label: 'Solicitud del huésped' },
    { value: 'maintenance', label: 'Mantenimiento de habitación' },
    { value: 'upgrade', label: 'Upgrade de habitación' },
    { value: 'downgrade', label: 'Downgrade por disponibilidad' },
    { value: 'noise_complaint', label: 'Queja por ruido' },
    { value: 'room_issue', label: 'Problema con la habitación' },
    { value: 'preference', label: 'Preferencia del huésped' },
    { value: 'other', label: 'Otro motivo' },
  ] as const;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.newRoomId) {
      return;
    }

    const roomChangeData: RoomChangeData = {
      id_hab_nueva: formData.newRoomId as number,
      desde: formData.changeDate,
      adultos: formData.adultos,
      ninos: formData.ninos,
      bebes: formData.bebes,
      motivo: formData.motivo,
      observaciones: formData.observaciones,
      reservationId: formData.reservationId,
    };

    const success = await validateAndChangeRoom(roomChangeData);
    if (success) {
      navigate(ROUTES.FRONTDESK.BASE);
    }
  };

  const totalGuests = formData.adultos + formData.ninos + formData.bebes;
  const selectedRoom = mockAvailableRooms.find(room => room.id === formData.newRoomId);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Header */}
          <div className="relative flex items-center justify-center mb-8">
            <div className="flex items-center gap-3">
              <RefreshCw className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">Cambio de Habitación</h1>
            </div>
            
            <button
              type="button"
              onClick={() => navigate(ROUTES.FRONTDESK.BASE)}
              className="absolute left-0 flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              title="Regresar al Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Regresar</span>
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información Actual */}
            <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Información Actual</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Huésped
                  </label>
                  <p className="text-gray-900 font-medium">{formData.guestName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reserva
                  </label>
                  <p className="text-gray-900 font-medium">{formData.reservationId}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Habitación Actual
                  </label>
                  <p className="text-gray-900 font-medium">#{formData.currentRoomNumber}</p>
                </div>
              </div>
            </div>

            {/* Nueva Habitación */}
            <div className="border border-blue-200 bg-blue-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Nueva Habitación</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="newRoomId" className="block text-sm font-medium text-gray-700 mb-2">
                    Seleccionar Habitación <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="newRoomId"
                    value={formData.newRoomId}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      newRoomId: e.target.value ? parseInt(e.target.value) : '' 
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Seleccionar habitación</option>
                    {mockAvailableRooms
                      .filter(room => room.isAvailable)
                      .map((room) => (
                        <option key={room.id} value={room.id}>
                          #{room.number} - {room.type} (Capacidad: {room.capacity})
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="changeDate" className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de Cambio <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="changeDate"
                    type="date"
                    value={formData.changeDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, changeDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
              </div>

              {selectedRoom && (
                <div className="mt-4 p-3 bg-white border border-blue-200 rounded-md">
                  <div className="flex items-center gap-2 mb-2">
                    <Home className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-gray-900">
                      Habitación Seleccionada: #{selectedRoom.number}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Tipo: {selectedRoom.type} | Capacidad máxima: {selectedRoom.capacity} personas
                  </p>
                </div>
              )}
            </div>

            {/* Composición de Huéspedes */}
            <div className="border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="w-6 h-6" />
                Composición de Huéspedes
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="adultos" className="block text-sm font-medium text-gray-700 mb-2">
                    Adultos <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="adultos"
                    type="number"
                    min="1"
                    max="10"
                    value={formData.adultos}
                    onChange={(e) => setFormData(prev => ({ ...prev, adultos: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="ninos" className="block text-sm font-medium text-gray-700 mb-2">
                    Niños <span className="text-xs text-gray-500">(2-12 años)</span>
                  </label>
                  <input
                    id="ninos"
                    type="number"
                    min="0"
                    max="10"
                    value={formData.ninos}
                    onChange={(e) => setFormData(prev => ({ ...prev, ninos: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="bebes" className="block text-sm font-medium text-gray-700 mb-2">
                    Bebés <span className="text-xs text-gray-500">(0-2 años)</span>
                  </label>
                  <input
                    id="bebes"
                    type="number"
                    min="0"
                    max="5"
                    value={formData.bebes}
                    onChange={(e) => setFormData(prev => ({ ...prev, bebes: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-md">
                <p className="text-sm text-gray-700">
                  <strong>Total de huéspedes:</strong> {totalGuests} 
                  {totalGuests > 1 ? ' personas' : ' persona'}
                  {selectedRoom && totalGuests > selectedRoom.capacity && (
                    <span className="text-red-600 ml-2 font-medium">
                      ⚠️ Excede la capacidad de la habitación ({selectedRoom.capacity})
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Motivo y Observaciones */}
            <div className="border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MessageSquare className="w-6 h-6" />
                Motivo del Cambio
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                    Motivo <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="reason"
                    value={formData.reason}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      reason: e.target.value as RoomChangeReason,
                      motivo: e.target.value === 'other' ? prev.motivo : changeReasons.find(r => r.value === e.target.value)?.label || ''
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Seleccionar motivo</option>
                    {changeReasons.map((reason) => (
                      <option key={reason.value} value={reason.value}>
                        {reason.label}
                      </option>
                    ))}
                  </select>
                </div>

                {formData.reason === 'other' && (
                  <div>
                    <label htmlFor="customReason" className="block text-sm font-medium text-gray-700 mb-2">
                      Especificar Motivo <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="customReason"
                      type="text"
                      value={formData.motivo}
                      onChange={(e) => setFormData(prev => ({ ...prev, motivo: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Describe el motivo del cambio..."
                      required
                    />
                  </div>
                )}
              </div>

              <div className="mt-4">
                <label htmlFor="observaciones" className="block text-sm font-medium text-gray-700 mb-2">
                  Observaciones Adicionales
                </label>
                <textarea
                  id="observaciones"
                  value={formData.observaciones}
                  onChange={(e) => setFormData(prev => ({ ...prev, observaciones: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Información adicional sobre el cambio de habitación..."
                />
              </div>
            </div>

            {/* Botones */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate(ROUTES.FRONTDESK.BASE)}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isChangingRoom || !formData.newRoomId || (selectedRoom && totalGuests > selectedRoom.capacity)}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isChangingRoom ? 'Procesando...' : 'Confirmar Cambio'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RoomChange;