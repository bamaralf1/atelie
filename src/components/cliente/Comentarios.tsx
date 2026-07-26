'use client';

import { useState, useRef, useEffect } from 'react';
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
  const inputRef = useRef<HTMLInputElement>(null);
  const listaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (aberto && listaRef.current) {
      listaRef.current.scrollTop = listaRef.current.scrollHeight;
    }
  }, [aberto, comentarios.length]);

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
      setTimeout(() => inputRef.current?.focus(), 100);
    }
    setEnviando(false);
  }

  return (
    <div>
      <button
        onClick={() => { setAberto(!aberto); if (!aberto) setTimeout(() => inputRef.current?.focus(), 200); }}
        className="group flex items-center gap-2.5 text-sm text-atelie-textoMuted hover:text-atelie-douradoClaro transition-colors"
      >
        <div className="w-8 h-8 rounded-xl bg-atelie-dourado/10 border border-atelie-dourado/20 flex items-center justify-center group-hover:bg-atelie-dourado/20 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <span>{comentarios.length > 0 ? `${comentarios.length} comentário${comentarios.length > 1 ? 's' : ''}` : 'Deixe seu comentário'}</span>
      </button>

      {aberto && (
        <div className="mt-5 space-y-5 animate-scaleSm">
          {comentarios.length > 0 && (
            <div ref={listaRef} className="space-y-3 max-h-56 overflow-y-auto pr-1 scrollbar-thin">
              {comentarios.map((c) => (
                <div key={c.id} className={`flex gap-3 ${c.autor === 'artista' ? '' : 'flex-row-reverse'}`}>
                  <div className={`flex-1 px-4 py-3 rounded-2xl text-sm ${
                    c.autor === 'artista'
                      ? 'bg-gradient-to-br from-atelie-dourado/[0.08] to-atelie-dourado/[0.02] border border-atelie-dourado/15 ml-8'
                      : 'bg-black/30 border border-atelie-borda/40 mr-8'
                  }`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-medium ${c.autor === 'artista' ? 'text-atelie-douradoClaro' : 'text-atelie-texto'}`}>
                        {c.autor === 'artista' ? 'Artista' : 'Você'}
                      </span>
                      <span className="text-[10px] text-atelie-textoMuted/50">{formatarDataHora(c.criado_em)}</span>
                    </div>
                    <p className="text-atelie-textoMuted leading-relaxed">{c.texto}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <input
              ref={inputRef}
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleEnviar(); } }}
              placeholder="Escreva um comentário..."
              className="flex-1 bg-black/40 border border-atelie-borda/60 rounded-xl px-4 py-3 text-sm text-atelie-texto placeholder:text-atelie-textoMuted/40 focus:outline-none focus:ring-2 focus:ring-atelie-dourado/40 focus:border-atelie-dourado/40 transition-all duration-200"
            />
            <button
              onClick={handleEnviar}
              disabled={!texto.trim() || enviando}
              className="btn-dourado px-5 py-3 text-sm disabled:opacity-40 shrink-0"
            >
              {enviando ? (
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-atelie-fundo border-t-transparent animate-spin" />
                  Enviando
                </span>
              ) : 'Enviar'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
