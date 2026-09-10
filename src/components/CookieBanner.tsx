import React, { useState, useEffect } from 'react';
import { ShieldCheck, Cookie, Settings, Check, X } from 'lucide-react';

interface CookieBannerProps {
  onOpenLegal: (tab: 'privacy' | 'terms' | 'contact') => void;
}

export const CookieBanner: React.FC<CookieBannerProps> = ({ onOpenLegal }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState({
    essential: true, // always true
    analytics: true,
    telemetry: true,
  });

  useEffect(() => {
    try {
      const consent = localStorage.getItem('terragis_cookie_consent_v1');
      if (!consent) {
        // Show after small delay for organic feel
        const timer = setTimeout(() => setIsVisible(true), 1200);
        return () => clearTimeout(timer);
      }
    } catch {
      setIsVisible(true);
    }
  }, []);

  const handleAcceptAll = () => {
    try {
      localStorage.setItem('terragis_cookie_consent_v1', JSON.stringify({ essential: true, analytics: true, telemetry: true }));
    } catch {}
    setIsVisible(false);
  };

  const handleAcceptEssential = () => {
    try {
      localStorage.setItem('terragis_cookie_consent_v1', JSON.stringify({ essential: true, analytics: false, telemetry: false }));
    } catch {}
    setIsVisible(false);
  };

  const handleSavePreferences = () => {
    try {
      localStorage.setItem('terragis_cookie_consent_v1', JSON.stringify(preferences));
    } catch {}
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 p-3 sm:p-4 pointer-events-none">
      <div className="max-w-4xl mx-auto bg-slate-900/95 text-white backdrop-blur-md rounded-2xl p-4 sm:p-5 shadow-2xl border border-slate-700 pointer-events-auto animate-in slide-in-from-bottom-8 duration-300">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0 mt-0.5">
              <Cookie className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-white">
                  Land Records Privacy & Cookie Notice
                </h3>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-emerald-500 text-slate-950">
                  DPDP Act 2023
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                TerraGIS utilizes strict local state caching and GIS telemetry to securely synchronize your cadastral maps, offline inspections, and digital land certificates. We never monetize or transfer sovereign citizen land data to third parties.
              </p>
              <div className="flex items-center gap-3 mt-1.5 text-xs">
                <button
                  onClick={() => onOpenLegal('privacy')}
                  className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2 transition"
                >
                  Privacy Policy
                </button>
                <span className="text-slate-500">•</span>
                <button
                  onClick={() => onOpenLegal('terms')}
                  className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2 transition"
                >
                  Cadastral Terms
                </button>
                <span className="text-slate-500">•</span>
                <button
                  onClick={() => setShowPreferences(!showPreferences)}
                  className="text-slate-400 hover:text-white flex items-center gap-1 transition"
                >
                  <Settings className="w-3 h-3" />
                  <span>{showPreferences ? 'Hide Preferences' : 'Customize'}</span>
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:shrink-0 w-full sm:w-auto justify-end">
            <button
              onClick={handleAcceptEssential}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition"
            >
              Essential Only
            </button>
            <button
              onClick={handleAcceptAll}
              className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-md hover:shadow transition active:scale-95 flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Accept All</span>
            </button>
          </div>
        </div>

        {/* Customized Preferences Sub-panel */}
        {showPreferences && (
          <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60 cursor-not-allowed">
              <div>
                <span className="text-xs font-bold text-white block">Essential Storage</span>
                <span className="text-[10px] text-slate-400">Offline queue & token auth</span>
              </div>
              <input type="checkbox" checked disabled className="rounded accent-emerald-500" />
            </label>

            <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60 cursor-pointer hover:bg-slate-800">
              <div>
                <span className="text-xs font-bold text-white block">GIS Spatial Telemetry</span>
                <span className="text-[10px] text-slate-400">CORS RTK & GPS accuracy</span>
              </div>
              <input
                type="checkbox"
                checked={preferences.telemetry}
                onChange={(e) => setPreferences((p) => ({ ...p, telemetry: e.target.checked }))}
                className="rounded accent-emerald-500"
              />
            </label>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60">
              <div>
                <span className="text-xs font-bold text-white block">Cadastre Analytics</span>
                <span className="text-[10px] text-slate-400">Error reporting & speed</span>
              </div>
              <button
                onClick={handleSavePreferences}
                className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold"
              >
                Save
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
