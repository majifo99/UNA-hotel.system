import React from 'react';
import { useCreateReservation } from '../hooks/useCreateReservation';
import {
  FormHeader,
  SectionWrapper,
  GuestSearch,
  GuestForm,
  ReservationDetailsForm,
  RoomSelection,
  ServicesSelection,
  PricingSummary,
  SpecialRequests,
  ErrorDisplay,
  FormActions
} from './index';

export const CreateReservationForm: React.FC = () => {
  const {
    formData,
    errors,
    isLoading,
    availableRooms,
    additionalServices,
    selectedGuest,
    isCreatingNewGuest,
    updateFormField,
    updateGuestField,
    submitReservation,
    handleGuestSelection,
    handleCreateNewGuest,
  } = useCreateReservation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await submitReservation();
    if (success) {
      alert('Reserva creada exitosamente');
    }
  };

  const handleServiceToggle = (serviceId: string) => {
    const currentServices = formData.additionalServices;
    const updatedServices = currentServices.includes(serviceId)
      ? currentServices.filter(id => id !== serviceId)
      : [...currentServices, serviceId];
    
    updateFormField('additionalServices', updatedServices);
  };

  return (
    <div className="max-w-6xl mx-auto p-8 bg-white">
      <FormHeader
        title="Crear Nueva Reserva"
        subtitle="Sistema de gestión hotelera - Panel de recepción"
        badge="FrontDesk"
      />

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Gestión de Huésped */}
        <SectionWrapper
          title="Información del Huésped"
          description="Busque un huésped existente o registre uno nuevo"
        >
          <GuestSearch
            onGuestSelected={handleGuestSelection}
            onCreateNewGuest={handleCreateNewGuest}
            selectedGuest={selectedGuest}
          />
        </SectionWrapper>

        {/* Registro de Nuevo Cliente */}
        {(isCreatingNewGuest || !selectedGuest) && (
          <SectionWrapper
            title="Registro de Nuevo Cliente"
            description="Complete la información personal del huésped"
          >
            <GuestForm
              formData={formData.guest}
              errors={errors.guest || {}}
              onFieldChange={updateGuestField}
            />
          </SectionWrapper>
        )}

        {/* Detalles de la Reserva */}
        <SectionWrapper
          title="Detalles de la Reserva"
          description="Configure las fechas y número de huéspedes"
        >
          <ReservationDetailsForm
            formData={{
              checkInDate: formData.checkInDate,
              checkOutDate: formData.checkOutDate,
              numberOfGuests: formData.numberOfGuests,
              numberOfNights: formData.numberOfNights,
            }}
            errors={errors}
            onFieldChange={updateFormField}
          />
        </SectionWrapper>

        {/* Selección de Habitación */}
        {availableRooms.length > 0 && (
          <SectionWrapper
            title="Selección de Habitación"
            description="Elija el tipo de habitación disponible"
          >
            <RoomSelection
              availableRooms={availableRooms}
              selectedRoomType={formData.roomType}
              onRoomSelect={(roomType) => updateFormField('roomType', roomType)}
              error={errors.roomType}
            />
          </SectionWrapper>
        )}

        {/* Servicios Adicionales */}
        {additionalServices.length > 0 && (
          <SectionWrapper
            title="Servicios Adicionales"
            description="Seleccione servicios adicionales para la estadía"
          >
            <ServicesSelection
              services={additionalServices}
              selectedServices={formData.additionalServices}
              onServiceToggle={handleServiceToggle}
            />
          </SectionWrapper>
        )}

        {/* Resumen de Precios */}
        {formData.total > 0 && (
          <SectionWrapper
            title="Resumen de Precios"
            description="Desglose de costos de la reserva"
          >
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
          </SectionWrapper>
        )}

        {/* Solicitudes Especiales */}
        <SectionWrapper
          title="Solicitudes Especiales"
          description="Comentarios o solicitudes adicionales del huésped"
        >
          <SpecialRequests
            value={formData.specialRequests || ''}
            onChange={(value) => updateFormField('specialRequests', value)}
          />
        </SectionWrapper>

        {/* Error General */}
        <ErrorDisplay error={errors.general || ''} />

        {/* Botones de Acción */}
        <FormActions
          isLoading={isLoading}
          isDisabled={availableRooms.length === 0}
          onSubmit={handleSubmit}
          submitText="Crear Reserva"
        />
      </form>
    </div>
  );
};
