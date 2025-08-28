export type Room = {
  id: string;
  number: string;
  type: string;
  floor: number;
  status: string;
  assignedTo?: string | null;
  lastCleaned?: string | null;
  keyCode?: string | null;
  description?: string | null;
};

export type RoomFilters = {
  search: string;
  status: string;
  type: string;
  floor: string;
};


// Nuevo tipo para el personal
export type Staff = {
  id: string;
  name: string;
  role: string;
  availability: boolean;
};