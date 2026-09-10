import React from 'react';
import { Compass, ArrowLeft, Home, Search, ShieldCheck } from 'lucide-react';

interface NotFoundViewProps {
  onResetToMap: () => void;
  onOpenCommandPalette: () => void;
}

export const NotFoundView: React.FC<NotFoundViewProps> = ({
  onResetToMap,
  onOpenCommandPalette,
}) => {
  return (
    <div className="flex-1 flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white min-h-[60vh]">
      <div className="max-w-md w-full text-center space-y-5 bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400">
          <Compass className="w-8 h-8 animate-pulse" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
            Cadastral Error 404
          </span>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Spatial Record Not Found
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            The requested Khasra parcel polygon, survey layer, or georeferenced boundary does not exist in the active revenue registry or has been partitioned.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onResetToMap}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition active:scale-95 flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>Return to Cadastre Map</span>
          </button>
          <button
            onClick={onOpenCommandPalette}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs border border-slate-200 dark:border-slate-700 transition flex items-center justify-center gap-2"
          >
            <Search className="w-4 h-4" />
            <span>Search Khasra (⌘K)</span>
          </button>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Sovereign Spatial Registry • Survey of India Verified</span>
        </div>
      </div>
    </div>
  );
};
