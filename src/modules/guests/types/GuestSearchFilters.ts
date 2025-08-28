import type { Guest } from './GuestInterface';

export interface GuestSearchFilters {
  query?: string;
  nationality?: string;
  documentType?: Guest['documentType'];
}
