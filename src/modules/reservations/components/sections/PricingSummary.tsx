import React from 'react';

interface PricingSummaryProps {
  pricing: {
    subtotal: number;
    servicesTotal: number;
    taxes: number;
    total: number;
    depositRequired: number;
    numberOfNights: number;
  };
}

export const PricingSummary: React.FC<PricingSummaryProps> = ({ pricing }) => {
  if (pricing.total <= 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-between">
        <span className="text-gray-600">
          Habitación ({pricing.numberOfNights} noche{pricing.numberOfNights !== 1 ? 's' : ''})
        </span>
        <span className="font-medium">₡{pricing.subtotal.toLocaleString()}</span>
      </div>
      
      {pricing.servicesTotal > 0 && (
        <div className="flex justify-between">
          <span className="text-gray-600">Servicios adicionales</span>
          <span className="font-medium">₡{pricing.servicesTotal.toLocaleString()}</span>
        </div>
      )}
      
      <div className="flex justify-between">
        <span className="text-gray-600">Impuestos (13%)</span>
        <span className="font-medium">₡{pricing.taxes.toLocaleString()}</span>
      </div>
      
      <div className="border-t pt-3">
        <div className="flex justify-between text-lg font-semibold">
          <span>Total</span>
          <span className="text-green-600">₡{pricing.total.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-600 mt-1">
          <span>Depósito requerido (50%)</span>
          <span>₡{pricing.depositRequired.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};
