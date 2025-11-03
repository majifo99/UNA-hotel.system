// ============================================================================
// EJEMPLOS PRÁCTICOS DE INTEGRACIÓN DEL MÓDULO DE FOLIOS
// Sistema: UNA Hotel System
// ============================================================================

import { useFolioFlow } from '../hooks/useFolioFlow';
import { toast } from 'sonner';

// ============================================================================
// EJEMPLO 1: Check-in Simple con Pago Completo
// ============================================================================

/**
 * Escenario: Huésped hace check-in y paga el total inmediatamente
 */
export const EjemploCheckInSimple = () => {
  const { realizarCheckIn, registrarPago, obtenerResumen } = useFolioFlow();

  const handleCheckInYPago = async () => {
    try {
      // 1. Realizar check-in
      const folioId = await realizarCheckIn('RES-12345', {
        id_cliente_titular: 12,
        fecha_llegada: '2025-11-02',
        fecha_salida: '2025-11-05',
        adultos: 1,
        ninos: 0,
        id_hab: 101,
        nombre_asignacion: 'Juan Pérez',
        pago_modo: 'por_habitacion',
        observacion_checkin: 'Check-in estándar',
      });

      if (!folioId) {
        throw new Error('No se pudo crear el folio');
      }

      // 2. Registrar pago completo
      await registrarPago(
        folioId,
        250.00,
        'Tarjeta',
        'OK',
        undefined, // Pago general (sin id_cliente)
        'Pago completo al check-in'
      );

      // 3. Obtener resumen final
      const resumen = await obtenerResumen(folioId);
      console.log('Saldo final:', resumen?.totales.saldo_global); // Debe ser 0

      toast.success('Check-in completado', {
        description: 'Pago registrado exitosamente',
      });

    } catch (error) {
      console.error('Error en check-in:', error);
      toast.error('Error al procesar check-in');
    }
  };

  return (
    <button onClick={handleCheckInYPago}>
      Realizar Check-in con Pago
    </button>
  );
};

// ============================================================================
// EJEMPLO 2: Check-in con Distribución Equitativa
// ============================================================================

/**
 * Escenario: Dos huéspedes comparten la habitación y dividen gastos 50/50
 */
