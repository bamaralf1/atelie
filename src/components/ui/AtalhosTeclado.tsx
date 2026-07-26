'use client';

import { useEffect, useState } from 'react';

interface Atalho {
  tecla: string;
  descricao: string;
  acao: () => void;
}

export function useAtalhos(atalhos: Atalho[]) {
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      for (const atalho of atalhos) {
        const partes = atalho.tecla.toLowerCase().split('+');
        const meta = partes.includes('meta') || partes.includes('cmd');
        const ctrl = partes.includes('ctrl');
        const shift = partes.includes('shift');
        const tecla = partes[partes.length - 1];

        const metaPressed = e.metaKey || e.ctrlKey;
        const matchMeta = meta ? metaPressed : !metaPressed;
        const matchCtrl = ctrl ? e.ctrlKey : true;
        const matchShift = shift ? e.shiftKey : !e.shiftKey;

        if (matchMeta && matchCtrl && matchShift && e.key.toLowerCase() === tecla) {
          e.preventDefault();
          atalho.acao();
          return;
        }
      }
    }
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [atalhos]);
}

export function PaletaAtalhos() {
  const [aberta, setAberta] = useState(false);

  useAtalhos([
    { tecla: '?', descricao: 'Abrir atalhos', acao: () => setAberta(true) },
  ]);

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === 'Escape' && aberta) setAberta(false);
    }
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [aberta]);

  const atalhosGlobais = [
    { tecla: '⌘K', descricao: 'Buscar obras' },
    { tecla: '⌘N', descricao: 'Nova obra' },
    { tecla: '⌘S', descricao: 'Salvar (formulários)' },
    { tecla: '?', descricao: 'Abrir atalhos' },
  ];

  if (!aberta) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fadeIn" onClick={() => setAberta(false)}>
      <div className="bg-atelie-superficie border border-atelie-borda rounded-xl shadow-2xl w-full max-w-md mx-4 animate-scaleIn" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-atelie-borda">
          <h3 className="font-display text-lg">Atalhos do teclado</h3>
        </div>
        <div className="p-6 space-y-3">
          {atalhosGlobais.map((a) => (
            <div key={a.tecla} className="flex items-center justify-between">
              <span className="text-sm text-atelie-textoMuted">{a.descricao}</span>
              <kbd className="px-2 py-1 bg-atelie-fundo border border-atelie-borda rounded text-xs font-mono text-atelie-douradoClaro">
                {a.tecla}
              </kbd>
            </div>
          ))}
        </div>
        <div className="px-6 py-3 border-t border-atelie-borda text-center">
          <p className="text-[10px] text-atelie-textoMuted">Pressione <kbd className="px-1 py-0.5 bg-atelie-fundo border border-atelie-borda rounded text-[10px] font-mono">ESC</kbd> para fechar</p>
        </div>
      </div>
    </div>
  );
}
