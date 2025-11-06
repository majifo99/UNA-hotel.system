/**
 * Helper para testing de check-in con la estructura exacta
 * Muestra exactamente qué datos se envían al backend
 */

import type { CheckInRequestDTO } from '../types/checkin-api';

export interface CheckInTestData {
  reservaId: number;
  roomNumber: string;
  checkInDate: string;
  checkOutDate: string;
  adultos: number;
  ninos: number;
  bebes: number;
  observacion_checkin?: string;
}

/**
 * Crea el payload exacto que coincide con tu POST estructura
 */
export function createExactCheckInPayload(testData: CheckInTestData): {
  endpoint: string;
  payload: CheckInRequestDTO;
} {
  const payload: CheckInRequestDTO = {
    id_cliente_titular: 1,
    fecha_llegada: testData.checkInDate,
    fecha_salida: testData.checkOutDate,
    adultos: testData.adultos,
    ninos: testData.ninos,
    bebes: testData.bebes,
    id_hab: Number.parseInt(testData.roomNumber, 10) || 1,
    nombre_asignacion: "Asignación desde FrontDesk",
    observacion_checkin: testData.observacion_checkin || "Cliente llega a las 3pm"
  };

  return {
    endpoint: `/frontdesk/reserva/${testData.reservaId}/checkin`,
    payload
  };
}

/**
 * Ejemplo de uso con los datos que proporcionaste
 */
export function getExampleCheckInData(): CheckInTestData {
  return {
    reservaId: 1, // ID de la reserva
    roomNumber: "1", // Se convierte a id_hab: 1
    checkInDate: "2025-09-28",
    checkOutDate: "2025-09-29", 
    adultos: 2,
    ninos: 2,
    bebes: 1,
    observacion_checkin: "Cliente llega a las 3pm"
  };
}

/**
 * Genera el JSON que se enviaría exactamente al backend
 */
export function logExactPayload(): void {
  const testData = getExampleCheckInData();
  const { endpoint, payload } = createExactCheckInPayload(testData);
  
  console.log('🎯 Endpoint de check-in:', endpoint);
  console.log('📝 Payload exacto que se envía:');
  console.log(JSON.stringify(payload, null, 2));
}

/**
 * Función para debugging específico del error de habitación
 */
export async function debugRoomIdIssue(roomNumber: string): Promise<void> {
  console.log('🔧 DEBUG: Investigando problema de ID de habitación');
  console.log(`Número de habitación ingresado: "${roomNumber}"`);
  
  // Esta función se puede llamar desde la consola del navegador para debug
  console.log(`
  Para debuggear el problema de habitación:
  
  1. Abre las herramientas de desarrollador
  2. Ve a la pestaña Network 
  3. Intenta hacer check-in
  4. Busca la llamada a /frontdesk/habitaciones
  5. Verifica qué habitaciones están disponibles
  
  Alternativa - ejecuta en consola:
  fetch('/api/frontdesk/habitaciones')
    .then(r => r.json())
    .then(data => console.log('Habitaciones disponibles:', data));
  `);
}

/**
 * Sugiere habitaciones alternativas basadas en un patrón
 */
export function suggestAlternativeRooms(attemptedRoom: string): string[] {
  const suggestions = [];
  const roomNum = Number.parseInt(attemptedRoom, 10);
  
  if (!isNaN(roomNum)) {
    // Sugerir habitaciones cercanas
    for (let i = 1; i <= 10; i++) {
      suggestions.push(i.toString());
    }
    
    // Sugerir variaciones del número ingresado
    suggestions.push(`10${roomNum}`); // Ej: si ingresa 1, sugerir 101
    suggestions.push(`20${roomNum}`); // Ej: si ingresa 1, sugerir 201
  }
  
  return suggestions;
}

/**
 * Valida que el payload tenga la estructura correcta
 */
export function validatePayloadStructure(payload: CheckInRequestDTO): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  // Validar campos requeridos
  if (typeof payload.id_cliente_titular !== 'number' || payload.id_cliente_titular <= 0) {
    errors.push('id_cliente_titular debe ser un número positivo');
  }
  
  if (!payload.fecha_llegada || !/^\d{4}-\d{2}-\d{2}$/.test(payload.fecha_llegada)) {
    errors.push('fecha_llegada debe tener formato YYYY-MM-DD');
  }
  
  if (!payload.fecha_salida || !/^\d{4}-\d{2}-\d{2}$/.test(payload.fecha_salida)) {
    errors.push('fecha_salida debe tener formato YYYY-MM-DD');
  }
  
  if (typeof payload.adultos !== 'number' || payload.adultos < 1) {
    errors.push('adultos debe ser un número >= 1');
  }
  
  if (typeof payload.ninos !== 'number' || payload.ninos < 0) {
    errors.push('ninos debe ser un número >= 0');
  }
  
  if (typeof payload.bebes !== 'number' || payload.bebes < 0) {
    errors.push('bebes debe ser un número >= 0');
  }
  
  if (typeof payload.id_hab !== 'number' || payload.id_hab <= 0) {
    errors.push('id_hab debe ser un número positivo');
  }
  
  if (!payload.nombre_asignacion?.trim()) {
    errors.push('nombre_asignacion es requerido');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Función de testing directo usando el servicio mejorado
 */
export async function testCheckInWithService(reservaId: number = 1): Promise<void> {
  try {
    const { checkInApiService } = await import('../services/checkInApiService');
    
    console.log('🧪 Iniciando test con servicio mejorado...');
    
    // Usar datos de ejemplo
    const testData = getExampleCheckInData();
    console.log('📊 Datos de prueba:', testData);
    
    // Crear payload exacto
    const { payload } = createExactCheckInPayload(testData);
    console.log('📝 Payload generado:', payload);
    
    // Validar estructura
    const validation = validatePayloadStructure(payload);
    if (!validation.isValid) {
      console.error('❌ Payload inválido:', validation.errors);
      return;
    }
    
    console.log('✅ Payload válido, ejecutando check-in...');
    
    // Ejecutar check-in con datos exactos
    const resultado = await checkInApiService.performCheckInWithExactData(reservaId, payload);
    
    console.log('🎉 Check-in exitoso:', {
      reservaId: resultado.reservaId,
      origenDatos: resultado.origenDatos, 
      endpointUsado: resultado.endpointUsado,
      respuesta: resultado.data
    });
    
  } catch (error) {
    console.error('❌ Error en test de check-in:', error);
    
    // Diagnóstico adicional
    console.log('🔍 Ejecutando diagnósticos...');
    try {
      const { checkInApiService } = await import('../services/checkInApiService');
      const rutas = await checkInApiService.checkAvailableRoutes();
      console.log('📡 Rutas disponibles:', rutas);
    } catch (diagError) {
      console.error('❌ Diagnósticos fallaron:', diagError);
    }
  }
}

/**
 * Test con datos personalizados
 */
export async function testCustomCheckIn(
  reservaId: number,
  customData: Partial<CheckInRequestDTO>
): Promise<void> {
  try {
    const { checkInApiService } = await import('../services/checkInApiService');
    
    // Combinar con datos base
    const baseData = getExampleCheckInData();
    const { payload } = createExactCheckInPayload(baseData);
    
    const finalPayload: CheckInRequestDTO = {
      ...payload,
      ...customData
    };
    
    console.log('🎯 Test personalizado:', finalPayload);
    
    const resultado = await checkInApiService.performCheckInWithExactData(reservaId, finalPayload);
    console.log('✅ Test personalizado exitoso:', resultado);
    
  } catch (error) {
    console.error('❌ Error en test personalizado:', error);
  }
}