import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { type FieldError } from 'react-hook-form';
import { useCreateReservationForm } from '../hooks/useCreateReservationForm';
import { useRoomAvailabilityCheck } from '../hooks/useRoomAvailabilityCheck';
import { useMultiStepForm } from '../hooks/useMultiStepForm';
import { GuestSelector } from './GuestSelector';
import { RoomSelection } from './sections/RoomSelection';
import { ServicesSelection } from './ServicesSelection';
import { PriceCalculatorWidget } from './ui/PriceCalculatorWidget';
import { AvailabilityStatusBadge, StepIndicator, StepNavigation } from './common';
import {
  FormHeader,
  SectionWrapper,
  ReservationDetailsForm,
  SpecialRequests
} from './index';

export const CreateReservationForm: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
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

  // Multi-step wizard configuration
  const steps = [
    { id: 'guest', title: 'Huésped', description: 'Seleccione cliente', icon: '👤' },
    { id: 'dates', title: 'Fechas', description: 'Check-in/out', icon: '📅' },
    { id: 'rooms', title: 'Habitación', description: 'Seleccione habitación', icon: '🏨' },
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

  // Real-time availability check
  const availabilityCheck = useRoomAvailabilityCheck(
    formData.checkInDate,
    formData.checkOutDate,
    formData.numberOfGuests
  );

  // Recibir datos de servicios seleccionados cuando se regresa de la página de servicios
  React.useEffect(() => {
    if (location.state?.additionalServices) {
      setValue('additionalServices', location.state.additionalServices);
      window.scrollTo(0, 0);
    }
  }, [location.state, setValue]);

  // Validation for each step
  const canProceed = (): boolean => {
    switch (currentStep) {
      case 0: return !!formData.guestId;
      case 1: return !!(formData.checkInDate && formData.checkOutDate && formData.numberOfGuests > 0);
      case 2: return formData.roomIds.length > 0;
      case 3: return true; // Optional
      case 4: return isValid;
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

  // Render step content
  const renderStep = () => {
    switch (currentStep) {
      case 0: // Guest
        return (
          <SectionWrapper title="👤 Información del Huésped" description="Seleccione o cree un huésped para la reserva">
            <GuestSelector
              selectedGuestId={formData.guestId}
              onGuestSelect={(guestId) => setValue('guestId', guestId)}
              onCreateNewGuest={handleCreateNewGuest}
              error={getErrorMessage(errors.guestId)}
            />
          </SectionWrapper>
        );

      case 1: // Dates
        return (
          <SectionWrapper title="📅 Detalles de la Reserva" description="Configure las fechas y número de huéspedes">
            <ReservationDetailsForm
              formData={{
                checkInDate: formData.checkInDate,
                checkOutDate: formData.checkOutDate,
                numberOfAdults: formData.numberOfAdults,
                numberOfChildren: formData.numberOfChildren,
                numberOfInfants: formData.numberOfInfants,
                numberOfGuests: formData.numberOfGuests,
                numberOfNights: formData.numberOfNights,
              }}
              errors={{
                checkInDate: getErrorMessage(errors.checkInDate),
                checkOutDate: getErrorMessage(errors.checkOutDate),
                numberOfAdults: getErrorMessage(errors.numberOfAdults),
                numberOfChildren: getErrorMessage(errors.numberOfChildren),
                numberOfInfants: getErrorMessage(errors.numberOfInfants),
                numberOfGuests: getErrorMessage(errors.numberOfGuests),
              }}
              onFieldChange={(field, value) => setValue(field, value)}
            />
            {formData.checkInDate && formData.checkOutDate && (
              <div className="mt-4">
                <AvailabilityStatusBadge availabilityResult={availabilityCheck} />
              </div>
            )}
          </SectionWrapper>
        );

      case 2: // Rooms
        return (
          <SectionWrapper title="🏨 Selección de Habitación" description="Elija el tipo de habitación disponible">
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
                allowMultiple={formData.numberOfGuests > 2}
                error={errors.roomIds?.message || getErrorMessage(errors.roomId)}
              />
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">{formData.checkInDate ? 'No hay habitaciones disponibles' : 'Seleccione fechas primero'}</p>
              </div>
            )}
          </SectionWrapper>
        );

      case 3: // Services
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

      case 4: // Review
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
      {currentStep !== 4 && (
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
    </div>
  );
};
