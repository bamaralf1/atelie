'use client';

import { useState, useRef, useCallback } from 'react';
import { Modal } from './Modal';

interface ImageCropperProps {
  aberto: boolean;
  arquivo: File | null;
  onConfirmar: (arquivoRecortado: File) => void;
  onFechar: () => void;
}

export function ImageCropper({ aberto, arquivo, onConfirmar, onFechar }: ImageCropperProps) {
  const [zoom, setZoom] = useState(1);
  const [posicao, setPosicao] = useState({ x: 0, y: 0 });
  const [arrastando, setArrastando] = useState(false);
  const [origem, setOrigem] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setArrastando(true);
    setOrigem({ x: e.clientX - posicao.x, y: e.clientY - posicao.y });
  }, [posicao]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!arrastando) return;
    setPosicao({ x: e.clientX - origem.x, y: e.clientY - origem.y });
  }, [arrastando, origem]);

  const handleMouseUp = useCallback(() => setArrastando(false), []);

  function handleWheel(e: React.WheelEvent) {
    e.preventDefault();
    setZoom((z) => Math.max(0.5, Math.min(3, z - e.deltaY * 0.01)));
  }

  function handleConfirmar() {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img || !arquivo) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 800;
    canvas.width = size;
    canvas.height = size;

    ctx.fillStyle = '#0E0D0C';
    ctx.fillRect(0, 0, size, size);

    const cx = size / 2 + posicao.x * (size / 400);
    const cy = size / 2 + posicao.y * (size / 400);
    const w = img.naturalWidth * zoom * (size / 400);
    const h = img.naturalHeight * zoom * (size / 400);

    ctx.drawImage(img, cx - w / 2, cy - h / 2, w, h);

    canvas.toBlob((blob) => {
      if (blob) {
        const recortado = new File([blob], arquivo.name, { type: arquivo.type });
        onConfirmar(recortado);
      }
    }, arquivo.type);
  }

  if (!arquivo) return null;

  const url = URL.createObjectURL(arquivo);

  return (
    <Modal aberto={aberto} onFechar={onFechar} titulo="Ajustar foto" largura="max-w-xl">
      <div className="space-y-4">
        <div
          className={`relative w-full aspect-square max-h-[50vh] bg-atelie-fundo rounded-lg overflow-hidden border border-atelie-borda cursor-move ${arrastando ? 'cursor-grabbing' : ''}`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        >
          <img
            ref={imgRef}
            src={url}
            alt="Preview"
            className="absolute top-1/2 left-1/2 max-w-none pointer-events-none"
            style={{
              transform: `translate(calc(-50% + ${posicao.x}px), calc(-50% + ${posicao.y}px)) scale(${zoom})`,
            }}
          />
          <canvas ref={canvasRef} className="hidden" />
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[10px] text-atelie-textoMuted w-8">Zoom</span>
          <input
            type="range"
            min={50}
            max={300}
            value={zoom * 100}
            onChange={(e) => setZoom(parseInt(e.target.value) / 100)}
            className="flex-1 accent-atelie-dourado"
          />
          <span className="text-xs font-mono text-atelie-douradoClaro w-10 text-right">{Math.round(zoom * 100)}%</span>
        </div>

        <div className="flex gap-3 justify-end">
          <button onClick={onFechar} className="btn-outline px-4 py-2 text-sm">
            Cancelar
          </button>
          <button onClick={handleConfirmar} className="btn-dourado px-4 py-2 text-sm">
            Confirmar
          </button>
        </div>
      </div>
    </Modal>
  );
}
