import type { Reservation } from '../types/domain';

export const reservationsData: Reservation[] = [
  {
    id: "res-001",
    guestId: "guest-001", // Added guestId field
    guest: {
      id: "guest-001",
      firstName: "María",
      lastName: "González",
      email: "maria.gonzalez@email.com",
      phone: "8888-1234",
      nationality: "CR",
      documentType: "id_card",
      documentNumber: "1-1234-5678",
      isActive: true,
      createdAt: "2025-08-25T10:00:00Z",
      updatedAt: "2025-08-25T10:00:00Z"
    },
    checkInDate: "2025-08-26",
    checkOutDate: "2025-08-28",
    numberOfGuests: 2,
    numberOfNights: 2,
    roomType: "double",
    roomId: "room-003",
    additionalServices: ["service-breakfast-continental", "service-spa-access"],
    subtotal: 130000,
    servicesTotal: 33500,
    taxes: 21255,
    total: 184755,
    depositRequired: 92377.5,
    specialRequests: "Habitación en piso alto con vista al mar",
    status: "confirmed",
    createdAt: "2025-08-25T10:30:00Z",
    updatedAt: "2025-08-25T10:30:00Z",
    confirmationNumber: "CONF-ABC123"
  },
  {
    id: "res-002",
    guestId: "guest-002", // Added guestId field
    guest: {
      id: "guest-002",
      firstName: "Carlos",
      lastName: "Rodríguez",
      email: "carlos.rodriguez@email.com",
      phone: "8888-5678",
      nationality: "CR",
      documentType: "passport",
      documentNumber: "P123456789",
      isActive: true,
      createdAt: "2025-08-25T14:00:00Z",
      updatedAt: "2025-08-25T14:00:00Z"
    },
    checkInDate: "2025-08-30",
    checkOutDate: "2025-09-03",
    numberOfGuests: 4,
    numberOfNights: 4,
    roomType: "family",
    roomId: "room-008",
    additionalServices: ["service-breakfast-american", "service-airport-pickup"],
    subtotal: 600000,
    servicesTotal: 83000,
    taxes: 88790,
    total: 771790,
    depositRequired: 385895,
    specialRequests: "Cuna para bebé de 1 año",
    status: "pending",
    createdAt: "2025-08-25T14:15:00Z",
    updatedAt: "2025-08-25T14:15:00Z",
    confirmationNumber: "CONF-XYZ789"
  }
];
