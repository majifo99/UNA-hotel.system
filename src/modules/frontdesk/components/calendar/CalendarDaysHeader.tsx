import React from 'react';
import type { CalendarDay } from '../../types/calendar';

interface CalendarDaysHeaderProps {
  calendarDays: CalendarDay[];
}

const CalendarDaysHeader: React.FC<CalendarDaysHeaderProps> = ({ calendarDays }) => {
  return (
    <div className="flex border-b-2 border-gray-300 bg-gradient-to-r from-gray-50 to-gray-100 sticky top-0 z-20">
      {/* Fixed width column matching RoomRow */}
      <div 
        className="p-4 border-r border-gray-300 font-semibold text-gray-700 bg-white flex items-center"
        style={{ minWidth: '220px', width: '220px' }}
      >
        Habitación
      </div>
      {/* Days container */}
      <div className="flex flex-1 overflow-x-auto">
        {calendarDays.map((day) => (
          <div
            key={day.dateString}
            className={`p-3 border-r border-gray-200 text-center flex-shrink-0 ${
              day.isToday ? 'bg-blue-100 text-blue-800 font-bold' : 'text-gray-700'
            }`}
            style={{ width: '120px' }}
          >
            <div className="text-xs font-medium uppercase">
              {day.date.toLocaleDateString('es-ES', { weekday: 'short' })}
            </div>
            <div className={`text-lg mt-1 ${day.isToday ? 'font-bold' : ''}`}>
              {day.date.getDate()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarDaysHeader;
