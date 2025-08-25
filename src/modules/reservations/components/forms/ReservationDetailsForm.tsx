import React from 'react';

interface ReservationDetailsFormProps {
  formData: {
    checkInDate: string;
    checkOutDate: string;
    numberOfGuests: number;
    numberOfNights: number;
  };
  errors: {
    checkInDate?: string;
    checkOutDate?: string;
    numberOfGuests?: string;
  };
  onFieldChange: (field: 'checkInDate' | 'checkOutDate' | 'numberOfGuests', value: string | number) => void;
}

export const ReservationDetailsForm: React.FC<ReservationDetailsFormProps> = ({
  formData,
  errors,
  onFieldChange
}) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fecha de Entrada *
          </label>
          <input
            type="date"
            value={formData.checkInDate}
            onChange={(e) => onFieldChange('checkInDate', e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.checkInDate ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.checkInDate && (
            <p className="mt-1 text-sm text-red-600">{errors.checkInDate}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fecha de Salida *
          </label>
          <input
            type="date"
            value={formData.checkOutDate}
            onChange={(e) => onFieldChange('checkOutDate', e.target.value)}
            min={formData.checkInDate || new Date().toISOString().split('T')[0]}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.checkOutDate ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.checkOutDate && (
            <p className="mt-1 text-sm text-red-600">{errors.checkOutDate}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Número de Huéspedes *
          </label>
          <input
            type="number"
            min="1"
            max="10"
            value={formData.numberOfGuests}
            onChange={(e) => onFieldChange('numberOfGuests', parseInt(e.target.value) || 1)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.numberOfGuests ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.numberOfGuests && (
            <p className="mt-1 text-sm text-red-600">{errors.numberOfGuests}</p>
          )}
        </div>
      </div>

      {formData.numberOfNights > 0 && (
        <div className="mt-4 p-3 bg-blue-50 rounded-md border border-blue-200">
          <p className="text-sm text-blue-700">
            <span className="font-medium">Duración de estadía:</span> {formData.numberOfNights} noche{formData.numberOfNights !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </>
  );
};
