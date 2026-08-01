'use client';

import { useState } from 'react';
import Image from 'next/image';
import { FotoProgresso } from '@/lib/types';
import { VisorImagem } from './VisorImagem';

export function Lightbox({ fotos }: { fotos: FotoProgresso[] }) {
  const [indiceAberto, setIndiceAberto] = useState<number | null>(null);

  async function downloadFoto(url: string) {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `atelie.${blob.type.split('/')[1] || 'jpg'}`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch {}
  }

  if (fotos.length === 0) return null;

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {fotos.map((foto, i) => (
          <div key={foto.id} className="group relative">
            <button
              onClick={() => setIndiceAberto(i)}
              className="relative aspect-square rounded-xl overflow-hidden border border-atelie-borda hover:border-atelie-dourado/60 hover:shadow-dourado transition-all duration-300 w-full"
            >
              <Image src={foto.url_foto} alt={foto.legenda ?? 'Foto'} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
              {foto.etapa && (
                <span className="absolute bottom-1 left-1 bg-black/60 backdrop-blur-sm text-[10px] text-atelie-douradoClaro px-1.5 py-0.5 rounded">
                  {foto.etapa}
                </span>
              )}
            </button>
            <button
              onClick={() => downloadFoto(foto.url_foto)}
              className="absolute top-2 right-2 w-7 h-7 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-atelie-dourado/40"
              title="Baixar foto"
            >
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      {indiceAberto !== null && (
        <VisorImagem
          itens={fotos.map((f) => ({ id: f.id, url: f.url_foto, legenda: f.legenda, etapa: f.etapa, data: f.data_upload }))}
          indiceInicial={indiceAberto}
          onFechar={() => setIndiceAberto(null)}
        />
      )}
    </>
  );
}
