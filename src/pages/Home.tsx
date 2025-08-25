
import { Building2 } from 'lucide-react';
import FrontDesk from '../modules/frontdesk/components/FrontDesk';

// Imports comentados para futuras funcionalidades
// import { Link } from 'react-router-dom';
// import { Calendar, Users, Bed, BarChart3 } from 'lucide-react';
// import { ROUTES } from '../router/routes';

/**
 * Home Dashboard Component
 * 
 * Página principal simplificada mostrando:
 * - Mensaje de bienvenida con branding UNA
 * - Componente Frontdesk para gestión de habitaciones
 */
export const Home = () => {
  return (
    <div className="space-y-8">
      {/* Hero Welcome Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-white via-una-neutral-cream to-white rounded-2xl shadow-lg border border-una-bg-300">
        <div className="absolute inset-0 bg-gradient-to-br from-una-bg-100/50 to-transparent"></div>
        <div className="relative p-10 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-una-accent-gold to-una-bg-400 rounded-2xl mb-6 shadow-lg">
            <Building2 className="w-10 h-10 text-una-primary-900" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-una-primary-900 via-una-primary-800 to-una-primary-600 bg-clip-text text-transparent mb-4">
            Bienvenido a UNA Hotel
          </h1>
          <p className="text-xl text-una-primary-600 max-w-3xl mx-auto leading-relaxed">
            Experiencia hotelera de clase mundial con gestión inteligente. 
            <span className="block mt-2 text-lg text-una-primary-800">
              Administra reservaciones, huéspedes y operaciones con elegancia y eficiencia.
            </span>
          </p>
          {/* Decorative elements */}
          <div className="flex items-center justify-center space-x-2 mt-6">
            <div className="w-2 h-2 bg-una-accent-gold rounded-full"></div>
            <div className="w-8 h-0.5 bg-gradient-to-r from-una-accent-gold to-una-primary-600"></div>
            <div className="w-2 h-2 bg-una-primary-600 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Frontdesk Management Section - Sección Principal */}
      <div className="bg-gradient-to-r from-white via-una-neutral-cream to-white rounded-2xl shadow-lg border border-una-bg-300 overflow-hidden">
        <div className="bg-gradient-to-r from-una-primary-900 to-una-primary-800 p-6">
          <h2 className="text-2xl font-bold text-white mb-2">
            Gestión de Frontdesk
          </h2>
          <p className="text-una-bg-200">
            Control de habitaciones y operaciones en tiempo real
          </p>
        </div>
        <div className="p-8">
          <FrontDesk />
        </div>
      </div>

      {/* SECCIONES COMENTADAS PARA FUTURO DESARROLLO */}
      
      {/* Quick Actions Grid - Comentado temporalmente
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link 
          to={ROUTES.RESERVATIONS.CREATE}
          className="group relative overflow-hidden bg-gradient-to-br from-white to-una-neutral-cream rounded-2xl shadow-lg border border-una-bg-300 p-8 hover:shadow-2xl hover:border-una-accent-gold transition-all duration-500 transform hover:-translate-y-2"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-una-accent-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-una-primary-600 to-una-primary-800 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <Calendar className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-una-primary-900 mb-3">
              Nueva Reservación
            </h3>
            <p className="text-una-primary-600 leading-relaxed">
              Crear una nueva reservación con proceso intuitivo y rápido
            </p>
            <div className="mt-4 flex items-center text-una-accent-gold font-semibold">
              <span>Comenzar</span>
              <div className="ml-2 transform group-hover:translate-x-1 transition-transform duration-300">→</div>
            </div>
          </div>
        </Link>

        <div className="group relative overflow-hidden bg-gradient-to-br from-white to-una-neutral-cream rounded-2xl shadow-lg border border-una-bg-300 p-8 hover:shadow-2xl hover:border-una-accent-gold transition-all duration-500 transform hover:-translate-y-2 cursor-pointer">
          <div className="absolute inset-0 bg-gradient-to-br from-una-bg-200/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-una-bg-400 to-una-primary-600 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-una-primary-900 mb-3">
              Huéspedes
            </h3>
            <p className="text-una-primary-600 leading-relaxed">
              Gestión completa de base de datos de huéspedes
            </p>
            <div className="mt-4 text-una-primary-600 font-medium opacity-60">
              Próximamente
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden bg-gradient-to-br from-white to-una-neutral-cream rounded-2xl shadow-lg border border-una-bg-300 p-8 hover:shadow-2xl hover:border-una-accent-gold transition-all duration-500 transform hover:-translate-y-2 cursor-pointer">
          <div className="absolute inset-0 bg-gradient-to-br from-una-bg-200/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-una-accent-gold to-una-bg-400 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <Bed className="w-8 h-8 text-una-primary-900" />
            </div>
            <h3 className="text-xl font-bold text-una-primary-900 mb-3">
              Habitaciones
            </h3>
            <p className="text-una-primary-600 leading-relaxed">
              Control de disponibilidad y estado en tiempo real
            </p>
            <div className="mt-4 text-una-primary-600 font-medium opacity-60">
              Próximamente
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden bg-gradient-to-br from-white to-una-neutral-cream rounded-2xl shadow-lg border border-una-bg-300 p-8 hover:shadow-2xl hover:border-una-accent-gold transition-all duration-500 transform hover:-translate-y-2 cursor-pointer">
          <div className="absolute inset-0 bg-gradient-to-br from-una-bg-200/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-una-primary-800 to-una-primary-600 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-una-primary-900 mb-3">
              Analytics
            </h3>
            <p className="text-una-primary-600 leading-relaxed">
              Reportes detallados y métricas de rendimiento
            </p>
            <div className="mt-4 text-una-primary-600 font-medium opacity-60">
              Próximamente
            </div>
          </div>
        </div>
      </div>
      */}

      {/* Status Overview - Comentado temporalmente
      <div className="bg-gradient-to-r from-white via-una-neutral-cream to-white rounded-2xl shadow-lg border border-una-bg-300 overflow-hidden">
        <div className="bg-gradient-to-r from-una-primary-900 to-una-primary-800 p-6">
          <h2 className="text-2xl font-bold text-white mb-2">
            Estado del Sistema
          </h2>
          <p className="text-una-bg-200">
            Métricas en tiempo real del hotel
          </p>
        </div>
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-gradient-to-br from-una-bg-100 to-una-bg-200 rounded-xl border border-una-bg-300">
              <div className="text-4xl font-bold bg-gradient-to-r from-una-primary-600 to-una-primary-800 bg-clip-text text-transparent mb-2">
                95%
              </div>
              <div className="text-una-primary-800 font-semibold">Ocupación Actual</div>
              <div className="text-sm text-una-primary-600 mt-1">Excelente rendimiento</div>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-una-bg-100 to-una-bg-200 rounded-xl border border-una-bg-300">
              <div className="text-4xl font-bold bg-gradient-to-r from-una-accent-gold to-una-bg-400 bg-clip-text text-transparent mb-2">
                23
              </div>
              <div className="text-una-primary-800 font-semibold">Check-ins Hoy</div>
              <div className="text-sm text-una-primary-600 mt-1">Llegadas programadas</div>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-una-bg-100 to-una-bg-200 rounded-xl border border-una-bg-300">
              <div className="text-4xl font-bold bg-gradient-to-r from-una-primary-600 to-una-accent-gold bg-clip-text text-transparent mb-2">
                18
              </div>
              <div className="text-una-primary-800 font-semibold">Check-outs Hoy</div>
              <div className="text-sm text-una-primary-600 mt-1">Salidas procesadas</div>
            </div>
          </div>
        </div>
      </div>
      */}
    </div>
  );
};
