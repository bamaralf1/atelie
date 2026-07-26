import Link from 'next/link';
import Image from 'next/image';
import { Obra } from '@/lib/types';
import { StatusBadge } from './StatusBadge';
import { ProgressBar } from './ProgressBar';
import { formatarData } from '@/lib/utils';

export function ObraCard({ obra }: { obra: Obra }) {
  return (
    <Link
      href={`/admin/obras/${obra.id}`}
      className="group block bg-atelie-superficie border border-atelie-borda rounded-lg overflow-hidden hover:border-atelie-dourado/50 transition-colors animate-fadeInUp"
    >
      <div className="relative h-40 bg-atelie-superficie2">
        {obra.imagem_obra_atual_url ? (
          <Image
            src={obra.imagem_obra_atual_url}
            alt={obra.titulo}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-atelie-textoMuted text-sm">
            Sem foto ainda
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-display text-lg text-atelie-texto truncate">{obra.titulo}</h3>
        <p className="text-sm text-atelie-textoMuted mb-3">{obra.cliente_nome}</p>

        <div className="mb-3">
          <StatusBadge status={obra.status_atual} />
        </div>

        <ProgressBar percentual={obra.percentual_conclusao} />
        <div className="flex justify-between items-center mt-2 text-xs text-atelie-textoMuted">
          <span>{obra.percentual_conclusao}% concluído</span>
          <span>Previsão: {formatarData(obra.estimativa_conclusao)}</span>
        </div>
      </div>
    </Link>
  );
}
