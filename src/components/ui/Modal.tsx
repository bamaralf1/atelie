'use client';

import { useEffect, useCallback, ReactNode } from 'react';

export function Modal({
  aberto,
  onFechar,
  titulo,
  children,
  largura = 'max-w-md',
}: {
  aberto: boolean;
  onFechar: () => void;
  titulo?: string;
  children: ReactNode;
  largura?: string;
}) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => { if (e.key === 'Escape') onFechar(); },
    [onFechar]
  );

  useEffect(() => {
    if (aberto) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [aberto, handleKeyDown]);

  if (!aberto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fadeIn" onClick={onFechar}>
      <div
        className={`bg-atelie-superficie border border-atelie-borda rounded-xl shadow-2xl shadow-black/50 w-full ${largura} mx-4 animate-scaleIn`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`flex items-center justify-between px-6 ${titulo ? 'py-4 border-b border-atelie-borda' : 'py-2'}`}>
          {titulo && <h3 className="font-display text-lg">{titulo}</h3>}
          {!titulo && <div />}
          <button onClick={onFechar} className="btn-ghost p-1.5" aria-label="Fechar">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
