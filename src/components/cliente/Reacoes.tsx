'use client';

import { useState } from 'react';

const EMOJIS = [
  { emoji: '❤️', label: 'Amei' },
  { emoji: '🔥', label: 'Incrível' },
  { emoji: '👏', label: 'Aplausos' },
  { emoji: '🎨', label: 'Arte' },
  { emoji: '✨', label: 'Lindou' },
];

export function Reacoes({ storageKey }: { storageKey: string }) {
  const [reacoes, setReacoes] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem(`reacoes_${storageKey}`);
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });

  const [ativa, setAtiva] = useState<string | null>(() => {
    try { return localStorage.getItem(`reacao_ativa_${storageKey}`); } catch { return null; }
  });

  function toggleReacao(emoji: string) {
    const novaAtiva = ativa === emoji ? null : emoji;
    setAtiva(novaAtiva);

    setReacoes((prev) => {
      const next = { ...prev };
      if (ativa === emoji) {
        next[emoji] = Math.max(0, (next[emoji] || 0) - 1);
      } else {
        if (ativa) next[ativa] = Math.max(0, (next[ativa] || 0) - 1);
        next[emoji] = (next[emoji] || 0) + 1;
      }
      try {
        localStorage.setItem(`reacoes_${storageKey}`, JSON.stringify(next));
        localStorage.setItem(`reacao_ativa_${storageKey}`, novaAtiva ?? '');
      } catch {}
      return next;
    });
  }

  return (
    <div className="flex gap-1.5 mt-3 pt-3 border-t border-atelie-borda">
      {EMOJIS.map(({ emoji, label }) => {
        const count = reacoes[emoji] || 0;
        const isActive = ativa === emoji;
        return (
          <button
            key={emoji}
            onClick={() => toggleReacao(emoji)}
            title={label}
            className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs border transition-all duration-200 ${
              isActive
                ? 'bg-atelie-dourado/20 border-atelie-dourado/40 text-atelie-douradoClaro'
                : 'bg-atelie-superficie2 border-atelie-borda text-atelie-textoMuted hover:border-atelie-borda/50'
            }`}
          >
            <span className="text-sm">{emoji}</span>
            {count > 0 && <span className="font-mono text-[10px]">{count}</span>}
          </button>
        );
      })}
    </div>
  );
}
