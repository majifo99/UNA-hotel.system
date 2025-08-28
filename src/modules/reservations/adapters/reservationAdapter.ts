import type { Reservation as CoreReservation } from '../../../types/core';
import type { Reservation as LegacyReservation } from '../types/reservations/Reservation';

/**
 * Adapts legacy Reservation objects to the new core Reservation interface
 */
export const reservationAdapter = {
  /**
   * Converts a legacy Reservation to the new core Reservation format
   */
  toCoreReservation(legacy: LegacyReservation): CoreReservation {
    return {
      ...legacy,
      guestId: legacy.guest?.id || 'unknown', // Map guest.id to guestId
      roomId: legacy.roomId || 'unknown', // Ensure roomId is not undefined
    };
  },

  /**
   * Converts a core Reservation to the legacy Reservation format
   */
  toLegacyReservation(core: CoreReservation): LegacyReservation {
    // Remove guestId since legacy format uses guest object directly
    const { guestId, ...legacyReservation } = core;
    return legacyReservation as LegacyReservation;
  },

  /**
   * Converts an array of legacy Reservations to core Reservations
   */
  toCoreReservations(legacyReservations: LegacyReservation[]): CoreReservation[] {
    return legacyReservations.map(this.toCoreReservation);
  },

  /**
   * Converts an array of core Reservations to legacy Reservations
   */
  toLegacyReservations(coreReservations: CoreReservation[]): LegacyReservation[] {
    return coreReservations.map(this.toLegacyReservation);
  }
};
