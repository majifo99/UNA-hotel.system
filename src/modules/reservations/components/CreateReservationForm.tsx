import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { type FieldError } from 'react-hook-form';
import { useCreateReservationForm } from '../hooks/useCreateReservationForm';
import { GuestSelector } from './GuestSelector';
import { RoomSelection } from './sections/RoomSelection';
import { ServicesSelection } from './ServicesSelection';
import {
  FormHeader,
  SectionWrapper,
  ReservationDetailsForm,
  PricingSummary,
  SpecialRequests,
  FormActions
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

  // Recibir datos de servicios seleccionados cuando se regresa de la página de servicios
  React.useEffect(() => {
    if (location.state?.additionalServices) {
      setValue('additionalServices', location.state.additionalServices);
      window.scrollTo(0, 0);
    }
  }, [location.state, setValue]);

  const onSubmit = handleSubmit(async (data) => {
    const success = await submitReservation(data);
    if (success) {
      // navigate('/frontdesk');
    }
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

  return (
    <div className="max-w-6xl mx-auto p-8 bg-white">
      <FormHeader
        title="Crear Nueva Reserva"
        subtitle="Sistema de gestión hotelera - Panel de recepción"
        badge="FrontDesk"
      />

      <form onSubmit={onSubmit} className="space-y-8">
        {/* Selector de Huésped */}
        <SectionWrapper
          title="Información del Huésped"
          description="Seleccione o cree un huésped para la reserva"
        >
          <GuestSelector
            selectedGuestId={formData.guestId}
            onGuestSelect={(guestId) => setValue('guestId', guestId)}
            onCreateNewGuest={handleCreateNewGuest}
            error={getErrorMessage(errors.guestId)}
          />
        </SectionWrapper>

        {/* Detalles de la Reserva */}
        <SectionWrapper
          title="Detalles de la Reserva"
          description="Configure las fechas y número de huéspedes"
        >
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
        </SectionWrapper>

        {/* Selección de Habitación */}
        <SectionWrapper
          title="Selección de Habitación"
          description="Elija el tipo de habitación disponible"
        >
          {availableRooms.length > 0 ? (
            <RoomSelection
              availableRooms={availableRooms}
              selectedRoomIds={formData.roomIds}
              onRoomSelect={(roomIds: string[]) => {
                // Only update if the selection actually changed
                if (JSON.stringify(roomIds.sort()) !== JSON.stringify(formData.roomIds.sort())) {
                  setValue('roomIds', roomIds);
                  
                  // For backwards compatibility, also set roomId and roomType with the first selected room
                  if (roomIds.length > 0) {
                    const firstRoom = availableRooms.find(room => room.id === roomIds[0]);
                    setValue('roomId', roomIds[0]);
                    if (firstRoom) {
                      setValue('roomType', firstRoom.type as 'single' | 'double' | 'triple' | 'suite' | 'family');
                    }
                  } else {
                    setValue('roomId', '');
                    setValue('roomType', 'single');
                  }
                  
                  // Trigger validation only after all updates
                  trigger('roomIds');
                }
              }}
              numberOfGuests={formData.numberOfGuests}
              allowMultiple={formData.numberOfGuests > 2}
              error={errors.roomIds?.message || getErrorMessage(errors.roomId) || getErrorMessage(errors.roomType)}
            />
          ) : (
            <div className="border border-gray-200 rounded-lg p-6 text-center">
              <div className="space-y-3">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900">
                  {!formData.checkInDate || !formData.checkOutDate 
                    ? 'Seleccione las fechas para ver habitaciones disponibles' 
                    : 'No hay habitaciones disponibles'}
                </h3>
                <p className="text-sm text-gray-500">
                  {!formData.checkInDate || !formData.checkOutDate 
                    ? 'Complete las fechas de entrada y salida en la sección anterior'
                    : 'No se encontraron habitaciones disponibles para las fechas seleccionadas. Intente con otras fechas.'}
                </p>
              </div>
            </div>
          )}
        </SectionWrapper>

        {/* Servicios Adicionales */}
        <SectionWrapper
          title="Servicios Adicionales"
          description="Seleccione servicios adicionales para la estadía"
        >
          <div className="space-y-4">
            {additionalServices.length > 0 ? (
              <ServicesSelection
                services={additionalServices}
                selectedServices={formData.additionalServices || []}
                onServiceToggle={(serviceId: string) => {
                  const currentServices = formData.additionalServices || [];
                  const newServices = currentServices.includes(serviceId)
                    ? currentServices.filter(id => id !== serviceId)
                    : [...currentServices, serviceId];
                  setValue('additionalServices', newServices);
                  trigger('additionalServices');
                }}
              />
            ) : (
              <div className="border border-gray-200 rounded-lg p-6 text-center">
                <div className="space-y-3">
                  <h4 className="text-lg font-medium text-gray-900">
                    Cargando servicios disponibles...
                  </h4>
                  <p className="text-sm text-gray-600">
                    Por favor espere mientras cargamos los servicios adicionales.
                  </p>
                </div>
              </div>
            )}
          </div>
        </SectionWrapper>

        {/* Resumen de Precios */}
        <SectionWrapper
          title="Resumen de Precios"
          description="Desglose de costos de la reserva"
        >
          {formData.total > 0 ? (
            <PricingSummary
              pricing={{
                subtotal: formData.subtotal,
                servicesTotal: formData.servicesTotal,
                taxes: formData.taxes,
                total: formData.total,
                depositRequired: formData.depositRequired,
                numberOfNights: formData.numberOfNights,
              }}
            />
          ) : (
            <div className="border border-gray-200 rounded-lg p-6 text-center">
              <div className="space-y-3">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900">
                  Precios por calcular
                </h3>
                <p className="text-sm text-gray-500">
                  Complete la información de fechas y habitación para ver el desglose de precios
                </p>
              </div>
            </div>
          )}
        </SectionWrapper>

        {/* Solicitudes Especiales */}
        <SectionWrapper
          title="Solicitudes Especiales"
          description="Comentarios o solicitudes adicionales del huésped"
        >
          <SpecialRequests
            value={formData.specialRequests || ''}
            onChange={(value) => setValue('specialRequests', value)}
          />
        </SectionWrapper>

        {/* Botones de Acción */}
        <FormActions
          isLoading={isSubmitting}
          isDisabled={!isValid || availableRooms.length === 0}
          onSubmit={onSubmit}
          submitText="Crear Reserva"
        />
      </form>
    </div>
  );
};
