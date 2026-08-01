'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Obra, STATUS_OPCOES, ENTREGA_OPCOES } from '@/lib/types';
import {
  atualizarVisaoGeralAction,
  atualizarRotulosAction,
  atualizarReferenciaAction,
} from '../actions';

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
    <div className="max-w-2xl space-y-6">
      <form action={handleSubmit} className="space-y-5 bg-atelie-superficie border border-atelie-borda rounded-lg p-6">
        <div className="grid grid-cols-2 gap-4">
          <Campo label="Título da obra" name="titulo" defaultValue={obra.titulo} required />
          <Campo
            label="Orçamento total (R$)"
            name="orcamento_total"
            type="number"
            step="0.01"
            defaultValue={obra.orcamento_total}
          />
        </div>

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
          <label className="block text-xs uppercase tracking-wide text-atelie-textoMuted mb-2">
            Etapa de entrega
          </label>
          <select
            name="entrega_status"
            defaultValue={obra.entrega_status ?? ''}
            className="w-full bg-atelie-fundo border border-atelie-borda rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-atelie-dourado/60"
          >
            <option value="">No ateliê (não iniciada)</option>
            {ENTREGA_OPCOES.map((e) => (
              <option key={e} value={e}>{e}</option>
            ))}
          </select>
          <p className="text-xs text-atelie-textoMuted mt-1">
            Mostrado ao cliente como o segundo slider, após a pintura ser concluída.
          </p>
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

      <RotulosEditor obra={obra} />
      <ReferenciaEditor obra={obra} />
    </div>
  );
}

function Campo({
  label,
  name,
  type = 'text',
  defaultValue,
  step,
  required,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string | number;
  step?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-wide text-atelie-textoMuted mb-2">{label}</label>
      <input
        name={name}
        type={type}
        step={step}
        defaultValue={defaultValue}
        required={required}
        className="w-full bg-atelie-fundo border border-atelie-borda rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-atelie-dourado/60"
      />
    </div>
  );
}

function RotulosEditor({ obra }: { obra: Obra }) {
  const [rotulos, setRotulos] = useState<string[]>(obra.rotulos ?? []);
  const [novo, setNovo] = useState('');
  const [salvando, setSalvando] = useState(false);

  async function salvar(lista: string[]) {
    setSalvando(true);
    await atualizarRotulosAction(obra.id, lista);
    setSalvando(false);
  }

  function adicionar() {
    const valor = novo.trim();
    if (!valor || rotulos.includes(valor)) return;
    const lista = [...rotulos, valor];
    setRotulos(lista);
    setNovo('');
    salvar(lista);
  }

  function remover(rotulo: string) {
    const lista = rotulos.filter((r) => r !== rotulo);
    setRotulos(lista);
    salvar(lista);
  }

  return (
    <div className="bg-atelie-superficie border border-atelie-borda rounded-lg p-6 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg">Rótulos internos</h3>
        <span className="text-xs text-atelie-textoMuted">Ex: pagamento atrasado, prioridade</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {rotulos.length === 0 && <p className="text-atelie-textoMuted text-sm">Nenhum rótulo adicionado.</p>}
        {rotulos.map((r) => (
          <span
            key={r}
            className="inline-flex items-center gap-1.5 bg-atelie-dourado/15 border border-atelie-dourado/40 text-atelie-douradoClaro text-xs px-2.5 py-1 rounded-full"
          >
            {r}
            <button
              onClick={() => remover(r)}
              className="hover:text-atelie-terracotaClaro transition-colors"
              aria-label={`Remover rótulo ${r}`}
            >
              ✕
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={novo}
          onChange={(e) => setNovo(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              adicionar();
            }
          }}
          placeholder="Adicionar rótulo..."
          className="flex-1 bg-atelie-fundo border border-atelie-borda rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-atelie-dourado/60"
        />
        <button
          onClick={adicionar}
          disabled={!novo.trim() || salvando}
          className="bg-atelie-dourado text-atelie-fundo rounded-md px-4 py-2 text-sm font-medium hover:bg-atelie-douradoClaro transition-colors disabled:opacity-50"
        >
          Adicionar
        </button>
      </div>
    </div>
  );
}

function ReferenciaEditor({ obra }: { obra: Obra }) {
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setEnviando(true);
    setErro(null);
    const resultado = await atualizarReferenciaAction(obra.id, formData);
    if (resultado?.erro) setErro(resultado.erro);
    setEnviando(false);
  }

  return (
    <div className="bg-atelie-superficie border border-atelie-borda rounded-lg p-6 space-y-3">
      <h3 className="font-display text-lg">Imagem de referência</h3>
      {obra.imagem_referencia_url && (
        <div className="relative w-44 aspect-[4/3] rounded-md overflow-hidden border border-atelie-borda">
          <Image src={obra.imagem_referencia_url} alt="Referência" fill className="object-cover" />
        </div>
      )}
      <form action={handleSubmit} className="space-y-3">
        <input
          type="file"
          name="imagem_referencia"
          accept="image/*"
          required
          className="w-full text-sm text-atelie-textoMuted file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-atelie-dourado/20 file:text-atelie-douradoClaro file:cursor-pointer"
        />
        {erro && <p className="text-atelie-terracotaClaro text-sm">{erro}</p>}
        <button
          type="submit"
          disabled={enviando}
          className="bg-atelie-dourado text-atelie-fundo rounded-md px-4 py-2 text-sm font-medium hover:bg-atelie-douradoClaro transition-colors disabled:opacity-50"
        >
          {enviando ? 'Enviando...' : 'Substituir referência'}
        </button>
      </form>
    </div>
  );
}
