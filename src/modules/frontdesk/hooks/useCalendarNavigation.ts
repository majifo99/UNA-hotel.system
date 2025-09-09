import { useState, useMemo } from 'react';
import { generateCalendarDays } from '../utils/calendarHelpers';

export const useCalendarNavigation = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'month'>('month');

  const calendarDays = useMemo(() => {
    if (viewMode === 'month') {
      // Para vista mensual, generar todo el mes usando el helper existente
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      
      // Usar el helper existente para mantener la consistencia
      return generateCalendarDays(startOfMonth, 30); // 30 días para cubrir el mes completo
    } else {
      // Para vista semanal, usar la lógica existente
      const startDate = new Date(currentDate);
      const today = new Date();
      startDate.setFullYear(today.getFullYear(), today.getMonth(), today.getDate());
      return generateCalendarDays(startDate);
    }
  }, [currentDate, viewMode]);

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
    getCurrentMonthYear
  };
};
