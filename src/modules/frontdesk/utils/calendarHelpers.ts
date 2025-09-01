import type { CalendarDay } from '../types/calendar';
import { CALENDAR_CONFIG } from '../constants/calendar';

export const generateCalendarDays = (
  startDate: Date, 
  numberOfDays: number = CALENDAR_CONFIG.DEFAULT_DAYS_TO_SHOW
): CalendarDay[] => {
  const days: CalendarDay[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < numberOfDays; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    
    const isToday = date.getTime() === today.getTime();
    const isPast = date < today;
    const isWeekend = date.getDay() === 0 || date.getDay() === 6; // Domingo o Sábado
    
    days.push({
      date: new Date(date),
      dateString: date.toISOString().split('T')[0],
      isToday,
      isPast,
      isWeekend
    });
  }
  
  return days;
};

export const calculateReservationPosition = (
  startDate: Date, 
  endDate: Date, 
  calendarStart: Date, 
  totalDays: number
): { position: number; width: number } => {
  const msPerDay = 24 * 60 * 60 * 1000;
  
  // Calcular días desde el inicio del calendario
  const startDayDiff = Math.floor((startDate.getTime() - calendarStart.getTime()) / msPerDay);
  const endDayDiff = Math.floor((endDate.getTime() - calendarStart.getTime()) / msPerDay);
  
  // Asegurarse de que las fechas estén dentro del rango visible
  const adjustedStartDay = Math.max(0, startDayDiff);
  const adjustedEndDay = Math.min(totalDays, endDayDiff);
  
  if (adjustedStartDay >= totalDays || adjustedEndDay <= 0) {
    return { position: 0, width: 0 };
  }
  
  const position = (adjustedStartDay / totalDays) * 100;
  const width = ((adjustedEndDay - adjustedStartDay) / totalDays) * 100;
  
  return { 
    position: Math.max(0, position), 
    width: Math.max(CALENDAR_CONFIG.MIN_RESERVATION_WIDTH, width)
  };
};
