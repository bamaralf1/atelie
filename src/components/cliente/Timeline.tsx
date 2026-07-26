import { HistoricoStatus } from '@/lib/types';
import { formatarDataHora } from '@/lib/utils';

export function Timeline({ historico }: { historico: HistoricoStatus[] }) {
  if (historico.length === 0) {
    return <p className="text-atelie-textoMuted text-sm">O histórico aparecerá aqui assim que o artista iniciar o registro.</p>;
  }

  return (
    <ol className="relative border-l border-atelie-borda ml-2">
      {historico.map((item, index) => {
        const ultimo = index === historico.length - 1;
        return (
          <li key={item.id} className="mb-8 ml-6 last:mb-0">
            <span
              className={`absolute -left-[9px] flex items-center justify-center w-4 h-4 rounded-full border-2 ${
                ultimo
                  ? 'bg-atelie-dourado border-atelie-dourado'
                  : 'bg-atelie-fundo border-atelie-borda'
              }`}
            />
            <h4 className={`font-display text-lg ${ultimo ? 'text-atelie-douradoClaro' : 'text-atelie-texto'}`}>
              {item.status_novo}
            </h4>
            <time className="block text-xs text-atelie-textoMuted mb-1">{formatarDataHora(item.data_mudanca)}</time>
            {item.observacao && <p className="text-sm text-atelie-textoMuted">{item.observacao}</p>}
          </li>
        );
      })}
    </ol>
  );
}
