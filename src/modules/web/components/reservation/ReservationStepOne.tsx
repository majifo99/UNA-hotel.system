/**
 * Reservation Step One - Dates and Guests
 * 
 * First step of the reservation process: select dates and number of guests
 */

import React, { useState } from 'react';

interface StepOneData {
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  babies: number;
}

interface ReservationStepOneProps {
  readonly initialData: StepOneData;
  readonly onComplete: (data: StepOneData) => void;
}

interface FormErrors {
  checkIn?: string;
  checkOut?: string;
  adults?: string;
  children?: string;
  babies?: string;
}

export function ReservationStepOne({ initialData, onComplete }: ReservationStepOneProps) {
  const [formData, setFormData] = useState<StepOneData>(initialData);
  const [errors, setErrors] = useState<FormErrors>({});

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];
  
  // Get tomorrow's date as minimum checkout
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Check if check-in date is provided and not in the past
    if (!formData.checkIn) {
      newErrors.checkIn = 'Seleccione la fecha de entrada';
    } else if (formData.checkIn < today) {
      newErrors.checkIn = 'La fecha de entrada no puede ser en el pasado';
    }

    // Check if check-out date is provided and after check-in
    if (!formData.checkOut) {
      newErrors.checkOut = 'Seleccione la fecha de salida';
    } else if (formData.checkOut <= formData.checkIn) {
      newErrors.checkOut = 'La fecha de salida debe ser posterior a la entrada';
    }

    // Check if at least one adult
    if (formData.adults < 1) {
      newErrors.adults = 'Debe haber al menos 1 adulto';
    }

    // Check if children count is valid
    if (formData.children < 0) {
      newErrors.children = 'El número de niños no puede ser negativo';
    }

    // Check if babies count is valid
    if (formData.babies < 0) {
      newErrors.babies = 'El número de bebés no puede ser negativo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onComplete(formData);
    }
  };

  const updateField = (field: keyof StepOneData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Auto-set minimum checkout date when checkin changes
  const handleCheckInChange = (value: string) => {
    updateField('checkIn', value);
    if (value && (!formData.checkOut || formData.checkOut <= value)) {
      const nextDay = new Date(value);
      nextDay.setDate(nextDay.getDate() + 1);
      updateField('checkOut', nextDay.toISOString().split('T')[0]);
    }
  };

  // Calculate number of nights
  const calculateNights = (): number => {
    if (formData.checkIn && formData.checkOut) {
      const checkIn = new Date(formData.checkIn);
      const checkOut = new Date(formData.checkOut);
      const timeDiff = checkOut.getTime() - checkIn.getTime();
      return Math.ceil(timeDiff / (1000 * 3600 * 24));
    }
    return 0;
  };

  const nights = calculateNights();

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">¿Cuándo nos visitarás?</h2>
        <p className="text-gray-600">Selecciona las fechas de tu estadía y el número de huéspedes</p>
      </div>

      {/* Dates Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="checkIn" className="block text-sm font-medium text-gray-700 mb-2">
            Fecha de Entrada
          </label>
          <input
            type="date"
            id="checkIn"
            value={formData.checkIn}
            min={today}
            onChange={(e) => handleCheckInChange(e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-offset-2 transition-colors ${
              errors.checkIn 
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                : 'border-gray-300 focus:border-green-500 focus:ring-green-500'
            }`}
          />
          {errors.checkIn && <p className="mt-1 text-sm text-red-600">{errors.checkIn}</p>}
        </div>

        <div>
          <label htmlFor="checkOut" className="block text-sm font-medium text-gray-700 mb-2">
            Fecha de Salida
          </label>
          <input
            type="date"
            id="checkOut"
            value={formData.checkOut}
            min={formData.checkIn ? new Date(new Date(formData.checkIn).getTime() + 24*60*60*1000).toISOString().split('T')[0] : tomorrowStr}
            onChange={(e) => updateField('checkOut', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-offset-2 transition-colors ${
              errors.checkOut 
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                : 'border-gray-300 focus:border-green-500 focus:ring-green-500'
            }`}
          />
          {errors.checkOut && <p className="mt-1 text-sm text-red-600">{errors.checkOut}</p>}
        </div>
      </div>

      {/* Nights Display */}
      {nights > 0 && (
        <div className="text-center py-4 bg-green-50 rounded-lg border border-green-200">
          <p className="text-green-800 font-medium">
            {nights} {nights === 1 ? 'noche' : 'noches'} de estadía
          </p>
        </div>
      )}

      {/* Guests Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label htmlFor="adults" className="block text-sm font-medium text-gray-700 mb-2">
            Adultos
          </label>
          <div className="flex items-center border border-gray-300 rounded-lg">
            <button
              type="button"
              onClick={() => updateField('adults', Math.max(1, formData.adults - 1))}
              className="px-4 py-3 text-gray-600 hover:text-gray-800 focus:outline-none"
            >
              −
            </button>
            <input
              type="number"
              id="adults"
              value={formData.adults}
              min="1"
              max="10"
              readOnly
              className="flex-1 px-4 py-3 text-center border-0 focus:ring-0"
            />
            <button
              type="button"
              onClick={() => updateField('adults', Math.min(10, formData.adults + 1))}
              className="px-4 py-3 text-gray-600 hover:text-gray-800 focus:outline-none"
            >
              +
            </button>
          </div>
          {errors.adults && <p className="mt-1 text-sm text-red-600">{errors.adults}</p>}
        </div>

        <div>
          <label htmlFor="children" className="block text-sm font-medium text-gray-700 mb-2">
            Niños (3-12 años)
          </label>
          <div className="flex items-center border border-gray-300 rounded-lg">
            <button
              type="button"
              onClick={() => updateField('children', Math.max(0, formData.children - 1))}
              className="px-4 py-3 text-gray-600 hover:text-gray-800 focus:outline-none"
            >
              −
            </button>
            <input
              type="number"
              id="children"
              value={formData.children}
              min="0"
              max="8"
              readOnly
              className="flex-1 px-4 py-3 text-center border-0 focus:ring-0"
            />
            <button
              type="button"
              onClick={() => updateField('children', Math.min(8, formData.children + 1))}
              className="px-4 py-3 text-gray-600 hover:text-gray-800 focus:outline-none"
            >
              +
            </button>
          </div>
          {errors.children && <p className="mt-1 text-sm text-red-600">{errors.children}</p>}
        </div>

        <div>
          <label htmlFor="babies" className="block text-sm font-medium text-gray-700 mb-2">
            Bebés (0-2 años)
          </label>
          <div className="flex items-center border border-gray-300 rounded-lg">
            <button
              type="button"
              onClick={() => updateField('babies', Math.max(0, formData.babies - 1))}
              className="px-4 py-3 text-gray-600 hover:text-gray-800 focus:outline-none"
            >
              −
            </button>
            <input
              type="number"
              id="babies"
              value={formData.babies}
              min="0"
              max="4"
              readOnly
              className="flex-1 px-4 py-3 text-center border-0 focus:ring-0"
            />
            <button
              type="button"
              onClick={() => updateField('babies', Math.min(4, formData.babies + 1))}
              className="px-4 py-3 text-gray-600 hover:text-gray-800 focus:outline-none"
            >
              +
            </button>
          </div>
          {errors.babies && <p className="mt-1 text-sm text-red-600">{errors.babies}</p>}
        </div>
      </div>

      {/* Total Guests Display */}
      <div className="text-center py-3 bg-gray-50 rounded-lg">
        <p className="text-gray-800">
          Total: <span className="font-semibold">{formData.adults + formData.children + formData.babies}</span> huésped{formData.adults + formData.children + formData.babies !== 1 ? 'es' : ''}
          {(formData.children > 0 || formData.babies > 0) && (
            <span className="text-sm text-gray-600 ml-2">
              ({formData.adults} adulto{formData.adults !== 1 ? 's' : ''}
              {formData.children > 0 && `, ${formData.children} niño${formData.children !== 1 ? 's' : ''}`}
              {formData.babies > 0 && `, ${formData.babies} bebé${formData.babies !== 1 ? 's' : ''}`})
            </span>
          )}
        </p>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-6">
        <button
          type="submit"
          className="px-8 py-3 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-offset-2"
          style={{ backgroundColor: 'var(--color-darkGreen1)' }}
        >
          Continuar a Habitaciones →
        </button>
      </div>
    </form>
  );
}
