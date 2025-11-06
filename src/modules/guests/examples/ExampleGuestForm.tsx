/**
 * Ejemplo de uso del hook useGuestForm refactorizado con Zod
 * 
 * Este archivo demuestra cómo usar el hook después de la refactorización
 * con validaciones automáticas usando Zod en lugar de validaciones manuales.
 */

import React from 'react';
import { useGuestForm } from '../hooks/useGuestForm';
import type { CreateGuestData } from '../types';

const ExampleGuestForm: React.FC = () => {
  const {
    formData,
    errors,
    handleInputChange,
    validateForm,
    resetForm
  } = useGuestForm<CreateGuestData>();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación automática con Zod - mucho más simple!
    if (validateForm()) {
      console.log('Formulario válido:', formData);
      // Aquí irían las acciones de envío
    } else {
      console.log('Errores de validación:', errors);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <input
          type="text"
          placeholder="Nombre"
          value={formData.firstName}
          onChange={(e) => handleInputChange('firstName', e.target.value)}
          className={`border p-2 rounded ${errors.firstName ? 'border-red-500' : 'border-gray-300'}`}
        />
        {errors.firstName && (
          <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
        )}
      </div>

      <div>
        <input
          type="text"
          placeholder="Primer apellido"
          value={formData.firstLastName}
          onChange={(e) => handleInputChange('firstLastName', e.target.value)}
          className={`border p-2 rounded ${errors.firstLastName ? 'border-red-500' : 'border-gray-300'}`}
        />
        {errors.firstLastName && (
          <p className="text-red-500 text-sm mt-1">{errors.firstLastName}</p>
        )}
      </div>

      <div>
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          className={`border p-2 rounded ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
        />
        {errors.email && (
          <p className="text-red-500 text-sm mt-1">{errors.email}</p>
        )}
      </div>

      <div>
        <input
          type="tel"
          placeholder="Teléfono"
          value={formData.phone}
          onChange={(e) => handleInputChange('phone', e.target.value)}
          className={`border p-2 rounded ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
        />
        {errors.phone && (
          <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
        )}
      </div>

      <div>
        <input
          type="text"
          placeholder="Número de documento"
          value={formData.documentNumber}
          onChange={(e) => handleInputChange('documentNumber', e.target.value)}
          className={`border p-2 rounded ${errors.documentNumber ? 'border-red-500' : 'border-gray-300'}`}
        />
        {errors.documentNumber && (
          <p className="text-red-500 text-sm mt-1">{errors.documentNumber}</p>
        )}
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Validar y Enviar
        </button>
        
        <button
          type="button"
          onClick={resetForm}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          Resetear
        </button>
      </div>
    </form>
  );
};

export default ExampleGuestForm;