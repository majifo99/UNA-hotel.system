/**
 * FilterBadge Component
 * 
 * Displays an active filter as a removable badge
 */

import React from 'react';
import { X } from 'lucide-react';

export interface FilterBadgeProps {
  readonly label: string;
  readonly value: string;
  readonly onRemove: () => void;
}

export const FilterBadge: React.FC<FilterBadgeProps> = ({
  label,
  value,
  onRemove
}) => {
  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-100 text-primary-800 rounded-full text-sm font-medium">
      <span className="font-semibold">{label}:</span>
      <span>{value}</span>
      <button
        type="button"
        onClick={onRemove}
        className="ml-1 hover:bg-primary-200 rounded-full p-0.5 transition-colors"
        aria-label={`Remover filtro ${label}`}
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
