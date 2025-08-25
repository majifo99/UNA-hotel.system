/**
 * Configuration for mock API behavior
 * This allows easy switching between different mock scenarios
 */
export const mockConfig = {
  // API delays (in milliseconds)
  delays: {
    rooms: {
      getAvailable: 800,
      getById: 300,
      checkAvailability: 300,
      getByType: 400,
      getAllTypes: 200,
    },
    reservations: {
      create: 1200,
      getById: 500,
      getByConfirmation: 600,
      getAll: 700,
      getByDateRange: 800,
      update: 900,
      cancel: 600,
    },
    services: {
      getAll: 400,
      getByCategory: 300,
      getById: 200,
    },
  },

  // Error simulation rates (0.0 = no errors, 1.0 = always error)
  errorRates: {
    rooms: 0.0,
    reservations: 0.0,
    services: 0.0,
  },

  // Room availability simulation
  roomAvailability: {
    defaultRate: 0.9, // 90% of rooms available by default
    unavailableRoomIds: [], // Specific rooms to mark as unavailable
  },

  // Business rules
  business: {
    taxRate: 0.13, // 13% IVA Costa Rica
    depositRate: 0.5, // 50% deposit required
    cancellationHours: 24, // Hours before check-in to allow free cancellation
  },

  // Feature flags for development
  features: {
    enableRealTimeAvailability: false,
    enableDynamicPricing: false,
    enableOverbooking: false,
    enableGroupDiscounts: false,
  },
} as const;

export type MockConfig = typeof mockConfig;
