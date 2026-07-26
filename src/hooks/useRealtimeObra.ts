'use client';

import { useEffect, useState, useCallback } from 'react';
import { criarClientBrowser } from '@/lib/supabase/client';
import { Obra, Material, HistoricoStatus, FotoProgresso } from '@/lib/types';

export interface Comentario {
  id: string;
  obra_id: string;
  autor: 'artista' | 'cliente';
  texto: string;
  criado_em: string;
}

interface DadosObraCompletos {
  obra: Obra;
  materiais: Material[];
  historico: HistoricoStatus[];
  fotos: FotoProgresso[];
  comentarios: Comentario[];
}

export function useRealtimeObra(dadosIniciais: DadosObraCompletos) {
  const [dados, setDados] = useState(dadosIniciais);
  const [notificacao, setNotificacao] = useState<string | null>(null);

  const recarregar = useCallback(async () => {
    const supabase = criarClientBrowser();
    const obraId = dados.obra.id;

    const [{ data: obra }, { data: materiais }, { data: historico }, { data: fotos }, { data: comentarios }] = await Promise.all([
      supabase.from('obras').select('*').eq('id', obraId).single(),
      supabase.from('materiais').select('*').eq('obra_id', obraId).order('created_at', { ascending: false }),
      supabase.from('historico_status').select('*').eq('obra_id', obraId).order('data_mudanca', { ascending: true }),
      supabase.from('fotos_progresso').select('*').eq('obra_id', obraId).order('data_upload', { ascending: false }),
      supabase.from('comentarios').select('*').eq('obra_id', obraId).order('criado_em', { ascending: true }),
    ]);

    if (obra) {
      setDados({
        obra: obra as Obra,
        materiais: (materiais as Material[]) ?? [],
        historico: (historico as HistoricoStatus[]) ?? [],
        fotos: (fotos as FotoProgresso[]) ?? [],
        comentarios: (comentarios as Comentario[]) ?? [],
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dados.obra.id]);

  useEffect(() => {
    const supabase = criarClientBrowser();
    const obraId = dadosIniciais.obra.id;

    const canal = supabase
      .channel(`obra-${obraId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'obras', filter: `id=eq.${obraId}` }, () => {
        setNotificacao('O artista atualizou esta obra.');
        recarregar();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'historico_status', filter: `obra_id=eq.${obraId}` }, () => {
        setNotificacao('Novo status registrado.');
        recarregar();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'fotos_progresso', filter: `obra_id=eq.${obraId}` }, () => {
        setNotificacao('Nova foto de progresso disponível.');
        recarregar();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'materiais', filter: `obra_id=eq.${obraId}` }, () => {
        recarregar();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comentarios', filter: `obra_id=eq.${obraId}` }, () => {
        recarregar();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(canal);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dadosIniciais.obra.id]);

  useEffect(() => {
    if (!notificacao) return;
    const t = setTimeout(() => setNotificacao(null), 5000);
    return () => clearTimeout(t);
  }, [notificacao]);

  return { ...dados, notificacao };
}
