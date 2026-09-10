import React, { useState, useRef, useEffect } from 'react';
import { Coins, ChevronDown, Check, Sparkles, ArrowRightLeft } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';
import { CurrencyCode, SUPPORTED_CURRENCIES } from '../lib/currency';

interface CurrencySelectorProps {
  variant?: 'navbar' | 'compact' | 'pill';
  showRatePill?: boolean;
}

export const CurrencySelector: React.FC<CurrencySelectorProps> = ({
  variant = 'navbar',
  showRatePill = false,
}) => {
  const {
    currency,
    setCurrency,
    currencyConfig,
    currencies,
    inrMode,
    setInrMode,
  } = useCurrency();

  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const filteredCurrencies = currencies.filter(
    (c) =>
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.country.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        id="btn-currency-selector"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 transition font-semibold select-none ${
          variant === 'navbar'
            ? 'px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs text-slate-700 shadow-2xs'
            : variant === 'pill'
            ? 'px-2 py-1 rounded-md bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs'
            : 'px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs border border-slate-200'
        }`}
        title={`Current Currency: ${currencyConfig.name} (${currencyConfig.symbol}) — Click to change`}
      >
        <span className="text-sm leading-none">{currencyConfig.flag}</span>
        <span className="font-bold text-slate-900">{currencyConfig.symbol}</span>
        <span className="text-xs">{currencyConfig.code}</span>
        <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-slate-200 p-2 z-50 animate-in fade-in">
          {/* Header */}
          <div className="p-2 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5 text-emerald-600" />
                Currency & Valuation
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                Auto-Converting
              </span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              All land valuations, compensation ledgers, and project budgets convert in real-time.
            </p>
          </div>

          {/* Search Box */}
          <div className="p-1 border-b border-slate-100">
            <input
              type="text"
              placeholder="Search currency (e.g. INR, USD, EUR)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-md bg-slate-50 text-slate-800 text-xs border border-slate-200 focus:outline-hidden focus:border-emerald-500"
              autoFocus
            />
          </div>

          {/* Currency List */}
          <div className="max-h-60 overflow-y-auto py-1 space-y-0.5">
            {filteredCurrencies.map((c) => {
              const isSelected = c.code === currency;
              return (
                <button
                  key={c.code}
                  onClick={() => {
                    setCurrency(c.code);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left text-xs transition ${
                    isSelected
                      ? 'bg-emerald-50 text-emerald-950 font-bold border border-emerald-200'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base leading-none">{c.flag}</span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900">{c.code}</span>
                        <span className="text-slate-500 text-[11px]">({c.symbol})</span>
                      </div>
                      <span className="text-[10px] text-slate-500 block leading-tight">{c.name}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    {isSelected ? (
                      <span className="flex items-center gap-1 text-emerald-700 font-bold text-[11px]">
                        <Check className="w-3.5 h-3.5" />
                        Active
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-mono">
                        {c.code === 'INR' ? 'Base: ₹1.00' : `1 ${c.code} ≈ ₹${c.inrRate.toFixed(1)}`}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Indian Numbering Format Option (Active when INR is selected) */}
          {currency === 'INR' && (
            <div className="mt-2 pt-2 border-t border-slate-100 px-2 pb-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Indian Format Notation:
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => setInrMode('lakhs_crores')}
                  className={`px-2 py-1 rounded text-[11px] font-medium border text-center transition ${
                    inrMode === 'lakhs_crores'
                      ? 'bg-emerald-600 text-white border-emerald-700 font-bold shadow-2xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  Lakhs & Crores
                  <span className="block text-[9px] opacity-80">(e.g. ₹4.85 Cr)</span>
                </button>
                <button
                  onClick={() => setInrMode('full')}
                  className={`px-2 py-1 rounded text-[11px] font-medium border text-center transition ${
                    inrMode === 'full'
                      ? 'bg-emerald-600 text-white border-emerald-700 font-bold shadow-2xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  Full Digits
                  <span className="block text-[9px] opacity-80">(e.g. ₹4,85,00,000)</span>
                </button>
              </div>
            </div>
          )}

          {/* Exchange Rate Benchmark Footer */}
          <div className="mt-1 pt-1.5 border-t border-slate-100 px-2 py-1 flex items-center justify-between text-[10px] text-slate-400">
            <span className="flex items-center gap-1">
              <ArrowRightLeft className="w-3 h-3 text-emerald-600" />
              1 USD = ₹83.50 INR
            </span>
            <span className="font-mono">Forex Ref: RBI/IMF</span>
          </div>
        </div>
      )}
    </div>
  );
};
