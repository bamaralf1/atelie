'use client';

import { useEffect, useState } from 'react';
import { tempoRelativo } from '@/lib/utils';

/** Retorna string "há X minutos/horas" e a re-renderiza automaticamente a cada 30s. */
export function useTempoDecorrido(dataIso: string | null | undefined): string {
  const [texto, setTexto] = useState(() => (dataIso ? tempoRelativo(dataIso) : ''));

  useEffect(() => {
    if (!dataIso) return;
    setTexto(tempoRelativo(dataIso));
    const intervalo = setInterval(() => setTexto(tempoRelativo(dataIso)), 30_000);
    return () => clearInterval(intervalo);
  }, [dataIso]);

  return texto;
}
