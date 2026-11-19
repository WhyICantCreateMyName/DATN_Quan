'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastOptions {
  title?: string;
  message: string;
  variant?: ToastType;
}

interface ToastItem {
  id: string;
  title?: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Singleton handler cho Toast.show(...) ngoài React Component (trong hook SWR / services)
let globalToastHandler: ((opts: ToastOptions) => void) | null = null;

export const Toast = {
  show: (options: ToastOptions) => {
    if (globalToastHandler) {
      globalToastHandler(options);
    } else {
      console.log(`[Toast] ${options.variant || 'info'}: ${options.title ? options.title + ' - ' : ''}${options.message}`);
    }
  }
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((opts: ToastOptions) => {
    const id = Math.random().toString(36).substring(2, 9);
    const item: ToastItem = {
      id,
      title: opts.title,
      message: opts.message,
      type: opts.variant || 'info'
    };
    setToasts((prev) => [...prev, item]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  useEffect(() => {
    globalToastHandler = addToast;
    return () => {
      globalToastHandler = null;
    };
  }, [addToast]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    addToast({ message, variant: type });
  }, [addToast]);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* Toast container - Warm Editorial / Clean Slate Style */}
      <div className="fixed top-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none max-w-sm w-full">
        {toasts.map((toast) => (
          <div 
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border bg-[#FFFFFF] shadow-lg transition-all animate-in slide-in-from-top-4 fade-in duration-200
              ${toast.type === 'success' ? 'border-[#15803D]/30 shadow-[#15803D]/5' : 
                toast.type === 'error' ? 'border-red-300 shadow-red-500/5' : 
                toast.type === 'warning' ? 'border-amber-300 shadow-amber-500/5' :
                'border-[#EA580C]/30 shadow-[#EA580C]/5'}
            `}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-[#15803D] shrink-0 mt-0.5" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />}
            {toast.type === 'warning' && <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-[#EA580C] shrink-0 mt-0.5" />}
            
            <div className="flex-1">
              {toast.title && (
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#18181B] mb-0.5">
                  {toast.title}
                </h4>
              )}
              <p className="text-xs font-medium text-[#6E6E77] leading-relaxed">
                {toast.message}
              </p>
            </div>
            
            <button 
              onClick={() => removeToast(toast.id)} 
              className="text-[#6E6E77] hover:text-[#18181B] transition-colors p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
