'use client';

import { useState } from 'react';
import { formatarDataHora } from '@/lib/utils';
import { enviarComentarioAction } from '@/app/acompanhar/[token]/acoes';
import { Comentario } from '@/lib/types';

interface ComentariosProps {
  token: string;
  obraId: string;
  comentariosIniciais: Comentario[];
}

export function Comentarios({ token, obraId, comentariosIniciais }: ComentariosProps) {
  const [aberto, setAberto] = useState(false);
  const [comentarios, setComentarios] = useState(comentariosIniciais);
  const [texto, setTexto] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function handleEnviar() {
    if (!texto.trim()) return;
    setEnviando(true);
    const resultado = await enviarComentarioAction(token, obraId, texto.trim());
    if (!resultado.erro) {
      const novo: Comentario = {
        id: crypto.randomUUID(),
        obra_id: obraId,
        autor: 'cliente',
        texto: texto.trim(),
        criado_em: new Date().toISOString(),
      };
      setComentarios((prev) => [...prev, novo]);
      setTexto('');
    }
    setEnviando(false);
  }

  return (
    <div className="border-t border-atelie-borda pt-4">
      <button
        onClick={() => setAberto(!aberto)}
        className="text-sm text-atelie-textoMuted hover:text-atelie-douradoClaro transition-colors flex items-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        {comentarios.length > 0 ? `${comentarios.length} comentário${comentarios.length > 1 ? 's' : ''}` : 'Comentar'}
      </button>

      {aberto && (
        <div className="mt-4 space-y-4 animate-fadeIn">
          {comentarios.length > 0 && (
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {comentarios.map((c) => (
                <div key={c.id} className={`flex gap-3 ${c.autor === 'artista' ? '' : 'flex-row-reverse'}`}>
                  <div className={`flex-1 px-4 py-3 rounded-xl text-sm ${
                    c.autor === 'artista'
                      ? 'bg-atelie-dourado/10 border border-atelie-dourado/20 ml-8'
                      : 'bg-atelie-superficie2 border border-atelie-borda mr-8'
                  }`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-atelie-douradoClaro">
                        {c.autor === 'artista' ? 'Artista' : 'Você'}
                      </span>
                      <span className="text-[10px] text-atelie-textoMuted">{formatarDataHora(c.criado_em)}</span>
                    </div>
                    <p className="text-atelie-textoMuted">{c.texto}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <input
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleEnviar(); } }}
              placeholder="Escreva um comentário..."
              className="flex-1 bg-atelie-fundo border border-atelie-borda rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-atelie-dourado/60"
            />
            <button
              onClick={handleEnviar}
              disabled={!texto.trim() || enviando}
              className="btn-dourado px-4 py-2.5 text-sm disabled:opacity-50"
            >
              {enviando ? '...' : 'Enviar'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
