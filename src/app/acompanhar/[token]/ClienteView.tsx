'use client';

import Image from 'next/image';
import { Obra, Material, HistoricoStatus, FotoProgresso } from '@/lib/types';
import { useRealtimeObra } from '@/hooks/useRealtimeObra';
import { useTempoDecorrido } from '@/hooks/useTempoDecorrido';
import { ProgressBar } from '@/components/admin/ProgressBar';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { Timeline } from '@/components/cliente/Timeline';
import { Lightbox } from '@/components/cliente/Lightbox';
import { PdfButton } from '@/components/cliente/PdfButton';
import { ComparacaoSlider } from '@/components/cliente/ComparacaoSlider';
import { formatarData, formatarMoeda, formatarDiasRestantes } from '@/lib/utils';

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

  const tempoAtualizacao = useTempoDecorrido(obra.updated_at);
  const diasInfo = formatarDiasRestantes(obra.estimativa_conclusao);
  const temComparacao = obra.imagem_referencia_url && obra.imagem_obra_atual_url;

  return (
    <div className="min-h-screen bg-atelie-fundo pb-16">
      {/* Toast de atualização */}
      {notificacao && (
        <div className="fixed top-4 right-4 z-50 bg-atelie-superficie border border-atelie-dourado/40 text-atelie-douradoClaro text-sm px-4 py-2.5 rounded-md shadow-lg animate-slideInRight">
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-atelie-dourado animate-pulseDot" />
            {notificacao}
          </span>
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
          <ProgressBar percentual={obra.percentual_conclusao} tamanho="grande" mostrarMarcadores />
          <div className="flex justify-between items-center mt-2">
            <p className="text-atelie-douradoClaro font-mono text-sm">{obra.percentual_conclusao}%</p>
            {diasInfo && (
              <p className={`text-xs ${diasInfo.classe}`}>
                {obra.status_atual === 'Concluída' ? 'Concluída' : `Previsão: ${formatarData(obra.estimativa_conclusao)} (${diasInfo.texto})`}
              </p>
            )}
          </div>
        </section>

        {/* Comparação: referência vs atual */}
        {temComparacao && (
          <section className="animate-fadeInUp [animation-delay:100ms]">
            <h2 className="font-display text-xl mb-3">Referência × Progresso</h2>
            <ComparacaoSlider
              imagemAntes={obra.imagem_referencia_url!}
              imagemDepois={obra.imagem_obra_atual_url!}
              labelAntes="Referência inicial"
              labelDepois="Progresso atual"
            />
          </section>
        )}

        {/* Foto da obra em destaque (se não tem comparação) */}
        {!temComparacao && obra.imagem_obra_atual_url && (
          <section className="animate-fadeInUp [animation-delay:100ms]">
            <h2 className="font-display text-xl mb-3">A obra hoje</h2>
            <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden border border-atelie-borda">
              <Image src={obra.imagem_obra_atual_url} alt={obra.titulo} fill className="object-cover" priority />
            </div>
          </section>
        )}

        {/* Galeria de fotos */}
        {fotos.length > 0 && (
          <section>
            <h2 className="font-display text-xl mb-3">Galeria de progresso</h2>
            <Lightbox fotos={fotos} />
          </section>
        )}

        {/* Imagem de referência (se não tem comparação) */}
        {!temComparacao && obra.imagem_referencia_url && (
          <section>
            <h2 className="font-display text-xl mb-3">Referência inicial</h2>
            <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden border border-atelie-borda">
              <Image src={obra.imagem_referencia_url} alt="Referência" fill className="object-cover" />
            </div>
          </section>
        )}

        {/* Linha do tempo */}
        <section>
          <h2 className="font-display text-xl mb-4">Linha do tempo</h2>
          <Timeline historico={historico} />
        </section>

        {/* Materiais e custos */}
        {obra.exibir_custos && (
          <section>
            <h2 className="font-display text-xl mb-3">Materiais utilizados</h2>
            <div className="bg-atelie-superficie border border-atelie-borda rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <tbody>
                  {materiais.map((m) => (
                    <tr key={m.id} className="border-b border-atelie-borda last:border-0 hover:bg-atelie-superficie2/30 transition-colors">
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

        {/* Observações */}
        {obra.observacoes && (
          <section>
            <h2 className="font-display text-xl mb-3">Observações do artista</h2>
            <div className="bg-atelie-superficie border border-atelie-borda rounded-lg p-5">
              <p className="text-atelie-textoMuted leading-relaxed whitespace-pre-line">{obra.observacoes}</p>
            </div>
          </section>
        )}

        {/* Ações */}
        <div className="flex justify-center gap-4 pt-4">
          <PdfButton obra={obra} materiais={materiais} historico={historico} />
        </div>
      </div>
    </div>
  );
}
