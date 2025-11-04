/**
 * ReservationStatusBadge - Thin wrapper around generic Badge
 * 
 * Provides backwards compatibility for existing reservation status badges.
 * Simply delegates to the shared Badge component with status prop.
 */

import React from 'react';
import type { Reservation } from '../../../types';
import { Badge } from '../../../../../shared/ui/Badge';

interface ReservationStatusBadgeProps {
  status: Reservation['status'];
  className?: string;
}

/**
 * Badge specifically for reservation statuses
 * 
 * @example
 * ```tsx
 * <ReservationStatusBadge status="confirmed" />
 * ```
 */
export const ReservationStatusBadge: React.FC<ReservationStatusBadgeProps> = ({ 
  status, 
  className = '' 
}) => {
  return <Badge status={status} icon="dot" className={className} />;
};

export default ReservationStatusBadge;
