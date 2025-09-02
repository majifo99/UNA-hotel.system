import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import ReactFlagsSelect from 'react-flags-select';
import { Search, CreditCard, FileText, LogOut, ArrowLeft } from 'lucide-react';
import { useCheckout } from '../hooks/useCheckout';
import { ROUTES } from '../../../router/routes';
import type { CheckoutFormData, ReceiptData } from '../types/checkout';
import BillingSection from './BillingSection';
import ReceiptModal from './ReceiptModal';

const CheckOut = () => {
  const navigate = useNavigate();
  const { validateAndSubmit, searchReservation, isSubmitting, isSearching, error, setError } = useCheckout();

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
    } else {
      setIsReservationFound(false);
      setError('No se encontró la reservación. Puede continuar con check-out manual.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const success = await validateAndSubmit(formData);
    if (success) {
      // Generate receipt data
      const receipt: ReceiptData = {
        receiptNumber: `RCP-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
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
