import { useState, useCallback } from 'react';
import FrontdeskService from '../services/frontdeskService';
import type { RoomInfo, RoomSearchFilters, RoomAvailability } from '../types/room';

// Helper function to map room status
const mapRoomStatus = (status: string | undefined): 'available' | 'occupied' | 'maintenance' | 'reserved' => {
  return status === 'available' ? 'available' : status === 'occupied' ? 'occupied' : status === 'maintenance' ? 'maintenance' : 'reserved';
};

export const useRoomSelection = () => {
  const [selectedRoom, setSelectedRoom] = useState<RoomInfo | null>(null);
  const [availableRooms, setAvailableRooms] = useState<RoomInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Buscar habitaciones disponibles
  const searchRooms = useCallback(async (filters: Partial<RoomSearchFilters>) => {
    setIsLoading(true);
    
    try {
      // Call the real API
      const rooms = await FrontdeskService.getRooms();
      
      // Convert Room[] to RoomInfo[] and filter
      let filtered = rooms.map(room => ({
        id: room.id, // Agregar el ID
        number: room.number || room.id,
        type: room.type,
        capacity: { 
          adults: Math.floor(room.capacity * 0.7), // Estimate adults as 70% of capacity
          children: Math.floor(room.capacity * 0.3), // Estimate children as 30% of capacity
          total: room.capacity 
        },
        floor: room.floor || 1,
        status: mapRoomStatus(room.status),
        amenities: room.amenities,
        price: { base: room.pricePerNight, currency: 'USD' },
        features: { 
          hasBalcony: false, 
          hasSeaView: false, 
          hasKitchen: room.amenities.includes('kitchen'), 
          smokingAllowed: false 
        },
        guestName: undefined // Will be populated if occupied
      })).filter(room => room.status === 'available');
      
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
  const searchRoomSuggestions = useCallback(async (query: string) => {
    // Si el query está vacío, mostrar todas las disponibles (útil para Walk-In)
    const showAll = query.trim() === '';

    try {
      // Fetch all available rooms for suggestions
      const allRooms = await FrontdeskService.getRooms({ status: 'available' });
      
      let filtered = allRooms;
      
      // Si hay query, filtrar por coincidencia
      if (!showAll) {
        filtered = allRooms.filter(room => {
          const roomNumber = room.number || room.id;
          return roomNumber.toLowerCase().includes(query.toLowerCase());
        });
      }
      
      const suggestions = filtered
        .map(room => room.number || room.id)
        .slice(0, showAll ? 15 : 10); // Mostrar más cuando se muestran todas

      console.log(`🔍 Sugerencias de habitaciones para "${query || 'TODAS'}":`, suggestions);
      setSuggestions(suggestions);
    } catch (error) {
      console.error('Error searching room suggestions:', error);
      setSuggestions([]);
    }
  }, []);

  // Obtener información de una habitación específica
  const getRoomInfo = useCallback(async (roomNumber: string): Promise<RoomInfo | null> => {
    try {
      const room = await FrontdeskService.getRoomById(roomNumber);
      return {
        id: room.id, // Agregar el ID
        number: room.number || room.id,
        type: room.type,
        capacity: { 
          adults: Math.floor(room.capacity * 0.7),
          children: Math.floor(room.capacity * 0.3),
          total: room.capacity 
        },
        floor: room.floor || 1,
        status: mapRoomStatus(room.status),
        amenities: room.amenities,
        price: { base: room.pricePerNight, currency: 'USD' },
        features: { 
          hasBalcony: false, 
          hasSeaView: false, 
          hasKitchen: room.amenities.includes('kitchen'), 
          smokingAllowed: false 
        },
        guestName: undefined
      };
    } catch (error) {
      console.error('Error getting room info:', error);
      return null;
    }
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
      
      const room = await getRoomInfo(roomNumber);
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
  const selectRoom = useCallback(async (roomNumber: string) => {
    const room = await getRoomInfo(roomNumber);
    setSelectedRoom(room);
    setSuggestions([]);
  }, [getRoomInfo]);

  // Limpiar selección
  const clearSelection = useCallback(() => {
    setSelectedRoom(null);
    setSuggestions([]);
  }, []);

  // Obtener habitaciones por piso
  const getRoomsByFloor = useCallback(async (floor: number): Promise<RoomInfo[]> => {
    try {
      const rooms = await FrontdeskService.getRooms({ floor });
      return rooms.map(room => ({
        id: room.id, // Agregar el ID
        number: room.number || room.id,
        type: room.type,
        capacity: { 
          adults: Math.floor(room.capacity * 0.7),
          children: Math.floor(room.capacity * 0.3),
          total: room.capacity 
        },
        floor: room.floor || 1,
        status: mapRoomStatus(room.status),
        amenities: room.amenities,
        price: { base: room.pricePerNight, currency: 'USD' },
        features: { 
          hasBalcony: false, 
          hasSeaView: false, 
          hasKitchen: room.amenities.includes('kitchen'), 
          smokingAllowed: false 
        },
        guestName: undefined
      }));
    } catch (error) {
      console.error('Error getting rooms by floor:', error);
      return [];
    }
  }, []);

  // Obtener estadísticas de habitaciones
  const getRoomStats = useCallback(async () => {
    try {
      const rooms = await FrontdeskService.getRooms();
      const total = rooms.length;
      const available = rooms.filter(room => room.status === 'available').length;
      const occupied = rooms.filter(room => room.status === 'occupied').length;
      const maintenance = rooms.filter(room => room.status === 'maintenance').length;

      return {
        total,
        available,
        occupied,
        maintenance,
        occupancyRate: ((occupied / total) * 100).toFixed(1)
      };
    } catch (error) {
      console.error('Error getting room stats:', error);
      return {
        total: 0,
        available: 0,
        occupied: 0,
        maintenance: 0,
        occupancyRate: '0.0'
      };
    }
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
  };
};