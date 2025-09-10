/**
 * Navigation Configuration - Single Source of Truth
 * 
 * Nueva estructura jerárquica para mejor escalabilidad:
 * 
 * SHORTCUTS PATTERN:
 * - Nivel 1: ALT + [1-9] para módulos principales
 * - Nivel 2: Después de ALT+N, presionar [1-9] para sub-opciones
 * - Nivel 3: Para futuras expansiones: ALT+N, luego [1-9], luego [1-9]
 * 
 * EJEMPLO: 
 * ALT+2 (Front Desk) → 1 (Check-in) → rápido acceso a check-in
 * ALT+3 (Habitaciones) → 1 (Ver todas) → 2 (Reportes) → etc.
 * 
 * Features:
 * - Estructura jerárquica clara
 * - Shortcuts contextuales por módulo
 * - Reportes integrados en cada módulo
 * - Escalable para nuevas funcionalidades
 * - Sin duplicaciones
 */

import type { LucideIcon } from 'lucide-react';
import { 
  Home, 
  Calendar, 
  Building2,
  Bed,
  Users,
  CreditCard,
  BrushCleaning,
  Wrench,
  BarChart3,
  FileText,
  Settings,
  CheckSquare,
  LogIn,
  LogOut,
  ClipboardList,
  DollarSign,
  TrendingUp,
  Phone,
  MapPin,
  Clock,
  Archive,
} from 'lucide-react';
import { ROUTES } from './routes';

/**
 * Navigation item type definition
 */
export interface NavigationItem {
  /** Unique identifier for the navigation item */
  id: string;
  /** Display label for the navigation item */
  label: string;
  /** Route path (from ROUTES constant) */
  path: string;
  /** Lucide icon component */
  icon: LucideIcon;
  /** Accessibility description and tooltip text */
  description: string;
  /** Category for grouping navigation items */
  category: NavigationCategory;
  /** Optional numeric shortcut sequence (e.g., [1, 2] for "1-2") */
  shortcut?: number[];
  /** Optional feature flag to control visibility */
  featureFlag?: string;
  /** Child navigation items for nested structures */
  children?: NavigationItem[];
  /** Badge text (e.g., "New", "Beta") */
  badge?: string;
}

/**
 * Navigation categories for grouping sidebar items
 */
export type NavigationCategory = 'dashboard' | 'operations' | 'management' | 'reports' | 'system';

/**
 * Configuración de categorías optimizada
 */
export const NAVIGATION_CATEGORIES: Record<NavigationCategory, {
  label: string;
  order: number;
  description: string;
}> = {
  dashboard: {
    label: 'INICIO',
    order: 1,
    description: 'Vista general y panel principal'
  },
  operations: {
    label: 'OPERACIONES',
    order: 2,
    description: 'Operaciones diarias del hotel'
  },
  management: {
    label: 'GESTIÓN',
    order: 3,
    description: 'Gestión de recursos y datos'
  },
  reports: {
    label: 'REPORTES',
    order: 4,
    description: 'Análisis y reportes detallados'
  },
  system: {
    label: 'SISTEMA',
    order: 5,
    description: 'Configuración y administración'
  }
};

/**
 * Nueva configuración de navegación jerárquica
 * 
 * ESTRUCTURA DE SHORTCUTS MEJORADA:
 * 
 * ALT+1: Dashboard Principal
 * ALT+2: Front Desk → 1:Check-in, 2:Check-out, 3:Calendar, 4:Reportes
 * ALT+3: Reservaciones → 1:Nueva, 2:Buscar, 3:Reportes  
 * ALT+4: Habitaciones → 1:Estado, 2:Disponibilidad, 3:Mantenimiento, 4:Reportes
 * ALT+5: Huéspedes → 1:Buscar, 2:Nuevo, 3:Perfiles, 4:Reportes
 * ALT+6: Facturación → 1:Pagos, 2:Facturas, 3:Balance, 4:Reportes
 * ALT+7: Housekeeping → 1:Dashboard, 2:Tareas, 3:Reportes
 * ALT+8: Mantenimiento → 1:Solicitudes, 2:Preventivo, 3:Reportes
 * ALT+9: Reportes Generales → 1:Ocupación, 2:Ingresos, 3:Operacional, 4:Personalizados
 */
