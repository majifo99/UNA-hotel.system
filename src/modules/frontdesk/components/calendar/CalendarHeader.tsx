import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { CalendarHeaderProps } from '../../types/calendar';

const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  calendarDays,
  onNavigateWeek,
  onGoToToday,
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
          <div className="flex gap-6 text-sm">
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

      {/* Calendar Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => onNavigateWeek('prev')}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            aria-label="Semana anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="text-lg font-semibold">
            {calendarDays[0]?.date.toLocaleDateString('es-ES', { 
              month: 'long', 
              year: 'numeric' 
            })}
          </div>
          
          <button
            onClick={() => onNavigateWeek('next')}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            aria-label="Semana siguiente"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <button
          onClick={onGoToToday}
          className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors font-medium"
        >
          Hoy
        </button>
      </div>
    </div>
  );
};

export default CalendarHeader;
