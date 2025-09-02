import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Calculator, Split, Receipt } from 'lucide-react';
import type { BillingItem, BillSplit } from '../types/checkout';

interface BillingSectionProps {
  billingItems: BillingItem[];
  setBillingItems: (items: BillingItem[]) => void;
  billSplits: BillSplit[];
  setBillSplits: (splits: BillSplit[]) => void;
  subtotal: number;
  setSubtotal: (amount: number) => void;
  taxAmount: number;
  setTaxAmount: (amount: number) => void;
  discountAmount: number;
  setDiscountAmount: (amount: number) => void;
  grandTotal: number;
  setGrandTotal: (amount: number) => void;
  taxRate: number;
  setTaxRate: (rate: number) => void;
  splitBill: boolean;
  setSplitBill: (split: boolean) => void;
  numberOfSplits: number;
  setNumberOfSplits: (splits: number) => void;
}

const BillingSection: React.FC<BillingSectionProps> = ({
  billingItems,
  setBillingItems,
  billSplits,
  setBillSplits,
  subtotal,
  setSubtotal,
  taxAmount,
  setTaxAmount,
  discountAmount,
  setDiscountAmount,
  grandTotal,
  setGrandTotal,
  taxRate,
  setTaxRate,
  splitBill,
  setSplitBill,
  numberOfSplits,
  setNumberOfSplits
}) => {
  const [showAddItem, setShowAddItem] = useState(false);
  const [newItem, setNewItem] = useState<Partial<BillingItem>>({
    description: '',
    quantity: 1,
    unitPrice: 0,
    category: 'service'
  });

  // Calculate totals whenever billing items change
  useEffect(() => {
    const newSubtotal = billingItems.reduce((sum, item) => sum + item.total, 0);
    setSubtotal(newSubtotal);
    
    const newTaxAmount = newSubtotal * (taxRate / 100);
    setTaxAmount(newTaxAmount);
    
    const newGrandTotal = newSubtotal + newTaxAmount - discountAmount;
    setGrandTotal(newGrandTotal);
  }, [billingItems, taxRate, discountAmount]); // Removed setters from dependencies

  // Calculate bill splits when enabled
  useEffect(() => {
    if (splitBill && numberOfSplits > 1) {
      const splitAmount = subtotal / numberOfSplits;
      const newSplits: BillSplit[] = Array.from({ length: numberOfSplits }, (_, i) => ({
        id: `split-${i + 1}`,
        guestName: `Guest ${i + 1}`,
        items: billingItems.map(item => ({
          ...item,
          total: item.total / numberOfSplits
        })),
        subtotal: splitAmount,
        tax: (taxAmount / numberOfSplits),
        total: splitAmount + (taxAmount / numberOfSplits),
        percentage: 100 / numberOfSplits
      }));
      setBillSplits(newSplits);
    } else {
      setBillSplits([]);
    }
  }, [splitBill, numberOfSplits, subtotal, taxAmount, billingItems]); // Removed setBillSplits from dependencies

  const addBillingItem = () => {
    if (!newItem.description || newItem.unitPrice === undefined) return;
    
    const item: BillingItem = {
      id: `item-${Date.now()}`,
      description: newItem.description,
      quantity: newItem.quantity || 1,
      unitPrice: newItem.unitPrice,
      total: (newItem.quantity || 1) * newItem.unitPrice,
      category: newItem.category || 'service'
    };
    
    setBillingItems([...billingItems, item]);
    setNewItem({ description: '', quantity: 1, unitPrice: 0, category: 'service' });
    setShowAddItem(false);
  };

  const removeBillingItem = (id: string) => {
    setBillingItems(billingItems.filter(item => item.id !== id));
  };

  const updateBillingItem = (id: string, field: keyof BillingItem, value: any) => {
    setBillingItems(billingItems.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unitPrice') {
          updatedItem.total = updatedItem.quantity * updatedItem.unitPrice;
        }
        return updatedItem;
      }
      return item;
    }));
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      room: 'bg-blue-100 text-blue-800',
      service: 'bg-green-100 text-green-800',
      amenity: 'bg-purple-100 text-purple-800',
      tax: 'bg-red-100 text-red-800',
      fee: 'bg-yellow-100 text-yellow-800',
      discount: 'bg-gray-100 text-gray-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getCategoryLabel = (category: string) => {
    const labels = {
      room: 'Habitación',
      service: 'Servicio',
      amenity: 'Amenidad',
      tax: 'Impuesto',
      fee: 'Cargo',
      discount: 'Descuento'
    };
    return labels[category as keyof typeof labels] || category;
  };

  return (
    <div className="space-y-6">
      {/* Billing Items Section */}
      <div className="border border-gray-200 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Receipt className="w-5 h-5" />
            Detalle de Facturación
          </h3>
          <button
            onClick={() => setShowAddItem(!showAddItem)}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Agregar Item
          </button>
        </div>

        {/* Add New Item Form */}
        {showAddItem && (
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <input
                  type="text"
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Descripción del item"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cantidad
                </label>
                <input
                  type="number"
                  min="1"
                  value={newItem.quantity}
                  onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Precio Unitario
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={newItem.unitPrice}
                  onChange={(e) => setNewItem({ ...newItem, unitPrice: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoría
                </label>
                <select
                  value={newItem.category}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="room">Habitación</option>
                  <option value="service">Servicio</option>
                  <option value="amenity">Amenidad</option>
                  <option value="tax">Impuesto</option>
                  <option value="fee">Cargo</option>
                  <option value="discount">Descuento</option>
                </select>
              </div>
              <div className="flex items-end gap-2">
                <button
                  onClick={addBillingItem}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Agregar
                </button>
                <button
                  onClick={() => setShowAddItem(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Billing Items List */}
        <div className="space-y-3">
          {billingItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => updateBillingItem(item.id, 'description', e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateBillingItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={item.unitPrice}
                    onChange={(e) => updateBillingItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">${item.total.toFixed(2)}</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${getCategoryColor(item.category)}`}>
                    {getCategoryLabel(item.category)}
                  </span>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={() => removeBillingItem(item.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {billingItems.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Receipt className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>No hay items de facturación</p>
          </div>
        )}
      </div>

      {/* Bill Splitting Section */}
      <div className="border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Split className="w-5 h-5" />
          <h3 className="text-lg font-semibold text-gray-900">División de Cuenta</h3>
        </div>
        
        <div className="flex items-center gap-4 mb-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={splitBill}
              onChange={(e) => setSplitBill(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">Dividir cuenta</span>
          </label>
          
          {splitBill && (
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-700">Número de divisiones:</label>
              <input
                type="number"
                min="2"
                max="10"
                value={numberOfSplits}
                onChange={(e) => setNumberOfSplits(parseInt(e.target.value) || 2)}
                className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
              />
            </div>
          )}
        </div>

        {/* Bill Splits Display */}
        {splitBill && billSplits.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">División de Cuenta:</h4>
            {billSplits.map((split) => (
              <div key={split.id} className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <div>
                  <span className="font-medium text-blue-900">{split.guestName}</span>
                  <span className="text-sm text-blue-700 ml-2">({split.percentage.toFixed(1)}%)</span>
                </div>
                <div className="text-right">
                  <div className="font-medium text-blue-900">${split.total.toFixed(2)}</div>
                  <div className="text-sm text-blue-700">
                    Subtotal: ${split.subtotal.toFixed(2)} | Tax: ${split.tax.toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Totals Section */}
      <div className="border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Calculator className="w-5 h-5" />
          Resumen de Totales
        </h3>
        
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal:</span>
            <span className="font-medium">${subtotal.toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Tasa de Impuesto (%):</span>
            <input
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={taxRate}
              onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
              className="w-20 px-2 py-1 border border-gray-300 rounded text-sm text-right"
            />
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Impuestos:</span>
            <span className="font-medium">${taxAmount.toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Descuentos:</span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={discountAmount}
              onChange={(e) => setDiscountAmount(parseFloat(e.target.value) || 0)}
              className="w-24 px-2 py-1 border border-gray-300 rounded text-sm text-right"
            />
          </div>
          
          <hr className="border-gray-300" />
          
          <div className="flex justify-between text-lg font-bold">
            <span>Total General:</span>
            <span className="text-green-600">${grandTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingSection;
