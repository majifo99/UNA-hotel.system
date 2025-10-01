import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, User, Heart, Phone, Star, Edit3,
  Mail, MapPin, Shield, FileText, Globe,
  CreditCard, Bed, Settings, AlertTriangle
} from 'lucide-react';
import ReactFlagsSelect from 'react-flags-select';
import { useGuestById } from '../hooks/useGuests';
import { useGuestEdit } from '../hooks/useGuestEdit';
import { GuestModalForm } from '../components/shared/GuestModalForm';

// Simple display field component
const DisplayField: React.FC<{ label: string; value: string | number | undefined }> = ({ label, value }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <p className="text-gray-900 py-2">{value || '—'}</p>
  </div>
);

// Array display component
const DisplayArray: React.FC<{ label: string; items: string[] }> = ({ label, items }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <div className="py-2">
      {items && items.length > 0 ? (
        <ul className="list-disc list-inside space-y-1">
          {items.map((item, index) => (
            <li key={index} className="text-gray-900">{item}</li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">—</p>
      )}
    </div>
  </div>
);

export const GuestProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Usar el hook para obtener el huésped
  const { 
    data: guest, 
    isLoading, 
    error, 
    refetch 
  } = useGuestById(id);

  // Usar el hook para edición completa
  const {
    isEditModalOpen,
    openEditModal,
    closeEditModal,
    editFormData,
    editErrors,
    handleEditInputChange,
    handleEditSubmit,
    isUpdating
  } = useGuestEdit(guest || null, refetch);

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
            {/* Botón de editar */}
            <div className="flex items-center gap-2">
              <button
                onClick={openEditModal}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit3 size={16} />
                <span className="font-medium">Editar Perfil</span>
              </button>
            </div>
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
                  <DisplayField label="Nombre" value={guest.firstName} />
                  <DisplayField label="Primer Apellido" value={guest.firstLastName} />
                  <DisplayField label="Segundo Apellido" value={guest.secondLastName} />
                  <DisplayField label="Email" value={guest.email} />
                  <DisplayField label="Teléfono" value={guest.phone} />
                  <DisplayField label="Fecha de Nacimiento" value={guest.dateOfBirth} />
                  <DisplayField 
                    label="Género" 
                    value={
                      guest.gender === 'male' ? 'Masculino' : 
                      guest.gender === 'female' ? 'Femenino' : 
                      guest.gender === 'other' ? 'Otro' : 
                      guest.gender === 'prefer_not_to_say' ? 'Prefiero no decir' : '—'
                    } 
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nacionalidad</label>
                    <div className="flex items-center gap-2 py-2">
                      {guest.nationality ? (
                        <ReactFlagsSelect
                          selected={guest.nationality}
                          onSelect={() => {}}
                          showSelectedLabel={true}
                          disabled={true}
                          className="pointer-events-none"
                          selectButtonClassName="border-none bg-transparent p-0 cursor-default"
                        />
                      ) : (
                        <span className="text-gray-500">—</span>
                      )}
                    </div>
                  </div>
                  <DisplayField label="Idioma Preferido" value={guest.preferredLanguage} />
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
                  <DisplayField 
                    label="Tipo de Documento" 
                    value={
                      guest.documentType === 'passport' ? 'Pasaporte' :
                      guest.documentType === 'license' ? 'Licencia de Conducir' :
                      'Cédula de Identidad'
                    }
                  />
                  <DisplayField label="Número de Documento" value={guest.documentNumber} />
                </div>
              </div>
            </div>

            {/* Address - Siempre mostrar */}
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
                  <DisplayField label="Calle" value={guest.address?.street} />
                  <DisplayField label="Ciudad" value={guest.address?.city} />
                  <DisplayField label="Provincia/Estado" value={guest.address?.state} />
                  <DisplayField label="País" value={guest.address?.country} />
                  <DisplayField label="Código Postal" value={guest.address?.postalCode} />
                </div>
              </div>
            </div>

            {/* Medical Information - Siempre mostrar */}
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
                <DisplayArray label="Alergias" items={guest.allergies || []} />
                <DisplayArray label="Restricciones Dietéticas" items={guest.dietaryRestrictions || []} />
                <DisplayField label="Notas Médicas" value={guest.medicalNotes} />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Emergency Contact - Siempre mostrar */}
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
                <DisplayField label="Nombre" value={guest.emergencyContact?.name} />
                <DisplayField label="Relación" value={guest.emergencyContact?.relationship} />
                <DisplayField label="Teléfono" value={guest.emergencyContact?.phone} />
                <DisplayField label="Email" value={guest.emergencyContact?.email} />
              </div>
            </div>

            {/* Room Preferences - Siempre mostrar */}
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
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Piso</span>
                    <span className="text-sm font-medium text-gray-900">
                      {guest.roomPreferences?.floor || '—'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Vista</span>
                    <span className="text-sm font-medium text-gray-900">
                      {guest.roomPreferences?.view || '—'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Tipo de Cama</span>
                    <span className="text-sm font-medium text-gray-900">
                      {guest.roomPreferences?.bedType || '—'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Permite Fumar</span>
                    <span className="text-sm font-medium text-gray-900">
                      {guest.roomPreferences?.smokingAllowed !== undefined 
                        ? (guest.roomPreferences.smokingAllowed ? 'Sí' : 'No')
                        : '—'
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Loyalty Program - Siempre mostrar */}
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
                      {guest.loyaltyProgram?.points !== undefined ? guest.loyaltyProgram.points : '—'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Communication Preferences - Siempre mostrar */}
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
                  {guest.communicationPreferences && Object.entries(guest.communicationPreferences).filter(([, v]) => v).length > 0 ? (
                    Object.entries(guest.communicationPreferences).filter(([, v]) => v).map(([key]) => (
                      <div key={key} className="flex items-center space-x-2">
                        <div className="h-2 w-2 bg-green-400 rounded-full"></div>
                        <span className="text-sm text-gray-700 capitalize">{key}</span>
                      </div>
                    ))
                  ) : (
                    <span className="text-gray-500 text-sm">—</span>
                  )}
                </div>
              </div>
            </div>

            {/* Notes - Siempre mostrar */}
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
                <DisplayField label="Notas" value={guest.notes} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de edición */}
      <GuestModalForm
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        title="Editar Perfil del Huésped"
        formData={editFormData}
        errors={editErrors}
        onInputChange={handleEditInputChange}
        onSubmit={handleEditSubmit}
        isSubmitting={isUpdating}
        submitText="Guardar Cambios"
        submittingText="Guardando..."
        showVipStatus={true}
        size="lg"
      />
    </div>
  );
};