import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  User, 
  Heart, 
  Star, 
  Shield,
  Bed,
  Users
} from 'lucide-react';
import 'react-phone-input-2/lib/style.css';
import type { Guest } from '../types';
import { ProgressIndicator } from '../components/ProgressIndicator';
import { StepNavigation } from '../components/StepNavigation';
import {
  PersonalInfoStep,
  AdditionalInfoStep,
  RoomPreferencesStep,
  TravelProfileStep,
  MedicalInfoStep,
  EmergencyContactStep
} from '../components/CreateGuestSteps';

interface ValidationErrors {
  [key: string]: string | undefined;
}

interface StepConfig {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  fields: string[];
}

export const CreateGuestPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [showMedicalSection, setShowMedicalSection] = useState(false);

  const steps: StepConfig[] = [
    {
      id: 1,
      title: 'Datos Personales',
      description: 'Información básica del huésped',
      icon: <User size={20} />,
      fields: ['firstName', 'lastName', 'email', 'phone', 'nationality', 'documentType', 'documentNumber']
    },
    {
      id: 2,
      title: 'Información Extra',
      description: 'Detalles adicionales y preferencias',
      icon: <Star size={20} />,
      fields: ['dateOfBirth', 'gender', 'notes', 'vipStatus']
    },
    {
      id: 3,
      title: 'Habitación',
      description: 'Preferencias de hospedaje',
      icon: <Bed size={20} />,
      fields: ['roomPreferences.floor', 'roomPreferences.view', 'roomPreferences.bedType', 'roomPreferences.smokingAllowed']
    },
    {
      id: 4,
      title: 'Perfil de Viaje',
      description: 'Información general de viaje',
      icon: <Users size={20} />,
      fields: ['companions.typicalTravelGroup', 'companions.hasChildren', 'companions.preferredOccupancy']
    },
    {
      id: 5,
      title: 'Salud',
      description: 'Alergias y restricciones (opcional)',
      icon: <Heart size={20} />,
      fields: ['allergies', 'dietaryRestrictions', 'medicalNotes']
    },
    {
      id: 6,
      title: 'Emergencia',
      description: 'Contacto de emergencia',
      icon: <Shield size={20} />,
      fields: ['emergencyContact.name', 'emergencyContact.phone', 'emergencyContact.relationship']
    }
  ];

  const [formData, setFormData] = useState<Partial<Guest> & { 
    companions?: { 
      typicalTravelGroup?: 'solo' | 'couple' | 'family' | 'business_group' | 'friends';
      hasChildren?: boolean;
      childrenAgeRanges?: ('0-2' | '3-7' | '8-12' | '13-17')[];
      preferredOccupancy?: number;
      needsConnectedRooms?: boolean;
    } 
  }>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    nationality: 'CR',
    documentType: 'id_card',
    documentNumber: '',
    dateOfBirth: '',
    gender: undefined,
    address: {
      street: '',
      city: '',
      state: '',
      country: '',
      postalCode: '',
    },
    allergies: [],
    medicalNotes: '',
    dietaryRestrictions: [],
    preferredLanguage: 'es',
    communicationPreferences: {
      email: true,
      sms: false,
      phone: false,
      whatsapp: false,
    },
    roomPreferences: {
      floor: undefined,
      view: undefined,
      bedType: undefined,
      smokingAllowed: false,
    },
    companions: {
      typicalTravelGroup: undefined,
      hasChildren: false,
      childrenAgeRanges: [],
      preferredOccupancy: 1,
      needsConnectedRooms: false,
    },
    emergencyContact: {
      name: '',
      relationship: '',
      phone: '',
      email: '',
    },
    notes: '',
    vipStatus: false,
    loyaltyProgram: {
      memberId: '',
      tier: undefined,
      points: 0,
    },
  });

  // Funciones de validación en tiempo real
  const validateField = (fieldName: string, value: any): string => {
    switch (fieldName) {
      case 'firstName':
      case 'lastName':
        return !value || value.trim() === '' ? 'Este campo es obligatorio' : '';
      case 'email': {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!value) return 'El email es obligatorio';
        return !emailRegex.test(value) ? 'Formato de email inválido' : '';
      }
      case 'phone':
        return !value || value.length < 8 ? 'Número de teléfono inválido' : '';
      case 'documentNumber':
        return !value || value.trim() === '' ? 'Número de documento es obligatorio' : '';
      case 'nationality':
        return !value ? 'La nacionalidad es obligatoria' : '';
      case 'companions.preferredOccupancy':
        return !value || value < 1 ? 'Debe indicar al menos 1 persona' : '';
      case 'companions.typicalTravelGroup':
        return ''; // Campo opcional
      case 'companions.hasChildren':
        return ''; // Campo opcional
      default:
        return '';
    }
  };

  const validateCurrentStep = (): boolean => {
    const currentStepConfig = steps.find(step => step.id === currentStep);
    if (!currentStepConfig) return true;

    let hasErrors = false;
    const newErrors: ValidationErrors = { ...validationErrors };

    currentStepConfig.fields.forEach(fieldName => {
      const fieldValue = getFieldValue(fieldName);
      const error = validateField(fieldName, fieldValue);
      
      if (error) {
        newErrors[fieldName] = error;
        hasErrors = true;
      } else {
        delete newErrors[fieldName];
      }
    });

    setValidationErrors(newErrors);
    return !hasErrors;
  };

  const getFieldValue = (fieldName: string): any => {
    if (fieldName.includes('.')) {
      const [parent, child] = fieldName.split('.');
      return (formData as any)[parent]?.[child];
    }
    return (formData as any)[fieldName];
  };

  // Navegación entre steps
  const nextStep = () => {
    if (validateCurrentStep() && currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (stepNumber: number) => {
    if (stepNumber <= currentStep || validateCurrentStep()) {
      setCurrentStep(stepNumber);
    }
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) {
      return;
    }
    
    setIsLoading(true);

    try {
      // Aquí iría la lógica para crear el huésped
      console.log('Creating guest:', formData);
      
      // Simular llamada API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirigir a la lista de huéspedes
      navigate('/guests');
    } catch (error) {
      console.error('Error creating guest:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Validación en tiempo real
    const error = validateField(field, value);
    setValidationErrors(prev => ({
      ...prev,
      [field]: error || undefined
    }));
  };

  const updateNestedField = (parent: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent as keyof typeof prev] as any,
        [field]: value
      }
    }));
    
    // Validación en tiempo real para campos anidados
    const fieldName = `${parent}.${field}`;
    const error = validateField(fieldName, value);
    setValidationErrors(prev => ({
      ...prev,
      [fieldName]: error || undefined
    }));
  };

  const toggleArrayField = (field: 'allergies' | 'dietaryRestrictions', value: string) => {
    setFormData(prev => {
      const current = prev[field] || [];
      const updated = current.includes(value)
        ? current.filter(item => item !== value)
        : [...current, value];
      return { ...prev, [field]: updated };
    });
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <PersonalInfoStep
            formData={formData}
            validationErrors={validationErrors}
            updateField={updateField}
          />
        );
      case 2:
        return (
          <AdditionalInfoStep
            formData={formData}
            updateField={updateField}
          />
        );
      case 3:
        return (
          <RoomPreferencesStep
            formData={formData}
            updateNestedField={updateNestedField}
          />
        );
      case 4:
        return (
          <TravelProfileStep
            formData={formData}
            updateNestedField={updateNestedField}
          />
        );
      case 5:
        return (
          <MedicalInfoStep
            formData={formData}
            showMedicalSection={showMedicalSection}
            setShowMedicalSection={setShowMedicalSection}
            updateField={updateField}
            toggleArrayField={toggleArrayField}
          />
        );
      case 6:
        return (
          <EmergencyContactStep
            formData={formData}
            updateNestedField={updateNestedField}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-8 bg-gray-50 min-h-screen">
      {/* Header con breadcrumb */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
          <button
            onClick={() => navigate('/guests')}
            className="flex items-center gap-1 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft size={16} />
            Huéspedes
          </button>
          <span>/</span>
          <span className="text-gray-900 font-medium">Crear Nuevo</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Crear Nuevo Huésped</h1>
            <p className="text-gray-600 mt-2">
              Complete la información del huésped paso a paso. Los campos marcados con * son obligatorios.
            </p>
          </div>
        </div>
      </div>

      {/* Indicador de Progreso */}
      <ProgressIndicator
        steps={steps}
        currentStep={currentStep}
        goToStep={goToStep}
      />

      {/* Render Current Step */}
      {renderCurrentStep()}

      {/* Navegación entre pasos */}
      <StepNavigation
        currentStep={currentStep}
        totalSteps={steps.length}
        isLoading={isLoading}
        onPrevStep={prevStep}
        onNextStep={nextStep}
        onCancel={() => navigate('/guests')}
        onSubmit={handleSubmit}
      />
    </div>
  );
};
