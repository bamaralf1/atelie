'use client';

import { useState, useEffect } from 'react';
import { HistoricoStatus, FotoProgresso } from '@/lib/types';
import { formatarDataHora, corStatusDot } from '@/lib/utils';

function fotosProximas(fotos: FotoProgresso[], dataRef: string): FotoProgresso[] {
  const ref = new Date(dataRef).getTime();
  return fotos.filter((f) => {
    const diff = Math.abs(new Date(f.data_upload).getTime() - ref);
    return diff < 24 * 60 * 60 * 1000;
  });
}

function TimelineReacts({ storageKey }: { storageKey: string }) {
  const EMOJIS = ['❤️', '🔥', '👏', '🎨', '✨'];
  const [reacoes, setReacoes] = useState<Record<string, number>>({});
  const [ativa, setAtiva] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(`reacoes_${storageKey}`);
      if (saved) setReacoes(JSON.parse(saved));
      const at = localStorage.getItem(`reacao_ativa_${storageKey}`);
      if (at) setAtiva(at);
    } catch {}
  }, [storageKey]);

  function toggle(emoji: string) {
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
    <div className="flex gap-1.5">
      {EMOJIS.map((emoji) => {
        const count = reacoes[emoji] || 0;
        const isActive = ativa === emoji;
        return (
          <button
            key={emoji}
            onClick={() => toggle(emoji)}
            className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs border transition-all ${
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

export function Timeline({
  historico,
  fotos,
}: {
  historico: HistoricoStatus[];
  fotos: FotoProgresso[];
}) {
  if (historico.length === 0) {
    return (
      <div className="bg-atelie-superficie border border-atelie-borda rounded-xl p-8 text-center">
        <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-atelie-superficie2 flex items-center justify-center">
          <svg className="w-6 h-6 text-atelie-textoMuted/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-atelie-textoMuted text-sm">O histórico aparecerá aqui assim que o artista iniciar o registro.</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute left-[23px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-atelie-dourado via-atelie-dourado/40 to-transparent" />

      <ol className="relative space-y-6">
        {historico.map((item, index) => {
          const ultimo = index === historico.length - 1;
          const fotosDaData = fotosProximas(fotos, item.data_mudanca);
          const dotColor = corStatusDot(item.status_novo);

          return (
            <li key={item.id} className="relative pl-14">
              <span
                className={`absolute left-[17px] flex items-center justify-center w-[13px] h-[13px] rounded-full border-2 transition-all duration-500 ${
                  ultimo
                    ? `${dotColor} border-atelie-dourado shadow-[0_0_10px_rgba(198,161,91,0.3)]`
                    : 'bg-atelie-fundo border-atelie-borda'
                }`}
              >
                {ultimo && <span className="w-1.5 h-1.5 rounded-full bg-atelie-dourado animate-pulseDot" />}
              </span>

              <div
                className={`bg-atelie-superficie border rounded-xl p-5 transition-all duration-300 hover:border-atelie-dourado/30 ${
                  ultimo
                    ? 'border-atelie-dourado/40 shadow-[0_0_20px_rgba(198,161,91,0.06)] animate-fadeInUp'
                    : 'border-atelie-borda'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-sm font-medium ${ultimo ? 'text-atelie-douradoClaro' : 'text-atelie-texto'}`}>
                        {item.status_novo}
                      </span>
                      {ultimo && (
                        <span className="text-[10px] bg-atelie-dourado/15 text-atelie-douradoClaro px-1.5 py-0.5 rounded-full font-medium">
                          Atual
                        </span>
                      )}
                    </div>
                    <time className="text-xs text-atelie-textoMuted">
                      {formatarDataHora(item.data_mudanca)}
                    </time>
                  </div>

                  {item.status_anterior && (
                    <div className="flex items-center gap-1.5 text-[10px] text-atelie-textoMuted bg-atelie-superficie2 px-2 py-1 rounded-full shrink-0">
                      <span>{item.status_anterior}</span>
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                      <span className="text-atelie-douradoClaro">{item.status_novo}</span>
                    </div>
                  )}
                </div>

                {item.observacao && (
                  <p className="text-sm text-atelie-textoMuted leading-relaxed mt-2">{item.observacao}</p>
                )}

                {fotosDaData.length > 0 && (
                  <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                    {fotosDaData.slice(0, 3).map((foto) => (
                      <div key={foto.id} className="relative w-20 h-20 shrink-0 rounded-lg overflow-hidden border border-atelie-borda group">
                        <img src={foto.url_foto} alt={foto.legenda ?? ''} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                        {foto.legenda && (
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-1">
                            <p className="text-[8px] text-white truncate">{foto.legenda}</p>
                          </div>
                        )}
                      </div>
                    ))}
                    {fotosDaData.length > 3 && (
                      <div className="w-20 h-20 shrink-0 rounded-lg border border-atelie-borda bg-atelie-superficie2 flex items-center justify-center">
                        <span className="text-[10px] text-atelie-textoMuted">+{fotosDaData.length - 3}</span>
                      </div>
                    )}
                  </div>
                )}

                {ultimo && (
                  <div className="mt-3 pt-3 border-t border-atelie-borda">
                    <TimelineReacts storageKey={`timeline_${item.id}`} />
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
