'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function EmptyState() {
  const router = useRouter();
  const [semeando, setSemeando] = useState(false);
  const [erro, setErro] = useState('');

  async function semear() {
    setSemeando(true);
    setErro('');
    try {
      const res = await fetch('/api/semear');
      const json = await res.json();
      if (!res.ok) {
        setErro(json.erro || 'Erro ao criar obra exemplo');
        return;
      }
      router.refresh();
    } catch {
      setErro('Erro de conexão com o servidor');
    } finally {
      setSemeando(false);
    }
  }

  return (
    <div className="border border-dashed border-atelie-borda rounded-xl py-20 text-center">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-atelie-dourado/10 flex items-center justify-center">
        <svg className="w-8 h-8 text-atelie-dourado/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
      <p className="font-display text-xl text-atelie-texto mb-1">Nenhuma obra cadastrada</p>
      <p className="text-atelie-textoMuted text-sm mb-6">
        {erro ? <span className="text-atelie-terracotaClaro">{erro}</span> : 'Crie uma obra ou gere um exemplo automaticamente.'}
      </p>
      <div className="flex items-center justify-center gap-3 flex-wrap">
        <a href="/admin/nova-obra" className="btn-dourado px-6 py-2.5 inline-flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Cadastrar obra
        </a>
        <button
          onClick={semear}
          disabled={semeando}
          className="btn-outline px-6 py-2.5 inline-flex items-center gap-2 text-sm disabled:opacity-50"
        >
          {semeando ? 'Criando…' : 'Gerar obra exemplo'}
        </button>
      </div>
    </div>
  );
}
