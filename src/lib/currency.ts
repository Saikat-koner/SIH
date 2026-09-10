// Multi-Currency & Indian Rupee (INR) Valuation Engine

export type CurrencyCode =
  | 'INR'
  | 'USD'
  | 'EUR'
  | 'GBP'
  | 'AED'
  | 'SGD'
  | 'CAD'
  | 'AUD'
  | 'JPY'
  | 'CHF';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
  country: string;
  flag: string;
  rateToUSD: number; // 1 USD = X Currency
  inrRate: number; // 1 Unit of this Currency = X INR
  locale: string;
}

export const SUPPORTED_CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  INR: {
    code: 'INR',
    symbol: '₹',
    name: 'Indian Rupee',
    country: 'India',
    flag: '🇮🇳',
    rateToUSD: 83.5, // 1 USD = 83.50 INR
    inrRate: 1.0,
    locale: 'en-IN',
  },
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    country: 'United States',
    flag: '🇺🇸',
    rateToUSD: 1.0,
    inrRate: 83.5,
    locale: 'en-US',
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    country: 'European Union',
    flag: '🇪🇺',
    rateToUSD: 0.92,
    inrRate: 90.76, // 83.5 / 0.92
    locale: 'de-DE',
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    country: 'United Kingdom',
    flag: '🇬🇧',
    rateToUSD: 0.79,
    inrRate: 105.7, // 83.5 / 0.79
    locale: 'en-GB',
  },
  AED: {
    code: 'AED',
    symbol: 'د.إ',
    name: 'UAE Dirham',
    country: 'United Arab Emirates',
    flag: '🇦🇪',
    rateToUSD: 3.67,
    inrRate: 22.75, // 83.5 / 3.67
    locale: 'ar-AE',
  },
  SGD: {
    code: 'SGD',
    symbol: 'S$',
    name: 'Singapore Dollar',
    country: 'Singapore',
    flag: '🇸🇬',
    rateToUSD: 1.34,
    inrRate: 62.31,
    locale: 'en-SG',
  },
  CAD: {
    code: 'CAD',
    symbol: 'C$',
    name: 'Canadian Dollar',
    country: 'Canada',
    flag: '🇨🇦',
    rateToUSD: 1.36,
    inrRate: 61.4,
    locale: 'en-CA',
  },
  AUD: {
    code: 'AUD',
    symbol: 'A$',
    name: 'Australian Dollar',
    country: 'Australia',
    flag: '🇦🇺',
    rateToUSD: 1.52,
    inrRate: 54.93,
    locale: 'en-AU',
  },
  JPY: {
    code: 'JPY',
    symbol: '¥',
    name: 'Japanese Yen',
    country: 'Japan',
    flag: '🇯🇵',
    rateToUSD: 155.2,
    inrRate: 0.538,
    locale: 'ja-JP',
  },
  CHF: {
    code: 'CHF',
    symbol: 'CHF',
    name: 'Swiss Franc',
    country: 'Switzerland',
    flag: '🇨🇭',
    rateToUSD: 0.9,
    inrRate: 92.78,
    locale: 'de-CH',
  },
};

/**
 * Converts a base USD amount to the requested target currency.
 */
export function convertFromUSD(amountInUSD: number, targetCurrency: CurrencyCode): number {
  const config = SUPPORTED_CURRENCIES[targetCurrency] || SUPPORTED_CURRENCIES.INR;
  return amountInUSD * config.rateToUSD;
}

/**
 * Converts a base INR amount to the requested target currency.
 */
export function convertFromINR(amountInINR: number, targetCurrency: CurrencyCode): number {
  if (targetCurrency === 'INR') return amountInINR;
  // Convert INR -> USD -> targetCurrency
  const inUSD = amountInINR / SUPPORTED_CURRENCIES.INR.rateToUSD;
  const config = SUPPORTED_CURRENCIES[targetCurrency] || SUPPORTED_CURRENCIES.USD;
  return inUSD * config.rateToUSD;
}

