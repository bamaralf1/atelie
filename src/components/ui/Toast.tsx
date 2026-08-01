'use client';

import { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from 'react';

type TipoToast = 'sucesso' | 'erro' | 'info' | 'aviso';

interface Toast {
  id: string;
  mensagem: string;
  tipo: TipoToast;
  saindo?: boolean;
}

interface ToastCtx {
  adicionar: (mensagem: string, tipo?: TipoToast) => void;
}

const ToastContext = createContext<ToastCtx>({ adicionar: () => {} });

export function useToast() { return useContext(ToastContext); }

const ICONES: Record<TipoToast, ReactNode> = {
  sucesso: <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>,
  erro: <svg className="w-4 h-4 text-atelie-terracotaClaro" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>,
  info: <svg className="w-4 h-4 text-atelie-douradoClaro" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  aviso: <svg className="w-4 h-4 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
};

const CORES: Record<TipoToast, string> = {
  sucesso: 'border-emerald-500/30 bg-emerald-950/40',
  erro: 'border-atelie-terracota/30 bg-atelie-terracota/10',
  info: 'border-atelie-dourado/30 bg-atelie-dourado/10',
  aviso: 'border-yellow-600/30 bg-yellow-950/40',
};

function removerDepois(toasts: Toast[], id: string, setToasts: (t: Toast[]) => void) {
  setToasts(toasts.map((t) => t.id === id ? { ...t, saindo: true } : t));
  setTimeout(() => setToasts(toasts.filter((t) => t.id !== id)), 300);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const adicionar = useCallback((mensagem: string, tipo: TipoToast = 'info') => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, mensagem, tipo }]);
    setTimeout(() => {
      setToasts((prev) => {
        removerDepois(prev, id, setToasts);
        return prev;
      });
    }, 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ adicionar }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 max-w-sm pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-lg border backdrop-blur-md shadow-lg
              transition-all duration-300 ease-out
              ${toast.saindo ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0 animate-slideUp'}
              ${CORES[toast.tipo]}`}
          >
            <span className="mt-0.5 shrink-0">{ICONES[toast.tipo]}</span>
            <p className="text-sm text-atelie-texto flex-1">{toast.mensagem}</p>
            <button
              onClick={() => setToasts((prev) => { removerDepois(prev, toast.id, setToasts); return prev; })}
              className="text-atelie-textoMuted hover:text-atelie-texto shrink-0 transition-colors"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
