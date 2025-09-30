import type { CurrencyOption, Currency } from '../types/checkin';

export const CURRENCIES: CurrencyOption[] = [
  {
    code: 'CRC',
    name: 'Colón Costarricense',
    symbol: '₡',
    flag: '🇨🇷'
  },
  {
    code: 'USD',
    name: 'Dólar Estadounidense',
    symbol: '$',
    flag: '🇺🇸'
  },
  {
    code: 'EUR',
    name: 'Euro',
    symbol: '€',
    flag: '🇪🇺'
  },
  {
    code: 'GBP',
    name: 'Libra Esterlina',
    symbol: '£',
    flag: '🇬🇧'
  },
  {
    code: 'CAD',
    name: 'Dólar Canadiense',
    symbol: 'C$',
    flag: '🇨🇦'
  },
  {
    code: 'MXN',
    name: 'Peso Mexicano',
    symbol: '$',
    flag: '🇲🇽'
  },
  {
    code: 'JPY',
    name: 'Yen Japonés',
    symbol: '¥',
    flag: '🇯🇵'
  },
  {
    code: 'CHF',
    name: 'Franco Suizo',
    symbol: 'CHF',
    flag: '🇨🇭'
  },
  {
    code: 'AUD',
    name: 'Dólar Australiano',
    symbol: 'A$',
    flag: '🇦🇺'
  },
  {
    code: 'BRL',
    name: 'Real Brasileño',
    symbol: 'R$',
    flag: '🇧🇷'
  }
];

export const DEFAULT_CURRENCY: Currency = 'CRC';

export const getCurrencyByCode = (code: Currency): CurrencyOption | undefined => {
  return CURRENCIES.find(currency => currency.code === code);
};

export const formatCurrency = (amount: number, currency: Currency): string => {
  const currencyOption = getCurrencyByCode(currency);
  if (!currencyOption) return amount.toString();
  
  return `${currencyOption.symbol}${amount.toLocaleString('es-CR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};