import React from 'react';

const CalendarLoading: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-96">
      <div 
        className="animate-spin rounded-full h-12 w-12 border-b-2" 
        style={{ borderColor: 'var(--color-darkGreen2)' }}
      ></div>
    </div>
  );
};

export default CalendarLoading;
