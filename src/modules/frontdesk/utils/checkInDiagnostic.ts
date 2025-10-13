/**
 * 🔧 Diagnostic Helper for Check-in Room Availability Issues
 * 
 * This utility helps diagnose the "La habitación no está disponible en el rango" error
 * by providing detailed information about the reservation and room status.
 */

export interface DiagnosticResult {
  reservationData: any;
  roomData: any;
  availability: any;
  conflicts: any[];
  recommendations: string[];
}

/**
 * Ejecuta diagnóstico completo para un check-in específico
 */
export async function diagnoseCheckInIssue(
  reservaId: number,
  roomNumber: string,
  checkInDate: string,
  checkOutDate: string
): Promise<DiagnosticResult> {
  const result: DiagnosticResult = {
    reservationData: null,
    roomData: null,
    availability: null,
    conflicts: [],
    recommendations: []
  };

  console.log('🔧 INICIANDO DIAGNÓSTICO DE CHECK-IN');
  console.log('=' .repeat(50));
  console.log(`📋 Reserva ID: ${reservaId}`);
  console.log(`🏠 Habitación: ${roomNumber}`);
  console.log(`📅 Fechas: ${checkInDate} → ${checkOutDate}`);
  console.log('=' .repeat(50));

  try {
    // 1. Obtener datos de la reserva
    console.log('\n1️⃣ OBTENIENDO DATOS DE LA RESERVA...');
    const reservationResponse = await fetch(`/api/frontdesk/reserva/${reservaId}`);
    if (reservationResponse.ok) {
      result.reservationData = await reservationResponse.json();
      console.log('✅ Reserva encontrada:', result.reservationData);
      
      // Análisis de la reserva
      const reservaFechas = {
        llegada: result.reservationData.fecha_llegada,
        salida: result.reservationData.fecha_salida,
        habitacionAsignada: result.reservationData.id_hab_asignada || result.reservationData.room_id
      };
      
      console.log('📊 Análisis de la reserva:');
      console.log(`   - Fecha llegada reserva: ${reservaFechas.llegada}`);
      console.log(`   - Fecha salida reserva: ${reservaFechas.salida}`);
      console.log(`   - Habitación asignada: ${reservaFechas.habitacionAsignada}`);
      console.log(`   - Estado: ${result.reservationData.estado || result.reservationData.status}`);
      
      // Comparar fechas
      if (reservaFechas.llegada && reservaFechas.salida) {
        const reservaLlegadaDate = reservaFechas.llegada.split('T')[0];
        const reservaSalidaDate = reservaFechas.salida.split('T')[0];
        
        if (reservaLlegadaDate !== checkInDate) {
          result.recommendations.push(`⚠️ CONFLICTO DE FECHAS: Reserva llega ${reservaLlegadaDate}, check-in intenta ${checkInDate}`);
        }
        
        if (reservaSalidaDate !== checkOutDate) {
          result.recommendations.push(`⚠️ CONFLICTO DE FECHAS: Reserva sale ${reservaSalidaDate}, check-in intenta ${checkOutDate}`);
        }
      }
      
      // Verificar habitación
      if (reservaFechas.habitacionAsignada) {
        result.recommendations.push(`💡 La reserva tiene asignada la habitación ID ${reservaFechas.habitacionAsignada}`);
      }
      
    } else {
      console.log('❌ No se pudo obtener datos de la reserva');
      result.recommendations.push('❌ Reserva no encontrada o inaccesible');
    }

    // 2. Obtener datos de habitaciones
    console.log('\n2️⃣ OBTENIENDO DATOS DE HABITACIONES...');
    const roomsResponse = await fetch('/api/habitaciones');
    if (roomsResponse.ok) {
      const rooms = await roomsResponse.json();
      console.log(`✅ ${rooms.length} habitaciones encontradas`);
      
      const targetRoom = rooms.find((r: any) => r.numero === roomNumber);
      if (targetRoom) {
        result.roomData = targetRoom;
        console.log('✅ Habitación objetivo encontrada:', targetRoom);
      } else {
        console.log(`❌ Habitación ${roomNumber} NO encontrada`);
        result.recommendations.push(`❌ Habitación ${roomNumber} no existe en el sistema`);
        
        // Mostrar habitaciones disponibles
        console.log('💡 Habitaciones disponibles:');
        rooms.slice(0, 10).forEach((r: any) => {
          console.log(`   - ID: ${r.id}, Número: ${r.numero}, Tipo: ${r.tipo}`);
        });
        
        result.recommendations.push('💡 Usar una de las habitaciones listadas arriba');
      }
    } else {
      console.log('❌ No se pudieron obtener habitaciones');
    }

    // 3. Verificar conflictos específicos
    console.log('\n3️⃣ VERIFICANDO CONFLICTOS...');
    if (result.roomData) {
      try {
        const conflictsResponse = await fetch(`/api/habitaciones/${result.roomData.id}/reservas`);
        if (conflictsResponse.ok) {
          const existingReservations = await conflictsResponse.json();
          console.log(`📊 ${existingReservations.length} reservas existentes para esta habitación`);
          
          // Filtrar conflictos
          const checkIn = new Date(checkInDate);
          const checkOut = new Date(checkOutDate);
          
          result.conflicts = existingReservations.filter((reserva: any) => {
            const reservaInicio = new Date(reserva.fecha_llegada || reserva.check_in_date);
            const reservaFin = new Date(reserva.fecha_salida || reserva.check_out_date);
            
            // Verificar solapamiento
            return (checkIn < reservaFin && checkOut > reservaInicio);
          });
          
          if (result.conflicts.length > 0) {
            console.log(`❌ ${result.conflicts.length} conflictos encontrados:`);
            result.conflicts.forEach((conflict, index) => {
              console.log(`   ${index + 1}. Reserva ID: ${conflict.id}, Fechas: ${conflict.fecha_llegada} → ${conflict.fecha_salida}`);
            });
            
            result.recommendations.push(`❌ HAY ${result.conflicts.length} RESERVAS EN CONFLICTO en esas fechas`);
          } else {
            console.log('✅ No se encontraron conflictos de fechas');
            result.recommendations.push('✅ No hay conflictos de fechas aparentes');
          }
        }
      } catch (error) {
        console.log('⚠️ No se pudieron verificar conflictos específicos');
      }
    }

    // 4. Recomendaciones finales
    console.log('\n4️⃣ RECOMENDACIONES:');
    if (result.recommendations.length === 0) {
      result.recommendations.push('✅ Todo parece correcto, el error puede ser temporal');
    }
    
    result.recommendations.forEach((rec, index) => {
      console.log(`   ${index + 1}. ${rec}`);
    });

  } catch (error) {
    console.error('❌ Error durante el diagnóstico:', error);
    result.recommendations.push('❌ Error durante el diagnóstico, revisar conectividad');
  }

  console.log('\n🔧 DIAGNÓSTICO COMPLETADO');
  console.log('=' .repeat(50));
  
  return result;
}

