import { HistoricoStatus } from '@/lib/types';
import { formatarDataHora, corStatusDot } from '@/lib/utils';

export function Timeline({ historico }: { historico: HistoricoStatus[] }) {
  if (historico.length === 0) {
    return (
      <div className="bg-atelie-superficie border border-atelie-borda rounded-lg p-6 text-center">
        <svg className="w-8 h-8 mx-auto mb-2 text-atelie-textoMuted/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-atelie-textoMuted text-sm">O histórico aparecerá aqui assim que o artista iniciar o registro.</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Linha vertical */}
      <div className="absolute left-[19px] top-0 bottom-0 w-px bg-gradient-to-b from-atelie-dourado via-atelie-dourado/50 to-transparent" />

      <ol className="relative">
        {historico.map((item, index) => {
          const ultimo = index === historico.length - 1;
          const primeiro = index === 0;
          const dotColor = corStatusDot(item.status_novo);

          return (
            <li key={item.id} className={`relative pl-12 pb-8 last:pb-0 ${primeiro ? 'pt-0' : ''}`}>
              {/* Marcador do timeline */}
              <span
                className={`absolute left-[13px] flex items-center justify-center w-[13px] h-[13px] rounded-full border-2 transition-all duration-300 ${
                  ultimo
                    ? `${dotColor} border-atelie-dourado shadow-[0_0_6px_rgba(198,161,91,0.4)]`
                    : 'bg-atelie-fundo border-atelie-borda'
                }`}
              >
                {ultimo && (
                  <span className="w-1.5 h-1.5 rounded-full bg-atelie-dourado animate-pulseDot" />
                )}
              </span>

              {/* Card do evento */}
              <div
                className={`bg-atelie-superficie border border-atelie-borda rounded-lg p-4 transition-all duration-300 hover:border-atelie-dourado/30 ${
                  ultimo ? 'animate-fadeInUp' : ''
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${corStatusDot(item.status_novo) ? '' : ''}`}>
                    {item.status_novo}
                  </span>
                  {ultimo && (
                    <span className="text-[10px] text-atelie-douradoClaro font-medium">Atual</span>
                  )}
                </div>

                <time className="block text-xs text-atelie-textoMuted mb-1">
                  {formatarDataHora(item.data_mudanca)}
                </time>

                {item.status_anterior && (
                  <p className="text-xs text-atelie-textoMuted mb-2">
                    Progressão de <span className="text-atelie-texto">{item.status_anterior}</span>
                  </p>
                )}

                {item.observacao && (
                  <p className="text-sm text-atelie-textoMuted leading-relaxed border-t border-atelie-borda pt-2 mt-2">
                    {item.observacao}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
