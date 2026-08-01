'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { Obra } from '@/lib/types';
import { ObraCard } from '@/components/admin/ObraCard';

const STATUS_OPCOES = [
  'Esboço',
  'Imprimatura',
  'Blocagem',
  'Pintura',
  'Detalhamento final',
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
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-atelie-textoMuted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={termo}
            onChange={(e) => setTermo(e.target.value)}
            placeholder="Buscar obras... (⌘K)"
            className="input-atelie pl-9"
          />
          {termo && (
            <button onClick={() => setTermo('')} className="btn-ghost absolute right-1.5 top-1/2 -translate-y-1/2 p-1">✕</button>
          )}
        </div>
        <select
          value={statusFiltro}
          onChange={(e) => setStatusFiltro(e.target.value)}
          className="input-atelie w-auto min-w-[160px]"
        >
          <option value="">Todos os status</option>
          {STATUS_OPCOES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        {filtradas.length < obras.length && (
          <span className="text-xs text-atelie-textoMuted flex items-center shrink-0">
            {filtradas.length} de {obras.length}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtradas.map((obra) => (
          <ObraCard key={obra.id} obra={obra} />
        ))}
        {filtradas.length === 0 && (
          <div className="col-span-full text-center py-12">
            <p className="text-atelie-textoMuted mb-2">Nenhuma obra encontrada com esse filtro.</p>
            <button onClick={() => { setTermo(''); setStatusFiltro(''); }} className="btn-outline px-4 py-2 text-sm">
              Limpar filtros
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
