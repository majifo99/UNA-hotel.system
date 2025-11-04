/**
 * Badge Component - Sistema de insignias reutilizable
 * 
 * Componente genérico que soporta:
 * - Estados de reservación (auto-styled)
 * - Variantes manuales (success, warning, danger, info, neutral)
 * - Tamaños (sm, md)
 * - Iconos automáticos por estado o personalizados
 */

import React from 'react';
import { 
  Clock, 
  CheckCircle, 
  LogIn, 
  LogOut, 
  XCircle, 
  AlertCircle,
  HourglassIcon,
  Check,
  type LucideIcon,
} from 'lucide-react';
import { getStatusColors } from '../../core/theme/semantic';
import type { ReservationStatus } from '../../modules/reservations/types';

/**
 * Icon map for reservation statuses
 */
const statusIconMap: Record<ReservationStatus, LucideIcon> = {
  pending: Clock,
  confirmed: CheckCircle,
  checked_in: LogIn,
  checked_out: LogOut,
  cancelled: XCircle,
  no_show: AlertCircle,
  waiting: HourglassIcon,
  completed: Check,
};

/**
 * Badge variants (when not using status-based styling)
 */
export type BadgeVariant = 'neutral' | 'success' | 'warning' | 'danger' | 'info';

/**
 * Variant style configurations
 */
const variantStyles: Record<BadgeVariant, string> = {
  neutral: 'bg-slate-100 text-slate-700 border-slate-200',
  success: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  warning: 'bg-amber-100 text-amber-800 border-amber-200',
  danger: 'bg-rose-100 text-rose-800 border-rose-200',
  info: 'bg-blue-100 text-blue-800 border-blue-200',
};

/**
 * Badge size configurations
 */
const sizeStyles = {
  sm: {
    badge: 'px-2 py-0.5 text-xs gap-1',
    icon: 'h-3 w-3',
    dot: 'h-1 w-1',
  },
  md: {
    badge: 'px-2.5 py-1 text-xs gap-1',
    icon: 'h-3.5 w-3.5',
    dot: 'h-1.5 w-1.5',
  },
} as const;

export interface BadgeProps {
  /**
   * Reservation status - auto-applies semantic colors and icon
   * When set, overrides `variant`
   */
  status?: ReservationStatus;
  
  /**
   * Manual variant styling (ignored if `status` is set)
   */
  variant?: BadgeVariant;
  
  /**
   * Badge size
   * @default 'md'
   */
  size?: 'sm' | 'md';
  
  /**
   * Custom icon to display
   * - Pass a React node for custom icon
   * - Pass 'auto' to use status-based icon (only works with `status`)
   * - Pass 'dot' for a simple colored dot
   * - Pass undefined/null for no icon
   * 
   * @default 'dot'
   */
  icon?: React.ReactNode | 'auto' | 'dot' | null;
  
  /**
   * Badge content (overrides status label if provided)
   */
  children?: React.ReactNode;
  
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Badge Component
 * 
 * @example
 * ```tsx
 * // Status-based (recommended for reservations)
 * <Badge status="confirmed" icon="auto" />
 * 
 * // Manual variant
 * <Badge variant="success">Activo</Badge>
 * 
 * // Custom content and icon
 * <Badge variant="warning" icon={<AlertTriangle />}>
 *   Requiere atención
 * </Badge>
 * 
 * // Small size without icon
 * <Badge size="sm" variant="info" icon={null}>
 *   Nueva
 * </Badge>
 * ```
 */
export const Badge: React.FC<BadgeProps> = ({
  status,
  variant = 'neutral',
  size = 'md',
  icon = 'dot',
  children,
  className = '',
}) => {
  // Determine styling source
  const isStatusBased = status !== undefined;
  const statusConfig = isStatusBased ? getStatusColors(status) : null;
  
  // Build style classes
  const styleClasses = isStatusBased 
    ? statusConfig!.classes 
    : variantStyles[variant];
  
  const sizeClasses = sizeStyles[size];
  
  // Determine icon to render
  let iconElement: React.ReactNode = null;
  
  if (icon === 'dot') {
    // Simple colored dot
    iconElement = (
      <span 
        className={`block rounded-full bg-current ${sizeClasses.dot}`}
        aria-hidden="true"
      />
    );
  } else if (icon === 'auto' && isStatusBased) {
    // Auto icon based on status
    const IconComponent = statusIconMap[status!];
    iconElement = IconComponent ? (
      <IconComponent className={sizeClasses.icon} aria-hidden="true" />
    ) : null;
  } else if (icon && icon !== 'auto' && icon !== 'dot') {
    // Custom icon element
    iconElement = icon;
  }
  
  // Determine content
  const content = children ?? (isStatusBased ? statusConfig!.label : '');
  
  return (
    <span
      className={`inline-flex items-center rounded-full border font-medium uppercase tracking-wide ${sizeClasses.badge} ${styleClasses} ${className}`.trim()}
      role="status"
      aria-label={isStatusBased ? `Estado: ${statusConfig!.label}` : undefined}
    >
      {iconElement}
      {content}
    </span>
  );
};

export default Badge;
