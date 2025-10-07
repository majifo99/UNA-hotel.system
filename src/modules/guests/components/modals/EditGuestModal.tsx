import React, { useEffect } from 'react';
import { useGuests, useGuestForm, useGuestModal } from '../../hooks';
import { GuestModalForm } from '../shared';
import type { Guest, UpdateGuestData } from '../../types';

interface EditGuestModalProps {
  isOpen: boolean;
  onClose: () => void;
  guest: Guest | null;
  onGuestUpdated: (guest: Guest) => void;
}

export const EditGuestModal: React.FC<EditGuestModalProps> = ({
  isOpen,
  onClose,
  guest,
  onGuestUpdated
}) => {
  const { updateGuest, isUpdating } = useGuests();
  const {
    formData,
    errors,
    handleInputChange,
    validateForm,
    clearErrors,
    updateFormData
  } = useGuestForm<UpdateGuestData>();

  const { handleClose, createSubmitHandler } = useGuestModal({
    onClose,
    validateForm,
    clearErrors,
    formData
  });

  // Cargar datos del huésped cuando se abre el modal
  useEffect(() => {
    if (guest) {
      updateFormData({
        id: guest.id,
        firstName: guest.firstName,
        firstLastName: guest.firstLastName,
        secondLastName: guest.secondLastName,
        email: guest.email,
        phone: guest.phone,
        nationality: guest.nationality,
        documentType: guest.documentType,
        documentNumber: guest.documentNumber,
        dateOfBirth: guest.dateOfBirth,
        gender: guest.gender,
        notes: guest.notes,
        isActive: guest.isActive,
        // Campos adicionales
        address: guest.address,
        city: guest.city,
        country: guest.country,
        preferredLanguage: guest.preferredLanguage,
        vipStatus: guest.vipStatus,
        allergies: guest.allergies,
        dietaryRestrictions: guest.dietaryRestrictions,
        medicalNotes: guest.medicalNotes,
        emergencyContact: guest.emergencyContact,
        communicationPreferences: guest.communicationPreferences,
        roomPreferences: guest.roomPreferences,
        loyaltyProgram: guest.loyaltyProgram
      });
    }
  }, [guest, updateFormData]);

  const handleSubmit = createSubmitHandler(
    (data) => updateGuest(guest!.id, data),
    onGuestUpdated,
    () => !!guest
  );

  return (
    <GuestModalForm
      isOpen={isOpen}
      onClose={handleClose}
      title="Editar Huésped"
      formData={formData}
      errors={errors}
      onInputChange={handleInputChange}
      onSubmit={handleSubmit}
      isSubmitting={isUpdating}
      submitText="Guardar Cambios"
      submittingText="Guardando..."
      showVipStatus={true}
      size="lg"
    />
  );
};