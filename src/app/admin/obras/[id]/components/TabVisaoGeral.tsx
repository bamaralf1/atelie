'use client';

import { useState, useEffect, useRef } from 'react';
import { Obra, STATUS_OPCOES, StatusObra } from '@/lib/types';
import { atualizarVisaoGeralAction } from '../actions';

export function TabVisaoGeral({ obra }: { obra: Obra }) {
  const [percentual, setPercentual] = useState(obra.percentual_conclusao);
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);
  const [statusAtual, setStatusAtual] = useState(obra.status_atual);
  const [confirmarStatus, setConfirmarStatus] = useState<StatusObra | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!confirmarStatus) return;
    function handler(e: KeyboardEvent) {
      if (e.key === 'Escape') setConfirmarStatus(null);
    }
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [confirmarStatus]);

  const statusModificado = statusAtual !== obra.status_atual;

  useEffect(() => {
    if (!salvo) return;
    const t = setTimeout(() => setSalvo(false), 2000);
    return () => clearTimeout(t);
  }, [salvo]);

  async function handleSubmit(formData: FormData) {
    const statusFinal = confirmarStatus ?? statusAtual;
    if (confirmarStatus) {
      formData.set('status_atual', confirmarStatus!);
      setConfirmarStatus(null);
    }
    setSalvando(true);
    setSalvo(false);
    formData.set('percentual_conclusao', String(percentual));
    await atualizarVisaoGeralAction(obra.id, formData);
    setStatusAtual(statusFinal);
    setSalvando(false);
    setSalvo(true);
  }

  function handleStatusChange(novo: StatusObra) {
    if (obra.status_atual !== novo) {
      setConfirmarStatus(novo);
    } else {
      setStatusAtual(novo);
    }
  }

  const imagemRef = obra.imagem_referencia_url || obra.imagem_obra_atual_url;

  return (
    <div className="max-w-2xl space-y-6">
      {/* Imagem de referência com preview */}
      {imagemRef && (
        <div className="bg-atelie-superficie border border-atelie-borda rounded-lg p-4">
          <p className="text-xs uppercase tracking-wide text-atelie-textoMuted mb-2">
            {obra.imagem_referencia_url && !obra.imagem_obra_atual_url ? 'Imagem de referência' : 'Imagem atual da obra'}
          </p>
          <div className="relative w-full aspect-video rounded-md overflow-hidden border border-atelie-borda">
            <img
              src={imagemRef}
              alt={obra.titulo}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}

      <form
        ref={formRef}
        action={handleSubmit}
        className="bg-atelie-superficie border border-atelie-borda rounded-lg p-6 space-y-5"
      >
        <div>
          <label className="block text-xs uppercase tracking-wide text-atelie-textoMuted mb-2">Status atual</label>
          <div className="flex flex-wrap gap-2">
            {STATUS_OPCOES.map((s) => {
              const ativo = statusAtual === s;
              const cores: Record<string, string> = {
                'Esboço': ativo ? 'bg-zinc-500/30 border-zinc-400 text-zinc-200' : 'bg-zinc-500/10 border-zinc-500/30 text-zinc-400',
                'Imprimatura': ativo ? 'bg-atelie-terracota/30 border-atelie-terracota text-atelie-terracotaClaro' : 'bg-atelie-terracota/10 border-atelie-terracota/30 text-atelie-terracota/70',
                'Pintura em andamento': ativo ? 'bg-atelie-dourado/30 border-atelie-dourado text-atelie-douradoClaro' : 'bg-atelie-dourado/10 border-atelie-dourado/30 text-atelie-dourado/70',
                'Retoques finais': ativo ? 'bg-atelie-dourado/30 border-atelie-dourado text-atelie-douradoClaro' : 'bg-atelie-dourado/10 border-atelie-dourado/30 text-atelie-dourado/70',
                'Verniz final': ativo ? 'bg-atelie-terracota/30 border-atelie-terracota text-atelie-terracotaClaro' : 'bg-atelie-terracota/10 border-atelie-terracota/30 text-atelie-terracota/70',
                'Concluída': ativo ? 'bg-emerald-900/40 border-emerald-500 text-emerald-300' : 'bg-emerald-900/10 border-emerald-700/30 text-emerald-700',
              };
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleStatusChange(s)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-all duration-200 ${cores[s] ?? ''}`}
                >
                  {s}
                </button>
              );
            })}
          </div>
          <input type="hidden" name="status_atual" value={statusAtual} />
          <p className="text-xs text-atelie-textoMuted mt-2">
            Cada alteração gera automaticamente um registro na linha do tempo do cliente.
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
          <div className="flex justify-between text-[10px] text-atelie-textoMuted mt-0.5">
            <span>0%</span>
            <span>25%</span>
            <span>50%</span>
            <span>75%</span>
            <span>100%</span>
          </div>
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wide text-atelie-textoMuted mb-2">Estimativa de conclusão</label>
          <input
            type="date"
            name="estimativa_conclusao"
            defaultValue={obra.estimativa_conclusao ?? ''}
            className="input-atelie"
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wide text-atelie-textoMuted mb-2">Descrição da obra</label>
          <textarea
            name="descricao"
            rows={3}
            defaultValue={obra.descricao ?? ''}
            className="input-atelie resize-none"
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
            className="input-atelie resize-none"
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-atelie-textoMuted cursor-pointer hover:text-atelie-texto transition-colors">
          <input type="checkbox" name="exibir_custos" defaultChecked={obra.exibir_custos} className="accent-atelie-dourado w-4 h-4" />
          Exibir materiais e custos para o cliente
        </label>

        <div className="flex items-center gap-3 pt-2 border-t border-atelie-borda">
          <button
            type="submit"
            disabled={salvando}
            className="btn-dourado px-5 py-2.5"
          >
            {salvando ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Salvando...
              </span>
            ) : 'Salvar alterações'}
          </button>
          {salvo && (
            <span className="flex items-center gap-1 text-emerald-400 text-sm animate-fadeIn">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Salvo com sucesso.
            </span>
          )}
          {statusModificado && (
            <span className="text-atelie-douradoClaro text-xs animate-fadeIn">
              Status alterado para <strong>{statusAtual}</strong>
            </span>
          )}
        </div>
      </form>

      {/* Modal de confirmação de status */}
      {confirmarStatus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn" onClick={() => setConfirmarStatus(null)}>
          <div className="bg-atelie-superficie border border-atelie-borda rounded-lg p-6 max-w-sm mx-4 shadow-dourado-lg animate-scaleIn" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-display text-lg">Alterar status</h3>
              <button onClick={() => setConfirmarStatus(null)} className="text-atelie-textoMuted hover:text-atelie-texto transition-colors" aria-label="Fechar">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-sm text-atelie-textoMuted mb-4">
              Mudar de <strong>{obra.status_atual}</strong> para <strong>{confirmarStatus}</strong>?
              <br />Isso será registrado na linha do tempo do cliente.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmarStatus(null)}
                className="btn-outline px-4 py-2 text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  setStatusAtual(confirmarStatus);
                  setConfirmarStatus(null);
                  formRef.current?.requestSubmit();
                }}
                className="btn-dourado px-4 py-2 text-sm"
              >
                Confirmar mudança
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
