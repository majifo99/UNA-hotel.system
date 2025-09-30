import type { CurrencyOption, Currency } from '../types/checkin';

// Currency data configuration
const CURRENCY_DATA = [
  ['CRC', 'Colón Costarricense', '₡', '🇨🇷'],
  ['USD', 'Dólar Estadounidense', '$', '🇺🇸'],
  ['EUR', 'Euro', '€', '🇪🇺'],
  ['GBP', 'Libra Esterlina', '£', '🇬🇧'],
  ['CAD', 'Dólar Canadiense', 'C$', '🇨🇦'],
  ['MXN', 'Peso Mexicano', '$', '🇲🇽'],
  ['JPY', 'Yen Japonés', '¥', '🇯🇵'],
  ['CHF', 'Franco Suizo', 'CHF', '🇨🇭'],
  ['AUD', 'Dólar Australiano', 'A$', '🇦🇺'],
  ['BRL', 'Real Brasileño', 'R$', '🇧🇷']
] as const;

export const CURRENCIES: CurrencyOption[] = CURRENCY_DATA.map(
  ([code, name, symbol, flag]) => ({ code: code as Currency, name, symbol, flag })
);

export const DEFAULT_CURRENCY: Currency = 'CRC';

export const getCurrencyByCode = (code: Currency): CurrencyOption | undefined => 
  CURRENCIES.find(currency => currency.code === code);

export const formatCurrency = (amount: number, currency: Currency): string => {
  const currencyOption = getCurrencyByCode(currency);
  if (!currencyOption) return amount.toString();
  
  return `${currencyOption.symbol}${amount.toLocaleString('es-CR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};