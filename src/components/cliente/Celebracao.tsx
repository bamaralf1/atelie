'use client';

import { useEffect, useState, useCallback } from 'react';

interface Particula {
  id: number;
  x: number;
  cor: string;
  tamanho: number;
  duracao: number;
  atraso: number;
}

const CORES = ['#C6A15B', '#E0C27E', '#D97B5E', '#34D399', '#FBBF24', '#F472B6'];

export function Celebracao({ ativo }: { ativo: boolean }) {
  const [particulas, setParticulas] = useState<Particula[]>([]);

  const gerar = useCallback(() => {
    const novas: Particula[] = [];
    for (let i = 0; i < 30; i++) {
      novas.push({
        id: i,
        x: Math.random() * 100,
        cor: CORES[Math.floor(Math.random() * CORES.length)],
        tamanho: 4 + Math.random() * 8,
        duracao: 1.5 + Math.random() * 2,
        atraso: Math.random() * 1.5,
      });
    }
    setParticulas(novas);
  }, []);

  useEffect(() => {
    if (ativo) {
      gerar();
      const t = setInterval(gerar, 5000);
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
          className="absolute top-0 rounded-full"
          style={{
            left: `${p.x}%`,
            width: p.tamanho,
            height: p.tamanho,
            backgroundColor: p.cor,
            animation: `confete ${p.duracao}s ease-out ${p.atraso}s both`,
          }}
        />
      ))}
      <style>{`
        @keyframes confete {
          0% { transform: translateY(-10px) rotate(0deg) scale(0); opacity: 1; }
          50% { opacity: 0.8; }
          100% { transform: translateY(100vh) rotate(720deg) scale(1); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
