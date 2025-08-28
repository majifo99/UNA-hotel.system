import React from 'react';
import { ROOM_STATUS_COLORS, STATUS_LABELS } from '../../constants/calendar';

const CalendarLegend: React.FC = () => {
  return (
    <div className="p-4 bg-gray-50 border-t border-gray-200">
      <div className="flex items-center justify-center gap-6 text-sm">
        {Object.entries(ROOM_STATUS_COLORS).map(([status, color]) => (
          <div key={status} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded" 
              style={{ backgroundColor: color }}
            ></div>
            <span className="text-gray-700">
              {STATUS_LABELS[status as keyof typeof STATUS_LABELS]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarLegend;
