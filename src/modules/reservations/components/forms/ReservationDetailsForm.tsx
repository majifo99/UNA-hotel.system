import React from 'react';

interface ReservationDetailsFormProps {
  formData: {
    checkInDate: string;
    checkOutDate: string;
    numberOfAdults: number;
    numberOfChildren: number;
    numberOfInfants: number;
    numberOfGuests: number;
    numberOfNights: number;
  };
  errors: {
    checkInDate?: string;
    checkOutDate?: string;
    numberOfAdults?: string;
    numberOfChildren?: string;
    numberOfInfants?: string;
    numberOfGuests?: string;
  };
  onFieldChange: (field: 'checkInDate' | 'checkOutDate' | 'numberOfAdults' | 'numberOfChildren' | 'numberOfInfants' | 'numberOfGuests', value: string | number) => void;
}

export const ReservationDetailsForm: React.FC<ReservationDetailsFormProps> = ({
  formData,
  errors,
  onFieldChange
}) => {
  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];
  
  // Get maximum date (1 year from today)
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 1);
  const maxDateString = maxDate.toISOString().split('T')[0];

  // Calculate minimum checkout date (day after checkin)
  const minCheckOutDate = formData.checkInDate 
    ? new Date(new Date(formData.checkInDate).getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    : today;

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
            min={today}
            max={maxDateString}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors ${
              errors.checkInDate 
                ? 'border-red-500 focus:ring-red-500 bg-red-50' 
                : 'border-gray-300 focus:ring-blue-500'
            }`}
            aria-describedby={errors.checkInDate ? 'checkin-error' : undefined}
          />
          {errors.checkInDate && (
            <p id="checkin-error" className="mt-1 text-sm text-red-600 flex items-start">
              <svg className="h-4 w-4 mt-0.5 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.checkInDate}
            </p>
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
            min={minCheckOutDate}
            max={maxDateString}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors ${
              errors.checkOutDate 
                ? 'border-red-500 focus:ring-red-500 bg-red-50' 
                : 'border-gray-300 focus:ring-blue-500'
            }`}
            aria-describedby={errors.checkOutDate ? 'checkout-error' : undefined}
          />
          {errors.checkOutDate && (
            <p id="checkout-error" className="mt-1 text-sm text-red-600 flex items-start">
              <svg className="h-4 w-4 mt-0.5 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.checkOutDate}
            </p>
          )}
        </div>

        <div className="md:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Adultos *
          </label>
          <div className="relative">
            <input
              type="number"
              min="1"
              max="8"
              value={formData.numberOfAdults || ''}
              onChange={(e) => onFieldChange('numberOfAdults', parseInt(e.target.value) || 0)}
              placeholder="Ej: 2"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors ${
                errors.numberOfAdults 
                  ? 'border-red-500 focus:ring-red-500 bg-red-50' 
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
              aria-describedby={errors.numberOfAdults ? 'adults-error' : 'adults-help'}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
          {errors.numberOfAdults ? (
            <p id="adults-error" className="mt-1 text-sm text-red-600 flex items-start">
              <svg className="h-4 w-4 mt-0.5 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.numberOfAdults}
            </p>
          ) : (
            <p id="adults-help" className="mt-1 text-sm text-gray-500">
              Número de huéspedes adultos (1-8)
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Niños
          </label>
          <div className="relative">
            <input
              type="number"
              min="0"
              max="6"
              value={formData.numberOfChildren || ''}
              onChange={(e) => onFieldChange('numberOfChildren', parseInt(e.target.value) || 0)}
              placeholder="Ej: 1"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors ${
                errors.numberOfChildren 
                  ? 'border-red-500 focus:ring-red-500 bg-red-50' 
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
              aria-describedby={errors.numberOfChildren ? 'children-error' : 'children-help'}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
            </div>
          </div>
          {errors.numberOfChildren ? (
            <p id="children-error" className="mt-1 text-sm text-red-600 flex items-start">
              <svg className="h-4 w-4 mt-0.5 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.numberOfChildren}
            </p>
          ) : (
            <p id="children-help" className="mt-1 text-sm text-gray-500">
              Número de niños (0-6) - Opcional
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bebés
          </label>
          <div className="relative">
            <input
              type="number"
              min="0"
              max="4"
              value={formData.numberOfInfants || ''}
              onChange={(e) => onFieldChange('numberOfInfants', parseInt(e.target.value) || 0)}
              placeholder="Ej: 1"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors ${
                errors.numberOfInfants 
                  ? 'border-red-500 focus:ring-red-500 bg-red-50' 
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
              aria-describedby={errors.numberOfInfants ? 'infants-error' : 'infants-help'}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m-5 8h6a2 2 0 002-2V9a7 7 0 10-14 0v7a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          {errors.numberOfInfants ? (
            <p id="infants-error" className="mt-1 text-sm text-red-600 flex items-start">
              <svg className="h-4 w-4 mt-0.5 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.numberOfInfants}
            </p>
          ) : (
            <p id="infants-help" className="mt-1 text-sm text-gray-500">
              Bebés (0-2). Confirme si requiere cuna.
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Total de Huéspedes
          </label>
          <div className="relative">
            <input
              type="number"
              value={formData.numberOfGuests}
              readOnly
              className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-700 cursor-not-allowed"
              aria-describedby="total-guests-help"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          {errors.numberOfGuests ? (
            <p className="mt-1 text-sm text-red-600 flex items-start">
              <svg className="h-4 w-4 mt-0.5 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.numberOfGuests}
            </p>
          ) : (
            <p id="total-guests-help" className="mt-1 text-sm text-gray-500">
              Se calcula automáticamente (adultos + niños + bebés)
            </p>
          )}
        </div>
      </div>

      {formData.numberOfNights > 0 && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm text-blue-700">
              <span className="font-medium">Duración de estadía:</span> {formData.numberOfNights} noche{formData.numberOfNights !== 1 ? 's' : ''}
            </p>
            {formData.numberOfNights > 7 && (
              <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                Estadía extendida
              </span>
            )}
          </div>
        </div>
      )}

      {/* Validation hints */}
      {!errors.checkInDate && !errors.checkOutDate && !errors.numberOfAdults && !errors.numberOfChildren && !errors.numberOfGuests && (
        <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center">
            <svg className="h-4 w-4 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-green-700">
              Información de reserva válida
            </p>
          </div>
        </div>
      )}
    </>
  );
};