/**
 * Formats a monetary value (provided in base USD) into the specified target currency.
 * For INR: Supports Indian numbering system (Lakhs / Crores) or full formatted digits.
 */
export function formatMoney(
  amountInUSD: number,
  currency: CurrencyCode = 'INR',
  options: {
    compact?: boolean;
    showSymbol?: boolean;
    inrMode?: 'lakhs_crores' | 'full';
  } = {}
): string {
  const { compact = false, showSymbol = true, inrMode = 'lakhs_crores' } = options;
  const config = SUPPORTED_CURRENCIES[currency] || SUPPORTED_CURRENCIES.INR;
  const converted = convertFromUSD(amountInUSD, currency);

  if (currency === 'INR') {
    const symbol = showSymbol ? '₹' : '';
    // If compact or inrMode is lakhs_crores:
    if (compact || inrMode === 'lakhs_crores') {
      if (Math.abs(converted) >= 10000000) {
        const cr = converted / 10000000;
        return `${symbol}${cr >= 100 ? cr.toFixed(1) : cr.toFixed(2)} Cr`;
      }
      if (Math.abs(converted) >= 100000) {
        const lakh = converted / 100000;
        return `${symbol}${lakh >= 100 ? lakh.toFixed(1) : lakh.toFixed(2)} L`;
      }
    }
    // Full Indian Numbering System formatting (2,2,3 grouping)
    return `${symbol}${Math.round(converted).toLocaleString('en-IN')}`;
  }

  // International Currencies
  const symbol = showSymbol ? config.symbol : '';
  if (compact) {
    if (Math.abs(converted) >= 1e9) {
      return `${symbol}${(converted / 1e9).toFixed(2)}B`;
    }
    if (Math.abs(converted) >= 1e6) {
      return `${symbol}${(converted / 1e6).toFixed(2)}M`;
    }
    if (Math.abs(converted) >= 1e3) {
      return `${symbol}${(converted / 1e3).toFixed(1)}K`;
    }
  }

  return `${symbol}${Math.round(converted).toLocaleString(config.locale)}`;
}

/**
 * Formats values given in Indian Crores (1 Crore = 10,000,000 INR) into the selected currency.
 * Used for infrastructure project budgets (NHAI, DFCCIL, GatiShakti) & PFMS allocations.
 */
export function formatCrores(
  croresINR: number,
  currency: CurrencyCode = 'INR',
  options: { compact?: boolean; showSymbol?: boolean } = {}
): string {
  const { compact = true, showSymbol = true } = options;
  if (currency === 'INR') {
    const symbol = showSymbol ? '₹' : '';
    return `${symbol}${croresINR.toLocaleString('en-IN', { maximumFractionDigits: 1 })} Cr`;
  }

  // Convert Crores INR to Target Currency
  const totalINR = croresINR * 10000000;
  const totalUSD = totalINR / SUPPORTED_CURRENCIES.INR.rateToUSD;
  const config = SUPPORTED_CURRENCIES[currency] || SUPPORTED_CURRENCIES.USD;
  const converted = totalUSD * config.rateToUSD;

  const symbol = showSymbol ? config.symbol : '';
  if (compact) {
    if (Math.abs(converted) >= 1e9) {
      return `${symbol}${(converted / 1e9).toFixed(2)}B`;
    }
    if (Math.abs(converted) >= 1e6) {
      return `${symbol}${(converted / 1e6).toFixed(1)}M`;
    }
    if (Math.abs(converted) >= 1e3) {
      return `${symbol}${(converted / 1e3).toFixed(1)}K`;
    }
  }

  return `${symbol}${Math.round(converted).toLocaleString(config.locale)}`;
}

/**
 * Formats a raw INR amount (e.g. from RFCTLARR compensation calculator)
 * into the selected currency.
 */
export function formatRawINR(
  amountInINR: number,
  currency: CurrencyCode = 'INR',
  options: { compact?: boolean; showSymbol?: boolean } = {}
): string {
  const inUSD = amountInINR / SUPPORTED_CURRENCIES.INR.rateToUSD;
  return formatMoney(inUSD, currency, options);
}
