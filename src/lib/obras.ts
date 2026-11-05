import { criarClientAdmin } from '@/lib/supabase/admin';
import { criarClientServidor } from '@/lib/supabase/server';
import { Obra } from '@/lib/types';

/**
 * Insere uma obra de exemplo quando o banco ainda está vazio,
 * para o painel não aparecer sem conteúdo no primeiro acesso.
 */
async function semearObra(): Promise<Obra | null> {
  const dados = {
    titulo: 'Retrato em óleo — D. Maria',
    cliente_nome: 'Maria Silva',
    cliente_email: 'maria.silva@email.com',
    status_atual: 'Pintura',
    percentual_conclusao: 45,
    orcamento_total: 4500,
    valor_recebido: 1500,
    desconto: 0,
    custo_materiais: 1200,
    descricao: 'Retrato em óleo sobre tela 60×80cm. Inspirado em fotografia de família dos anos 60. Tons terrosos e fundo neutro.',
    observacoes: 'Cliente prefere tons quentes. Referências enviadas por WhatsApp. Entregar com moldura clássica dourada.',
    exibir_custos: false,
    estimativa_conclusao: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
  };

  for (const criar of [criarClientAdmin, criarClientServidor]) {
    try {
      const supabase = criar();
      const { data } = await supabase
        .from('obras')
        .insert(dados)
        .select()
        .single();
      if (data) return data as Obra;
    } catch {
      continue;
    }
  }
  return null;
}

export type ResultadoObras = {
  obras: Obra[] | null;
  error: Error | null;
  /** De onde vieram os dados — útil para diagnóstico. */
  origem: 'service_role' | 'anon' | 'seed' | 'erro';
};

/**
 * Lê as obras do banco. Tenta a service role (ignora RLS) e, se falhar,
 * cai para a chave anônima.
 */
export async function carregarObras(): Promise<ResultadoObras> {
  let supabase = criarClientAdmin();
  let { data: obras, error } = await supabase
    .from('obras')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    supabase = criarClientServidor();
    const result = await supabase
      .from('obras')
      .select('*')
      .order('created_at', { ascending: false });
    obras = result.data;
    error = result.error;

    if (error) return { obras: null, error, origem: 'erro' };
    if (obras && obras.length === 0) {
      const seed = await semearObra();
      return { obras: seed ? [seed] : [], error: null, origem: 'seed' };
    }
    return { obras: obras as Obra[], error: null, origem: 'anon' };
  }

  if (obras && obras.length === 0) {
    const seed = await semearObra();
    return { obras: seed ? [seed] : [], error: null, origem: 'seed' };
  }

  return { obras: obras as Obra[], error: null, origem: 'service_role' };
}
