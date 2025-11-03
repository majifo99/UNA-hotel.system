/**
 * RoomsSection Component - Scalable Rooms Display Section
 * 
 * Uses real room data from API and displays rooms dynamically
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { RoomCard } from './RoomCard';
import { roomService } from '../../reservations/services/roomService';
import type { Room } from '../../../types/core';
import { formatCurrency } from '../utils/currency';

interface RoomsSectionProps {
  readonly title?: string;
  readonly subtitle?: string;
  readonly maxRooms?: number;
  readonly showViewAllButton?: boolean;
  readonly roomTypes?: string[]; // Filter by room types
  readonly className?: string;
}

export function RoomsSection({
  title = "Nuestras Habitaciones",
  subtitle = "Descubre la comodidad y elegancia en cada espacio",
  maxRooms = 3,
  showViewAllButton = true,
  roomTypes = [],
  className = ""
}: RoomsSectionProps) {
  const [rooms, setRooms] = useState<Room[]>([]);

  // Fetch rooms from API
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        // Get all room types to fetch available rooms
        // const roomTypesData = await roomService.getAllRoomTypes();
        
        // For now, fetch all available rooms (you can adjust the date range)
        const today = new Date().toISOString().split('T')[0];
        const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
        
        const availableRooms = await roomService.getAvailableRooms(today, tomorrow);
        
        setRooms(availableRooms);
      } catch (err) {
        console.error('Error fetching rooms:', err);
        setRooms([]);
      }
    };

    fetchRooms();
  }, []);
  
  // Filter and process rooms
  const getFilteredRooms = (): Room[] => {
    let filteredRooms = rooms.filter((room: Room) => room.isAvailable);
    
    // Filter by room types if specified
    if (roomTypes.length > 0) {
      filteredRooms = filteredRooms.filter((room: Room) => roomTypes.includes(room.type));
    }
    
    // Sort rooms by price to show a good variety
    filteredRooms.sort((a: Room, b: Room) => a.pricePerNight - b.pricePerNight);
    
    // If we need to limit, try to show variety (different types)
    if (maxRooms && filteredRooms.length > maxRooms) {
      const selectedRooms: Room[] = [];
      const typesUsed = new Set<string>();
      
      // First, try to get one room of each type
      for (const room of filteredRooms) {
        if (!typesUsed.has(room.type) && selectedRooms.length < maxRooms) {
          selectedRooms.push(room);
          typesUsed.add(room.type);
        }
      }
      
      // If we still need more rooms, add the cheapest remaining ones
      if (selectedRooms.length < maxRooms) {
        const remainingRooms = filteredRooms.filter((room: Room) => !selectedRooms.includes(room));
        const needed = maxRooms - selectedRooms.length;
        selectedRooms.push(...remainingRooms.slice(0, needed));
      }
      
      return selectedRooms;
    }
    
    return filteredRooms;
  };

  const displayRooms = getFilteredRooms();

  // Get room statistics for insights
  const getRoomStats = () => {
    const totalRooms = rooms.length;
    const availableRooms = rooms.filter((room: Room) => room.isAvailable).length;
    const roomTypeCount = new Set(rooms.map((room: Room) => room.type)).size;
    const priceRange = {
      min: rooms.length > 0 ? Math.min(...rooms.map((room: Room) => room.pricePerNight)) : 0,
      max: rooms.length > 0 ? Math.max(...rooms.map((room: Room) => room.pricePerNight)) : 0
    };
    
    return {
      totalRooms,
      availableRooms,
      roomTypeCount,
      priceRange
    };
  };

  const stats = getRoomStats();

  if (displayRooms.length === 0) {
    return (
      <section className={`py-16 bg-white ${className}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-una-primary-900 mb-4">
              {title}
            </h2>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md mx-auto">
              <p className="text-yellow-800">
                No hay habitaciones disponibles en este momento.
              </p>
              <p className="text-yellow-700 text-sm mt-2">
                Por favor contacte directamente al hotel para más información.
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`py-16 bg-white ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-una-primary-900 mb-4">
            {title}
          </h2>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto mb-6">
            {subtitle}
          </p>
          
          {/* Quick Stats */}
          <div className="flex justify-center items-center gap-6 text-sm text-neutral-600">
            <span className="bg-una-bg-200 px-3 py-1 rounded-full">
              {stats.availableRooms} habitaciones disponibles
            </span>
            <span className="bg-una-bg-200 px-3 py-1 rounded-full">
              {stats.roomTypeCount} tipos diferentes
            </span>
            <span className="bg-una-bg-200 px-3 py-1 rounded-full">
              Desde {formatCurrency(stats.priceRange.min)}/noche
            </span>
          </div>
        </div>

        {/* Rooms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {displayRooms.map((room) => (
            <RoomCard key={room.id} room={room} />
          ))}
        </div>

        {/* View All Button */}
        {showViewAllButton && (
          <div className="text-center">
            <Link
              to="/habitaciones"
              className="inline-block px-8 py-3 text-white rounded-md text-lg font-semibold hover:opacity-90 transition-opacity"
              style={{ backgroundColor: 'var(--color-darkGreen1)' }}
            >
              Ver Todas las Habitaciones ({displayRooms.length})
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