export const EjemploDistribucionEquitativa = () => {
  const { realizarCheckIn, distribuirCargos, registrarPago, cerrarFolio } = useFolioFlow();

  const handleCheckInConDistribucion = async () => {
    try {
      // 1. Check-in con acompañante
      const folioId = await realizarCheckIn('RES-12346', {
        id_cliente_titular: 12,
        fecha_llegada: '2025-11-02',
        fecha_salida: '2025-11-05',
        adultos: 2,
        ninos: 0,
        id_hab: 102,
        nombre_asignacion: 'Juan Pérez y Carlos Méndez',
        pago_modo: 'por_persona',
        acompanantes: [
          {
            nombre: 'Carlos Méndez',
            documento: '304500789',
            email: 'carlos@mail.com',
            id_cliente: 43, // Cliente existente
          },
        ],
      });

      if (!folioId) return;

      // 2. Distribuir 50/50
      await distribuirCargos(folioId, 'equal', [
        { id_cliente: 12 }, // Juan (titular)
        { id_cliente: 43 }, // Carlos (acompañante)
      ]);

      // 3. Cada uno paga su parte
      await registrarPago(folioId, 125.00, 'Tarjeta', 'OK', 12, 'Pago Juan');
      await registrarPago(folioId, 125.00, 'Efectivo', 'OK', 43, 'Pago Carlos');

      // 4. Cerrar folio
      await cerrarFolio(folioId, 12);

      toast.success('Proceso completado', {
        description: 'Folio cerrado exitosamente',
      });

    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <button onClick={handleCheckInConDistribucion}>
      Check-in con Distribución 50/50
    </button>
  );
};

// ============================================================================
// EJEMPLO 3: División Empresa/Huésped (70/30)
// ============================================================================

/**
 * Escenario: Empresa paga 70% del hospedaje, huésped paga 30% de extras
 */
export const EjemploEmpresaHuesped = () => {
  const { realizarCheckIn, distribuirCargos, registrarPago, cerrarFolio } = useFolioFlow();

  const handleCheckInCorporativo = async () => {
    try {
      // 1. Check-in
      const folioId = await realizarCheckIn('RES-12347', {
        id_cliente_titular: 12,
        fecha_llegada: '2025-11-02',
        fecha_salida: '2025-11-05',
        adultos: 1,
        ninos: 0,
        id_hab: 103,
        nombre_asignacion: 'Juan Pérez (Corporativo ABC)',
        pago_modo: 'por_persona',
        observacion_checkin: 'Reserva corporativa - Empresa paga 70%',
      });

      if (!folioId) return;

      // 2. Distribución por porcentaje
      await distribuirCargos(folioId, 'percent', [
        { id_cliente: 99, percent: 70 }, // Empresa
        { id_cliente: 12, percent: 30 }, // Huésped
      ]);

      // 3. Pago de la empresa (70% de $250 = $175)
      await registrarPago(
        folioId,
        175.00,
        'Transferencia',
        'OK',
        99,
        'Pago corporativo - Factura #12345'
      );

      // 4. Pago del huésped (30% de $250 = $75)
      await registrarPago(
        folioId,
        75.00,
        'Tarjeta',
        'OK',
        12,
        'Pago de extras personales'
      );

      // 5. Cerrar folio
      await cerrarFolio(folioId, 12);

      toast.success('Check-in corporativo completado');

    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <button onClick={handleCheckInCorporativo}>
      Check-in Corporativo 70/30
    </button>
  );
};

// ============================================================================
// EJEMPLO 4: Distribución por Montos Fijos
// ============================================================================

/**
 * Escenario: Asignar montos específicos a cada responsable
 */
export const EjemploMontosEspecificos = () => {
  const { realizarCheckIn, distribuirCargos, registrarPago } = useFolioFlow();

  const handleDistribucionFija = async () => {
    try {
      // 1. Check-in con múltiples acompañantes
      const folioId = await realizarCheckIn('RES-12348', {
        id_cliente_titular: 12,
        fecha_llegada: '2025-11-02',
        fecha_salida: '2025-11-05',
        adultos: 3,
        ninos: 0,
        id_hab: 104,
        nombre_asignacion: 'Grupo Familiar Pérez',
        pago_modo: 'por_persona',
        acompanantes: [
          { nombre: 'María Pérez', documento: '208741236', id_cliente: 43 },
          { nombre: 'Pedro Pérez', documento: '109632587', id_cliente: 44 },
        ],
      });

      if (!folioId) return;

      // 2. Distribución por montos fijos específicos
      // Total: $300 → Juan: $150, María: $100, Pedro: $50
      await distribuirCargos(folioId, 'fixed', [
        { id_cliente: 12, amount: 150 }, // Juan (titular)
        { id_cliente: 43, amount: 100 }, // María
        { id_cliente: 44, amount: 50 },  // Pedro
      ]);

      // 3. Pagos individuales
      await registrarPago(folioId, 150.00, 'Tarjeta', 'OK', 12);
      await registrarPago(folioId, 100.00, 'Efectivo', 'OK', 43);
      await registrarPago(folioId, 50.00, 'Tarjeta', 'OK', 44);

      toast.success('Distribución personalizada aplicada');

    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <button onClick={handleDistribucionFija}>
      Distribución por Montos Específicos
    </button>
  );
};

// ============================================================================
// EJEMPLO 5: Todo a un Solo Responsable
// ============================================================================

/**
 * Escenario: Toda la cuenta va a una sola persona
 */
export const EjemploResponsableUnico = () => {
  const { realizarCheckIn, distribuirCargos, registrarPago } = useFolioFlow();

  const handleResponsableUnico = async () => {
    try {
      const folioId = await realizarCheckIn('RES-12349', {
        id_cliente_titular: 12,
        fecha_llegada: '2025-11-02',
        fecha_salida: '2025-11-05',
        adultos: 2,
        ninos: 1,
        id_hab: 105,
        nombre_asignacion: 'Familia Pérez',
        pago_modo: 'por_habitacion',
        acompanantes: [
          { nombre: 'María Pérez', documento: '208741236' },
        ],
      });

      if (!folioId) return;

      // Asignar todo al titular
      await distribuirCargos(folioId, 'single', [
        { id_cliente: 12 }, // Todo va al titular
      ]);

      // Pago completo del titular
      await registrarPago(folioId, 300.00, 'Tarjeta', 'OK', 12);

      toast.success('Pago completo registrado');

    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <button onClick={handleResponsableUnico}>
      Todo a un Responsable
    </button>
  );
};

// ============================================================================
// EJEMPLO 6: Integración Completa en Componente CheckIn
// ============================================================================

/**
 * Ejemplo de cómo integrar el flujo completo en el componente CheckIn.tsx
 */
export const IntegracionCheckIn = () => {
  const { realizarCheckIn } = useFolioFlow();

  const handleSubmit = async (formData: any) => {
    try {
      // Preparar datos del check-in
      const checkInData = {
        id_cliente_titular: Number.parseInt(formData.selectedGuestId || '1'),
        fecha_llegada: formData.checkInDate,
        fecha_salida: formData.checkOutDate,
        adultos: formData.adultos,
        ninos: formData.ninos,
        id_hab: Number.parseInt(formData.roomNumber),
        nombre_asignacion: `${formData.firstName} ${formData.lastName}`,
        pago_modo: formData.pago_modo,
        acompanantes: formData.acompanantes.map((a: any) => ({
          nombre: a.nombre,
          documento: a.documento,
          email: a.email,
          ...(a.id_cliente && { id_cliente: a.id_cliente }),
        })),
        observacion_checkin: formData.observacion_checkin,
      };

      // Realizar check-in con creación de folio
      const folioId = await realizarCheckIn(
        formData.reservationId,
        checkInData
      );

      if (!folioId) {
        throw new Error('No se pudo crear el folio');
      }

      // Guardar folioId para usar en check-out
      localStorage.setItem(
        `folio_${formData.reservationId}`,
        folioId.toString()
      );

      console.log('✅ Folio creado:', folioId);
      toast.success('Check-in realizado exitosamente');

      // Redirigir al dashboard
      // navigate(ROUTES.FRONTDESK.BASE);

    } catch (error) {
      console.error('❌ Error en check-in:', error);
      toast.error('Error al realizar check-in');
    }
  };

  return { handleSubmit };
};

// ============================================================================
// EJEMPLO 7: Consulta de Resumen y Exportación
// ============================================================================

/**
 * Ejemplo de cómo consultar el resumen y exportar historial
 */
export const EjemploConsultaYExportacion = () => {
  const { obtenerResumen, obtenerHistorial, exportarHistorial } = useFolioFlow();

  const consultarFolio = async (folioId: number) => {
    try {
      // 1. Obtener resumen actualizado
      const resumen = await obtenerResumen(folioId);

      if (resumen) {
        console.log('📊 Resumen del Folio:');
        console.log('Folio ID:', resumen.folio);
        console.log('Saldo Global:', resumen.totales.saldo_global);
        console.log('Total Pagado:', resumen.totales.pagos_totales);

        // Mostrar información por persona
        resumen.personas.forEach((persona: { id_cliente: number; asignado: number; pagos: number; saldo: number }) => {
          console.log(`Cliente ${persona.id_cliente}:`);
          console.log(`  - Asignado: $${persona.asignado}`);
          console.log(`  - Pagado: $${persona.pagos}`);
          console.log(`  - Saldo: $${persona.saldo}`);
        });
      }

      // 2. Obtener historial de pagos
      const historialPagos = await obtenerHistorial(folioId, 'pago');
      console.log('💳 Historial de pagos:', historialPagos);

      // 3. Exportar historial completo a CSV
      await exportarHistorial(folioId);

      toast.success('Consulta completada');

    } catch (error) {
      console.error('Error en consulta:', error);
    }
  };

  return (
    <button onClick={() => consultarFolio(3)}>
      Consultar Folio #3
    </button>
  );
};

// ============================================================================
// EJEMPLO 8: Manejo de Errores Avanzado
// ============================================================================

/**
 * Ejemplo de manejo robusto de errores
 */
export const EjemploManejoErrores = () => {
  const { 
    realizarCheckIn, 
    distribuirCargos, 
    registrarPago,
    obtenerResumen,
    error,
    limpiarError 
  } = useFolioFlow();

  const procesoConValidacion = async () => {
    try {
      // Limpiar errores previos
      limpiarError();

      // 1. Check-in con validación
      const folioId = await realizarCheckIn('RES-12350', {
        id_cliente_titular: 12,
        fecha_llegada: '2025-11-02',
        fecha_salida: '2025-11-05',
        adultos: 2,
        ninos: 0,
        id_hab: 106,
        nombre_asignacion: 'Test Validación',
        pago_modo: 'por_persona',
      });

      if (!folioId) {
        console.error('Error:', error);
        return;
      }

      // 2. Distribuir con validación de estrategia
      const distribucionExitosa = await distribuirCargos(folioId, 'equal', [
        { id_cliente: 12 },
        { id_cliente: 43 },
      ]);

      if (!distribucionExitosa) {
        console.error('Error en distribución:', error);
        return;
      }

      // 3. Verificar saldo antes de pagar
      const resumen = await obtenerResumen(folioId);
      
      if (resumen) {
        const montoAPagar = resumen.personas[0].asignado;
        
        // Validar que el monto sea correcto
        if (montoAPagar > 0) {
          await registrarPago(folioId, montoAPagar, 'Tarjeta', 'OK', 12);
        } else {
          toast.error('No hay monto asignado para pagar');
        }
      }

    } catch (error) {
      console.error('Error crítico:', error);
      toast.error('Error en el proceso');
    }
  };

  return (
    <button onClick={procesoConValidacion}>
      Proceso con Validación
    </button>
  );
};

// ============================================================================
// EJEMPLO 9: Flujo Completo con UI
// ============================================================================

/**
 * Componente completo con UI para demostrar el flujo
 */
export const ComponenteFlujoCompleto = () => {
  const {
    folioId,
    resumen,
    isLoading,
    currentStep,
    realizarCheckIn,
    distribuirCargos,
    registrarPago,
    cerrarFolio,
    obtenerResumen,
  } = useFolioFlow();

  const ejecutarFlujoCompleto = async () => {
    // Paso 1: Check-in
    const nuevoFolioId = await realizarCheckIn('RES-DEMO', {
      id_cliente_titular: 12,
      fecha_llegada: '2025-11-02',
      fecha_salida: '2025-11-05',
      adultos: 2,
      ninos: 0,
      id_hab: 107,
      nombre_asignacion: 'Demo Completo',
      pago_modo: 'por_persona',
      acompanantes: [
        { nombre: 'Acompañante Demo', documento: '123456789' },
      ],
    });

    if (!nuevoFolioId) return;

    // Paso 2: Distribución
    await distribuirCargos(nuevoFolioId, 'equal', [
      { id_cliente: 12 },
      { id_cliente: 43 },
    ]);

    // Paso 3: Pagos
    await registrarPago(nuevoFolioId, 125.00, 'Tarjeta', 'OK', 12);
    await registrarPago(nuevoFolioId, 125.00, 'Efectivo', 'OK', 43);

    // Paso 4: Cierre
    await cerrarFolio(nuevoFolioId, 12);

    // Paso 5: Resumen final
    await obtenerResumen(nuevoFolioId);
  };

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold">Flujo Completo de Folios</h2>

      {/* Estado actual */}
      <div className="p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-700">
          Paso actual: <strong>{currentStep}</strong>
        </p>
        {folioId && (
          <p className="text-sm text-blue-700">
            Folio ID: <strong>{folioId}</strong>
          </p>
        )}
      </div>

      {/* Botón de acción */}
      <button
        onClick={ejecutarFlujoCompleto}
        disabled={isLoading}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {isLoading ? 'Procesando...' : 'Ejecutar Flujo Completo'}
      </button>

      {/* Resumen */}
      {resumen && (
        <div className="p-4 bg-green-50 rounded-lg">
          <h3 className="font-semibold text-green-900 mb-2">
            Resumen Final
          </h3>
          <p className="text-sm text-green-700">
            Total Pagado: ${resumen.totales.pagos_totales}
          </p>
          <p className="text-sm text-green-700">
            Saldo: ${resumen.totales.saldo_global}
          </p>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// EXPORTACIÓN DE EJEMPLOS
// ============================================================================

export default {
  EjemploCheckInSimple,
  EjemploDistribucionEquitativa,
  EjemploEmpresaHuesped,
  EjemploMontosEspecificos,
  EjemploResponsableUnico,
  IntegracionCheckIn,
  EjemploConsultaYExportacion,
  EjemploManejoErrores,
  ComponenteFlujoCompleto,
};
