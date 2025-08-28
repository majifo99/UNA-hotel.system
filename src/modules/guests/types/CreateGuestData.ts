import type { Guest } from './GuestInterface';

export interface CreateGuestData extends Omit<Guest, 'id' | 'createdAt' | 'updatedAt'> {}
