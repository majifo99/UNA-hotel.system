import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, User, Heart, Phone, Star, Edit3, Save, X, 
  Mail, MapPin, Shield, FileText, Globe,
  CreditCard, Bed, Settings, AlertTriangle
} from 'lucide-react';
import ReactFlagsSelect from 'react-flags-select';
import type { Guest, UpdateGuestData } from '../types';
import { useGuests } from '../hooks';

export const GuestProfilePage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getGuestById, updateGuest, isUpdating } = useGuests();
  const [guest, setGuest] = useState<Guest | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<UpdateGuestData>>({});

  useEffect(() => {
    const fetchGuest = async () => {
      if (id) {
        const data = await getGuestById(id);
        setGuest(data);
        // Initialize edit values with current guest data
        setEditValues({
          id: data.id,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          documentType: data.documentType,
          documentNumber: data.documentNumber,
          nationality: data.nationality,
          dateOfBirth: data.dateOfBirth,
          gender: data.gender,
          preferredLanguage: data.preferredLanguage,
          notes: data.notes,
          medicalNotes: data.medicalNotes,
          vipStatus: data.vipStatus,
          allergies: data.allergies,
          dietaryRestrictions: data.dietaryRestrictions,
          address: data.address,
          emergencyContact: data.emergencyContact,
          communicationPreferences: data.communicationPreferences,
          roomPreferences: data.roomPreferences,
          loyaltyProgram: data.loyaltyProgram
        });
      }
    };
    fetchGuest();
  }, [id]);

  const handleEdit = (fieldName: string) => {
    setEditingField(fieldName);
  };

  const handleCancel = () => {
    setEditingField(null);
    // Reset edit values to current guest data
    if (guest) {
      setEditValues({
        id: guest.id,
        firstName: guest.firstName,
        lastName: guest.lastName,
        email: guest.email,
        phone: guest.phone,
        documentType: guest.documentType,
        documentNumber: guest.documentNumber,
        nationality: guest.nationality,
        dateOfBirth: guest.dateOfBirth,
        gender: guest.gender,
        preferredLanguage: guest.preferredLanguage,
        notes: guest.notes,
        medicalNotes: guest.medicalNotes,
        vipStatus: guest.vipStatus,
        allergies: guest.allergies,
        dietaryRestrictions: guest.dietaryRestrictions,
        address: guest.address,
        emergencyContact: guest.emergencyContact,
        communicationPreferences: guest.communicationPreferences,
        roomPreferences: guest.roomPreferences,
        loyaltyProgram: guest.loyaltyProgram
      });
    }
  };

  const handleSave = async () => {
    if (guest && editValues.id) {
      try {
        const updateData: UpdateGuestData = {
          ...editValues,
          id: guest.id
        };
        const updatedGuest = await updateGuest(guest.id, updateData);
        setGuest(updatedGuest);
        setEditingField(null);
      } catch (error) {
        console.error('Error updating guest:', error);
      }
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setEditValues(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedInputChange = (parentField: string, field: string, value: any) => {
    setEditValues(prev => ({
      ...prev,
      [parentField]: {
        ...(prev[parentField as keyof UpdateGuestData] as object || {}),
        [field]: value
      }
    }));
  };

  const handleArrayInputChange = (field: string, value: string) => {
    const arrayValue = value.split(',').map(item => item.trim()).filter(item => item.length > 0);
    setEditValues(prev => ({
      ...prev,
      [field]: arrayValue
    }));
  };

  if (!guest) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const renderEditableField = (
    label: string, 
    field: string, 
    value?: string | number | boolean,
    type: 'text' | 'email' | 'tel' | 'select' | 'textarea' | 'checkbox' = 'text',
    options?: { value: string; label: string }[]
  ) => {
    const isEditing = editingField === field;
    
    return (
      <div className="relative group">
        <p className="text-sm text-gray-600 mb-1">{label}:</p>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <div className="flex items-center gap-2 w-full">
              {type === 'select' ? (
                <select
                  value={editValues[field as keyof UpdateGuestData] as string || ''}
                  onChange={(e) => handleInputChange(field, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar...</option>
                  {options?.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : type === 'textarea' ? (
                <textarea
                  value={editValues[field as keyof UpdateGuestData] as string || ''}
                  onChange={(e) => handleInputChange(field, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              ) : type === 'checkbox' ? (
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editValues[field as keyof UpdateGuestData] as boolean || false}
                    onChange={(e) => handleInputChange(field, e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">
                    {editValues[field as keyof UpdateGuestData] ? 'Sí' : 'No'}
                  </span>
                </label>
              ) : (
                <input
                  type={type}
                  value={editValues[field as keyof UpdateGuestData] as string || ''}
                  onChange={(e) => handleInputChange(field, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}
              <button
                onClick={handleSave}
                disabled={isUpdating}
                className="p-2 text-green-600 hover:bg-green-50 rounded-md transition-colors disabled:opacity-50"
                title="Guardar"
              >
                {isUpdating ? (
                  <div className="w-4 h-4 animate-spin rounded-full border-2 border-green-600 border-t-transparent" />
                ) : (
                  <Save size={16} />
                )}
              </button>
              <button
                onClick={handleCancel}
                disabled={isUpdating}
                className="p-2 text-gray-600 hover:bg-gray-50 rounded-md transition-colors disabled:opacity-50"
                title="Cancelar"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 w-full">
              <p className="text-base text-gray-800 font-medium flex-1">
                {type === 'checkbox' 
                  ? (value ? 'Sí' : 'No')
                  : value !== undefined && value !== '' ? String(value) : '—'
                }
              </p>
              <button
                onClick={() => handleEdit(field)}
                className="opacity-60 hover:opacity-100 group-hover:opacity-100 p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all duration-200"
                title="Editar"
              >
                <Edit3 size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderEditableNestedField = (
    label: string,
    parentField: string,
    field: string,
    value?: string | number | boolean,
    type: 'text' | 'email' | 'tel' | 'select' = 'text',
    options?: { value: string; label: string }[]
  ) => {
    const fieldKey = `${parentField}.${field}`;
    const isEditing = editingField === fieldKey;
    
    return (
      <div className="relative group">
        <p className="text-sm text-gray-600 mb-1">{label}:</p>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <div className="flex items-center gap-2 w-full">
              {type === 'select' ? (
                <select
                  value={
                    (editValues[parentField as keyof UpdateGuestData] as any)?.[field] || ''
                  }
                  onChange={(e) => handleNestedInputChange(parentField, field, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar...</option>
                  {options?.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={type}
                  value={
                    (editValues[parentField as keyof UpdateGuestData] as any)?.[field] || ''
                  }
                  onChange={(e) => handleNestedInputChange(parentField, field, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}
              <button
                onClick={handleSave}
                disabled={isUpdating}
                className="p-2 text-green-600 hover:bg-green-50 rounded-md transition-colors disabled:opacity-50"
                title="Guardar"
              >
                {isUpdating ? (
                  <div className="w-4 h-4 animate-spin rounded-full border-2 border-green-600 border-t-transparent" />
                ) : (
                  <Save size={16} />
                )}
              </button>
              <button
                onClick={handleCancel}
                disabled={isUpdating}
                className="p-2 text-gray-600 hover:bg-gray-50 rounded-md transition-colors disabled:opacity-50"
                title="Cancelar"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 w-full">
              <p className="text-base text-gray-800 font-medium flex-1">
                {value !== undefined && value !== '' ? String(value) : '—'}
              </p>
              <button
                onClick={() => handleEdit(fieldKey)}
                className="opacity-60 hover:opacity-100 group-hover:opacity-100 p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all duration-200"
                title="Editar"
              >
                <Edit3 size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderEditableArrayField = (label: string, field: string, list: string[] = []) => {
    const isEditing = editingField === field;
    
    return (
      <div className="relative group">
        <p className="text-sm text-gray-600 mb-1">{label}:</p>
        <div className="flex items-start gap-2">
          {isEditing ? (
            <div className="flex items-start gap-2 w-full">
              <textarea
                value={(editValues[field as keyof UpdateGuestData] as string[])?.join(', ') || ''}
                onChange={(e) => handleArrayInputChange(field, e.target.value)}
                placeholder="Separar elementos con comas"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
              />
              <div className="flex flex-col gap-1">
                <button
                  onClick={handleSave}
                  disabled={isUpdating}
                  className="p-2 text-green-600 hover:bg-green-50 rounded-md transition-colors disabled:opacity-50"
                  title="Guardar"
                >
                  {isUpdating ? (
                    <div className="w-4 h-4 animate-spin rounded-full border-2 border-green-600 border-t-transparent" />
                  ) : (
                    <Save size={16} />
                  )}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={isUpdating}
                  className="p-2 text-gray-600 hover:bg-gray-50 rounded-md transition-colors disabled:opacity-50"
                  title="Cancelar"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-2 w-full">
              <div className="flex-1">
                <ul className="list-disc pl-5 text-gray-800">
                  {list.length > 0 ? list.map((item, index) => <li key={index}>{item}</li>) : <li>—</li>}
                </ul>
              </div>
              <button
                onClick={() => handleEdit(field)}
                className="opacity-60 hover:opacity-100 group-hover:opacity-100 p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all duration-200"
                title="Editar"
              >
                <Edit3 size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderCountryField = (label: string, field: string, value?: string) => {
    const isEditing = editingField === field;
    
    return (
      <div className="relative group">
        <p className="text-sm text-gray-600 mb-1">{label}:</p>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <div className="flex items-center gap-2 w-full">
              <div className="flex-1">
                <ReactFlagsSelect
                  selected={editValues[field as keyof UpdateGuestData] as string || ''}
                  onSelect={(countryCode) => handleInputChange(field, countryCode)}
                  placeholder="Seleccionar país..."
                  searchable
                  searchPlaceholder="Buscar país..."
                  className="w-full"
                  selectButtonClassName="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  showSelectedLabel={true}
                  showOptionLabel={true}
                />
              </div>
              <button
                onClick={handleSave}
                disabled={isUpdating}
                className="p-2 text-green-600 hover:bg-green-50 rounded-md transition-colors disabled:opacity-50"
                title="Guardar"
              >
                {isUpdating ? (
                  <div className="w-4 h-4 animate-spin rounded-full border-2 border-green-600 border-t-transparent" />
                ) : (
                  <Save size={16} />
                )}
              </button>
              <button
                onClick={handleCancel}
                disabled={isUpdating}
                className="p-2 text-gray-600 hover:bg-gray-50 rounded-md transition-colors disabled:opacity-50"
                title="Cancelar"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 w-full">
              <div className="flex items-center gap-2 flex-1">
                {value && (
                  <div className="flex items-center gap-2">
                    <ReactFlagsSelect
                      selected={value}
                      onSelect={() => {}} // No interaction in view mode
                      showSelectedLabel={true}
                      disabled={true}
                      className="pointer-events-none"
                      selectButtonClassName="border-none bg-transparent p-0 cursor-default"
                    />
                  </div>
                )}
                {!value && (
                  <p className="text-base text-gray-800 font-medium">—</p>
                )}
              </div>
              <button
                onClick={() => handleEdit(field)}
                className="opacity-60 hover:opacity-100 group-hover:opacity-100 p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all duration-200"
                title="Editar"
              >
                <Edit3 size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderEditableNestedCountryField = (
    label: string,
    parentField: string,
    field: string,
    value?: string
  ) => {
    const fieldKey = `${parentField}.${field}`;
    const isEditing = editingField === fieldKey;
    
    return (
      <div className="relative group">
        <p className="text-sm text-gray-600 mb-1">{label}:</p>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <div className="flex items-center gap-2 w-full">
              <div className="flex-1">
                <ReactFlagsSelect
                  selected={
                    (editValues[parentField as keyof UpdateGuestData] as any)?.[field] || ''
                  }
                  onSelect={(countryCode) => handleNestedInputChange(parentField, field, countryCode)}
                  placeholder="Seleccionar país..."
                  searchable
                  searchPlaceholder="Buscar país..."
                  className="w-full"
                  selectButtonClassName="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  showSelectedLabel={true}
                  showOptionLabel={true}
                />
              </div>
              <button
                onClick={handleSave}
                disabled={isUpdating}
                className="p-2 text-green-600 hover:bg-green-50 rounded-md transition-colors disabled:opacity-50"
                title="Guardar"
              >
                {isUpdating ? (
                  <div className="w-4 h-4 animate-spin rounded-full border-2 border-green-600 border-t-transparent" />
                ) : (
                  <Save size={16} />
                )}
              </button>
              <button
                onClick={handleCancel}
                disabled={isUpdating}
                className="p-2 text-gray-600 hover:bg-gray-50 rounded-md transition-colors disabled:opacity-50"
                title="Cancelar"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 w-full">
              <div className="flex items-center gap-2 flex-1">
                {value && (
                  <div className="flex items-center gap-2">
                    <ReactFlagsSelect
                      selected={value}
                      onSelect={() => {}} // No interaction in view mode
                      showSelectedLabel={true}
                      disabled={true}
                      className="pointer-events-none"
                      selectButtonClassName="border-none bg-transparent p-0 cursor-default"
                    />
                  </div>
                )}
                {!value && (
                  <p className="text-base text-gray-800 font-medium">—</p>
                )}
              </div>
              <button
                onClick={() => handleEdit(fieldKey)}
                className="opacity-60 hover:opacity-100 group-hover:opacity-100 p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all duration-200"
                title="Editar"
              >
                <Edit3 size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/guests')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft size={20} />
                <span className="font-medium">Volver a Huéspedes</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {guest.firstName} {guest.lastName}
                </h1>
                <div className="flex items-center space-x-4 mt-1">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    ID: {guest.id}
                  </span>
                  {guest.vipStatus && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      <Star className="h-3 w-3 mr-1" />
                      VIP
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-6 mt-3 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Mail className="h-4 w-4" />
                    <span>{guest.email}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Phone className="h-4 w-4" />
                    <span>{guest.phone}</span>
                  </div>
                  {guest.nationality && (
                    <div className="flex items-center space-x-1">
                      <Globe className="h-4 w-4" />
                      <ReactFlagsSelect
                        selected={guest.nationality}
                        onSelect={() => {}}
                        showSelectedLabel={true}
                        disabled={true}
                        className="pointer-events-none"
                        selectButtonClassName="border-none bg-transparent p-0 cursor-default text-sm"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
            {editingField && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg">
                <Edit3 size={16} className="text-blue-600" />
                <span className="text-sm font-medium text-blue-700">Editando...</span>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Personal Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">Información Personal</h2>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {renderEditableField('Nombre', 'firstName', guest.firstName)}
                  {renderEditableField('Apellido', 'lastName', guest.lastName)}
                  {renderEditableField('Email', 'email', guest.email, 'email')}
                  {renderEditableField('Teléfono', 'phone', guest.phone, 'tel')}
                  {renderEditableField('Fecha de Nacimiento', 'dateOfBirth', guest.dateOfBirth)}
                  {renderEditableField('Género', 'gender', guest.gender, 'select', [
                    { value: 'male', label: 'Masculino' },
                    { value: 'female', label: 'Femenino' },
                    { value: 'other', label: 'Otro' },
                    { value: 'prefer_not_to_say', label: 'Prefiero no decir' }
                  ])}
                  {renderCountryField('Nacionalidad', 'nationality', guest.nationality)}
                  {renderEditableField('Idioma Preferido', 'preferredLanguage', guest.preferredLanguage)}
                </div>
              </div>
            </div>

            {/* Documents */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <FileText className="h-5 w-5 text-green-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">Documentación</h2>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {renderEditableField('Tipo de Documento', 'documentType', guest.documentType, 'select', [
                    { value: 'passport', label: 'Pasaporte' },
                    { value: 'license', label: 'Licencia de Conducir' },
                    { value: 'id_card', label: 'Cédula de Identidad' }
                  ])}
                  {renderEditableField('Número de Documento', 'documentNumber', guest.documentNumber)}
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <MapPin className="h-5 w-5 text-purple-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">Dirección</h2>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {renderEditableNestedField('Calle', 'address', 'street', guest.address?.street)}
                  {renderEditableNestedField('Ciudad', 'address', 'city', guest.address?.city)}
                  {renderEditableNestedField('Provincia/Estado', 'address', 'state', guest.address?.state)}
                  {renderEditableNestedCountryField('País', 'address', 'country', guest.address?.country)}
                  {renderEditableNestedField('Código Postal', 'address', 'postalCode', guest.address?.postalCode)}
                </div>
              </div>
            </div>

            {/* Medical Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-red-50 rounded-lg">
                    <Heart className="h-5 w-5 text-red-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">Información Médica</h2>
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                </div>
              </div>
              <div className="p-6 space-y-6">
                {renderEditableArrayField('Alergias', 'allergies', guest.allergies)}
                {renderEditableArrayField('Restricciones Dietéticas', 'dietaryRestrictions', guest.dietaryRestrictions)}
                {renderEditableField('Notas Médicas', 'medicalNotes', guest.medicalNotes, 'textarea')}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Emergency Contact */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-orange-50 rounded-lg">
                    <Shield className="h-5 w-5 text-orange-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">Contacto de Emergencia</h2>
                </div>
              </div>
              <div className="p-6 space-y-4">
                {renderEditableNestedField('Nombre', 'emergencyContact', 'name', guest.emergencyContact?.name)}
                {renderEditableNestedField('Relación', 'emergencyContact', 'relationship', guest.emergencyContact?.relationship)}
                {renderEditableNestedField('Teléfono', 'emergencyContact', 'phone', guest.emergencyContact?.phone, 'tel')}
                {renderEditableNestedField('Email', 'emergencyContact', 'email', guest.emergencyContact?.email, 'email')}
              </div>
            </div>

            {/* Room Preferences */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-indigo-50 rounded-lg">
                    <Bed className="h-5 w-5 text-indigo-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">Preferencias de Habitación</h2>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {guest.roomPreferences?.floor && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">Piso</span>
                      <span className="text-sm font-medium text-gray-900">{guest.roomPreferences.floor}</span>
                    </div>
                  )}
                  {guest.roomPreferences?.view && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">Vista</span>
                      <span className="text-sm font-medium text-gray-900">{guest.roomPreferences.view}</span>
                    </div>
                  )}
                  {guest.roomPreferences?.bedType && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">Tipo de Cama</span>
                      <span className="text-sm font-medium text-gray-900">{guest.roomPreferences.bedType}</span>
                    </div>
                  )}
                  {guest.roomPreferences?.smokingAllowed !== undefined && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">Permite Fumar</span>
                      <span className="text-sm font-medium text-gray-900">
                        {guest.roomPreferences.smokingAllowed ? 'Sí' : 'No'}
                      </span>
                    </div>
                  )}
                  {!(guest.roomPreferences?.floor || guest.roomPreferences?.view || guest.roomPreferences?.bedType) && (
                    <p className="text-sm text-gray-500 italic">Sin preferencias especificadas</p>
                  )}
                </div>
              </div>
            </div>

            {/* Loyalty Program */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-yellow-50 rounded-lg">
                    <CreditCard className="h-5 w-5 text-yellow-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">Programa de Lealtad</h2>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">ID de Membresía</span>
                    <span className="text-sm font-medium text-gray-900">
                      {guest.loyaltyProgram?.memberId || '—'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Nivel</span>
                    <span className="text-sm font-medium text-gray-900">
                      {guest.loyaltyProgram?.tier || '—'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-gray-600">Puntos</span>
                    <span className="text-sm font-medium text-gray-900">
                      {guest.loyaltyProgram?.points ?? '—'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Communication Preferences */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-teal-50 rounded-lg">
                    <Settings className="h-5 w-5 text-teal-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">Preferencias de Comunicación</h2>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-2">
                  {Object.entries(guest.communicationPreferences || {}).filter(([, v]) => v).map(([key]) => (
                    <div key={key} className="flex items-center space-x-2">
                      <div className="h-2 w-2 bg-green-400 rounded-full"></div>
                      <span className="text-sm text-gray-700 capitalize">{key}</span>
                    </div>
                  ))}
                  {Object.values(guest.communicationPreferences || {}).every(v => !v) && (
                    <p className="text-sm text-gray-500 italic">Sin preferencias especificadas</p>
                  )}
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gray-50 rounded-lg">
                    <FileText className="h-5 w-5 text-gray-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">Notas del Personal</h2>
                </div>
              </div>
              <div className="p-6">
                {renderEditableField('Notas', 'notes', guest.notes, 'textarea')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
