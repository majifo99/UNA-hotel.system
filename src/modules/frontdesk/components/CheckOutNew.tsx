/**
 * ╔════════════════════════════════════════════════════════════════════════╗
 * ║                    CHECKOUT COMPONENT V2.0                             ║
 * ║                  Creado desde cero con integración                      ║
 * ║                  completa de folios y validaciones                      ║
 * ╚════════════════════════════════════════════════════════════════════════╝
 * 
 * @module CheckOut
 * @description Componente principal para gestionar el proceso de check-out
 * 
 * CARACTERÍSTICAS:
 * ✅ Búsqueda de reservación por código
 * ✅ Carga automática de datos de reservación + folio
 * ✅ Validación pre-checkout automática
 * ✅ Resumen financiero detallado
 * ✅ División de cargos entre responsables
 * ✅ Registro de pagos finales
 * ✅ Cierre de folio
 * ✅ Generación de recibo
 * ✅ Manejo de errores robusto
 * ✅ Estados de carga informativos
 * ✅ Soporte para múltiples métodos de pago
 * 
 * FLUJO:
 * 1. Buscar reservación → 2. Cargar datos → 3. Validar folio → 
 * 4. Mostrar resumen → 5. Registrar pagos (opcional) → 6. Cerrar folio → 
 * 7. Generar recibo → 8. Completar checkout
 */

import React, { useState, useEffect, useCallback, Component, type ErrorInfo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  User,
  CreditCard,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Hash,
  Users,
  DollarSign,
  FileText,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
  Search,
  X,
  LogOut,
  Info,
  Eye,
  ChevronRight,
  Building
} from 'lucide-react';

// Hooks personalizados
import { useCheckoutFolio } from '../hooks/useCheckoutFolio';
import { useEstadiaByCode } from '../hooks/useCheckoutQueries';

// Componentes reutilizables
import { FolioResumen } from './FolioResumen';
import { FolioHistorial } from './FolioHistorial';
import ReceiptModal from './ReceiptModal';
import { ModalPagoCheckout } from './ModalPagoCheckout';

// Tipos
import type { CheckoutFormData, BillingItem, BillSplit, ReceiptData } from '../types/checkout';
import type { FolioResumen as FolioResumenType } from '../services/folioService';

// ============================================================================
// ERROR BOUNDARY COMPONENTS
// ============================================================================

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<
  { children: React.ReactNode; fallback: React.ComponentType<any> },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode; fallback: React.ComponentType<any> }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback;
      return <FallbackComponent error={this.state.error} />;
    }

    return this.props.children;
  }
}

const FolioResumenFallback: React.FC<{ error?: Error }> = ({ error }) => (
  <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
    <div className="flex items-start gap-3">
      <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <h3 className="font-semibold text-red-900">Error al cargar el resumen del folio</h3>
        <p className="text-sm text-red-700 mt-1">
          No se pudo cargar el resumen del folio. Puedes continuar con el checkout de forma manual.
        </p>
        {error && (
          <details className="mt-2">
            <summary className="text-xs text-red-600 cursor-pointer">Ver detalles técnicos</summary>
            <pre className="text-xs text-red-600 mt-1 bg-red-100 p-2 rounded overflow-auto max-w-full">
              {error.message}
            </pre>
          </details>
        )}
      </div>
      <button
        onClick={() => window.location.reload()}
        className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
      >
        Recargar
      </button>
    </div>
  </div>
);

// ============================================================================
// TIPOS LOCALES
// ============================================================================

interface CheckoutStep {
  id: number;
  name: string;
  description: string;
  status: 'pending' | 'current' | 'completed' | 'error';
}

// ============================================================================
// CONFIGURACIÓN
// ============================================================================

