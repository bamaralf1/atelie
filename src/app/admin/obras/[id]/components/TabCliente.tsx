'use client';

import { useState } from 'react';
import { Obra } from '@/lib/types';
import { montarLinkAcompanhamento } from '@/lib/utils';
import { atualizarClienteAction } from '../actions';

export function TabCliente({ obra }: { obra: Obra }) {
  const [copiado, setCopiado] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);
  const link = montarLinkAcompanhamento(obra.token_acesso);

  async function handleSubmit(formData: FormData) {
    setSalvando(true);
    setSalvo(false);
    const resultado = await atualizarClienteAction(obra.id, formData);
    setSalvando(false);
    if (!resultado?.erro) {
      setSalvo(true);
      setTimeout(() => setSalvo(false), 2500);
    }
  }

  async function copiarLink() {
    await navigator.clipboard.writeText(link);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  return (
    <div className="max-w-xl space-y-6">
      <form
        action={handleSubmit}
        className="bg-atelie-superficie border border-atelie-borda rounded-lg p-6 space-y-4"
      >
        <h3 className="font-display text-lg">Dados do cliente</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs uppercase tracking-wide text-atelie-textoMuted mb-2">Nome</label>
            <input
              name="cliente_nome"
              defaultValue={obra.cliente_nome}
              required
              className="w-full bg-atelie-fundo border border-atelie-borda rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-atelie-dourado/60"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wide text-atelie-textoMuted mb-2">E-mail</label>
            <input
              name="cliente_email"
              type="email"
              defaultValue={obra.cliente_email ?? ''}
              className="w-full bg-atelie-fundo border border-atelie-borda rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-atelie-dourado/60"
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={salvando}
            className="bg-atelie-dourado text-atelie-fundo rounded-md px-4 py-2 text-sm font-medium hover:bg-atelie-douradoClaro transition-colors disabled:opacity-50"
          >
            {salvando ? 'Salvando...' : 'Salvar'}
          </button>
          {salvo && <span className="text-emerald-400 text-sm">Salvo com sucesso.</span>}
        </div>
      </form>

      <div className="bg-atelie-superficie border border-atelie-borda rounded-lg p-6 space-y-4">
        <h3 className="font-display text-lg">Link de acompanhamento</h3>
        <div className="flex items-center gap-2">
          <input
            readOnly
            value={link}
            className="flex-1 bg-atelie-fundo border border-atelie-borda rounded-md px-3 py-2 text-sm font-mono text-atelie-douradoClaro"
          />
          <button
            onClick={copiarLink}
            className="bg-atelie-dourado text-atelie-fundo rounded-md px-4 py-2 text-sm font-medium hover:bg-atelie-douradoClaro transition-colors whitespace-nowrap"
          >
            {copiado ? 'Copiado!' : 'Copiar link'}
          </button>
        </div>
        <p className="text-xs text-atelie-textoMuted">
          Envie este link ao cliente por e-mail ou WhatsApp. Ele acessa sem precisar criar login.
        </p>
      </div>
    </div>
  );
}
