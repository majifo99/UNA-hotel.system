// CheckIn.tsx — Simplificado para migración
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, LogIn, UserPlus, Calendar } from 'lucide-react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import ReactFlagsSelect from 'react-flags-select';
import { useCheckIn } from '../hooks/useCheckIn';
import { ROUTES } from '../../../router/routes';
import type { CheckInData } from '../types/checkin';

type CheckInType = 'reservation' | 'walk-in';

type LocalState = {
  reservationId: string;
  firstName: string;
  lastName: string;
  roomNumber: string;
  checkInDate: string;
  numberOfGuests: number;
  identificationNumber: string;
  paymentStatus: 'pending' | 'completed';
  email: string;
  phone: string;
  phoneCountryCode: string;
  nationality: string;
};

const CheckIn = () => {
  const navigate = useNavigate();
  const { validateAndSubmit, isSubmitting, error } = useCheckIn();
  
  const [checkInType, setCheckInType] = useState<CheckInType>('reservation');

  const [formData, setFormData] = useState<LocalState>({
    reservationId: '',
    firstName: '',
    lastName: '',
    roomNumber: '',
    checkInDate: new Date().toISOString().split('T')[0],
    numberOfGuests: 1,
    identificationNumber: '',
    paymentStatus: 'pending',
    email: '',
    phone: '',
    phoneCountryCode: 'us',
    nationality: 'US',
  });

  // Función para cambiar el tipo de check-in y limpiar datos relevantes
  const handleCheckInTypeChange = (type: CheckInType) => {
    setCheckInType(type);
    if (type === 'walk-in') {
      // Limpiar el ID de reserva para walk-ins
      setFormData(prev => ({ ...prev, reservationId: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const checkInData: CheckInData = {
      reservationId: checkInType === 'walk-in' 
        ? `WALKIN-${Date.now()}` 
        : formData.reservationId || `WALKIN-${Date.now()}`,
      guestName: `${formData.firstName} ${formData.lastName}`,
      roomNumber: formData.roomNumber,
      checkInDate: formData.checkInDate,
      numberOfGuests: formData.numberOfGuests,
      identificationNumber: formData.identificationNumber,
      paymentStatus: formData.paymentStatus,
      isWalkIn: checkInType === 'walk-in',
      guestEmail: formData.email,
      guestPhone: formData.phone,
      guestNationality: formData.nationality,
    };

    const success = await validateAndSubmit(checkInData);
    if (success) {
      navigate(ROUTES.FRONTDESK.BASE);
    }
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
                  className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                    checkInType === 'reservation'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Reserva Existente
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => handleCheckInTypeChange('walk-in')}
                  className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                    checkInType === 'walk-in'
                      ? 'bg-white text-green-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
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
                <div>
                  <label htmlFor="reservationId" className="block text-sm font-medium text-gray-700 mb-2">
                    ID de Reserva <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="reservationId"
                    type="text"
                    value={formData.reservationId}
                    onChange={(e) => setFormData(prev => ({ ...prev, reservationId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required={checkInType === 'reservation'}
                    placeholder="Ingrese el ID de la reserva"
                  />
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                    Apellido <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
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
                    onChange={(e) => setFormData(prev => ({ ...prev, identificationNumber: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Información adicional para Walk-In */}
            {checkInType === 'walk-in' && (
              <div className="border border-yellow-200 bg-yellow-50 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Información Adicional - Walk-In</h2>
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
                  
                  <div className="flex items-end">
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-3 w-full">
                      <p className="text-sm text-blue-800">
                        <strong>Walk-In:</strong> Este huésped no tiene reserva previa. 
                        Se generará automáticamente un ID de registro.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Información de la Habitación */}
            <div className="border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Información de la Habitación</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="roomNumber" className="block text-sm font-medium text-gray-700 mb-2">
                    Número de Habitación <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="roomNumber"
                    type="text"
                    value={formData.roomNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, roomNumber: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="checkInDate" className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de Check-In <span className="text-red-500">*</span>
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
                  <label htmlFor="numberOfGuests" className="block text-sm font-medium text-gray-700 mb-2">
                    Número de Huéspedes <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="numberOfGuests"
                    type="number"
                    min="1"
                    value={formData.numberOfGuests}
                    onChange={(e) => setFormData(prev => ({ ...prev, numberOfGuests: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
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
                  checkInType === 'walk-in' 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isSubmitting 
                  ? 'Procesando...' 
                  : checkInType === 'walk-in' 
                    ? 'Registrar Walk-In' 
                    : 'Realizar Check-In'
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CheckIn;
