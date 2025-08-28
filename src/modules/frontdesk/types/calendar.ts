import type { Room } from './index';

export interface CalendarDay {
  date: Date;
  dateString: string;
  isToday: boolean;
  isPast: boolean;
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
  onNavigateWeek: (direction: 'prev' | 'next') => void;
  onGoToToday: () => void;
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
