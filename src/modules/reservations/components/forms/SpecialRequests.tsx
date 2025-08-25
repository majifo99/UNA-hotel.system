import React from 'react';

interface SpecialRequestsProps {
  value: string;
  onChange: (value: string) => void;
}

export const SpecialRequests: React.FC<SpecialRequestsProps> = ({
  value,
  onChange
}) => {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Escriba aquí cualquier solicitud especial (cama extra, piso específico, etc.)"
      rows={3}
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  );
};
