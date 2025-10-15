import { useState } from 'react';
import type { CreateGuestFullRequest, RoomPreferences, Companions, EmergencyContact } from '../types/guestFull';
import { useInputValidation } from '../../../hooks/useInputValidation';

interface GuestFullFormData extends CreateGuestFullRequest {
  apellido2?: string; // Campo opcional adicional
}

// Default form data configuration to avoid duplication
const createInitialFormData = (): GuestFullFormData => ({
  nombre: '',
  apellido1: '',
  apellido2: '',
  email: '',
  telefono: '',
  nacionalidad: 'Costa Rica',
  id_tipo_doc: 1, // Por defecto cédula
  numero_doc: '',
  direccion: '',
  fecha_nacimiento: '',
  genero: 'M',
  es_vip: false,
  notas_personal: '',
  roomPreferences: {
    bedType: 'queen',
    floor: 'middle',
    view: 'city',
    smokingAllowed: false
  },
  companions: {
    typicalTravelGroup: 'family',
    hasChildren: false,
    childrenAgeRanges: [],
    preferredOccupancy: 2,
    needsConnectedRooms: false
  },
  allergies: [],
  dietaryRestrictions: [],
  medicalNotes: '',
  emergencyContact: {
    name: '',
    relationship: '',
    phone: '',
    email: ''
  }
});

export const useGuestFullForm = () => {
  const { errors, validateMultiple, clearError } = useInputValidation();
  const [formData, setFormData] = useState<GuestFullFormData>(createInitialFormData);

  const handleInputChange = (field: keyof GuestFullFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    clearError(field);
  };

  const handleRoomPreferencesChange = (preferences: Partial<RoomPreferences>) => {
    setFormData(prev => ({
      ...prev,
      roomPreferences: prev.roomPreferences ? { ...prev.roomPreferences, ...preferences } : preferences as RoomPreferences
    }));
  };

  const handleCompanionsChange = (companions: Partial<Companions>) => {
    setFormData(prev => ({
      ...prev,
      companions: prev.companions ? { ...prev.companions, ...companions } : companions as Companions
    }));
  };

  const handleEmergencyContactChange = (contact: Partial<EmergencyContact>) => {
    setFormData(prev => ({
      ...prev,
      emergencyContact: prev.emergencyContact ? { ...prev.emergencyContact, ...contact } : contact as EmergencyContact
    }));
  };

  const addAllergy = (allergy: string) => {
    if (allergy && !formData.allergies?.includes(allergy)) {
      setFormData(prev => ({
        ...prev,
        allergies: [...(prev.allergies || []), allergy]
      }));
    }
  };

  const removeAllergy = (allergy: string) => {
    setFormData(prev => ({
      ...prev,
      allergies: prev.allergies?.filter(a => a !== allergy) || []
    }));
  };

  const addDietaryRestriction = (restriction: string) => {
    if (restriction && !formData.dietaryRestrictions?.includes(restriction)) {
      setFormData(prev => ({
        ...prev,
        dietaryRestrictions: [...(prev.dietaryRestrictions || []), restriction]
      }));
    }
  };

  const removeDietaryRestriction = (restriction: string) => {
    setFormData(prev => ({
      ...prev,
      dietaryRestrictions: prev.dietaryRestrictions?.filter(r => r !== restriction) || []
    }));
  };

  const validateForm = (): boolean => {
    const fields = {
      nombre: { value: formData.nombre, rules: { required: true, minLength: 2, maxLength: 15 } },
      apellido1: { value: formData.apellido1, rules: { required: true, minLength: 2, maxLength: 15 } },
      email: { value: formData.email, rules: { required: true, pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, maxLength: 40 } },
      telefono: { value: formData.telefono, rules: { required: true } },
      nacionalidad: { value: formData.nacionalidad, rules: { required: true } },
      numero_doc: { value: formData.numero_doc, rules: { required: true } },
    };

    const { isValid } = validateMultiple(fields);
    return isValid;
  };

  const resetForm = () => {
    setFormData(createInitialFormData());
  };

  return {
    formData,
    errors,
    handleInputChange,
    handleRoomPreferencesChange,
    handleCompanionsChange,
    handleEmergencyContactChange,
    addAllergy,
    removeAllergy,
    addDietaryRestriction,
    removeDietaryRestriction,
    validateForm,
    resetForm,
    clearError
  };
};