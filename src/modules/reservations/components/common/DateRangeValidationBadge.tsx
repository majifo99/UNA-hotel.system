/**
 * Date Range Validation Badge
 * 
 * Muestra el resultado de la validación de fechas con formato visual
 */

import React from 'react';
import { Calendar, AlertCircle, CheckCircle, Info } from 'lucide-react';
import type { DateValidationResult } from '../../utils/dateValidation';
import { formatDateRange } from '../../utils/dateValidation';

interface DateRangeValidationBadgeProps {
  checkInDate: string | null;
  checkOutDate: string | null;
  validationResult: DateValidationResult;
  className?: string;
}

export const DateRangeValidationBadge: React.FC<DateRangeValidationBadgeProps> = ({
  checkInDate,
  checkOutDate,
  validationResult,
  className = '',
}) => {
  if (!checkInDate || !checkOutDate) {
    return (
      <div className={`flex items-start gap-2 p-3 bg-gray-50 border border-gray-200 rounded-lg ${className}`}>
        <Calendar size={18} className="text-gray-400 mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-600">
            Seleccione las fechas de check-in y check-out
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (!validationResult.isValid && validationResult.error) {
    return (
      <div className={`flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg ${className}`}>
        <AlertCircle size={18} className="text-red-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-red-800 mb-1">
            {validationResult.error}
          </p>
          {validationResult.suggestedFix && (
            <p className="text-xs text-red-700">
              💡 {validationResult.suggestedFix}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Warning state
  if (validationResult.warning) {
    return (
      <div className={`flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg ${className}`}>
        <Info size={18} className="text-yellow-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-yellow-800 mb-1">
            {formatDateRange(checkInDate, checkOutDate)}
          </p>
          <p className="text-xs text-yellow-700">
            ⚠️ {validationResult.warning}
          </p>
          {validationResult.suggestedFix && (
            <p className="text-xs text-yellow-600 mt-1">
              💡 {validationResult.suggestedFix}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Valid state
  return (
    <div className={`flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg ${className}`}>
      <CheckCircle size={18} className="text-green-600 mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-green-800">
          {formatDateRange(checkInDate, checkOutDate)}
        </p>
        <p className="text-xs text-green-700 mt-0.5">
          ✓ Rango de fechas válido
        </p>
      </div>
    </div>
  );
};

export default DateRangeValidationBadge;
