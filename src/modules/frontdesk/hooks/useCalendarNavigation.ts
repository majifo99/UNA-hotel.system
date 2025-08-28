import { useState, useMemo } from 'react';
import { generateCalendarDays } from '../utils/calendarHelpers';

export const useCalendarNavigation = () => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const calendarDays = useMemo(() => {
    const startDate = new Date(currentDate);
    // Comenzar desde hoy para ver mejor las reservaciones actuales
    const today = new Date();
    startDate.setFullYear(today.getFullYear(), today.getMonth(), today.getDate());
    return generateCalendarDays(startDate);
  }, [currentDate]);

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  return {
    currentDate,
    calendarDays,
    navigateWeek,
    goToToday
  };
};
