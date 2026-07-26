'use client';

import { useEffect, useState, useCallback } from 'react';

interface Particula {
  id: number;
  x: number;
  cor: string;
  tamanho: number;
  duracao: number;
  atraso: number;
  formato: 'circle' | 'square' | 'star';
  rotacao: number;
}

const CORES = ['#C6A15B', '#E0C27E', '#D97B5E', '#34D399', '#FBBF24', '#F472B6'];
const FORMATOS: Particula['formato'][] = ['circle', 'square', 'star'];

export function Celebracao({ ativo }: { ativo: boolean }) {
  const [particulas, setParticulas] = useState<Particula[]>([]);

  const gerar = useCallback(() => {
    const novas: Particula[] = [];
    for (let i = 0; i < 50; i++) {
      novas.push({
        id: i,
        x: Math.random() * 100,
        cor: CORES[Math.floor(Math.random() * CORES.length)],
        tamanho: 4 + Math.random() * 10,
        duracao: 2 + Math.random() * 3,
        atraso: Math.random() * 2,
        formato: FORMATOS[Math.floor(Math.random() * FORMATOS.length)],
        rotacao: Math.random() * 360,
      });
    }
    setParticulas(novas);
  }, []);

  useEffect(() => {
    if (ativo) {
      gerar();
      const t = setInterval(gerar, 6000);
      return () => clearInterval(t);
    } else {
      setParticulas([]);
    }
  }, [ativo, gerar]);

  if (!ativo || particulas.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particulas.map((p) => (
        <div
          key={`${p.id}-${p.atraso}`}
          className="absolute top-0"
          style={{
            left: `${p.x}%`,
            width: p.tamanho,
            height: p.tamanho,
            backgroundColor: p.formato === 'star' ? 'transparent' : p.cor,
            clipPath: p.formato === 'star'
              ? 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'
              : undefined,
            borderRadius: p.formato === 'circle' ? '50%' : p.formato === 'square' ? '2px' : undefined,
            border: p.formato === 'star' ? 'none' : undefined,
            background: p.formato === 'star' ? p.cor : undefined,
            animation: `confete-${p.formato} ${p.duracao}s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${p.atraso}s both`,
            '--rotacao-inicial': `${p.rotacao}deg`,
          } as React.CSSProperties}
        />
      ))}
      <style>{`
        @keyframes confete-circle {
          0% { transform: translateY(-20px) rotate(0deg) scale(0); opacity: 1; }
          20% { opacity: 0.9; }
          100% { transform: translateY(100vh) rotate(720deg) scale(1); opacity: 0; }
        }
        @keyframes confete-square {
          0% { transform: translateY(-20px) rotate(0deg) scale(0) translateX(0); opacity: 1; }
          50% { transform: translateY(50vh) rotate(360deg) scale(1) translateX(30px); opacity: 0.8; }
          100% { transform: translateY(100vh) rotate(720deg) scale(0.5) translateX(-20px); opacity: 0; }
        }
        @keyframes confete-star {
          0% { transform: translateY(-20px) rotate(var(--rotacao-inicial)) scale(0); opacity: 1; }
          50% { transform: translateY(40vh) rotate(calc(var(--rotacao-inicial) + 180deg)) scale(1.2); opacity: 0.9; }
          100% { transform: translateY(100vh) rotate(calc(var(--rotacao-inicial) + 540deg)) scale(0); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
