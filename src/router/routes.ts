/**
 * Application Routes Configuration
 * 
 * Centralized route definitions for the UNA Hotel System.
 * This file serves as a single source of truth for all application routes.
 * 
 * Benefits:
 * - Type safety for route parameters
 * - Easy maintenance and updates
 * - Consistent route naming
 * - Auto-completion in IDEs
 */

/**
 * Main application routes
 */
export const ROUTES = {
  // Dashboard and Home
  HOME: '/',
  
  // Front Desk Module
  FRONTDESK: {
    BASE: '/frontdesk',
    CHECKIN: '/frontdesk/checkin',
    CHECKOUT: '/frontdesk/checkout',
    ROOM_CHANGE: '/frontdesk/room-change',
    DASHBOARD: '/frontdesk/dashboard',
    REGISTER: '/frontdesk/register',
  },

  // Reservations Module
  RESERVATIONS: {
    // Base path for reservations module
    BASE: '/reservations',
    
    // Create new reservation
    CREATE: '/reservations/create',
    
    // List all reservations
    LIST: '/reservations',
    
    // View/Edit specific reservation (future implementation)
    DETAIL: (id: string) => `/reservations/${id}`,
    
    // Reservation reports (future implementation)
    REPORTS: '/reservations/reports',
  },
  
  // Rooms Module (future implementation)
  ROOMS: {
    BASE: '/rooms',
    LIST: '/rooms',
    DETAIL: (id: string) => `/rooms/${id}`,
    CREATE: '/rooms/create',
    AVAILABILITY: '/rooms/availability',
  },
  
  // Guests Module (future implementation)
  GUESTS: {
    BASE: '/guests',
    LIST: '/guests',
    DETAIL: (id: string) => `/guests/${id}`,
    CREATE: '/guests/create',
    SEARCH: '/guests/search',
    PROFILE: (id: string) => `/guests/${id}`,
  },
  
  // Payments Module (future implementation)
  PAYMENTS: {
    BASE: '/payments',
    LIST: '/payments',
    DETAIL: (id: string) => `/payments/${id}`,
    PROCESS: '/payments/process',
    REPORTS: '/payments/reports',
  },
  
  // Reports Module (future implementation)
  REPORTS: {
    BASE: '/reports',
    DASHBOARD: '/reports',
    OCCUPANCY: '/reports/occupancy',
    REVENUE: '/reports/revenue',
    GUESTS: '/reports/guests',
  },
  
  // Documents Module (future implementation)
  DOCUMENTS: {
    BASE: '/documents',
    LIST: '/documents',
    CONTRACTS: '/documents/contracts',
    INVOICES: '/documents/invoices',
  },
  
  // System Settings (future implementation)
  SETTINGS: {
    BASE: '/settings',
    GENERAL: '/settings/general',
    USERS: '/settings/users',
    PERMISSIONS: '/settings/permissions',
    INTEGRATIONS: '/settings/integrations',
  },

  // Housekeeping Module
  HOUSEKEEPING: {
    BASE: '/housekeeping',
    DASHBOARD: '/housekeeping',
    TASKS: '/housekeeping/tasks',
    REPORTS: '/housekeeping/reports',
  },

  // Maintenance Module
  MANTENIMIENTO: {
    BASE: '/mantenimiento',
    DASHBOARD: '/mantenimiento/dashboard',
    SOLICITUDES: '/mantenimiento/solicitudes',
    PREVENTIVO: '/mantenimiento/preventivo',
    REPORTS: '/mantenimiento/reports',
  },

} as const;




/**
 * Route parameter types for type safety
 */
export interface RouteParams {
  // Reservation routes
  reservationId: string;
  
  // Room routes
  roomId: string;
  
  // Guest routes
  guestId: string;
  
  // Payment routes
  paymentId: string;
}

/**
 * Helper function to build routes with parameters
 * 
 * @param route - Route template string
 * @param params - Route parameters
 * @returns Complete route string
 * 
 * Example:
 * buildRoute('/reservations/:id', { id: '123' }) => '/reservations/123'
 */
export function buildRoute(route: string, params: Record<string, string>): string {
  let builtRoute = route;
  
  Object.entries(params).forEach(([key, value]) => {
    builtRoute = builtRoute.replace(`:${key}`, value);
  });
  
  return builtRoute;
}

/**
 * Navigation helper for programmatic navigation
 * Use with React Router's useNavigate hook
 * 
 * Example:
 * const navigate = useNavigate();
 * navigate(ROUTES.RESERVATIONS.CREATE);
 */
export const navigation = {
  toHome: () => ROUTES.HOME,
  toReservations: () => ROUTES.RESERVATIONS.BASE,
  toCreateReservation: () => ROUTES.RESERVATIONS.CREATE,
  toReservationDetail: (id: string) => ROUTES.RESERVATIONS.DETAIL(id),
  toRooms: () => ROUTES.ROOMS.BASE,
  toGuests: () => ROUTES.GUESTS.BASE,
  toSettings: () => ROUTES.SETTINGS.BASE,
  toHousekeeping: () => ROUTES.HOUSEKEEPING.BASE,
  toMantenimiento: () => ROUTES.MANTENIMIENTO.BASE,
} as const;
