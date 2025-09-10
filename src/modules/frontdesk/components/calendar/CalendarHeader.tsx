import React from 'react';
import { ChevronLeft, ChevronRight, Calendar, Grid, RotateCcw } from 'lucide-react';
import type { CalendarHeaderProps } from '../../types/calendar';

const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  calendarDays,
  viewMode,
  currentMonthYear,
  onNavigateWeek,
  onNavigateMonth,
  onGoToToday,
  onViewModeChange,
  stats
}) => {
  return (
    <div className="p-6 text-white" style={{ backgroundColor: 'var(--color-darkGreen2)' }}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Calendario de Habitaciones</h1>
          <p className="text-white/80">Vista de ocupación y reservaciones</p>
        </div>
        
        {/* Stats Summary */}
        {stats && (
          <div className="flex gap-4 text-sm">
            <div className="text-center bg-white/20 rounded-lg p-3 backdrop-blur-sm">
              <div className="text-2xl font-bold text-white">{stats.availableRooms}</div>
              <div className="text-white/90 font-medium">Disponibles</div>
            </div>
            <div className="text-center bg-white/20 rounded-lg p-3 backdrop-blur-sm">
              <div className="text-2xl font-bold text-white">{stats.occupiedRooms}</div>
              <div className="text-white/90 font-medium">Ocupadas</div>
            </div>
            <div className="text-center bg-white/20 rounded-lg p-3 backdrop-blur-sm">
              <div className="text-2xl font-bold text-white">{stats.occupancyRate}%</div>
              <div className="text-white/90 font-medium">Ocupación</div>
            </div>
          </div>
        )}
      </div>

      {/* View Mode Toggle and Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* View Mode Toggle */}
          <div className="flex bg-white/20 rounded-lg p-1">
            <button
              onClick={() => onViewModeChange('week')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                viewMode === 'week'
                  ? 'bg-white text-gray-800 font-medium shadow-sm'
                  : 'text-white/90 hover:text-white hover:bg-white/10'
              }`}
            >
              <Grid className="w-4 h-4" />
              Semana
            </button>
            <button
              onClick={() => onViewModeChange('month')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                viewMode === 'month'
                  ? 'bg-white text-gray-800 font-medium shadow-sm'
                  : 'text-white/90 hover:text-white hover:bg-white/10'
              }`}
            >
              <Calendar className="w-4 h-4" />
              Mes
            </button>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => viewMode === 'month' ? onNavigateMonth('prev') : onNavigateWeek('prev')}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              aria-label={viewMode === 'month' ? 'Mes anterior' : 'Semana anterior'}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <div className="text-lg font-semibold min-w-[200px] text-center">
              {viewMode === 'month' ? (
                <span className="capitalize">{currentMonthYear}</span>
              ) : (
                calendarDays[0]?.date.toLocaleDateString('es-ES', { 
                  month: 'long', 
                  year: 'numeric' 
                })
              )}
            </div>
            
            <button
              onClick={() => viewMode === 'month' ? onNavigateMonth('next') : onNavigateWeek('next')}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              aria-label={viewMode === 'month' ? 'Mes siguiente' : 'Semana siguiente'}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <button
          onClick={onGoToToday}
          className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors font-medium"
        >
          <RotateCcw className="w-4 h-4" />
          Hoy
        </button>
      </div>
    </div>
  );
};

export default CalendarHeader;
