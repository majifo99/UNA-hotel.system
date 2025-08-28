import React from 'react';
import type { CalendarDay } from '../../types/calendar';

interface CalendarDaysHeaderProps {
  calendarDays: CalendarDay[];
}

const CalendarDaysHeader: React.FC<CalendarDaysHeaderProps> = ({ calendarDays }) => {
  return (
    <div className="flex border-b border-gray-200 bg-gray-50">
      <div className="w-64 p-4 border-r border-gray-200 font-semibold text-gray-700">
        Habitación
      </div>
      <div className="flex-1 flex">
        {calendarDays.map((day) => (
          <div
            key={day.dateString}
            className={`flex-1 p-4 border-r border-gray-200 text-center ${
              day.isToday ? 'bg-blue-100 text-blue-800 font-bold' : 'text-gray-700'
            }`}
          >
            <div className="text-sm font-medium">
              {day.date.toLocaleDateString('es-ES', { weekday: 'short' })}
            </div>
            <div className={`text-lg ${day.isToday ? 'font-bold' : ''}`}>
              {day.date.getDate()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarDaysHeader;
