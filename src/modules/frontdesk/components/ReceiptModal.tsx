import React from 'react';
import { X, Printer, Download, Receipt as ReceiptIcon } from 'lucide-react';
import type { ReceiptData } from '../types/checkout';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  receiptData: ReceiptData | null;
}

const ReceiptModal: React.FC<ReceiptModalProps> = ({ isOpen, onClose, receiptData }) => {
  if (!isOpen || !receiptData) return null;

  // Helper para convertir valores a número de forma segura
  const toNumber = (value: unknown): number => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const parsed = Number.parseFloat(value);
      return Number.isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Generate PDF or download functionality would go here
    console.log('Downloading receipt...');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <ReceiptIcon className="w-8 h-8 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">Recibo de Check-Out</h2>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Printer className="w-4 h-4" />
              Imprimir
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              <Download className="w-4 h-4" />
              Descargar
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Receipt Content */}
        <div className="p-6 space-y-6">
          {/* Hotel Information */}
          <div className="text-center border-b border-gray-200 pb-4">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">UNA Hotel</h1>
            <p className="text-gray-600">123 Main Street, San José, Costa Rica</p>
            <p className="text-gray-600">Tel: +506 2222-2222 | Email: info@unahotel.com</p>
          </div>

          {/* Receipt Header */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Información del Recibo</h3>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">Número de Recibo:</span> {receiptData.receiptNumber}</p>
                <p><span className="font-medium">Fecha de Check-Out:</span> {formatDate(receiptData.checkOutDate)}</p>
                <p><span className="font-medium">Hora de Check-Out:</span> {formatTime(receiptData.checkoutTime)}</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Información del Huésped</h3>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">Nombre:</span> {receiptData.guestName}</p>
                <p><span className="font-medium">Habitación:</span> {receiptData.roomNumber}</p>
                <p><span className="font-medium">Check-In:</span> {formatDate(receiptData.checkInDate)}</p>
                <p><span className="font-medium">Check-Out:</span> {formatDate(receiptData.checkOutDate)}</p>
              </div>
            </div>
          </div>

          {/* Billing Items */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Detalle de Facturación</h3>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Descripción
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cantidad
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Precio Unit.
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Categoría
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {receiptData.billingItems.map((item) => {
                    // Determinar si es un pago (categoría discount)
                    const isPago = item.category === 'discount';
                    const displayTotal = isPago ? -Math.abs(toNumber(item.total)) : toNumber(item.total);
                    const displayUnitPrice = isPago ? -Math.abs(toNumber(item.unitPrice)) : toNumber(item.unitPrice);
                    
                    return (
                      <tr key={item.id}>
                        <td className="px-4 py-3 text-sm text-gray-900">{item.description}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right">{item.quantity}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right">${displayUnitPrice.toFixed(2)}</td>
                        <td className={`px-4 py-3 text-sm text-right font-medium ${isPago ? 'text-green-600' : 'text-gray-900'}`}>
                          ${displayTotal.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            item.category === 'room' ? 'bg-blue-100 text-blue-800' :
                            item.category === 'service' ? 'bg-green-100 text-green-800' :
                            item.category === 'amenity' ? 'bg-purple-100 text-purple-800' :
                            item.category === 'tax' ? 'bg-red-100 text-red-800' :
                            item.category === 'fee' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {item.category === 'room' ? 'Habitación' :
                             item.category === 'service' ? 'Servicio' :
                             item.category === 'amenity' ? 'Amenidad' :
                             item.category === 'tax' ? 'Impuesto' :
                             item.category === 'fee' ? 'Cargo' :
                             'Descuento'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bill Splits (if applicable) */}
          {receiptData.billSplits && receiptData.billSplits.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">División de Cuenta</h3>
              <div className="space-y-3">
                {receiptData.billSplits.map((split) => (
                  <div key={split.id} className="border border-gray-200 rounded-lg p-4 bg-blue-50">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium text-blue-900">{split.guestName}</h4>
                      <span className="text-sm text-blue-700">({toNumber(split.percentage).toFixed(1)}% del total)</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-blue-700">Subtotal:</span>
                        <span className="ml-2 font-medium text-blue-900">${toNumber(split.subtotal).toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-blue-700">Impuestos:</span>
                        <span className="ml-2 font-medium text-blue-900">${toNumber(split.tax).toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-blue-700">Total:</span>
                        <span className="ml-2 font-bold text-blue-900">${toNumber(split.total).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Totals Summary */}
          <div className="border-t border-gray-200 pt-4">
            <div className="max-w-md ml-auto space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">${toNumber(receiptData.subtotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Impuestos:</span>
                <span className="font-medium">${toNumber(receiptData.taxAmount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Descuentos:</span>
                <span className="font-medium">-${toNumber(receiptData.discountAmount).toFixed(2)}</span>
              </div>
              <hr className="border-gray-300" />
              <div className="flex justify-between text-lg font-bold">
                <span>Total General:</span>
                <span className="text-green-600">${toNumber(receiptData.grandTotal).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="border-t border-gray-200 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Información de Pago</h4>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Estado:</span> 
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                      receiptData.paymentStatus === 'completed' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {receiptData.paymentStatus === 'completed' ? 'Completado' : 'Pendiente'}
                    </span>
                  </p>
                  <p><span className="font-medium">Método:</span> {receiptData.paymentMethod}</p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Notas</h4>
                <p className="text-sm text-gray-600">
                  {receiptData.notes || 'Sin observaciones adicionales'}
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 pt-4 text-center text-sm text-gray-500">
            <p>¡Gracias por su estadía en UNA Hotel!</p>
            <p>Esperamos verle nuevamente pronto</p>
            <p className="mt-2">Este recibo es un comprobante oficial de su transacción</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiptModal;
