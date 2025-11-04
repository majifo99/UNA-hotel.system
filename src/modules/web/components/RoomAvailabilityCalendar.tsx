/**
 * Room Availability Calendar
 * 
 * Displays a calendar showing which dates are available/unavailable for a specific room
 * Fetches real availability data from the backend API
 */

import { useState, useEffect } from 'react';
import type { Room } from '../../../types/core';
import { roomService } from '../../reservations/services/roomService';

interface RoomAvailabilityCalendarProps {
  readonly room: Room;
  readonly onClose: () => void;
  readonly onSelectDates?: (checkIn: string, checkOut: string) => void;
  readonly embedded?: boolean;
}

interface DateAvailability {
  date: string;
  available: boolean;
  reason?: string;
}

export function RoomAvailabilityCalendar({
  room,
  onClose,
  onSelectDates,
  embedded = false
}: Readonly<RoomAvailabilityCalendarProps>) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedCheckIn, setSelectedCheckIn] = useState<string | null>(null);
  const [selectedCheckOut, setSelectedCheckOut] = useState<string | null>(null);
  const [availability, setAvailability] = useState<DateAvailability[]>([]);
  const [loading, setLoading] = useState(false);

  // Load availability data for current month
  useEffect(() => {
    const loadAvailability = async () => {
      setLoading(true);
      try {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth() + 1; // JavaScript months are 0-indexed

        // Fetch real availability from backend
        const availabilityData = await roomService.getRoomAvailabilityForMonth(
          room.id,
          year,
          month
        );

        setAvailability(availabilityData);
      } catch (error) {
        console.error('Error loading availability:', error);
        // On error, show all dates as unavailable
        const daysInMonth = new Date(
          currentMonth.getFullYear(),
          currentMonth.getMonth() + 1,
          0
        ).getDate();

        const errorAvailability: DateAvailability[] = [];
        for (let day = 1; day <= daysInMonth; day++) {
          const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
          const dateStr = date.toISOString().split('T')[0];
          
          errorAvailability.push({
            date: dateStr,
            available: false,
            reason: 'Error al cargar disponibilidad'
          });
        }

        setAvailability(errorAvailability);
      } finally {
        setLoading(false);
      }
    };

    loadAvailability();
  }, [currentMonth, room.id]);

  const handleDateClick = (dateStr: string, available: boolean) => {
    if (!available) return;

    if (!selectedCheckIn || selectedCheckOut) {
      // Primera selección o reiniciar después de tener ambas fechas
      setSelectedCheckIn(dateStr);
      setSelectedCheckOut(null);
    } else if (!selectedCheckOut) {
      // Segunda selección: check-out
      const checkIn = new Date(selectedCheckIn);
      const checkOut = new Date(dateStr);
      
      if (checkOut <= checkIn) {
        // Si seleccionó una fecha anterior, reiniciar
        setSelectedCheckIn(dateStr);
        setSelectedCheckOut(null);
      } else {
        setSelectedCheckOut(dateStr);
      }
    }
  };

  const handleConfirmSelection = () => {
    if (selectedCheckIn && selectedCheckOut && onSelectDates) {
      onSelectDates(selectedCheckIn, selectedCheckOut);
      onClose();
    }
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const getDayStyles = (dateStr: string, isAvailable: boolean) => {
    const isCheckIn = dateStr === selectedCheckIn;
    const isCheckOut = dateStr === selectedCheckOut;
    const isInRange = selectedCheckIn && selectedCheckOut && 
      dateStr > selectedCheckIn && dateStr < selectedCheckOut;

    let bgColor = 'bg-white hover:bg-gray-50 border-gray-300';
    let textColor = 'text-gray-900';
    
    if (!isAvailable) {
      bgColor = 'bg-red-100 border-red-200 cursor-not-allowed';
      textColor = 'text-red-400';
    }
    
    if (isInRange) {
      bgColor = 'bg-blue-100 border-blue-200';
      textColor = 'text-blue-900';
    }
    
    if (isCheckIn || isCheckOut) {
      bgColor = 'bg-blue-600 border-blue-700';
      textColor = 'text-white font-semibold';
    }

    return { bgColor, textColor };
  };

  const renderDayButton = (day: number, dateStr: string, availData: DateAvailability | undefined) => {
    const isAvailable = availData?.available ?? true;
    const { bgColor, textColor } = getDayStyles(dateStr, isAvailable);

    return (
      <button
        key={day}
        type="button"
        disabled={!isAvailable}
        onClick={() => handleDateClick(dateStr, isAvailable)}
        className={`aspect-square rounded-lg border-2 ${bgColor} ${textColor} flex items-center justify-center text-sm transition-colors ${
          isAvailable ? 'cursor-pointer hover:border-blue-400' : 'opacity-50'
        }`}
        title={availData?.reason}
      >
        {day}
      </button>
    );
  };

  const renderWeekHeader = () => {
    const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    return (
      <div key="header" className="grid grid-cols-7 gap-2 mb-2">
        {weekDays.map(wd => (
          <div key={wd} className="text-center text-sm font-medium text-gray-600">
            {wd}
          </div>
        ))}
      </div>
    );
  };

  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const calendar = [];
    let day = 1;

    // Week headers
    calendar.push(renderWeekHeader());

    // Calendar days
    const weeks = [];
    let week = [];

    // Empty cells before first day
    for (let i = 0; i < firstDay; i++) {
      week.push(
        <div key={`empty-${i}`} className="aspect-square" />
      );
    }

    // Days of month
    while (day <= daysInMonth) {
      const date = new Date(year, month, day);
      const dateStr = date.toISOString().split('T')[0];
      const availData = availability.find(a => a.date === dateStr);

      week.push(renderDayButton(day, dateStr, availData));

      if (week.length === 7) {
        weeks.push(
          <div key={`week-${weeks.length}`} className="grid grid-cols-7 gap-2">
            {week}
          </div>
        );
        week = [];
      }

      day++;
    }

    // Fill remaining cells
    while (week.length > 0 && week.length < 7) {
      week.push(
        <div key={`empty-end-${week.length}`} className="aspect-square" />
      );
    }

    if (week.length > 0) {
      weeks.push(
        <div key={`week-${weeks.length}`} className="grid grid-cols-7 gap-2">
          {week}
        </div>
      );
    }

    calendar.push(...weeks);
    return calendar;
  };

  const monthName = currentMonth.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

  // Content component (can be used standalone or in modal)
  const calendarContent = (
    <div className="space-y-6">
      {/* Month navigation */}
      <div className="flex justify-between items-center">
        <button
          type="button"
          onClick={goToPreviousMonth}
          className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          ← Anterior
        </button>
        <h3 className="text-lg font-semibold text-gray-900 capitalize">
          {monthName}
        </h3>
        <button
          type="button"
          onClick={goToNextMonth}
          className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          Siguiente →
        </button>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-white border-2 border-gray-300 rounded" />
          <span>Disponible</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-100 border-2 border-red-200 rounded" />
          <span>Ocupado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-600 rounded" />
          <span className="font-medium">Check-in / Check-out</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-100 border-2 border-blue-200 rounded" />
          <span>Noches seleccionadas</span>
        </div>
      </div>

      {/* Calendar */}
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
        </div>
      ) : (
        <div className="space-y-2">
          {renderCalendar()}
        </div>
      )}

      {/* Selection info */}
      {selectedCheckIn && (
        <div className="p-4 bg-blue-50 rounded-lg">
          <p className="text-sm font-medium text-blue-900 mb-2">
            {selectedCheckOut ? 'Fechas seleccionadas:' : 'Check-in seleccionado:'}
          </p>
          <div className="flex gap-4 text-sm text-blue-800">
            <div>
              <span className="font-medium">Entrada:</span>{' '}
              {new Date(selectedCheckIn).toLocaleDateString('es-ES')}
            </div>
            {selectedCheckOut && (
              <div>
                <span className="font-medium">Salida:</span>{' '}
                {new Date(selectedCheckOut).toLocaleDateString('es-ES')}
              </div>
            )}
          </div>
          {!selectedCheckOut && (
            <p className="text-xs text-blue-600 mt-2">
              Selecciona la fecha de salida
            </p>
          )}
        </div>
      )}
    </div>
  );

  // If embedded, return content only
  if (embedded) {
    return calendarContent;
  }

  // Otherwise, return modal wrapper
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{room.name}</h2>
            <p className="text-sm text-gray-600">Disponibilidad de la habitación</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Month navigation */}
          <div className="flex justify-between items-center mb-6">
            <button
              type="button"
              onClick={goToPreviousMonth}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              ← Anterior
            </button>
            <h3 className="text-lg font-semibold text-gray-900 capitalize">
              {monthName}
            </h3>
            <button
              type="button"
              onClick={goToNextMonth}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Siguiente →
            </button>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 mb-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-white border rounded" />
              <span>Disponible</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-100 border rounded" />
              <span>Ocupado</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-primary-600 rounded" />
              <span>Seleccionado</span>
            </div>
          </div>

          {/* Calendar */}
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
            </div>
          ) : (
            <div className="space-y-2">
              {renderCalendar()}
            </div>
          )}

          {/* Selection info */}
          {selectedCheckIn && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-blue-900 mb-2">
                {selectedCheckOut ? 'Fechas seleccionadas:' : 'Check-in seleccionado:'}
              </p>
              <div className="flex gap-4 text-sm text-blue-800">
                <div>
                  <span className="font-medium">Entrada:</span>{' '}
                  {new Date(selectedCheckIn).toLocaleDateString('es-ES')}
                </div>
                {selectedCheckOut && (
                  <div>
                    <span className="font-medium">Salida:</span>{' '}
                    {new Date(selectedCheckOut).toLocaleDateString('es-ES')}
                  </div>
                )}
              </div>
              {!selectedCheckOut && (
                <p className="text-xs text-blue-600 mt-2">
                  Selecciona la fecha de salida
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          {onSelectDates && (
            <button
              type="button"
              onClick={handleConfirmSelection}
              disabled={!selectedCheckIn || !selectedCheckOut}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Confirmar fechas
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
