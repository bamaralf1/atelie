'use client';

import { useState } from 'react';
import { Obra, STATUS_OPCOES } from '@/lib/types';
import { atualizarVisaoGeralAction } from '../actions';

export function TabVisaoGeral({ obra }: { obra: Obra }) {
  const [percentual, setPercentual] = useState(obra.percentual_conclusao);
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);

  async function handleSubmit(formData: FormData) {
    setSalvando(true);
    setSalvo(false);
    formData.set('percentual_conclusao', String(percentual));
    await atualizarVisaoGeralAction(obra.id, formData);
    setSalvando(false);
    setSalvo(true);
    setTimeout(() => setSalvo(false), 2500);
  }

  return (
    <form action={handleSubmit} className="space-y-5 bg-atelie-superficie border border-atelie-borda rounded-lg p-6 max-w-2xl">
      <div>
        <label className="block text-xs uppercase tracking-wide text-atelie-textoMuted mb-2">Status atual</label>
        <select
          name="status_atual"
          defaultValue={obra.status_atual}
          className="w-full bg-atelie-fundo border border-atelie-borda rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-atelie-dourado/60"
        >
          {STATUS_OPCOES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <p className="text-xs text-atelie-textoMuted mt-1">
          Cada alteração aqui gera automaticamente um registro na linha do tempo do cliente.
        </p>
      </div>

      <div>
        <div className="flex justify-between mb-2">
          <label className="text-xs uppercase tracking-wide text-atelie-textoMuted">Percentual de conclusão</label>
          <span className="text-atelie-douradoClaro text-sm font-mono">{percentual}%</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={percentual}
          onChange={(e) => setPercentual(parseInt(e.target.value, 10))}
          className="w-full accent-atelie-dourado"
        />
      </div>

      <div>
        <label className="block text-xs uppercase tracking-wide text-atelie-textoMuted mb-2">Estimativa de conclusão</label>
        <input
          type="date"
          name="estimativa_conclusao"
          defaultValue={obra.estimativa_conclusao ?? ''}
          className="w-full bg-atelie-fundo border border-atelie-borda rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-atelie-dourado/60"
        />
      </div>

      <div>
        <label className="block text-xs uppercase tracking-wide text-atelie-textoMuted mb-2">Descrição da obra</label>
        <textarea
          name="descricao"
          rows={3}
          defaultValue={obra.descricao ?? ''}
          className="w-full bg-atelie-fundo border border-atelie-borda rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-atelie-dourado/60"
        />
      </div>

      <div>
        <label className="block text-xs uppercase tracking-wide text-atelie-textoMuted mb-2">
          Observações para o cliente
        </label>
        <textarea
          name="observacoes"
          rows={2}
          defaultValue={obra.observacoes ?? ''}
          placeholder="Texto livre exibido na página de acompanhamento"
          className="w-full bg-atelie-fundo border border-atelie-borda rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-atelie-dourado/60"
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-atelie-textoMuted">
        <input type="checkbox" name="exibir_custos" defaultChecked={obra.exibir_custos} className="accent-atelie-dourado" />
        Exibir materiais e custos para o cliente
      </label>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={salvando}
          className="bg-atelie-dourado text-atelie-fundo font-medium rounded-md px-5 py-2.5 hover:bg-atelie-douradoClaro transition-colors disabled:opacity-50"
        >
          {salvando ? 'Salvando...' : 'Salvar alterações'}
        </button>
        {salvo && <span className="text-emerald-400 text-sm">Salvo com sucesso.</span>}
      </div>
    </form>
  );
}
