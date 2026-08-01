'use client';

import { useState, useRef, useCallback, useEffect, WheelEvent, MouseEvent, TouchEvent } from 'react';
import Image from 'next/image';
import { ItemVisor } from '@/lib/types';
import { formatarData } from '@/lib/utils';

const ZOOM_MIN = 1;
const ZOOM_MAX = 4;
const ZOOM_PASSO = 0.5;
const SWIPE_THRESHOLD = 50;

interface VisorImagemProps {
  itens: ItemVisor[];
  indiceInicial: number;
  onFechar: () => void;
}

export function VisorImagem({ itens, indiceInicial, onFechar }: VisorImagemProps) {
  const [indice, setIndice] = useState(indiceInicial);
  const [zoom, setZoom] = useState(1);
  const [posicao, setPosicao] = useState({ x: 0, y: 0 });
  const arrastandoRef = useRef(false);
  const ultimaPosRef = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const toqueInicialRef = useRef<{ x: number; y: number; tempo: number } | null>(null);

  const itemAtual = itens[indice];

  const resetarZoom = useCallback(() => {
    setZoom(1);
    setPosicao({ x: 0, y: 0 });
  }, []);

  const fechar = useCallback(() => { onFechar(); resetarZoom(); }, [onFechar, resetarZoom]);

  const irPara = useCallback(
    (novoIndice: number) => {
      if (novoIndice < 0 || novoIndice >= itens.length) return;
      setIndice(novoIndice);
      resetarZoom();
    },
    [itens.length, resetarZoom]
  );

  const aplicarZoom = useCallback((delta: number) => {
    setZoom((z) => {
      const novo = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, z + delta));
      if (novo === ZOOM_MIN) setPosicao({ x: 0, y: 0 });
      return novo;
    });
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') fechar();
      else if (e.key === 'ArrowRight') irPara(indice + 1);
      else if (e.key === 'ArrowLeft') irPara(indice - 1);
      else if (e.key === '+' || e.key === '=') aplicarZoom(ZOOM_PASSO);
      else if (e.key === '-') aplicarZoom(-ZOOM_PASSO);
      else if (e.key === '0') resetarZoom();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [indice, fechar, irPara, aplicarZoom, resetarZoom]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  async function downloadFoto(url: string) {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `atelie-${indice + 1}.${blob.type.split('/')[1] || 'jpg'}`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch {}
  }

  function handleWheel(e: WheelEvent) { e.preventDefault(); aplicarZoom(e.deltaY < 0 ? ZOOM_PASSO : -ZOOM_PASSO); }

  function handleMouseDown(e: MouseEvent) {
    if (zoom > 1) { arrastandoRef.current = true; ultimaPosRef.current = { x: e.clientX, y: e.clientY }; }
  }
  function handleMouseMove(e: MouseEvent) {
    if (!arrastandoRef.current) return;
    const dx = e.clientX - ultimaPosRef.current.x;
    const dy = e.clientY - ultimaPosRef.current.y;
    ultimaPosRef.current = { x: e.clientX, y: e.clientY };
    setPosicao((p) => ({ x: p.x + dx, y: p.y + dy }));
  }
  function handleMouseUp() { arrastandoRef.current = false; }

  function handleTouchStart(e: TouchEvent) {
    if (e.touches.length === 1) {
      toqueInicialRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, tempo: Date.now() };
      if (zoom > 1) { arrastandoRef.current = true; ultimaPosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; }
    }
  }
  function handleTouchMove(e: TouchEvent) {
    if (arrastandoRef.current && zoom > 1 && e.touches.length === 1) {
      const dx = e.touches[0].clientX - ultimaPosRef.current.x;
      const dy = e.touches[0].clientY - ultimaPosRef.current.y;
      ultimaPosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      setPosicao((p) => ({ x: p.x + dx, y: p.y + dy }));
    }
  }
  function handleTouchEnd(e: TouchEvent) {
    arrastandoRef.current = false;
    if (toqueInicialRef.current && zoom === 1) {
      const dx = e.changedTouches[0].clientX - toqueInicialRef.current.x;
      const dt = Date.now() - toqueInicialRef.current.tempo;
      if (Math.abs(dx) > SWIPE_THRESHOLD && dt < 500) {
        if (dx < 0) irPara(indice + 1);
        else irPara(indice - 1);
      }
    }
    toqueInicialRef.current = null;
  }

  function handleDoubleClick() {
    if (zoom > 1) resetarZoom();
    else aplicarZoom(ZOOM_PASSO * 2);
  }

  if (!itemAtual) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col select-none animate-fadeIn" role="dialog" aria-modal="true">
      <div className="flex items-center justify-between px-4 py-3 text-atelie-texto text-sm shrink-0">
        <span className="text-atelie-textoMuted font-mono">{indice + 1} / {itens.length}</span>
        <div className="flex items-center gap-2">
          <button onClick={() => aplicarZoom(-ZOOM_PASSO)} disabled={zoom <= ZOOM_MIN} aria-label="Diminuir zoom"
            className="w-8 h-8 rounded-md border border-atelie-borda hover:border-atelie-dourado/60 disabled:opacity-30 flex items-center justify-center transition-colors">−</button>
          <span className="text-atelie-textoMuted font-mono w-12 text-center">{Math.round(zoom * 100)}%</span>
          <button onClick={() => aplicarZoom(ZOOM_PASSO)} disabled={zoom >= ZOOM_MAX} aria-label="Aumentar zoom"
            className="w-8 h-8 rounded-md border border-atelie-borda hover:border-atelie-dourado/60 disabled:opacity-30 flex items-center justify-center transition-colors">+</button>
          {zoom > 1 && <button onClick={resetarZoom} className="text-xs text-atelie-douradoClaro hover:underline">Restaurar</button>}
          <button onClick={() => downloadFoto(itemAtual.url)} aria-label="Baixar"
            className="w-8 h-8 rounded-md border border-atelie-borda hover:border-atelie-dourado/60 flex items-center justify-center transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>
          <button onClick={fechar} aria-label="Fechar"
            className="w-8 h-8 rounded-md border border-atelie-borda hover:border-atelie-terracota/60 flex items-center justify-center ml-2 transition-colors">✕</button>
        </div>
      </div>

      <div ref={containerRef}
        className={`relative flex-1 overflow-hidden flex items-center justify-center ${zoom > 1 ? (arrastandoRef.current ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-zoom-in'}`}
        onWheel={handleWheel} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}
        onDoubleClick={handleDoubleClick}>
        {indice > 0 && (
          <button onClick={(e) => { e.stopPropagation(); irPara(indice - 1); }}
            className="absolute left-3 z-10 text-atelie-texto text-3xl w-10 h-10 rounded-full bg-black/40 hover:bg-atelie-dourado/20 hover:text-atelie-dourado flex items-center justify-center backdrop-blur-sm transition-all">‹</button>
        )}
        {indice < itens.length - 1 && (
          <button onClick={(e) => { e.stopPropagation(); irPara(indice + 1); }}
            className="absolute right-3 z-10 text-atelie-texto text-3xl w-10 h-10 rounded-full bg-black/40 hover:bg-atelie-dourado/20 hover:text-atelie-dourado flex items-center justify-center backdrop-blur-sm transition-all">›</button>
        )}
        <div className="relative w-full h-full max-w-5xl max-h-[75vh] mx-auto"
          style={{ transform: `translate(${posicao.x}px, ${posicao.y}px) scale(${zoom})`, transition: arrastandoRef.current ? 'none' : 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)' }}>
          <Image src={itemAtual.url} alt={itemAtual.legenda ?? ''} fill className="object-contain pointer-events-none" draggable={false} priority />
        </div>
      </div>

      <div className="text-center py-2 shrink-0">
        {itemAtual.etapa && <p className="text-atelie-douradoClaro font-medium text-sm">{itemAtual.etapa}</p>}
        {itemAtual.legenda && <p className="text-atelie-textoMuted text-sm">{itemAtual.legenda}</p>}
        {itemAtual.data && <p className="text-atelie-textoMuted text-xs mt-1">{formatarData(itemAtual.data)}</p>}
      </div>

      {itens.length > 1 && (
        <div className="flex gap-2 px-4 pb-4 overflow-x-auto shrink-0 justify-center">
          {itens.map((item, i) => (
            <button key={item.id} onClick={() => irPara(i)}
              className={`relative w-14 h-14 shrink-0 rounded-md overflow-hidden border-2 transition-all duration-200 ${i === indice ? 'border-atelie-dourado shadow-dourado' : 'border-transparent opacity-50 hover:opacity-100'}`}>
              <Image src={item.url} alt="" fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
