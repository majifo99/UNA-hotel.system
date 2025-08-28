import type { SimpleReservationFormData, Reservation, AdditionalService } from '../../../types/core';
import { simulateApiCall, cloneData } from '../utils/mockApi';
import { servicesData } from '../data/servicesData';
import { reservationsData } from '../data/reservationsData';
import { adaptLegacyServices } from '../adapters/serviceAdapter';
import { reservationAdapter } from '../adapters/reservationAdapter';

class ReservationService {
  async createReservation(reservationData: SimpleReservationFormData & { roomId: string }): Promise<Reservation> {
    // Simulate API call with realistic delay for creating a reservation
    await simulateApiCall(null, 1200);

    const reservation: Reservation = {
      ...reservationData,
      id: `res-${Date.now()}`,
      guestId: 'pending-guest-assignment',
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      confirmationNumber: `CONF-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      // Note: Guest information will need to be added separately through the guest management system
      guest: {
        id: 'pending-guest-assignment',
        firstName: 'Pendiente',
        lastName: 'Asignación',
        email: 'pending@example.com',
        phone: '',
        nationality: '',
        documentType: 'id_card',
        documentNumber: '',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    };

    console.log('Reservation created successfully:', reservation);
    return reservation;
  }

  async getAdditionalServices(): Promise<AdditionalService[]> {
    // Simulate API call to get all available services
    const legacyServices = await simulateApiCall(cloneData(servicesData), 400);
    return adaptLegacyServices(legacyServices);
  }

  async getServicesByCategory(category: string): Promise<AdditionalService[]> {
    const legacyServices = await simulateApiCall(cloneData(servicesData), 300);
    const adaptedServices = adaptLegacyServices(legacyServices);
    return adaptedServices.filter(service => service.category === category);
  }

  async getServiceById(serviceId: string): Promise<AdditionalService | null> {
    const legacyServices = await simulateApiCall(cloneData(servicesData), 200);
    const adaptedServices = adaptLegacyServices(legacyServices);
    return adaptedServices.find(service => service.id === serviceId) || null;
  }

  async getReservationById(id: string): Promise<Reservation | null> {
    const reservations = await simulateApiCall(cloneData(reservationsData), 500);
    const reservation = reservations.find(reservation => reservation.id === id);
    return reservation ? reservationAdapter.toCoreReservation(reservation) : null;
  }

  async getReservationByConfirmationNumber(confirmationNumber: string): Promise<Reservation | null> {
    const reservations = await simulateApiCall(cloneData(reservationsData), 600);
    const reservation = reservations.find(reservation => reservation.confirmationNumber === confirmationNumber);
    return reservation ? reservationAdapter.toCoreReservation(reservation) : null;
  }

  async getAllReservations(): Promise<Reservation[]> {
    const reservations = await simulateApiCall(cloneData(reservationsData), 700);
    return reservationAdapter.toCoreReservations(reservations);
  }

  async getReservationsByDateRange(startDate: Date, endDate: Date): Promise<Reservation[]> {
    const reservations = await simulateApiCall(cloneData(reservationsData), 800);
    
    const filteredReservations = reservations.filter(reservation => {
      const checkIn = new Date(reservation.checkInDate);
      const checkOut = new Date(reservation.checkOutDate);
      
      // Check if reservation overlaps with the date range
      return (checkIn <= endDate && checkOut >= startDate);
    });

    return reservationAdapter.toCoreReservations(filteredReservations);
  }

  async updateReservation(id: string, updates: Partial<SimpleReservationFormData>): Promise<Reservation> {
    // Simulate API call to update reservation
    await simulateApiCall(null, 900);
    
    // In a real implementation, this would update the reservation in the database
    const existingReservation = await this.getReservationById(id);
    
    if (!existingReservation) {
      throw new Error(`Reservation with id ${id} not found`);
    }

    const updatedReservation: Reservation = {
      ...existingReservation,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    console.log(`Reservation ${id} updated successfully:`, updatedReservation);
    return updatedReservation;
  }

  async cancelReservation(id: string, reason?: string): Promise<void> {
    // Simulate API call to cancel reservation
    await simulateApiCall(null, 600);
    
    console.log(`Reservation ${id} cancelled successfully. Reason: ${reason || 'No reason provided'}`);
    
    // In a real implementation, this would update the reservation status to 'cancelled'
    // and potentially process refunds based on cancellation policy
  }

  async calculateReservationTotal(
    roomPrice: number, 
    numberOfNights: number, 
    serviceIds: string[]
  ): Promise<{
    subtotal: number;
    servicesTotal: number;
    taxes: number;
    total: number;
    depositRequired: number;
  }> {
    const services = await this.getAdditionalServices();
    
    const subtotal = roomPrice * numberOfNights;
    const servicesTotal = services
      .filter(service => serviceIds.includes(service.id))
      .reduce((total, service) => total + service.price, 0);
    
    const taxes = (subtotal + servicesTotal) * 0.13; // 13% IVA Costa Rica
    const total = subtotal + servicesTotal + taxes;
    const depositRequired = total * 0.5; // 50% deposit

    return {
      subtotal,
      servicesTotal,
      taxes,
      total,
      depositRequired,
    };
  }
}

export const reservationService = new ReservationService();
