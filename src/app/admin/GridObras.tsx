'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { Obra } from '@/lib/types';
import { ObraCard } from '@/components/admin/ObraCard';

const STATUS_OPCOES = [
  'Esboço',
  'Imprimatura',
  'Pintura em andamento',
  'Retoques finais',
  'Verniz final',
  'Concluída',
];

export function GridObras({ obras }: { obras: Obra[] }) {
  const [termo, setTermo] = useState('');
  const [statusFiltro, setStatusFiltro] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const filtradas = useMemo(() => {
    return obras.filter((obra) => {
      const matchTermo = !termo || obra.titulo.toLowerCase().includes(termo.toLowerCase()) ||
        obra.cliente_nome.toLowerCase().includes(termo.toLowerCase());
      const matchStatus = !statusFiltro || obra.status_atual === statusFiltro;
      return matchTermo && matchStatus;
    });
  }, [obras, termo, statusFiltro]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-6 animate-fadeInUp">
        <div className="relative flex-1 group">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-atelie-textoMuted/40 group-focus-within:text-atelie-dourado/60 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={termo}
            onChange={(e) => setTermo(e.target.value)}
            placeholder="Buscar obras... (⌘K)"
            className="input-premium pl-9"
          />
          {termo && (
            <button
              onClick={() => setTermo('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-atelie-textoMuted hover:text-atelie-texto transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        <select
          value={statusFiltro}
          onChange={(e) => setStatusFiltro(e.target.value)}
          className="input-premium w-full sm:w-44"
        >
          <option value="">Todos os status</option>
          {STATUS_OPCOES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        {filtradas.length < obras.length && (
          <span className="text-xs text-atelie-textoMuted/60 flex items-center shrink-0 bg-white/[0.03] px-3 py-2 rounded-lg border border-white/5">
            {filtradas.length} de {obras.length}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtradas.map((obra) => (
          <ObraCard key={obra.id} obra={obra} />
        ))}
        {filtradas.length === 0 && (
          <div className="col-span-full card-glass py-16 text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-white/[0.03] border border-white/5 flex items-center justify-center">
              <svg className="w-5 h-5 text-atelie-textoMuted/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="text-atelie-textoMuted mb-3">Nenhuma obra encontrada com esse filtro.</p>
            <button
              onClick={() => { setTermo(''); setStatusFiltro(''); }}
              className="btn-outline px-4 py-2 text-sm"
            >
              Limpar filtros
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
