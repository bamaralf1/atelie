import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Obra } from '@/lib/types';
import { StatusBadge } from './StatusBadge';
import { ProgressBar } from './ProgressBar';
import { formatarData, formatarDiasRestantes, formatarMoeda } from '@/lib/utils';

export function ObraCard({ obra }: { obra: Obra }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const diasInfo = formatarDiasRestantes(obra.estimativa_conclusao);
  const isConcluida = obra.status_atual === 'Concluída';

  const hasImg = !!obra.imagem_obra_atual_url || !!obra.imagem_referencia_url;
  const imgUrl = obra.imagem_obra_atual_url || obra.imagem_referencia_url;

  return (
    <Link
      href={`/admin/obras/${obra.id}`}
      className="group block bg-atelie-superficie border border-atelie-borda rounded-xl overflow-hidden
        hover:border-atelie-dourado/50 hover:shadow-dourado-glow
        transition-all duration-300 ease-out animate-fadeInUp"
    >
      <div className="relative h-44 bg-atelie-superficie2 overflow-hidden">
        {hasImg ? (
          <>
            {!imgLoaded && (
              <div className="absolute inset-0 bg-atelie-superficie2 animate-pulse" />
            )}
            <Image
              src={imgUrl!}
              alt={obra.titulo}
              fill
              onLoad={() => setImgLoaded(true)}
              className={`object-cover transition-all duration-700 ease-out
                ${imgLoaded ? 'opacity-100' : 'opacity-0'}
                group-hover:scale-105`}
            />
          </>
        ) : (
          <div className="h-full w-full flex items-center justify-center text-atelie-textoMuted text-sm">
            <div className="text-center">
              <svg className="w-8 h-8 mx-auto mb-1 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Sem foto
            </div>
          </div>
        )}

        {isConcluida && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center backdrop-blur-[1px]">
            <span className="bg-emerald-500/90 text-white text-xs font-medium px-3 py-1 rounded-full">
              Concluída
            </span>
          </div>
        )}

        {obra.orcamento_total > 0 && (
          <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-atelie-douradoClaro text-xs font-mono px-2 py-1 rounded-md">
            {formatarMoeda(obra.orcamento_total)}
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="min-w-0">
            <h3 className="font-display text-lg text-atelie-texto truncate group-hover:text-atelie-douradoClaro transition-colors">{obra.titulo}</h3>
            <p className="text-sm text-atelie-textoMuted truncate">{obra.cliente_nome}</p>
          </div>
        </div>

        <div className="mb-3">
          <StatusBadge status={obra.status_atual} />
        </div>

        <ProgressBar percentual={obra.percentual_conclusao} />

        <div className="flex justify-between items-center mt-2">
          <span className="text-xs text-atelie-textoMuted">{obra.percentual_conclusao}% concluído</span>
          {diasInfo && !isConcluida && (
            <span className={`text-xs ${diasInfo.classe}`}>{diasInfo.texto}</span>
          )}
          {isConcluida && (
            <span className="text-xs text-emerald-400">Concluída em {formatarData(obra.updated_at)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
