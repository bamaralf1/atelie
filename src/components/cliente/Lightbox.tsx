'use client';

import { useState, useRef, useCallback, useEffect, WheelEvent, MouseEvent, TouchEvent } from 'react';
import Image from 'next/image';
import { FotoProgresso } from '@/lib/types';
import { formatarData } from '@/lib/utils';

const ZOOM_MIN = 1;
const ZOOM_MAX = 4;
const ZOOM_PASSO = 0.5;
const SWIPE_THRESHOLD = 50;

export function Lightbox({ fotos }: { fotos: FotoProgresso[] }) {
  const [indiceAberto, setIndiceAberto] = useState<number | null>(null);
  const [zoom, setZoom] = useState(1);
  const [posicao, setPosicao] = useState({ x: 0, y: 0 });
  const arrastandoRef = useRef(false);
  const ultimaPosRef = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const toqueInicialRef = useRef<{ x: number; y: number; tempo: number } | null>(null);

  const fotoAtual = indiceAberto !== null ? fotos[indiceAberto] : null;

  const resetarZoom = useCallback(() => {
    setZoom(1);
    setPosicao({ x: 0, y: 0 });
  }, []);

  const abrir = (i: number) => {
    setIndiceAberto(i);
    resetarZoom();
  };

  const fechar = useCallback(() => {
    setIndiceAberto(null);
    resetarZoom();
  }, [resetarZoom]);

  const irPara = useCallback(
    (novoIndice: number) => {
      if (novoIndice < 0 || novoIndice >= fotos.length) return;
      setIndiceAberto(novoIndice);
      resetarZoom();
    },
    [fotos.length, resetarZoom]
  );

  const aplicarZoom = useCallback((delta: number) => {
    setZoom((z) => {
      const novo = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, z + delta));
      if (novo === ZOOM_MIN) setPosicao({ x: 0, y: 0 });
      return novo;
    });
  }, []);

  useEffect(() => {
    if (indiceAberto === null) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') fechar();
      else if (e.key === 'ArrowRight') irPara(indiceAberto! + 1);
      else if (e.key === 'ArrowLeft') irPara(indiceAberto! - 1);
      else if (e.key === '+' || e.key === '=') aplicarZoom(ZOOM_PASSO);
      else if (e.key === '-') aplicarZoom(-ZOOM_PASSO);
      else if (e.key === '0') resetarZoom();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [indiceAberto, fechar, irPara, aplicarZoom, resetarZoom]);

  useEffect(() => {
    if (indiceAberto === null) return;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [indiceAberto]);

  function handleWheel(e: WheelEvent) {
    e.preventDefault();
    aplicarZoom(e.deltaY < 0 ? ZOOM_PASSO : -ZOOM_PASSO);
  }

  function handleMouseDown(e: MouseEvent) {
    if (zoom > 1) {
      arrastandoRef.current = true;
      ultimaPosRef.current = { x: e.clientX, y: e.clientY };
    }
  }

  function handleMouseMove(e: MouseEvent) {
    if (!arrastandoRef.current) return;
    const dx = e.clientX - ultimaPosRef.current.x;
    const dy = e.clientY - ultimaPosRef.current.y;
    ultimaPosRef.current = { x: e.clientX, y: e.clientY };
    setPosicao((p) => ({ x: p.x + dx, y: p.y + dy }));
  }

  function handleMouseUp() {
    arrastandoRef.current = false;
  }

  function handleTouchStart(e: TouchEvent) {
    if (e.touches.length === 1) {
      toqueInicialRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        tempo: Date.now(),
      };
      if (zoom > 1) {
        arrastandoRef.current = true;
        ultimaPosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
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
    if (toqueInicialRef.current && zoom === 1 && indiceAberto !== null) {
      const dx = e.changedTouches[0].clientX - toqueInicialRef.current.x;
      const dt = Date.now() - toqueInicialRef.current.tempo;
      // Swipe rápido ou arrasto longo
      if (Math.abs(dx) > SWIPE_THRESHOLD && dt < 500) {
        if (dx < 0) irPara(indiceAberto + 1);
        else irPara(indiceAberto - 1);
      }
    }
    toqueInicialRef.current = null;
  }

  function handleDoubleClick() {
    if (zoom > 1) resetarZoom();
    else aplicarZoom(ZOOM_PASSO * 2);
  }

  if (fotos.length === 0) return null;

  return (
    <>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {fotos.map((foto, i) => (
          <button
            key={foto.id}
            onClick={() => abrir(i)}
            className="relative aspect-square rounded-md overflow-hidden border border-atelie-borda hover:border-atelie-dourado/60 hover:shadow-dourado transition-all duration-300"
          >
            <Image src={foto.url_foto} alt={foto.legenda ?? 'Foto de progresso'} fill className="object-cover hover:scale-110 transition-transform duration-500" />
            {foto.etapa && (
              <span className="absolute bottom-1 left-1 bg-black/60 backdrop-blur-sm text-[10px] text-atelie-douradoClaro px-1.5 py-0.5 rounded">
                {foto.etapa}
              </span>
            )}
          </button>
        ))}
      </div>

      {fotoAtual && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex flex-col select-none animate-fadeIn"
          role="dialog"
          aria-modal="true"
        >
          {/* Barra superior */}
          <div className="flex items-center justify-between px-4 py-3 text-atelie-texto text-sm shrink-0">
            <span className="text-atelie-textoMuted font-mono">
              {indiceAberto! + 1} / {fotos.length}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => aplicarZoom(-ZOOM_PASSO)}
                disabled={zoom <= ZOOM_MIN}
                aria-label="Diminuir zoom"
                className="w-8 h-8 rounded-md border border-atelie-borda hover:border-atelie-dourado/60 disabled:opacity-30 flex items-center justify-center transition-colors"
              >
                −
              </button>
              <span className="text-atelie-textoMuted font-mono w-12 text-center">{Math.round(zoom * 100)}%</span>
              <button
                onClick={() => aplicarZoom(ZOOM_PASSO)}
                disabled={zoom >= ZOOM_MAX}
                aria-label="Aumentar zoom"
                className="w-8 h-8 rounded-md border border-atelie-borda hover:border-atelie-dourado/60 disabled:opacity-30 flex items-center justify-center transition-colors"
              >
                +
              </button>
              {zoom > 1 && (
                <button onClick={resetarZoom} className="text-xs text-atelie-douradoClaro hover:underline ml-1">
                  Restaurar
                </button>
              )}
              <button
                onClick={fechar}
                aria-label="Fechar"
                className="w-8 h-8 rounded-md border border-atelie-borda hover:border-atelie-terracota/60 flex items-center justify-center ml-2 transition-colors"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Área da imagem */}
          <div
            ref={containerRef}
            className={`relative flex-1 overflow-hidden flex items-center justify-center ${
              zoom > 1 ? (arrastandoRef.current ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-zoom-in'
            }`}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onDoubleClick={handleDoubleClick}
          >
            {/* Setas de navegação */}
            {indiceAberto! > 0 && (
              <button
                onClick={(e) => { e.stopPropagation(); irPara(indiceAberto! - 1); }}
                aria-label="Foto anterior"
                className="absolute left-3 z-10 text-atelie-texto text-3xl w-10 h-10 rounded-full bg-black/40 hover:bg-atelie-dourado/20 hover:text-atelie-dourado flex items-center justify-center backdrop-blur-sm transition-all"
              >
                ‹
              </button>
            )}
            {indiceAberto! < fotos.length - 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); irPara(indiceAberto! + 1); }}
                aria-label="Próxima foto"
                className="absolute right-3 z-10 text-atelie-texto text-3xl w-10 h-10 rounded-full bg-black/40 hover:bg-atelie-dourado/20 hover:text-atelie-dourado flex items-center justify-center backdrop-blur-sm transition-all"
              >
                ›
              </button>
            )}

            <div
              className="relative w-full h-full max-w-5xl max-h-[75vh] mx-auto"
              style={{
                transform: `translate(${posicao.x}px, ${posicao.y}px) scale(${zoom})`,
                transition: arrastandoRef.current ? 'none' : 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              <Image
                src={fotoAtual.url_foto}
                alt={fotoAtual.legenda ?? ''}
                fill
                className="object-contain pointer-events-none"
                draggable={false}
                priority
              />
            </div>
          </div>

          {/* Legenda */}
          <div className="text-center py-2 shrink-0">
            {fotoAtual.etapa && <p className="text-atelie-douradoClaro font-medium text-sm">{fotoAtual.etapa}</p>}
            {fotoAtual.legenda && <p className="text-atelie-textoMuted text-sm">{fotoAtual.legenda}</p>}
            <p className="text-atelie-textoMuted text-xs mt-1">{formatarData(fotoAtual.data_upload)}</p>
          </div>

          {/* Tira de miniaturas */}
          {fotos.length > 1 && (
            <div className="flex gap-2 px-4 pb-4 overflow-x-auto shrink-0 justify-center">
              {fotos.map((foto, i) => (
                <button
                  key={foto.id}
                  onClick={() => irPara(i)}
                  className={`relative w-14 h-14 shrink-0 rounded-md overflow-hidden border-2 transition-all duration-200 ${
                    i === indiceAberto ? 'border-atelie-dourado shadow-dourado' : 'border-transparent opacity-50 hover:opacity-100'
                  }`}
                >
                  <Image src={foto.url_foto} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
