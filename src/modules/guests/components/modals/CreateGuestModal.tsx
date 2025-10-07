import React from 'react';
import { useGuests, useGuestForm, useGuestModal } from '../../hooks';
import { GuestModalForm } from '../shared';
import type { CreateGuestData, Guest } from '../../types';

interface CreateGuestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGuestCreated: (guest: Guest) => void;
}

export const CreateGuestModal: React.FC<CreateGuestModalProps> = ({
  isOpen,
  onClose,
  onGuestCreated
}) => {
  const { createGuest, isCreating } = useGuests();
  const {
    formData,
    errors,
    handleInputChange,
    validateForm,
    resetForm,
    clearErrors
  } = useGuestForm<CreateGuestData>();

  const { handleClose, createSubmitHandler } = useGuestModal({
    onClose,
    validateForm,
    clearErrors,
    resetForm,
    formData
  });

  const handleSubmit = createSubmitHandler(
    createGuest,
    onGuestCreated
  );

  return (
    <GuestModalForm
      isOpen={isOpen}
      onClose={handleClose}
      title="Crear Nuevo Huésped"
      formData={formData}
      errors={errors}
      onInputChange={handleInputChange}
      onSubmit={handleSubmit}
      isSubmitting={isCreating}
      submitText="Crear Huésped"
      submittingText="Creando..."
      size="md"
    />
  );
};
