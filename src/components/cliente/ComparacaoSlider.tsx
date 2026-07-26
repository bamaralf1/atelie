'use client';

import { useState, useRef, useCallback } from 'react';

interface ComparacaoSliderProps {
  imagemAntes: string;
  imagemDepois: string;
  labelAntes?: string;
  labelDepois?: string;
}

export function ComparacaoSlider({
  imagemAntes,
  imagemDepois,
  labelAntes = 'Antes',
  labelDepois = 'Depois',
}: ComparacaoSliderProps) {
  const [posicao, setPosicao] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const arrastandoRef = useRef(false);

  const atualizarPosicao = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setPosicao((x / rect.width) * 100);
  }, []);

  const handleMouseDown = () => { arrastandoRef.current = true; };
  const handleMouseUp = () => { arrastandoRef.current = false; };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!arrastandoRef.current) return;
    atualizarPosicao(e.clientX);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    arrastandoRef.current = true;
    atualizarPosicao(e.touches[0].clientX);
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!arrastandoRef.current) return;
    atualizarPosicao(e.touches[0].clientX);
  };
  const handleTouchEnd = () => { arrastandoRef.current = false; };

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-[4/3] rounded-lg overflow-hidden border border-atelie-borda select-none cursor-col-resize"
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Imagem "Depois" (fundo completo) */}
      <img
        src={imagemDepois}
        alt={labelDepois}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
        draggable={false}
      />

      {/* Imagem "Antes" (cortada pela posição) */}
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none select-none"
        style={{ width: `${posicao}%` }}
      >
        <img
          src={imagemAntes}
          alt={labelAntes}
          className="absolute top-0 left-0 w-full h-full object-cover pointer-events-none select-none"
          style={{ width: `${100 / (posicao / 100)}%`, maxWidth: 'none' }}
          draggable={false}
        />
      </div>

      {/* Linha divisória */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_8px_rgba(0,0,0,0.5)] pointer-events-none"
        style={{ left: `${posicao}%` }}
      >
        {/* Alça redonda */}
        <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center">
          <svg className="w-4 h-4 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7l-4 4 4 4m8-8l4 4-4 4" />
          </svg>
        </div>
      </div>

      {/* Labels */}
      <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded pointer-events-none">
        {labelAntes}
      </div>
      <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded pointer-events-none">
        {labelDepois}
      </div>
    </div>
  );
}
