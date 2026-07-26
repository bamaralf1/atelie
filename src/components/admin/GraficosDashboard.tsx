'use client';

import { Obra, EstatisticasDashboard } from '@/lib/types';
import { formatarMoeda } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from 'recharts';

const CORES_GRAFICO = ['#C6A15B', '#D97B5E', '#E0C27E', '#B5563A', '#9A9086', '#34D399'];

export function GraficosDashboard({ obras, stats }: { obras: Obra[]; stats: EstatisticasDashboard }) {
  const dadosStatus = stats.porStatus.map((s) => ({
    name: s.status,
    value: s.quantidade,
    color: CORES_GRAFICO[['Esboço', 'Imprimatura', 'Pintura em andamento', 'Retoques finais', 'Verniz final', 'Concluída'].indexOf(s.status)] ?? '#9A9086',
  }));

  const dadosOrcamento = obras
    .filter((o) => o.orcamento_total > 0)
    .slice(0, 10)
    .map((o) => ({
      name: o.titulo.length > 15 ? o.titulo.slice(0, 15) + '…' : o.titulo,
      orcamento: o.orcamento_total,
      custo: o.custo_materiais,
      receita: o.orcamento_total - o.custo_materiais,
    }));

  const dadosConclusao = obras
    .slice(0, 10)
    .map((o) => ({
      name: o.titulo.length > 12 ? o.titulo.slice(0, 12) + '…' : o.titulo,
      percentual: o.percentual_conclusao,
    }));

  const margemMedia = stats.receitaTotal > 0
    ? ((stats.receitaTotal - stats.custoTotal) / stats.receitaTotal * 100).toFixed(1)
    : '0';

  const TooltipCustom = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-atelie-superficie border border-atelie-borda rounded-lg px-3 py-2 shadow-lg text-xs">
        <p className="text-atelie-textoMuted mb-1">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color }} className="font-mono">
            {p.name}: {typeof p.value === 'number' && p.name.toLowerCase().includes('percentual') ? `${p.value}%` : formatarMoeda(p.value)}
          </p>
        ))}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
      {/* Receita vs Custo */}
      {dadosOrcamento.length > 0 && (
        <div className="bg-atelie-superficie border border-atelie-borda rounded-lg p-5">
          <p className="text-xs uppercase tracking-wide text-atelie-textoMuted mb-4">Top Obras — Receita vs Custo</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={dadosOrcamento} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="#332E24" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9A9086' }} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#9A9086' }} axisLine={false} tickFormatter={(v) => `R$${v.toFixed(0)}`} />
              <Tooltip content={<TooltipCustom />} />
              <Bar dataKey="custo" fill="#B5563A" radius={[3, 3, 0, 0]} name="Custo" />
              <Bar dataKey="receita" fill="#C6A15B" radius={[3, 3, 0, 0]} name="Receita" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Distribuição por status */}
      {dadosStatus.length > 0 && (
        <div className="bg-atelie-superficie border border-atelie-borda rounded-lg p-5">
          <p className="text-xs uppercase tracking-wide text-atelie-textoMuted mb-4">Distribuição por Status</p>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width="50%" height={180}>
              <PieChart>
                <Pie
                  data={dadosStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {dadosStatus.map((entry, i) => (
                    <Cell key={i} fill={entry.color} stroke="#0E0D0C" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip content={<TooltipCustom />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5">
              {dadosStatus.map((s) => (
                <div key={s.name} className="flex items-center gap-2 text-xs">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="text-atelie-textoMuted">{s.name}</span>
                  <span className="font-mono text-atelie-texto">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Percentual de conclusão */}
      {dadosConclusao.length > 0 && (
        <div className="bg-atelie-superficie border border-atelie-borda rounded-lg p-5">
          <p className="text-xs uppercase tracking-wide text-atelie-textoMuted mb-4">Conclusão por Obra</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={dadosConclusao} layout="vertical" barSize={14}>
              <CartesianGrid strokeDasharray="3 3" stroke="#332E24" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: '#9A9086' }} axisLine={false} tickFormatter={(v) => `${v}%`} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#9A9086' }} axisLine={false} width={100} />
              <Tooltip content={<TooltipCustom />} />
              <Bar dataKey="percentual" fill="#E0C27E" radius={[0, 3, 3, 0]} name="Percentual">
                {dadosConclusao.map((_, i) => (
                  <Cell key={i} fill={i < dadosConclusao.length / 2 ? '#C6A15B' : '#E0C27E'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Resumo financeiro */}
      <div className="bg-atelie-superficie border border-atelie-borda rounded-lg p-5">
        <p className="text-xs uppercase tracking-wide text-atelie-textoMuted mb-4">Resumo Financeiro</p>
        <div className="space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-atelie-borda">
            <span className="text-sm text-atelie-textoMuted">Receita total</span>
            <span className="font-display text-xl text-atelie-douradoClaro">{formatarMoeda(stats.receitaTotal)}</span>
          </div>
          <div className="flex justify-between items-center pb-3 border-b border-atelie-borda">
            <span className="text-sm text-atelie-textoMuted">Custo total</span>
            <span className="font-display text-xl text-atelie-terracotaClaro">{formatarMoeda(stats.custoTotal)}</span>
          </div>
          <div className="flex justify-between items-center pb-3 border-b border-atelie-borda">
            <span className="text-sm text-atelie-textoMuted">Margem média</span>
            <span className={`font-display text-xl ${parseFloat(margemMedia) >= 0 ? 'text-emerald-400' : 'text-atelie-terracotaClaro'}`}>
              {margemMedia}%
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-atelie-textoMuted">Lucro líquido</span>
            <span className="font-display text-xl text-atelie-douradoClaro">
              {formatarMoeda(stats.receitaTotal - stats.custoTotal)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
