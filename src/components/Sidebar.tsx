import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Calendar, 
  Bed,
  Building2,
  Users,
  CreditCard,
  BarChart3,
  FileText,
  Settings,
  ChevronRight,
 Brush,
} from 'lucide-react';
import { ROUTES } from '../router/routes';

/**
 * Navigation item interface for type safety
 */
interface NavigationItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  category?: 'main' | 'management' | 'analytics' | 'system';
}

/**
 * Navegación completa con categorías organizadas
 */
const navigationItems: NavigationItem[] = [
  // Principal
  {
    path: ROUTES.HOME,
    label: 'Dashboard',
    icon: Home,
    description: 'Vista general del sistema',
    category: 'main'
  },
  {
    path: ROUTES.RESERVATIONS.CREATE,
    label: 'Reservaciones',
    icon: Calendar,
    description: 'Crear y gestionar reservaciones',
    category: 'main'
  },
  
  
  // Gestión
  {
    path: ROUTES.ROOMS.BASE,
    label: 'Habitaciones',
    icon: Bed,
    description: 'Gestión de habitaciones y disponibilidad',
    category: 'management'
  },
  {
    path: ROUTES.GUESTS.BASE,
    label: 'Huéspedes',
    icon: Users,
    description: 'Base de datos de huéspedes',
    category: 'management'
  },
  {
    path: ROUTES.PAYMENTS.BASE,
    label: 'Facturación',
    icon: CreditCard,
    description: 'Gestión de pagos y facturación',
    category: 'management'
  },
  {
  path: '/housekeeping',
  label: 'Housekeeping',
  icon: Brush,
  description: 'Limpieza y mantenimiento de habitaciones',
  category: 'management'
},

  // Reportes
  {
    path: ROUTES.REPORTS.BASE,
    label: 'Análisis',
    icon: BarChart3,
    description: 'Reportes y estadísticas',
    category: 'analytics'
  },
  {
    path: ROUTES.DOCUMENTS.BASE,
    label: 'Documentos',
    icon: FileText,
    description: 'Documentos y contratos',
    category: 'analytics'
  },
  
  // Sistema
  {
    path: ROUTES.SETTINGS.BASE,
    label: 'Configuración',
    icon: Settings,
    description: 'Configuración del sistema',
    category: 'system'
  }
];

/**
 * Etiquetas de categorías para navegación
 */
const categoryLabels = {
  main: 'PRINCIPAL',
  management: 'GESTIÓN',
  analytics: 'REPORTES',
  system: 'SISTEMA'
};

/**
 * Sidebar Component con categorías organizadas
 * 
 * Features:
 * - Fondo sólido usando variables CSS (sin degradados)
 * - Navegación dividida por categorías
 * - Colores oscuros profesionales
 * - Hover states sutiles
 */
function Sidebar() {
  const location = useLocation();

  /**
   * Verificar si la ruta está activa
   */
  const isActiveRoute = (path: string): boolean => {
    if (path === ROUTES.HOME) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  /**
   * Estilos de navegación con colores CSS variables
   */
  const getNavItemClasses = (path: string): string => {
    const isActive = isActiveRoute(path);
    
    if (isActive) {
      // Estado activo: Color arena con texto negro
      return "group relative flex items-center gap-4 px-4 py-3.5 mx-2 rounded-xl transition-all duration-300 shadow-lg";
    }
    
    // Estado normal: Texto blanco con hover sutil
    return "group relative flex items-center gap-4 px-4 py-3.5 mx-2 rounded-xl text-white/80 hover:text-white hover:bg-black/10 border border-transparent transition-all duration-300 hover:shadow-md";
  };

  /**
   * Agrupar elementos por categoría
   */
  const groupedItems = navigationItems.reduce((acc, item) => {
    const category = item.category || 'main';
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {} as Record<string, NavigationItem[]>);

  return (
    <aside className="w-72 min-h-screen fixed left-0 top-0 z-10" style={{ backgroundColor: 'var(--color-darkGreen2)' }}>
      <div className="h-full flex flex-col overflow-y-auto">
        {/* Header UNA Hotel */}
        <div className="p-6 border-b" style={{ borderColor: 'rgba(0,0,0,0.2)' }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" style={{ backgroundColor: 'var(--color-sand)' }}>
              <Building2 className="w-6 h-6" style={{ color: 'var(--color-blackCustom)' }} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">UNA Hotel</h1>
              <div className="text-xs font-medium tracking-wider uppercase" style={{ color: 'var(--color-sand)' }}>
                Management System
              </div>
            </div>
          </div>
          <div className="text-white/60 text-sm leading-relaxed">
            Sistema integral de gestión hotelera
          </div>
        </div>

        {/* Navegación por categorías */}
        <nav className="flex-1 space-y-8 py-6">
          {Object.entries(groupedItems).map(([category, items]) => (
            <div key={category}>
              {/* Etiqueta de categoría */}
              <div className="mb-3 px-4">
                <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider">
                  {categoryLabels[category as keyof typeof categoryLabels]}
                </h3>
              </div>
              
              {/* Items de la categoría */}
              <div className="space-y-1">
                {items.map((item) => {
                  const IconComponent = item.icon;
                  const isActive = isActiveRoute(item.path);
                  
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={getNavItemClasses(item.path)}
                      title={item.description}
                      style={isActive ? { 
                        backgroundColor: 'var(--color-sand)', 
                        color: 'var(--color-blackCustom)',
                        border: `1px solid var(--color-sand)`
                      } : {}}
                    >
                      {/* Icono */}
                      <div className={`p-2 rounded-lg transition-all duration-300 ${
                        isActive 
                          ? 'text-black' 
                          : 'text-white/70 group-hover:text-white'
                      }`} style={isActive ? { backgroundColor: 'rgba(0,0,0,0.1)' } : {}}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      
                      {/* Etiqueta */}
                      <span className={`font-medium text-sm tracking-wide flex-1 ${
                        isActive ? 'text-black' : 'text-white/80 group-hover:text-white'
                      }`}>
                        {item.label}
                      </span>
                      
                      {/* Indicador activo */}
                      {isActive && (
                        <div className="w-2 h-2 rounded-full shadow-sm" style={{ backgroundColor: 'var(--color-blackCustom)' }}></div>
                      )}
                      
                      {/* Flecha de hover */}
                      <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
        
        {/* Footer profesional */}
        <div className="pt-6 border-t" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
          <div className="text-xs text-white/40 text-center">
            Universidad Nacional de Costa Rica
          </div>
          <div className="text-xs text-white/30 text-center mt-1">
            Sistema de Gestión Hotelera
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
