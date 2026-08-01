import { Fragment } from 'react';
import { EntregaStatus, ENTREGA_OPCOES } from '@/lib/types';
import { indiceDaEntrega } from '@/lib/utils';

/**
 * Segundo slider de progresso mostrado ao cliente: acompanha as etapas de
 * entrega da obra (Secagem → Embalada → Enviada), independente do percentual
 * de pintura. NULL = obra ainda no ateliê.
 */
export function ProgressoEntrega({ status }: { status: EntregaStatus | null }) {
  const indiceAtual = indiceDaEntrega(status);

  return (
    <div>
      <div className="flex items-start">
        {ENTREGA_OPCOES.map((etapa, i) => {
          const concluido = indiceAtual >= i;
          const ativo = i === indiceAtual;
          return (
            <Fragment key={etapa}>
              {i > 0 && (
                <div
                  className={`flex-1 mt-2 h-0.5 ${
                    indiceAtual >= i ? 'bg-emerald-500/70' : 'bg-atelie-borda'
                  }`}
                />
              )}
              <div className="flex flex-col items-center flex-1">
                <span
                  className={`flex items-center justify-center w-4 h-4 rounded-full border-2 transition-colors ${
                    concluido ? 'bg-emerald-500 border-emerald-500' : 'bg-atelie-fundo border-atelie-borda'
                  }`}
                >
                  {concluido && <span className="w-1.5 h-1.5 rounded-full bg-atelie-fundo" />}
                </span>
                <span
                  className={`text-xs mt-1.5 ${
                    ativo
                      ? 'text-emerald-300 font-medium'
                      : concluido
                        ? 'text-emerald-300/70'
                        : 'text-atelie-textoMuted'
                  }`}
                >
                  {etapa}
                </span>
              </div>
            </Fragment>
          );
        })}
      </div>
      <p className="text-xs text-atelie-textoMuted mt-3">
        {status === 'Enviada'
          ? 'Sua obra está a caminho!'
          : status === 'Embalada'
            ? 'Sua obra foi embalada com cuidado e será enviada em breve.'
            : status === 'Secagem'
              ? 'A obra está secando para receber o acabamento final.'
              : 'A obra ainda está no ateliê.'}
      </p>
    </div>
  );
}
