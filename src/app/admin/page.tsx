import { criarClientAdmin } from '@/lib/supabase/admin';
import { Obra, EstatisticasDashboard } from '@/lib/types';
import { formatarMoeda } from '@/lib/utils';
import { DashboardCliente } from './DashboardCliente';
import { GridObras } from './GridObras';

export const dynamic = 'force-dynamic';

async function carregarObras() {
  const supabase = criarClientAdmin();
  const { data: obras, error } = await supabase
    .from('obras')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return { obras: null, error };
  return { obras: obras as Obra[], error: null };
}

function calcularEstatisticas(obras: Obra[]): EstatisticasDashboard {
  const total = obras.length;
  const emAndamento = obras.filter((o) => o.status_atual !== 'Concluída').length;
  const concluidas = obras.filter((o) => o.status_atual === 'Concluída').length;
  const receitaTotal = obras.reduce((s, o) => s + o.orcamento_total, 0);
  const custoTotal = obras.reduce((s, o) => s + o.custo_materiais, 0);

  const porStatusMap = new Map<string, number>();
  for (const o of obras) {
    porStatusMap.set(o.status_atual, (porStatusMap.get(o.status_atual) || 0) + 1);
  }
  const porStatus = Array.from(porStatusMap.entries()).map(([status, quantidade]) => ({ status, quantidade }));

  return { total, emAndamento, concluidas, receitaTotal, custoTotal, porStatus };
}

export default async function DashboardAdmin() {
  const { obras, error } = await carregarObras();

  if (error) {
    return (
      <div className="text-atelie-terracotaClaro">Erro ao carregar obras: {error.message}</div>
    );
  }

  const stats = obras ? calcularEstatisticas(obras) : null;
  const margemMedia = stats && stats.receitaTotal > 0
    ? ((stats.receitaTotal - stats.custoTotal) / stats.receitaTotal) * 100
    : 0;

  return (
    <div>
        {/* Cabeçalho */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl mb-1">Suas obras</h1>
            <p className="text-atelie-textoMuted text-sm">
              {obras?.length ?? 0} obra{(obras?.length ?? 0) !== 1 ? 's' : ''} cadastrada{(obras?.length ?? 0) !== 1 ? 's' : ''}
              <span className="mx-2">·</span>
              <kbd className="px-1.5 py-0.5 bg-atelie-superficie2 border border-atelie-borda rounded text-[10px] font-mono text-atelie-textoMuted">?</kbd> atalhos
            </p>
          </div>
        </div>

        {/* Cards de estatísticas */}
        {stats && obras && obras.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-atelie-superficie border border-atelie-borda rounded-lg p-5 animate-fadeInUp relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-20 h-20 bg-atelie-dourado/5 rounded-bl-full transition-all group-hover:bg-atelie-dourado/10" />
              <p className="text-xs uppercase tracking-wide text-atelie-textoMuted mb-1">Total</p>
              <p className="font-display text-2xl text-atelie-texto">{stats.total}</p>
              <p className="text-xs text-atelie-textoMuted mt-1">
                {stats.emAndamento} em andamento · {stats.concluidas} concluídas
              </p>
            </div>
            <div className="bg-atelie-superficie border border-atelie-borda rounded-lg p-5 animate-fadeInUp [animation-delay:100ms] relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-20 h-20 bg-atelie-dourado/5 rounded-bl-full transition-all group-hover:bg-atelie-dourado/10" />
              <p className="text-xs uppercase tracking-wide text-atelie-textoMuted mb-1">Em andamento</p>
              <p className="font-display text-2xl text-atelie-douradoClaro">{stats.emAndamento}</p>
              <div className="mt-2 w-full h-1.5 bg-atelie-superficie2 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-atelie-dourado to-atelie-douradoClaro barra-progresso"
                  style={{ width: `${stats.total > 0 ? (stats.emAndamento / stats.total) * 100 : 0}%` }}
                />
              </div>
            </div>
            <div className="bg-atelie-superficie border border-atelie-borda rounded-lg p-5 animate-fadeInUp [animation-delay:200ms] relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/5 rounded-bl-full transition-all group-hover:bg-emerald-500/10" />
              <p className="text-xs uppercase tracking-wide text-atelie-textoMuted mb-1">Concluídas</p>
              <p className="font-display text-2xl text-emerald-300">{stats.concluidas}</p>
              <div className="mt-2 w-full h-1.5 bg-atelie-superficie2 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-500 barra-progresso"
                  style={{ width: `${stats.total > 0 ? (stats.concluidas / stats.total) * 100 : 0}%` }}
                />
              </div>
            </div>
            <div className="bg-atelie-superficie border border-atelie-borda rounded-lg p-5 animate-fadeInUp [animation-delay:300ms] relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-20 h-20 bg-atelie-dourado/5 rounded-bl-full transition-all group-hover:bg-atelie-dourado/10" />
              <p className="text-xs uppercase tracking-wide text-atelie-textoMuted mb-1">Receita total</p>
              <p className="font-display text-2xl text-atelie-douradoClaro">{formatarMoeda(stats.receitaTotal)}</p>
              <p className="text-xs text-atelie-textoMuted mt-1">
                Margem média: {margemMedia.toFixed(0)}%
              </p>
            </div>
          </div>
        )}

        {/* Dashboard interativo com gráficos */}
        {obras && obras.length > 0 && (
          <DashboardCliente obras={obras} stats={stats!} />
        )}

        {/* Grid de obras com filtro integrado */}
        {!obras || obras.length === 0 ? (
          <div className="border border-dashed border-atelie-borda rounded-lg py-16 text-center">
            <p className="text-atelie-textoMuted mb-4">Nenhuma obra cadastrada ainda.</p>
            <a href="/admin/nova-obra" className="inline-block btn-dourado px-5 py-2.5">
              Cadastrar primeira obra
            </a>
          </div>
        ) : (
          <GridObras obras={obras as Obra[]} />
        )}
      </div>
  );
}
