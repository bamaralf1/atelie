'use client';

import { useState } from 'react';
import { Obra } from '@/lib/types';
import { montarLinkAcompanhamento } from '@/lib/utils';

export function TabCliente({ obra }: { obra: Obra }) {
  const [copiado, setCopiado] = useState(false);
  const [enviadoEmail, setEnviadoEmail] = useState(false);
  const link = montarLinkAcompanhamento(obra.token_acesso);

  async function copiarLink() {
    await navigator.clipboard.writeText(link);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  function compartilharWhatsApp() {
    const texto = encodeURIComponent(
      `Olá! 🎨 Acompanhe o andamento da sua obra "${obra.titulo}" em tempo real:\n\n${link}`
    );
    window.open(`https://wa.me/?text=${texto}`, '_blank');
  }

  function compartilharEmail() {
    const assunto = encodeURIComponent(`Acompanhamento da obra: ${obra.titulo}`);
    const corpo = encodeURIComponent(
      `Olá ${obra.cliente_nome},\n\n` +
      `Você pode acompanhar o andamento da sua obra "${obra.titulo}" através deste link exclusivo:\n\n${link}\n\n` +
      `O link é pessoal e intransferível — guarde com carinho.`
    );
    window.open(`mailto:${obra.cliente_email ?? ''}?subject=${assunto}&body=${corpo}`, '_blank');
  }

  const linkCurto = link.length > 50 ? link.slice(0, 50) + '...' : link;

  return (
    <div className="max-w-xl space-y-6">
      {/* Card de informações do cliente */}
      <div className="bg-atelie-superficie border border-atelie-borda rounded-lg p-6 space-y-4">
        <div className="flex items-center gap-3 pb-4 border-b border-atelie-borda">
          <div className="w-12 h-12 rounded-full bg-atelie-dourado/20 flex items-center justify-center text-atelie-douradoClaro font-display text-lg">
            {obra.cliente_nome.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-display text-lg">{obra.cliente_nome}</p>
            <p className="text-sm text-atelie-textoMuted">{obra.cliente_email ?? 'E-mail não informado'}</p>
          </div>
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
              className="btn-dourado px-4 py-2 text-sm whitespace-nowrap"
            >
              {copiado ? (
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Copiado!
                </span>
              ) : 'Copiar link'}
            </button>
          </div>
        </div>

        {/* Ações de compartilhamento */}
        <div>
          <p className="text-xs uppercase tracking-wide text-atelie-textoMuted mb-3">Compartilhar com o cliente</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={compartilharWhatsApp}
              className="flex items-center gap-2 bg-emerald-700/30 border border-emerald-600/40 text-emerald-300 rounded-md px-4 py-2 text-sm font-medium hover:bg-emerald-700/50 transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              WhatsApp
            </button>
            <button
              onClick={compartilharEmail}
              disabled={!obra.cliente_email}
              className="flex items-center gap-2 bg-atelie-dourado/15 border border-atelie-dourado/30 text-atelie-douradoClaro rounded-md px-4 py-2 text-sm font-medium hover:bg-atelie-dourado/25 transition-colors disabled:opacity-50"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              E-mail
            </button>
            <button
              onClick={() => {
                const texto = `Acompanhe sua obra "${obra.titulo}": ${link}`;
                navigator.clipboard.writeText(texto);
                setEnviadoEmail(true);
                setTimeout(() => setEnviadoEmail(false), 2000);
              }}
              className="btn-outline px-4 py-2 text-sm"
            >
              {enviadoEmail ? 'Texto copiado!' : 'Copiar texto personalizado'}
            </button>
          </div>
        </div>

        <p className="text-xs text-atelie-textoMuted leading-relaxed">
          O cliente acessa o link diretamente, sem precisar criar login ou senha.
          Compartilhe por WhatsApp, e-mail ou qualquer outro meio.
        </p>
      </div>

      {/* Card de visualização do link */}
      <div className="bg-atelie-superficie border border-atelie-borda rounded-lg p-6">
        <p className="text-xs uppercase tracking-wide text-atelie-textoMuted mb-3">Pré-visualização do link do cliente</p>
        <div className="bg-atelie-fundo border border-atelie-borda rounded-lg p-4 text-center">
          <p className="font-display italic text-atelie-dourado text-sm mb-1">Atelier Bruno Amaral</p>
          <p className="text-atelie-texto font-display text-lg mb-1">{obra.titulo}</p>
          <p className="text-atelie-textoMuted text-xs mb-3">Acompanhamento exclusivo para {obra.cliente_nome}</p>
          <div className="w-full bg-atelie-superficie2 rounded-full h-1.5 mb-2">
            <div
              className="h-full rounded-full bg-gradient-to-r from-atelie-terracota to-atelie-dourado"
              style={{ width: `${obra.percentual_conclusao}%` }}
            />
          </div>
          <p className="text-atelie-textoMuted text-[10px]">{obra.percentual_conclusao}% concluído</p>
        </div>
      </div>
    </div>
  );
}
