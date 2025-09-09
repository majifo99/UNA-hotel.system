/**
 * Business Rules and Constants for Reservations Module
 * 
 * Centralizes all business logic constants to make them configurable
 * and maintainable across the application.
 */

// =================== TIME AND DATE CONSTANTS ===================

/** Number of milliseconds in one day */
export const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24;

/** Maximum days in advance a reservation can be made (1 year) */
export const MAX_DAYS_IN_ADVANCE = 365;

/** Minimum days in advance required for a reservation */
export const MIN_DAYS_IN_ADVANCE = 0; // Same day reservations allowed

// =================== FINANCIAL CONSTANTS ===================

/** Costa Rica IVA (Sales Tax) rate - 13% */
export const COSTA_RICA_IVA_RATE = 0.13;

/** Default deposit percentage required for reservations - 50% */
export const DEFAULT_DEPOSIT_PERCENTAGE = 0.5;

/** Alternative deposit percentages for different reservation types */
export const DEPOSIT_RATES = {
  STANDARD: 0.5,    // 50% for standard reservations
  GROUP: 0.3,       // 30% for group reservations
  CORPORATE: 0.25,  // 25% for corporate accounts
  FULL_PAYMENT: 1.0 // 100% for immediate full payment
} as const;

// =================== ROOM AND GUEST CONSTANTS ===================

/** Maximum number of guests allowed per reservation */
export const MAX_GUESTS_PER_RESERVATION = 50;

/** Maximum number of rooms that can be selected in a single reservation */
export const MAX_ROOMS_PER_RESERVATION = 20;

/** Guest capacity recommendations for room selection */
export const ROOM_CAPACITY_RECOMMENDATIONS = {
  SINGLE: 1,
  DOUBLE: 2,
  TRIPLE: 3,
  FAMILY: 4,
  SUITE: 6
} as const;

// =================== VALIDATION CONSTANTS ===================

/** Minimum length for guest names */
export const MIN_NAME_LENGTH = 2;

/** Maximum length for guest names */
export const MAX_NAME_LENGTH = 50;

/** Maximum length for special requests */
export const MAX_SPECIAL_REQUESTS_LENGTH = 500;

// =================== UTILITY FUNCTIONS ===================

/**
 * Calculates the number of days between two dates
 * @param fromDate - Start date
 * @param toDate - End date
 * @returns Number of days (can be negative if fromDate is after toDate)
 */
export const calculateDaysBetween = (fromDate: Date, toDate: Date): number => {
  return Math.ceil((toDate.getTime() - fromDate.getTime()) / MILLISECONDS_PER_DAY);
};

/**
 * Validates if a check-in date is within acceptable advance booking limits
 * @param checkInDate - The proposed check-in date
 * @param today - Current date (defaults to new Date())
 * @returns Object with validation result and details
 */
export const validateAdvanceBooking = (checkInDate: Date, today: Date = new Date()) => {
  const daysInAdvance = calculateDaysBetween(today, checkInDate);
  
  return {
    isValid: daysInAdvance >= MIN_DAYS_IN_ADVANCE && daysInAdvance <= MAX_DAYS_IN_ADVANCE,
    daysInAdvance,
    isInPast: daysInAdvance < MIN_DAYS_IN_ADVANCE,
    isTooFarInFuture: daysInAdvance > MAX_DAYS_IN_ADVANCE,
    maxDaysAllowed: MAX_DAYS_IN_ADVANCE,
    minDaysRequired: MIN_DAYS_IN_ADVANCE
  };
};

/**
 * Calculates pricing breakdown for a reservation
 * @param subtotal - Base room cost
 * @param servicesTotal - Additional services cost
 * @param taxRate - Tax rate to apply (defaults to Costa Rica IVA)
 * @param depositRate - Deposit percentage (defaults to standard rate)
 */
export const calculatePricing = (
  subtotal: number, 
  servicesTotal: number, 
  taxRate: number = COSTA_RICA_IVA_RATE,
  depositRate: number = DEFAULT_DEPOSIT_PERCENTAGE
) => {
  const beforeTax = subtotal + servicesTotal;
  const taxes = beforeTax * taxRate;
  const total = beforeTax + taxes;
  const depositRequired = total * depositRate;
  
  return {
    subtotal,
    servicesTotal,
    beforeTax,
    taxes,
    taxRate,
    total,
    depositRequired,
    depositRate,
    remaining: total - depositRequired
  };
};
