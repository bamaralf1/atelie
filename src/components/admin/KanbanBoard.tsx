'use client';

import { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Obra, STATUS_OPCOES, StatusObra } from '@/lib/types';
import { corStatusDot, formatarMoeda, formatarDiasRestantes } from '@/lib/utils';
import { ProgressBar } from './ProgressBar';
import Link from 'next/link';

interface KanbanBoardProps {
  obras: Obra[];
  onStatusChange: (obraId: string, novoStatus: StatusObra) => Promise<void>;
}

const CORES_COLUNA: Record<string, string> = {
  'Esboço': 'border-t-zinc-500',
  'Imprimatura': 'border-t-atelie-terracota',
  'Pintura em andamento': 'border-t-atelie-dourado',
  'Retoques finais': 'border-t-atelie-douradoClaro',
  'Verniz final': 'border-t-atelie-terracotaClaro',
  'Concluída': 'border-t-emerald-500',
};

export function KanbanBoard({ obras, onStatusChange }: KanbanBoardProps) {
  const [movendo, setMovendo] = useState<string | null>(null);

  async function handleDragEnd(result: DropResult) {
    const { draggableId, destination } = result;
    if (!destination) return;

    const novoStatus = STATUS_OPCOES[destination.droppableId as unknown as number] as StatusObra;
    if (!novoStatus) return;

    setMovendo(draggableId);
    try {
      await onStatusChange(draggableId, novoStatus);
    } finally {
      setMovendo(null);
    }
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 min-h-[60vh]">
        {STATUS_OPCOES.map((status, index) => {
          const obrasColuna = obras.filter((o) => o.status_atual === status);
          const corBorda = CORES_COLUNA[status] ?? 'border-t-zinc-500';

          return (
            <Droppable droppableId={String(index)} key={status}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`bg-atelie-superficie/50 border border-atelie-borda rounded-lg border-t-2 ${corBorda} transition-colors ${
                    snapshot.isDraggingOver ? 'bg-atelie-dourado/5 border-atelie-dourado/40' : ''
                  }`}
                >
                  <div className="px-3 py-2 border-b border-atelie-borda flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${corStatusDot(status)}`} />
                      <span className="text-xs font-medium text-atelie-texto">{status}</span>
                    </div>
                    <span className="text-[10px] text-atelie-textoMuted font-mono bg-atelie-superficie2 px-1.5 py-0.5 rounded">
                      {obrasColuna.length}
                    </span>
                  </div>

                  <div className="p-2 space-y-2 max-h-[65vh] overflow-y-auto">
                    {obrasColuna.length === 0 && (
                      <div className="text-center py-6">
                        <p className="text-[10px] text-atelie-textoMuted">Nenhuma obra</p>
                      </div>
                    )}
                    {obrasColuna.map((obra, idx) => (
                      <Draggable key={obra.id} draggableId={obra.id} index={idx} isDragDisabled={movendo === obra.id}>
                        {(provided, snapshot) => (
                          <Link
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            href={`/admin/obras/${obra.id}`}
                            className={`block bg-atelie-superficie border border-atelie-borda rounded-md p-3 hover:border-atelie-dourado/40 transition-all duration-200 group ${
                              snapshot.isDragging ? 'shadow-dourado-lg rotate-2' : ''
                            } ${movendo === obra.id ? 'opacity-50' : ''}`}
                            onClick={(e) => {
                              if (snapshot.isDragging) e.preventDefault();
                            }}
                          >
                            <p className="text-sm font-medium text-atelie-texto truncate mb-1">
                              {obra.titulo}
                            </p>
                            <p className="text-[10px] text-atelie-textoMuted truncate mb-2">
                              {obra.cliente_nome}
                            </p>
                            <ProgressBar percentual={obra.percentual_conclusao} />
                            <div className="flex justify-between items-center mt-1.5">
                              <span className="text-[10px] text-atelie-textoMuted">{obra.percentual_conclusao}%</span>
                              {obra.orcamento_total > 0 && (
                                <span className="text-[10px] font-mono text-atelie-douradoClaro">
                                  {formatarMoeda(obra.orcamento_total)}
                                </span>
                              )}
                            </div>
                          </Link>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
          );
        })}
      </div>
    </DragDropContext>
  );
}
