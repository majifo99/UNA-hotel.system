import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Heart, Phone, Star } from 'lucide-react';
import type { Guest } from '../../../types/guest';
import { useGuests } from '../../../hooks/useGuests';

export const GuestProfilePage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getGuestById } = useGuests();
  const [guest, setGuest] = useState<Guest | null>(null);

  useEffect(() => {
    const fetchGuest = async () => {
      if (id) {
        const data = await getGuestById(id);
        setGuest(data);
      }
    };
    fetchGuest();
  }, [id]);

  if (!guest) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

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
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-50 rounded-lg">
              <User className="text-blue-600" size={24} />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Información Básica</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {renderField('Nombre', guest.firstName)}
            {renderField('Apellido', guest.lastName)}
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
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Dirección</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {renderField('Calle', guest.address?.street)}
            {renderField('Ciudad', guest.address?.city)}
            {renderField('Provincia/Estado', guest.address?.state)}
            {renderField('País', guest.address?.country)}
            {renderField('Código Postal', guest.address?.postalCode)}
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
            {renderList('Alergias', guest.allergies)}
            {renderList('Restricciones Dietéticas', guest.dietaryRestrictions)}
            {renderField('Notas Médicas', guest.medicalNotes)}
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
            {renderField('Nombre', guest.emergencyContact?.name)}
            {renderField('Relación', guest.emergencyContact?.relationship)}
            {renderField('Teléfono', guest.emergencyContact?.phone)}
            {renderField('Email', guest.emergencyContact?.email)}
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
    </div>
  );
};
