/**
 * Script de prueba para verificar el funcionamiento de las habitaciones
 */

import FrontdeskService from '../services/frontdeskService';

export const testRoomService = async () => {
  console.log('=== TESTING ROOM SERVICE (Laravel API) ===');
  
  try {
    // Test 1: Obtener todas las habitaciones
    console.log('1. 🏨 Obteniendo todas las habitaciones del Laravel API...');
    const allRooms = await FrontdeskService.getRooms();
    console.log('✅ Habitaciones encontradas:', allRooms.length);
    console.log('📋 Habitaciones:', allRooms.map(r => ({ 
      id: r.id, 
      number: r.number, 
      name: r.name,
      status: r.status,
      type: r.type,
      floor: r.floor,
      capacity: r.capacity,
      price: r.pricePerNight
    })));
    
    // Test 2: Buscar habitación específica
    if (allRooms.length > 0) {
      const firstRoom = allRooms[0];
      const roomNumber = firstRoom.number || firstRoom.id;
      
      console.log(`2. 🔍 Buscando habitación ${roomNumber}...`);
      const roomById = await FrontdeskService.getRoomById(roomNumber);
      console.log('✅ Habitación encontrada:', {
        id: roomById.id,
        number: roomById.number,
        name: roomById.name,
        status: roomById.status,
        description: roomById.description
      });
    }
    
    // Test 3: Filtrar habitaciones disponibles
    console.log('3. 🟢 Filtrando habitaciones disponibles...');
    const availableRooms = await FrontdeskService.getRooms({ status: 'available' });
    console.log('✅ Habitaciones disponibles:', availableRooms.length);
    console.log('📋 Disponibles:', availableRooms.map(r => `${r.number} (${r.name})`));
    
    // Test 4: Filtrar habitaciones por estado de limpieza
    console.log('4. 🧹 Filtrando habitaciones en limpieza...');
    const cleaningRooms = await FrontdeskService.getRooms({ status: 'cleaning' });
    console.log('✅ Habitaciones en limpieza:', cleaningRooms.length);
    console.log('📋 En limpieza:', cleaningRooms.map(r => `${r.number} (${r.name})`));
    
    return {
      success: true,
      totalRooms: allRooms.length,
      availableRooms: availableRooms.length,
      cleaningRooms: cleaningRooms.length,
      rooms: allRooms,
      summary: {
        total: allRooms.length,
        available: availableRooms.length,
        cleaning: cleaningRooms.length,
        occupied: allRooms.filter(r => r.status === 'occupied').length,
        maintenance: allRooms.filter(r => r.status === 'maintenance').length,
      }
    };
    
  } catch (error) {
    console.error('❌ Error en test de Laravel API:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
};

// Función para probar en la consola del navegador
if (typeof window !== 'undefined') {
  (window as any).testRooms = testRoomService;
}