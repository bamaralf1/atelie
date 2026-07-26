import { criarClientAdmin } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

const OBRA_EXEMPLO = {
  titulo: 'Retrato em óleo — D. Maria',
  cliente_nome: 'Maria Silva',
  cliente_email: 'maria.silva@email.com',
  status_atual: 'Pintura em andamento' as const,
  percentual_conclusao: 45,
  orcamento_total: 4500,
  custo_materiais: 1200,
  descricao: 'Retrato em óleo sobre tela 60×80cm. Inspirado em fotografia de família dos anos 60. Tons terrosos e fundo neutro.',
  observacoes: 'Cliente prefere tons quentes. Referências enviadas por WhatsApp. Entregar com moldura clássica dourada.',
  exibir_custos: false,
  estimativa_conclusao: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
};

export async function GET() {
  try {
    const supabase = criarClientAdmin();
    const { data, error } = await supabase.from('obras').insert(OBRA_EXEMPLO).select().single();

    if (error) {
      return NextResponse.json({ erro: error.message }, { status: 500 });
    }

    return NextResponse.json({ obra: data });
  } catch (erro) {
    return NextResponse.json({ erro: String(erro) }, { status: 500 });
  }
}
