import { criarClientAdmin } from '@/lib/supabase/admin';
import { criarClientServidor } from '@/lib/supabase/server';
import { Obra, EstatisticasDashboard } from '@/lib/types';
import { formatarMoeda } from '@/lib/utils';
import { DashboardCliente } from './DashboardCliente';
import { GridObras } from './GridObras';

export const dynamic = 'force-dynamic';

async function carregarObras() {
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
    if (!error) {
      console.warn('[ATELIE] Usando anon key como fallback. Configure SUPABASE_SERVICE_ROLE_KEY na Vercel.');
    }
  }

  if (error) return { obras: null, error, usandoFallback: false };
  return { obras: obras as Obra[], error: null, usandoFallback: false };
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
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="card-glass max-w-lg w-full p-8 text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-full bg-atelie-terracota/20 flex items-center justify-center">
            <svg className="w-7 h-7 text-atelie-terracotaClaro" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="font-display text-xl text-atelie-texto">Erro de conexão com o banco</h2>
          <p className="text-atelie-textoMuted text-sm">{error.message}</p>
          <div className="divider-gold" />
          <div className="text-left bg-black/30 rounded-lg p-4 text-xs text-atelie-textoMuted space-y-1.5 font-mono">
            <p>1. Abra o Vercel Dashboard → Settings → Environment Variables</p>
            <p>2. Verifique se <span className="text-atelie-douradoClaro">SUPABASE_SERVICE_ROLE_KEY</span> está configurada</p>
            <p>3. Verifique se <span className="text-atelie-douradoClaro">NEXT_PUBLIC_SUPABASE_URL</span> está correta</p>
            <p>4. Faça um novo deploy após configurar</p>
          </div>
          <div className="flex gap-2 justify-center">
            <a href="/admin" className="btn-outline px-4 py-2 text-sm">Tentar novamente</a>
            <a href="/admin/nova-obra" className="btn-dourado px-4 py-2 text-sm">Nova obra</a>
          </div>
        </div>
      </div>
    );
  }

  const stats = obras ? calcularEstatisticas(obras) : null;
  const margemMedia = stats && stats.receitaTotal > 0
    ? ((stats.receitaTotal - stats.custoTotal) / stats.receitaTotal) * 100
    : 0;

  return (
    <div>
      {/* Hero section */}
      <div className="relative mb-10">
        <div className="absolute -top-8 -left-8 w-64 h-64 bg-atelie-dourado/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-8 -right-8 w-48 h-48 bg-atelie-terracota/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative">
          <div className="flex items-end justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-1 h-6 rounded-full bg-gradient-to-b from-atelie-dourado to-atelie-douradoClaro" />
                <p className="text-[11px] uppercase tracking-[0.2em] text-atelie-douradoClaro/70 font-semibold">
                  Painel do Artista
                </p>
              </div>
              <h1 className="font-display text-4xl lg:text-5xl text-atelie-texto mb-2 text-glow">
                Suas{' '}
                <span className="bg-gradient-to-r from-atelie-dourado to-atelie-douradoClaro bg-clip-text text-transparent">
                  Obras
                </span>
              </h1>
              <p className="text-atelie-textoMuted text-sm flex items-center gap-2">
                <span>{obras?.length ?? 0} obra{(obras?.length ?? 0) !== 1 ? 's' : ''} cadastrada{(obras?.length ?? 0) !== 1 ? 's' : ''}</span>
                <span className="w-1 h-1 rounded-full bg-atelie-textoMuted/30" />
                <span>{stats?.emAndamento ?? 0} em andamento</span>
                <span className="w-1 h-1 rounded-full bg-atelie-textoMuted/30" />
                <span>{stats?.concluidas ?? 0} concluída{(stats?.concluidas ?? 0) !== 1 ? 's' : ''}</span>
                <kbd className="ml-2 px-1.5 py-0.5 bg-white/5 border border-white/10 rounded text-[10px] font-mono text-atelie-textoMuted">?</kbd>
              </p>
            </div>
            <a href="/admin/nova-obra" className="btn-dourado px-5 py-2.5 text-sm shrink-0">
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                Nova Obra
              </span>
            </a>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && obras && obras.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="card-glass p-6 animate-fadeInUp relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-atelie-dourado/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative">
              <p className="text-[10px] uppercase tracking-[0.15em] text-atelie-textoMuted/60 mb-0.5">Total de Obras</p>
              <p className="font-display text-3xl lg:text-4xl text-atelie-texto mb-1">{stats.total}</p>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-atelie-dourado/50 animate-pulseDot" />
                <p className="text-[11px] text-atelie-textoMuted">{stats.emAndamento} andamento · {stats.concluidas} concluídas</p>
              </div>
            </div>
          </div>

          <div className="card-glass p-6 animate-fadeInUp [animation-delay:80ms] relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-atelie-dourado/[0.05] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative">
              <p className="text-[10px] uppercase tracking-[0.15em] text-atelie-textoMuted/60 mb-0.5">Em Andamento</p>
              <p className="font-display text-3xl lg:text-4xl text-atelie-douradoClaro mb-1">{stats.emAndamento}</p>
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-atelie-dourado to-atelie-douradoClaro"
                  style={{ width: `${stats.total > 0 ? (stats.emAndamento / stats.total) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>

          <div className="card-glass p-6 animate-fadeInUp [animation-delay:160ms] relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.04] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative">
              <p className="text-[10px] uppercase tracking-[0.15em] text-atelie-textoMuted/60 mb-0.5">Concluídas</p>
              <p className="font-display text-3xl lg:text-4xl text-emerald-300 mb-1">{stats.concluidas}</p>
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-500"
                  style={{ width: `${stats.total > 0 ? (stats.concluidas / stats.total) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>

          <div className="card-glass p-6 animate-fadeInUp [animation-delay:240ms] relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-atelie-dourado/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative">
              <p className="text-[10px] uppercase tracking-[0.15em] text-atelie-textoMuted/60 mb-0.5">Receita Total</p>
              <p className="font-display text-2xl lg:text-3xl text-atelie-douradoClaro mb-1">{formatarMoeda(stats.receitaTotal)}</p>
              <p className="text-[11px] text-atelie-textoMuted">Margem média: <span className={margemMedia >= 50 ? 'text-emerald-300' : margemMedia >= 30 ? 'text-atelie-douradoClaro' : 'text-atelie-terracotaClaro'}>{margemMedia.toFixed(0)}%</span></p>
            </div>
          </div>
        </div>
      )}

      {/* Dashboard interativo com gráficos e grade/kanban */}
      {obras && obras.length > 0 && (
        <DashboardCliente obras={obras} stats={stats!} />
      )}

      {/* Grid de obras ou empty state */}
      {!obras || obras.length === 0 ? (
        <div className="card-glass py-20 text-center relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-atelie-dourado/3 rounded-full blur-3xl pointer-events-none" />
          <div className="relative">
            <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-atelie-dourado/10 border border-atelie-dourado/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-atelie-dourado/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="font-display text-xl text-atelie-texto mb-1">Nenhuma obra cadastrada</p>
            <p className="text-atelie-textoMuted text-sm mb-6">Comece cadastrando sua primeira obra no ateliê.</p>
            <a href="/admin/nova-obra" className="btn-dourado px-6 py-2.5 inline-flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              Cadastrar primeira obra
            </a>
          </div>
        </div>
      ) : (
        <GridObras obras={obras as Obra[]} />
      )}
    </div>
  );
}