export const NAVIGATION_CONFIG: NavigationItem[] = [
  // ===== DASHBOARD =====
  {
    id: 'dashboard-main',
    label: 'Dashboard',
    path: ROUTES.HOME,
    icon: Home,
    description: 'Panel principal con métricas del hotel',
    category: 'dashboard',
    shortcut: [1], // ALT+1
  },

  // ===== OPERACIONES =====
  {
    id: 'frontdesk',
    label: 'Front Desk',
    path: ROUTES.FRONTDESK.DASHBOARD,
    icon: Building2,
    description: 'Operaciones de recepción',
    category: 'operations',
    shortcut: [2], // ALT+2
    children: [
      {
        id: 'frontdesk-checkin',
        label: 'Check-in',
        path: ROUTES.FRONTDESK.CHECKIN,
        icon: LogIn,
        description: 'Registro de entrada de huéspedes',
        category: 'operations',
        shortcut: [2, 1], // ALT+2, luego 1
      },
      {
        id: 'frontdesk-checkout',
        label: 'Check-out',
        path: ROUTES.FRONTDESK.CHECKOUT,
        icon: LogOut,
        description: 'Proceso de salida de huéspedes',
        category: 'operations',
        shortcut: [2, 2], // ALT+2, luego 2
      },
      {
        id: 'frontdesk-calendar',
        label: 'Calendario',
        path: ROUTES.FRONTDESK.BASE,
        icon: Calendar,
        description: 'Vista calendario de ocupación',
        category: 'operations',
        shortcut: [2, 3], // ALT+2, luego 3
      },
      {
        id: 'frontdesk-reports',
        label: 'Reportes Front Desk',
        path: `${ROUTES.FRONTDESK.BASE}/reports`,
        icon: BarChart3,
        description: 'Reportes de recepción',
        category: 'operations',
        shortcut: [2, 4], // ALT+2, luego 4
      },
    ],
  },
  {
    id: 'reservations',
    label: 'Reservaciones',
    path: ROUTES.RESERVATIONS.CREATE,
    icon: Calendar,
    description: 'Sistema de reservaciones',
    category: 'operations',
    shortcut: [3], // ALT+3
    children: [
      {
        id: 'reservations-new',
        label: 'Nueva Reservación',
        path: ROUTES.RESERVATIONS.CREATE,
        icon: Calendar,
        description: 'Crear nueva reservación',
        category: 'operations',
        shortcut: [3, 1], // ALT+3, luego 1
      },
      {
        id: 'reservations-search',
        label: 'Buscar Reservaciones',
        path: ROUTES.RESERVATIONS.BASE,
        icon: Clock,
        description: 'Buscar y gestionar reservaciones',
        category: 'operations',
        shortcut: [3, 2], // ALT+3, luego 2
      },
      {
        id: 'reservations-reports',
        label: 'Reportes Reservaciones',
        path: `${ROUTES.RESERVATIONS.BASE}/reports`,
        icon: TrendingUp,
        description: 'Estadísticas de reservaciones',
        category: 'operations',
        shortcut: [3, 3], // ALT+3, luego 3
      },
    ],
  },

  // ===== GESTIÓN =====
  {
    id: 'rooms',
    label: 'Habitaciones',
    path: ROUTES.ROOMS.BASE,
    icon: Bed,
    description: 'Gestión de habitaciones',
    category: 'management',
    shortcut: [4], // ALT+4
    children: [
      {
        id: 'rooms-management',
        label: 'Gestión de Habitaciones',
        path: ROUTES.ROOMS.BASE,
        icon: Bed,
        description: 'Ver y gestionar todas las habitaciones',
        category: 'management',
        shortcut: [4, 1], // ALT+4, luego 1
      },
      {
        id: 'rooms-availability',
        label: 'Disponibilidad',
        path: ROUTES.ROOMS.AVAILABILITY,
        icon: MapPin,
        description: 'Consultar disponibilidad',
        category: 'management',
        shortcut: [4, 2], // ALT+4, luego 2
      },
      {
        id: 'rooms-reports',
        label: 'Reportes Habitaciones',
        path: `${ROUTES.ROOMS.BASE}/reports`,
        icon: BarChart3,
        description: 'Estadísticas de habitaciones',
        category: 'management',
        shortcut: [4, 3], // ALT+4, luego 3
      },
    ],
  },
  {
    id: 'guests',
    label: 'Huéspedes',
    path: ROUTES.GUESTS.BASE,
    icon: Users,
    description: 'Gestión de huéspedes',
    category: 'management',
    shortcut: [5], // ALT+5
    children: [
      {
        id: 'guests-management',
        label: 'Gestión de Huéspedes',
        path: ROUTES.GUESTS.BASE,
        icon: Users,
        description: 'Buscar, crear y gestionar huéspedes',
        category: 'management',
        shortcut: [5, 1], // ALT+5, luego 1
      },
      {
        id: 'guests-create-direct',
        label: 'Nuevo Huésped',
        path: ROUTES.GUESTS.CREATE,
        icon: Users,
        description: 'Ir directamente a crear huésped',
        category: 'management',
        shortcut: [5, 2], // ALT+5, luego 2
      },
      {
        id: 'guests-reports',
        label: 'Reportes Huéspedes',
        path: `${ROUTES.GUESTS.BASE}/reports`,
        icon: TrendingUp,
        description: 'Estadísticas de huéspedes',
        category: 'management',
        shortcut: [5, 3], // ALT+5, luego 3
      },
    ],
  },
  {
    id: 'billing',
    label: 'Facturación',
    path: ROUTES.PAYMENTS.BASE,
    icon: CreditCard,
    description: 'Sistema de facturación y pagos',
    category: 'management',
    shortcut: [6], // ALT+6
    children: [
      {
        id: 'billing-payments',
        label: 'Procesar Pagos',
        path: ROUTES.PAYMENTS.BASE,
        icon: DollarSign,
        description: 'Procesar pagos de huéspedes',
        category: 'management',
        shortcut: [6, 1], // ALT+6, luego 1
      },
      {
        id: 'billing-invoices',
        label: 'Facturas',
        path: `${ROUTES.PAYMENTS.BASE}/invoices`,
        icon: FileText,
        description: 'Gestión de facturas',
        category: 'management',
        shortcut: [6, 2], // ALT+6, luego 2
      },
      {
        id: 'billing-balance',
        label: 'Balance Cuentas',
        path: `${ROUTES.PAYMENTS.BASE}/balance`,
        icon: DollarSign,
        description: 'Balance de cuentas pendientes',
        category: 'management',
        shortcut: [6, 3], // ALT+6, luego 3
      },
      {
        id: 'billing-reports',
        label: 'Reportes Financieros',
        path: `${ROUTES.PAYMENTS.BASE}/reports`,
        icon: TrendingUp,
        description: 'Reportes financieros',
        category: 'management',
        shortcut: [6, 4], // ALT+6, luego 4
      },
    ],
  },
  {
    id: 'housekeeping',
    label: 'Housekeeping',
    path: ROUTES.HOUSEKEEPING.BASE,
    icon: BrushCleaning,
    description: 'Limpieza y mantenimiento',
    category: 'management',
    shortcut: [7], // ALT+7
    children: [
      {
        id: 'housekeeping-dashboard',
        label: 'Dashboard',
        path: ROUTES.HOUSEKEEPING.DASHBOARD,
        icon: ClipboardList,
        description: 'Panel de control de limpieza',
        category: 'management',
        shortcut: [7, 1], // ALT+7, luego 1
      },
      {
        id: 'housekeeping-tasks',
        label: 'Tareas Diarias',
        path: ROUTES.HOUSEKEEPING.TASKS,
        icon: CheckSquare,
        description: 'Tareas de limpieza del día',
        category: 'management',
        shortcut: [7, 2], // ALT+7, luego 2
      },
      {
        id: 'housekeeping-reports',
        label: 'Reportes Housekeeping',
        path: ROUTES.HOUSEKEEPING.REPORTS,
        icon: BarChart3,
        description: 'Reportes de limpieza y mantenimiento',
        category: 'management',
        shortcut: [7, 3], // ALT+7, luego 3
      },
    ],
  },
  {
    id: 'maintenance',
    label: 'Mantenimiento',
    path: ROUTES.MANTENIMIENTO.BASE,
    icon: Wrench,
    description: 'Gestión y control de mantenimientos',
    category: 'management',
    shortcut: [8], // ALT+8 (ajustando para mantener orden)
    children: [
      {
        id: 'maintenance-requests',
        label: 'Solicitudes',
        path: ROUTES.MANTENIMIENTO.SOLICITUDES,
        icon: ClipboardList,
        description: 'Solicitudes de mantenimiento',
        category: 'management',
        shortcut: [8, 1], // ALT+8, luego 1
      },
      {
        id: 'maintenance-preventive',
        label: 'Preventivo',
        path: ROUTES.MANTENIMIENTO.PREVENTIVO,
        icon: Clock,
        description: 'Mantenimiento preventivo programado',
        category: 'management',
        shortcut: [8, 2], // ALT+8, luego 2
      },
      {
        id: 'maintenance-reports',
        label: 'Reportes Mantenimiento',
        path: ROUTES.MANTENIMIENTO.REPORTS,
        icon: BarChart3,
        description: 'Reportes de mantenimiento',
        category: 'management',
        shortcut: [8, 3], // ALT+8, luego 3
      },
    ],
  },

  // ===== REPORTES GENERALES =====
  {
    id: 'reports-general',
    label: 'Reportes Generales',
    path: ROUTES.REPORTS.BASE,
    icon: BarChart3,
    description: 'Centro de reportes y analytics',
    category: 'reports',
    shortcut: [9], // ALT+9 (ajustado)
    children: [
      {
        id: 'reports-occupancy',
        label: 'Ocupación',
        path: `${ROUTES.REPORTS.BASE}/occupancy`,
        icon: TrendingUp,
        description: 'Reportes de ocupación',
        category: 'reports',
        shortcut: [9, 1], // ALT+9, luego 1
      },
      {
        id: 'reports-revenue',
        label: 'Ingresos',
        path: `${ROUTES.REPORTS.BASE}/revenue`,
        icon: DollarSign,
        description: 'Reportes de ingresos',
        category: 'reports',
        shortcut: [9, 2], // ALT+9, luego 2
      },
      {
        id: 'reports-operational',
        label: 'Operacional',
        path: `${ROUTES.REPORTS.BASE}/operational`,
        icon: ClipboardList,
        description: 'Reportes operacionales',
        category: 'reports',
        shortcut: [9, 3], // ALT+9, luego 3
      },
      {
        id: 'reports-custom',
        label: 'Reportes Personalizados',
        path: `${ROUTES.REPORTS.BASE}/custom`,
        icon: FileText,
        description: 'Crear reportes personalizados',
        category: 'reports',
        shortcut: [9, 4], // ALT+9, luego 4
      },
    ],
  },

  // ===== SISTEMA =====
  {
    id: 'system-settings',
    label: 'Configuración',
    path: ROUTES.SETTINGS.BASE,
    icon: Settings,
    description: 'Configuración del sistema',
    category: 'system',
    // Sin shortcut para evitar conflictos
    children: [
      {
        id: 'settings-hotel',
        label: 'Configuración Hotel',
        path: ROUTES.SETTINGS.BASE,
        icon: Building2,
        description: 'Configuración general del hotel',
        category: 'system',
        // Sin shortcut
      },
      {
        id: 'settings-users',
        label: 'Usuarios',
        path: `${ROUTES.SETTINGS.BASE}/users`,
        icon: Users,
        description: 'Gestión de usuarios del sistema',
        category: 'system',
        // Sin shortcut
      },
      {
        id: 'settings-backup',
        label: 'Respaldos',
        path: `${ROUTES.SETTINGS.BASE}/backup`,
        icon: Archive,
        description: 'Gestión de respaldos',
        category: 'system',
        // Sin shortcut
      },
      {
        id: 'settings-integrations',
        label: 'Integraciones',
        path: `${ROUTES.SETTINGS.BASE}/integrations`,
        icon: Phone,
        description: 'Configurar integraciones externas',
        category: 'system',
        // Sin shortcut
      },
    ],
  },
];

