import { useState } from 'react';
import type { Guest, UpdateGuestData } from '../types';
import { useGuests } from './useGuests';

export const useGuestEdit = (guest: Guest | null, onSuccess?: () => void) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<UpdateGuestData>({} as UpdateGuestData);
  const [editErrors, setEditErrors] = useState<Partial<UpdateGuestData>>({});
  
  const { updateGuest, isUpdating } = useGuests();

  // Initialize form data when guest changes
  const initializeEditForm = () => {
    if (guest) {
      setEditFormData({
        id: guest.id,
        firstName: guest.firstName || '',
        firstLastName: guest.firstLastName || '',
        secondLastName: guest.secondLastName || '',
        email: guest.email || '',
        phone: guest.phone || '',
        documentType: guest.documentType || 'id_card',
        documentNumber: guest.documentNumber || '',
        nationality: guest.nationality || '',
        dateOfBirth: guest.dateOfBirth || '',
        gender: guest.gender || undefined,
        preferredLanguage: guest.preferredLanguage || '',
        notes: guest.notes || '',
        medicalNotes: guest.medicalNotes || '',
        vipStatus: guest.vipStatus || false,
        allergies: guest.allergies || [],
        dietaryRestrictions: guest.dietaryRestrictions || [],
        address: guest.address || {
          street: '',
          city: '',
          state: '',
          country: '',
          postalCode: ''
        },
        emergencyContact: guest.emergencyContact || {
          name: '',
          relationship: '',
          phone: '',
          email: ''
        },
        communicationPreferences: guest.communicationPreferences || {
          email: false,
          sms: false,
          phone: false,
          whatsapp: false
        },
        roomPreferences: guest.roomPreferences || {
          floor: undefined,
          view: undefined,
          bedType: undefined,
          smokingAllowed: undefined
        },
        loyaltyProgram: guest.loyaltyProgram || {
          memberId: '',
          tier: undefined,
          points: 0
        }
      });
      setEditErrors({});
    }
  };

  const openEditModal = () => {
    initializeEditForm();
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditErrors({});
  };

  const handleEditInputChange = (field: keyof UpdateGuestData, value: any) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field
    if (editErrors[field]) {
      setEditErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!guest) return;

    try {
      await updateGuest(guest.id, editFormData);
      closeEditModal();
      onSuccess?.();
    } catch (error) {
      console.error('Error updating guest:', error);
      // Handle validation errors if needed
    }
  };

  return {
    // Modal state
    isEditModalOpen,
    openEditModal,
    closeEditModal,
    
    // Form data
    editFormData,
    editErrors,
    handleEditInputChange,
    handleEditSubmit,
    
    // Loading state
    isUpdating
  };
};