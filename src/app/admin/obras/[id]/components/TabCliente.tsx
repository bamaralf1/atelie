'use client';

import { useState } from 'react';
import { Obra } from '@/lib/types';
import { montarLinkAcompanhamento } from '@/lib/utils';

export function TabCliente({ obra }: { obra: Obra }) {
  const [copiado, setCopiado] = useState(false);
  const link = montarLinkAcompanhamento(obra.token_acesso);

  async function copiarLink() {
    await navigator.clipboard.writeText(link);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  return (
    <div className="max-w-xl bg-atelie-superficie border border-atelie-borda rounded-lg p-6 space-y-5">
      <div>
        <p className="text-xs uppercase tracking-wide text-atelie-textoMuted mb-1">Cliente</p>
        <p className="text-lg">{obra.cliente_nome}</p>
      </div>
      <div>
        <p className="text-xs uppercase tracking-wide text-atelie-textoMuted mb-1">E-mail</p>
        <p className="text-lg">{obra.cliente_email ?? 'Não informado'}</p>
      </div>

      <div>
        <p className="text-xs uppercase tracking-wide text-atelie-textoMuted mb-2">Link exclusivo de acompanhamento</p>
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
        <p className="text-xs text-atelie-textoMuted mt-2">
          Envie este link ao cliente por e-mail ou WhatsApp. Ele acessa sem precisar criar login.
        </p>
      </div>
    </div>
  );
}
