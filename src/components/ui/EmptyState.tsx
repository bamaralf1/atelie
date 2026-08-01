import Link from 'next/link';
import { ReactNode } from 'react';

interface EmptyStateProps {
  icone?: ReactNode;
  titulo: string;
  descricao: string;
  acao?: { href: string; label: string };
}

export function EmptyState({ icone, titulo, descricao, acao }: EmptyStateProps) {
  return (
    <div className="border border-dashed border-atelie-borda rounded-lg py-16 px-6 text-center animate-fadeIn">
      {icone ?? (
        <svg className="w-12 h-12 mx-auto mb-4 text-atelie-textoMuted/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      )}
      <h3 className="font-display text-lg text-atelie-texto mb-2">{titulo}</h3>
      <p className="text-atelie-textoMuted text-sm mb-6 max-w-sm mx-auto">{descricao}</p>
      {acao && (
        <Link href={acao.href} className="inline-block btn-dourado px-5 py-2.5">
          {acao.label}
        </Link>
      )}
    </div>
  );
}
