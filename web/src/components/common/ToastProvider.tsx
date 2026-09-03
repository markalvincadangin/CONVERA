"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType, title?: string, duration?: number) => void;
  success: (message: string, title?: string, duration?: number) => void;
  error: (message: string, title?: string, duration?: number) => void;
  warning: (message: string, title?: string, duration?: number) => void;
  info: (message: string, title?: string, duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = "info", title?: string, duration: number = 4000) => {
      const id = "toast_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7);
      const newToast: ToastItem = { id, type, title, message, duration };
      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const success = useCallback((message: string, title?: string, duration?: number) => {
    showToast(message, "success", title, duration);
  }, [showToast]);

  const error = useCallback((message: string, title?: string, duration?: number) => {
    showToast(message, "error", title, duration);
  }, [showToast]);

  const warning = useCallback((message: string, title?: string, duration?: number) => {
    showToast(message, "warning", title, duration);
  }, [showToast]);

  const info = useCallback((message: string, title?: string, duration?: number) => {
    showToast(message, "info", title, duration);
  }, [showToast]);

  const getToastStyles = (type: ToastType) => {
    switch (type) {
      case "success":
        return {
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />,
          border: "border-emerald-500/40 bg-slate-950/95 shadow-emerald-500/10",
          titleColor: "text-emerald-300",
          bar: "bg-emerald-500",
        };
      case "error":
        return {
          icon: <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />,
          border: "border-rose-500/40 bg-slate-950/95 shadow-rose-500/10",
          titleColor: "text-rose-300",
          bar: "bg-rose-500",
        };
      case "warning":
        return {
          icon: <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />,
          border: "border-amber-500/40 bg-slate-950/95 shadow-amber-500/10",
          titleColor: "text-amber-300",
          bar: "bg-amber-500",
        };
      default:
        return {
          icon: <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />,
          border: "border-cyan-500/40 bg-slate-950/95 shadow-cyan-500/10",
          titleColor: "text-cyan-300",
          bar: "bg-cyan-500",
        };
    }
  };

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info, removeToast }}>
      {children}
      {/* Toast Notification Container */}
      <div
        aria-live="polite"
        className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0"
      >
        {toasts.map((toast) => {
          const styles = getToastStyles(toast.type);
          return (
            <div
              key={toast.id}
              className={`relative overflow-hidden pointer-events-auto flex items-start gap-3 p-3.5 rounded-2xl border shadow-2xl backdrop-blur-2xl transition-all duration-300 animate-in slide-in-from-bottom-3 fade-in ${styles.border}`}
            >
              {styles.icon}
              <div className="flex-1 min-w-0 pr-1">
                {toast.title && (
                  <h4 className={`text-xs font-bold tracking-tight mb-0.5 ${styles.titleColor}`}>
                    {toast.title}
                  </h4>
                )}
                <p className="text-xs text-slate-200 leading-relaxed font-sans">
                  {toast.message}
                </p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/80 transition-colors shrink-0"
                aria-label="Dismiss notification"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
