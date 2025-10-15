import React from 'react';
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
  const selectedCurrency = CURRENCIES.find(c => c.code === value);

  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(event.target.value as Currency);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Native select element for accessibility */}
      <select
        value={value}
        onChange={handleSelectChange}
        disabled={disabled}
        aria-label="Selector de moneda"
        className={`
          w-full pl-16 pr-10 py-2 border border-gray-300 rounded-lg bg-white 
          focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20
          disabled:bg-gray-100 disabled:cursor-not-allowed
          ${disabled ? 'text-gray-500' : 'text-gray-900'}
          appearance-none cursor-pointer
        `}
      >
        {CURRENCIES.map((currency) => (
          <option key={currency.code} value={currency.code}>
            {currency.flag} {currency.symbol} {currency.code} - {currency.name}
          </option>
        ))}
      </select>
      
      {/* Custom dropdown icon */}
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <ChevronDown className="h-4 w-4 text-gray-400" />
      </div>
      
      {/* Currency display for better UX */}
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <div className="flex items-center gap-2">
          <span className="text-lg">{selectedCurrency?.flag}</span>
          <span className="font-medium text-sm">{selectedCurrency?.symbol}</span>
        </div>
      </div>
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