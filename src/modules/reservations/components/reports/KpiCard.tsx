/**
 * KPI Card Component
 * 
 * Displays a single Key Performance Indicator with icon, value, and description
 */

import React from 'react';
import type { LucideIcon } from 'lucide-react';

export interface KpiCardProps {
  readonly icon: LucideIcon;
  readonly title: string;
  readonly value: string | number;
  readonly subtitle?: string;
  readonly color: string;
  readonly isLoading?: boolean;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  icon: Icon,
  title,
  value,
  subtitle,
  color,
  isLoading = false
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-neutral-200 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <div 
              className="p-2 rounded-lg"
              style={{ backgroundColor: `${color}15` }}
            >
              <Icon 
                className="w-6 h-6" 
                style={{ color }}
              />
            </div>
            <h3 className="text-sm font-medium text-neutral-600">
              {title}
            </h3>
          </div>
          
          {isLoading ? (
            <div className="animate-pulse">
              <div className="h-8 bg-neutral-200 rounded w-24 mb-2" />
              <div className="h-4 bg-neutral-200 rounded w-32" />
            </div>
          ) : (
            <>
              <p className="text-3xl font-bold text-neutral-900 mb-1">
                {value}
              </p>
              {subtitle && (
                <p className="text-sm text-neutral-500">
                  {subtitle}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
