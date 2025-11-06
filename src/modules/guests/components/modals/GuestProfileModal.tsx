import React, { useState } from 'react';
import { User, Heart, Phone, Star, Edit2 } from 'lucide-react';
import { Modal } from '../../../../components/ui/Modal';
import { EditGuestModal } from './EditGuestModal';
import type { Guest } from '../../types';

interface GuestProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  guest: Guest | null;
}

export const GuestProfileModal: React.FC<GuestProfileModalProps> = ({
  isOpen,
  onClose,
  guest
}) => {
  const [isEditing, setIsEditing] = useState(false);

  if (!guest) return null;

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleEditClose = () => {
    setIsEditing(false);
  };

  const handleGuestUpdated = (_updatedGuest: Guest) => {
    // Aquí podrías actualizar el guest local si fuera necesario
    // Por ahora solo cerramos el modal de edición
    setIsEditing(false);
  };

  const renderField = (label: string, value?: string | number | boolean) => (
    <div>
      <p className="text-sm text-gray-600">{label}:</p>
      <p className="text-base text-gray-800 font-medium">
        {value !== undefined && value !== '' ? String(value) : '—'}
      </p>
    </div>
  );

  const renderList = (label: string, list: string[] = []) => (
    <div>
      <p className="text-sm text-gray-600">{label}:</p>
      <ul className="list-disc pl-5 text-gray-800">
        {list.length > 0 ? list.map(item => <li key={item}>{item}</li>) : <li>—</li>}
      </ul>
    </div>
  );

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Perfil del Huésped" size="lg">
        {/* Header con botón de edición */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0 mb-4 sm:mb-6 pb-4 border-b">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
            {guest.firstName} {guest.firstLastName} {guest.secondLastName}
          </h1>
          <button
            onClick={handleEditClick}
            className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base self-start sm:self-auto"
          >
            <Edit2 size={16} />
            <span className="hidden sm:inline">Editar</span>
            <span className="sm:hidden">Editar</span>
          </button>
        </div>
        
        <div className="space-y-6 sm:space-y-8">

        {/* Información Básica */}
        <section className="border-b pb-4 sm:pb-6">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="p-1.5 sm:p-2 bg-blue-50 rounded-lg">
              <User className="text-blue-600" size={20} />
            </div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Información Básica</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {renderField('Nombre', guest.firstName)}
            {renderField('Primer Apellido', guest.firstLastName)}
            {renderField('Segundo Apellido', guest.secondLastName)}
            {renderField('Email', guest.email)}
            {renderField('Teléfono', guest.phone)}
            {renderField('Fecha de Nacimiento', guest.dateOfBirth)}
            {renderField('Género', guest.gender)}
            {renderField('Nacionalidad', guest.nationality)}
            {renderField('Tipo de Documento', guest.documentType)}
            {renderField('Número de Documento', guest.documentNumber)}
          </div>
        </section>

        {/* Dirección */}
        <section className="border-b pb-4 sm:pb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">Dirección</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {renderField('Calle', guest.address?.street)}
            {renderField('Ciudad', guest.address?.city)}
            {renderField('Provincia/Estado', guest.address?.state)}
            {renderField('País', guest.address?.country)}
            {renderField('Código Postal', guest.address?.postalCode)}
          </div>
        </section>

        {/* Información Médica */}
        <section className="border-b pb-4 sm:pb-6">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="p-1.5 sm:p-2 bg-red-50 rounded-lg">
              <Heart className="text-red-600" size={20} />
            </div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Información Médica</h2>
          </div>
          <div className="space-y-3 sm:space-y-4">
            {renderList('Alergias', guest.allergies)}
            {renderList('Restricciones Dietéticas', guest.dietaryRestrictions)}
            {renderField('Notas Médicas', guest.medicalNotes)}
          </div>
        </section>

        {/* Contacto de Emergencia */}
        <section className="border-b pb-4 sm:pb-6">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="p-1.5 sm:p-2 bg-orange-50 rounded-lg">
              <Phone className="text-orange-600" size={20} />
            </div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Contacto de Emergencia</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {renderField('Nombre', guest.emergencyContact?.name)}
            {renderField('Relación', guest.emergencyContact?.relationship)}
            {renderField('Teléfono', guest.emergencyContact?.phone)}
            {renderField('Email', guest.emergencyContact?.email)}
          </div>
        </section>

        {/* Preferencias y Notas */}
        <section>
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="p-1.5 sm:p-2 bg-yellow-50 rounded-lg">
              <Star className="text-yellow-600" size={20} />
            </div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Notas y Preferencias</h2>
          </div>
          <div className="space-y-3 sm:space-y-4">
            {renderField('Notas del Personal', guest.notes)}
            {renderField('Cliente VIP', guest.vipStatus ? 'Sí' : 'No')}
            {renderField('Idioma Preferido', guest.preferredLanguage)}
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
    </Modal>

    {/* Modal de edición */}
    <EditGuestModal
      isOpen={isEditing}
      onClose={handleEditClose}
      guest={guest}
      onGuestUpdated={handleGuestUpdated}
    />
  </>
  );
};
