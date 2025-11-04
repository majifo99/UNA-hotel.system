/**
 * PageHeader Component
 * 
 * Standardized page header for consistent layout across all views
 * - Title and subtitle
 * - Optional actions (buttons, filters, etc.)
 * - Responsive design
 */

import React from 'react';

interface PageHeaderProps {
  /** Main page title */
  readonly title: string;
  /** Optional subtitle or description */
  readonly subtitle?: string;
  /** Optional actions to display on the right (buttons, etc.) */
  readonly actions?: React.ReactNode;
  /** Optional className for customization */
  readonly className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  actions,
  className = ''
}) => {
  return (
    <div className={`mb-6 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 text-sm text-neutral-600">
              {subtitle}
            </p>
          )}
        </div>
        
        {actions && (
          <div className="flex items-center gap-3 flex-shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};
