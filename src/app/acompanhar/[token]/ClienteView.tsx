'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { Obra, Material, HistoricoStatus, FotoProgresso } from '@/lib/types';
import { useRealtimeObra } from '@/hooks/useRealtimeObra';
import { useTempoDecorrido } from '@/hooks/useTempoDecorrido';
import { ProgressBar } from '@/components/admin/ProgressBar';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { Timeline } from '@/components/cliente/Timeline';
import { Lightbox } from '@/components/cliente/Lightbox';
import { ProgressoEntrega } from '@/components/cliente/ProgressoEntrega';
import { VisorImagem, ItemVisor } from '@/components/cliente/VisorImagem';
import { PdfButton } from '@/components/cliente/PdfButton';
import { formatarData, formatarMoeda } from '@/lib/utils';

export function ClienteView({
  obraInicial,
  materiaisIniciais,
  historicoInicial,
  fotosIniciais,
}: {
  obraInicial: Obra;
  materiaisIniciais: Material[];
  historicoInicial: HistoricoStatus[];
  fotosIniciais: FotoProgresso[];
}) {
  const { obra, materiais, historico, fotos, notificacao } = useRealtimeObra({
    obra: obraInicial,
    materiais: materiaisIniciais,
    historico: historicoInicial,
    fotos: fotosIniciais,
  });

  const [visor, setVisor] = useState<{ itens: ItemVisor[]; indice: number } | null>(null);

  const tempoAtualizacao = useTempoDecorrido(obra.updated_at);

  // Todas as imagens (destaque, galeria e referência) reunidas em um único
  // conjunto: o cliente navega entre elas com o visualizador interativo.
  const itensVisor = useMemo<ItemVisor[]>(() => {
    const itens: ItemVisor[] = [];
    if (obra.imagem_obra_atual_url) {
      itens.push({
        id: 'principal',
        src: obra.imagem_obra_atual_url,
        legenda: 'A obra hoje',
        etapa: obra.status_atual,
        data: obra.updated_at,
      });
    }
    for (const f of fotos) {
      itens.push({ id: `foto-${f.id}`, src: f.url_foto, legenda: f.legenda, etapa: f.etapa, data: f.data_upload });
    }
    if (obra.imagem_referencia_url) {
      itens.push({ id: 'referencia', src: obra.imagem_referencia_url, legenda: 'Referência inicial', etapa: 'Referência' });
    }
    return itens;
  }, [obra.imagem_obra_atual_url, obra.imagem_referencia_url, obra.status_atual, obra.updated_at, fotos]);

  function abrirVisor(indice: number) {
    if (itensVisor.length === 0) return;
    setVisor({ itens: itensVisor, indice: Math.max(0, Math.min(indice, itensVisor.length - 1)) });
  }

  const deslocamentoGaleria = obra.imagem_obra_atual_url ? 1 : 0;

  return (
    <div className="min-h-screen bg-atelie-fundo pb-16">
      {/* Toast discreto de atualização em tempo real */}
      {notificacao && (
        <div className="fixed top-4 right-4 z-50 bg-atelie-superficie border border-atelie-dourado/40 text-atelie-douradoClaro text-sm px-4 py-2.5 rounded-md shadow-lg animate-fadeInUp">
          {notificacao}
        </div>
      )}

      {/* Cabeçalho */}
      <header className="border-b border-atelie-borda">
        <div className="max-w-3xl mx-auto px-6 py-8 text-center">
          <p className="font-display italic text-atelie-dourado text-sm mb-2">Ateliê</p>
          <h1 className="font-display text-3xl sm:text-4xl mb-2">{obra.titulo}</h1>
          <p className="text-atelie-textoMuted text-sm">Acompanhamento exclusivo para {obra.cliente_nome}</p>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 mt-8 space-y-8">
        {/* Status atual */}
        <section className="bg-atelie-superficie border border-atelie-borda rounded-lg p-6 animate-fadeInUp">
          <div className="flex items-center justify-between mb-4">
            <StatusBadge status={obra.status_atual} />
            <span className="text-xs text-atelie-textoMuted">Atualizado {tempoAtualizacao}</span>
          </div>
          <ProgressBar percentual={obra.percentual_conclusao} tamanho="grande" />
          <p className="text-right text-atelie-douradoClaro font-mono text-sm mt-2">{obra.percentual_conclusao}%</p>
        </section>

        {/* Entrega */}
        <section className="bg-atelie-superficie border border-atelie-borda rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg">Entrega</h2>
            <span className="text-xs text-atelie-textoMuted">Etapas após a conclusão da pintura</span>
          </div>
          <ProgressoEntrega status={obra.entrega_status} />
        </section>

        {/* Foto da obra em destaque */}
        {obra.imagem_obra_atual_url && (
          <section>
            <h2 className="font-display text-xl mb-3">A obra hoje</h2>
            <button
              onClick={() => abrirVisor(0)}
              className="group relative block w-full aspect-[4/3] rounded-lg overflow-hidden border border-atelie-borda hover:border-atelie-dourado/60 transition-colors"
              aria-label="Ampliar foto da obra"
            >
              <Image src={obra.imagem_obra_atual_url} alt={obra.titulo} fill className="object-cover" priority />
              <span className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-colors">
                <span className="opacity-0 group-hover:opacity-100 text-atelie-douradoClaro text-sm border border-atelie-dourado/60 bg-atelie-fundo/80 px-3 py-1.5 rounded-md transition-opacity">
                  Clique para ampliar
                </span>
              </span>
            </button>
          </section>
        )}

        {/* Galeria de fotos de progresso */}
        {fotos.length > 0 && (
          <section>
            <h2 className="font-display text-xl mb-3">Galeria de progresso</h2>
            <Lightbox fotos={fotos} aoAbrir={(i) => abrirVisor(deslocamentoGaleria + i)} />
          </section>
        )}

        {/* Imagem de referência */}
        {obra.imagem_referencia_url && (
          <section>
            <h2 className="font-display text-xl mb-3">Referência inicial</h2>
            <button
              onClick={() => abrirVisor(itensVisor.length - 1)}
              className="group relative block w-full aspect-[4/3] rounded-lg overflow-hidden border border-atelie-borda hover:border-atelie-dourado/60 transition-colors"
              aria-label="Ampliar imagem de referência"
            >
              <Image src={obra.imagem_referencia_url} alt="Referência" fill className="object-cover" />
              <span className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-colors">
                <span className="opacity-0 group-hover:opacity-100 text-atelie-douradoClaro text-sm border border-atelie-dourado/60 bg-atelie-fundo/80 px-3 py-1.5 rounded-md transition-opacity">
                  Clique para ampliar
                </span>
              </span>
            </button>
          </section>
        )}

        {/* Linha do tempo */}
        <section>
          <h2 className="font-display text-xl mb-4">Linha do tempo</h2>
          <Timeline historico={historico} />
        </section>

        {/* Materiais e custos, se o artista optar por exibir */}
        {obra.exibir_custos && (
          <section>
            <h2 className="font-display text-xl mb-3">Materiais utilizados</h2>
            <div className="bg-atelie-superficie border border-atelie-borda rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <tbody>
                  {materiais.map((m) => (
                    <tr key={m.id} className="border-b border-atelie-borda last:border-0">
                      <td className="px-4 py-2">{m.nome}</td>
                      <td className="px-4 py-2 text-right text-atelie-textoMuted">{m.quantidade}x</td>
                      <td className="px-4 py-2 text-right font-mono text-atelie-douradoClaro">
                        {formatarMoeda(m.quantidade * m.custo_unitario)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="bg-atelie-superficie2 px-4 py-3 flex justify-between text-sm">
                <span className="text-atelie-textoMuted">Total investido em materiais</span>
                <span className="font-mono text-atelie-douradoClaro font-semibold">{formatarMoeda(obra.custo_materiais)}</span>
              </div>
            </div>
          </section>
        )}

        {/* Estimativa */}
        <section className="bg-atelie-superficie border border-atelie-borda rounded-lg p-6 flex items-center justify-between">
          <span className="text-atelie-textoMuted text-sm">Previsão de conclusão</span>
          <span className="font-display text-xl text-atelie-douradoClaro">{formatarData(obra.estimativa_conclusao)}</span>
        </section>

        {/* Observações do artista */}
        {obra.observacoes && (
          <section>
            <h2 className="font-display text-xl mb-3">Observações do artista</h2>
            <p className="text-atelie-textoMuted leading-relaxed whitespace-pre-line">{obra.observacoes}</p>
          </section>
        )}

        <div className="flex justify-center pt-4">
          <PdfButton obra={obra} materiais={materiais} historico={historico} />
        </div>
      </div>

      {/* Visualizador interativo de fotos */}
      {visor && <VisorImagem itens={visor.itens} indiceInicial={visor.indice} onFechar={() => setVisor(null)} />}
    </div>
  );
}
