import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, User, Heart, Phone, Star, Edit3,
  Mail, MapPin, Shield, FileText, Globe,
  CreditCard, Bed, Settings, AlertTriangle
} from 'lucide-react';
import ReactFlagsSelect from 'react-flags-select';
import type { UpdateGuestData } from '../types';
import { useGuests, useGuestById } from '../hooks/useGuests';
import { useInlineEdit } from '../hooks/useInlineEdit';
import { 
  InlineEditField, 
  InlineEditNestedField, 
  SimpleArrayField 
} from '../components/shared';

export const GuestProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { updateGuest, isUpdating } = useGuests();
  
  // Usar el nuevo hook para obtener el huésped
  const { 
    data: guest, 
    isLoading, 
    error, 
    refetch 
  } = useGuestById(id);

  // Use the new inline edit hook
  const {
    editingField,
    editValues,
    isEditing,
    handleEdit,
    handleCancel,
    handleSave,
    handleInputChange,
    handleNestedInputChange,
    updateEditValues
  } = useInlineEdit({
    onSave: async (data: Partial<UpdateGuestData>) => {
      if (guest) {
        try {
          const updateData = { ...data, id: guest.id };
          await updateGuest(guest.id, updateData as UpdateGuestData);
          refetch();
        } catch (error) {
          console.error('Error updating guest:', error);
        }
      }
    },
    initialData: guest ? {
      id: guest.id,
      firstName: guest.firstName,
      firstLastName: guest.firstLastName,
      secondLastName: guest.secondLastName,
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
    } : {},
    isUpdating
  });

  // Update edit values when guest data changes
  useEffect(() => {
    if (guest) {
      updateEditValues({
        id: guest.id,
        firstName: guest.firstName,
        firstLastName: guest.firstLastName,
        secondLastName: guest.secondLastName,
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
  }, [guest, updateEditValues]);



  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <AlertTriangle className="h-12 w-12 text-red-500" />
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error al cargar el huésped</h2>
          <p className="text-gray-600 mb-4">
            {error instanceof Error ? error.message : 'No se pudo cargar la información del huésped'}
          </p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!guest) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <User className="h-12 w-12 text-gray-400" />
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Huésped no encontrado</h2>
          <p className="text-gray-600 mb-4">
            No se encontró el huésped con ID: {id}
          </p>
          <button
            onClick={() => navigate('/guests')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Volver a Huéspedes
          </button>
        </div>
      </div>
    );
  }



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
                  {guest.firstName} {guest.firstLastName} {guest.secondLastName || ''}
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
                  <InlineEditField 
                    label="Nombre"
                    value={guest.firstName}
                    isEditing={isEditing('firstName')}
                    onEdit={() => handleEdit('firstName')}
                    onSave={handleSave}
                    onCancel={handleCancel}
                    isUpdating={isUpdating}
                    type="text"
                    editValue={editValues.firstName || ''}
                    onChange={(value: string) => handleInputChange('firstName', value)}
                  />
                  <InlineEditField 
                    label="Primer Apellido"
                    value={guest.firstLastName}
                    isEditing={isEditing('firstLastName')}
                    onEdit={() => handleEdit('firstLastName')}
                    onSave={handleSave}
                    onCancel={handleCancel}
                    isUpdating={isUpdating}
                    type="text"
                    editValue={editValues.firstLastName || ''}
                    onChange={(value: string) => handleInputChange('firstLastName', value)}
                  />
                  <InlineEditField 
                    label="Segundo Apellido"
                    value={guest.secondLastName || ''}
                    isEditing={isEditing('secondLastName')}
                    onEdit={() => handleEdit('secondLastName')}
                    onSave={handleSave}
                    onCancel={handleCancel}
                    isUpdating={isUpdating}
                    type="text"
                    editValue={editValues.secondLastName || ''}
                    onChange={(value: string) => handleInputChange('secondLastName', value)}
                  />
                  <InlineEditField 
                    label="Email"
                    value={guest.email}
                    isEditing={isEditing('email')}
                    onEdit={() => handleEdit('email')}
                    onSave={handleSave}
                    onCancel={handleCancel}
                    isUpdating={isUpdating}
                    type="email"
                    editValue={editValues.email || ''}
                    onChange={(value: string) => handleInputChange('email', value)}
                  />
                  <InlineEditField 
                    label="Teléfono"
                    value={guest.phone}
                    isEditing={isEditing('phone')}
                    onEdit={() => handleEdit('phone')}
                    onSave={handleSave}
                    onCancel={handleCancel}
                    isUpdating={isUpdating}
                    type="tel"
                    editValue={editValues.phone || ''}
                    onChange={(value: string) => handleInputChange('phone', value)}
                  />
                  <InlineEditField 
                    label="Fecha de Nacimiento"
                    value={guest.dateOfBirth}
                    isEditing={isEditing('dateOfBirth')}
                    onEdit={() => handleEdit('dateOfBirth')}
                    onSave={handleSave}
                    onCancel={handleCancel}
                    isUpdating={isUpdating}
                    type="text"
                    editValue={editValues.dateOfBirth || ''}
                    onChange={(value: string) => handleInputChange('dateOfBirth', value)}
                  />
                  <InlineEditField 
                    label="Género"
                    value={guest.gender}
                    isEditing={isEditing('gender')}
                    onEdit={() => handleEdit('gender')}
                    onSave={handleSave}
                    onCancel={handleCancel}
                    isUpdating={isUpdating}
                    type="select"
                    editValue={editValues.gender || ''}
                    onChange={(value: string) => handleInputChange('gender', value)}
                    options={[
                      { value: 'male', label: 'Masculino' },
                      { value: 'female', label: 'Femenino' },
                      { value: 'other', label: 'Otro' },
                      { value: 'prefer_not_to_say', label: 'Prefiero no decir' }
                    ]}
                  />
                  <InlineEditField 
                    label="Nacionalidad"
                    value={guest.nationality}
                    isEditing={isEditing('nationality')}
                    onEdit={() => handleEdit('nationality')}
                    onSave={handleSave}
                    onCancel={handleCancel}
                    isUpdating={isUpdating}
                    type="country"
                    editValue={editValues.nationality || ''}
                    onChange={(value: string) => handleInputChange('nationality', value)}
                  />
                  <InlineEditField 
                    label="Idioma Preferido"
                    value={guest.preferredLanguage}
                    isEditing={isEditing('preferredLanguage')}
                    onEdit={() => handleEdit('preferredLanguage')}
                    onSave={handleSave}
                    onCancel={handleCancel}
                    isUpdating={isUpdating}
                    type="text"
                    editValue={editValues.preferredLanguage || ''}
                    onChange={(value: string) => handleInputChange('preferredLanguage', value)}
                  />
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
                  <InlineEditField 
                    label="Tipo de Documento"
                    value={guest.documentType}
                    isEditing={isEditing('documentType')}
                    onEdit={() => handleEdit('documentType')}
                    onSave={handleSave}
                    onCancel={handleCancel}
                    isUpdating={isUpdating}
                    type="select"
                    editValue={editValues.documentType || ''}
                    onChange={(value: string) => handleInputChange('documentType', value)}
                    options={[
                      { value: 'passport', label: 'Pasaporte' },
                      { value: 'license', label: 'Licencia de Conducir' },
                      { value: 'id_card', label: 'Cédula de Identidad' }
                    ]}
                  />
                  <InlineEditField 
                    label="Número de Documento"
                    value={guest.documentNumber}
                    isEditing={isEditing('documentNumber')}
                    onEdit={() => handleEdit('documentNumber')}
                    onSave={handleSave}
                    onCancel={handleCancel}
                    isUpdating={isUpdating}
                    type="text"
                    editValue={editValues.documentNumber || ''}
                    onChange={(value: string) => handleInputChange('documentNumber', value)}
                  />
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
                  <InlineEditNestedField 
                    label="Calle"
                    value={{ street: guest.address?.street }}
                    isEditing={isEditing('address.street')}
                    onEdit={() => handleEdit('address.street')}
                    onSave={handleSave}
                    onCancel={handleCancel}
                    isUpdating={isUpdating}
                    editValue={{ street: (editValues.address as any)?.street || '' }}
                    onChange={(key: string, value: string) => handleNestedInputChange('address', key, value)}
                    fields={[{ key: 'street', label: 'Calle', type: 'text', placeholder: 'Ingrese la calle' }]}
                    displayFormat={(data) => data.street || ''}
                  />
                  <InlineEditNestedField 
                    label="Ciudad"
                    value={{ city: guest.address?.city }}
                    isEditing={isEditing('address.city')}
                    onEdit={() => handleEdit('address.city')}
                    onSave={handleSave}
                    onCancel={handleCancel}
                    isUpdating={isUpdating}
                    editValue={{ city: (editValues.address as any)?.city || '' }}
                    onChange={(key: string, value: string) => handleNestedInputChange('address', key, value)}
                    fields={[{ key: 'city', label: 'Ciudad', type: 'text', placeholder: 'Ingrese la ciudad' }]}
                    displayFormat={(data) => data.city || ''}
                  />
                  <InlineEditNestedField 
                    label="Provincia/Estado"
                    value={{ state: guest.address?.state }}
                    isEditing={isEditing('address.state')}
                    onEdit={() => handleEdit('address.state')}
                    onSave={handleSave}
                    onCancel={handleCancel}
                    isUpdating={isUpdating}
                    editValue={{ state: (editValues.address as any)?.state || '' }}
                    onChange={(key: string, value: string) => handleNestedInputChange('address', key, value)}
                    fields={[{ key: 'state', label: 'Provincia/Estado', type: 'text', placeholder: 'Ingrese la provincia o estado' }]}
                    displayFormat={(data) => data.state || ''}
                  />
                  <InlineEditField 
                    label="País"
                    value={guest.address?.country}
                    isEditing={isEditing('address.country')}
                    onEdit={() => handleEdit('address.country')}
                    onSave={handleSave}
                    onCancel={handleCancel}
                    isUpdating={isUpdating}
                    type="country"
                    editValue={(editValues.address as any)?.country || ''}
                    onChange={(value: string) => handleNestedInputChange('address', 'country', value)}
                  />
                  <InlineEditNestedField 
                    label="Código Postal"
                    value={{ postalCode: guest.address?.postalCode }}
                    isEditing={isEditing('address.postalCode')}
                    onEdit={() => handleEdit('address.postalCode')}
                    onSave={handleSave}
                    onCancel={handleCancel}
                    isUpdating={isUpdating}
                    editValue={{ postalCode: (editValues.address as any)?.postalCode || '' }}
                    onChange={(key: string, value: string) => handleNestedInputChange('address', key, value)}
                    fields={[{ key: 'postalCode', label: 'Código Postal', type: 'text', placeholder: 'Ingrese el código postal' }]}
                    displayFormat={(data) => data.postalCode || ''}
                  />
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
                <SimpleArrayField 
                  label="Alergias"
                  value={guest.allergies || []}
                  isEditing={isEditing('allergies')}
                  onEdit={() => handleEdit('allergies')}
                  onSave={handleSave}
                  onCancel={handleCancel}
                  isUpdating={isUpdating}
                  editValue={editValues.allergies as string[] || []}
                  onChange={(value: string) => {
                    const arrayValue = value.split(',').map(item => item.trim()).filter(item => item.length > 0);
                    handleInputChange('allergies', arrayValue);
                  }}
                  emptyText="No hay alergias registradas"
                  placeholder="Separar alergias con comas"
                />
                <SimpleArrayField 
                  label="Restricciones Dietéticas"
                  value={guest.dietaryRestrictions || []}
                  isEditing={isEditing('dietaryRestrictions')}
                  onEdit={() => handleEdit('dietaryRestrictions')}
                  onSave={handleSave}
                  onCancel={handleCancel}
                  isUpdating={isUpdating}
                  editValue={editValues.dietaryRestrictions as string[] || []}
                  onChange={(value: string) => {
                    const arrayValue = value.split(',').map(item => item.trim()).filter(item => item.length > 0);
                    handleInputChange('dietaryRestrictions', arrayValue);
                  }}
                  emptyText="No hay restricciones dietéticas registradas"
                  placeholder="Separar restricciones con comas"
                />
                <InlineEditField 
                  label="Notas Médicas"
                  value={guest.medicalNotes}
                  isEditing={isEditing('medicalNotes')}
                  onEdit={() => handleEdit('medicalNotes')}
                  onSave={handleSave}
                  onCancel={handleCancel}
                  isUpdating={isUpdating}
                  type="textarea"
                  editValue={editValues.medicalNotes || ''}
                  onChange={(value: string) => handleInputChange('medicalNotes', value)}
                />
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
                <InlineEditNestedField 
                  label="Nombre"
                  value={{ name: guest.emergencyContact?.name }}
                  isEditing={isEditing('emergencyContact.name')}
                  onEdit={() => handleEdit('emergencyContact.name')}
                  onSave={handleSave}
                  onCancel={handleCancel}
                  isUpdating={isUpdating}
                  editValue={{ name: (editValues.emergencyContact as any)?.name || '' }}
                  onChange={(key: string, value: string) => handleNestedInputChange('emergencyContact', key, value)}
                  fields={[{ key: 'name', label: 'Nombre', type: 'text', placeholder: 'Ingrese el nombre del contacto' }]}
                  displayFormat={(data) => data.name || ''}
                />
                <InlineEditNestedField 
                  label="Relación"
                  value={{ relationship: guest.emergencyContact?.relationship }}
                  isEditing={isEditing('emergencyContact.relationship')}
                  onEdit={() => handleEdit('emergencyContact.relationship')}
                  onSave={handleSave}
                  onCancel={handleCancel}
                  isUpdating={isUpdating}
                  editValue={{ relationship: (editValues.emergencyContact as any)?.relationship || '' }}
                  onChange={(key: string, value: string) => handleNestedInputChange('emergencyContact', key, value)}
                  fields={[{ key: 'relationship', label: 'Relación', type: 'text', placeholder: 'Ej: Hermano, Madre, Amigo' }]}
                  displayFormat={(data) => data.relationship || ''}
                />
                <InlineEditNestedField 
                  label="Teléfono"
                  value={{ phone: guest.emergencyContact?.phone }}
                  isEditing={isEditing('emergencyContact.phone')}
                  onEdit={() => handleEdit('emergencyContact.phone')}
                  onSave={handleSave}
                  onCancel={handleCancel}
                  isUpdating={isUpdating}
                  editValue={{ phone: (editValues.emergencyContact as any)?.phone || '' }}
                  onChange={(key: string, value: string) => handleNestedInputChange('emergencyContact', key, value)}
                  fields={[{ key: 'phone', label: 'Teléfono', type: 'tel', placeholder: 'Ingrese el teléfono' }]}
                  displayFormat={(data) => data.phone || ''}
                />
                <InlineEditNestedField 
                  label="Email"
                  value={{ email: guest.emergencyContact?.email }}
                  isEditing={isEditing('emergencyContact.email')}
                  onEdit={() => handleEdit('emergencyContact.email')}
                  onSave={handleSave}
                  onCancel={handleCancel}
                  isUpdating={isUpdating}
                  editValue={{ email: (editValues.emergencyContact as any)?.email || '' }}
                  onChange={(key: string, value: string) => handleNestedInputChange('emergencyContact', key, value)}
                  fields={[{ key: 'email', label: 'Email', type: 'email', placeholder: 'Ingrese el email' }]}
                  displayFormat={(data) => data.email || ''}
                />
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
                <InlineEditField 
                  label="Notas"
                  value={guest.notes}
                  isEditing={isEditing('notes')}
                  onEdit={() => handleEdit('notes')}
                  onSave={handleSave}
                  onCancel={handleCancel}
                  isUpdating={isUpdating}
                  type="textarea"
                  editValue={editValues.notes || ''}
                  onChange={(value: string) => handleInputChange('notes', value)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
