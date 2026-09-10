import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  CurrencyCode,
  SUPPORTED_CURRENCIES,
  CurrencyConfig,
  formatMoney as formatMoneyUtil,
  formatCrores as formatCroresUtil,
  formatRawINR as formatRawINRUtil,
  convertFromUSD as convertFromUSDUtil,
} from '../lib/currency';

interface CurrencyContextType {
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  currencyConfig: CurrencyConfig;
  currencies: CurrencyConfig[];
  inrMode: 'lakhs_crores' | 'full';
  setInrMode: (mode: 'lakhs_crores' | 'full') => void;
  formatMoney: (amountInUSD: number, options?: { compact?: boolean; showSymbol?: boolean }) => string;
  formatCrores: (croresINR: number, options?: { compact?: boolean; showSymbol?: boolean }) => string;
  formatRawINR: (amountInINR: number, options?: { compact?: boolean; showSymbol?: boolean }) => string;
  convertFromUSD: (amountInUSD: number) => number;
}

const CurrencyContext = createContext<CurrencyContextType | null>(null);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Defaults to Indian Rupee ('INR') per user requirement
  const [currency, setCurrencyState] = useState<CurrencyCode>(() => {
    try {
      const saved = localStorage.getItem('terragis_currency_v1') as CurrencyCode;
      if (saved && SUPPORTED_CURRENCIES[saved]) return saved;
    } catch {}
    return 'INR';
  });

  const [inrMode, setInrModeState] = useState<'lakhs_crores' | 'full'>('lakhs_crores');

  const setCurrency = (c: CurrencyCode) => {
    setCurrencyState(c);
    try {
      localStorage.setItem('terragis_currency_v1', c);
    } catch {}
  };

  const setInrMode = (mode: 'lakhs_crores' | 'full') => {
    setInrModeState(mode);
  };

  const currencyConfig = SUPPORTED_CURRENCIES[currency] || SUPPORTED_CURRENCIES.INR;
  const currencies = Object.values(SUPPORTED_CURRENCIES);

  const formatMoney = (
    amountInUSD: number,
    options?: { compact?: boolean; showSymbol?: boolean }
  ) => {
    return formatMoneyUtil(amountInUSD, currency, {
      ...options,
      inrMode,
    });
  };

  const formatCrores = (
    croresINR: number,
    options?: { compact?: boolean; showSymbol?: boolean }
  ) => {
    return formatCroresUtil(croresINR, currency, options);
  };

  const formatRawINR = (
    amountInINR: number,
    options?: { compact?: boolean; showSymbol?: boolean }
  ) => {
    return formatRawINRUtil(amountInINR, currency, options);
  };

  const convertFromUSD = (amountInUSD: number) => {
    return convertFromUSDUtil(amountInUSD, currency);
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        currencyConfig,
        currencies,
        inrMode,
        setInrMode,
        formatMoney,
        formatCrores,
        formatRawINR,
        convertFromUSD,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = (): CurrencyContextType => {
  const context = useContext(CurrencyContext);
  if (!context) {
    // Fallback safe defaults if used outside provider
    return {
      currency: 'INR',
      setCurrency: () => {},
      currencyConfig: SUPPORTED_CURRENCIES.INR,
      currencies: Object.values(SUPPORTED_CURRENCIES),
      inrMode: 'lakhs_crores',
      setInrMode: () => {},
      formatMoney: (amt: number, opts?: any) => formatMoneyUtil(amt, 'INR', opts),
      formatCrores: (cr: number, opts?: any) => formatCroresUtil(cr, 'INR', opts),
      formatRawINR: (amt: number, opts?: any) => formatRawINRUtil(amt, 'INR', opts),
      convertFromUSD: (amt: number) => convertFromUSDUtil(amt, 'INR'),
    };
  }
  return context;
};
