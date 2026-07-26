import { criarClientAdmin } from '@/lib/supabase/admin';
import { criarClientServidor } from '@/lib/supabase/server';
import { Obra, EstatisticasDashboard } from '@/lib/types';
import { formatarMoeda, formatarData, formatarDiasRestantes, tempoRelativo } from '@/lib/utils';
import { DashboardCliente } from './DashboardCliente';
import { GridObras } from './GridObras';

export const dynamic = 'force-dynamic';

async function semearObra() {
  const supabase = criarClientAdmin();
  const { data } = await supabase
    .from('obras')
    .insert({
      titulo: 'Retrato em óleo — D. Maria',
      cliente_nome: 'Maria Silva',
      cliente_email: 'maria.silva@email.com',
      status_atual: 'Pintura em andamento',
      percentual_conclusao: 45,
      orcamento_total: 4500,
      custo_materiais: 1200,
      descricao: 'Retrato em óleo sobre tela 60×80cm. Inspirado em fotografia de família dos anos 60. Tons terrosos e fundo neutro.',
      observacoes: 'Cliente prefere tons quentes. Referências enviadas por WhatsApp. Entregar com moldura clássica dourada.',
      exibir_custos: false,
      estimativa_conclusao: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
      token_acesso: crypto.randomUUID(),
    })
    .select()
    .single();
  return data as Obra | null;
}

async function carregarObras(): Promise<{ obras: Obra[] | null; error: Error | null }> {
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
  }

  if (error) return { obras: null, error };
  if (obras && obras.length === 0) {
    const seed = await semearObra();
    return { obras: seed ? [seed] : [], error: null };
  }
  return { obras: obras as Obra[], error: null };
}

function calcularEstatisticas(obras: Obra[]): EstatisticasDashboard {
  return {
    total: obras.length,
    emAndamento: obras.filter((o) => o.status_atual !== 'Concluída').length,
    concluidas: obras.filter((o) => o.status_atual === 'Concluída').length,
    receitaTotal: obras.reduce((s, o) => s + o.orcamento_total, 0),
    custoTotal: obras.reduce((s, o) => s + o.custo_materiais, 0),
    porStatus: Array.from(
      obras.reduce((map, o) => map.set(o.status_atual, (map.get(o.status_atual) || 0) + 1), new Map<string, number>())
    ).map(([status, quantidade]) => ({ status, quantidade })),
  };
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="max-w-md text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-atelie-terracota/20 flex items-center justify-center">
          <svg className="w-8 h-8 text-atelie-terracotaClaro" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01" />
          </svg>
        </div>
        <h2 className="font-display text-xl text-atelie-texto">Erro de conexão</h2>
        <p className="text-atelie-textoMuted text-sm">{message}</p>
        <div className="bg-black/30 rounded-lg p-4 text-left text-xs text-atelie-textoMuted space-y-1.5">
          <p>1. Vá em Vercel → Settings → Environment Variables</p>
          <p>2. Verifique <span className="text-atelie-dourado">SUPABASE_SERVICE_ROLE_KEY</span> e <span className="text-atelie-dourado">NEXT_PUBLIC_SUPABASE_URL</span></p>
        </div>
        <a href="/admin" className="btn-outline px-4 py-2 text-sm inline-block">Tentar novamente</a>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="border border-dashed border-atelie-borda rounded-xl py-20 text-center">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-atelie-dourado/10 flex items-center justify-center">
        <svg className="w-8 h-8 text-atelie-dourado/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
      <p className="font-display text-xl text-atelie-texto mb-1">Nenhuma obra cadastrada</p>
      <p className="text-atelie-textoMuted text-sm mb-6">Crie sua primeira obra para começar.</p>
      <div className="flex items-center justify-center gap-3 flex-wrap">
        <a href="/admin/nova-obra" className="btn-dourado px-6 py-2.5 inline-flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Cadastrar primeira obra
        </a>
      </div>
  );
}

