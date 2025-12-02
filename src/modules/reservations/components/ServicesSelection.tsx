import React from 'react';
import { Check, Plus } from 'lucide-react';
import type { AdditionalService } from '../../../types/core';

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
  // Agrupar servicios por categoría
  const servicesByCategory = services.reduce((acc, service) => {
    const category = service.category || 'General';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(service);
    return acc;
  }, {} as Record<string, AdditionalService[]>);

  return (
    <div className="space-y-6">
      {Object.entries(servicesByCategory).map(([category, categoryServices]) => (
        <div key={category} className="space-y-3">
          <h3 className="text-md font-semibold text-gray-800 border-b border-gray-200 pb-2">
            {category}
          </h3>
          <div className="grid gap-3">
            {categoryServices.map((service) => {
              const isSelected = selectedServices.includes(service.id);
              
              return (
                <div
                  key={service.id}
                  className={`
                    border rounded-lg p-4 cursor-pointer transition-all
                    ${isSelected 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }
                  `}
                  onClick={() => onServiceToggle(service.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className={`
                          w-5 h-5 rounded-md border-2 flex items-center justify-center
                          ${isSelected 
                            ? 'border-blue-500 bg-blue-500' 
                            : 'border-gray-300'
                          }
                        `}>
                          {isSelected && <Check size={12} className="text-white" />}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{service.name}</h4>
                          <p className="text-sm text-gray-600">{service.description || 'Sin descripción'}</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-semibold text-gray-900">
                        ${service.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      <span className="text-sm text-gray-500 block">por día</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
      
      {services.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Plus size={48} className="mx-auto text-gray-300 mb-4" />
          <p>No hay servicios disponibles</p>
        </div>
      )}
    </div>
  );
};
