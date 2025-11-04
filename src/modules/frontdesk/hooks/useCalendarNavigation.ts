import { useState, useMemo } from 'react';
import { generateCalendarDays } from '../utils/calendarHelpers';

export const useCalendarNavigation = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'month'>('month');

  const calendarDays = useMemo(() => {
    if (viewMode === 'month') {
      // Para vista mensual, generar todo el mes
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      // Calcular días del mes actual
      const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
      return generateCalendarDays(startOfMonth, daysInMonth);
    } else {
      // Para vista semanal, generar 7 días desde la fecha actual
      const startDate = new Date(currentDate);
      startDate.setHours(0, 0, 0, 0);
      return generateCalendarDays(startDate, 7);
    }
  }, [currentDate, viewMode]);

  // Calcular el rango de fechas para consultas
  const dateRange = useMemo(() => {
    if (calendarDays.length === 0) {
      const today = new Date();
      return {
        startDate: today.toISOString().split('T')[0],
        endDate: today.toISOString().split('T')[0]
      };
    }

    const firstDay = calendarDays[0].date;
    const lastDay = calendarDays[calendarDays.length - 1].date;

    return {
      startDate: firstDay.toISOString().split('T')[0],
      endDate: lastDay.toISOString().split('T')[0]
    };
  }, [calendarDays]);

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentDate(newDate);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'next') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else {
      newDate.setMonth(newDate.getMonth() - 1);
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const goToSpecificMonth = (year: number, month: number) => {
    const newDate = new Date(year, month, 1);
    setCurrentDate(newDate);
  };

  const getCurrentMonthYear = () => {
    const months = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];
    return `${months[currentDate.getMonth()]} de ${currentDate.getFullYear()}`;
  };

  return {
    currentDate,
    calendarDays,
    viewMode,
    setViewMode,
    navigateWeek,
    navigateMonth,
    goToToday,
    goToSpecificMonth,
    getCurrentMonthYear,
    dateRange
  };
};
