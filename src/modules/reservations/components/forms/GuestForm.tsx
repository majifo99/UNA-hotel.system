import React from 'react';
import type { Guest } from '../../types';

interface GuestFormProps {
  formData: {
    firstName: string;
    firstLastName: string;
    email: string;
    phone: string;
    documentType: 'passport' | 'id' | 'license';
    documentNumber: string;
  };
  errors: Partial<Record<keyof Guest, string>>;
  onFieldChange: (field: keyof Guest, value: string) => void;
}

export const GuestForm: React.FC<GuestFormProps> = ({
  formData,
  errors,
  onFieldChange
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nombre *
        </label>
        <input
          type="text"
          value={formData.firstName}
          onChange={(e) => onFieldChange('firstName', e.target.value)}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.firstName ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Ingrese el nombre"
        />
        {errors.firstName && (
          <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Apellido *
        </label>
        <input
          type="text"
          value={formData.firstLastName}
          onChange={(e) => onFieldChange('firstLastName', e.target.value)}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.firstLastName ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Ingrese el apellido"
        />
        {errors.firstLastName && (
          <p className="mt-1 text-sm text-red-600">{errors.firstLastName}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email *
        </label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => onFieldChange('email', e.target.value)}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.email ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="ejemplo@correo.com"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Teléfono *
        </label>
        <input
          type="tel"
          value={formData.phone}
          onChange={(e) => onFieldChange('phone', e.target.value)}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.phone ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="8888-8888"
        />
        {errors.phone && (
          <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tipo de Documento
        </label>
        <select
          value={formData.documentType}
          onChange={(e) => onFieldChange('documentType', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="id">Cédula</option>
          <option value="passport">Pasaporte</option>
          <option value="license">Licencia</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Número de Documento *
        </label>
        <input
          type="text"
          value={formData.documentNumber}
          onChange={(e) => onFieldChange('documentNumber', e.target.value)}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.documentNumber ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Número de documento"
        />
        {errors.documentNumber && (
          <p className="mt-1 text-sm text-red-600">{errors.documentNumber}</p>
        )}
      </div>
    </div>
  );
};
