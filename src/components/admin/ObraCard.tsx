import Link from 'next/link';
import Image from 'next/image';
import { Obra } from '@/lib/types';
import { StatusBadge } from './StatusBadge';
import { ProgressBar } from './ProgressBar';
import { formatarData, formatarDiasRestantes, formatarMoeda } from '@/lib/utils';

export function ObraCard({ obra }: { obra: Obra }) {
  const diasInfo = formatarDiasRestantes(obra.estimativa_conclusao);
  const isConcluida = obra.status_atual === 'Concluída';

  return (
    <Link
      href={`/admin/obras/${obra.id}`}
      className="group block card-glass overflow-hidden animate-fadeInUp"
    >
      <div className="relative h-48 bg-black/40 overflow-hidden">
        {obra.imagem_obra_atual_url ? (
          <Image
            src={obra.imagem_obra_atual_url}
            alt={obra.titulo}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-700"
          />
        ) : obra.imagem_referencia_url ? (
          <Image
            src={obra.imagem_referencia_url}
            alt={obra.titulo}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-700 opacity-50"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <div className="text-center">
              <svg className="w-10 h-10 mx-auto mb-1 text-atelie-textoMuted/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-atelie-textoMuted/40 text-xs">Sem foto</p>
            </div>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Badge de conclusão */}
        {isConcluida && (
          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center gap-1 bg-emerald-500/90 backdrop-blur-sm text-white text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              Concluída
            </span>
          </div>
        )}

        {/* Preço */}
        {obra.orcamento_total > 0 && (
          <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md border border-white/10 text-atelie-douradoClaro text-[11px] font-mono px-2.5 py-1 rounded-full">
            {formatarMoeda(obra.orcamento_total)}
          </div>
        )}

        {/* Título na imagem */}
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="font-display text-lg text-white drop-shadow-lg truncate">{obra.titulo}</h3>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm text-atelie-textoMuted truncate flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            {obra.cliente_nome}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <StatusBadge status={obra.status_atual} tamanho="pequeno" />
          {diasInfo && !isConcluida && (
            <span className={`text-[11px] ${diasInfo.classe}`}>{diasInfo.texto}</span>
          )}
        </div>

        <ProgressBar percentual={obra.percentual_conclusao} />

        <div className="flex justify-between items-center pt-1">
          <span className="text-[11px] text-atelie-textoMuted">{obra.percentual_conclusao}% concluído</span>
          {isConcluida && (
            <span className="text-[11px] text-emerald-400/70">Concluída em {formatarData(obra.updated_at)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
