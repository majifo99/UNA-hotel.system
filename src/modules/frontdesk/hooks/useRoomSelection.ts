import { useState, useCallback } from 'react';
import type { RoomInfo, RoomSearchFilters, RoomAvailability } from '../types/room';

// Mock de datos de habitaciones (esto vendrá del backend)
const MOCK_ROOMS: RoomInfo[] = [
  {
    number: '101',
    type: 'Estándar',
    capacity: { adults: 2, children: 1, total: 3 },
    floor: 1,
    status: 'available',
    amenities: ['WiFi', 'TV', 'Aire Acondicionado'],
    price: { base: 120, currency: 'USD' },
    features: { hasBalcony: false, hasSeaView: false, hasKitchen: false, smokingAllowed: false }
  },
  {
    number: '102',
    type: 'Superior',
    capacity: { adults: 2, children: 2, total: 4 },
    floor: 1,
    status: 'available',
    amenities: ['WiFi', 'TV', 'Aire Acondicionado', 'Minibar'],
    price: { base: 150, currency: 'USD' },
    features: { hasBalcony: true, hasSeaView: false, hasKitchen: false, smokingAllowed: false }
  },
  {
    number: '201',
    type: 'Deluxe',
    capacity: { adults: 3, children: 2, total: 5 },
    floor: 2,
    status: 'available',
    amenities: ['WiFi', 'TV', 'Aire Acondicionado', 'Minibar', 'Jacuzzi'],
    price: { base: 200, currency: 'USD' },
    features: { hasBalcony: true, hasSeaView: true, hasKitchen: false, smokingAllowed: false }
  },
  {
    number: '301',
    type: 'Suite',
    capacity: { adults: 4, children: 2, total: 6 },
    floor: 3,
    status: 'occupied',
    amenities: ['WiFi', 'TV', 'Aire Acondicionado', 'Minibar', 'Jacuzzi', 'Cocina'],
    price: { base: 350, currency: 'USD' },
    features: { hasBalcony: true, hasSeaView: true, hasKitchen: true, smokingAllowed: false }
  }
];

export const useRoomSelection = () => {
  const [selectedRoom, setSelectedRoom] = useState<RoomInfo | null>(null);
  const [availableRooms, setAvailableRooms] = useState<RoomInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Buscar habitaciones disponibles
  const searchRooms = useCallback(async (filters: Partial<RoomSearchFilters>) => {
    setIsLoading(true);
    
    try {
      // Simular llamada al API
      await new Promise(resolve => setTimeout(resolve, 300));
      
      let filtered = MOCK_ROOMS.filter(room => room.status === 'available');
      
      if (filters.guests && filters.guests > 0) {
        filtered = filtered.filter(room => room.capacity.total >= filters.guests!);
      }
      
      if (filters.roomType) {
        filtered = filtered.filter(room => 
          room.type.toLowerCase().includes(filters.roomType!.toLowerCase())
        );
      }
      
      setAvailableRooms(filtered);
    } catch (error) {
      console.error('Error searching rooms:', error);
      setAvailableRooms([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Buscar sugerencias de habitaciones por número
  const searchRoomSuggestions = useCallback((query: string) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    const filtered = MOCK_ROOMS
      .filter(room => 
        room.number.toLowerCase().includes(query.toLowerCase()) &&
        room.status === 'available'
      )
      .map(room => room.number)
      .slice(0, 5);

    setSuggestions(filtered);
  }, []);

  // Obtener información de una habitación específica
  const getRoomInfo = useCallback((roomNumber: string): RoomInfo | null => {
    return MOCK_ROOMS.find(room => room.number === roomNumber) || null;
  }, []);

  // Verificar disponibilidad de una habitación específica
  const checkRoomAvailability = useCallback(async (
    roomNumber: string, 
    _checkIn: string, 
    _checkOut: string
  ): Promise<RoomAvailability | null> => {
    setIsLoading(true);
    
    try {
      // Simular llamada al API
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const room = getRoomInfo(roomNumber);
      if (!room) return null;

      // Mock de verificación de disponibilidad
      const isAvailable = room.status === 'available';
      
      return {
        room,
        isAvailable,
        conflictingReservations: isAvailable ? [] : ['RES-2024-001'],
        nextAvailableDate: isAvailable ? undefined : '2024-10-15'
      };
    } catch (error) {
      console.error('Error checking room availability:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [getRoomInfo]);

  // Seleccionar una habitación
  const selectRoom = useCallback((roomNumber: string) => {
    const room = getRoomInfo(roomNumber);
    setSelectedRoom(room);
    setSuggestions([]);
  }, [getRoomInfo]);

  // Limpiar selección
  const clearSelection = useCallback(() => {
    setSelectedRoom(null);
    setSuggestions([]);
  }, []);

  // Obtener habitaciones por piso
  const getRoomsByFloor = useCallback((floor: number): RoomInfo[] => {
    return MOCK_ROOMS.filter(room => room.floor === floor);
  }, []);

  // Obtener estadísticas de habitaciones
  const getRoomStats = useCallback(() => {
    const total = MOCK_ROOMS.length;
    const available = MOCK_ROOMS.filter(room => room.status === 'available').length;
    const occupied = MOCK_ROOMS.filter(room => room.status === 'occupied').length;
    const maintenance = MOCK_ROOMS.filter(room => room.status === 'maintenance').length;

    return {
      total,
      available,
      occupied,
      maintenance,
      occupancyRate: ((occupied / total) * 100).toFixed(1)
    };
  }, []);

  return {
    // Estado
    selectedRoom,
    availableRooms,
    isLoading,
    suggestions,
    
    // Acciones
    searchRooms,
    searchRoomSuggestions,
    getRoomInfo,
    checkRoomAvailability,
    selectRoom,
    clearSelection,
    getRoomsByFloor,
    getRoomStats,
    
    // Datos mock (remover cuando se conecte al backend)
    allRooms: MOCK_ROOMS
  };
};