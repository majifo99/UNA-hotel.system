import React from 'react';
import { Modal } from '../../../../components/ui/Modal';
import { GuestFormFields } from './GuestFormFields';
import { ModalActionButtons } from './ModalActionButtons';
import type { CreateGuestData, UpdateGuestData } from '../../types';

interface GuestModalFormProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  formData: CreateGuestData | UpdateGuestData;
  errors: Partial<CreateGuestData | UpdateGuestData>;
  onInputChange: (field: any, value: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  submitText: string;
  submittingText: string;
  showVipStatus?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const GuestModalForm: React.FC<GuestModalFormProps> = ({
  isOpen,
  onClose,
  title,
  formData,
  errors,
  onInputChange,
  onSubmit,
  isSubmitting,
  submitText,
  submittingText,
  showVipStatus = false,
  size = 'md'
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size={size}
    >
      <form onSubmit={onSubmit} className="space-y-6">
        <GuestFormFields
          formData={formData}
          errors={errors}
          onInputChange={onInputChange}
          showVipStatus={showVipStatus}
        />

        <ModalActionButtons
          onCancel={onClose}
          isSubmitting={isSubmitting}
          submitText={submitText}
          submittingText={submittingText}
          layout="horizontal"
        />
      </form>
    </Modal>
  );
};