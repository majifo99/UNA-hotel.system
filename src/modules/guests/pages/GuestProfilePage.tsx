import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Heart, Phone, Star, Edit3, Save, X } from 'lucide-react';
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

  const handleEdit = useCallback((fieldName: string) => {
    setEditingField(fieldName);
  }, []);

  const handleCancel = useCallback(() => {
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
  }, [guest]);

  const handleSave = useCallback(async () => {
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
  }, [guest, editValues, updateGuest]);

  const handleInputChange = useCallback((field: string, value: any) => {
    setEditValues(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleNestedInputChange = useCallback((parentField: string, field: string, value: any) => {
    setEditValues(prev => ({
      ...prev,
      [parentField]: {
        ...(prev[parentField as keyof UpdateGuestData] as object || {}),
        [field]: value
      }
    }));
  }, []);

  const handleArrayInputChange = useCallback((field: string, value: string) => {
    const arrayValue = value.split(',').map(item => item.trim()).filter(item => item.length > 0);
    setEditValues(prev => ({
      ...prev,
      [field]: arrayValue
    }));
  }, []);

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
                className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-blue-600 transition-all"
                title="Editar"
                aria-label="Editar campo"
              >
                <Edit3 size={14} />
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
                className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-blue-600 transition-all"
                title="Editar"
              >
                <Edit3 size={14} />
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
                  {list.length > 0 ? list.map((item, index) => <li key={`${field}-${item}-${index}`}>{item}</li>) : <li>—</li>}
                </ul>
              </div>
              <button
                onClick={() => handleEdit(field)}
                className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-blue-600 transition-all"
                title="Editar"
              >
                <Edit3 size={14} />
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
                className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-blue-600 transition-all"
                title="Editar"
              >
                <Edit3 size={14} />
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
                className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-blue-600 transition-all"
                title="Editar"
              >
                <Edit3 size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto p-8 bg-white min-h-screen">
      {/* Breadcrumb */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
          <button
            onClick={() => navigate('/guests')}
            className="flex items-center gap-1 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft size={16} />
            Volver
          </button>
          <span>/</span>
          <span className="text-gray-900 font-medium">Perfil</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Perfil de Huésped</h1>
      </div>

      <div className="space-y-10">
        {/* Información Básica */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <User className="text-blue-600" size={24} />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Información Básica</h2>
            </div>
            {editingField && (
              <div className="flex items-center gap-2 text-sm text-blue-600">
                <Edit3 size={16} />
                <span>Editando...</span>
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
            {renderEditableField('Tipo de Documento', 'documentType', guest.documentType, 'select', [
              { value: 'passport', label: 'Pasaporte' },
              { value: 'license', label: 'Licencia de Conducir' },
              { value: 'id_card', label: 'Cédula de Identidad' }
            ])}
            {renderEditableField('Número de Documento', 'documentNumber', guest.documentNumber)}
          </div>
        </section>

        {/* Dirección */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Dirección</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {renderEditableNestedField('Calle', 'address', 'street', guest.address?.street)}
            {renderEditableNestedField('Ciudad', 'address', 'city', guest.address?.city)}
            {renderEditableNestedField('Provincia/Estado', 'address', 'state', guest.address?.state)}
            {renderEditableNestedCountryField('País', 'address', 'country', guest.address?.country)}
            {renderEditableNestedField('Código Postal', 'address', 'postalCode', guest.address?.postalCode)}
          </div>
        </section>

        {/* Médica */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-50 rounded-lg">
              <Heart className="text-red-600" size={24} />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Información Médica</h2>
          </div>
          <div className="space-y-4">
            {renderEditableArrayField('Alergias', 'allergies', guest.allergies)}
            {renderEditableArrayField('Restricciones Dietéticas', 'dietaryRestrictions', guest.dietaryRestrictions)}
            {renderEditableField('Notas Médicas', 'medicalNotes', guest.medicalNotes, 'textarea')}
          </div>
        </section>

        {/* Emergencia */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-orange-50 rounded-lg">
              <Phone className="text-orange-600" size={24} />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Contacto de Emergencia</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {renderEditableNestedField('Nombre', 'emergencyContact', 'name', guest.emergencyContact?.name)}
            {renderEditableNestedField('Relación', 'emergencyContact', 'relationship', guest.emergencyContact?.relationship)}
            {renderEditableNestedField('Teléfono', 'emergencyContact', 'phone', guest.emergencyContact?.phone, 'tel')}
            {renderEditableNestedField('Email', 'emergencyContact', 'email', guest.emergencyContact?.email, 'email')}
          </div>
        </section>

        {/* Preferencias */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-yellow-50 rounded-lg">
              <Star className="text-yellow-600" size={24} />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Notas y Preferencias</h2>
          </div>
          <div className="space-y-4">
            {renderEditableField('Notas del Personal', 'notes', guest.notes, 'textarea')}
            {renderEditableField('Cliente VIP', 'vipStatus', guest.vipStatus, 'checkbox')}
            {renderEditableField('Idioma Preferido', 'preferredLanguage', guest.preferredLanguage)}
            <div>
              <p className="text-sm text-gray-600">Preferencias de Comunicación:</p>
              <ul className="list-disc pl-5 text-gray-800">
                {Object.entries(guest.communicationPreferences || {}).filter(([, v]) => v).map(([k]) => (
                  <li key={k}>{k.toUpperCase()}</li>
                ))}
                {Object.values(guest.communicationPreferences || {}).every(v => !v) && <li>—</li>}
              </ul>
            </div>
            <div>
              <p className="text-sm text-gray-600">Preferencias de Habitación:</p>
              <ul className="list-disc pl-5 text-gray-800">
                {guest.roomPreferences?.floor && <li>Piso: {guest.roomPreferences.floor}</li>}
                {guest.roomPreferences?.view && <li>Vista: {guest.roomPreferences.view}</li>}
                {guest.roomPreferences?.bedType && <li>Tipo de Cama: {guest.roomPreferences.bedType}</li>}
                {guest.roomPreferences?.smokingAllowed !== undefined && (
                  <li>Permite Fumar: {guest.roomPreferences.smokingAllowed ? 'Sí' : 'No'}</li>
                )}
                {!(guest.roomPreferences?.floor || guest.roomPreferences?.view || guest.roomPreferences?.bedType) && <li>—</li>}
              </ul>
            </div>
            <div>
              <p className="text-sm text-gray-600">Programa de Lealtad:</p>
              <ul className="list-disc pl-5 text-gray-800">
                <li>ID: {guest.loyaltyProgram?.memberId || '—'}</li>
                <li>Nivel: {guest.loyaltyProgram?.tier || '—'}</li>
                <li>Puntos: {guest.loyaltyProgram?.points ?? '—'}</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