const INITIAL_FORM_DATA: CheckoutFormData = {
  reservationId: '',
  guestName: '',
  roomNumber: '',
  checkInDate: '',
  checkOutDate: '',
  numberOfGuests: 1,
  identificationNumber: '',
  email: '',
  phone: '',
  nationality: 'US',
  paymentStatus: 'pending',
  totalAmount: 0,
  additionalCharges: 0,
  finalAmount: 0,
  subtotal: 0,
  taxAmount: 0,
  discountAmount: 0,
  grandTotal: 0,
  taxRate: 0.13,
  notes: '',
  billingItems: [],
  billSplits: [],
  splitBill: false,
  numberOfSplits: 1,
};

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export const CheckOut: React.FC = () => {
  const navigate = useNavigate();

  // ========================================
  // ESTADOS
  // ========================================

  // Estados de datos
  const [formData, setFormData] = useState<CheckoutFormData>(INITIAL_FORM_DATA);
  const [reservaId, setReservaId] = useState<number | undefined>(undefined);
  const [folioId, setFolioId] = useState<number | null>(null);
  const [idClienteTitular, setIdClienteTitular] = useState<number | undefined>(undefined);

  // Estados de UI
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);

  // Estados de búsqueda
  const [reservationSearchId, setReservationSearchId] = useState('');
  const [hasLoadedReservationData, setHasLoadedReservationData] = useState(false);

  // ========================================
  // UTILIDADES
  // ========================================

  /**
   * Convierte un valor a número de forma segura
   */
  const toNumber = (value: unknown): number => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  };

  // Estados de vista
  const [mostrarResumenFolio, setMostrarResumenFolio] = useState(false);
  const [mostrarHistorial, setMostrarHistorial] = useState(false);
  const [mostrarModalPago, setMostrarModalPago] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); // Key para forzar refresh del resumen
  
  // ========================================
  // HOOKS PERSONALIZADOS
  // ========================================

  // Hook para búsqueda de estadías (soporta códigos de reserva y walk-in)
  const {
    data: foundReservation,
    isLoading: isLoadingReservation,
    error: reservationError
  } = useEstadiaByCode(reservationSearchId);

  // Hook para checkout con folio
  const checkoutFolioHook = useCheckoutFolio({
    folioId,
    idClienteTitular,
    configuracion: {
      permitirSaldoPendiente: false,
      generarRecibo: true,
      enviarEmailRecibo: false,
      aplicarDeposito: true,
      validarDivision: true,
    }
  });

  // ========================================
  // PASOS DEL CHECKOUT
  // ========================================

  const [steps, setSteps] = useState<CheckoutStep[]>([
    {
      id: 1,
      name: 'Buscar Reservación',
      description: 'Ingrese el código de confirmación',
      status: 'current'
    },
    {
      id: 2,
      name: 'Verificar Datos',
      description: 'Revise la información del huésped',
      status: 'pending'
    },
    {
      id: 3,
      name: 'Validar Folio',
      description: 'Verifique cargos y pagos',
      status: 'pending'
    },
    {
      id: 4,
      name: 'Pago Final',
      description: 'Registre el pago pendiente (si aplica)',
      status: 'pending'
    },
    {
      id: 5,
      name: 'Cerrar Folio',
      description: 'Finalice el check-out',
      status: 'pending'
    }
  ]);

  // ========================================
  // EFECTOS
  // ========================================

  // ========================================
  // FUNCIONES DE CARGA DE DATOS
  // ========================================

  /**
   * Carga todos los datos de la reservación y el folio
   */
  const cargarDatosReservacion = useCallback(async (reservation: any) => {
    console.log('📋 Cargando datos de reservación:', reservation);

    try {
      // 1️⃣ Actualizar paso
      actualizarPaso(0, 'completed');
      actualizarPaso(1, 'current');

      // 2️⃣ Extraer datos básicos
      const guestName = reservation.guest
        ? `${reservation.guest.firstName} ${reservation.guest.firstLastName}${reservation.guest.secondLastName ? ' ' + reservation.guest.secondLastName : ''}`
        : '';

      const numericReservaId = Number.parseInt(reservation.confirmationNumber.replace('RES-', '')) || undefined;
      setReservaId(numericReservaId);

      // 3️⃣ Mapear datos de reservación
      setFormData(prev => ({
        ...prev,
        reservationId: reservation.confirmationNumber,
        guestName,
        roomNumber: reservation.room?.number || '',
        checkInDate: reservation.checkInDate,
        checkOutDate: reservation.checkOutDate,
        numberOfGuests: reservation.numberOfGuests || 1,
        email: reservation.guest?.email || '',
        phone: reservation.guest?.phone || '',
        nationality: reservation.guest?.nationality || 'US',
        identificationNumber: reservation.guest?.documentNumber || '',
      }));

      setError(null);

      // 4️⃣ Buscar y cargar folio
      await cargarFolio(reservation, numericReservaId);

      // 5️⃣ Marcar como cargado
      setHasLoadedReservationData(true);

      // 6️⃣ Avanzar al siguiente paso
      actualizarPaso(1, 'completed');
      actualizarPaso(2, 'current');

      toast.success('Datos cargados', {
        description: `Reservación ${reservation.confirmationNumber} encontrada`
      });

    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'Error al cargar datos';
      setError(mensaje);
      actualizarPaso(1, 'error');
      toast.error('Error', { description: mensaje });
    }
  }, []);

  /**
   * Carga el folio asociado a la reservación
   */
  const cargarFolio = useCallback(async (reservation: any, numericReservaId?: number) => {
    try {
      console.log('🔍 Buscando folio para reservación...');

      // Intentar obtener folioId del backend
      let currentFolioId: number | null = null;

      if ((reservation as any).folioId) {
        currentFolioId = (reservation as any).folioId;
        setFolioId(currentFolioId);
        toast.success('Folio encontrado', {
          description: `Folio #${currentFolioId} cargado desde el servidor`
        });
      }
      // Si no viene del backend, buscar en localStorage
      else if (numericReservaId) {
        const folioGuardado = localStorage.getItem(`folio_${numericReservaId}`);
        if (folioGuardado) {
          currentFolioId = Number.parseInt(folioGuardado);
          setFolioId(currentFolioId);
          toast.success('Folio recuperado', {
            description: `Folio #${folioGuardado} cargado desde la sesión`
          });
        }
      }

      // Extraer ID del cliente titular
      if ((reservation as any).idClienteTitular) {
        setIdClienteTitular((reservation as any).idClienteTitular);
      } else if (reservation.guest?.id) {
        setIdClienteTitular(reservation.guest.id);
      }

      // Si se encontró un folio, el useEffect se encargará de validarlo
      // cuando el estado folioId se actualice

    } catch (err) {
      console.error('Error al cargar folio:', err);
      toast.error('Error al cargar folio', {
        description: err instanceof Error ? err.message : 'Error desconocido'
      });
    }
  }, []);

  /**
   * Valida el folio y carga sus datos financieros
   */
  const validarYCargarFolio = useCallback(async (currentFolioId: number) => {
    try {
      console.log('✅ Validando folio:', currentFolioId);
      console.log('Hook folioId:', folioId);
      console.log('Hook idClienteTitular:', idClienteTitular);

      // 1️⃣ Validar pre-checkout
      const validacion = await checkoutFolioHook.validarPreCheckout();
      
      console.log('📊 Resultado de validación:', validacion);

      if (!validacion.puedeCheckout) {
        actualizarPaso(2, 'error');
        toast.error('Validación fallida', {
          description: validacion.errores.join(', ')
        });
        return;
      }

      if (validacion.advertencias.length > 0) {
        toast.warning('Advertencias', {
          description: validacion.advertencias.join(', ')
        });
      }

      // 2️⃣ Obtener resumen financiero
      const resumenFinal = await checkoutFolioHook.obtenerResumen();
      
      console.log('💰 Resumen obtenido:', resumenFinal);

      if (resumenFinal) {
        await mapearDatosFinancieros(resumenFinal);
        
        // 3️⃣ Mostrar resumen automáticamente
        setMostrarResumenFolio(true);

        // 4️⃣ Avanzar al siguiente paso
        actualizarPaso(2, 'completed');
        actualizarPaso(3, 'current');

        toast.success('Folio validado', {
          description: `Saldo pendiente: $${toNumber(resumenFinal.totales.saldo_global).toFixed(2)}`
        });
      } else {
        console.error('❌ No se obtuvo resumen del folio');
        toast.error('Error', {
          description: 'No se pudo obtener el resumen del folio'
        });
      }

    } catch (err) {
      console.error('❌ Error al validar folio:', err);
      actualizarPaso(2, 'error');
      toast.error('Error de validación', {
        description: err instanceof Error ? err.message : 'Error desconocido'
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folioId, idClienteTitular]); // Removido checkoutFolioHook para evitar recreaciones

  /**
   * Mapea los datos financieros del folio al formulario
   */
  const mapearDatosFinancieros = useCallback(async (resumenFinal: FolioResumenType) => {
    try {
      const totalCargos = Number.parseFloat(resumenFinal.resumen.a_distribuir) + 
                         Number.parseFloat(resumenFinal.resumen.distribuido);
      const totalPagos = resumenFinal.totales.pagos_totales || 0;
      const saldoPendiente = resumenFinal.totales.saldo_global || 0;

      // Crear billing items
      const billingItems: BillingItem[] = [
        {
          id: 'total-cargos',
          description: 'Cargos del Folio',
          quantity: 1,
          unitPrice: totalCargos,
          total: totalCargos,
          category: 'service'
        }
      ];

      // Si hay pagos previos, agregarlos como items
      if (totalPagos > 0) {
        billingItems.push({
          id: 'pagos-previos',
          description: 'Pagos Realizados',
          quantity: 1,
          unitPrice: totalPagos,
          total: totalPagos,
          category: 'discount'
        });
      }

      // Crear bill splits de responsables
      const billSplits: BillSplit[] = resumenFinal.personas.map((persona) => ({
        id: `persona-${persona.id_cliente}`,
        guestName: persona.nombre || `Cliente #${persona.id_cliente}`,
        items: [],
        subtotal: Math.abs(persona.pagos), // Mostrar pagos como positivos
        tax: 0,
        total: Math.abs(persona.pagos), // Total pagado por esta persona
        percentage: totalCargos > 0 ? (persona.asignado / totalCargos) * 100 : 0
      }));

      // Actualizar formulario
      setFormData(prev => ({
        ...prev,
        subtotal: totalPagos,
        totalAmount: totalCargos,
        grandTotal: saldoPendiente,
        finalAmount: saldoPendiente,
        taxAmount: 0,
        discountAmount: totalPagos,
        additionalCharges: 0,
        billingItems,
        billSplits,
        paymentStatus: saldoPendiente === 0 ? 'completed' : 'pending',
        splitBill: billSplits.length > 1,
        numberOfSplits: billSplits.length
      }));

      console.log('💰 Datos financieros mapeados:', {
        totalCargos,
        totalPagos,
        saldoPendiente,
        responsables: billSplits.length
      });

    } catch (err) {
      console.error('Error al mapear datos financieros:', err);
      toast.error('Error', {
        description: 'No se pudieron cargar los datos financieros'
      });
    }
  }, []);

  // ========================================
  // FUNCIONES DE BÚSQUEDA
  // ========================================

  /**
   * Busca una reservación por código
   */
  const handleSearchReservation = useCallback(() => {
    if (!formData.reservationId.trim()) {
      toast.error('Ingrese un código de reserva o walk-in');
      return;
    }

    setReservationSearchId(formData.reservationId.trim());
    setHasLoadedReservationData(false);
    setError(null);
  }, [formData.reservationId]);

  /**
   * Limpia la búsqueda y resetea el formulario
   */
  const handleClearReservation = useCallback(() => {
    setFormData(INITIAL_FORM_DATA);
    setReservationSearchId('');
    setHasLoadedReservationData(false);
    setFolioId(null);
    setReservaId(undefined);
    setIdClienteTitular(undefined);
    setError(null);
    setMostrarResumenFolio(false);
    setMostrarHistorial(false);
    
    // Resetear pasos
    setSteps([
      { id: 1, name: 'Buscar Reservación', description: 'Ingrese el código de confirmación', status: 'current' },
      { id: 2, name: 'Verificar Datos', description: 'Revise la información del huésped', status: 'pending' },
      { id: 3, name: 'Validar Folio', description: 'Verifique cargos y pagos', status: 'pending' },
      { id: 4, name: 'Pago Final', description: 'Registre el pago pendiente (si aplica)', status: 'pending' },
      { id: 5, name: 'Cerrar Folio', description: 'Finalice el check-out', status: 'pending' }
    ]);

    checkoutFolioHook.resetear();
    
    toast.info('Formulario reiniciado');
  }, [checkoutFolioHook]);

  // ========================================
  // FUNCIONES DE PAGO
  // ========================================

  /**
   * NOTA: La función handlePayment fue completamente reemplazada por ModalPagoCheckout
   * El modal maneja todos los pagos con opciones individuales y generales
   */

  // ========================================
  // FUNCIONES DE CHECKOUT
  // ========================================

  /**
   * Procesa el checkout completo
   */
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!folioId || !idClienteTitular) {
      toast.error('Faltan datos para completar el checkout');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      actualizarPaso(4, 'current');

      // 1️⃣ Validar que no haya saldo pendiente (a menos que esté permitido)
      const validacion = await checkoutFolioHook.validarPreCheckout();
      
      if (!validacion.puedeCheckout) {
        throw new Error('No se puede completar el checkout: ' + validacion.errores.join(', '));
      }

      // 2️⃣ Cerrar el folio
      const exitoCierre = await checkoutFolioHook.cerrarFolio();

      if (!exitoCierre) {
        throw new Error('No se pudo cerrar el folio');
      }

      // 3️⃣ Obtener resumen final
      const resumenFinal = await checkoutFolioHook.obtenerResumen();

      if (!resumenFinal) {
        throw new Error('No se pudo obtener el resumen final');
      }

      // 4️⃣ Generar recibo
      const recibo = generarRecibo(resumenFinal);
      setReceiptData(recibo);

      // 5️⃣ Completar proceso
      actualizarPaso(4, 'completed');
      setShowReceipt(true);

      toast.success('¡Checkout completado!', {
        description: `Folio #${folioId} cerrado exitosamente`,
        duration: 5000
      });

      // 6️⃣ Limpiar localStorage
      if (reservaId) {
        localStorage.removeItem(`folio_${reservaId}`);
      }

    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'Error al procesar checkout';
      setError(mensaje);
      actualizarPaso(4, 'error');
      toast.error('Error en checkout', { description: mensaje });
      console.error('❌ Error:', err);
    } finally {
      setIsSubmitting(false);
    }
  }, [folioId, idClienteTitular, reservaId, checkoutFolioHook]);

  // ========================================
  // FUNCIONES AUXILIARES
  // ========================================

  /**
   * Actualiza el estado de un paso
   */
  const actualizarPaso = (index: number, status: CheckoutStep['status']) => {
    setSteps(prev => prev.map((step, i) => 
      i === index ? { ...step, status } : step
    ));
  };

  /**
   * Genera los datos del recibo
   */
  const generarRecibo = (resumen: FolioResumenType): ReceiptData => {
    const now = new Date();
    
    return {
      receiptNumber: `RCP-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${folioId}`,
      hotelName: 'Hotel UNA',
      hotelAddress: 'Dirección del Hotel',
      guestName: formData.guestName,
      roomNumber: formData.roomNumber,
      checkInDate: formData.checkInDate,
      checkOutDate: formData.checkOutDate,
      checkoutTime: now.toISOString(),
      billingItems: formData.billingItems,
      billSplits: formData.billSplits,
      subtotal: formData.subtotal,
      taxAmount: formData.taxAmount,
      discountAmount: formData.discountAmount,
      grandTotal: resumen.totales.saldo_global,
      paymentMethod: 'Ver Folio',
      paymentStatus: resumen.totales.saldo_global === 0 ? 'Pagado' : 'Pendiente',
      notes: formData.notes
    };
  };

  /**
   * Valida el formato del código (reserva o walk-in)
   */
  const validarCodigoReservacion = (value: string): string => {
    // Solo permitir letras mayúsculas, números y guiones
    const cleaned = value.toUpperCase().replace(/[^A-Z0-9-]/g, '');
    return cleaned;
  };

  // ========================================
  // MANEJO DE INPUTS
  // ========================================

  const handleInputChange = (field: keyof CheckoutFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // ========================================
  // EFECTOS
  // ========================================

  /**
   * Efecto para cargar datos cuando se encuentra una reservación
   */
  useEffect(() => {
    if (foundReservation && !hasLoadedReservationData) {
      cargarDatosReservacion(foundReservation);
    }
  }, [foundReservation, hasLoadedReservationData, cargarDatosReservacion]);

  /**
   * Efecto para validar folio cuando se establece el folioId
   */
  useEffect(() => {
    if (folioId && hasLoadedReservationData && !mostrarResumenFolio) {
      console.log('🔍 Folio ID establecido, validando...', folioId);
      validarYCargarFolio(folioId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folioId, hasLoadedReservationData, mostrarResumenFolio]); // Removido validarYCargarFolio

  // ========================================
  // RENDER
  // ========================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* ========================================
            ENCABEZADO
        ======================================== */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-100 rounded-lg">
                <LogOut className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Check-Out</h1>
                <p className="text-sm text-gray-600">Finalizar estadía y cerrar folio</p>
              </div>
            </div>
            
            {folioId && (
              <div className="text-right">
                <p className="text-sm text-gray-600">Folio Activo</p>
                <p className="text-2xl font-bold text-red-600">#{folioId}</p>
              </div>
            )}
          </div>
        </div>

        {/* ========================================
            INDICADOR DE PASOS
        ======================================== */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center flex-1">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm
                    ${step.status === 'completed' ? 'bg-green-500 text-white' : ''}
                    ${step.status === 'current' ? 'bg-blue-500 text-white' : ''}
                    ${step.status === 'error' ? 'bg-red-500 text-white' : ''}
                    ${step.status === 'pending' ? 'bg-gray-200 text-gray-500' : ''}
                  `}>
                    {step.status === 'completed' && <CheckCircle className="w-5 h-5" />}
                    {step.status === 'error' && <XCircle className="w-5 h-5" />}
                    {step.status === 'current' && <Loader2 className="w-5 h-5 animate-spin" />}
                    {step.status === 'pending' && step.id}
                  </div>
                  <p className="text-xs font-medium mt-2 text-center">{step.name}</p>
                  <p className="text-xs text-gray-500 text-center hidden sm:block">{step.description}</p>
                </div>
                
                {index < steps.length - 1 && (
                  <ChevronRight className="w-5 h-5 text-gray-300 flex-shrink-0" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* ========================================
            BÚSQUEDA DE RESERVACIÓN O WALK-IN
        ======================================== */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Search className="w-5 h-5 text-blue-600" />
            Buscar Estadía
          </h2>

          <div className="flex gap-3">
            <div className="flex-1">
              <input
                type="text"
                value={formData.reservationId}
                onChange={(e) => handleInputChange('reservationId', validarCodigoReservacion(e.target.value))}
                onKeyPress={(e) => e.key === 'Enter' && handleSearchReservation()}
                placeholder="Código de reserva (RES-123) o Walk-In (WI-20251129-A1B2)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isLoadingReservation || hasLoadedReservationData}
              />
            </div>
            
            <button
              onClick={handleSearchReservation}
              disabled={!formData.reservationId.trim() || isLoadingReservation || hasLoadedReservationData}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
            >
              {isLoadingReservation ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Buscando...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Buscar
                </>
              )}
            </button>

            {hasLoadedReservationData && (
              <button
                onClick={handleClearReservation}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center gap-2 transition-colors"
              >
                <X className="w-4 h-4" />
                Limpiar
              </button>
            )}
          </div>

          {/* Estado de búsqueda */}
          {isLoadingReservation && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
              <p className="text-blue-800">Buscando estadía...</p>
            </div>
          )}

          {reservationError && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-800">No se encontró la estadía con ese código</p>
            </div>
          )}

          {hasLoadedReservationData && foundReservation && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-green-900">{formData.guestName}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2 text-sm text-green-800">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>Habitación {formData.roomNumber}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(formData.checkInDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{formData.numberOfGuests} huéspedes</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Hash className="w-4 h-4" />
                      <span>{formData.reservationId}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ========================================
            DATOS DEL HUÉSPED (Solo si hay reservación cargada)
        ======================================== */}
        {hasLoadedReservationData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            
            {/* Información Personal */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Información del Huésped
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                  <input
                    type="text"
                    value={formData.guestName}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <div className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{formData.email || 'N/A'}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                    <div className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{formData.phone || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Identificación</label>
                  <input
                    type="text"
                    value={formData.identificationNumber}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
              </div>
            </div>

            {/* Información de Acompañantes */}
            {foundReservation?.acompanantes && foundReservation.acompanantes.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  Acompañantes ({foundReservation.acompanantes.length})
                </h2>

                <div className="space-y-3">
                  {foundReservation.acompanantes.map((acompanante, index) => (
                    <div key={acompanante.id_cliente} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-semibold text-sm">
                            {acompanante.nombre ? acompanante.nombre.charAt(0).toUpperCase() : (index + 1)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {acompanante.nombre} {acompanante.apellido1}
                          </p>
                          {acompanante.email && (
                            <p className="text-sm text-gray-500">{acompanante.email}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-gray-500">ID: {acompanante.id_cliente}</span>
                        {acompanante.folio_asociado && (
                          <p className="text-xs text-blue-600">Folio: {acompanante.folio_asociado}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Información de Estadía */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Building className="w-5 h-5 text-blue-600" />
                Información de Estadía
              </h2>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Habitación</label>
                    <div className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-lg font-semibold">{formData.roomNumber}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Huéspedes</label>
                    <div className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-lg font-semibold">{formData.numberOfGuests}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Check-In</label>
                  <div className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">
                      {formData.checkInDate ? new Date(formData.checkInDate).toLocaleDateString('es-ES', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 'N/A'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Check-Out</label>
                  <div className="flex items-center gap-2 px-3 py-2 border border-green-300 rounded-lg bg-green-50">
                    <Calendar className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-700">
                      {formData.checkOutDate ? new Date(formData.checkOutDate).toLocaleDateString('es-ES', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 'N/A'}
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm font-medium text-blue-900">Noches de estadía</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {formData.checkInDate && formData.checkOutDate
                        ? Math.ceil((new Date(formData.checkOutDate).getTime() - new Date(formData.checkInDate).getTime()) / (1000 * 60 * 60 * 24))
                        : 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================
            RESUMEN FINANCIERO Y FOLIO
        ======================================== */}
        {hasLoadedReservationData && folioId && (
          <>
            {/* Resumen del Folio */}
            {mostrarResumenFolio && checkoutFolioHook.resumenFolio && (
              <div className="mb-6">
                <ErrorBoundary fallback={FolioResumenFallback}>
                  <FolioResumen
                    key={`folio-resumen-${folioId}-${refreshKey}`}
                    folioId={folioId}
                  />
                </ErrorBoundary>
                
                {/* Botón para agregar consumos */}
                <div className="mt-4 space-y-2">
                  <button
                    onClick={() => navigate(`/frontdesk/folio/${folioId}?action=add-charge&returnTo=checkout`)}
                    className="w-full py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center gap-2 font-medium"
                  >
                    <DollarSign className="w-5 h-5" />
                    Agregar Consumos / Cargos
                  </button>
                  
                  {/* Botón para ocultar resumen */}
                  <button
                    onClick={() => setMostrarResumenFolio(false)}
                    className="w-full py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Ocultar Resumen del Folio
                  </button>
                </div>
              </div>
            )}

            {/* Botón para mostrar/ocultar resumen */}
            {!mostrarResumenFolio && (
              <div className="mb-6 space-y-3">
                <button
                  onClick={() => setMostrarResumenFolio(true)}
                  className="w-full py-3 bg-blue-50 border-2 border-blue-200 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-2 text-blue-700 font-medium"
                >
                  <Eye className="w-5 h-5" />
                  Ver Resumen del Folio
                </button>
                
                {/* Botón para agregar consumos (acceso rápido) */}
                <button
                  onClick={() => navigate(`/frontdesk/folio/${folioId}?action=add-charge&returnTo=checkout`)}
                  className="w-full py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center gap-2 font-medium"
                >
                  <DollarSign className="w-5 h-5" />
                  Agregar Consumos / Cargos
                </button>
              </div>
            )}

            {/* Pago Final (si hay saldo pendiente) */}
            {checkoutFolioHook.resumenFolio && checkoutFolioHook.resumenFolio.totales.saldo_global > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-green-600" />
                  Pago Final
                </h2>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold text-yellow-900">Saldo Pendiente de Pago</p>
                      <p className="text-3xl font-bold text-yellow-700 mt-1">
                        ${toNumber(checkoutFolioHook.resumenFolio.totales.saldo_global).toFixed(2)}
                      </p>
                      <p className="text-sm text-yellow-700 mt-2">
                        Complete los pagos antes de cerrar el folio
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setMostrarModalPago(true)}
                  className="w-full py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 font-semibold text-lg"
                >
                  <CreditCard className="w-6 h-6" />
                  Registrar Pago
                </button>

                <p className="text-xs text-gray-500 mt-3 text-center">
                  💡 Puedes hacer pagos generales o individuales por cliente
                </p>

                {/* Pagos registrados */}
                {checkoutFolioHook.pagosRegistrados.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Pagos Registrados en esta Sesión</h3>
                    <div className="space-y-2">
                      {checkoutFolioHook.pagosRegistrados.map((pago, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-medium">{pago.metodo}</span>
                          </div>
                          <span className="text-sm font-bold text-green-600">
                            ${toNumber(pago.monto).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Historial del Folio */}
            {mostrarHistorial && (
              <div className="mb-6">
                <FolioHistorial
                  folioId={folioId}
                />
              </div>
            )}

            {/* Botón para mostrar historial */}
            {!mostrarHistorial && (
              <div className="mb-6">
                <button
                  onClick={() => setMostrarHistorial(true)}
                  className="w-full py-3 bg-gray-50 border-2 border-gray-200 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 text-gray-700 font-medium"
                >
                  <Clock className="w-5 h-5" />
                  Ver Historial de Operaciones
                </button>
              </div>
            )}

            {/* Notas adicionales */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Notas del Checkout
              </h2>

              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Agregue notas o comentarios sobre este checkout..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
            </div>

            {/* Botón de Checkout Final */}
            <div className="bg-white rounded-lg shadow-lg p-6 sticky bottom-0 border-t-4 border-red-500">
              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              {checkoutFolioHook.error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <p className="text-red-800 text-sm">{checkoutFolioHook.error}</p>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => navigate('/frontdesk')}
                  className="flex-1 py-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold transition-colors"
                >
                  Cancelar
                </button>

                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || checkoutFolioHook.isLoading || !folioId}
                  className="flex-1 py-4 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-bold text-lg flex items-center justify-center gap-3 transition-colors shadow-lg"
                >
                  {isSubmitting || checkoutFolioHook.isLoading ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      Procesando Checkout...
                    </>
                  ) : (
                    <>
                      <LogOut className="w-6 h-6" />
                      COMPLETAR CHECK-OUT
                    </>
                  )}
                </button>
              </div>

              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-800 text-center">
                  <Info className="w-4 h-4 inline mr-1" />
                  Al completar el check-out, se cerrará el folio y se generará un recibo automáticamente
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ========================================
          MODAL DE RECIBO
      ======================================== */}
      <ReceiptModal
        isOpen={showReceipt}
        receiptData={receiptData}
        onClose={() => {
          setShowReceipt(false);
          navigate('/frontdesk');
        }}
      />

      {/* Modal de Pago */}
      {folioId && checkoutFolioHook.resumenFolio && (
        <ModalPagoCheckout
          isOpen={mostrarModalPago}
          onClose={() => setMostrarModalPago(false)}
          folioId={folioId}
          saldoTotal={toNumber(checkoutFolioHook.resumenFolio.totales.saldo_global)}
          clientes={
            checkoutFolioHook.resumenFolio.personas?.map(p => ({
              id_cliente: p.id_cliente,
              nombre: p.nombre || 'Sin nombre',
              saldo: toNumber(p.saldo),
              asignado: toNumber(p.asignado),
              pagos: toNumber(p.pagos)
            })) || []
          }
          onPagoRegistrado={async () => {
            await checkoutFolioHook.obtenerResumen();
            setRefreshKey(prev => prev + 1); // Forzar refresh del FolioResumen
          }}
          registrarPagoFn={async (monto, metodo, idCliente, nota) => {
            return await checkoutFolioHook.registrarPago(monto, metodo, idCliente, nota);
          }}
        />
      )}
    </div>
  );
};

export default CheckOut;
