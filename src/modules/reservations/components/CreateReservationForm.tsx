import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { type FieldError } from 'react-hook-form';
import { useCreateReservationForm } from '../hooks/useCreateReservationForm';
import { useMultiStepForm } from '../hooks/useMultiStepForm';
import { GuestSelector } from './GuestSelector';
import { RoomSelection } from './sections/RoomSelection';
import { ServicesSelection } from './ServicesSelection';
import { PriceCalculatorWidget } from './ui/PriceCalculatorWidget';
import { StepIndicator, StepNavigation, ReservationFlowToggle } from './common';
import { type ReservationFlowMode } from './common/ReservationFlowToggle';
import { RoomSelectorWithCalendar } from './sections/RoomSelectorWithCalendar';
import {
  FormHeader,
  SectionWrapper,
  SpecialRequests
} from './index';
import type { Room, AdditionalService } from '../../../types/core/domain';
import { guestApiService } from '../../guests/services/guestApiService';
import type { CreateGuestData } from '../../guests/types';

// Quick Mode Flow Component
interface QuickModeFlowProps {
  formData: {
    roomIds: string[];
    checkInDate: string | null;
    checkOutDate: string | null;
    guestId: string | null;
    numberOfGuests: number;
    additionalServices?: string[];
    specialRequests?: string;
  };
  errors: Record<string, FieldError | undefined>;
  setValue: (field: string, value: unknown) => void;
  availableRooms: Room[];
  additionalServices: AdditionalService[];
  isSubmitting: boolean;
  onSubmit: () => void;
  getErrorMessage: (error: FieldError | undefined) => string | undefined;
}

