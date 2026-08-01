'use client';

import Image from 'next/image';
import { FotoProgresso } from '@/lib/types';

/**
 * Grade de miniaturas da galeria. O clique abre o visualizador interativo
 * (VisorImagem), controlado pela página que fornece o callback `aoAbrir`.
 */
export function Lightbox({ fotos, aoAbrir }: { fotos: FotoProgresso[]; aoAbrir: (indice: number) => void }) {
  if (fotos.length === 0) return null;

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
      {fotos.map((foto, i) => (
        <button
          key={foto.id}
          onClick={() => aoAbrir(i)}
          className="relative aspect-square rounded-md overflow-hidden border border-atelie-borda hover:border-atelie-dourado/60 transition-colors"
          aria-label={`Abrir foto ${i + 1}: ${foto.legenda ?? 'foto de progresso'}`}
        >
          <Image src={foto.url_foto} alt={foto.legenda ?? 'Foto de progresso'} fill className="object-cover" />
        </button>
      ))}
    </div>
  );
}
