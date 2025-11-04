/**
 * Skeleton Component - Loading state primitives
 * 
 * Componentes primitivos para crear skeletons de carga consistentes.
 * Usa tokens de diseño para colores y animaciones.
 */

import React from 'react';

/**
 * Base skeleton with pulse animation
 */
interface SkeletonBaseProps {
  className?: string;
  children?: React.ReactNode;
}

const SkeletonBase: React.FC<SkeletonBaseProps> = ({ className = '', children }) => {
  return (
    <div 
      className={`animate-pulse ${className}`}
      role="status"
      aria-label="Loading..."
    >
      {children}
    </div>
  );
};

/**
 * Text line skeleton
 */
interface SkeletonTextProps {
  /**
   * Width of text line
   * @default 'full'
   */
  width?: 'full' | '3/4' | '2/3' | '1/2' | '1/3' | '1/4' | string;
  
  /**
   * Height variant
   * @default 'base'
   */
  height?: 'sm' | 'base' | 'lg' | 'xl';
  
  /**
   * Additional CSS classes
   */
  className?: string;
}

const heightClasses = {
  sm: 'h-3',
  base: 'h-4',
  lg: 'h-5',
  xl: 'h-6',
};

const widthClasses = {
  full: 'w-full',
  '3/4': 'w-3/4',
  '2/3': 'w-2/3',
  '1/2': 'w-1/2',
  '1/3': 'w-1/3',
  '1/4': 'w-1/4',
};

const SkeletonText: React.FC<SkeletonTextProps> = ({ 
  width = 'full', 
  height = 'base',
  className = '' 
}) => {
  const widthClass = widthClasses[width as keyof typeof widthClasses] || width;
  const heightClass = heightClasses[height];
  
  return (
    <SkeletonBase className={`${widthClass} ${heightClass} bg-slate-200 rounded ${className}`} />
  );
};

/**
 * Row skeleton (multiple text lines)
 */
interface SkeletonRowProps {
  /**
   * Number of lines to render
   * @default 3
   */
  lines?: number;
  
  /**
   * Gap between lines
   * @default '3'
   */
  gap?: '2' | '3' | '4';
  
  /**
   * Additional CSS classes
   */
  className?: string;
}

const SkeletonRow: React.FC<SkeletonRowProps> = ({ 
  lines = 3, 
  gap = '3',
  className = '' 
}) => {
  return (
    <div className={`space-y-${gap} ${className}`}>
      {Array.from({ length: lines }).map((_, index) => {
        // Vary widths for realistic appearance
        const width = index === lines - 1 ? '2/3' : 'full';
        return <SkeletonText key={index} width={width} />;
      })}
    </div>
  );
};

/**
 * Card skeleton (container with border and padding)
 */
interface SkeletonCardProps {
  /**
   * Card content
   */
  children?: React.ReactNode;
  
  /**
   * Show header skeleton
   * @default false
   */
  header?: boolean;
  
  /**
   * Number of content lines
   * @default 0
   */
  lines?: number;
  
  /**
   * Additional CSS classes
   */
  className?: string;
}

const SkeletonCard: React.FC<SkeletonCardProps> = ({ 
  children, 
  header = false,
  lines = 0,
  className = '' 
}) => {
  return (
    <div className={`bg-white border-2 border-slate-200 rounded-2xl p-6 shadow-sm ${className}`}>
      {header && (
        <div className="mb-4">
          <SkeletonText width="1/3" height="lg" />
        </div>
      )}
      
      {lines > 0 && <SkeletonRow lines={lines} />}
      
      {children}
    </div>
  );
};

/**
 * Circle skeleton (for avatars, icons)
 */
interface SkeletonCircleProps {
  /**
   * Size of circle
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  
  /**
   * Additional CSS classes
   */
  className?: string;
}

const sizeClasses = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-12 w-12',
  xl: 'h-16 w-16',
};

const SkeletonCircle: React.FC<SkeletonCircleProps> = ({ 
  size = 'md',
  className = '' 
}) => {
  const sizeClass = sizeClasses[size];
  
  return (
    <SkeletonBase className={`${sizeClass} bg-slate-200 rounded-full ${className}`} />
  );
};

/**
 * Button skeleton
 */
interface SkeletonButtonProps {
  /**
   * Button size
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';
  
  /**
   * Button width
   * @default '24'
   */
  width?: string;
  
  /**
   * Additional CSS classes
   */
  className?: string;
}

const buttonSizeClasses = {
  sm: 'h-8',
  md: 'h-10',
  lg: 'h-12',
};

const SkeletonButton: React.FC<SkeletonButtonProps> = ({ 
  size = 'md',
  width = '24',
  className = '' 
}) => {
  const sizeClass = buttonSizeClasses[size];
  
  return (
    <SkeletonBase 
      className={`${sizeClass} w-${width} bg-slate-200 rounded-lg ${className}`} 
    />
  );
};

/**
 * Composite Skeleton component with subcomponents
 */
export const Skeleton = Object.assign(SkeletonBase, {
  Text: SkeletonText,
  Row: SkeletonRow,
  Card: SkeletonCard,
  Circle: SkeletonCircle,
  Button: SkeletonButton,
});

export default Skeleton;
