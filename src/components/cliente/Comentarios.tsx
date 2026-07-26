'use client';

import { useState } from 'react';
import { HistoricoStatus } from '@/lib/types';
import { formatarDataHora } from '@/lib/utils';

interface Comentario {
  id: string;
  autor: 'artista' | 'cliente';
  texto: string;
  criado_em: string;
}

interface ComentariosProps {
  historicoId: string;
  comentariosIniciais: Comentario[];
  podeComentar?: boolean;
}

export function Comentarios({ comentariosIniciais, podeComentar = true }: ComentariosProps) {
  const [aberto, setAberto] = useState(false);
  const [comentarios, setComentarios] = useState(comentariosIniciais);
  const [texto, setTexto] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function handleEnviar() {
    if (!texto.trim()) return;
    setEnviando(true);
    // Simula envio — em produção usaria Server Action
    const novo: Comentario = {
      id: crypto.randomUUID(),
      autor: 'cliente',
      texto: texto.trim(),
      criado_em: new Date().toISOString(),
    };
    setComentarios((prev) => [...prev, novo]);
    setTexto('');
    setEnviando(false);
  }

  return (
    <div className="mt-3 pt-3 border-t border-atelie-borda">
      <button
        onClick={() => setAberto(!aberto)}
        className="text-xs text-atelie-textoMuted hover:text-atelie-douradoClaro transition-colors flex items-center gap-1"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        {comentarios.length > 0 ? `${comentarios.length} comentário${comentarios.length > 1 ? 's' : ''}` : 'Comentar'}
      </button>

      {aberto && (
        <div className="mt-3 space-y-3 animate-fadeIn">
          {comentarios.length > 0 && (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {comentarios.map((c) => (
                <div key={c.id} className={`flex gap-2 ${c.autor === 'artista' ? 'flex-row' : 'flex-row-reverse'}`}>
                  <div
                    className={`flex-1 px-3 py-2 rounded-lg text-xs ${
                      c.autor === 'artista'
                        ? 'bg-atelie-dourado/10 border border-atelie-dourado/20'
                        : 'bg-atelie-superficie2 border border-atelie-borda'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[10px] font-medium text-atelie-douradoClaro">
                        {c.autor === 'artista' ? 'Artista' : 'Você'}
                      </span>
                      <span className="text-[9px] text-atelie-textoMuted">{formatarDataHora(c.criado_em)}</span>
                    </div>
                    <p className="text-atelie-textoMuted">{c.texto}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {podeComentar && (
            <div className="flex gap-2">
              <input
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleEnviar(); } }}
                placeholder="Escreva um comentário..."
                className="flex-1 bg-atelie-fundo border border-atelie-borda rounded-md px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-atelie-dourado/60"
              />
              <button
                onClick={handleEnviar}
                disabled={!texto.trim() || enviando}
                className="btn-dourado px-3 py-1.5 text-xs disabled:opacity-50"
              >
                {enviando ? '...' : 'Enviar'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