const QuickModeFlow: React.FC<QuickModeFlowProps> = ({
  formData,
  errors,
  setValue,
  availableRooms,
  additionalServices,
  isSubmitting,
  onSubmit,
  getErrorMessage,
}) => {
  const [quickStep, setQuickStep] = useState(0);
  const [enableGroupReservation, setEnableGroupReservation] = useState(false);

  // Quick mode steps: 0=Room+Dates, 1=Guest, 2=Services, 3=Review
  const quickSteps = [
    { id: 'room-dates', title: 'Habitación & Fechas', description: 'Seleccione habitación y fechas', icon: '🏨' },
    { id: 'guest', title: 'Huésped', description: 'Seleccione cliente', icon: '👤' },
    { id: 'services', title: 'Extras', description: 'Servicios opcionales', icon: '➕' },
    { id: 'review', title: 'Revisar', description: 'Confirmar reserva', icon: '✅' },
  ];

  const canProceedQuick = (): boolean => {
    switch (quickStep) {
      case 0: return formData.roomIds.length > 0; // Fechas validadas en RoomSelectorWithCalendar
      case 1: return !!formData.guestId;
      case 2: return true; // Services optional
      case 3: return true;
      default: return false;
    }
  };

  const handleRoomAndDatesSelected = (roomId: string, checkIn: string, checkOut: string) => {
    setValue('roomIds', [roomId]);
    setValue('checkInDate', checkIn);
    setValue('checkOutDate', checkOut);
    setValue('numberOfGuests', 1);
    setQuickStep(1);
  };

  const handleMultipleRoomsSelected = (selections: Array<{ roomId: string; checkIn: string; checkOut: string }>) => {
    // Extraer roomIds
    const roomIds = selections.map(s => s.roomId);
    setValue('roomIds', roomIds);
    
    // Guardar fechas por habitación en localStorage
    const datesMap: Record<string, { checkIn: string; checkOut: string }> = {};
    selections.forEach(sel => {
      datesMap[sel.roomId] = { checkIn: sel.checkIn, checkOut: sel.checkOut };
    });
    localStorage.setItem('roomDatesMap', JSON.stringify(datesMap));
    
    // Usar fechas de la primera habitación como fechas globales (para compatibilidad)
    if (selections.length > 0) {
      setValue('checkInDate', selections[0].checkIn);
      setValue('checkOutDate', selections[0].checkOut);
    }
    
    setValue('numberOfGuests', selections.length); // Estimación inicial
    setQuickStep(1);
  };

  // Estado para crear huésped inline
  const [showInlineGuestForm, setShowInlineGuestForm] = useState(false);
  const [isCreatingGuest, setIsCreatingGuest] = useState(false);
  const [newGuestData, setNewGuestData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    identificacion: '',
  });

  const handleCreateGuestInline = async () => {
    // Validación básica
    if (!newGuestData.nombre || !newGuestData.apellido || !newGuestData.identificacion) {
      alert('Por favor complete los campos obligatorios (Nombre, Apellido, Identificación)');
      return;
    }

    setIsCreatingGuest(true);
    
    try {
      // Preparar datos para el API
      const guestDataForApi: CreateGuestData = {
        firstName: newGuestData.nombre,
        firstLastName: newGuestData.apellido,
        secondLastName: '', // Opcional
        email: newGuestData.email || '',
        phone: newGuestData.telefono || '',
        documentNumber: newGuestData.identificacion,
        documentType: 'id_card', // Tipo por defecto (cédula)
        nationality: 'CR', // Nacionalidad por defecto Costa Rica
        // gender: NO enviar - dejar que el backend use null por defecto
        vipStatus: false,
      };

      // Crear huésped en el backend
      const createdGuest = await guestApiService.createGuest(guestDataForApi);
      
      // Guardar el ID real del huésped
      setValue('guestId', createdGuest.id);
      
      // Resetear formulario y avanzar
      setShowInlineGuestForm(false);
      setNewGuestData({ nombre: '', apellido: '', email: '', telefono: '', identificacion: '' });
      setQuickStep(2);
      
      console.log('Huésped creado exitosamente:', createdGuest);
    } catch (error) {
      console.error('Error al crear huésped:', error);
      alert('Error al crear el huésped. Por favor intente nuevamente.');
    } finally {
      setIsCreatingGuest(false);
    }
  };

  return (
    <>
      <StepIndicator steps={quickSteps} currentStep={quickStep} onStepClick={setQuickStep} />
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="min-h-[400px]">
          {/* Step 0: Room & Dates */}
          {quickStep === 0 && (
            <SectionWrapper 
              title="🏨 Seleccione Habitación y Fechas" 
              description={enableGroupReservation 
                ? "Seleccione múltiples habitaciones con fechas distintas para reserva grupal" 
                : "Elija una habitación y luego seleccione las fechas en el calendario"}
            >
              {/* Toggle Reserva Grupal */}
              <div className="mb-4 flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <label htmlFor="quick-group-toggle" className="flex items-center gap-2 cursor-pointer">
                  <input
                    id="quick-group-toggle"
                    type="checkbox"
                    checked={enableGroupReservation}
                    onChange={(e) => setEnableGroupReservation(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Reserva Grupal (múltiples habitaciones)
                  </span>
                </label>
              </div>

              <RoomSelectorWithCalendar
                onRoomAndDatesSelected={handleRoomAndDatesSelected}
                enableMultipleSelection={enableGroupReservation}
                onMultipleRoomsSelected={handleMultipleRoomsSelected}
              />
            </SectionWrapper>
          )}

          {/* Step 1: Guest - Inline Quick Form */}
          {quickStep === 1 && (
            <SectionWrapper 
              title="👤 Información del Huésped" 
              description="Ingrese los datos del huésped rápidamente"
            >
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Habitación seleccionada:</strong> {availableRooms.find(r => r.id === formData.roomIds[0])?.name || 'N/A'}
                </p>
                <p className="text-sm text-blue-800">
                  <strong>Fechas:</strong> {formData.checkInDate} → {formData.checkOutDate}
                </p>
              </div>

              {showInlineGuestForm ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Datos del Nuevo Huésped</h3>
                    <button
                      type="button"
                      onClick={() => setShowInlineGuestForm(false)}
                      className="text-sm text-gray-600 hover:text-gray-800"
                    >
                      ← Buscar existente
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="quick-nombre" className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="quick-nombre"
                        type="text"
                        value={newGuestData.nombre}
                        onChange={(e) => setNewGuestData({ ...newGuestData, nombre: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Ej: Juan"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="quick-apellido" className="block text-sm font-medium text-gray-700 mb-1">
                        Apellido <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="quick-apellido"
                        type="text"
                        value={newGuestData.apellido}
                        onChange={(e) => setNewGuestData({ ...newGuestData, apellido: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Ej: Pérez"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="quick-identificacion" className="block text-sm font-medium text-gray-700 mb-1">
                        Identificación <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="quick-identificacion"
                        type="text"
                        value={newGuestData.identificacion}
                        onChange={(e) => setNewGuestData({ ...newGuestData, identificacion: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Ej: 123456789"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="quick-telefono" className="block text-sm font-medium text-gray-700 mb-1">
                        Teléfono
                      </label>
                      <input
                        id="quick-telefono"
                        type="tel"
                        value={newGuestData.telefono}
                        onChange={(e) => setNewGuestData({ ...newGuestData, telefono: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Ej: +506 8888-8888"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label htmlFor="quick-email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        id="quick-email"
                        type="email"
                        value={newGuestData.email}
                        onChange={(e) => setNewGuestData({ ...newGuestData, email: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Ej: juan.perez@email.com"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <button
                      type="button"
                      onClick={() => setShowInlineGuestForm(false)}
                      className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleCreateGuestInline}
                      disabled={isCreatingGuest}
                      className="px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isCreatingGuest ? (
                        <>
                          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Creando huésped...
                        </>
                      ) : (
                        'Guardar y Continuar'
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <div>
                      <p className="font-medium text-gray-900">¿Huésped nuevo?</p>
                      <p className="text-sm text-gray-600">Ingrese los datos básicos del huésped</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowInlineGuestForm(true)}
                      className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      + Nuevo Huésped
                    </button>
                  </div>
                  
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500">o</p>
                  </div>

                  <GuestSelector
                    selectedGuestId={formData.guestId || undefined}
                    onGuestSelect={(guestId) => setValue('guestId', guestId)}
                    onCreateNewGuest={() => setShowInlineGuestForm(true)}
                    error={getErrorMessage(errors.guestId)}
                  />
                </div>
              )}
            </SectionWrapper>
          )}

          {/* Step 2: Services */}
          {quickStep === 2 && (
            <div className="space-y-6">
              <SectionWrapper 
                title="➕ Servicios Adicionales" 
                description="Seleccione servicios adicionales para la estadía"
              >
                {additionalServices.length > 0 ? (
                  <ServicesSelection
                    services={additionalServices}
                    selectedServices={formData.additionalServices || []}
                    onServiceToggle={(id: string) => {
                      const current = formData.additionalServices || [];
                      setValue('additionalServices', current.includes(id) ? current.filter(i => i !== id) : [...current, id]);
                    }}
                  />
                ) : <p className="text-sm text-gray-500">Cargando...</p>}
              </SectionWrapper>
              <SectionWrapper 
                title="💬 Solicitudes Especiales" 
                description="Comentarios o solicitudes adicionales del huésped"
              >
                <SpecialRequests 
                  value={formData.specialRequests || ''} 
                  onChange={(v) => setValue('specialRequests', v)} 
                />
              </SectionWrapper>
            </div>
          )}

          {/* Step 3: Review */}
          {quickStep === 3 && (
            <SectionWrapper 
              title="✅ Resumen de la Reserva" 
              description="Revise la información antes de confirmar"
            >
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Room */}
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">Habitación</h3>
                    <p className="text-sm text-gray-700">
                      {availableRooms.find(r => r.id === formData.roomIds[0])?.name || 'N/A'}
                    </p>
                  </div>

                  {/* Dates */}
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">Fechas</h3>
                    <p className="text-sm text-gray-700">Check-in: {formData.checkInDate}</p>
                    <p className="text-sm text-gray-700">Check-out: {formData.checkOutDate}</p>
                  </div>

                  {/* Services */}
                  {formData.additionalServices && formData.additionalServices.length > 0 && (
                    <div className="p-4 bg-gray-50 rounded-lg md:col-span-2">
                      <h3 className="font-semibold text-gray-900 mb-2">Servicios Adicionales</h3>
                      <ul className="text-sm text-gray-700 space-y-1">
                        {formData.additionalServices.map(serviceId => {
                          const service = additionalServices.find(s => s.id === serviceId);
                          return service ? <li key={serviceId}>• {service.name}</li> : null;
                        })}
                      </ul>
                    </div>
                  )}

                  {/* Special Requests */}
                  {formData.specialRequests && (
                    <div className="p-4 bg-gray-50 rounded-lg md:col-span-2">
                      <h3 className="font-semibold text-gray-900 mb-2">Solicitudes Especiales</h3>
                      <p className="text-sm text-gray-700">{formData.specialRequests}</p>
                    </div>
                  )}
                </div>
              </div>
            </SectionWrapper>
          )}
        </div>

        {/* Navigation */}
        <StepNavigation
          isFirstStep={quickStep === 0}
          isLastStep={quickStep === 3}
          onPrevious={() => setQuickStep(prev => Math.max(0, prev - 1))}
          onNext={() => setQuickStep(prev => Math.min(3, prev + 1))}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
          canProceed={canProceedQuick()}
        />
      </div>

      {/* Floating Price Calculator - Show on steps 1, 2 (after room is selected) */}
      {quickStep > 0 && quickStep < 3 && formData.roomIds.length > 0 && (
        <div className="fixed top-8 right-8 w-96 z-40 hidden xl:block">
          <PriceCalculatorWidget
            selectedRooms={availableRooms.filter(r => formData.roomIds.includes(r.id))}
            checkInDate={formData.checkInDate}
            checkOutDate={formData.checkOutDate}
            additionalServices={additionalServices.filter(s => formData.additionalServices?.includes(s.id))}
            defaultCollapsed={true}
            className="shadow-2xl"
          />
        </div>
      )}

      {/* Price Calculator inline on review step */}
      {quickStep === 3 && (
        <div className="mt-6">
          <PriceCalculatorWidget
            selectedRooms={availableRooms.filter(r => formData.roomIds.includes(r.id))}
            checkInDate={formData.checkInDate}
            checkOutDate={formData.checkOutDate}
            additionalServices={additionalServices.filter(s => formData.additionalServices?.includes(s.id))}
            defaultCollapsed={false}
          />
        </div>
      )}
    </>
  );
};

export const CreateReservationForm: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Flow mode state (quick = Room→Dates→Guest, client-first = Guest→Dates→Room)
  const [flowMode, setFlowMode] = useState<ReservationFlowMode>('client-first');
  
  // Group reservation state
  const [isGroupReservation, setIsGroupReservation] = useState(false);
  const [roomDatesMap, setRoomDatesMap] = useState<Map<string, { checkIn: string; checkOut: string }>>(new Map());
  
  const {
    form,
    formData,
    errors,
    isValid,
    isSubmitting,
    availableRooms,
    additionalServices,
    submitReservation,
    setValue,
    trigger,
  } = useCreateReservationForm();

  const { handleSubmit } = form;

  // Multi-step wizard configuration (4 steps - fechas ahora en habitaciones)
  const steps = [
    { id: 'guest', title: 'Huésped', description: 'Seleccione cliente y huéspedes', icon: '👤' },
    { id: 'rooms', title: 'Habitaciones', description: 'Seleccione habitación(es) y fechas', icon: '🏨' },
    { id: 'services', title: 'Extras', description: 'Servicios opcionales', icon: '➕' },
    { id: 'review', title: 'Revisar', description: 'Confirmar reserva', icon: '✅' },
  ];

  const {
    currentStep,
    isFirstStep,
    isLastStep,
    nextStep,
    previousStep,
    goToStep,
  } = useMultiStepForm({ steps });

  // Availability check now happens inside RoomSelection component

  // Recibir datos de servicios seleccionados cuando se regresa de la página de servicios
  React.useEffect(() => {
    if (location.state?.additionalServices) {
      setValue('additionalServices', location.state.additionalServices);
      window.scrollTo(0, 0);
    }
  }, [location.state, setValue]);

  // Clear roomDatesMap when group mode is disabled
  React.useEffect(() => {
    if (!isGroupReservation && roomDatesMap.size > 0) {
      setRoomDatesMap(new Map());
      localStorage.removeItem('roomDatesMap');
    }
  }, [isGroupReservation, roomDatesMap]);

  // Validation for each step (4 steps total)
  const canProceed = (): boolean => {
    switch (currentStep) {
      case 0: return !!formData.guestId && formData.numberOfGuests > 0; // Guest + número de huéspedes
      case 1: return formData.roomIds.length > 0; // Rooms (con fechas validadas internamente)
      case 2: return true; // Services (optional)
      case 3: return isValid; // Review
      default: return false;
    }
  };

  const onSubmit = handleSubmit(async (data) => {
    await submitReservation(data);
  });

  const handleCreateNewGuest = () => {
    navigate('/guests/create');
  };

  /**
   * Extrae el mensaje de error de la estructura de errores de React Hook Form.
   * Evita el uso de `any` mediante acceso seguro a propiedades.
   * 
   * @param error - Error de React Hook Form (puede ser FieldError o undefined)
   * @returns Mensaje de error o undefined
   */
  const getErrorMessage = (error: FieldError | undefined): string | undefined => {
    return error?.message || undefined;
  };

  // Render step content (4 steps)
  const renderStep = () => {
    switch (currentStep) {
      case 0: // Guest + Number of Guests
        return (
          <SectionWrapper title="👤 Información del Huésped" description="Seleccione un huésped y configure el número de personas">
            <div className="space-y-6">
              <GuestSelector
                selectedGuestId={formData.guestId}
                onGuestSelect={(guestId) => setValue('guestId', guestId)}
                onCreateNewGuest={handleCreateNewGuest}
                error={getErrorMessage(errors.guestId)}
              />
              
              {/* Number of Guests */}
              <div className="border-t pt-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Número de Huéspedes</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="numberOfAdults" className="block text-sm font-medium text-gray-700 mb-1">
                      Adultos *
                    </label>
                    <input
                      id="numberOfAdults"
                      type="number"
                      min="1"
                      value={formData.numberOfAdults || 1}
                      onChange={(e) => {
                        const adults = Number.parseInt(e.target.value) || 1;
                        setValue('numberOfAdults', adults);
                        setValue('numberOfGuests', adults + (formData.numberOfChildren || 0) + (formData.numberOfInfants || 0));
                      }}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="numberOfChildren" className="block text-sm font-medium text-gray-700 mb-1">
                      Niños (3-12 años)
                    </label>
                    <input
                      id="numberOfChildren"
                      type="number"
                      min="0"
                      value={formData.numberOfChildren || 0}
                      onChange={(e) => {
                        const children = Number.parseInt(e.target.value) || 0;
                        setValue('numberOfChildren', children);
                        setValue('numberOfGuests', (formData.numberOfAdults || 1) + children + (formData.numberOfInfants || 0));
                      }}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="numberOfInfants" className="block text-sm font-medium text-gray-700 mb-1">
                      Bebés (0-2 años)
                    </label>
                    <input
                      id="numberOfInfants"
                      type="number"
                      min="0"
                      value={formData.numberOfInfants || 0}
                      onChange={(e) => {
                        const infants = Number.parseInt(e.target.value) || 0;
                        setValue('numberOfInfants', infants);
                        setValue('numberOfGuests', (formData.numberOfAdults || 1) + (formData.numberOfChildren || 0) + infants);
                      }}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Total: <span className="font-semibold text-gray-900">{formData.numberOfGuests || 1}</span> huésped{(formData.numberOfGuests || 1) !== 1 ? 'es' : ''}
                </p>
              </div>
            </div>
          </SectionWrapper>
        );

      case 1: // Rooms (ahora con fechas integradas)
        return (
          <SectionWrapper title="🏨 Selección de Habitaciones" description="Seleccione habitación(es) y configure las fechas de estadía. Para reservas grupales, puede asignar fechas distintas a cada habitación.">
            {availableRooms.length > 0 ? (
              <RoomSelection
                availableRooms={availableRooms}
                selectedRoomIds={formData.roomIds}
                onRoomSelect={(roomIds: string[]) => {
                  const sorted = [...roomIds].sort((a, b) => a.localeCompare(b));
                  const current = [...formData.roomIds].sort((a, b) => a.localeCompare(b));
                  if (JSON.stringify(sorted) !== JSON.stringify(current)) {
                    setValue('roomIds', roomIds);
                    if (roomIds.length > 0) {
                      const first = availableRooms.find(r => r.id === roomIds[0]);
                      setValue('roomId', roomIds[0]);
                      if (first) setValue('roomType', first.type as 'single' | 'double' | 'triple' | 'suite' | 'family');
                    } else {
                      setValue('roomId', '');
                      setValue('roomType', 'single');
                    }
                    trigger('roomIds');
                  }
                }}
                numberOfGuests={formData.numberOfGuests}
                allowMultiple={formData.numberOfGuests > 2 || isGroupReservation}
                error={errors.roomIds?.message || getErrorMessage(errors.roomId)}
                isGroupReservation={isGroupReservation}
                onToggleGroupReservation={() => setIsGroupReservation(!isGroupReservation)}
                enableDifferentDates={isGroupReservation}
                onRoomDatesChange={(roomId, dates) => {
                  setRoomDatesMap(prev => {
                    const newMap = new Map(prev);
                    newMap.set(roomId, dates);
                    // Save to localStorage for use in submit
                    const obj: Record<string, { checkIn: string; checkOut: string }> = {};
                    newMap.forEach((value, key) => {
                      obj[key] = value;
                    });
                    localStorage.setItem('roomDatesMap', JSON.stringify(obj));
                    return newMap;
                  });
                }}
              />
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">{formData.checkInDate ? 'No hay habitaciones disponibles' : 'Seleccione fechas primero'}</p>
              </div>
            )}
          </SectionWrapper>
        );

      case 2: // Services
        return (
          <div className="space-y-6">
            <SectionWrapper title="➕ Servicios Adicionales" description="Seleccione servicios adicionales para la estadía">
              {additionalServices.length > 0 ? (
                <ServicesSelection
                  services={additionalServices}
                  selectedServices={formData.additionalServices || []}
                  onServiceToggle={(id: string) => {
                    const current = formData.additionalServices || [];
                    setValue('additionalServices', current.includes(id) ? current.filter(i => i !== id) : [...current, id]);
                  }}
                />
              ) : <p className="text-sm text-gray-500">Cargando...</p>}
            </SectionWrapper>
            <SectionWrapper title="💬 Solicitudes Especiales" description="Comentarios o solicitudes adicionales del huésped">
              <SpecialRequests value={formData.specialRequests || ''} onChange={(v) => setValue('specialRequests', v)} />
            </SectionWrapper>
          </div>
        );

      case 3: // Review
        return (
          <SectionWrapper title="✅ Resumen de la Reserva" description="Revise la información antes de confirmar">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs font-medium text-gray-700 mb-1">Huésped</p>
                <p className="text-sm text-gray-600 truncate">{formData.guestId || 'N/A'}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs font-medium text-gray-700 mb-1">Fechas</p>
                <p className="text-sm text-gray-600">{formData.checkInDate} → {formData.checkOutDate}</p>
                <p className="text-xs text-gray-500 mt-1">{formData.numberOfGuests} huéspedes</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs font-medium text-gray-700 mb-1">Habitaciones</p>
                <p className="text-sm text-gray-600">{formData.roomIds.length} habitación(es)</p>
              </div>
              {formData.additionalServices && formData.additionalServices.length > 0 && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs font-medium text-gray-700 mb-1">Servicios</p>
                  <p className="text-sm text-gray-600">{formData.additionalServices.length} servicio(s)</p>
                </div>
              )}
            </div>
            <div className="max-h-[280px] overflow-y-auto">
              <PriceCalculatorWidget
                selectedRooms={availableRooms.filter(r => formData.roomIds.includes(r.id))}
                checkInDate={formData.checkInDate}
                checkOutDate={formData.checkOutDate}
                additionalServices={additionalServices.filter(s => formData.additionalServices?.includes(s.id))}
              />
            </div>
          </SectionWrapper>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-8 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver
        </button>
      </div>

      <FormHeader
        title="Crear Nueva Reserva"
        subtitle="Complete la información del huésped paso a paso. Los campos marcados con * son obligatorios."
        badge="FrontDesk"
      />

      {/* Flow Mode Toggle */}
      <div className="mb-6">
        <ReservationFlowToggle
          currentMode={flowMode}
          onModeChange={setFlowMode}
        />
      </div>

      {/* Conditional rendering based on flow mode */}
      {flowMode === 'quick' ? (
        // Quick mode: Room → Dates → Guest flow
        <QuickModeFlow
          formData={{
            roomIds: formData.roomIds,
            checkInDate: formData.checkInDate,
            checkOutDate: formData.checkOutDate,
            guestId: formData.guestId,
            numberOfGuests: formData.numberOfGuests,
            additionalServices: formData.additionalServices,
            specialRequests: formData.specialRequests,
          }}
          errors={errors as Record<string, FieldError | undefined>}
          setValue={(field, value) => setValue(field as never, value as never)}
          availableRooms={availableRooms}
          additionalServices={additionalServices}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit(submitReservation)}
          getErrorMessage={getErrorMessage}
        />
      ) : (
        // Client-first mode: Guest → Dates → Room flow (original)
        <>
          <StepIndicator steps={steps} currentStep={currentStep} onStepClick={goToStep} />
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <form onSubmit={onSubmit}>
              <div className="min-h-[400px]">{renderStep()}</div>
              
              <StepNavigation
                isFirstStep={isFirstStep}
                isLastStep={isLastStep}
                onPrevious={previousStep}
                onNext={nextStep}
                onSubmit={handleSubmit(submitReservation)}
                isSubmitting={isSubmitting}
                canProceed={canProceed()}
              />
            </form>
          </div>

          {/* Floating price calculator - Top right */}
          {currentStep !== 3 && (
            <div className="fixed top-8 right-8 w-96 z-50 hidden xl:block">
              <PriceCalculatorWidget
                selectedRooms={availableRooms.filter(r => formData.roomIds.includes(r.id))}
                checkInDate={formData.checkInDate}
                checkOutDate={formData.checkOutDate}
                additionalServices={additionalServices.filter(s => formData.additionalServices?.includes(s.id))}
                defaultCollapsed={true}
                className="shadow-2xl"
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};
