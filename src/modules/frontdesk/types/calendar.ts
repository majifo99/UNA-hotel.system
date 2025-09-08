import type { Room } from './index';

export interface CalendarDay {
  date: Date;
  dateString: string;
  isToday: boolean;
  isPast: boolean;
  isWeekend: boolean;
}

export interface RoomReservation {
  id: string;
  guestName: string;
  startDate: Date;
  endDate: Date;
  status: Room['status'];
  position: number;
  width: number;
}

export interface RoomRowProps {
  room: Room;
  calendarDays: CalendarDay[];
  onRoomClick: (room: Room) => void;
}

export interface CalendarHeaderProps {
  calendarDays: CalendarDay[];
  viewMode: 'week' | 'month';
  currentMonthYear: string;
  onNavigateWeek: (direction: 'prev' | 'next') => void;
  onNavigateMonth: (direction: 'prev' | 'next') => void;
  onGoToToday: () => void;
  onViewModeChange: (mode: 'week' | 'month') => void;
  stats?: {
    availableRooms: number;
    occupiedRooms: number;
    occupancyRate: number;
  };
}

export interface RoomDetailsModalProps {
  room: Room | null;
  onClose: () => void;
}
