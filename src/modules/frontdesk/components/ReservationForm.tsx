import { useState } from 'react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import ReactFlagsSelect from 'react-flags-select';
import { useGuestsQuery } from '../hooks/useGuestsQuery';
import type { Guest } from '../types/guest';

const ReservationForm = () => {
  const { addGuest } = useGuestsQuery();

  const [guestData, setGuestData] = useState<Omit<Guest, 'id'>>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    nationality: '',
    identificationNumber: '',
  });

  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setGuestData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { firstName, lastName, email, phone, nationality, identificationNumber } = guestData;

    if (!firstName || !lastName || !email || !phone || !nationality || !identificationNumber) {
      alert('Completa todos los campos');
      return;
    }

    const newGuest: Guest = {
      ...guestData,
      id: `guest-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    };

    await addGuest(newGuest);
    setSuccess(true);
    resetForm();
    setTimeout(() => setSuccess(false), 3000);
  };

  const resetForm = () => {
    setGuestData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      nationality: '',
      identificationNumber: '',
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-2xl mx-auto bg-white shadow-md rounded-md p-6 space-y-6 mt-8"
    >
      <h2 className="text-2xl font-bold text-gray-800">Registrar Huésped</h2>

      <div className="grid sm:grid-cols-2 gap-4">
        <input
          name="firstName"
          value={guestData.firstName}
          onChange={handleChange}
          placeholder="Nombre"
          className="input"
          required
        />
        <input
          name="lastName"
          value={guestData.lastName}
          onChange={handleChange}
          placeholder="Apellido"
          className="input"
          required
        />
      </div>

      <input
        name="email"
        type="email"
        value={guestData.email}
        onChange={handleChange}
        placeholder="Email"
        className="input w-full"
        required
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
        <PhoneInput
          country={'cr'}
          value={guestData.phone}
          onChange={(phone) => setGuestData(prev => ({ ...prev, phone }))}
          inputClass="!w-full !py-2 !px-3 !text-base"
          containerClass="mt-1"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nacionalidad</label>
        <ReactFlagsSelect
          selected={guestData.nationality}
          onSelect={(val) => setGuestData(prev => ({ ...prev, nationality: val }))}
          placeholder="Selecciona una nacionalidad"
          searchable
        />
      </div>

      <input
        name="identificationNumber"
        value={guestData.identificationNumber}
        onChange={handleChange}
        placeholder="Identificación"
        className="input w-full"
        required
      />

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
      >
        Registrar Huésped
      </button>

      {success && (
        <p className="text-green-600 font-semibold text-center">
          🎉 Huésped registrado correctamente
        </p>
      )}
    </form>
  );
};

export default ReservationForm;
