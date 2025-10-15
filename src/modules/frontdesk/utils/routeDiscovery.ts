/**
 * 🔧 Backend Route Discovery Tool
 * 
 * This tool helps identify which API routes are available in your Laravel backend
 * when the expected routes return 404 errors.
 */

/**
 * Discovers available API routes by testing common patterns
 */
export async function discoverBackendRoutes(): Promise<void> {
  console.log('🔍 DESCOBRIENDO RUTAS DISPONIBLES EN EL BACKEND');
  console.log('=' .repeat(60));

  const baseUrl = window.location.origin;
  
  // Common route patterns to test
  const routePatterns = [
    // Reservation routes
    '/api/reservaciones',
    '/api/reservas', 
    '/api/reservations',
    '/api/frontdesk/reservaciones',
    '/api/frontdesk/reservas',
    '/api/frontdesk/reservations',
    
    // Room routes  
    '/api/habitaciones',
    '/api/rooms',
    '/api/frontdesk/habitaciones',
    '/api/frontdesk/rooms',
    
    // Check-in routes
    '/api/checkin',
    '/api/check-in',
    '/api/frontdesk/checkin',
    '/api/frontdesk/check-in',
    
    // General frontdesk routes
    '/api/frontdesk',
    
    // Laravel common routes
    '/api/routes',
    '/routes',
  ];

  console.log('🌐 Base URL:', baseUrl);
  console.log('\n📋 PROBANDO RUTAS COMUNES...');
  
  const results: Array<{route: string, status: number, available: boolean}> = [];

  for (const route of routePatterns) {
    try {
      const url = `${baseUrl}${route}`;
      const response = await fetch(url, { 
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      
      const available = response.status !== 404;
      results.push({
        route,
        status: response.status,
        available
      });
      
      console.log(`${available ? '✅' : '❌'} ${route} (${response.status})`);
      
      // If route is available, try to get more info
      if (available && response.status === 200) {
        try {
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            console.log(`   📊 Datos encontrados: ${data.length} elementos`);
          } else if (typeof data === 'object') {
            console.log(`   📊 Respuesta:`, Object.keys(data));
          }
        } catch (e) {
          // Ignore JSON parsing errors
        }
      }
      
    } catch (error) {
      console.log(`❌ ${route} (Error: ${error})`);
      results.push({
        route,
        status: 0,
        available: false
      });
    }
    
    // Small delay to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('\n📊 RESUMEN DE RUTAS DISPONIBLES:');
  const availableRoutes = results.filter(r => r.available);
  const unavailableRoutes = results.filter(r => !r.available);
  
  if (availableRoutes.length > 0) {
    console.log('✅ RUTAS DISPONIBLES:');
    availableRoutes.forEach(r => {
      console.log(`   - ${r.route} (${r.status})`);
    });
  } else {
    console.log('❌ NO SE ENCONTRARON RUTAS DISPONIBLES');
  }

  if (unavailableRoutes.length > 0) {
    console.log('\n❌ RUTAS NO DISPONIBLES:');
    unavailableRoutes.forEach(r => {
      console.log(`   - ${r.route} (${r.status})`);
    });
  }

  return;
}

/**
 * Tests specific reservation and check-in patterns for a given ID
 */
export async function testReservationRoutes(reservaId: number = 1): Promise<void> {
  console.log(`\n🎯 PROBANDO RUTAS ESPECÍFICAS PARA RESERVA ${reservaId}:`);
  console.log('-'.repeat(50));
  
  const baseUrl = window.location.origin;
  
  const specificRoutes = [
    `/api/reservas/${reservaId}`,
    `/api/reservaciones/${reservaId}`,
    `/api/reservations/${reservaId}`,
    `/api/frontdesk/reservas/${reservaId}`,
    `/api/frontdesk/reservaciones/${reservaId}`,
    `/api/frontdesk/reservations/${reservaId}`,
    `/api/frontdesk/reserva/${reservaId}`,
    
    // Check-in routes
    `/api/reservas/${reservaId}/checkin`,
    `/api/reservaciones/${reservaId}/checkin`,
    `/api/reservations/${reservaId}/checkin`,
    `/api/frontdesk/reservas/${reservaId}/checkin`,
    `/api/frontdesk/reservaciones/${reservaId}/checkin`,
    `/api/frontdesk/reservations/${reservaId}/checkin`,
    `/api/frontdesk/reserva/${reservaId}/checkin`,
  ];

  for (const route of specificRoutes) {
    try {
      const url = `${baseUrl}${route}`;
      const response = await fetch(url, { 
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      
      const available = response.status !== 404;
      console.log(`${available ? '✅' : '❌'} ${route} (${response.status})`);
      
      if (available && response.status === 200) {
        try {
          const data = await response.json();
          console.log(`   📋 Datos de reserva:`, data);
        } catch (e) {
          console.log(`   📋 Respuesta no JSON`);
        }
      }
      
    } catch (error) {
      console.log(`❌ ${route} (Error: ${error})`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

/**
 * Quick function for browser console
 */
export function quickRouteCheck(): void {
  console.log('🚀 INICIANDO DESCOBRIMIENTO DE RUTAS...');
  
  discoverBackendRoutes()
    .then(() => {
      console.log('\n🎯 PROBANDO RUTAS DE RESERVA...');
      return testReservationRoutes(16); // Use the specific reservation ID from your error
    })
    .then(() => {
      console.log('\n✅ DESCOBRIMIENTO COMPLETADO');
      console.log('\n💡 PRÓXIMOS PASOS:');
      console.log('1. Revisar las rutas disponibles arriba');
      console.log('2. Verificar en tu backend Laravel qué rutas están definidas');
      console.log('3. Actualizar el frontend para usar las rutas correctas');
      console.log('\n🔧 Para ver rutas en Laravel, ejecutar en terminal:');
      console.log('   php artisan route:list | grep -i reserva');
      console.log('   php artisan route:list | grep -i frontdesk');
    })
    .catch(error => {
      console.error('❌ Error durante descobrimiento:', error);
    });
}

// Make available globally in development
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  (window as any).discoverRoutes = quickRouteCheck;
  (window as any).testReservationRoutes = testReservationRoutes;
  console.log('🔧 Route discovery available: window.discoverRoutes()');
}