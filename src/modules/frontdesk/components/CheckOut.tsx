import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import ReactFlagsSelect from 'react-flags-select';
import { Search, CreditCard, FileText, LogOut, ArrowLeft, DollarSign, Split } from 'lucide-react';
import { useCheckout } from '../hooks/useCheckout';
import { useCheckoutRefactored } from '../hooks/useCheckoutRefactored';
import { ROUTES } from '../../../router/routes';
import type { CheckoutFormData, ReceiptData } from '../types/checkout';
import type { ResponsablePago, TipoCargo } from '../types/folioTypes';
import type { ConfiguracionResponsables } from '../hooks/useCheckoutRefactored';
import BillingSection from './BillingSection';
import ReceiptModal from './ReceiptModal';

const CheckOut = () => {
  const navigate = useNavigate();
  const { validateAndSubmit, searchReservation, isSubmitting, isSearching, error, setError } = useCheckout();
  
  // IDs dinámicos - se actualizan al buscar la reservación
  // @ts-expect-error - Se establecerán cuando el backend retorne folioId en la búsqueda de reservación
  const [folioId, setFolioId] = useState<number | null>(null);
  // @ts-expect-error - Se establecerán cuando el backend retorne id de reserva
  const [reservaId, setReservaId] = useState<number | undefined>(undefined);
  
  // Hook refactorizado para checkout completo - solo se inicializa si hay folioId
  const checkoutRefactored = useCheckoutRefactored(folioId || 1, reservaId);

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

  const [searchId, setSearchId] = useState('');
  const [isReservationFound, setIsReservationFound] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
  
  // ⚖️ Estados para división de cargos
  const [mostrarDivision, setMostrarDivision] = useState(false);
  // @ts-expect-error - Preparado para futura funcionalidad de configuración inline de responsables
  const [responsables, setResponsables] = useState<ResponsablePago[]>([]);
  // @ts-expect-error - Preparado para futura funcionalidad de asignación de tipos de cargo
  const [asignaciones, setAsignaciones] = useState<Array<{
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

  const handleSearchReservation = async () => {
    if (!searchId.trim()) {
      setError('Por favor ingrese un ID de reservación para buscar');
      return;
    }

    const reservation = await searchReservation(searchId);
    if (reservation) {
      setFormData(reservation);
      setIsReservationFound(true);
      setError(null); // Clear any previous errors
      
      // TODO: En producción, extraer folioId y reservaId del objeto reservation
      // Ejemplo: setFolioId(reservation.folioId);
      // Ejemplo: setReservaId(reservation.id);
    } else {
      setIsReservationFound(false);
      setError('No se encontró la reservación. Puede continuar con check-out manual.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Si tiene división de cargos, usar el hook refactorizado
    if (formData.requiereDivisionCargos && responsables.length > 0) {
      const configuracion: ConfiguracionResponsables = {
        responsables,
        asignaciones
      };

      const resultado = await checkoutRefactored.procesarCheckout(formData, configuracion);
      
      if (resultado.exito) {
        // Generar recibo con información de las facturas
        const generateReceiptNumber = (): string => {
          return resultado.numeroRecibo;
        };

        const receipt: ReceiptData = {
          receiptNumber: generateReceiptNumber(),
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
    } else {
      // Checkout normal sin división
      const success = await validateAndSubmit(formData);
      if (success) {
        // Generate receipt data with secure receipt number
        const generateReceiptNumber = (): string => {
          const now = new Date();
          const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
          const timePart = `${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
          const millisPart = String(now.getMilliseconds()).padStart(3, '0');
          
          // Use crypto.getRandomValues for secure random number
          const randomArray = new Uint32Array(1);
          crypto.getRandomValues(randomArray);
          const randomPart = (randomArray[0] % 10000).toString().padStart(4, '0');
          
          return `RCP-${datePart}-${timePart}${millisPart}-${randomPart}`;
        };

        const receipt: ReceiptData = {
          receiptNumber: generateReceiptNumber(),
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

  const handleCloseReceipt = () => {
    setShowReceipt(false);
    navigate(ROUTES.FRONTDESK.BASE);
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
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ID de Reservación
                  </label>
                  <input
                    type="text"
                    value={searchId}
                    onChange={(e) => setSearchId(e.target.value)}
                    placeholder="Ej: RES-12345"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={handleSearchReservation}
                    disabled={isSearching || !searchId.trim()}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {isSearching ? 'Buscando...' : 'Buscar'}
                  </button>
                </div>
              </div>
              {searchId && !isReservationFound && (
                <p className="mt-2 text-sm text-orange-600">
                  No se encontró la reservación. Puede continuar con check-out manual.
                </p>
              )}
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
                            <p key={idx} className="text-xs text-gray-700">
                              {mensaje}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="bg-blue-100 border border-blue-300 rounded-md p-4">
                      <p className="text-sm text-blue-800">
                        <strong>ℹ️ Información:</strong> Para configurar la división de cargos detallada 
                        (asignar responsables, porcentajes, tipos de cargo), utilice el sistema de 
                        <strong> Distribución de Folios</strong> antes de completar el checkout.
                      </p>
                    </div>
                  </div>
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
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  {isSubmitting ? 'Procesando...' : 'Realizar Check-Out'}
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
