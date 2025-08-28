import type { 
  Guest, 
  CreateGuestData, 
  UpdateGuestData, 
  GuestSearchFilters,
  GuestListResponse 
} from '../types';
import { mockGuests } from '../data/mockData';

export const guestService = {
  searchGuests: async (filters: GuestSearchFilters): Promise<GuestListResponse> => {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Filtrar por query si existe
    let filteredGuests = mockGuests;
    if (filters.query) {
      const query = filters.query.toLowerCase();
      filteredGuests = mockGuests.filter(guest => 
        guest.firstName.toLowerCase().includes(query) ||
        guest.lastName.toLowerCase().includes(query) ||
        guest.email.toLowerCase().includes(query) ||
        guest.documentNumber.toLowerCase().includes(query)
      );
    }

    // Filtrar por nacionalidad
    if (filters.nationality) {
      filteredGuests = filteredGuests.filter(guest => 
        guest.nationality === filters.nationality
      );
    }

    // Filtrar por tipo de documento
    if (filters.documentType) {
      filteredGuests = filteredGuests.filter(guest => 
        guest.documentType === filters.documentType
      );
    }

    return {
      guests: filteredGuests,
      total: filteredGuests.length,
      page: 1,
      limit: 50
    };
  },

  createGuest: async (guestData: CreateGuestData): Promise<Guest> => {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const newGuest: Guest = {
      ...guestData,
      id: `guest_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return newGuest;
  },

  getById: async (id: string): Promise<Guest> => {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const guest = mockGuests.find(g => g.id === id);
    if (!guest) {
      throw new Error('Huésped no encontrado');
    }
    
    return guest;
  },

  updateGuest: async (id: string, guestData: UpdateGuestData): Promise<Guest> => {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // Get existing guest to preserve createdAt
    const existingGuest = await guestService.getById(id);
    
    // En una app real, esto haría la actualización en el backend
    const updatedGuest: Guest = {
      id,
      firstName: guestData.firstName || 'Nombre',
      lastName: guestData.lastName || 'Apellido',
      email: guestData.email || 'email@example.com',
      phone: guestData.phone || '+506 0000-0000',
      nationality: guestData.nationality || 'CR',
      documentType: guestData.documentType || 'id_card',
      documentNumber: guestData.documentNumber || '0-0000-0000',
      isActive: guestData.isActive !== undefined ? guestData.isActive : true,
      createdAt: existingGuest?.createdAt || new Date().toISOString(),
      ...guestData,
      updatedAt: new Date().toISOString()
    };

    return updatedGuest;
  }
};