/**
 * Función rápida para llamar desde la consola del navegador
 */
export function quickDiagnose(reservaId: number, roomNumber: string, checkInDate: string, checkOutDate: string): void {
  diagnoseCheckInIssue(reservaId, roomNumber, checkInDate, checkOutDate)
    .then(result => {
      console.log('🎯 DIAGNÓSTICO COMPLETADO - RESULTADO:');
      console.table(result.recommendations);
      
      // Mostrar datos clave
      if (result.reservationData) {
        console.log('📋 DATOS CLAVE DE LA RESERVA:');
        console.log({
          id: result.reservationData.id_reserva,
          cliente: result.reservationData.id_cliente,
          fechaLlegada: result.reservationData.fecha_llegada,
          fechaSalida: result.reservationData.fecha_salida,
          habitacionAsignada: result.reservationData.id_hab_asignada,
          estado: result.reservationData.estado
        });
      }
      
      if (result.roomData) {
        console.log('🏠 DATOS DE LA HABITACIÓN:');
        console.log(result.roomData);
      }
    })
    .catch(error => {
      console.error('❌ Error en diagnóstico rápido:', error);
    });
}

/**
 * Consola helper - Agregar a window para fácil acceso
 */
declare global {
  interface Window {
    diagnoseCheckIn: typeof quickDiagnose;
  }
}

// Hacer disponible globalmente en desarrollo
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  (window as any).diagnoseCheckIn = quickDiagnose;
  console.log('🔧 Diagnóstico disponible: window.diagnoseCheckIn(reservaId, roomNumber, checkInDate, checkOutDate)');
}