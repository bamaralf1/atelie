'use client';

import { useEffect, useRef, useCallback, useState } from 'react';

export function useAutoSave(
  salvar: () => Promise<void>,
  dependencias: any[],
  intervalo: number = 3000
) {
  const [salvando, setSalvando] = useState(false);
  const [ultimoSalvo, setUltimoSalvo] = useState<Date | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendenteRef = useRef(false);

  const agendar = useCallback(() => {
    pendenteRef.current = true;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      if (!pendenteRef.current) return;
      setSalvando(true);
      try {
        await salvar();
        setUltimoSalvo(new Date());
      } finally {
        setSalvando(false);
        pendenteRef.current = false;
      }
    }, intervalo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencias);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return { agendar, salvando, ultimoSalvo };
}
