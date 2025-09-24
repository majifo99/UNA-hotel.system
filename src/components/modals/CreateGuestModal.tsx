import React from 'react';
import { Save, X } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { useGuests, useGuestForm } from '../../modules/guests/hooks';
import { GuestFormFields } from '../../modules/guests/components/shared';
import type { CreateGuestData, Guest } from '../../modules/guests/types';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const newGuest = await createGuest(formData);
      onGuestCreated(newGuest);
      onClose();
      resetForm();
    } catch (error) {
      console.error('Error creating guest:', error);
    }
  };

  const handleClose = () => {
    onClose();
    clearErrors();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Crear Nuevo Huésped"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <GuestFormFields
          formData={formData}
          errors={errors}
          onInputChange={handleInputChange}
        />

        {/* Action Buttons */}
        <div className="flex gap-3 pt-6">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 flex items-center justify-center gap-2 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <X size={16} />
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isCreating}
            className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save size={16} />
            {isCreating ? 'Creando...' : 'Crear Huésped'}
          </button>
        </div>
      </form>
    </Modal>
  );
};