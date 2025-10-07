/**
 * Script de prueba para endpoints de Folios
 * ==========================================
 * 
 * Este script prueba todos los endpoints de folios implementados
 * para asegurar que la integración frontend-backend funciona correctamente.
 * 
 * Endpoints probados:
 * - GET /api/folios/{id}/resumen
 * - POST /api/folios/{id}/distribuir
 * - POST /api/folios/{id}/pagos
 * - POST /api/folios/{id}/cerrar
 * - GET /api/folios/{id}/historial
 */

// Ejemplo de uso del servicio de folios
import { folioService } from '../services/folioService';

const FOLIO_ID_PRUEBA = 1; // Cambiar por un ID de folio válido en tu sistema

async function probarEndpointsFolio() {
  console.log('🧪 Iniciando pruebas de endpoints de folios...');

  try {
    // 1. Obtener resumen del folio
    console.log('\n📊 Probando GET /api/folios/{id}/resumen...');
    const resumen = await folioService.getResumen(FOLIO_ID_PRUEBA);
    console.log('✅ Resumen obtenido:', resumen);

    // 2. Probar distribución (solo si hay cargos pendientes)
    if (parseFloat(resumen.resumen.cargos_sin_persona) > 0) {
      console.log('\n⚖️ Probando POST /api/folios/{id}/distribuir...');
      
      // Probar distribución equitativa
      const distribucionEquitativa = await folioService.distribuirCargos(FOLIO_ID_PRUEBA, {
        operacion_uid: `test-equal-${Date.now()}`,
        strategy: 'equal',
        responsables: resumen.personas.slice(0, 2).map(p => ({ id_cliente: p.id_cliente }))
      });
      console.log('✅ Distribución equitativa:', distribucionEquitativa);

      // Probar distribución por porcentajes
      const distribucionPorcentual = await folioService.distribuirCargos(FOLIO_ID_PRUEBA, {
        operacion_uid: `test-percent-${Date.now()}`,
        strategy: 'percent',
        responsables: [
          { id_cliente: resumen.personas[0].id_cliente, percent: 70 },
          { id_cliente: resumen.personas[1]?.id_cliente || resumen.personas[0].id_cliente, percent: 30 }
        ]
      });
      console.log('✅ Distribución porcentual:', distribucionPorcentual);
    } else {
      console.log('⚠️ No hay cargos pendientes para distribuir');
    }

    // 3. Probar registro de pagos
    console.log('\n💰 Probando POST /api/folios/{id}/pagos...');
    
    // Pago general
    const pagoGeneral = await folioService.registrarPago(FOLIO_ID_PRUEBA, {
      operacion_uid: `test-pay-general-${Date.now()}`,
      monto: 50,
      metodo: 'Efectivo',
      resultado: 'OK'
    });
    console.log('✅ Pago general registrado:', pagoGeneral);

    // Pago por cliente (si hay clientes con saldo)
    const clienteConSaldo = pagoGeneral.personas.find(p => p.saldo > 0);
    if (clienteConSaldo) {
      const pagoCliente = await folioService.registrarPago(FOLIO_ID_PRUEBA, {
        operacion_uid: `test-pay-cliente-${Date.now()}`,
        id_cliente: clienteConSaldo.id_cliente,
        monto: Math.min(clienteConSaldo.saldo, 25),
        metodo: 'Tarjeta',
        resultado: 'OK'
      });
      console.log('✅ Pago por cliente registrado:', pagoCliente);
    }

    // 4. Probar historial
    console.log('\n📜 Probando GET /api/folios/{id}/historial...');
    const historial = await folioService.getHistorial(FOLIO_ID_PRUEBA, undefined, 1, 10);
    console.log('✅ Historial obtenido:', historial);

    // 5. Probar historial filtrado
    const historialPagos = await folioService.getHistorial(FOLIO_ID_PRUEBA, 'pago', 1, 5);
    console.log('✅ Historial de pagos:', historialPagos);

    // 6. Probar cierre de folio (comentado para evitar cerrar el folio de prueba)
    /*
    console.log('\n🔒 Probando POST /api/folios/{id}/cerrar...');
    const cierreResultado = await folioService.cerrarFolio(FOLIO_ID_PRUEBA);
    console.log('✅ Folio cerrado:', cierreResultado);
    */
    console.log('\n⚠️ Prueba de cierre de folio omitida (descomenta si quieres probarlo)');

    console.log('\n🎉 ¡Todas las pruebas completadas exitosamente!');

  } catch (error: any) {
    console.error('❌ Error en las pruebas:', error);
    
    if (error.response) {
      console.error('📡 Respuesta del servidor:', error.response.data);
      console.error('🔢 Código de estado:', error.response.status);
    }
  }
}

// Función para probar casos de error comunes
async function probarCasosDeError() {
  console.log('\n🚨 Probando casos de error...');

  try {
    // Folio inexistente
    await folioService.getResumen(99999);
  } catch (error: any) {
    console.log('✅ Error 404 para folio inexistente:', error.response?.status);
  }

  try {
    // Distribución con porcentajes incorrectos
    await folioService.distribuirCargos(FOLIO_ID_PRUEBA, {
      operacion_uid: `test-error-${Date.now()}`,
      strategy: 'percent',
      responsables: [
        { id_cliente: 1, percent: 60 },
        { id_cliente: 2, percent: 30 }
        // Total: 90% (debería ser 100%)
      ]
    });
  } catch (error: any) {
    console.log('✅ Error 422 para porcentajes incorrectos:', error.response?.status);
  }

  try {
    // Pago excesivo
    await folioService.registrarPago(FOLIO_ID_PRUEBA, {
      operacion_uid: `test-error-pago-${Date.now()}`,
      monto: 999999,
      metodo: 'Efectivo',
      resultado: 'OK'
    });
  } catch (error: any) {
    console.log('✅ Error 422 para pago excesivo:', error.response?.status);
  }
}

// Función para probar idempotencia
async function probarIdempotencia() {
  console.log('\n🔄 Probando idempotencia...');

  const operacionUID = `test-idempotencia-${Date.now()}`;

  try {
    // Primera llamada
    const resultado1 = await folioService.registrarPago(FOLIO_ID_PRUEBA, {
      operacion_uid: operacionUID,
      monto: 10,
      metodo: 'Efectivo',
      resultado: 'OK'
    });

    // Segunda llamada con el mismo UID
    const resultado2 = await folioService.registrarPago(FOLIO_ID_PRUEBA, {
      operacion_uid: operacionUID,
      monto: 10,
      metodo: 'Efectivo',
      resultado: 'OK'
    });

    // Deben ser idénticos
    const sonIguales = JSON.stringify(resultado1) === JSON.stringify(resultado2);
    console.log('✅ Idempotencia verificada:', sonIguales);

  } catch (error: any) {
    console.error('❌ Error en prueba de idempotencia:', error);
  }
}

// Ejecutar todas las pruebas
export async function ejecutarPruebasCompletas() {
  await probarEndpointsFolio();
  await probarCasosDeError();
  await probarIdempotencia();
}

// Para uso en consola del navegador:
// import { ejecutarPruebasCompletas } from './path/to/this/file';
// ejecutarPruebasCompletas();

console.log('📝 Script de pruebas de folios cargado.');
console.log('💡 Para ejecutar las pruebas, llama a: ejecutarPruebasCompletas()');
console.log('⚠️ Asegúrate de cambiar FOLIO_ID_PRUEBA por un ID válido en tu sistema');