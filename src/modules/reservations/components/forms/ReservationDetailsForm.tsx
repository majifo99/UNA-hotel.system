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

// Presentational subcomponents hoisted to top-level to avoid nested component definitions
const HelpOrError: React.FC<{ id?: string; error?: string; help?: string }> = ({ id, error, help }) => (
  <>
    {error ? (
      <p id={id} className="mt-1 text-sm text-red-600 flex items-start">
        <svg className="h-4 w-4 mt-0.5 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        {error}
      </p>
    ) : (
      help ? <p id={id} className="mt-1 text-sm text-gray-500">{help}</p> : null
    )}
  </>
);

const DateField: React.FC<{
  label: string;
  value: string;
  min?: string;
  max?: string;
  error?: string;
  id?: string;
  onChange: (v: string) => void;
}> = ({ label, value, min, max, error, onChange, id }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
    <input
      type="date"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      min={min}
      max={max}
      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors ${
        error ? 'border-red-500 focus:ring-red-500 bg-red-50' : 'border-gray-300 focus:ring-blue-500'
      }`}
      aria-describedby={error ? id : undefined}
    />
    <HelpOrError id={id} error={error} />
  </div>
);

const NumberField: React.FC<{
  label: string;
  min?: number;
  max?: number;
  value: number | undefined;
  placeholder?: string;
  error?: string;
  help?: string;
  onChange: (v: number) => void;
}> = ({ label, min, max, value, placeholder, error, help, onChange }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
    <div className="relative">
      <input
        type="number"
        min={min}
        max={max}
        value={value ?? ''}
        onChange={(e) => onChange(Number.parseInt(e.target.value) || 0)}
        placeholder={placeholder}
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors ${
          error ? 'border-red-500 focus:ring-red-500 bg-red-50' : 'border-gray-300 focus:ring-blue-500'
        }`}
      />
    </div>
    <HelpOrError id={undefined} error={error} help={help} />
  </div>
);

const NightInfo: React.FC<{ numberOfNights: number }> = ({ numberOfNights }) => (
  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
    <div className="flex items-center">
      <svg className="h-5 w-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <p className="text-sm text-blue-700">
        <span className="font-medium">Duración de estadía:</span> {numberOfNights} noche{numberOfNights !== 1 ? 's' : ''}
      </p>
      {numberOfNights > 7 && (
        <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Estadía extendida</span>
      )}
    </div>
  </div>
);

export const ReservationDetailsForm: React.FC<ReservationDetailsFormProps> = ({ formData, errors, onFieldChange }) => {
  // Helpers: dates
  const today = new Date().toISOString().split('T')[0];
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 1);
  const maxDateString = maxDate.toISOString().split('T')[0];
  const minCheckOutDate = formData.checkInDate
    ? new Date(new Date(formData.checkInDate).getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    : today;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DateField label="Fecha de Entrada *" value={formData.checkInDate} min={today} max={maxDateString} error={errors.checkInDate} id="checkin-error" onChange={(v) => onFieldChange('checkInDate', v)} />
        <DateField label="Fecha de Salida *" value={formData.checkOutDate} min={minCheckOutDate} max={maxDateString} error={errors.checkOutDate} id="checkout-error" onChange={(v) => onFieldChange('checkOutDate', v)} />
        <div className="md:col-span-1">
          <NumberField label="Adultos *" min={1} max={8} value={formData.numberOfAdults} placeholder="Ej: 2" error={errors.numberOfAdults} help="Número de huéspedes adultos (1-8)" onChange={(v) => onFieldChange('numberOfAdults', v)} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
        <div>
          <NumberField label="Niños" min={0} max={6} value={formData.numberOfChildren} placeholder="Ej: 1" error={errors.numberOfChildren} help="Número de niños (0-6) - Opcional" onChange={(v) => onFieldChange('numberOfChildren', v)} />
        </div>

        <div>
          <NumberField label="Bebés" min={0} max={4} value={formData.numberOfInfants} placeholder="Ej: 1" error={errors.numberOfInfants} help="Bebés (0-2). Confirme si requiere cuna." onChange={(v) => onFieldChange('numberOfInfants', v)} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Total de Huéspedes</label>
          <div className="relative">
            <input type="number" value={formData.numberOfGuests} readOnly className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-700 cursor-not-allowed" aria-describedby="total-guests-help" />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <HelpOrError error={errors.numberOfGuests} help={"Se calcula automáticamente (adultos + niños + bebés)"} />
        </div>
      </div>

  {formData.numberOfNights > 0 && <NightInfo numberOfNights={formData.numberOfNights} />}

      {!errors.checkInDate && !errors.checkOutDate && !errors.numberOfAdults && !errors.numberOfChildren && !errors.numberOfGuests && (
        <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center">
            <svg className="h-4 w-4 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-green-700">Información de reserva válida</p>
          </div>
        </div>
      )}
    </>
  );
};
