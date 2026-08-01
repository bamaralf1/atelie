'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { formatarData } from '@/lib/utils';

export interface ItemVisor {
  id: string;
  src: string;
  legenda?: string | null;
  etapa?: string | null;
  data?: string | null;
}

const ESCALA_MIN = 1;
const ESCALA_MAX = 5;

function limitarValor(valor: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, valor));
}

type Gesto =
  | { tipo: 'pan'; x: number; y: number; offsetInicial: { x: number; y: number } }
  | {
      tipo: 'pinch';
      distancia: number;
      midInicial: { x: number; y: number };
      escalaInicial: number;
      offsetInicial: { x: number; y: number };
    };

/**
 * Modal em tela cheia para visualização interativa de fotos: permite dar zoom
 * (botões, roda do mouse, toque com pinça), arrastar para percorrer a imagem
 * e navegar entre fotos com as setas / teclado.
 */
export function VisorImagem({
  itens,
  indiceInicial = 0,
  onFechar,
}: {
  itens: ItemVisor[];
  indiceInicial?: number;
  onFechar: () => void;
}) {
  const [indice, setIndice] = useState(indiceInicial);
  const [escala, setEscala] = useState(1);
  const [arrastando, setArrastando] = useState(false);

  const imagemRef = useRef<HTMLDivElement>(null);
  const pontosRef = useRef(new Map<number, { x: number; y: number }>());
  const gestoRef = useRef<Gesto | null>(null);
  const escalaRef = useRef(1);
  const offsetRef = useRef({ x: 0, y: 0 });

  const itemAtual = itens[limitarValor(indice, 0, itens.length - 1)];

  const aplicarTransform = useCallback(() => {
    if (imagemRef.current) {
      imagemRef.current.style.transform = `translate(${offsetRef.current.x}px, ${offsetRef.current.y}px) scale(${escalaRef.current})`;
    }
  }, []);

  const limitarOffset = useCallback((off: { x: number; y: number }, es: number) => {
    const maxX = Math.max(0, (window.innerWidth * (es - 1)) / 2);
    const maxY = Math.max(0, (window.innerHeight * (es - 1)) / 2);
    return {
      x: limitarValor(off.x, -maxX, maxX),
      y: limitarValor(off.y, -maxY, maxY),
    };
  }, []);

  const redefinir = useCallback(() => {
    escalaRef.current = 1;
    offsetRef.current = { x: 0, y: 0 };
    setEscala(1);
    aplicarTransform();
  }, [aplicarTransform]);

  // Reset de zoom/pan ao trocar de foto.
  useEffect(() => {
    redefinir();
  }, [indice, redefinir]);

  const zoomNoPonto = useCallback(
    (px: number, py: number, fator: number) => {
      const nova = limitarValor(escalaRef.current * fator, ESCALA_MIN, ESCALA_MAX);
      if (nova === escalaRef.current) return;

      let off = { ...offsetRef.current };
      if (nova === ESCALA_MIN) {
        off = { x: 0, y: 0 };
      } else {
        off = {
          x: px - ((px - off.x) * nova) / escalaRef.current,
          y: py - ((py - off.y) * nova) / escalaRef.current,
        };
      }
      off = limitarOffset(off, nova);
      offsetRef.current = off;
      escalaRef.current = nova;
      setEscala(nova);
      aplicarTransform();
    },
    [aplicarTransform, limitarOffset]
  );

  // Roda do mouse com zoom no cursor (listener não-passivo para permitir preventDefault).
  useEffect(() => {
    const noWheel = (e: WheelEvent) => {
      e.preventDefault();
      const fator = e.deltaY < 0 ? 1.18 : 1 / 1.18;
      zoomNoPonto(e.clientX, e.clientY, fator);
    };
    const el = imagemRef.current?.parentElement;
    el?.addEventListener('wheel', noWheel, { passive: false });
    return () => el?.removeEventListener('wheel', noWheel);
  }, [zoomNoPonto]);

  function irPara(novoIndice: number) {
    const i = limitarValor(novoIndice, 0, itens.length - 1);
    setIndice(i);
  }

  // Teclado: Esc fecha, setas navegam.
  useEffect(() => {
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onFechar();
      if (e.key === 'ArrowLeft') irPara(indice - 1);
      if (e.key === 'ArrowRight') irPara(indice + 1);
    };
    window.addEventListener('keydown', aoTeclar);
    return () => window.removeEventListener('keydown', aoTeclar);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onFechar, indice]);

  // Trava o scroll da página enquanto o modal está aberto.
  useEffect(() => {
    const anterior = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = anterior;
    };
  }, []);

  function aoPressionar(e: React.PointerEvent) {
    const el = imagemRef.current;
    if (!el) return;
    el.setPointerCapture(e.pointerId);
    pontosRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pontosRef.current.size === 1) {
      setArrastando(true);
      gestoRef.current = {
        tipo: 'pan',
        x: e.clientX,
        y: e.clientY,
        offsetInicial: { ...offsetRef.current },
      };
    } else if (pontosRef.current.size === 2) {
      const [p1, p2] = [...pontosRef.current.values()];
      gestoRef.current = {
        tipo: 'pinch',
        distancia: Math.hypot(p2.x - p1.x, p2.y - p1.y),
        midInicial: { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 },
        escalaInicial: escalaRef.current,
        offsetInicial: { ...offsetRef.current },
      };
    }
  }

  function aoMover(e: React.PointerEvent) {
    if (!pontosRef.current.has(e.pointerId)) return;
    pontosRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const g = gestoRef.current;
    if (!g) return;

    if (g.tipo === 'pan') {
      const novoOff = limitarOffset(
        {
          x: g.offsetInicial.x + (e.clientX - g.x),
          y: g.offsetInicial.y + (e.clientY - g.y),
        },
        escalaRef.current
      );
      offsetRef.current = novoOff;
      aplicarTransform();
    } else if (g.tipo === 'pinch' && pontosRef.current.size === 2) {
      const [p1, p2] = [...pontosRef.current.values()];
      const midAtual = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
      const distAtual = Math.hypot(p2.x - p1.x, p2.y - p1.y);
      const nova = limitarValor(
        (g.escalaInicial * distAtual) / g.distancia,
        ESCALA_MIN,
        ESCALA_MAX
      );
      const ancora = {
        x: (g.midInicial.x - g.offsetInicial.x) / g.escalaInicial,
        y: (g.midInicial.y - g.offsetInicial.y) / g.escalaInicial,
      };
      let novoOff = {
        x: midAtual.x - ancora.x * nova,
        y: midAtual.y - ancora.y * nova,
      };
      novoOff = limitarOffset(novoOff, nova);
      offsetRef.current = novoOff;
      escalaRef.current = nova;
      setEscala(nova);
      aplicarTransform();
    }
  }

  function aoSoltar(e: React.PointerEvent) {
    pontosRef.current.delete(e.pointerId);
    if (pontosRef.current.size === 1) {
      const [p] = [...pontosRef.current.values()];
      gestoRef.current = {
        tipo: 'pan',
        x: p.x,
        y: p.y,
        offsetInicial: { ...offsetRef.current },
      };
      setArrastando(true);
    } else {
      gestoRef.current = null;
      setArrastando(false);
    }
  }

  function aoDuploToque() {
    if (escalaRef.current > 1) {
      redefinir();
    } else {
      zoomNoPonto(window.innerWidth / 2, window.innerHeight / 2, 2.5);
    }
  }

  const zoomCentral = (fator: number) =>
    zoomNoPonto(window.innerWidth / 2, window.innerHeight / 2, fator);

  if (!itemAtual) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-label="Visualizador de fotos"
    >
      {/* Barra superior */}
      <div className="absolute top-0 inset-x-0 z-20 flex items-center justify-between p-4">
        <button
          onClick={onFechar}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-white/5 hover:bg-white/15 text-white text-xl transition-colors"
          aria-label="Fechar"
        >
          ✕
        </button>
        {itens.length > 1 && (
          <span className="text-white/70 text-sm font-mono">
            {indice + 1} / {itens.length}
          </span>
        )}
      </div>

      {/* Área da imagem (zoom, pan, pinça) */}
      <div
        className="flex-1 relative overflow-hidden touch-none select-none"
        style={{ cursor: arrastando ? 'grabbing' : 'grab' }}
        onPointerDown={aoPressionar}
        onPointerMove={aoMover}
        onPointerUp={aoSoltar}
        onPointerCancel={aoSoltar}
        onDoubleClick={aoDuploToque}
      >
        <div
          ref={imagemRef}
          className="absolute inset-0 flex items-center justify-center will-change-transform"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={itemAtual.src}
            alt={itemAtual.legenda ?? 'Foto da obra'}
            draggable={false}
            className="max-w-full max-h-full object-contain select-none"
          />
        </div>
      </div>

      {/* Navegação entre fotos */}
      {itens.length > 1 && (
        <>
          {indice > 0 && (
            <button
              onClick={() => irPara(indice - 1)}
              onPointerDown={(e) => e.stopPropagation()}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-11 h-11 rounded-full bg-white/5 hover:bg-white/15 text-white text-3xl transition-colors"
              aria-label="Foto anterior"
            >
              ‹
            </button>
          )}
          {indice < itens.length - 1 && (
            <button
              onClick={() => irPara(indice + 1)}
              onPointerDown={(e) => e.stopPropagation()}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-11 h-11 rounded-full bg-white/5 hover:bg-white/15 text-white text-3xl transition-colors"
              aria-label="Próxima foto"
            >
              ›
            </button>
          )}
        </>
      )}

      {/* Controles de zoom */}
      <div className="absolute bottom-16 inset-x-0 z-20 flex items-center justify-center gap-2">
        <button
          onClick={() => zoomCentral(1 / 1.5)}
          onPointerDown={(e) => e.stopPropagation()}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-white/5 hover:bg-white/15 text-white text-xl transition-colors"
          aria-label="Diminuir zoom"
        >
          −
        </button>
        <button
          onClick={redefinir}
          className="flex items-center justify-center h-10 px-3 rounded-full bg-white/5 hover:bg-white/15 text-white text-sm font-mono transition-colors"
          aria-label="Redefinir zoom"
        >
          {Math.round(escala * 100)}%
        </button>
        <button
          onClick={() => zoomCentral(1.5)}
          onPointerDown={(e) => e.stopPropagation()}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-white/5 hover:bg-white/15 text-white text-xl transition-colors"
          aria-label="Aumentar zoom"
        >
          +
        </button>
      </div>

      {/* Legenda */}
      <div className="px-4 pb-8 pt-2 text-center">
        {itemAtual.etapa && (
          <p className="text-atelie-douradoClaro font-medium text-sm">{itemAtual.etapa}</p>
        )}
        {itemAtual.legenda && (
          <p className="text-white/70 text-sm mt-0.5">{itemAtual.legenda}</p>
        )}
        {itemAtual.data && (
          <p className="text-white/40 text-xs mt-1">{formatarData(itemAtual.data)}</p>
        )}
      </div>
    </div>
  );
}
