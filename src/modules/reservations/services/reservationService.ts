import type { SimpleReservationFormData, Reservation } from '../types/domain';
import type { AdditionalService } from '../../../types/core/domain';
import { simulateApiCall, cloneData } from '../utils/mockApi';
import { servicesData } from '../data/servicesData';
import { reservationsData } from '../data/reservationsData';

class ReservationService {
  async createReservation(reservationData: SimpleReservationFormData & { roomId: string }): Promise<Reservation> {
    // Simulate API call with realistic delay for creating a reservation
    await simulateApiCall(null, 1200);

    const reservation: Reservation = {
      ...reservationData,
      id: `res-${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      confirmationNumber: `CONF-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      // Note: Guest information will need to be added separately through the guest management system
      guest: {
        id: reservationData.guestId,
        firstName: 'Pendiente',
        lastName: 'Asignación',
        email: 'pending@example.com',
        phone: '',
        nationality: '',
        documentType: 'id_card',
        documentNumber: '',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    };

    return reservation;
  }

  async getAdditionalServices(): Promise<AdditionalService[]> {
    const services = await simulateApiCall(cloneData(servicesData), 500);
    return services;
  }

  async getServicesByCategory(category: string): Promise<AdditionalService[]> {
    const services = await simulateApiCall(cloneData(servicesData), 500);
    return services.filter(service => service.category === category);
  }

  async getServiceById(serviceId: string): Promise<AdditionalService | null> {
    const services = await simulateApiCall(cloneData(servicesData), 500);
    return services.find(service => service.id === serviceId) || null;
  }

  async getReservationById(id: string): Promise<Reservation | null> {
    const reservations = await simulateApiCall(cloneData(reservationsData), 500);
    const reservation = reservations.find((r: Reservation) => r.id === id);
    return reservation || null;
  }

  async getReservationByConfirmation(confirmationNumber: string): Promise<Reservation | null> {
    const reservations = await simulateApiCall(cloneData(reservationsData), 500);
    const reservation = reservations.find((r: Reservation) => r.confirmationNumber === confirmationNumber);
    return reservation || null;
  }

  async getAllReservations(): Promise<Reservation[]> {
    const reservations = await simulateApiCall(cloneData(reservationsData), 500);
    return reservations;
  }

  async getReservationsByDate(startDate: string, endDate?: string): Promise<Reservation[]> {
    const reservations = await simulateApiCall(cloneData(reservationsData), 500);
    
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date(startDate);
    
    const filteredReservations = reservations.filter((reservation: Reservation) => {
      const checkIn = new Date(reservation.checkInDate);
      const checkOut = new Date(reservation.checkOutDate);
      
      // Check if reservation overlaps with the date range
      return (checkIn <= end && checkOut >= start);
    });

    return filteredReservations;
  }

  async updateReservation(id: string, updates: Partial<Reservation>): Promise<Reservation | null> {
    await simulateApiCall(null, 800);
    
    const reservations = cloneData(reservationsData);
    const reservationIndex = reservations.findIndex((r: Reservation) => r.id === id);
    
    if (reservationIndex === -1) {
      return null;
    }

    const updatedReservation: Reservation = {
      ...reservations[reservationIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    return updatedReservation;
  }

  async cancelReservation(id: string): Promise<boolean> {
    await simulateApiCall(null, 600);
    
    const updatedReservation = await this.updateReservation(id, { 
      status: 'cancelled',
      updatedAt: new Date().toISOString()
    });

    return updatedReservation !== null;
  }

  async updateReservationStatus(id: string, status: Reservation['status']): Promise<Reservation | null> {
    return this.updateReservation(id, { status });
  }

  async searchReservations(query: {
    guestName?: string;
    email?: string;
    confirmationNumber?: string;
    status?: Reservation['status'];
    checkInDate?: string;
    checkOutDate?: string;
  }): Promise<Reservation[]> {
    const reservations = await simulateApiCall(cloneData(reservationsData), 500);
    
    return reservations.filter((reservation: Reservation) => {
      const matchesGuestName = !query.guestName || 
        (reservation.guest?.firstName?.toLowerCase().includes(query.guestName.toLowerCase()) ||
         reservation.guest?.lastName?.toLowerCase().includes(query.guestName.toLowerCase()));
      
      const matchesEmail = !query.email || 
        reservation.guest?.email?.toLowerCase().includes(query.email.toLowerCase());
      
      const matchesConfirmation = !query.confirmationNumber || 
        reservation.confirmationNumber.toLowerCase().includes(query.confirmationNumber.toLowerCase());
      
      const matchesStatus = !query.status || reservation.status === query.status;
      
      const matchesCheckIn = !query.checkInDate || reservation.checkInDate === query.checkInDate;
      
      const matchesCheckOut = !query.checkOutDate || reservation.checkOutDate === query.checkOutDate;

      return matchesGuestName && matchesEmail && matchesConfirmation && 
             matchesStatus && matchesCheckIn && matchesCheckOut;
    });
  }

  async getReservationStatistics(): Promise<{
    total: number;
    byStatus: Record<Reservation['status'], number>;
    revenue: number;
    averageStay: number;
  }> {
    const reservations = await simulateApiCall(cloneData(reservationsData), 500);
    
    const stats = {
      total: reservations.length,
      byStatus: {} as Record<Reservation['status'], number>,
      revenue: 0,
      averageStay: 0
    };

    let totalNights = 0;

    reservations.forEach((reservation: Reservation) => {
      // Count by status
      stats.byStatus[reservation.status] = (stats.byStatus[reservation.status] || 0) + 1;
      
      // Calculate revenue (only for confirmed/completed reservations)
      if (reservation.status === 'confirmed' || reservation.status === 'checked_out') {
        stats.revenue += reservation.total;
      }
      
      // Calculate average stay
      totalNights += reservation.numberOfNights;
    });

    stats.averageStay = reservations.length > 0 ? totalNights / reservations.length : 0;

    return stats;
  }
}

export const reservationService = new ReservationService();
