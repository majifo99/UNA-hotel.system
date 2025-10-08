import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, LogIn, UserPlus, Calendar, Search, User, CheckCircle, AlertCircle } from 'lucide-react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import ReactFlagsSelect from 'react-flags-select';
import { useCheckIn } from '../hooks/useCheckIn';
import { useGuests } from '../../guests/hooks/useGuests';
import { useRoomSelection } from '../hooks/useRoomSelection';
import { useInputValidation } from '../../../hooks/useInputValidation';
import { ROUTES } from '../../../router/routes';
import { DEFAULT_CURRENCY } from '../constants/currencies';
import type { CheckInData, PaymentMethod, Currency } from '../types/checkin';
import type { Guest } from '../../../types/core/domain';
import type { RoomInfo } from '../types/room';
import { CurrencySelector } from './CurrencySelector';

type CheckInType = 'reservation' | 'walk-in';
type WalkInGuestType = 'new' | 'existing';

type LocalState = {
  reservationId: string;
  firstName: string;
  lastName: string;
  roomNumber: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  adultos: number;
  ninos: number;
  bebes: number;
  identificationNumber: string;
  paymentStatus: 'pending' | 'completed';
  paymentMethod: PaymentMethod | '';
  currency: Currency;
  observacion_checkin: string;
  email: string;
  phone: string;
  phoneCountryCode: string;
  nationality: string;
  selectedGuestId: string;
  guestSearchTerm: string;
  // ⚖️ División de cargos
  requiereDivisionCargos: boolean;
  notasDivision: string;
  empresaPagadora: string;
};

// Helper functions to reduce complexity
const getInputClasses = (hasError: boolean, isReadOnly?: boolean) => {
  const baseClasses = 'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2';
  const errorClasses = hasError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500';
  const readOnlyClasses = isReadOnly ? 'bg-gray-50' : '';
  return `${baseClasses} ${errorClasses} ${readOnlyClasses}`;
};

const getButtonClasses = (isActive: boolean, variant: 'blue' | 'green' | 'purple' = 'blue') => {
  const colorMap = {
    blue: isActive ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900',
    green: isActive ? 'bg-white text-green-600 shadow-sm' : 'text-gray-600 hover:text-gray-900',
    purple: isActive ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
  };
  return `px-6 py-2 rounded-md text-sm font-medium transition-colors ${colorMap[variant]}`;
};

const isFieldReadOnly = (checkInType: CheckInType, walkInGuestType: WalkInGuestType, selectedGuestId: string) => {
  return checkInType === 'walk-in' && walkInGuestType === 'existing' && selectedGuestId !== '';
};

// Helper function to get room input classes
const getRoomInputClasses = (hasError: boolean, isEditable: boolean) => {
  const baseClasses = 'w-20 px-3 py-2 border-2 rounded-md focus:outline-none text-center text-lg font-semibold transition-all';
  
  if (hasError) {
    return `${baseClasses} border-red-500 ring-2 ring-red-200 bg-white`;
  }
  
  if (isEditable) {
    return `${baseClasses} border-blue-500 ring-2 ring-blue-200 bg-white`;
  }
  
  return `${baseClasses} border-gray-300 bg-white hover:border-gray-400`;
};

// Helper function to get room status display
const getRoomStatusDisplay = (status: string) => {
  const getStatusColor = () => {
    if (status === 'available') return 'text-green-600';
    if (status === 'occupied') return 'text-red-600';
    return 'text-yellow-600';
  };
  
  const getStatusText = () => {
    if (status === 'available') return 'Disponible';
    if (status === 'occupied') return 'Ocupada';
    return 'Mantenimiento';
  };
  
  return {
    color: getStatusColor(),
    text: getStatusText()
  };
};

