import { notFound } from 'next/navigation';
import { criarClientServidor } from '@/lib/supabase/server';
import { ClienteView } from './ClienteView';
import { Obra, Material, HistoricoStatus, FotoProgresso } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function AcompanharObraPage({ params }: { params: { token: string } }) {
  const supabase = criarClientServidor();

  const { data: obra } = await supabase
    .from('obras')
    .select('*')
    .eq('token_acesso', params.token)
    .single();

  if (!obra) notFound();

  const [{ data: materiais }, { data: historico }, { data: fotos }, { data: comentarios }] = await Promise.all([
    supabase.from('materiais').select('*').eq('obra_id', obra.id).order('created_at', { ascending: false }),
    supabase.from('historico_status').select('*').eq('obra_id', obra.id).order('data_mudanca', { ascending: true }),
    supabase.from('fotos_progresso').select('*').eq('obra_id', obra.id).order('data_upload', { ascending: false }),
    supabase.from('comentarios').select('*').eq('obra_id', obra.id).order('criado_em', { ascending: true }),
  ]);

  return (
    <ClienteView
      obraInicial={obra as Obra}
      materiaisIniciais={(materiais as Material[]) ?? []}
      historicoInicial={(historico as HistoricoStatus[]) ?? []}
      fotosIniciais={(fotos as FotoProgresso[]) ?? []}
      comentariosIniciais={(comentarios as { id: string; obra_id: string; autor: string; texto: string; criado_em: string }[]) ?? []}
    />
  );
}
