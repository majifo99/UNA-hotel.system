import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  User, 
  Heart, 
  Star, 
  Shield,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  Eye,
  EyeOff,
  Bed,
  Users,
  Home
} from 'lucide-react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import ReactFlagsSelect from 'react-flags-select';
import type { Guest } from '../types';

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
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value) return 'El email es obligatorio';
        return !emailRegex.test(value) ? 'Formato de email inválido' : '';
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
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Progreso</h2>
          <span className="text-sm text-gray-500">
            Paso {currentStep} de {steps.length}
          </span>
        </div>
        
        {/* Responsive progress indicator */}
        <div className="hidden lg:grid lg:grid-cols-6 gap-2">
          {steps.map((step) => (
            <React.Fragment key={step.id}>
              <button
                onClick={() => goToStep(step.id)}
                className={`flex items-center gap-2 p-3 rounded-lg transition-all duration-200 h-16 ${
                  currentStep === step.id
                    ? 'bg-blue-50 border-2 border-blue-200 text-blue-700'
                    : currentStep > step.id
                    ? 'bg-green-50 border-2 border-green-200 text-green-700 hover:bg-green-100'
                    : 'bg-gray-50 border-2 border-gray-200 text-gray-400 cursor-not-allowed'
                }`}
                disabled={currentStep < step.id}
                title={step.description}
              >
                <div className={`p-1.5 rounded-lg flex-shrink-0 ${
                  currentStep === step.id
                    ? 'bg-blue-100'
                    : currentStep > step.id
                    ? 'bg-green-100'
                    : 'bg-gray-100'
                }`}>
                  {currentStep > step.id ? <CheckCircle size={18} /> : step.icon}
                </div>
                <div className="text-left min-w-0 flex-1 flex flex-col justify-center">
                  <div className="font-medium text-sm leading-tight line-clamp-1">{step.title}</div>
                  <div className="text-xs opacity-75 leading-tight line-clamp-2">{step.description}</div>
                </div>
              </button>
            </React.Fragment>
          ))}
        </div>

        {/* Mobile progress indicator */}
        <div className="lg:hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${
                currentStep === steps.find(s => s.id === currentStep)?.id
                  ? 'bg-blue-100'
                  : 'bg-gray-100'
              }`}>
                {steps.find(s => s.id === currentStep)?.icon}
              </div>
              <div>
                <div className="font-medium text-blue-700">
                  {steps.find(s => s.id === currentStep)?.title}
                </div>
                <div className="text-sm text-gray-600">
                  {steps.find(s => s.id === currentStep)?.description}
                </div>
              </div>
            </div>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / steps.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Componente para campo con validación */}
      {/* Paso 1: Información Básica */}
      {currentStep === 1 && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-50 rounded-lg">
              <User className="text-blue-600" size={24} />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Información Básica</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre *
              </label>
              <input
                type="text"
                value={formData.firstName || ''}
                onChange={(e) => updateField('firstName', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  validationErrors.firstName 
                    ? 'border-red-300 bg-red-50' 
                    : formData.firstName 
                    ? 'border-green-300 bg-green-50' 
                    : 'border-gray-300'
                }`}
                required
              />
              {validationErrors.firstName && (
                <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                  <AlertCircle size={14} />
                  {validationErrors.firstName}
                </div>
              )}
              {formData.firstName && !validationErrors.firstName && (
                <div className="flex items-center gap-1 mt-1 text-green-600 text-sm">
                  <CheckCircle size={14} />
                  Válido
                </div>
              )}
            </div>

            {/* Apellidos */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Apellidos *
              </label>
              <input
                type="text"
                value={formData.lastName || ''}
                onChange={(e) => updateField('lastName', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  validationErrors.lastName 
                    ? 'border-red-300 bg-red-50' 
                    : formData.lastName 
                    ? 'border-green-300 bg-green-50' 
                    : 'border-gray-300'
                }`}
                required
              />
              {validationErrors.lastName && (
                <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                  <AlertCircle size={14} />
                  {validationErrors.lastName}
                </div>
              )}
              {formData.lastName && !validationErrors.lastName && (
                <div className="flex items-center gap-1 mt-1 text-green-600 text-sm">
                  <CheckCircle size={14} />
                  Válido
                </div>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => updateField('email', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  validationErrors.email 
                    ? 'border-red-300 bg-red-50' 
                    : formData.email 
                    ? 'border-green-300 bg-green-50' 
                    : 'border-gray-300'
                }`}
                required
              />
              {validationErrors.email && (
                <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                  <AlertCircle size={14} />
                  {validationErrors.email}
                </div>
              )}
              {formData.email && !validationErrors.email && (
                <div className="flex items-center gap-1 mt-1 text-green-600 text-sm">
                  <CheckCircle size={14} />
                  Válido
                </div>
              )}
            </div>

            {/* Teléfono */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teléfono *
              </label>
              <PhoneInput
                country='cr'
                value={formData.phone || ''}
                onChange={(phone) => updateField('phone', phone)}
                inputProps={{
                  name: 'phone',
                  required: true,
                }}
                inputClass={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  validationErrors.phone 
                    ? 'border-red-300 bg-red-50' 
                    : formData.phone 
                    ? 'border-green-300 bg-green-50' 
                    : 'border-gray-300'
                }`}
                containerClass="w-full"
                buttonClass="!border-gray-300 !rounded-l-lg"
              />
              {validationErrors.phone && (
                <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                  <AlertCircle size={14} />
                  {validationErrors.phone}
                </div>
              )}
              {formData.phone && !validationErrors.phone && (
                <div className="flex items-center gap-1 mt-1 text-green-600 text-sm">
                  <CheckCircle size={14} />
                  Válido
                </div>
              )}
            </div>

            {/* Nacionalidad */}
            <div>
              <label id="nationality-label" className="block text-sm font-medium text-gray-700 mb-2">
                Nacionalidad *
              </label>
              <ReactFlagsSelect
                selected={formData.nationality || 'CR'}
                onSelect={(code) => updateField('nationality', code)}
                className="w-full"
                selectButtonClassName={`react-flags-select-button w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left transition-colors ${
                  validationErrors.nationality 
                    ? 'border-red-300 bg-red-50' 
                    : formData.nationality 
                    ? 'border-green-300 bg-green-50' 
                    : 'border-gray-300'
                }`}
                aria-labelledby="nationality-label"
                aria-required="true"
                placeholder="Seleccionar país"
              />
              {validationErrors.nationality && (
                <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                  <AlertCircle size={14} />
                  {validationErrors.nationality}
                </div>
              )}
              {formData.nationality && !validationErrors.nationality && (
                <div className="flex items-center gap-1 mt-1 text-green-600 text-sm">
                  <CheckCircle size={14} />
                  Válido
                </div>
              )}
            </div>

            {/* Tipo de Documento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Documento *
              </label>
              <select
                value={formData.documentType || 'id'}
                onChange={(e) => updateField('documentType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="id_card">Cédula</option>
                <option value="passport">Pasaporte</option>
                <option value="license">Licencia</option>
              </select>
            </div>

            {/* Número de Documento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número de Documento *
              </label>
              <input
                type="text"
                value={formData.documentNumber || ''}
                onChange={(e) => updateField('documentNumber', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  validationErrors.documentNumber 
                    ? 'border-red-300 bg-red-50' 
                    : formData.documentNumber 
                    ? 'border-green-300 bg-green-50' 
                    : 'border-gray-300'
                }`}
                required
              />
              {validationErrors.documentNumber && (
                <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                  <AlertCircle size={14} />
                  {validationErrors.documentNumber}
                </div>
              )}
              {formData.documentNumber && !validationErrors.documentNumber && (
                <div className="flex items-center gap-1 mt-1 text-green-600 text-sm">
                  <CheckCircle size={14} />
                  Válido
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Paso 2: Información Adicional */}
      {currentStep === 2 && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-yellow-50 rounded-lg">
              <Star className="text-yellow-600" size={24} />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Información Adicional</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Nacimiento
              </label>
              <input
                type="date"
                value={formData.dateOfBirth || ''}
                onChange={(e) => updateField('dateOfBirth', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Género
              </label>
              <select
                value={formData.gender || ''}
                onChange={(e) => updateField('gender', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Seleccionar</option>
                <option value="male">Masculino</option>
                <option value="female">Femenino</option>
                <option value="other">Otro</option>
                <option value="prefer_not_to_say">Prefiero no decir</option>
              </select>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="vipStatus"
                checked={formData.vipStatus || false}
                onChange={(e) => updateField('vipStatus', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="vipStatus" className="text-sm font-medium text-gray-700">
                Cliente VIP
              </label>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notas del Personal
            </label>
            <textarea
              value={formData.notes || ''}
              onChange={(e) => updateField('notes', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Preferencias especiales, comportamiento, solicitudes frecuentes, etc."
            />
          </div>
        </div>
      )}

      {/* Paso 3: Preferencias de Habitación */}
      {currentStep === 3 && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Bed className="text-purple-600" size={24} />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Preferencias de Habitación</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tipo de Cama */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Cama Preferida
              </label>
              <select
                value={formData.roomPreferences?.bedType || ''}
                onChange={(e) => updateNestedField('roomPreferences', 'bedType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Sin preferencia</option>
                <option value="single">Individual</option>
                <option value="double">Matrimonial</option>
                <option value="queen">Queen</option>
                <option value="king">King</option>
                <option value="twin">Dos camas individuales</option>
              </select>
            </div>

            {/* Piso Preferido */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Piso Preferido
              </label>
              <select
                value={formData.roomPreferences?.floor || ''}
                onChange={(e) => updateNestedField('roomPreferences', 'floor', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Sin preferencia</option>
                <option value="low">Piso bajo (1-3)</option>
                <option value="middle">Piso medio (4-7)</option>
                <option value="high">Piso alto (8+)</option>
              </select>
            </div>

            {/* Vista Preferida */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vista Preferida
              </label>
              <select
                value={formData.roomPreferences?.view || ''}
                onChange={(e) => updateNestedField('roomPreferences', 'view', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Sin preferencia</option>
                <option value="ocean">Vista al mar</option>
                <option value="mountain">Vista a la montaña</option>
                <option value="city">Vista a la ciudad</option>
                <option value="garden">Vista al jardín</option>
              </select>
            </div>

            {/* Habitación para Fumadores */}
            <div className="flex items-start gap-3">
              <div className="flex items-center h-5">
                <input
                  type="checkbox"
                  id="smokingAllowed"
                  checked={formData.roomPreferences?.smokingAllowed || false}
                  onChange={(e) => updateNestedField('roomPreferences', 'smokingAllowed', e.target.checked)}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
              </div>
              <div className="ml-3">
                <label htmlFor="smokingAllowed" className="text-sm font-medium text-gray-700">
                  Habitación para fumadores
                </label>
                <p className="text-xs text-gray-500">
                  Marque si prefiere una habitación donde se permita fumar
                </p>
              </div>
            </div>
          </div>

          {/* Información adicional sobre preferencias */}
          <div className="mt-6 p-4 bg-purple-50 rounded-lg">
            <div className="flex items-start gap-3">
              <Home className="text-purple-600 mt-1" size={20} />
              <div>
                <h3 className="text-sm font-medium text-purple-900">Sobre las preferencias de habitación</h3>
                <p className="text-sm text-purple-700 mt-1">
                  Estas preferencias nos ayudan a asignarle la mejor habitación disponible. 
                  Sin embargo, están sujetas a disponibilidad al momento del check-in.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Paso 4: Perfil de Viaje */}
      {currentStep === 4 && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Users className="text-blue-600" size={24} />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Perfil de Viaje</h2>
            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              Información general para futuras reservas
            </span>
          </div>

          <div className="space-y-6">
            {/* Tipo de Viajero */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Viajero Típico
              </label>
              <select
                value={formData.companions?.typicalTravelGroup || ''}
                onChange={(e) => updateNestedField('companions', 'typicalTravelGroup', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Seleccionar</option>
                <option value="solo">Viajero solo</option>
                <option value="couple">En pareja</option>
                <option value="family">Familia con niños</option>
                <option value="business_group">Grupo de negocios</option>
                <option value="friends">Grupo de amigos</option>
              </select>
            </div>

            {/* Información sobre niños */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <div className="flex items-center h-5">
                  <input
                    type="checkbox"
                    id="hasChildren"
                    checked={formData.companions?.hasChildren || false}
                    onChange={(e) => {
                      updateNestedField('companions', 'hasChildren', e.target.checked);
                      if (!e.target.checked) {
                        updateNestedField('companions', 'childrenAgeRanges', []);
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </div>
                <div className="ml-3">
                  <label htmlFor="hasChildren" className="text-sm font-medium text-gray-700">
                    Viaja habitualmente con niños
                  </label>
                  <p className="text-xs text-gray-500">
                    Nos ayuda a preparar amenidades apropiadas
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ocupación Típica
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.companions?.preferredOccupancy || 1}
                  onChange={(e) => updateNestedField('companions', 'preferredOccupancy', parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Número usual de personas que viajan juntas</p>
              </div>
            </div>

            {/* Rangos de edad de niños */}
            {formData.companions?.hasChildren && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Rangos de Edad de los Niños (típicamente)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { value: '0-2' as const, label: 'Bebés (0-2 años)' },
                    { value: '3-7' as const, label: 'Niños pequeños (3-7)' },
                    { value: '8-12' as const, label: 'Niños (8-12)' },
                    { value: '13-17' as const, label: 'Adolescentes (13-17)' }
                  ].map((range) => (
                    <label key={range.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={(formData.companions?.childrenAgeRanges || []).includes(range.value)}
                        onChange={() => {
                          const current = formData.companions?.childrenAgeRanges || [];
                          const updated = current.includes(range.value)
                            ? current.filter(r => r !== range.value)
                            : [...current, range.value];
                          updateNestedField('companions', 'childrenAgeRanges', updated);
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{range.label}</span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Esto nos ayuda a tener cunas, camas extra, y amenidades apropiadas disponibles
                </p>
              </div>
            )}

            {/* Preferencias de habitación familiar */}
            <div className="flex items-start gap-3">
              <div className="flex items-center h-5">
                <input
                  type="checkbox"
                  id="needsConnectedRooms"
                  checked={formData.companions?.needsConnectedRooms || false}
                  onChange={(e) => updateNestedField('companions', 'needsConnectedRooms', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </div>
              <div className="ml-3">
                <label htmlFor="needsConnectedRooms" className="text-sm font-medium text-gray-700">
                  Prefiere habitaciones conectadas o adyacentes
                </label>
                <p className="text-xs text-gray-500">
                  Para familias grandes o grupos que viajan juntos
                </p>
              </div>
            </div>

            {/* Información para futuras reservas */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-start gap-3">
                <Users className="text-blue-600 mt-1" size={20} />
                <div>
                  <h3 className="text-sm font-medium text-blue-900">Perfil de Viaje</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Esta información se usa como referencia para futuras reservas y nos ayuda a:
                  </p>
                  <ul className="text-xs text-blue-600 mt-2 space-y-1">
                    <li>• Sugerir el tipo de habitación más apropiado</li>
                    <li>• Preparar amenidades relevantes con anticipación</li>
                    <li>• Personalizar ofertas y promociones</li>
                    <li>• Facilitar el proceso de reserva</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Paso 5: Información Médica */}
      {currentStep === 5 && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-red-50 rounded-lg">
              <Heart className="text-red-600" size={24} />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Información Médica (Opcional)</h2>
            <button
              type="button"
              onClick={() => setShowMedicalSection(!showMedicalSection)}
              className="ml-auto flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
            >
              {showMedicalSection ? <EyeOff size={16} /> : <Eye size={16} />}
              {showMedicalSection ? 'Ocultar' : 'Mostrar'} detalles
            </button>
          </div>

          {showMedicalSection ? (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Alergias Comunes
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {['Nueces', 'Mariscos', 'Lácteos', 'Gluten', 'Huevos', 'Soja', 'Pescado', 'Abejas'].map((allergy) => (
                    <label key={allergy} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={(formData.allergies || []).includes(allergy)}
                        onChange={() => toggleArrayField('allergies', allergy)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{allergy}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Restricciones Dietéticas
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {['Vegetariano', 'Vegano', 'Sin Gluten', 'Kosher', 'Halal', 'Sin Azúcar'].map((diet) => (
                    <label key={diet} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={(formData.dietaryRestrictions || []).includes(diet)}
                        onChange={() => toggleArrayField('dietaryRestrictions', diet)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{diet}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notas Médicas Adicionales
                </label>
                <textarea
                  value={formData.medicalNotes || ''}
                  onChange={(e) => updateField('medicalNotes', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Cualquier condición médica, medicamentos, o información relevante..."
                />
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Heart size={48} className="mx-auto mb-4 opacity-50" />
              <p>Información médica opcional</p>
              <p className="text-sm">Haga clic en "Mostrar detalles" para completar esta sección</p>
            </div>
          )}
        </div>
      )}

      {/* Paso 6: Contacto de Emergencia */}
      {currentStep === 6 && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-orange-50 rounded-lg">
              <Shield className="text-orange-600" size={24} />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Contacto de Emergencia</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del Contacto
              </label>
              <input
                type="text"
                value={formData.emergencyContact?.name || ''}
                onChange={(e) => updateNestedField('emergencyContact', 'name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Relación
              </label>
              <input
                type="text"
                value={formData.emergencyContact?.relationship || ''}
                onChange={(e) => updateNestedField('emergencyContact', 'relationship', e.target.value)}
                placeholder="Ej: Esposo/a, Padre/Madre, Hermano/a"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teléfono de Emergencia
              </label>
              <PhoneInput
                country='cr'
                value={formData.emergencyContact?.phone || ''}
                onChange={(phone) => updateNestedField('emergencyContact', 'phone', phone)}
                inputProps={{
                  name: 'emergencyPhone',
                }}
                inputClass="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                containerClass="w-full"
                buttonClass="!border-gray-300 !rounded-l-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email de Emergencia
              </label>
              <input
                type="email"
                value={formData.emergencyContact?.email || ''}
                onChange={(e) => updateNestedField('emergencyContact', 'email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      )}

      {/* Navegación entre pasos */}
      <div className="flex justify-between items-center pt-6">
        <button
          type="button"
          onClick={prevStep}
          disabled={currentStep === 1}
          className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={16} />
          Anterior
        </button>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => navigate('/guests')}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>

          {currentStep < steps.length ? (
            <button
              type="button"
              onClick={nextStep}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Siguiente
              <ChevronRight size={16} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Crear Huésped
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
