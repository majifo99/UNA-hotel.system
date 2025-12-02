/**
 * Availability Status Badge
 * 
 * Muestra el estado de disponibilidad en tiempo real con íconos y colores
 */

import React from 'react';
import { CheckCircle, XCircle, AlertCircle, Loader2, Info } from 'lucide-react';
import { getAvailabilityStatus, type AvailabilityCheckResult } from '../../hooks/useRoomAvailabilityCheck';

interface AvailabilityStatusBadgeProps {
  availabilityResult: AvailabilityCheckResult;
  className?: string;
}

export const AvailabilityStatusBadge: React.FC<AvailabilityStatusBadgeProps> = ({
  availabilityResult,
  className = '',
}) => {
  const status = getAvailabilityStatus(availabilityResult);

  const getIcon = () => {
    switch (status.type) {
      case 'checking':
        return <Loader2 className="w-4 h-4 animate-spin" />;
      case 'available':
        return <CheckCircle className="w-4 h-4" />;
      case 'unavailable':
        return <XCircle className="w-4 h-4" />;
      case 'error':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  const getColorClasses = () => {
    switch (status.color) {
      case 'green':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'red':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'orange':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'blue':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  return (
    <div
      className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${getColorClasses()} ${className}`}
    >
      {getIcon()}
      <span className="text-sm font-medium">{status.message}</span>
    </div>
  );
};

export default AvailabilityStatusBadge;
