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

  // If embedded, return enhanced content with sticky footer
  if (embedded) {
    return (
      <div className="flex flex-col h-full">
        {/* Calendar Content - Scrollable */}
        <div className="flex-1 overflow-y-auto px-6 pt-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          ) : (
            calendarContent
          )}

          {/* Selection Info Banner - Always visible when dates selected */}
          {selectedCheckIn && (
            <div className="mt-6 mb-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg shadow-sm">
              <p className="text-base font-semibold text-blue-900 mb-2 flex items-center gap-2">
                {selectedCheckOut ? (
                  <>
                    <span className="text-lg">✓</span>
                    <span>Fechas seleccionadas</span>
                  </>
                ) : (
                  <>
                    <span className="text-lg">📅</span>
                    <span>Check-in seleccionado</span>
                  </>
                )}
              </p>
              <div className="flex flex-wrap gap-4 text-sm text-blue-800">
                <div className="flex items-center gap-1">
                  <span className="font-semibold">Entrada:</span>
                  <span className="font-medium">
                    {new Date(selectedCheckIn + 'T00:00:00').toLocaleDateString('es-ES', { 
                      weekday: 'short', 
                      day: '2-digit', 
                      month: '2-digit', 
                      year: 'numeric' 
                    })}
                  </span>
                </div>
                {selectedCheckOut && (
                  <div className="flex items-center gap-1">
                    <span className="font-semibold">Salida:</span>
                    <span className="font-medium">
                      {new Date(selectedCheckOut + 'T00:00:00').toLocaleDateString('es-ES', { 
                        weekday: 'short', 
                        day: '2-digit', 
                        month: '2-digit', 
                        year: 'numeric' 
                      })}
                    </span>
                  </div>
                )}
              </div>
              {!selectedCheckOut && (
                <div className="mt-2 flex items-center gap-2 text-sm">
                  <span className="text-xl">👉</span>
                  <span className="text-blue-700 font-medium">
                    Ahora selecciona la fecha de salida en el calendario arriba
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Buttons - Sticky at bottom with clear visibility */}
        <div className="flex-shrink-0 bg-white border-t-2 border-gray-200 px-6 py-4 flex justify-end gap-3 shadow-lg">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 text-gray-700 font-medium bg-white border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400 rounded-lg transition-all"
          >
            Cancelar
          </button>
          {onSelectDates && (
            <button
              type="button"
              onClick={handleConfirmSelection}
              disabled={!selectedCheckIn || !selectedCheckOut}
              className={`px-8 py-2.5 font-bold rounded-lg transition-all shadow-md flex items-center gap-2 ${
                selectedCheckIn && selectedCheckOut
                  ? 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-xl transform hover:scale-105'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60'
              }`}
            >
              {selectedCheckIn && selectedCheckOut ? (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Continuar con estas fechas</span>
                </>
              ) : (
                <span>Selecciona ambas fechas primero</span>
              )}
            </button>
          )}
        </div>
      </div>
    );
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