// Helper function to render room information content
const renderRoomInfoContent = (loadingRoomInfo: boolean, roomInfo: RoomInfo | null) => {
  if (loadingRoomInfo) {
    return (
      <div className="mt-3 pt-3 border-t border-gray-200">
        <div className="text-xs text-gray-500 italic">
          Cargando información de la habitación...
        </div>
      </div>
    );
  }

  if (roomInfo) {
    return (
      <div className="mt-3 pt-3 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
          <div>
            <span className="font-medium">Tipo:</span> {roomInfo.type}
          </div>
          <div>
            <span className="font-medium">Capacidad:</span> {roomInfo.capacity.adults} adultos, {roomInfo.capacity.children} niños
          </div>
          <div>
            <span className="font-medium">Estado:</span>
            <span className={`ml-1 ${getRoomStatusDisplay(roomInfo.status).color}`}>
              {getRoomStatusDisplay(roomInfo.status).text}
            </span>
          </div>
          <div>
            <span className="font-medium">Piso:</span> {roomInfo.floor}
          </div>
          <div>
            <span className="font-medium">Precio:</span> ${roomInfo.price.base}/{roomInfo.price.currency}
          </div>
          <div>
            <span className="font-medium">Vista:</span> {roomInfo.features.hasSeaView ? 'Mar' : 'Ciudad'}
          </div>
        </div>

        {/* Amenidades */}
        <div className="mt-2">
          <span className="font-medium text-xs text-gray-600">Amenidades:</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {roomInfo.amenities.map((amenity: string) => (
              <span
                key={amenity}
                className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
              >
                {amenity}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-3 pt-3 border-t border-gray-200">
      <div className="text-xs text-gray-500 italic">
        Habitación no encontrada en el sistema
      </div>
    </div>
  );
};

const CheckIn = () => {
  const navigate = useNavigate();
  const { validateAndSubmit, isSubmitting, error } = useCheckIn();
  const { guests, searchGuests } = useGuests();
  const { 
    suggestions: roomSuggestions, 
    searchRoomSuggestions, 
    getRoomInfo,
    selectRoom 
  } = useRoomSelection();
  
  const { errors, validate, getCommonRules, clearError } = useInputValidation();
  
  const [checkInType, setCheckInType] = useState<CheckInType>('reservation');
  const [walkInGuestType, setWalkInGuestType] = useState<WalkInGuestType>('new');

  // Opciones de métodos de pago
  const paymentMethods = [
    { value: 'credit_card', label: 'Tarjeta de crédito' },
    { value: 'debit_card', label: 'Tarjeta de débito' },
    { value: 'cash', label: 'Efectivo' },
    { value: 'bank_transfer', label: 'Transferencia bancaria / depósito previo' },
    { value: 'agency_voucher', label: 'Voucher de agencia' },
    { value: 'courtesy', label: 'Cortesía / No pagar (comp)' },
    { value: 'corporate_account', label: 'Cargo a cuenta corporativa' },
    { value: 'points_miles', label: 'Puntos o millas' },
  ] as const;

  const [formData, setFormData] = useState<LocalState>({
    reservationId: '',
    firstName: '',
    lastName: '',
    roomNumber: '',
    checkInDate: new Date().toISOString().split('T')[0],
    checkOutDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Mañana por defecto
    numberOfGuests: 1,
    adultos: 1,
    ninos: 0,
    bebes: 0,
    identificationNumber: '',
    paymentStatus: 'pending',
    paymentMethod: '',
    currency: DEFAULT_CURRENCY,
    observacion_checkin: '',
    email: '',
    phone: '',
    phoneCountryCode: 'us',
    nationality: 'US',
    selectedGuestId: '',
    guestSearchTerm: '',
    // ⚖️ División de cargos
    requiereDivisionCargos: false,
    notasDivision: '',
    empresaPagadora: '',
  });

  // Estado para edición del campo de habitación
  const [isRoomEditable, setIsRoomEditable] = useState(false);

  // Estado para información de habitación
  const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null);
  const [loadingRoomInfo, setLoadingRoomInfo] = useState(false);

  // Efecto para cargar información de habitación cuando cambia el número
  useEffect(() => {
    const fetchRoomInfo = async () => {
      if (formData.roomNumber) {
        setLoadingRoomInfo(true);
        try {
          const info = await getRoomInfo(formData.roomNumber);
          setRoomInfo(info);
        } catch (error) {
          console.error('Error fetching room info:', error);
          setRoomInfo(null);
        } finally {
          setLoadingRoomInfo(false);
        }
      } else {
        setRoomInfo(null);
      }
    };
    fetchRoomInfo();
  }, [formData.roomNumber, getRoomInfo]);

  // Función para cambiar el tipo de check-in y limpiar datos relevantes
  const handleCheckInTypeChange = (type: CheckInType) => {
    setCheckInType(type);
    setHasLoadedReservationData(false);
    if (type === 'walk-in') {
      // Limpiar el ID de reserva para walk-ins
      setFormData(prev => ({ ...prev, reservationId: '' }));
      setReservationSearchId('');
    } else {
      // Limpiar datos de walk-in
      setFormData(prev => ({
        ...prev,
        selectedGuestId: '',
        guestSearchTerm: ''
      }));
    }
  };

  // Función para buscar reserva por ID
  const handleSearchReservation = () => {
    if (formData.reservationId.trim()) {
      setReservationSearchId(formData.reservationId.trim());
      setHasLoadedReservationData(false);
    }
  };

  // Función para limpiar búsqueda de reserva
  const handleClearReservation = () => {
    setFormData(prev => ({
      ...prev,
      reservationId: '',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      identificationNumber: '',
      nationality: 'US',
      checkInDate: new Date().toISOString().split('T')[0],
      checkOutDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      numberOfGuests: 1,
      adultos: 1,
      ninos: 0,
      bebes: 0,
      roomNumber: ''
    }));
    setReservationSearchId('');
    setHasLoadedReservationData(false);
  };

  // Función para cambiar el tipo de huésped en walk-in
  const handleWalkInGuestTypeChange = (type: WalkInGuestType) => {
    setWalkInGuestType(type);
    if (type === 'new') {
      // Limpiar datos del huésped seleccionado
      setFormData(prev => ({ 
        ...prev, 
        selectedGuestId: '',
        guestSearchTerm: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        identificationNumber: '',
        nationality: 'US'
      }));
    }
  };

  // Función para buscar huéspedes
  const handleGuestSearch = (searchTerm: string) => {
    setFormData(prev => ({ ...prev, guestSearchTerm: searchTerm }));
    if (searchTerm.length >= 2) {
      searchGuests({
        query: searchTerm,
        isActive: true,
        limit: 10
      });
    }
  };

  // Función para seleccionar un huésped existente
  const handleSelectExistingGuest = (guest: Guest) => {
    const fullLastName = guest.secondLastName 
      ? `${guest.firstLastName} ${guest.secondLastName}`
      : guest.firstLastName;
    
    setFormData(prev => ({
      ...prev,
      selectedGuestId: guest.id,
      firstName: guest.firstName,
      lastName: fullLastName,
      email: guest.email,
      phone: guest.phone,
      identificationNumber: guest.documentNumber,
      nationality: guest.nationality || 'US',
      guestSearchTerm: `${guest.firstName} ${fullLastName}`,
    }));
  };

  // Filtrar huéspedes para mostrar en la búsqueda
  const filteredGuests = guests.filter(guest => {
    if (!formData.guestSearchTerm || formData.guestSearchTerm.length < 2) return false;
    const searchTerm = formData.guestSearchTerm.toLowerCase();
    const fullName = `${guest.firstName} ${guest.firstLastName} ${guest.secondLastName || ''}`.toLowerCase();
    return fullName.includes(searchTerm) || 
           guest.email.toLowerCase().includes(searchTerm) ||
           guest.documentNumber.toLowerCase().includes(searchTerm);
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const checkInData: CheckInData = {
      reservationId: checkInType === 'walk-in' 
        ? `WALKIN-${Date.now()}` 
        : formData.reservationId || `WALKIN-${Date.now()}`,
      guestName: `${formData.firstName} ${formData.lastName}`,
      roomNumber: formData.roomNumber,
      checkInDate: formData.checkInDate,
      checkOutDate: formData.checkOutDate,
      numberOfGuests: formData.numberOfGuests,
      adultos: formData.adultos,
      ninos: formData.ninos,
      bebes: formData.bebes,
      identificationNumber: formData.identificationNumber,
      paymentStatus: formData.paymentStatus,
      paymentMethod: formData.paymentMethod || undefined,
      currency: formData.currency,
      observacion_checkin: formData.observacion_checkin || undefined,
      isWalkIn: checkInType === 'walk-in',
      guestEmail: formData.email,
      guestPhone: formData.phone,
      guestNationality: formData.nationality,
      // ⚖️ División de cargos
      requiereDivisionCargos: formData.requiereDivisionCargos,
      notasDivision: formData.requiereDivisionCargos ? formData.notasDivision : undefined,
      empresaPagadora: formData.requiereDivisionCargos ? formData.empresaPagadora : undefined,
      // Agregar ID del huésped existente si se seleccionó uno
      ...(checkInType === 'walk-in' && walkInGuestType === 'existing' && formData.selectedGuestId && {
        existingGuestId: formData.selectedGuestId
      })
    };

    const result = await validateAndSubmit(checkInData);
    if (result.success) {
      // Emitir evento personalizado para el flujo
      const checkInSuccessEvent = new CustomEvent('checkInSuccess', {
        detail: {
          folioId: result.folioId,
          guestName: checkInData.guestName,
          roomNumber: checkInData.roomNumber,
          requiresChargeDistribution: checkInData.requiereDivisionCargos,
          checkInData
        }
      });
      window.dispatchEvent(checkInSuccessEvent);
      
      // Si no requiere división de cargos, ir directamente al dashboard
      if (!checkInData.requiereDivisionCargos) {
        navigate(ROUTES.FRONTDESK.BASE);
      }
      // Si requiere división, el flujo se encargará de mostrar el FolioManager
    }
  };

  // Helper functions to extract nested ternary operations
  const getSubmitButtonStyles = (): string => {
    return checkInType === 'walk-in' 
      ? 'bg-green-600 hover:bg-green-700' 
      : 'bg-blue-600 hover:bg-blue-700';
  };

  const getSubmitButtonText = (): string => {
    if (isSubmitting) {
      return 'Procesando...';
    }
    
    return checkInType === 'walk-in' 
      ? 'Registrar Walk-In' 
      : 'Realizar Check-In';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Header with centered title and back button */}
          <div className="relative flex items-center justify-center mb-8">
            {/* Centered title */}
            <div className="flex items-center gap-3">
              <LogIn className="w-8 h-8 text-green-600" />
              <h1 className="text-3xl font-bold text-gray-900">Check-In</h1>
            </div>
            
            {/* Back button positioned in top right */}
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

          {/* Selector de tipo de Check-In */}
          <div className="mb-6">
            <div className="flex justify-center">
              <div className="bg-gray-100 p-1 rounded-lg flex">
                <button
                  type="button"
                  onClick={() => handleCheckInTypeChange('reservation')}
                  className={getButtonClasses(checkInType === 'reservation')}
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Reserva Existente
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => handleCheckInTypeChange('walk-in')}
                  className={getButtonClasses(checkInType === 'walk-in', 'green')}
                >
                  <div className="flex items-center gap-2">
                    <UserPlus className="w-4 h-4" />
                    Walk-In
                  </div>
                </button>
              </div>
            </div>
            {checkInType === 'walk-in' && (
              <p className="text-center text-sm text-gray-600 mt-2">
                Huésped sin reserva previa
              </p>
            )}
          </div>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Campo de ID de Reserva - Solo para reservas existentes */}
            {checkInType === 'reservation' && (
              <div className="border border-gray-200 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Información de la Reserva</h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="reservationId" className="block text-sm font-medium text-gray-700 mb-2">
                      ID de Reserva <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-2">
                      <input
                        id="reservationId"
                        type="text"
                        value={formData.reservationId}
                        onChange={(e) => {
                          setFormData(prev => ({ ...prev, reservationId: e.target.value }));
                          if (hasLoadedReservationData) {
                            setHasLoadedReservationData(false);
                          }
                        }}
                        className={getInputClasses(false, false)}
                        required={checkInType === 'reservation'}
                        placeholder="Ingrese el ID de la reserva"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleSearchReservation();
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleSearchReservation}
                        disabled={!formData.reservationId.trim() || isLoadingReservation}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {isLoadingReservation ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Buscando...
                          </>
                        ) : (
                          <>
                            <Search className="w-4 h-4" />
                            Buscar
                          </>
                        )}
                      </button>
                      {hasLoadedReservationData && (
                        <button
                          type="button"
                          onClick={handleClearReservation}
                          className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 flex items-center gap-2"
                        >
                          Limpiar
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Estado de búsqueda de reserva */}
                  {isLoadingReservation && (
                    <div className="flex items-center gap-2 text-blue-600 text-sm">
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      Buscando reserva...
                    </div>
                  )}

                  {isReservationError && reservationError && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      No se encontró la reserva o ocurrió un error: {reservationError.message}
                    </div>
                  )}

                  {foundReservation && hasLoadedReservationData && (
                    <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md text-green-700 text-sm">
                      <CheckCircle className="w-4 h-4" />
                      Reserva encontrada - Datos cargados automáticamente
                      <div className="ml-auto">
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          Estado: {foundReservation.status}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Información adicional de la reserva encontrada */}
                  {foundReservation && hasLoadedReservationData && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <h3 className="text-sm font-semibold text-gray-900 mb-2">Detalles de la Reserva</h3>
                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                        <div><strong>Confirmación:</strong> {foundReservation.confirmationNumber}</div>
                        <div><strong>Estado:</strong> {foundReservation.status}</div>
                        <div><strong>Huéspedes:</strong> {foundReservation.numberOfGuests} personas</div>
                        <div><strong>Noches:</strong> {foundReservation.numberOfNights}</div>
                        <div><strong>Total:</strong> ${foundReservation.total}</div>
                        {foundReservation.specialRequests && (
                          <div className="col-span-2"><strong>Solicitudes:</strong> {foundReservation.specialRequests}</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Información del Huésped */}
            <div className="border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Información del Huésped
                {checkInType === 'walk-in' && (
                  <span className="ml-2 text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    Walk-In
                  </span>
                )}
              </h2>

              {/* Selector de tipo de huésped para Walk-In */}
              {checkInType === 'walk-in' && (
                <div className="mb-6">
                  <div className="flex justify-center">
                    <div className="bg-gray-100 p-1 rounded-lg flex">
                      <button
                        type="button"
                        onClick={() => handleWalkInGuestTypeChange('new')}
                        className={getButtonClasses(walkInGuestType === 'new', 'green')}
                      >
                        <div className="flex items-center gap-2">
                          <UserPlus className="w-4 h-4" />
                          Huésped Nuevo
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleWalkInGuestTypeChange('existing')}
                        className={getButtonClasses(walkInGuestType === 'existing', 'green')}
                      >
                        <div className="flex items-center gap-2">
                          <Search className="w-4 h-4" />
                          Huésped Existente
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Búsqueda de huésped existente para Walk-In */}
              {isFieldReadOnly(checkInType, walkInGuestType, '') && (
                <div className="mb-6">
                  <label htmlFor="guestSearch" className="block text-sm font-medium text-gray-700 mb-2">
                    Buscar Huésped <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="guestSearch"
                      type="text"
                      value={formData.guestSearchTerm}
                      onChange={(e) => handleGuestSearch(e.target.value)}
                      className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Buscar por nombre, email o documento..."
                    />
                    <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                  </div>
                  
                  {/* Lista de huéspedes encontrados */}
                  {formData.guestSearchTerm.length >= 2 && filteredGuests.length > 0 && (
                    <div className="mt-2 max-h-48 overflow-y-auto border border-gray-200 rounded-md bg-white shadow-sm">
                      {filteredGuests.slice(0, 5).map((guest) => (
                        <button
                          key={guest.id}
                          type="button"
                          onClick={() => handleSelectExistingGuest(guest)}
                          className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                        >
                          <div className="flex items-center gap-3">
                            <User className="w-5 h-5 text-gray-400" />
                            <div>
                              <p className="font-medium text-gray-900">
                                {guest.firstName} {guest.firstLastName} {guest.secondLastName || ''}
                              </p>
                              <p className="text-sm text-gray-600">{guest.email}</p>
                              <p className="text-xs text-gray-500">Doc: {guest.documentNumber}</p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {formData.guestSearchTerm.length >= 2 && filteredGuests.length === 0 && (
                    <p className="mt-2 text-sm text-gray-500">
                      No se encontraron huéspedes. Intenta con un término diferente.
                    </p>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    value={formData.firstName}
                    maxLength={15}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Solo permitir letras y espacios
                      if (/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]*$/.test(value)) {
                        setFormData(prev => ({ ...prev, firstName: value }));
                        clearError('firstName');
                      }
                    }}
                    onBlur={(e) => validate('firstName', e.target.value, getCommonRules('firstName'))}
                    className={getInputClasses(!!errors.firstName, isFieldReadOnly(checkInType, walkInGuestType, formData.selectedGuestId) || hasLoadedReservationData)}
                    required
                    readOnly={isFieldReadOnly(checkInType, walkInGuestType, formData.selectedGuestId) || hasLoadedReservationData}
                    placeholder="Ej: Juan"
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                    Apellido <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    value={formData.lastName}
                    maxLength={15}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Solo permitir letras y espacios
                      if (/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]*$/.test(value)) {
                        setFormData(prev => ({ ...prev, lastName: value }));
                        clearError('lastName');
                      }
                    }}
                    onBlur={(e) => validate('lastName', e.target.value, getCommonRules('lastName'))}
                    className={getInputClasses(!!errors.lastName, isFieldReadOnly(checkInType, walkInGuestType, formData.selectedGuestId) || hasLoadedReservationData)}
                    required
                    readOnly={isFieldReadOnly(checkInType, walkInGuestType, formData.selectedGuestId) || hasLoadedReservationData}
                    placeholder="Ej: Pérez"
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    maxLength={40}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, email: e.target.value }));
                      clearError('email');
                    }}
                    onBlur={(e) => validate('email', e.target.value, getCommonRules('email'))}
                    className={getInputClasses(!!errors.email, isFieldReadOnly(checkInType, walkInGuestType, formData.selectedGuestId) || hasLoadedReservationData)}
                    required
                    readOnly={isFieldReadOnly(checkInType, walkInGuestType, formData.selectedGuestId) || hasLoadedReservationData}
                    placeholder="Ej: juan@email.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono <span className="text-red-500">*</span>
                  </label>
                  <PhoneInput
                    country={formData.phoneCountryCode}
                    value={formData.phone}
                    onChange={(phone) => setFormData(prev => ({ ...prev, phone }))}
                    inputProps={{
                      id: 'phone',
                      name: 'phone',
                      required: true,
                      readOnly: isFieldReadOnly(checkInType, walkInGuestType, formData.selectedGuestId) || hasLoadedReservationData,
                    }}
                    inputClass="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label id="nationality-label" className="block text-sm font-medium text-gray-700 mb-2">
                    Nacionalidad <span className="text-red-500">*</span>
                  </label>
                  <ReactFlagsSelect
                    selected={formData.nationality}
                    onSelect={(code) => setFormData(prev => ({ ...prev, nationality: code }))}
                    className="w-full"
                    selectButtonClassName="react-flags-select-button"
                    aria-labelledby="nationality-label"
                    aria-required="true"
                    disabled={isFieldReadOnly(checkInType, walkInGuestType, formData.selectedGuestId) || hasLoadedReservationData}
                  />
                </div>

                <div>
                  <label htmlFor="identificationNumber" className="block text-sm font-medium text-gray-700 mb-2">
                    Número de Identificación <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="identificationNumber"
                    type="text"
                    value={formData.identificationNumber}
                    maxLength={25}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Solo permitir alfanumérico y guiones
                      if (/^[a-zA-Z0-9-]*$/.test(value)) {
                        setFormData(prev => ({ ...prev, identificationNumber: value }));
                        clearError('identificationNumber');
                      }
                    }}
                    onBlur={(e) => validate('identificationNumber', e.target.value, getCommonRules('identification'))}
                    className={getInputClasses(!!errors.identificationNumber, isFieldReadOnly(checkInType, walkInGuestType, formData.selectedGuestId) || hasLoadedReservationData)}
                    required
                    readOnly={isFieldReadOnly(checkInType, walkInGuestType, formData.selectedGuestId) || hasLoadedReservationData}
                    placeholder="Ej: 123456789 o AB123456"
                  />
                  {errors.identificationNumber && (
                    <p className="mt-1 text-sm text-red-600">{errors.identificationNumber}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Información de Pago - Para ambos tipos */}
            <div className="border border-blue-200 bg-blue-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Información de Pago</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="paymentStatus" className="block text-sm font-medium text-gray-700 mb-2">
                    Estado de Pago <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="paymentStatus"
                    value={formData.paymentStatus}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      paymentStatus: e.target.value as 'pending' | 'completed' 
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="pending">Pendiente de Pago</option>
                    <option value="completed">Pago Completado</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-2">
                    Método de Pago <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      paymentMethod: e.target.value as PaymentMethod 
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Seleccionar método de pago</option>
                    {paymentMethods.map((method) => (
                      <option key={method.value} value={method.value}>
                        {method.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-2">
                    Divisa de Pago
                  </label>
                  <CurrencySelector
                    value={formData.currency}
                    onChange={(currency) => setFormData(prev => ({ 
                      ...prev, 
                      currency
                    }))}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Información adicional para Walk-In */}
            {checkInType === 'walk-in' && (
              <div className="border border-yellow-200 bg-yellow-50 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Información Adicional - Walk-In</h2>
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3 w-full">
                  <p className="text-sm text-blue-800">
                    <strong>Walk-In:</strong> Este huésped no tiene reserva previa. 
                    Se generará automáticamente un ID de registro.
                    {walkInGuestType === 'existing' && formData.selectedGuestId && (
                      <span className="block mt-1">
                        <strong>Huésped seleccionado:</strong> Los datos del huésped existente se han cargado automáticamente.
                      </span>
                    )}
                  </p>
                </div>
              </div>
            )}

            {/* Información de la Estancia */}
            <div className="border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Información de la Estancia</h2>
              
              {/* Fechas en la primera fila */}
              <div className="border-2 border-gray-300 rounded-lg p-4 mb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="checkInDate" className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha Llegada <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="checkInDate"
                      type="date"
                      value={formData.checkInDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, checkInDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="checkOutDate" className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha Salida <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="checkOutDate"
                      type="date"
                      value={formData.checkOutDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, checkOutDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min={formData.checkInDate}
                      required
                    />
                  </div>
                </div>

                {/* Composición de huéspedes en la segunda fila */}
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div>
                    <label htmlFor="adultos" className="block text-sm font-medium text-gray-700 mb-2">
                      Adultos <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="adultos"
                      type="number"
                      min="1"
                      max="20"
                      value={formData.adultos}
                      onChange={(e) => {
                        const adults = Number.parseInt(e.target.value) || 1;
                        if (adults >= 1 && adults <= 20) {
                          setFormData(prev => ({ 
                            ...prev, 
                            adultos: adults,
                            numberOfGuests: adults + prev.ninos + prev.bebes
                          }));
                          clearError('adultos');
                        }
                      }}
                      onBlur={(e) => validate('adultos', e.target.value, getCommonRules('adults'))}
                      className={getInputClasses(!!errors.adultos, false)}
                      required
                    />
                    {errors.adultos && (
                      <p className="mt-1 text-sm text-red-600">{errors.adultos}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="ninos" className="block text-sm font-medium text-gray-700 mb-2">
                      Niños
                    </label>
                    <input
                      id="ninos"
                      type="number"
                      min="0"
                      max="15"
                      value={formData.ninos}
                      onChange={(e) => {
                        const children = Number.parseInt(e.target.value) || 0;
                        if (children >= 0 && children <= 15) {
                          setFormData(prev => ({ 
                            ...prev, 
                            ninos: children,
                            numberOfGuests: prev.adultos + children + prev.bebes
                          }));
                          clearError('ninos');
                        }
                      }}
                      onBlur={(e) => validate('ninos', e.target.value, getCommonRules('children'))}
                      className={getInputClasses(!!errors.ninos, false)}
                    />
                    {errors.ninos && (
                      <p className="mt-1 text-sm text-red-600">{errors.ninos}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="bebes" className="block text-sm font-medium text-gray-700 mb-2">
                      Bebes
                    </label>
                    <input
                      id="bebes"
                      type="number"
                      min="0"
                      max="10"
                      value={formData.bebes}
                      onChange={(e) => {
                        const babies = Number.parseInt(e.target.value) || 0;
                        if (babies >= 0 && babies <= 10) {
                          setFormData(prev => ({ 
                            ...prev, 
                            bebes: babies,
                            numberOfGuests: prev.adultos + prev.ninos + babies
                          }));
                          clearError('bebes');
                        }
                      }}
                      onBlur={(e) => validate('bebes', e.target.value, getCommonRules('babies'))}
                      className={getInputClasses(!!errors.bebes, false)}
                    />
                    {errors.bebes && (
                      <p className="mt-1 text-sm text-red-600">{errors.bebes}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Habitación en una sección separada */}
              <div className="border-2 border-gray-300 rounded-lg p-4 bg-gray-50 relative">
                <div className="flex items-center justify-between">
                  <div className="flex-1 mr-4 relative">
                    <label htmlFor="roomNumber" className="block text-sm font-medium text-gray-700 mb-2">
                      N Habitacion <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="roomNumber"
                        type="text"
                        value={formData.roomNumber}
                        maxLength={10}
                        onChange={(e) => {
                          const value = e.target.value;
                          // Solo permitir alfanumérico y guiones
                          if (/^[a-zA-Z0-9-]*$/.test(value)) {
                            setFormData(prev => ({ ...prev, roomNumber: value }));
                            searchRoomSuggestions(value);
                            clearError('roomNumber');
                          }
                        }}
                        onFocus={() => setIsRoomEditable(true)}
                        onBlur={(e) => {
                          validate('roomNumber', e.target.value, getCommonRules('roomNumber'));
                          // Retrasar el cierre para permitir clicks en sugerencias
                          setTimeout(() => setIsRoomEditable(false), 200);
                        }}
                        className={getRoomInputClasses(!!errors.roomNumber, isRoomEditable)}
                        required
                        placeholder="101"
                      />
                      
                      {/* Error de validación */}
                      {errors.roomNumber && (
                        <p className="absolute top-full left-0 mt-1 text-xs text-red-600">{errors.roomNumber}</p>
                      )}
                      
                      {/* Sugerencias de habitaciones */}
                      {isRoomEditable && roomSuggestions.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-10 max-h-32 overflow-y-auto">
                          {roomSuggestions.map((room) => (
                            <button
                              key={room}
                              type="button"
                              onClick={() => {
                                selectRoom(room);
                                setFormData(prev => ({ ...prev, roomNumber: room }));
                                setIsRoomEditable(false);
                              }}
                              className="w-full px-3 py-2 text-left hover:bg-blue-50 hover:text-blue-700 transition-colors"
                            >
                              Habitación {room}
                            </button>
                          ))}
                        </div>
                      )}
                      
                      {/* Mostrar mensaje si no hay sugerencias pero el usuario está escribiendo */}
                      {isRoomEditable && formData.roomNumber.length > 0 && roomSuggestions.length === 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-10 p-3">
                          <p className="text-sm text-gray-500">
                            No se encontraron habitaciones que coincidan con "{formData.roomNumber}"
                          </p>
                        </div>
                      )}
                    </div>
                    
                    {/* Indicador de estado */}
                    {formData.roomNumber && (
                      <div className="mt-1 text-xs text-green-600 flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Disponible
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setIsRoomEditable(!isRoomEditable)}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-md transition-colors"
                      title="Editar habitación"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        // Aquí se podría integrar con el sistema de reservas
                        // Confirmar habitación seleccionada
                      }}
                      disabled={!formData.roomNumber}
                      className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
                    >
                      Confirmar
                    </button>
                  </div>
                </div>
                
                {/* Información adicional de la habitación */}
                {formData.roomNumber && (
                  <>
                    {renderRoomInfoContent(loadingRoomInfo, roomInfo)}
                  </>
                )}
              </div>

              {/* ⚖️ División de Cargos al Checkout */}
              <div className="mt-6 border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">⚖️ División de Cargos</h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      id="requiereDivisionCargos"
                      type="checkbox"
                      checked={formData.requiereDivisionCargos}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        requiereDivisionCargos: e.target.checked,
                        // Limpiar campos relacionados si se desmarca
                        notasDivision: e.target.checked ? prev.notasDivision : '',
                        empresaPagadora: e.target.checked ? prev.empresaPagadora : ''
                      }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="requiereDivisionCargos" className="ml-2 block text-sm font-medium text-gray-700">
                      Requiere división de cargos en el checkout
                    </label>
                  </div>

                  {formData.requiereDivisionCargos && (
                    <div className="ml-6 space-y-4 border-l-4 border-blue-500 pl-4 bg-blue-50 p-4 rounded-r-lg">
                      <div className="bg-blue-100 border border-blue-300 rounded-md p-3">
                        <p className="text-sm text-blue-800">
                          <strong>ℹ️ Información:</strong> Esta configuración indica que los cargos 
                          deberán dividirse entre diferentes responsables durante el checkout. 
                          La división real se realizará en ese momento usando el sistema de distribución de folios.
                        </p>
                      </div>

                      <div>
                        <label htmlFor="empresaPagadora" className="block text-sm font-medium text-gray-700 mb-2">
                          Empresa/Agencia Pagadora (opcional)
                        </label>
                        <input
                          id="empresaPagadora"
                          type="text"
                          value={formData.empresaPagadora}
                          onChange={(e) => setFormData(prev => ({ ...prev, empresaPagadora: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Ej: Corporativo ABC, Agencia XYZ..."
                          maxLength={100}
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          Nombre de la empresa o agencia que pagará parte o todos los cargos
                        </p>
                      </div>

                      <div>
                        <label htmlFor="notasDivision" className="block text-sm font-medium text-gray-700 mb-2">
                          Notas sobre la división
                        </label>
                        <textarea
                          id="notasDivision"
                          value={formData.notasDivision}
                          onChange={(e) => setFormData(prev => ({ ...prev, notasDivision: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                          rows={3}
                          placeholder="Ej: 'Hospedaje y desayuno a cargo de la empresa. Otros cargos al huésped.'"
                          maxLength={300}
                        />
                        <div className="mt-1 text-xs text-gray-500 text-right">
                          {formData.notasDivision.length}/300 caracteres
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                          Instrucciones específicas sobre cómo dividir los cargos (se usarán en el checkout)
                        </p>
                      </div>

                      <div className="bg-yellow-50 border border-yellow-300 rounded-md p-3">
                        <p className="text-sm text-yellow-800">
                          <strong>⚠️ Recordatorio:</strong> Esta es solo una nota de que se requerirá división. 
                          La configuración detallada (tipos de cargo, porcentajes, responsables específicos) 
                          se realizará durante el proceso de checkout.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Observaciones */}
              <div className="mt-4">
                <label htmlFor="observacion_checkin" className="block text-sm font-medium text-gray-700 mb-2">
                  Observaciones del Check-In
                </label>
                <textarea
                  id="observacion_checkin"
                  value={formData.observacion_checkin}
                  maxLength={500}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Permitir texto con puntuación básica
                    if (/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s.,;:!?()-]*$/.test(value)) {
                      setFormData(prev => ({ ...prev, observacion_checkin: value }));
                      clearError('observaciones');
                    }
                  }}
                  onBlur={(e) => validate('observaciones', e.target.value, getCommonRules('observations'))}
                  className={`${getInputClasses(!!errors.observaciones, false)} resize-none`}
                  rows={3}
                  placeholder="Observaciones adicionales sobre el check-in... (máx. 500 caracteres)"
                />
                {errors.observaciones && (
                  <p className="mt-1 text-sm text-red-600">{errors.observaciones}</p>
                )}
                <div className="mt-1 text-xs text-gray-500 text-right">
                  {formData.observacion_checkin.length}/500 caracteres
                </div>
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
                disabled={isSubmitting}
                className={`px-6 py-2 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 ${
                  getSubmitButtonStyles()
                }`}
              >
                {getSubmitButtonText()}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CheckIn;
