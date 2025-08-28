import type { Guest } from '../types';

export const mockGuests: Guest[] = [
  {
    id: '1',
    firstName: 'Juan',
    lastName: 'Pérez',
    email: 'juan.perez@email.com',
    phone: '+506 8888-9999',
    nationality: 'CR',
    documentType: 'id_card',
    documentNumber: '1-1234-5678',
    isActive: true,
    createdAt: '2025-08-20T10:00:00Z',
    updatedAt: '2025-08-20T10:00:00Z'
  },
  {
    id: '2',
    firstName: 'María',
    lastName: 'González',
    email: 'maria.gonzalez@email.com',
    phone: '+1 555-0123',
    nationality: 'US',
    documentType: 'passport',
    documentNumber: 'US123456789',
    isActive: true,
    createdAt: '2025-08-21T15:30:00Z',
    updatedAt: '2025-08-21T15:30:00Z'
  },
  {
    id: '3',
    firstName: 'Carlos',
    lastName: 'Rodríguez',
    email: 'carlos.rodriguez@email.com',
    phone: '+506 7777-8888',
    nationality: 'CR',
    documentType: 'id_card',
    documentNumber: '2-2345-6789',
    vipStatus: true,
    isActive: true,
    createdAt: '2025-08-22T09:15:00Z',
    updatedAt: '2025-08-22T09:15:00Z'
  },
  {
    id: '4',
    firstName: 'Sophie',
    lastName: 'Martin',
    email: 'sophie.martin@email.com',
    phone: '+33 1 23 45 67 89',
    nationality: 'FR',
    documentType: 'passport',
    documentNumber: 'FR987654321',
    isActive: true,
    createdAt: '2025-08-23T14:20:00Z',
    updatedAt: '2025-08-23T14:20:00Z'
  }
];
