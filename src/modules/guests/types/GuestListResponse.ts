import type { Guest } from './GuestInterface';

export interface GuestListResponse {
  guests: Guest[];
  total: number;
  page: number;
  limit: number;
}