/**
 * Feature flags configuration for conditional navigation
 */
export const NAVIGATION_FEATURES = {
  ENABLE_SHORTCUTS: 'navigation.shortcuts.enabled',
  ENABLE_COMMAND_PALETTE: 'navigation.commandPalette.enabled',
  ENABLE_BREADCRUMBS: 'navigation.breadcrumbs.enabled',
} as const;

/**
 * Utility functions for navigation config
 */

/**
 * Get all navigation items flattened (including children)
 */
export function getAllNavigationItems(): NavigationItem[] {
  const allItems: NavigationItem[] = [];
  
  function addItems(items: NavigationItem[]) {
    for (const item of items) {
      allItems.push(item);
      if (item.children) {
        addItems(item.children);
      }
    }
  }
  
  addItems(NAVIGATION_CONFIG);
  return allItems;
}

/**
 * Get navigation items grouped by category
 */
export function getNavigationByCategory(): Record<NavigationCategory, NavigationItem[]> {
  const grouped = {} as Record<NavigationCategory, NavigationItem[]>;
  
  // Initialize all categories
  Object.keys(NAVIGATION_CATEGORIES).forEach(category => {
    grouped[category as NavigationCategory] = [];
  });
  
  // Group items by category
  NAVIGATION_CONFIG.forEach(item => {
    grouped[item.category].push(item);
  });
  
  return grouped;
}

/**
 * Find navigation item by path
 */
export function findNavigationItemByPath(path: string): NavigationItem | undefined {
  const allItems = getAllNavigationItems();
  return allItems.find(item => {
    if (item.path === path) return true;
    if (path !== '/' && item.path !== '/' && path.startsWith(item.path)) return true;
    return false;
  });
}

/**
 * Find navigation item by shortcut sequence
 */
export function findNavigationItemByShortcut(sequence: number[]): NavigationItem | undefined {
  const allItems = getAllNavigationItems();
  return allItems.find(item => 
    item.shortcut && 
    item.shortcut.length === sequence.length &&
    item.shortcut.every((num, index) => num === sequence[index])
  );
}

/**
 * Get all shortcuts for command palette and help
 */
export function getAllShortcuts(): Array<{ item: NavigationItem; sequence: number[] }> {
  const allItems = getAllNavigationItems();
  return allItems
    .filter(item => item.shortcut)
    .map(item => ({ item, sequence: item.shortcut! }));
}
