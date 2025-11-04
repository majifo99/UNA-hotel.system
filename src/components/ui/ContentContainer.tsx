/**
 * ContentContainer Component
 * 
 * Standardized content container for consistent layout
 * - Max width constraint
 * - Responsive padding
 * - Optional background color
 */

import React from 'react';

interface ContentContainerProps {
  /** Content to display */
  readonly children: React.ReactNode;
  /** Max width constraint (default: 7xl) */
  readonly maxWidth?: 'none' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full';
  /** Optional className for customization */
  readonly className?: string;
  /** Use white background card style */
  readonly card?: boolean;
}

export const ContentContainer: React.FC<ContentContainerProps> = ({
  children,
  maxWidth = '7xl',
  className = '',
  card = false
}) => {
  const maxWidthClass = maxWidth === 'none' ? '' : `max-w-${maxWidth}`;
  const cardClasses = card 
    ? 'bg-white rounded-lg shadow-sm border border-neutral-200 p-6' 
    : '';

  return (
    <div className={`${maxWidthClass} mx-auto ${cardClasses} ${className}`}>
      {children}
    </div>
  );
};
