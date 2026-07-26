'use client';

import { useState } from 'react';
import Image from 'next/image';
import { FotoProgresso } from '@/lib/types';
import { formatarData } from '@/lib/utils';

export function Lightbox({ fotos }: { fotos: FotoProgresso[] }) {
  const [indiceAberto, setIndiceAberto] = useState<number | null>(null);

  if (fotos.length === 0) return null;

  const fotoAtual = indiceAberto !== null ? fotos[indiceAberto] : null;

  return (
    <>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {fotos.map((foto, i) => (
          <button
            key={foto.id}
            onClick={() => setIndiceAberto(i)}
            className="relative aspect-square rounded-md overflow-hidden border border-atelie-borda hover:border-atelie-dourado/60 transition-colors"
          >
            <Image src={foto.url_foto} alt={foto.legenda ?? 'Foto de progresso'} fill className="object-cover" />
          </button>
        ))}
      </div>

      {fotoAtual && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setIndiceAberto(null)}
          role="dialog"
          aria-modal="true"
        >
          <button
            onClick={() => setIndiceAberto(null)}
            className="absolute top-5 right-5 text-atelie-texto text-2xl hover:text-atelie-dourado"
            aria-label="Fechar"
          >
            ✕
          </button>

          {indiceAberto! > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); setIndiceAberto((i) => (i! - 1)); }}
              className="absolute left-4 text-atelie-texto text-3xl hover:text-atelie-dourado"
              aria-label="Anterior"
            >
              ‹
            </button>
          )}
          {indiceAberto! < fotos.length - 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); setIndiceAberto((i) => (i! + 1)); }}
              className="absolute right-4 text-atelie-texto text-3xl hover:text-atelie-dourado"
              aria-label="Próxima"
            >
              ›
            </button>
          )}

          <div className="max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
            <div className="relative w-full aspect-[4/3]">
              <Image src={fotoAtual.url_foto} alt={fotoAtual.legenda ?? ''} fill className="object-contain" />
            </div>
            <div className="text-center mt-3">
              {fotoAtual.etapa && <p className="text-atelie-douradoClaro font-medium">{fotoAtual.etapa}</p>}
              {fotoAtual.legenda && <p className="text-atelie-textoMuted text-sm">{fotoAtual.legenda}</p>}
              <p className="text-atelie-textoMuted text-xs mt-1">{formatarData(fotoAtual.data_upload)}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
