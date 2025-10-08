/**
 * Interfaces para la API de habitaciones del Laravel backend
 */

// Estructura de respuesta de habitaciones del Laravel backend
export interface LaravelRoomResponse {
  current_page: number;
  data: LaravelRoom[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: Array<{
    url: string | null;
    label: string;
    page: number | null;
    active: boolean;
  }>;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

// Estructura individual de habitación del Laravel backend
export interface LaravelRoom {
  id_habitacion: number;
  id_estado_hab: number;
  tipo_habitacion_id: number;
  nombre: string;
  numero: string;
  piso: number;
  capacidad: number;
  medida: string;
  descripcion: string;
  precio_base: string;
  moneda: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  estado: {
    id_estado_hab: number;
    nombre: string;
    tipo: string;
    descripcion: string;
    created_at: string;
    updated_at: string;
  };
  tipo: {
    id_tipo_hab: number;
    nombre: string;
    descripcion: string;
    created_at: string;
    updated_at: string;
  };
}

// Función para mapear datos del Laravel backend a la estructura interna
export function mapLaravelRoomToRoom(laravelRoom: LaravelRoom): import('../../../types/core').Room {
  // Mapear estado del Laravel backend a estados internos
  const mapStatus = (estadoNombre: string): 'available' | 'occupied' | 'maintenance' | 'cleaning' => {
    const estado = estadoNombre.toLowerCase();
    if (estado.includes('disponible')) return 'available';
    if (estado.includes('ocupada') || estado.includes('ocupado')) return 'occupied';
    if (estado.includes('mantenimiento')) return 'maintenance';
    if (estado.includes('sucia') || estado.includes('limpieza')) return 'cleaning';
    return 'maintenance'; // default
  };

  // Mapear tipo de habitación del Laravel backend a tipos internos
  const mapRoomType = (tipoNombre: string): 'single' | 'double' | 'triple' | 'suite' | 'family' | 'deluxe' => {
    const tipo = tipoNombre.toLowerCase();
    if (tipo.includes('suite')) return 'suite';
    if (tipo.includes('junior')) return 'deluxe';
    if (tipo.includes('deluxe')) return 'deluxe';
    if (tipo.includes('family') || tipo.includes('familiar')) return 'family';
    if (tipo.includes('triple')) return 'triple';
    if (tipo.includes('double') || tipo.includes('doble')) return 'double';
    return 'single'; // default
  };

  return {
    id: laravelRoom.id_habitacion.toString(),
    number: laravelRoom.numero,
    name: laravelRoom.nombre,
    type: mapRoomType(laravelRoom.tipo.nombre),
    floor: laravelRoom.piso,
    capacity: laravelRoom.capacidad,
    pricePerNight: parseFloat(laravelRoom.precio_base),
    basePrice: parseFloat(laravelRoom.precio_base),
    status: mapStatus(laravelRoom.estado.nombre),
    isAvailable: laravelRoom.estado.nombre.toLowerCase().includes('disponible'),
    amenities: [], // No viene en la API, se puede añadir después
    description: laravelRoom.descripcion,
  };
}

// Función para mapear datos internos de vuelta al formato Laravel (si es necesario)
export function mapRoomToLaravelFormat(room: import('../../../types/core').Room): Partial<LaravelRoom> {
  return {
    numero: room.number || '',
    nombre: room.name || '',
    piso: room.floor || 1,
    capacidad: room.capacity || 1,
    descripcion: room.description || '',
    precio_base: room.pricePerNight?.toString() || '0',
  };
}