import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Grid, RotateCcw, CalendarDays } from 'lucide-react';
import type { CalendarHeaderProps } from '../../types/calendar';

const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  calendarDays,
  viewMode,
  currentMonthYear,
  currentDate,
  onNavigateWeek,
  onNavigateMonth,
  onGoToToday,
  onGoToSpecificMonth,
  onViewModeChange,
  stats
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
  const datePickerRef = useRef<HTMLDivElement>(null);

  // Actualizar los valores cuando cambia la fecha actual
  useEffect(() => {
    setSelectedYear(currentDate.getFullYear());
    setSelectedMonth(currentDate.getMonth());
  }, [currentDate]);

  // Cerrar el picker cuando se hace click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setShowDatePicker(false);
      }
    };

    if (showDatePicker) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showDatePicker]);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 2 + i);
  
  const months = [
    { value: 0, label: 'Enero' },
    { value: 1, label: 'Febrero' },
    { value: 2, label: 'Marzo' },
    { value: 3, label: 'Abril' },
    { value: 4, label: 'Mayo' },
    { value: 5, label: 'Junio' },
    { value: 6, label: 'Julio' },
    { value: 7, label: 'Agosto' },
    { value: 8, label: 'Septiembre' },
    { value: 9, label: 'Octubre' },
    { value: 10, label: 'Noviembre' },
    { value: 11, label: 'Diciembre' },
  ];

  const handleGoToDate = () => {
    onGoToSpecificMonth(selectedYear, selectedMonth);
    setShowDatePicker(false);
  };

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

          {/* Quick Date Picker Button */}
          <div className="relative" ref={datePickerRef}>
            <button
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors font-medium"
              title="Ir a fecha específica"
            >
              <CalendarDays className="w-4 h-4" />
              Ir a fecha
            </button>

            {/* Date Picker Dropdown */}
            {showDatePicker && (
              <div className="absolute top-full mt-2 left-0 bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-50 min-w-[300px]">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Año
                    </label>
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 font-medium"
                    >
                      {years.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Mes
                    </label>
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 font-medium"
                    >
                      {months.map((month) => (
                        <option key={month.value} value={month.value}>
                          {month.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={handleGoToDate}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                    >
                      Ir a fecha
                    </button>
                    <button
                      onClick={() => setShowDatePicker(false)}
                      className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            )}
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
