import React from 'react';
import { Modal } from '../ui/Modal';
// import { EditGuestModal } from './EditGuestModal';
import type { Guest } from '../../modules/guests/types';

interface GuestProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  guest: Guest;
}

export const GuestProfileModal: React.FC<GuestProfileModalProps> = ({
  isOpen,
  onClose,
  guest
}) => {
  // const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleEditClick = () => {
    // setIsEditModalOpen(true);
    console.log('Edit functionality will be available soon');
  };

  // const handleEditClose = () => {
  //   setIsEditModalOpen(false);
  // };

  // const handleEditSuccess = () => {
  //   setIsEditModalOpen(false);
  //   // El guest data se actualizará automáticamente por React Query
  // };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Perfil del Huésped"
        size="lg"
      >
        <div className="p-6">
          {/* Header with guest name and edit button */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {guest.firstName} {guest.firstLastName} {guest.secondLastName}
              </h2>
              {guest.vipStatus && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 mt-2">
                  VIP
                </span>
              )}
            </div>
            <button
              onClick={handleEditClick}
              className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Editar
            </button>
          </div>

          {/* Guest Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                Información Personal
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-500">Email</label>
                <p className="mt-1 text-sm text-gray-900">{guest.email || 'No especificado'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500">Teléfono</label>
                <p className="mt-1 text-sm text-gray-900">{guest.phone || 'No especificado'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500">Nacionalidad</label>
                <p className="mt-1 text-sm text-gray-900">{guest.nationality || 'No especificado'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500">Fecha de Nacimiento</label>
                <p className="mt-1 text-sm text-gray-900">
                  {guest.dateOfBirth || guest.birthDate || 'No especificado'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500">Género</label>
                <p className="mt-1 text-sm text-gray-900">
                  {guest.gender === 'male' ? 'Masculino' : 
                   guest.gender === 'female' ? 'Femenino' : 
                   guest.gender === 'other' ? 'Otro' : 'No especificado'}
                </p>
              </div>
            </div>

            {/* Document and Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                Documentación
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-500">Tipo de Documento</label>
                <p className="mt-1 text-sm text-gray-900">
                  {guest.documentType === 'id_card' ? 'Cédula de Identidad' :
                   guest.documentType === 'passport' ? 'Pasaporte' :
                   guest.documentType === 'license' ? 'Licencia de Conducir' : 'No especificado'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500">Número de Documento</label>
                <p className="mt-1 text-sm text-gray-900">{guest.documentNumber || 'No especificado'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500">Dirección</label>
                <p className="mt-1 text-sm text-gray-900">
                  {guest.address?.street || 'No especificada'}
                </p>
              </div>
            </div>
          </div>

          {/* Room Preferences */}
          {guest.roomPreferences && Object.keys(guest.roomPreferences).length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2 mb-4">
                Preferencias de Habitación
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {guest.roomPreferences.floor && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Piso</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {guest.roomPreferences.floor === 'low' ? 'Bajo' :
                       guest.roomPreferences.floor === 'middle' ? 'Medio' :
                       guest.roomPreferences.floor === 'high' ? 'Alto' : guest.roomPreferences.floor}
                    </p>
                  </div>
                )}
                
                {guest.roomPreferences.view && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Vista</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {guest.roomPreferences.view === 'ocean' ? 'Océano' :
                       guest.roomPreferences.view === 'mountain' ? 'Montaña' :
                       guest.roomPreferences.view === 'city' ? 'Ciudad' :
                       guest.roomPreferences.view === 'garden' ? 'Jardín' : guest.roomPreferences.view}
                    </p>
                  </div>
                )}
                
                {guest.roomPreferences.bedType && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Tipo de Cama</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {guest.roomPreferences.bedType === 'single' ? 'Individual' :
                       guest.roomPreferences.bedType === 'double' ? 'Doble' :
                       guest.roomPreferences.bedType === 'queen' ? 'Queen' :
                       guest.roomPreferences.bedType === 'king' ? 'King' :
                       guest.roomPreferences.bedType === 'twin' ? 'Gemelas' : guest.roomPreferences.bedType}
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-500">Fumador</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {guest.roomPreferences.smokingAllowed ? 'Sí' : 'No'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Emergency Contact */}
          {guest.emergencyContact?.name && (
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2 mb-4">
                Contacto de Emergencia
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Nombre</label>
                  <p className="mt-1 text-sm text-gray-900">{guest.emergencyContact.name}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500">Relación</label>
                  <p className="mt-1 text-sm text-gray-900">{guest.emergencyContact.relationship || 'No especificada'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500">Teléfono</label>
                  <p className="mt-1 text-sm text-gray-900">{guest.emergencyContact.phone || 'No especificado'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500">Email</label>
                  <p className="mt-1 text-sm text-gray-900">{guest.emergencyContact.email || 'No especificado'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          {guest.notes && (
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2 mb-4">
                Notas
              </h3>
              <p className="text-sm text-gray-900 whitespace-pre-wrap">{guest.notes}</p>
            </div>
          )}

          {/* Medical Information */}
          {((guest.allergies && guest.allergies.length > 0) || 
            (guest.dietaryRestrictions && guest.dietaryRestrictions.length > 0) || 
            guest.medicalNotes) && (
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2 mb-4">
                Información Médica
              </h3>
              
              {guest.allergies && guest.allergies.length > 0 && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-500">Alergias</label>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {guest.allergies.map((allergy, index) => (
                      <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        {allergy}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {guest.dietaryRestrictions && guest.dietaryRestrictions.length > 0 && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-500">Restricciones Dietéticas</label>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {guest.dietaryRestrictions.map((restriction, index) => (
                      <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        {restriction}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {guest.medicalNotes && (
                <div>
                  <label className="block text-sm font-medium text-gray-500">Notas Médicas</label>
                  <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{guest.medicalNotes}</p>
                </div>
              )}
            </div>
          )}

          {/* Timestamps */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-500">
              <div>
                <span className="font-medium">Registrado:</span> {new Date(guest.createdAt).toLocaleString('es-CR')}
              </div>
              <div>
                <span className="font-medium">Última actualización:</span> {new Date(guest.updatedAt).toLocaleString('es-CR')}
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      {/* {isEditModalOpen && (
        <EditGuestModal
          isOpen={isEditModalOpen}
          onClose={handleEditClose}
          onSuccess={handleEditSuccess}
          guest={guest}
        />
      )} */}
    </>
  );
};
