import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Home, Users, MessageSquare, Loader2 } from 'lucide-react';
import { useRoomChange } from '../hooks/useRoomChange';
import { useGuests } from '../../guests/hooks/useGuests';
import { useRoomSelection } from '../hooks/useRoomSelection';
import { useInputValidation } from '../../../hooks/useInputValidation';
import { ROUTES } from '../../../router/routes';
import FrontdeskService from '../services/frontdeskService';
import type { RoomChangeData, RoomChangeReason } from '../types/roomChange';
import type { RoomInfo } from '../types/room';

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
  const { searchRooms } = useRoomSelection();
  useInputValidation();

  const [allRooms, setAllRooms] = useState<RoomInfo[]>([]);
  const [roomAssignments, setRoomAssignments] = useState<Array<{
    roomId: string;
    roomNumber: string;
    guestName: string;
    reservationId: string;
    checkInDate: string;
    checkOutDate: string;
  }>>([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(true);
  const [isLoadingAssignments, setIsLoadingAssignments] = useState(true);
  const [selectedGuest, setSelectedGuest] = useState<any>(null);

  const [formData, setFormData] = useState<LocalState>({
    currentRoomNumber: '',
    newRoomId: '',
    changeDate: new Date().toISOString().split('T')[0],
    adultos: 2,
    ninos: 0,
    bebes: 0,
    reason: '',
    motivo: '',
    observaciones: '',
    guestName: '',
    reservationId: '',
  });

  // Load all rooms and current assignments on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load current assignments first
        setIsLoadingAssignments(true);
        const assignments = await FrontdeskService.getCurrentRoomAssignments();
        setRoomAssignments(assignments);

        // Load rooms
        setIsLoadingRooms(true);
        const rooms = await FrontdeskService.getRooms();
        const roomInfos: RoomInfo[] = rooms.map(room => {
          const assignment = assignments.find(a => a.roomId === room.id || a.roomNumber === (room.number || room.id));
          return {
            number: room.number || room.id,
            type: room.type,
            capacity: { 
              adults: Math.floor(room.capacity * 0.7),
              children: Math.floor(room.capacity * 0.3),
              total: room.capacity 
            },
            floor: room.floor || 1,
            status: assignment ? 'occupied' : (room.status === 'available' ? 'available' : room.status === 'occupied' ? 'occupied' : room.status === 'maintenance' ? 'maintenance' : 'reserved'),
            amenities: room.amenities,
            price: { base: room.pricePerNight, currency: 'USD' },
            features: { 
              hasBalcony: false, 
              hasSeaView: false, 
              hasKitchen: room.amenities.includes('kitchen'), 
              smokingAllowed: false 
            },
            guestName: assignment?.guestName
          };
        });
        setAllRooms(roomInfos);

      } catch (error) {
        console.error('Error loading data:', error);
        setAllRooms([]);
        setRoomAssignments([]);
      } finally {
        setIsLoadingRooms(false);
        setIsLoadingAssignments(false);
      }
    };
    loadData();
  }, []);

  // Load available rooms when guest count changes
  useEffect(() => {
    if (!isLoadingRooms) {
      searchRooms({ guests: formData.adultos + formData.ninos + formData.bebes });
    }
  }, [searchRooms, formData.adultos, formData.ninos, formData.bebes, isLoadingRooms]);


  // Guests search hook
  const { guests, searchGuests } = useGuests();

  // Handle search by name or identification (document number)
  const handleGuestQuery = (value: string) => {
    setFormData(prev => ({ ...prev, guestName: value }));
    if (value.trim().length >= 2) {
      searchGuests({ query: value.trim(), isActive: true, limit: 10 });
    }
  };

  // Handle selecting a guest from results
  const handleSelectGuest = useCallback(async (guest: any) => {
    setSelectedGuest(guest);
    
    // Fill guest basic info
    const fullName = `${guest.firstName || guest.nombre || ''} ${guest.firstLastName || guest.apellido1 || ''}`.trim();
    
    // Find current room assignment for this guest
    const currentAssignment = roomAssignments.find(assignment => 
      assignment.guestName === fullName || assignment.reservationId === guest.reservationId
    );
    
    setFormData(prev => ({
      ...prev,
      guestName: fullName,
      reservationId: guest.reservationId || currentAssignment?.reservationId || prev.reservationId || '',
      currentRoomNumber: guest.roomNumber || currentAssignment?.roomNumber || prev.currentRoomNumber || '',
      // Auto-populate guest count if available
      adultos: guest.adultos || prev.adultos,
      ninos: guest.ninos || prev.ninos,
      bebes: guest.bebes || prev.bebes,
    }));

    // Clear search results
    // Note: This would need to be implemented in the useGuests hook
  }, [roomAssignments]);

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
  const selectedRoom = allRooms.find(room => room.number === formData.newRoomId);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Header */}
          <div className="relative flex items-center justify-center mb-8">
            <div className="flex items-center gap-3">
              {isLoadingRooms || isLoadingAssignments ? (
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              ) : (
                <RefreshCw className="w-8 h-8 text-blue-600" />
              )}
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

          {!selectedGuest && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                <span>Seleccione un huésped antes de continuar con el cambio de habitación.</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información Actual */}
            <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Información Actual</h2>
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="flex items-center gap-2 px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                  title="Actualizar datos"
                >
                  <RefreshCw className="w-4 h-4" />
                  Actualizar
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="guestSearch" className="block text-sm font-medium text-gray-700 mb-2">
                      Buscar Huésped (nombre o identificación)
                    </label>
                    <input
                      id="guestSearch"
                      type="text"
                      value={formData.guestName}
                      onChange={(e) => handleGuestQuery(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ej: Juan Pérez o 12345678"
                    />
                    {/* Resultados de búsqueda */}
                    {guests && guests.length > 0 && (
                      <ul className="mt-2 max-h-48 overflow-auto bg-white border border-gray-200 rounded-md shadow-lg">
                        {guests.map((g: any) => (
                          <li
                            key={g.id}
                            onClick={() => handleSelectGuest(g)}
                            className="px-3 py-2 cursor-pointer hover:bg-blue-50 border-b border-gray-100 last:border-b-0"
                          >
                            <div className="font-medium text-gray-900">
                              {g.firstName || g.nombre} {g.firstLastName || g.apellido1}
                            </div>
                            <div className="text-sm text-gray-500">
                              {g.documentNumber || g.numero_doc} • {g.reservationId ? `Reserva: ${g.reservationId}` : 'Sin reserva'}
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                    {selectedGuest && (
                      <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md flex items-center justify-between">
                        <div>
                          <div className="text-sm text-blue-800 font-medium">Huésped seleccionado</div>
                          <div className="text-xs text-blue-600">{selectedGuest.documentNumber || selectedGuest.numero_doc}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedGuest(null);
                            setFormData(prev => ({
                              ...prev,
                              guestName: '',
                              reservationId: '',
                              currentRoomNumber: '',
                            }));
                          }}
                          className="text-blue-600 hover:text-blue-800 text-sm underline"
                        >
                          Limpiar
                        </button>
                      </div>
                    )}
                </div>
                <div>
                  <span className="block text-sm font-medium text-gray-700 mb-1">
                    Reserva
                  </span>
                  <p className="text-gray-900 font-medium">
                    {formData.reservationId || 'No asignada'}
                    {formData.guestName && formData.reservationId && ` (${formData.guestName})`}
                  </p>
                </div>
                <div>
                  <span className="block text-sm font-medium text-gray-700 mb-1">
                    Habitación Actual
                  </span>
                  <p className="text-gray-900 font-medium">
                    {formData.currentRoomNumber ? `#${formData.currentRoomNumber}` : 'No asignada'}
                  </p>
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
                      newRoomId: e.target.value ? Number.parseInt(e.target.value) : '' 
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={isLoadingRooms}
                  >
                    <option value="">
                      {isLoadingRooms ? 'Cargando habitaciones...' : 'Seleccionar habitación'}
                    </option>
                    {allRooms.map((room) => (
                      <option key={room.number} value={room.number}>
                        #{room.number} - {room.type} (Capacidad: {room.capacity.total}){room.guestName ? ` - Ocupada por ${room.guestName}` : ''}
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
                    Tipo: {selectedRoom.type} | Capacidad máxima: {selectedRoom.capacity.total} personas{selectedRoom.guestName ? ` | Ocupada por: ${selectedRoom.guestName}` : ''}
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
                    onChange={(e) => setFormData(prev => ({ ...prev, adultos: Number.parseInt(e.target.value) }))}
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
                    onChange={(e) => setFormData(prev => ({ ...prev, ninos: Number.parseInt(e.target.value) }))}
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
                    onChange={(e) => setFormData(prev => ({ ...prev, bebes: Number.parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-md">
                <p className="text-sm text-gray-700">
                  <strong>Total de huéspedes:</strong> {totalGuests} 
                  {totalGuests > 1 ? ' personas' : ' persona'}
                  {selectedRoom && totalGuests > selectedRoom.capacity.total && (
                    <span className="text-red-600 ml-2 font-medium">
                      ⚠️ Excede la capacidad de la habitación ({selectedRoom.capacity.total})
                    </span>
                  )}
                  {selectedRoom && selectedRoom.status !== 'available' && (
                    <span className="text-red-600 ml-2 font-medium">
                      ⚠️ Habitación no disponible
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
                disabled={
                  isChangingRoom || 
                  !formData.newRoomId || 
                  !selectedGuest ||
                  (selectedRoom && (totalGuests > selectedRoom.capacity.total || selectedRoom.status !== 'available'))
                }
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isChangingRoom ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Procesando...
                  </div>
                ) : (
                  'Confirmar Cambio'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RoomChange;