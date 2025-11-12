import React from 'react';
import type { AdditionalService } from '../../types';

interface ServicesSelectionProps {
  services: AdditionalService[];
  selectedServices: string[];
  onServiceToggle: (serviceId: string) => void;
}

export const ServicesSelection: React.FC<ServicesSelectionProps> = ({
  services,
  selectedServices,
  onServiceToggle
}) => {
  if (services.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {services.map((service) => (
        <div
          key={service.id}
          className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <input
            type="checkbox"
            id={service.id}
            checked={selectedServices.includes(service.id)}
            onChange={() => onServiceToggle(service.id)}
            className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <div className="flex-1">
            <label htmlFor={service.id} className="cursor-pointer">
              <div className="flex justify-between items-start">
                <h4 className="font-medium text-gray-900">{service.name}</h4>
                <span className="text-green-600 font-semibold">
                  ${service.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">{service.description}</p>
            </label>
          </div>
        </div>
      ))}
    </div>
  );
};
