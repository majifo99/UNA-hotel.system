/**
 * Common Reservation Form Components Index
 * 
 * Exportaciones centralizadas de componentes reutilizables.
 */

export {
  HeaderSection,
  GuestSummary,
  FormField,
  RoomSelector,
  RequestField,
  ActionButtons,
  WarningAlert,
  formatDateForInput,
} from './reservationFormComponents';

export type {
  HeaderSectionProps,
  GuestSummaryProps,
  FormFieldProps,
  RoomSelectorProps,
  RequestFieldProps,
  ActionButtonsProps,
  WarningAlertProps,
} from './reservationFormComponents';

export { StepIndicator } from './StepIndicator';
export { StepNavigation } from './StepNavigation';
export { AvailabilityStatusBadge } from './AvailabilityStatusBadge';
export { DateRangeValidationBadge } from './DateRangeValidationBadge';
export { ReservationFlowToggle } from './ReservationFlowToggle';
export type { ReservationFlowMode } from './ReservationFlowToggle';