export default async function DashboardAdmin() {
  const { obras, error } = await carregarObras();

  if (error) return <ErrorState message={error.message} />;
  if (!obras || obras.length === 0) return <EmptyState />;

  const stats = calcularEstatisticas(obras);
  const margemMedia = stats.receitaTotal > 0
    ? ((stats.receitaTotal - stats.custoTotal) / stats.receitaTotal * 100).toFixed(1)
    : '0';

  const obrasComPrazo = obras
    .filter((o) => o.estimativa_conclusao && o.status_atual !== 'Concluída')
    .sort((a, b) => new Date(a.estimativa_conclusao!).getTime() - new Date(b.estimativa_conclusao!).getTime());

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-atelie-texto">Suas obras</h1>
          <p className="text-atelie-textoMuted text-sm mt-1">
            {stats.total} obra{stats.total !== 1 ? 's' : ''} · {stats.emAndamento} em andamento · {stats.concluidas} concluída{stats.concluidas !== 1 ? 's' : ''}
          </p>
        </div>
        <a href="/admin/nova-obra" className="btn-dourado px-5 py-2.5 text-sm inline-flex items-center gap-2 shrink-0">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Nova obra
        </a>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-atelie-superficie border border-atelie-borda rounded-xl p-5">
          <p className="text-xs uppercase tracking-wide text-atelie-textoMuted mb-1">Total</p>
          <p className="font-display text-2xl text-atelie-texto">{stats.total}</p>
          <p className="text-xs text-atelie-textoMuted mt-1">{stats.emAndamento} andamento · {stats.concluidas} concluídas</p>
        </div>
        <div className="bg-atelie-superficie border border-atelie-borda rounded-xl p-5">
          <p className="text-xs uppercase tracking-wide text-atelie-textoMuted mb-1">Andamento</p>
          <p className="font-display text-2xl text-atelie-douradoClaro">{stats.emAndamento}</p>
          <div className="mt-2 w-full h-1.5 bg-atelie-superficie2 rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-atelie-dourado to-atelie-douradoClaro barra-progresso" style={{ width: `${(stats.emAndamento / stats.total) * 100}%` }} />
          </div>
        </div>
        <div className="bg-atelie-superficie border border-atelie-borda rounded-xl p-5">
          <p className="text-xs uppercase tracking-wide text-atelie-textoMuted mb-1">Concluídas</p>
          <p className="font-display text-2xl text-emerald-300">{stats.concluidas}</p>
          <div className="mt-2 w-full h-1.5 bg-atelie-superficie2 rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-emerald-500 barra-progresso" style={{ width: `${(stats.concluidas / stats.total) * 100}%` }} />
          </div>
        </div>
        <div className="bg-atelie-superficie border border-atelie-borda rounded-xl p-5">
          <p className="text-xs uppercase tracking-wide text-atelie-textoMuted mb-1">Receita</p>
          <p className="font-display text-2xl text-atelie-douradoClaro">{formatarMoeda(stats.receitaTotal)}</p>
          <p className="text-xs text-atelie-textoMuted mt-1">Margem: <span className={+margemMedia >= 50 ? 'text-emerald-300' : +margemMedia >= 30 ? 'text-atelie-douradoClaro' : 'text-atelie-terracotaClaro'}>{margemMedia}%</span></p>
        </div>
      </div>

      {/* Dashboard com gráficos + grade/kanban */}
      <DashboardCliente obras={obras} stats={stats} />

      {/* Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Prazos */}
        <div className="bg-atelie-superficie border border-atelie-borda rounded-xl p-5">
          <p className="text-xs uppercase tracking-wide text-atelie-textoMuted font-semibold mb-4">Próximos prazos</p>
          {obrasComPrazo.length > 0 ? (
            <div className="space-y-1">
              {obrasComPrazo.slice(0, 5).map((obra) => {
                const dias = formatarDiasRestantes(obra.estimativa_conclusao);
                return (
                  <a key={obra.id} href={`/admin/obras/${obra.id}`}
                    className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-atelie-superficie2/50 transition-colors group">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-atelie-texto truncate group-hover:text-atelie-douradoClaro">{obra.titulo}</p>
                      <p className="text-xs text-atelie-textoMuted truncate">{obra.cliente_nome}</p>
                    </div>
                    <span className={`text-xs shrink-0 ml-3 ${dias?.classe}`}>{dias?.texto ?? formatarData(obra.estimativa_conclusao)}</span>
                  </a>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-atelie-textoMuted py-8 text-center">Nenhum prazo definido.</p>
          )}
        </div>

        {/* Atividades */}
        <div className="bg-atelie-superficie border border-atelie-borda rounded-xl p-5">
          <p className="text-xs uppercase tracking-wide text-atelie-textoMuted font-semibold mb-4">Atualizações recentes</p>
          <div className="space-y-1">
            {[...obras].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()).slice(0, 5).map((obra) => (
              <a key={obra.id} href={`/admin/obras/${obra.id}`}
                className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-atelie-superficie2/50 transition-colors group">
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-atelie-texto truncate group-hover:text-atelie-douradoClaro">{obra.titulo}</p>
                  <p className="text-xs text-atelie-textoMuted">{obra.cliente_nome} · {obra.status_atual}</p>
                </div>
                <span className="text-xs text-atelie-textoMuted shrink-0 ml-3">{tempoRelativo(obra.updated_at)}</span>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <GridObras obras={obras} />
    </div>
  );
}
