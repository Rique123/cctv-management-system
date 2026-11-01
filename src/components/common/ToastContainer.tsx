import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none px-4">
      {toasts.map(toast => {
        let icon = <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />;
        let borderColor = 'border-emerald-200 dark:border-emerald-900/60';
        let bgColor = 'bg-white dark:bg-slate-900';

        if (toast.type === 'error') {
          icon = <AlertCircle className="h-5 w-5 text-rose-500 shrink-0" />;
          borderColor = 'border-rose-200 dark:border-rose-900/60';
        } else if (toast.type === 'warning') {
          icon = <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />;
          borderColor = 'border-amber-200 dark:border-amber-900/60';
        } else if (toast.type === 'info') {
          icon = <Info className="h-5 w-5 text-blue-500 shrink-0" />;
          borderColor = 'border-blue-200 dark:border-blue-900/60';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 p-4 rounded-xl border shadow-lg transition-all animate-in slide-in-from-bottom-3 duration-200 ${bgColor} ${borderColor}`}
          >
            <div className="flex items-center gap-3">
              {icon}
              <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                {toast.message}
              </p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-md"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
