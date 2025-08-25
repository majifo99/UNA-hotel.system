import type { Guest } from '../types';
import { simulateApiCall, cloneData } from '../utils/mockApi';
import { guestsData } from '../data/guestsData';

class GuestService {
  async searchGuests(query: string): Promise<Guest[]> {
    const guests = await simulateApiCall(cloneData(guestsData), 300);
    
    if (!query.trim()) return [];
    
    const searchTerm = query.toLowerCase();
    return guests.filter(guest => 
      guest.firstName.toLowerCase().includes(searchTerm) ||
      guest.lastName.toLowerCase().includes(searchTerm) ||
      guest.email.toLowerCase().includes(searchTerm) ||
      guest.phone.includes(query) ||
      guest.documentNumber.includes(query)
    );
  }

  async getGuestById(id: string): Promise<Guest | null> {
    const guests = await simulateApiCall(cloneData(guestsData), 200);
    return guests.find(guest => guest.id === id) || null;
  }

  async getGuestByDocument(documentNumber: string): Promise<Guest | null> {
    const guests = await simulateApiCall(cloneData(guestsData), 250);
    return guests.find(guest => guest.documentNumber === documentNumber) || null;
  }

  async getGuestByEmail(email: string): Promise<Guest | null> {
    const guests = await simulateApiCall(cloneData(guestsData), 250);
    return guests.find(guest => guest.email.toLowerCase() === email.toLowerCase()) || null;
  }

  async createGuest(guestData: Omit<Guest, 'id'>): Promise<Guest> {
    await simulateApiCall(null, 600);
    
    const newGuest: Guest = {
      ...guestData,
      id: `guest-${Date.now()}`,
    };

    console.log('Guest created successfully:', newGuest);
    return newGuest;
  }

  async updateGuest(id: string, updates: Partial<Omit<Guest, 'id'>>): Promise<Guest> {
    await simulateApiCall(null, 500);
    
    const existingGuest = await this.getGuestById(id);
    if (!existingGuest) {
      throw new Error(`Guest with id ${id} not found`);
    }

    const updatedGuest: Guest = {
      ...existingGuest,
      ...updates,
    };

    console.log(`Guest ${id} updated successfully:`, updatedGuest);
    return updatedGuest;
  }

  async validateGuestData(guestData: Omit<Guest, 'id'>): Promise<{
    isValid: boolean;
    errors: string[];
    duplicates: {
      email?: Guest;
      document?: Guest;
    };
  }> {
    const errors: string[] = [];
    const duplicates: { email?: Guest; document?: Guest } = {};

    // Check for duplicates
    const existingByEmail = await this.getGuestByEmail(guestData.email);
    if (existingByEmail) {
      duplicates.email = existingByEmail;
      errors.push('Ya existe un huésped con este email');
    }

    const existingByDocument = await this.getGuestByDocument(guestData.documentNumber);
    if (existingByDocument) {
      duplicates.document = existingByDocument;
      errors.push('Ya existe un huésped con este número de documento');
    }

    return {
      isValid: errors.length === 0,
      errors,
      duplicates,
    };
  }

  async getAllGuests(): Promise<Guest[]> {
    return await simulateApiCall(cloneData(guestsData), 400);
  }
}

export const guestService = new GuestService();
