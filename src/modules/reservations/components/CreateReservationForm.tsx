import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCreateReservation } from '../hooks/useCreateReservation';
import { GuestSelector } from './GuestSelector';
import {
  FormHeader,
  SectionWrapper,
  ReservationDetailsForm,
  RoomSelection,
  PricingSummary,
  SpecialRequests,
  ErrorDisplay,
  FormActions
} from './index';

export const CreateReservationForm: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    formData,
    errors,
    isLoading,
    availableRooms,
    updateFormField,
    submitReservation,
  } = useCreateReservation();

  // Recibir datos de servicios seleccionados cuando se regresa de la página de servicios
  React.useEffect(() => {
    if (location.state?.additionalServices) {
      updateFormField('additionalServices', location.state.additionalServices);
      // Scroll to top when returning from services page
      window.scrollTo(0, 0);
    }
  }, [location.state, updateFormField]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await submitReservation();
    if (success) {
      alert('Reserva creada exitosamente');
    }
  };

  const handleSelectServices = () => {
    navigate('/reservations/create/services', {
      state: {
        reservationData: formData,
        selectedServices: formData.additionalServices
      }
    });
  };

  const handleCreateNewGuest = () => {
    navigate('/guests/create');
  };

  return (
    <div className="max-w-6xl mx-auto p-8 bg-white">
      <FormHeader
        title="Crear Nueva Reserva"
        subtitle="Sistema de gestión hotelera - Panel de recepción"
        badge="FrontDesk"
      />

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Selector de Huésped */}
        <SectionWrapper
          title="Información del Huésped"
          description="Seleccione o cree un huésped para la reserva"
        >
          <GuestSelector
            selectedGuestId={formData.guestId}
            onGuestSelect={(guestId) => updateFormField('guestId', guestId)}
            onCreateNewGuest={handleCreateNewGuest}
            error={errors.guestId}
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
        <SectionWrapper
          title="Servicios Adicionales"
          description="Seleccione servicios adicionales para la estadía"
        >
          <div className="space-y-4">
            {formData.additionalServices?.length > 0 ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-green-800">
                      Servicios seleccionados: {formData.additionalServices.length}
                    </h4>
                    <p className="text-sm text-green-600">
                      Los servicios han sido configurados para esta reserva
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleSelectServices}
                    className="px-4 py-2 text-sm font-medium text-green-700 bg-green-100 border border-green-300 rounded-lg hover:bg-green-200 transition-colors"
                  >
                    Modificar servicios
                  </button>
                </div>
              </div>
            ) : (
              <div className="border border-gray-200 rounded-lg p-6 text-center">
                <div className="space-y-3">
                  <h4 className="text-lg font-medium text-gray-900">
                    ¿Desea agregar servicios adicionales?
                  </h4>
                  <p className="text-sm text-gray-600">
                    Puede seleccionar servicios como desayuno, spa, wifi premium, etc.
                  </p>
                  <button
                    type="button"
                    onClick={handleSelectServices}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Seleccionar servicios
                  </button>
                  <p className="text-xs text-gray-500">
                    Opcional - Puede omitir este paso
                  </p>
                </div>
              </div>
            )}
          </div>
        </SectionWrapper>

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
