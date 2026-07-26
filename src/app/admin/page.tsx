import { criarClientAdmin } from '@/lib/supabase/admin';
import { ObraCard } from '@/components/admin/ObraCard';
import { Obra, EstatisticasDashboard } from '@/lib/types';
import { FiltroObras } from './FiltroObras';
import { formatarMoeda } from '@/lib/utils';

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
          </p>
        </div>
      </div>

      {/* Cards de estatísticas */}
      {stats && obras && obras.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-atelie-superficie border border-atelie-borda rounded-lg p-5 animate-fadeInUp">
            <p className="text-xs uppercase tracking-wide text-atelie-textoMuted mb-1">Total</p>
            <p className="font-display text-2xl text-atelie-texto">{stats.total}</p>
            <p className="text-xs text-atelie-textoMuted mt-1">
              {stats.emAndamento} em andamento · {stats.concluidas} concluídas
            </p>
          </div>
          <div className="bg-atelie-superficie border border-atelie-borda rounded-lg p-5 animate-fadeInUp [animation-delay:100ms]">
            <p className="text-xs uppercase tracking-wide text-atelie-textoMuted mb-1">Em andamento</p>
            <p className="font-display text-2xl text-atelie-douradoClaro">{stats.emAndamento}</p>
            <div className="mt-2 w-full h-1.5 bg-atelie-superficie2 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-atelie-dourado to-atelie-douradoClaro barra-progresso"
                style={{ width: `${stats.total > 0 ? (stats.emAndamento / stats.total) * 100 : 0}%` }}
              />
            </div>
          </div>
          <div className="bg-atelie-superficie border border-atelie-borda rounded-lg p-5 animate-fadeInUp [animation-delay:200ms]">
            <p className="text-xs uppercase tracking-wide text-atelie-textoMuted mb-1">Concluídas</p>
            <p className="font-display text-2xl text-emerald-300">{stats.concluidas}</p>
            <div className="mt-2 w-full h-1.5 bg-atelie-superficie2 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-500 barra-progresso"
                style={{ width: `${stats.total > 0 ? (stats.concluidas / stats.total) * 100 : 0}%` }}
              />
            </div>
          </div>
          <div className="bg-atelie-superficie border border-atelie-borda rounded-lg p-5 animate-fadeInUp [animation-delay:300ms]">
            <p className="text-xs uppercase tracking-wide text-atelie-textoMuted mb-1">Receita total</p>
            <p className="font-display text-2xl text-atelie-douradoClaro">{formatarMoeda(stats.receitaTotal)}</p>
            <p className="text-xs text-atelie-textoMuted mt-1">
              Margem média: {margemMedia.toFixed(0)}%
            </p>
          </div>
        </div>
      )}

      {/* Distribuição por status */}
      {stats && stats.porStatus.length > 1 && (
        <div className="bg-atelie-superficie border border-atelie-borda rounded-lg p-5 mb-8 animate-fadeInUp [animation-delay:350ms]">
          <p className="text-xs uppercase tracking-wide text-atelie-textoMuted mb-3">Distribuição por status</p>
          <div className="flex h-2 rounded-full overflow-hidden bg-atelie-superficie2">
            {(() => {
              const cores: Record<string, string> = {
                'Esboço': 'bg-zinc-500',
                'Imprimatura': 'bg-atelie-terracota',
                'Pintura em andamento': 'bg-atelie-dourado',
                'Retoques finais': 'bg-atelie-douradoClaro',
                'Verniz final': 'bg-atelie-terracotaClaro',
                'Concluída': 'bg-emerald-500',
              };
              return stats.porStatus.map((s) => (
                <div
                  key={s.status}
                  className={`${cores[s.status] ?? 'bg-zinc-500'} barra-progresso`}
                  style={{ width: `${(s.quantidade / stats.total) * 100}%` }}
                  title={`${s.status}: ${s.quantidade}`}
                />
              ));
            })()}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
            {stats.porStatus.map((s) => {
              const corMap: Record<string, string> = {
                'Esboço': 'bg-zinc-500',
                'Imprimatura': 'bg-atelie-terracota',
                'Pintura em andamento': 'bg-atelie-dourado',
                'Retoques finais': 'bg-atelie-douradoClaro',
                'Verniz final': 'bg-atelie-terracotaClaro',
                'Concluída': 'bg-emerald-500',
              };
              return (
                <div key={s.status} className="flex items-center gap-1.5 text-xs text-atelie-textoMuted">
                  <span className={`w-2 h-2 rounded-full ${corMap[s.status] ?? 'bg-zinc-500'}`} />
                  {s.status} ({s.quantidade})
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filtro e busca */}
      {obras && obras.length > 0 && (
        <FiltroObras />
      )}

      {/* Grid de obras */}
      {!obras || obras.length === 0 ? (
        <div className="border border-dashed border-atelie-borda rounded-lg py-16 text-center">
          <p className="text-atelie-textoMuted mb-4">Nenhuma obra cadastrada ainda.</p>
          <a
            href="/admin/nova-obra"
            className="inline-block btn-dourado px-5 py-2.5"
          >
            Cadastrar primeira obra
          </a>
        </div>
      ) : (
        <div
          id="grid-obras"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {(obras as Obra[]).map((obra) => (
            <ObraCard key={obra.id} obra={obra} />
          ))}
        </div>
      )}
    </div>
  );
}
