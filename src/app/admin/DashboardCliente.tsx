'use client';

import { useState } from 'react';
import { Obra, EstatisticasDashboard, StatusObra } from '@/lib/types';
import { GraficosDashboard } from '@/components/admin/GraficosDashboard';
import { KanbanBoard } from '@/components/admin/KanbanBoard';
import { atualizarStatusKanbanAction } from './kanbanActions';
import { useToast } from '@/components/ui/Toast';
import { exportarObrasExcel } from '@/lib/exportar';

type Visao = 'grade' | 'kanban';

export function DashboardCliente({ obras, stats }: { obras: Obra[]; stats: EstatisticasDashboard }) {
  const [visao, setVisao] = useState<Visao>('grade');
  const [obrasState, setObrasState] = useState(obras);
  const { adicionar } = useToast();

  async function handleStatusChange(obraId: string, novoStatus: StatusObra) {
    const resultado = await atualizarStatusKanbanAction(obraId, novoStatus);
    if (resultado.erro) {
      adicionar(`Erro ao mover: ${resultado.erro}`, 'erro');
    } else {
      setObrasState((prev) =>
        prev.map((o) => (o.id === obraId ? { ...o, status_atual: novoStatus } : o))
      );
      adicionar('Status atualizado com sucesso!', 'sucesso');
    }
  }

  return (
    <div className="space-y-6 mb-8">
      {/* Botões de ação */}
      <div className="card-glass-darker p-2 flex items-center justify-between animate-fadeInUp">
        <div className="flex gap-1 bg-black/30 rounded-lg p-0.5">
          <button
            onClick={() => setVisao('grade')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              visao === 'grade'
                ? 'bg-atelie-dourado/20 text-atelie-douradoClaro shadow-sm'
                : 'text-atelie-textoMuted hover:text-atelie-texto'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              Grade
            </span>
          </button>
          <button
            onClick={() => setVisao('kanban')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              visao === 'kanban'
                ? 'bg-atelie-dourado/20 text-atelie-douradoClaro shadow-sm'
                : 'text-atelie-textoMuted hover:text-atelie-texto'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
              </svg>
              Kanban
            </span>
          </button>
        </div>

        <button
          onClick={() => exportarObrasExcel(obrasState)}
          className="btn-outline px-3 py-1.5 text-xs"
        >
          <span className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Exportar Excel
          </span>
        </button>
      </div>

      {/* Gráficos */}
      <GraficosDashboard obras={obrasState} stats={stats} />

      {/* Kanban */}
      {visao === 'kanban' && (
        <div className="card-glass-darker p-5 animate-fadeIn">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-4 rounded-full bg-gradient-to-b from-atelie-dourado to-atelie-douradoClaro" />
            <p className="text-[10px] uppercase tracking-[0.15em] text-atelie-textoMuted/60 font-semibold">
              Arraste os cartões para alterar o status
            </p>
          </div>
          <KanbanBoard obras={obrasState} onStatusChange={handleStatusChange} />
        </div>
      )}
    </div>
  );
}
