/**
 * Shared Utility Types - UNA Hotel System
 * 
 * Common utility types and generic interfaces used
 * across multiple modules and components.
 * 
 * Note: LoadingState and FormState are defined in core/forms.ts
 */

// =================== COMPONENT PROPS TYPES ===================

/**
 * Standard modal props
 */
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * Standard table column definition
 */
export interface TableColumn<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
}

/**
 * Standard pagination props
 */
export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageSize?: number;
}

// =================== EVENT HANDLER TYPES ===================

/**
 * Generic event handlers
 */
export type ChangeHandler<T = string> = (value: T) => void;
export type SubmitHandler<T> = (data: T) => void | Promise<void>;
export type ClickHandler = () => void;

// =================== SEARCH AND FILTER TYPES ===================

/**
 * Generic search state
 */
export interface SearchState {
  query: string;
  filters: Record<string, any>;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Generic filter option
 */
export interface FilterOption {
  label: string;
  value: string | number | boolean;
  count?: number;
}

// =================== DATE AND TIME TYPES ===================

/**
 * Date range selector
 */
export interface DateRange {
  startDate: string;
  endDate: string;
}

/**
 * Time slot
 */
export interface TimeSlot {
  start: string;
  end: string;
  available: boolean;
}

// =================== NOTIFICATION TYPES ===================

/**
 * Toast notification
 */
export interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  persistent?: boolean;
}

// =================== THEME AND STYLING TYPES ===================

/**
 * Theme variants
 */
export type ThemeVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';

/**
 * Size variants
 */
export type SizeVariant = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
