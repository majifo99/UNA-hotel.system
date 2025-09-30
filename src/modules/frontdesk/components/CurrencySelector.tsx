import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { Currency } from '../types/checkin';
import { CURRENCIES, DEFAULT_CURRENCY } from '../constants/currencies';

interface CurrencySelectorProps {
  value?: Currency;
  onChange: (currency: Currency) => void;
  disabled?: boolean;
  className?: string;
}

export const CurrencySelector: React.FC<CurrencySelectorProps> = ({
  value = DEFAULT_CURRENCY,
  onChange,
  disabled = false,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedCurrency = CURRENCIES.find(c => c.code === value);

  const handleSelect = (currency: Currency) => {
    onChange(currency);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Display del valor seleccionado */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full px-3 py-2 border border-gray-300 rounded-lg bg-white 
          flex items-center justify-between cursor-pointer
          focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20
          disabled:bg-gray-100 disabled:cursor-not-allowed
          ${disabled ? 'text-gray-500' : 'text-gray-900'}
        `}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">{selectedCurrency?.flag}</span>
          <span className="font-medium">{selectedCurrency?.symbol} {selectedCurrency?.code}</span>
          <span className="text-gray-600 text-sm">- {selectedCurrency?.name}</span>
        </div>
        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {/* Dropdown options */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
          {CURRENCIES.map((currency) => (
            <button
              key={currency.code}
              type="button"
              onClick={() => handleSelect(currency.code)}
              className={`
                w-full px-3 py-2 text-left hover:bg-gray-50 
                flex items-center gap-2 transition-colors
                ${currency.code === value ? 'bg-blue-50 text-blue-700' : 'text-gray-900'}
              `}
            >
              <span className="text-lg">{currency.flag}</span>
              <span className="font-medium">{currency.symbol} {currency.code}</span>
              <span className="text-gray-600 text-sm">- {currency.name}</span>
            </button>
          ))}
        </div>
      )}
      
      {/* Overlay para cerrar el dropdown */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

interface CurrencyDisplayProps {
  currency: Currency;
  amount?: number;
  showCode?: boolean;
  className?: string;
}

export const CurrencyDisplay: React.FC<CurrencyDisplayProps> = ({
  currency,
  amount,
  showCode = true,
  className = ''
}) => {
  const currencyOption = CURRENCIES.find(c => c.code === currency);
  
  if (!currencyOption) return null;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-lg">{currencyOption.flag}</span>
      <span className="text-xl">{currencyOption.symbol}</span>
      {amount !== undefined && (
        <span className="font-medium">
          {amount.toLocaleString('es-CR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })}
        </span>
      )}
      {showCode && (
        <span className="text-sm text-gray-500 font-medium">
          {currency}
        </span>
      )}
    </div>
  );
};