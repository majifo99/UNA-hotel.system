import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import ReactFlagsSelect from 'react-flags-select';
import { Search, CreditCard, FileText, LogOut, ArrowLeft, DollarSign, Split, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { useCheckout } from '../hooks/useCheckout';
import { useCheckoutRefactored } from '../hooks/useCheckoutRefactored';
import { useCheckoutFolio } from '../hooks/useCheckoutFolio';
import { useReservationByCode } from '../../reservations/hooks/useReservationQueries';
import { ROUTES } from '../../../router/routes';
import type { CheckoutFormData, ReceiptData } from '../types/checkout';
import type { ResponsablePago, TipoCargo } from '../types/folioTypes';
import type { ConfiguracionResponsables } from '../hooks/useCheckoutRefactored';
import type { ValidacionCheckout } from '../types/checkout-folio';
import BillingSection from './BillingSection';
import ReceiptModal from './ReceiptModal';
import { FolioResumen } from './FolioResumen';
import { FolioHistorial } from './FolioHistorial';

const CheckOut = () => {
  const navigate = useNavigate();
  const { validateAndSubmit, isSubmitting, error, setError } = useCheckout();
  
  // IDs dinámicos - se actualizan al buscar la reservación
  // Se establecerán cuando el backend retorne folioId en la búsqueda de reservación
  const [folioId, setFolioId] = useState<number | null>(null);
  // Se establecerán cuando el backend retorne id de reserva
  const [reservaId, setReservaId] = useState<number | undefined>(undefined);
  // ID del cliente titular (necesario para cierre de folio)
  const [idClienteTitular, setIdClienteTitular] = useState<number | undefined>(undefined);
  
  // Hook refactorizado para checkout completo - solo se inicializa si hay folioId
  // Deshabilitado temporalmente para evitar errores 404
  const checkoutRefactored = useCheckoutRefactored(
    folioId || 1, 
    reservaId
  );
  
  // ✨ Hook de checkout con folios (integración completa con backend Laravel)
  // Solo se inicializa si tenemos folioId válido
  const checkoutFolioHook = useCheckoutFolio({
    folioId: folioId || null,
    idClienteTitular,
    configuracion: {
      permitirSaldoPendiente: false,
      generarRecibo: true,
      enviarEmailRecibo: false,
      aplicarDeposito: true,
      validarDivision: true,
    }
  });
  
  // Estados para validación y visualización
  const [validacion, setValidacion] = useState<ValidacionCheckout | null>(null);
  const [mostrarResumenFolio, setMostrarResumenFolio] = useState(false);
  const [mostrarHistorialFolio, setMostrarHistorialFolio] = useState(false);

  const [formData, setFormData] = useState<CheckoutFormData>({
    reservationId: '',
    guestName: '',
    roomNumber: '',
    checkInDate: '',
    checkOutDate: new Date().toISOString().split('T')[0],
    numberOfGuests: 1,
    identificationNumber: '',
    paymentStatus: 'pending',
    totalAmount: 0,
    additionalCharges: 0,
    finalAmount: 0,
    notes: '',
    email: '',
    phone: '',
    nationality: 'US',
    billingItems: [],
    billSplits: [],
    subtotal: 0,
    taxAmount: 0,
    discountAmount: 0,
    grandTotal: 0,
    taxRate: 13, // Default Costa Rica tax rate
    splitBill: false,
    numberOfSplits: 2
  });

  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
  
  // Estados para búsqueda de reserva (igual que CheckIn)
  const [reservationSearchId, setReservationSearchId] = useState("");
  const [hasLoadedReservationData, setHasLoadedReservationData] = useState(false);
  
  // Hook para obtener datos de reserva por CÓDIGO DE RESERVA
  const {
    data: foundReservation,
    isLoading: isLoadingReservation,
    isError: isReservationError,
    error: reservationError,
  } = useReservationByCode(reservationSearchId, !!reservationSearchId);
  
  // ⚖️ Estados para división de cargos
  const [mostrarDivision, setMostrarDivision] = useState(false);
  // Preparado para futura funcionalidad de configuración inline de responsables
  const [responsables] = useState<ResponsablePago[]>([]);
  // Preparado para futura funcionalidad de asignación de tipos de cargo
  const [asignaciones] = useState<Array<{
    tipoCargo: TipoCargo;
    responsableId: string;
  }>>([]);

  // Verificar si la reservación tiene división marcada desde check-in
  useEffect(() => {
    // En producción, esto vendría del backend al buscar la reservación
    // Por ahora usamos el campo del formulario
    if (formData.requiereDivisionCargos) {
      setMostrarDivision(true);
    }
  }, [formData.requiereDivisionCargos]);

  // Efecto para cargar datos de la reservación encontrada
  useEffect(() => {
    if (foundReservation && !hasLoadedReservationData) {
      console.log('📋 Cargando datos de reservación:', foundReservation);
      console.log('👤 Datos del guest:', foundReservation.guest);
      console.log('🏨 Datos de room:', foundReservation.room);
      
      // Extraer nombre del huésped
      const guestName = foundReservation.guest 
        ? `${foundReservation.guest.firstName} ${foundReservation.guest.firstLastName}${foundReservation.guest.secondLastName ? ' ' + foundReservation.guest.secondLastName : ''}`
        : '';
      
      console.log('✅ Nombre del huésped construido:', guestName);
      console.log('📧 Email:', foundReservation.guest?.email);
      console.log('📱 Teléfono:', foundReservation.guest?.phone);
      console.log('🆔 Documento:', foundReservation.guest?.documentNumber);
      
      // Mapear datos de reservación a formData
      setFormData(prev => ({
        ...prev,
        reservationId: foundReservation.confirmationNumber,
        guestName,
        roomNumber: foundReservation.room?.number || '',
        checkInDate: foundReservation.checkInDate,
        checkOutDate: foundReservation.checkOutDate,
        numberOfGuests: foundReservation.numberOfGuests,
        email: foundReservation.guest?.email || '',
        phone: foundReservation.guest?.phone || '',
        nationality: foundReservation.guest?.nationality || 'US',
        identificationNumber: foundReservation.guest?.documentNumber || '',
      }));
      
      setError(null);
      
      // ✨ Extraer folioId y reservaId del objeto foundReservation
      if (foundReservation.confirmationNumber) {
        const numericReservaId = Number.parseInt(foundReservation.confirmationNumber.replace('RES-', '')) || undefined;
        setReservaId(numericReservaId);
        
        // OPCIÓN 1: Si el backend retorna folioId directamente
        if ((foundReservation as any).folioId) {
          setFolioId((foundReservation as any).folioId);
          toast.success('Folio encontrado', {
            description: `Folio #${(foundReservation as any).folioId} cargado exitosamente`
          });
        } 
        // OPCIÓN 2: Buscar en localStorage (guardado durante check-in)
        else {
          const folioGuardado = localStorage.getItem(`folio_${numericReservaId}`);
          if (folioGuardado) {
            setFolioId(parseInt(folioGuardado));
            toast.success('Folio recuperado', {
              description: `Folio #${folioGuardado} cargado desde sesión anterior`
            });
          } else {
            toast.info('Folio no encontrado', {
              description: 'No se encontró folio para esta reservación. Puede continuar con checkout manual.'
            });
          }
        }
        
        // Extraer ID del cliente titular si viene en la respuesta
        if ((foundReservation as any).idClienteTitular) {
          setIdClienteTitular((foundReservation as any).idClienteTitular);
        }
      }
      
      // Marcar como cargado
      setHasLoadedReservationData(true);
      
      // Validar el folio automáticamente después de establecerlo
      setTimeout(async () => {
        // Extraer numericReservaId nuevamente en este scope
        const resNumericId = Number.parseInt(foundReservation.confirmationNumber.replace('RES-', '')) || 0;
        const currentFolioId = folioId || Number.parseInt(localStorage.getItem(`folio_${resNumericId}`) || '0');
        if (currentFolioId) {
          try {
            console.log('🔍 Validando folio...', currentFolioId);
            
            // 1️⃣ Validar pre-checkout
            const validacionResult = await checkoutFolioHook.validarPreCheckout();
            setValidacion(validacionResult);
            
            if (!validacionResult.puedeCheckout) {
              toast.error('Advertencia de validación', {
                description: validacionResult.errores.join(', ')
              });
            } else if (validacionResult.advertencias.length > 0) {
              toast.warning('Advertencias', {
                description: validacionResult.advertencias.join(', ')
              });
            }
            
            // 2️⃣ Obtener resumen financiero del folio
            console.log('📊 Obteniendo resumen del folio...');
            const resumenFinal = await checkoutFolioHook.obtenerResumen();
            
            if (resumenFinal) {
              console.log('✅ Resumen obtenido:', resumenFinal);
              
              // 3️⃣ Mapear datos financieros al formData
              const totalCargos = Number.parseFloat(resumenFinal.resumen.a_distribuir) + Number.parseFloat(resumenFinal.resumen.distribuido);
              const totalPagos = resumenFinal.totales.pagos_totales || 0;
              const saldoPendiente = resumenFinal.totales.saldo_global || 0;
              
              setFormData(prev => ({
                ...prev,
                // Totales calculados del folio
                subtotal: totalPagos,
                totalAmount: totalCargos,
                additionalCharges: 0, // Los ajustes se manejan en el folio
                grandTotal: saldoPendiente,
                finalAmount: saldoPendiente,
                taxAmount: 0, // El backend no separa impuestos en el resumen
                discountAmount: 0,
                
                // Crear billing items generales basados en el resumen
                billingItems: [
                  {
                    id: 'total-cargos',
                    description: 'Total de Cargos del Folio',
                    quantity: 1,
                    unitPrice: totalCargos,
                    total: totalCargos,
                    category: 'service' as const
                  }
                ],
                
                // Bill splits: mapear las personas responsables
                billSplits: resumenFinal.personas.map((persona) => ({
                  id: `persona-${persona.id_cliente}`,
                  guestName: persona.nombre || `Cliente #${persona.id_cliente}`,
                  items: [],
                  subtotal: persona.asignado,
                  tax: 0,
                  total: persona.saldo,
                  percentage: totalCargos > 0 ? (persona.asignado / totalCargos) * 100 : 0
                })),
                
                paymentStatus: saldoPendiente === 0 ? 'completed' : 'pending'
              }));
              
              toast.success('Datos financieros cargados', {
                description: `Saldo pendiente: $${saldoPendiente.toFixed(2)}`
              });
            } else {
              console.warn('⚠️ No se pudo obtener el resumen del folio');
              toast.warning('Advertencia', {
                description: 'No se pudo cargar el resumen del folio. Puede continuar con el checkout manual.'
              });
            }
            
            // 4️⃣ Mostrar automáticamente el resumen del folio
            setMostrarResumenFolio(true);
          } catch (err) {
            console.error('❌ Error al validar folio:', err);
            
            // No mostrar error crítico, permitir continuar
            toast.warning('Advertencia', {
              description: 'No se pudo cargar la información financiera del folio. Puede continuar con checkout manual.'
            });
            
            // No establecer error que bloquee el formulario
            // setError('No se pudo cargar la información financiera del folio');
          }
        } else {
          console.warn('⚠️ No se encontró folioId para esta reserva');
        }
      }, 500);
    }
  }, [foundReservation, hasLoadedReservationData, checkoutFolioHook, folioId]);

  // Función para buscar reserva por código
  const handleSearchReservation = () => {
    if (formData.reservationId.trim()) {
      setReservationSearchId(formData.reservationId.trim());
      setHasLoadedReservationData(false);
    }
  };

  // Función para limpiar búsqueda de reserva
  const handleClearReservation = () => {
    setFormData({
      reservationId: '',
      guestName: '',
      roomNumber: '',
      checkInDate: '',
      checkOutDate: new Date().toISOString().split('T')[0],
      numberOfGuests: 1,
      identificationNumber: '',
      paymentStatus: 'pending',
      totalAmount: 0,
      additionalCharges: 0,
      finalAmount: 0,
      notes: '',
      email: '',
      phone: '',
      nationality: 'US',
      billingItems: [],
      billSplits: [],
      subtotal: 0,
      taxAmount: 0,
      discountAmount: 0,
      grandTotal: 0,
      taxRate: 13,
      splitBill: false,
      numberOfSplits: 2
    });
    setReservationSearchId("");
    setHasLoadedReservationData(false);
    setFolioId(null);
    setReservaId(undefined);
    setIdClienteTitular(undefined);
    setValidacion(null);
    setMostrarResumenFolio(false);
    setMostrarHistorialFolio(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // =========================================================================
    // 🎯 FLUJO COMPLETO DE CHECKOUT CON FOLIOS
    // =========================================================================
    
    // Si tenemos folioId, usar el sistema completo de folios
    if (folioId && idClienteTitular) {
      try {
        toast.info('Iniciando checkout...', {
          description: `Procesando folio #${folioId}`
        });
        
        // 📋 PASO 1: Validar pre-checkout
        const validacionPreCheckout = await checkoutFolioHook.validarPreCheckout();
        
        if (!validacionPreCheckout.puedeCheckout) {
          toast.error('No se puede completar el checkout', {
            description: validacionPreCheckout.errores.join(', ')
          });
          setError(validacionPreCheckout.errores.join('. '));
          return;
        }
        
        // 💳 PASO 2: Registrar pago final (si hay monto pendiente)
        if (validacionPreCheckout.montoPendiente > 0) {
          const exitoPago = await checkoutFolioHook.registrarPago(
            validacionPreCheckout.montoPendiente,
            'Tarjeta de Crédito', // O tomar del formData
            idClienteTitular,
            'Pago final de checkout'
          );
          
          if (!exitoPago) {
            toast.error('Error al registrar el pago');
            setError('No se pudo procesar el pago. Verifique los datos.');
            return;
          }
        }
        
        // 🔒 PASO 3: Cerrar el folio
        const exitoCierre = await checkoutFolioHook.cerrarFolio();
        
        if (!exitoCierre) {
          toast.error('Error al cerrar el folio');
          setError('No se pudo completar el cierre del folio.');
          return;
        }
        
        // 📊 PASO 4: Obtener resumen final
        const resumenFinal = await checkoutFolioHook.obtenerResumen();
        
        if (!resumenFinal) {
          toast.warning('Checkout completado', {
            description: 'No se pudo obtener el resumen final, pero el folio fue cerrado.'
          });
        }
        
        // 🧾 PASO 5: Generar recibo con datos del folio
        const receipt: ReceiptData = {
          receiptNumber: generarNumeroRecibo(),
          hotelName: 'UNA Hotel',
          hotelAddress: '123 Main Street, San José, Costa Rica',
          guestName: formData.guestName,
          roomNumber: formData.roomNumber,
          checkInDate: formData.checkInDate,
          checkOutDate: formData.checkOutDate,
          checkoutTime: new Date().toISOString(),
          billingItems: formData.billingItems,
          billSplits: formData.billSplits,
          subtotal: resumenFinal ? resumenFinal.totales.pagos_totales : formData.subtotal,
          taxAmount: formData.taxAmount,
          discountAmount: formData.discountAmount,
          grandTotal: resumenFinal ? resumenFinal.totales.saldo_global : formData.grandTotal,
          paymentMethod: 'Múltiples métodos',
          paymentStatus: 'Completado',
          notes: `Folio #${folioId} cerrado. ${formData.notes || ''}`
        };
        
        setReceiptData(receipt);
        setShowReceipt(true);
        
        toast.success('✅ Checkout completado', {
          description: `Folio #${folioId} cerrado exitosamente`
        });
        
      } catch (err) {
        const mensaje = err instanceof Error ? err.message : 'Error desconocido en checkout';
        toast.error('Error en checkout', { description: mensaje });
        setError(mensaje);
      }
    } 
    // Si tiene división de cargos (flujo legacy)
    else if (formData.requiereDivisionCargos && responsables.length > 0) {
      const configuracion: ConfiguracionResponsables = {
        responsables,
        asignaciones
      };

      const resultado = await checkoutRefactored.procesarCheckout(formData, configuracion);
      
      if (resultado.exito) {
        const receipt: ReceiptData = {
          receiptNumber: resultado.numeroRecibo,
          hotelName: 'UNA Hotel',
          hotelAddress: '123 Main Street, San José, Costa Rica',
          guestName: formData.guestName,
          roomNumber: formData.roomNumber,
          checkInDate: formData.checkInDate,
          checkOutDate: formData.checkOutDate,
          checkoutTime: new Date().toISOString(),
          billingItems: formData.billingItems,
          billSplits: formData.billSplits,
          subtotal: formData.subtotal,
          taxAmount: formData.taxAmount,
          discountAmount: formData.discountAmount,
          grandTotal: formData.grandTotal,
          paymentMethod: 'División de Cargos',
          paymentStatus: 'Completado',
          notes: `División aplicada. ${resultado.facturasGeneradas.length} facturas generadas.`
        };

        setReceiptData(receipt);
        setShowReceipt(true);
      } else {
        setError(resultado.errores.join(', '));
      }
    } 
    // Checkout normal sin división (flujo legacy)
    else {
      const success = await validateAndSubmit(formData);
      if (success) {
        const receipt: ReceiptData = {
          receiptNumber: generarNumeroRecibo(),
          hotelName: 'UNA Hotel',
          hotelAddress: '123 Main Street, San José, Costa Rica',
          guestName: formData.guestName,
          roomNumber: formData.roomNumber,
          checkInDate: formData.checkInDate,
          checkOutDate: formData.checkOutDate,
          checkoutTime: new Date().toISOString(),
          billingItems: formData.billingItems,
          billSplits: formData.billSplits,
          subtotal: formData.subtotal,
          taxAmount: formData.taxAmount,
          discountAmount: formData.discountAmount,
          grandTotal: formData.grandTotal,
          paymentMethod: 'Tarjeta de Crédito',
          paymentStatus: formData.paymentStatus === 'completed' ? 'Completado' : 'Pendiente',
          notes: formData.notes
        };

        setReceiptData(receipt);
        setShowReceipt(true);
      }
    }
  };
  
  // 🔢 Función auxiliar para generar número de recibo
  const generarNumeroRecibo = (): string => {
    const now = new Date();
    const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    const timePart = `${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
    const millisPart = String(now.getMilliseconds()).padStart(3, '0');
    
    const randomArray = new Uint32Array(1);
    crypto.getRandomValues(randomArray);
    const randomPart = (randomArray[0] % 10000).toString().padStart(4, '0');
    
    return `RCP-${datePart}-${timePart}${millisPart}-${randomPart}`;
  };

  const handleCloseReceipt = () => {
    setShowReceipt(false);
    
    // Limpiar datos del folio en localStorage
    if (reservaId) {
      localStorage.removeItem(`folio_${reservaId}`);
      localStorage.removeItem(`checkin_info_${reservaId}`);
    }
    
    // Limpiar estados
    setFolioId(null);
    setReservaId(undefined);
    setIdClienteTitular(undefined);
    setValidacion(null);
    setMostrarResumenFolio(false);
    setMostrarHistorialFolio(false);
    
    // Mostrar mensaje de éxito y redirigir
    toast.success('Check-out completado', {
      description: 'El proceso de check-out se completó exitosamente',
      duration: 3000,
    });
    
    // Redirigir al dashboard después de un pequeño delay
    setTimeout(() => {
      navigate(ROUTES.FRONTDESK.BASE);
    }, 500);
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8">
            {/* Header with centered title and back button */}
            <div className="relative flex items-center justify-center mb-8">
              <div className="flex items-center gap-3">
                <LogOut className="w-8 h-8 text-red-600" />
                <h1 className="text-3xl font-bold text-gray-900">Check-Out</h1>
              </div>
              
              <button
                type="button"
                onClick={() => navigate(ROUTES.FRONTDESK.BASE)}
                className="absolute left-0 flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                title="Regresar al Dashboard"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:inline">Regresar</span>
              </button>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}

            {/* Search Reservation Section */}
            <div className="border border-gray-200 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Search className="w-5 h-5" />
                Buscar Reservación
              </h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="reservationId" className="block text-sm font-medium text-gray-700 mb-2">
                    Código de Reserva <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="reservationId"
                      type="text"
                      value={formData.reservationId}
                      onChange={(e) => {
                        // Permitir letras, números, guiones
                        const value = e.target.value.toUpperCase();
                        if (/^[A-Z0-9-]*$/.test(value)) {
                          setFormData((prev) => ({
                            ...prev,
                            reservationId: value,
                          }));
                          if (hasLoadedReservationData) {
                            setHasLoadedReservationData(false);
                          }
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ej: JTFLGLKR o JTFL-GLKR"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleSearchReservation();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleSearchReservation}
                      disabled={!formData.reservationId.trim() || isLoadingReservation}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isLoadingReservation ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
                        type="button"
                        onClick={handleClearReservation}
                        className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 flex items-center gap-2"
                      >
                        Limpiar
                      </button>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Ingrese el código de 8 caracteres (con o sin guión). Ejemplo: JTFLGLKR
                  </p>
                </div>

                {/* Estado de búsqueda de reserva */}
                {isLoadingReservation && (
                  <div className="flex items-center gap-2 text-blue-600 text-sm">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    Buscando reserva...
                  </div>
                )}

                {isReservationError && reservationError && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    No se encontró la reserva o ocurrió un error: {reservationError.message}
                  </div>
                )}

                {foundReservation && hasLoadedReservationData && (
                  <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md text-green-700 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    Reserva encontrada - Datos cargados automáticamente
                    <div className="ml-auto flex items-center gap-2">
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        Estado: {foundReservation.status}
                      </span>
                      {folioId && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          Folio #{folioId}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Información adicional de la reserva encontrada */}
                {foundReservation && hasLoadedReservationData && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-gray-900">
                        Detalles de la Reserva
                      </h3>
                      {folioId && (
                        <button
                          type="button"
                          onClick={() => navigate(`/frontdesk/folio/${folioId}`)}
                          className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                        >
                          <FileText className="w-4 h-4" />
                          Ver Gestión de Folio
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                      <div>
                        <strong>Confirmación:</strong> {foundReservation.confirmationNumber}
                      </div>
                      <div>
                        <strong>Estado:</strong> {foundReservation.status}
                      </div>
                      <div>
                        <strong>Huéspedes:</strong> {foundReservation.numberOfGuests} personas
                      </div>
                      <div>
                        <strong>Noches:</strong> {foundReservation.numberOfNights}
                      </div>
                      <div>
                        <strong>Total:</strong> ${foundReservation.total}
                      </div>
                      {foundReservation.specialRequests && (
                        <div className="col-span-2">
                          <strong>Solicitudes:</strong> {foundReservation.specialRequests}
                        </div>
                      )}
                    </div>

                    {/* Instrucciones para el check-out */}
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                      <div className="flex items-center gap-2 text-blue-800 text-sm">
                        <CheckCircle className="w-4 h-4" />
                        <span className="font-medium">Listo para Check-Out</span>
                      </div>
                      <p className="text-blue-700 text-xs mt-1">
                        Los datos se han cargado automáticamente. Verifique la información y complete el check-out.
                      </p>
                    </div>

                    {/* Botones de acción para gestión de folio */}
                    {folioId && (
                      <div className="mt-4 space-y-2">
                        {/* Botón Ver Resumen del Folio */}
                        <button
                          type="button"
                          onClick={() => navigate(`/frontdesk/folio/${folioId}`)}
                          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                        >
                          <FileText className="w-5 h-5" />
                          <span className="font-medium">Ver Resumen del Folio</span>
                        </button>
                        
                        {/* Botón Agregar Consumos / Cargos */}
                        <button
                          type="button"
                          onClick={() => navigate(`/frontdesk/folio/${folioId}?tab=cargos`)}
                          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors shadow-sm"
                        >
                          <DollarSign className="w-5 h-5" />
                          <span className="font-medium">Agregar Consumos / Cargos</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Información del Huésped */}
              <div className="border border-gray-200 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Información del Huésped</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre Completo <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.guestName}
                      onChange={(e) => setFormData(prev => ({ ...prev, guestName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Teléfono <span className="text-red-500">*</span>
                    </label>
                    <PhoneInput
                      country={formData.nationality.toLowerCase()}
                      value={formData.phone}
                      onChange={(phone) => setFormData(prev => ({ ...prev, phone }))}
                      inputClass="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nacionalidad <span className="text-red-500">*</span>
                    </label>
                    <ReactFlagsSelect
                      selected={formData.nationality}
                      onSelect={(code) => setFormData(prev => ({ ...prev, nationality: code }))}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Número de Identificación <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.identificationNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, identificationNumber: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Información de la Habitación */}
              <div className="border border-gray-200 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Información de la Habitación</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Número de Habitación <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.roomNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, roomNumber: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha de Check-In
                    </label>
                    <input
                      type="date"
                      value={formData.checkInDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, checkInDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha de Check-Out <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.checkOutDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, checkOutDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Número de Huéspedes
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.numberOfGuests}
                      onChange={(e) => setFormData(prev => ({ ...prev, numberOfGuests: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Billing Section */}
              <BillingSection
                billingItems={formData.billingItems}
                setBillingItems={(items) => setFormData(prev => ({ ...prev, billingItems: items }))}
                billSplits={formData.billSplits}
                setBillSplits={(splits) => setFormData(prev => ({ ...prev, billSplits: splits }))}
                subtotal={formData.subtotal}
                setSubtotal={(amount) => setFormData(prev => ({ ...prev, subtotal: amount }))}
                taxAmount={formData.taxAmount}
                setTaxAmount={(amount) => setFormData(prev => ({ ...prev, taxAmount: amount }))}
                discountAmount={formData.discountAmount}
                setDiscountAmount={(amount) => setFormData(prev => ({ ...prev, discountAmount: amount }))}
                grandTotal={formData.grandTotal}
                setGrandTotal={(amount) => setFormData(prev => ({ ...prev, grandTotal: amount }))}
                taxRate={formData.taxRate}
                setTaxRate={(rate) => setFormData(prev => ({ ...prev, taxRate: rate }))}
                splitBill={formData.splitBill}
                setSplitBill={(split) => setFormData(prev => ({ ...prev, splitBill: split }))}
                numberOfSplits={formData.numberOfSplits}
                setNumberOfSplits={(splits) => setFormData(prev => ({ ...prev, numberOfSplits: splits }))}
              />

              {/* Información de Facturación */}
              <div className="border border-gray-200 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Información de Facturación
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Monto Base
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.totalAmount}
                      onChange={(e) => {
                        const totalAmount = parseFloat(e.target.value) || 0;
                        setFormData(prev => ({ 
                          ...prev, 
                          totalAmount,
                          finalAmount: totalAmount + prev.additionalCharges
                        }));
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cargos Adicionales
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.additionalCharges}
                      onChange={(e) => {
                        const additionalCharges = parseFloat(e.target.value) || 0;
                        setFormData(prev => ({ 
                          ...prev, 
                          additionalCharges,
                          finalAmount: prev.totalAmount + additionalCharges
                        }));
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estado de Pago
                    </label>
                    <select
                      value={formData.paymentStatus}
                      onChange={(e) => setFormData(prev => ({ ...prev, paymentStatus: e.target.value as 'pending' | 'completed' }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="pending">Pendiente</option>
                      <option value="completed">Completado</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* ⚖️ División de Cargos y Depósitos */}
              {mostrarDivision && (
                <div className="border border-blue-200 bg-blue-50 rounded-lg p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Split className="w-5 h-5 text-blue-600" />
                    División de Cargos
                  </h2>
                  
                  {formData.empresaPagadora && (
                    <div className="mb-4 p-3 bg-white border border-blue-300 rounded-md">
                      <p className="text-sm">
                        <strong>Empresa Pagadora:</strong> {formData.empresaPagadora}
                      </p>
                    </div>
                  )}
                  
                  {formData.notasDivision && (
                    <div className="mb-4 p-3 bg-white border border-blue-300 rounded-md">
                      <p className="text-sm">
                        <strong>Notas de División:</strong> {formData.notasDivision}
                      </p>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="bg-yellow-50 border border-yellow-300 rounded-md p-4">
                      <p className="text-sm text-yellow-800">
                        <strong>⚠️ Configuración Requerida:</strong> Esta reservación fue marcada para división de cargos durante el check-in.
                        Para completar el checkout, configure los responsables y asigne los tipos de cargo en el sistema de folios.
                      </p>
                    </div>

                    {/* Resumen de Depósito */}
                    <div className="bg-white border border-gray-300 rounded-md p-4">
                      <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        Estado del Depósito
                      </h3>
                      <div className="space-y-2 text-sm">
                        {checkoutRefactored.deposito.deposito ? (
                          <>
                            <p>
                              <span className="font-medium">Monto Pagado:</span>{' '}
                              ${checkoutRefactored.deposito.deposito.monto_pagado.toFixed(2)}
                            </p>
                            <p>
                              <span className="font-medium">Estado:</span>{' '}
                              <span className={`px-2 py-1 rounded text-xs ${
                                checkoutRefactored.deposito.deposito.estado === 'completo' 
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {checkoutRefactored.deposito.deposito.estado.toUpperCase()}
                              </span>
                            </p>
                            <p className="text-xs text-gray-600">
                              Este depósito será aplicado automáticamente a la cuenta final.
                            </p>
                          </>
                        ) : (
                          <p className="text-gray-600">
                            No hay depósito registrado para esta reservación.
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Mensajes del proceso */}
                    {checkoutRefactored.mensajes.length > 0 && (
                      <div className="bg-white border border-gray-300 rounded-md p-4">
                        <h3 className="font-semibold text-gray-900 mb-2">Mensajes del Proceso</h3>
                        <div className="space-y-1">
                          {checkoutRefactored.mensajes.map((mensaje, idx) => (
                            <p key={`mensaje-${idx}-${mensaje}`} className="text-xs text-gray-700">
                              {mensaje}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="bg-blue-100 border border-blue-300 rounded-md p-4">
                      <p className="text-sm text-blue-800">
                        <strong>ℹ️ Información:</strong> Para configurar la división de cargos detallada (asignar responsables, porcentajes, tipos de cargo), utilice el sistema de <strong>Distribución de Folios</strong> antes de completar el checkout.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* 📊 Resumen del Folio (si existe) */}
              {folioId && mostrarResumenFolio && (
                <div className="border border-blue-200 rounded-lg p-6 bg-blue-50">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-blue-600" />
                      Resumen del Folio #{folioId}
                    </h2>
                    <button
                      type="button"
                      onClick={() => setMostrarHistorialFolio(!mostrarHistorialFolio)}
                      className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      <Clock className="w-4 h-4" />
                      {mostrarHistorialFolio ? 'Ocultar' : 'Ver'} Historial
                    </button>
                  </div>
                  
                  <FolioResumen 
                    folioId={folioId} 
                    autoLoad={true}
                    showActions={true}
                  />
                  
                  {/* Validación Pre-Checkout */}
                  {validacion && (
                    <div className="mt-4">
                      {validacion.puedeCheckout ? (
                        <div className="flex items-center gap-2 p-3 bg-green-100 border border-green-300 rounded-md">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <span className="text-green-800 font-medium">
                            ✓ Folio validado, listo para checkout
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-start gap-2 p-3 bg-red-100 border border-red-300 rounded-md">
                          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-red-800 font-medium">
                              No se puede completar el checkout:
                            </p>
                            <ul className="mt-1 text-sm text-red-700 list-disc list-inside">
                              {validacion.errores.map((err, idx) => (
                                <li key={`error-${idx}-${err}`}>{err}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                      
                      {validacion.advertencias.length > 0 && (
                        <div className="flex items-start gap-2 p-3 bg-yellow-100 border border-yellow-300 rounded-md mt-2">
                          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-yellow-800 font-medium">Advertencias:</p>
                            <ul className="mt-1 text-sm text-yellow-700 list-disc list-inside">
                              {validacion.advertencias.map((adv, idx) => (
                                <li key={`warning-${idx}-${adv}`}>{adv}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
              
              {/* 📜 Historial del Folio (modal expandible) */}
              {folioId && mostrarHistorialFolio && (
                <div className="border border-gray-200 rounded-lg p-6 bg-white">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-gray-600" />
                      Historial de Operaciones
                    </h2>
                    <button
                      type="button"
                      onClick={() => setMostrarHistorialFolio(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ✕
                    </button>
                  </div>
                  
                  <FolioHistorial folioId={folioId} />
                </div>
              )}

              {/* Notas Adicionales */}
              <div className="border border-gray-200 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Notas Adicionales
                </h2>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={4}
                  placeholder="Observaciones sobre el check-out, cargos especiales, etc."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Botones */}
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => navigate(ROUTES.FRONTDESK.BASE)}
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isSubmitting || checkoutFolioHook.isLoading}
                >
                  Cancelar
                </button>
                
                {/* Mostrar estado del proceso si hay folio */}
                {folioId && checkoutFolioHook.estado.paso !== 'inicio' && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-md">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm text-blue-700">
                      {checkoutFolioHook.estado.descripcion}
                    </span>
                    <span className="text-xs text-blue-600">
                      {checkoutFolioHook.estado.progreso}%
                    </span>
                  </div>
                )}
                
                <button
                  type="submit"
                  disabled={isSubmitting || checkoutFolioHook.isLoading || Boolean(validacion && !validacion.puedeCheckout)}
                  className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  {isSubmitting || checkoutFolioHook.isLoading ? 'Procesando...' : 'Realizar Check-Out'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Receipt Modal */}
      <ReceiptModal
        isOpen={showReceipt}
        onClose={handleCloseReceipt}
        receiptData={receiptData}
      />
    </>
  );
};

export default CheckOut;
