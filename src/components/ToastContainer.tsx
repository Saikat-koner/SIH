import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  Info,
  XCircle,
  Undo2,
  X,
} from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  onUndo?: () => void;
  undoLabel?: string;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const getIcon = () => {
          switch (toast.type) {
            case 'success':
              return <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />;
            case 'error':
              return <XCircle className="w-5 h-5 text-red-500 shrink-0" />;
            case 'warning':
              return <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />;
            case 'info':
            default:
              return <Info className="w-5 h-5 text-blue-500 shrink-0" />;
          }
        };

        const getBorderColor = () => {
          switch (toast.type) {
            case 'success':
              return 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/95 dark:bg-slate-900';
            case 'error':
              return 'border-red-200 dark:border-red-800 bg-red-50/95 dark:bg-slate-900';
            case 'warning':
              return 'border-amber-200 dark:border-amber-800 bg-amber-50/95 dark:bg-slate-900';
            case 'info':
            default:
              return 'border-blue-200 dark:border-blue-800 bg-blue-50/95 dark:bg-slate-900';
          }
        };

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl shadow-xl border backdrop-blur-sm transition-all transform animate-in slide-in-from-bottom-5 duration-200 ${getBorderColor()}`}
            role="alert"
          >
            {getIcon()}
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                {toast.title}
              </h4>
              {toast.message && (
                <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 leading-snug">
                  {toast.message}
                </p>
              )}
              {toast.onUndo && (
                <button
                  onClick={() => {
                    toast.onUndo?.();
                    onDismiss(toast.id);
                  }}
                  className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-[10px] font-bold text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 shadow-2xs transition active:scale-95"
                >
                  <Undo2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  <span>{toast.undoLabel || 'Undo Change'}</span>
                </button>
              )}
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded transition"
              title="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
