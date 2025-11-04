import { useMemo, useState } from 'react';
import {
  Home,
  Users,
  CheckCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  Calendar,
  DollarSign,
  Percent,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { FrontdeskRoom } from '../types/domain';

interface FrontDeskStatsProps {
  rooms: FrontdeskRoom[];
}

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
  trend?: {
    value: string;
    positive: boolean;
  };
}

const StatCard = ({ title, value, icon, color, subtitle, trend }: StatCardProps) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className={`text-3xl font-bold ${color}`}>{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
          {trend && (
            <div className={`flex items-center gap-1 mt-2 text-xs ${trend.positive ? 'text-green-600' : 'text-red-600'}`}>
              <TrendingUp className={`w-3 h-3 ${!trend.positive && 'rotate-180'}`} />
              <span>{trend.value}</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full ${color.replace('text-', 'bg-').replace('-600', '-100')}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export const FrontDeskStats = ({ rooms }: FrontDeskStatsProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  
  const stats = useMemo(() => {
    const total = rooms.length;
    const available = rooms.filter(r => r.status === 'available').length;
    const occupied = rooms.filter(r => r.status === 'checked-in' || r.status === 'occupied').length;
    const reserved = rooms.filter(r => r.status === 'reserved').length;
    const maintenance = rooms.filter(r => r.status === 'maintenance').length;
    const cleaning = rooms.filter(r => r.status === 'cleaning' || r.status === 'checked-out').length;
    const checkedOut = rooms.filter(r => r.status === 'checked-out').length;

    // Cálculos adicionales
    const occupancyRate = total > 0 ? ((occupied / total) * 100).toFixed(1) : '0';
    const availabilityRate = total > 0 ? ((available / total) * 100).toFixed(1) : '0';
    const reservationRate = total > 0 ? ((reserved / total) * 100).toFixed(1) : '0';

    // Habitaciones que necesitan atención (check-out hoy)
    const today = new Date().toISOString().split('T')[0];
    const checkingOutToday = rooms.filter(
      r => (r.status === 'checked-in' || r.status === 'occupied') && r.checkOut === today
    ).length;

    // Llegadas esperadas (check-in hoy)
    const checkingInToday = rooms.filter(
      r => r.status === 'reserved' && r.checkIn === today
    ).length;

    // Habitaciones listas para vender (disponibles + no en mantenimiento)
    const readyToSell = available;

    return {
      total,
      available,
      occupied,
      reserved,
      maintenance,
      cleaning,
      checkedOut,
      occupancyRate,
      availabilityRate,
      reservationRate,
      checkingOutToday,
      checkingInToday,
      readyToSell,
    };
  }, [rooms]);

  return (
    <div className="space-y-6">
      {/* Header con botón de expandir/colapsar */}
      <div className="flex items-center justify-between bg-gradient-to-r from-indigo-50 to-blue-50 p-4 rounded-lg border border-indigo-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <Home className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Estadísticas del Front Desk</h2>
            {!isExpanded && (
              <div className="flex gap-4 mt-1 text-sm">
                <span className="text-green-600 font-semibold">✓ {stats.available} Disponibles</span>
                <span className="text-blue-600 font-semibold">● {stats.occupied} Ocupadas</span>
                {stats.cleaning > 0 && <span className="text-orange-600 font-semibold">⚠ {stats.cleaning} En Limpieza</span>}
              </div>
            )}
          </div>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-indigo-100 text-indigo-700 rounded-lg transition-all duration-200 font-medium shadow-sm hover:shadow-md border border-indigo-300"
          aria-label={isExpanded ? 'Colapsar estadísticas' : 'Expandir estadísticas'}
        >
          {isExpanded ? (
            <>
              <ChevronUp className="w-5 h-5" />
              Ocultar
            </>
          ) : (
            <>
              <ChevronDown className="w-5 h-5" />
              Mostrar
            </>
          )}
        </button>
      </div>

      {/* Contenido colapsable con animación */}
      <div 
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isExpanded ? 'max-h-[3000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="space-y-6">
          {/* Grid de estadísticas principales */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Habitaciones"
              value={stats.total}
              icon={<Home className="w-6 h-6 text-indigo-600" />}
              color="text-indigo-600"
              subtitle="Inventario completo"
            />
            
            <StatCard
              title="Disponibles"
              value={stats.available}
              icon={<CheckCircle className="w-6 h-6 text-green-600" />}
              color="text-green-600"
              subtitle={`${stats.availabilityRate}% del total`}
            />
            
            <StatCard
              title="Ocupadas (Check-in)"
              value={stats.occupied}
              icon={<Users className="w-6 h-6 text-blue-600" />}
              color="text-blue-600"
              subtitle={`Tasa: ${stats.occupancyRate}%`}
            />
            
            <StatCard
              title="Reservadas"
              value={stats.reserved}
              icon={<Calendar className="w-6 h-6 text-yellow-600" />}
              color="text-yellow-600"
              subtitle={`${stats.reservationRate}% del total`}
            />
          </div>

          {/* Estadísticas secundarias */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Mantenimiento"
              value={stats.maintenance}
              icon={<AlertTriangle className="w-6 h-6 text-red-600" />}
              color="text-red-600"
              subtitle="Fuera de servicio"
            />
            
            <StatCard
              title="En Limpieza (Sucias)"
              value={stats.cleaning}
              icon={<AlertTriangle className="w-6 h-6 text-orange-600" />}
              color="text-orange-600"
              subtitle="Requieren limpieza"
            />
            
            <StatCard
              title="Check-in Hoy"
              value={stats.checkingInToday}
              icon={<Users className="w-6 h-6 text-purple-600" />}
              color="text-purple-600"
              subtitle="Llegadas esperadas"
            />
            
            <StatCard
              title="Listas para Vender"
              value={stats.readyToSell}
              icon={<DollarSign className="w-6 h-6 text-teal-600" />}
              color="text-teal-600"
              subtitle="Disponibles ahora"
            />
          </div>

          {/* Panel de tasas y métricas */}
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Percent className="w-5 h-5 text-indigo-600" />
              Métricas de Rendimiento
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Tasa de Ocupación */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Tasa de Ocupación</span>
                  <span className="text-lg font-bold text-blue-600">{stats.occupancyRate}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${stats.occupancyRate}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.occupied} de {stats.total} habitaciones ocupadas
                </p>
              </div>

              {/* Tasa de Disponibilidad */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Tasa de Disponibilidad</span>
                  <span className="text-lg font-bold text-green-600">{stats.availabilityRate}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${stats.availabilityRate}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.available} habitaciones listas
                </p>
              </div>

              {/* Tasa de Reservas */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Tasa de Reservas</span>
                  <span className="text-lg font-bold text-yellow-600">{stats.reservationRate}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${stats.reservationRate}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.reserved} reservas confirmadas
                </p>
              </div>
            </div>

            {/* Resumen rápido */}
            <div className="mt-6 pt-6 border-t border-indigo-200">
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700">Disponibles: <strong>{stats.available}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-700">Ocupadas: <strong>{stats.occupied}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-gray-700">Reservadas: <strong>{stats.reserved}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span className="text-gray-700">En Limpieza: <strong>{stats.cleaning}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-gray-700">Mantenimiento: <strong>{stats.maintenance}</strong></span>
                </div>
              </div>
            </div>
          </div>

          {/* Alertas y notificaciones */}
          {(stats.checkingOutToday > 0 || stats.checkingInToday > 0 || stats.maintenance > 0 || stats.cleaning > 0) && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                Alertas y Atención Requerida
              </h3>
              
              <div className="space-y-3">
                {stats.cleaning > 0 && (
                  <div className="flex items-center gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-orange-900">
                        {stats.cleaning} habitación{stats.cleaning > 1 ? 'es' : ''} en estado "Sucia" - Requiere limpieza
                      </p>
                      <p className="text-xs text-orange-700">
                        Estas habitaciones necesitan servicio de limpieza antes de estar disponibles
                      </p>
                    </div>
                  </div>
                )}

                {stats.checkingOutToday > 0 && (
                  <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <Clock className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-blue-900">
                        {stats.checkingOutToday} habitación{stats.checkingOutToday > 1 ? 'es' : ''} con check-out programado hoy
                      </p>
                      <p className="text-xs text-blue-700">
                        Prepara estas habitaciones para limpieza y nueva ocupación
                      </p>
                    </div>
                  </div>
                )}
                
                {stats.checkingInToday > 0 && (
                  <div className="flex items-center gap-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <Users className="w-5 h-5 text-purple-600 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-purple-900">
                        {stats.checkingInToday} llegada{stats.checkingInToday > 1 ? 's' : ''} esperada{stats.checkingInToday > 1 ? 's' : ''} hoy
                      </p>
                      <p className="text-xs text-purple-700">
                        Verifica que las habitaciones estén listas para recibir huéspedes
                      </p>
                    </div>
                  </div>
                )}
                
                {stats.maintenance > 0 && (
                  <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-red-900">
                        {stats.maintenance} habitación{stats.maintenance > 1 ? 'es' : ''} en mantenimiento
                      </p>
                      <p className="text-xs text-red-700">
                        Estas habitaciones no están disponibles para reservas
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FrontDeskStats;
