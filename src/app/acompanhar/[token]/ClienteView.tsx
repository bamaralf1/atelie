'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Obra, Material, HistoricoStatus, FotoProgresso, Comentario } from '@/lib/types';
import { useRealtimeObra } from '@/hooks/useRealtimeObra';
import { useTempoDecorrido } from '@/hooks/useTempoDecorrido';
import { ProgressBar } from '@/components/admin/ProgressBar';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { Timeline } from '@/components/cliente/Timeline';
import { Lightbox } from '@/components/cliente/Lightbox';
import { PdfButton } from '@/components/cliente/PdfButton';
import { ComparacaoSlider } from '@/components/cliente/ComparacaoSlider';
import { Celebracao } from '@/components/cliente/Celebracao';
import { Comentarios } from '@/components/cliente/Comentarios';
import { formatarData, formatarMoeda, formatarDiasRestantes, corStatusDot } from '@/lib/utils';

const SECOES = [
  { id: 'progresso', label: 'Progresso' },
  { id: 'comparacao', label: 'Comparação' },
  { id: 'galeria', label: 'Galeria' },
  { id: 'timeline', label: 'Linha do tempo' },
  { id: 'comentarios', label: 'Comentários' },
  { id: 'materiais', label: 'Materiais' },
  { id: 'observacoes', label: 'Observações' },
];

export function ClienteView({
  obraInicial,
  materiaisIniciais,
  historicoInicial,
  fotosIniciais,
  comentariosIniciais,
}: {
  obraInicial: Obra;
  materiaisIniciais: Material[];
  historicoInicial: HistoricoStatus[];
  fotosIniciais: FotoProgresso[];
  comentariosIniciais: Comentario[];
}) {
  const { obra, materiais, historico, fotos, comentarios, notificacao } = useRealtimeObra({
    obra: obraInicial,
    materiais: materiaisIniciais,
    historico: historicoInicial,
    fotos: fotosIniciais,
    comentarios: comentariosIniciais,
  });

  const tempoAtualizacao = useTempoDecorrido(obra.updated_at);
  const diasInfo = formatarDiasRestantes(obra.estimativa_conclusao);
  const temComparacao = obra.imagem_referencia_url && obra.imagem_obra_atual_url;
  const [secaoAtiva, setSecaoAtiva] = useState('progresso');
  const [mostrarNav, setMostrarNav] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setMostrarNav(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setSecaoAtiva(entry.target.id);
          }
        }
      },
      { rootMargin: '-40% 0px -55% 0px' }
    );
    SECOES.forEach(({ id }) => {
      const el = document.getElementById(`secao-${id}`);
      if (el) observerRef.current?.observe(el);
    });
    return () => observerRef.current?.disconnect();
  }, []);

  function scrollPara(id: string) {
    setSecaoAtiva(id);
    document.getElementById(`secao-${id}`)?.scrollIntoView({ behavior: 'smooth' });
  }

  const totalMateriais = materiais.reduce((s, m) => s + m.quantidade * m.custo_unitario, 0);
  const milestones = [
    { label: 'Esboço', min: 0 },
    { label: 'Imprimatura', min: 15 },
    { label: 'Pintura', min: 30 },
    { label: 'Retoques', min: 60 },
    { label: 'Verniz', min: 80 },
    { label: 'Concluída', min: 100 },
  ];

  return (
    <div className="min-h-screen bg-atelie-fundo">
      <Celebracao ativo={obra.percentual_conclusao >= 100} />

      {/* Toast de notificação */}
      {notificacao && (
        <div className="fixed top-4 right-4 z-50 bg-atelie-superficie border border-atelie-dourado/40 text-atelie-douradoClaro text-sm px-4 py-3 rounded-xl shadow-2xl animate-slideInRight backdrop-blur-md">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-atelie-dourado animate-pulseDot" />
            {notificacao}
          </span>
        </div>
      )}

      {/* Navegação sticky */}
      <nav className={`fixed top-0 inset-x-0 z-40 transition-all duration-500 ${mostrarNav ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
        <div className="bg-atelie-superficie/90 backdrop-blur-xl border-b border-atelie-borda">
          <div className="max-w-3xl mx-auto px-4 py-2 flex items-center gap-1 overflow-x-auto">
            {SECOES.map((s) => (
              <button
                key={s.id}
                onClick={() => scrollPara(s.id)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-full text-[11px] font-medium transition-all ${
                  secaoAtiva === s.id
                    ? 'bg-atelie-dourado/20 text-atelie-douradoClaro'
                    : 'text-atelie-textoMuted hover:text-atelie-texto'
                }`}
              >
                {s.label}
              </button>
            ))}
            <div className="ml-auto shrink-0">
              <PdfButton obra={obra} materiais={materiais} historico={historico} />
            </div>
          </div>
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <section
        ref={heroRef}
        className="relative min-h-[70vh] flex items-end justify-center pb-12 px-6"
      >
        {/* Background image */}
        {(obra.imagem_obra_atual_url || obra.imagem_referencia_url) && (
          <div className="absolute inset-0">
            <img
              src={obra.imagem_obra_atual_url || obra.imagem_referencia_url!}
              alt=""
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-atelie-fundo via-atelie-fundo/60 to-atelie-fundo/30" />
            <div className="absolute inset-0 bg-gradient-to-r from-atelie-fundo/40 to-transparent" />
          </div>
        )}

        <div className="relative text-center max-w-2xl">
          <p className="font-display italic text-atelie-dourado text-sm mb-3 tracking-widest uppercase">Atelier Bruno Amaral</p>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl mb-3 leading-tight text-atelie-texto drop-shadow-lg">
            {obra.titulo}
          </h1>
          <p className="text-atelie-textoMuted text-base mb-6">
            Acompanhamento exclusivo para <span className="text-atelie-texto font-medium">{obra.cliente_nome}</span>
          </p>

          <div className="flex items-center justify-center gap-3">
            <StatusBadge status={obra.status_atual} />
            <span className="text-xs text-atelie-textoMuted">Atualizado {tempoAtualizacao}</span>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 animate-bounce">
          <svg className="w-5 h-5 text-atelie-textoMuted/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* ===== CONTEÚDO ===== */}
      <div className="max-w-3xl mx-auto px-6 pb-20 space-y-16">

        {/* Seção: Progresso */}
        <section id="secao-progresso" className="scroll-mt-20 animate-fadeInUp">
          <div className="bg-atelie-superficie border border-atelie-borda rounded-2xl p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-2xl">Progresso</h2>
              <span className="text-3xl font-display text-atelie-douradoClaro">{obra.percentual_conclusao}%</span>
            </div>

            {/* Milestones */}
            <div className="relative mb-6">
              <div className="h-2 bg-atelie-superficie2 rounded-full overflow-hidden border border-atelie-borda">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-atelie-terracota via-atelie-dourado to-emerald-400 barra-progresso"
                  style={{ width: `${obra.percentual_conclusao}%` }}
                />
              </div>
              <div className="flex justify-between mt-2">
                {milestones.map((m, i) => {
                  const atingido = obra.percentual_conclusao >= m.min;
                  return (
                    <div key={m.label} className="flex flex-col items-center">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all duration-500 ${
                        atingido ? 'bg-atelie-dourado shadow-[0_0_8px_rgba(198,161,91,0.4)]' : 'bg-atelie-superficie2 border border-atelie-borda'
                      }`}>
                        {atingido ? (
                          <svg className="w-3 h-3 text-atelie-fundo" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <span className="text-[8px] text-atelie-textoMuted">{i + 1}</span>
                        )}
                      </div>
                      <span className={`text-[9px] mt-1 ${atingido ? 'text-atelie-douradoClaro font-medium' : 'text-atelie-textoMuted'}`}>
                        {m.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${corStatusDot(obra.status_atual)}`} />
                <span className="text-atelie-textoMuted">{obra.status_atual}</span>
              </div>
              {diasInfo && obra.status_atual !== 'Concluída' && (
                <span className={`text-xs ${diasInfo.classe}`}>{diasInfo.texto}</span>
              )}
              {obra.status_atual === 'Concluída' && (
                <span className="text-xs text-emerald-400 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Concluída
                </span>
              )}
            </div>
          </div>
        </section>

        {/* Seção: Comparação */}
        {temComparacao && (
          <section id="secao-comparacao" className="scroll-mt-20 animate-fadeInUp [animation-delay:100ms]">
            <h2 className="font-display text-2xl mb-4">Referência × Progresso</h2>
            <ComparacaoSlider
              imagemAntes={obra.imagem_referencia_url!}
              imagemDepois={obra.imagem_obra_atual_url!}
              labelAntes="Referência inicial"
              labelDepois="Progresso atual"
            />
          </section>
        )}

        {/* Seção: Foto destaque (se não tem comparação) */}
        {!temComparacao && obra.imagem_obra_atual_url && (
          <section className="animate-fadeInUp [animation-delay:100ms]">
            <h2 className="font-display text-2xl mb-4">A obra hoje</h2>
            <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden border border-atelie-borda">
              <Image src={obra.imagem_obra_atual_url} alt={obra.titulo} fill className="object-cover" priority />
            </div>
          </section>
        )}

        {/* Seção: Galeria */}
        {fotos.length > 0 && (
          <section id="secao-galeria" className="scroll-mt-20 animate-fadeInUp [animation-delay:150ms]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-2xl">Galeria de progresso</h2>
              <span className="text-xs text-atelie-textoMuted">{fotos.length} foto{fotos.length !== 1 ? 's' : ''}</span>
            </div>
            <Lightbox fotos={fotos} />
          </section>
        )}

        {/* Seção: Referência isolada */}
        {!temComparacao && !obra.imagem_obra_atual_url && obra.imagem_referencia_url && (
          <section className="animate-fadeInUp">
            <h2 className="font-display text-2xl mb-4">Referência inicial</h2>
            <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden border border-atelie-borda">
              <Image src={obra.imagem_referencia_url} alt="Referência" fill className="object-cover" />
            </div>
          </section>
        )}

        {/* Seção: Timeline */}
        <section id="secao-timeline" className="scroll-mt-20 animate-fadeInUp [animation-delay:200ms]">
          <h2 className="font-display text-2xl mb-4">Linha do tempo</h2>
          <Timeline historico={historico} fotos={fotos} />
        </section>

        {/* Seção: Comentários */}
        <section id="secao-comentarios" className="scroll-mt-20 animate-fadeInUp [animation-delay:225ms]">
          <div className="bg-atelie-superficie border border-atelie-borda rounded-2xl p-6 sm:p-8">
            <h2 className="font-display text-2xl mb-2">Comentários</h2>
            <p className="text-sm text-atelie-textoMuted mb-6">Tire dúvidas ou deixe um feedback sobre a obra.</p>
            <Comentarios
              token={obra.token_acesso}
              obraId={obra.id}
              comentariosIniciais={comentarios}
            />
          </div>
        </section>

        {/* Seção: Materiais */}
        {obra.exibir_custos && (
          <section id="secao-materiais" className="scroll-mt-20 animate-fadeInUp [animation-delay:250ms]">
            <h2 className="font-display text-2xl mb-4">Materiais utilizados</h2>
            <div className="bg-atelie-superficie border border-atelie-borda rounded-2xl overflow-hidden">
              <div className="divide-y divide-atelie-borda">
                {materiais.map((m) => (
                  <div key={m.id} className="flex items-center justify-between px-5 py-3 hover:bg-atelie-superficie2/30 transition-colors">
                    <div>
                      <p className="text-sm text-atelie-texto">{m.nome}</p>
                      <p className="text-[11px] text-atelie-textoMuted">{m.quantidade}x {formatarMoeda(m.custo_unitario)} cada</p>
                    </div>
                    <span className="font-mono text-sm text-atelie-douradoClaro">{formatarMoeda(m.quantidade * m.custo_unitario)}</span>
                  </div>
                ))}
              </div>
              <div className="bg-atelie-superficie2 px-5 py-4 flex items-center justify-between">
                <span className="text-sm text-atelie-textoMuted">Total investido em materiais</span>
                <span className="font-mono text-lg text-atelie-douradoClaro font-semibold">{formatarMoeda(totalMateriais)}</span>
              </div>
            </div>
          </section>
        )}

        {/* Estimativa */}
        {obra.estimativa_conclusao && (
          <section className="animate-fadeInUp [animation-delay:300ms]">
            <div className="bg-atelie-superficie border border-atelie-borda rounded-2xl p-6 sm:p-8 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-atelie-textoMuted mb-1">Previsão de conclusão</p>
                {diasInfo && obra.status_atual !== 'Concluída' && (
                  <p className={`text-xs ${diasInfo.classe}`}>{diasInfo.texto}</p>
                )}
              </div>
              <span className="font-display text-2xl text-atelie-douradoClaro">{formatarData(obra.estimativa_conclusao)}</span>
            </div>
          </section>
        )}

        {/* Seção: Observações */}
        {obra.observacoes && (
          <section id="secao-observacoes" className="scroll-mt-20 animate-fadeInUp [animation-delay:350ms]">
            <h2 className="font-display text-2xl mb-4">Observações do artista</h2>
            <div className="bg-atelie-superficie border border-atelie-borda rounded-2xl p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-atelie-dourado/20 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-atelie-douradoClaro" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </div>
                <p className="text-atelie-textoMuted leading-relaxed whitespace-pre-line text-sm">{obra.observacoes}</p>
              </div>
            </div>
          </section>
        )}

        {/* Ações finais */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-4 animate-fadeInUp [animation-delay:400ms]">
          <PdfButton obra={obra} materiais={materiais} historico={historico} />

          <button
            onClick={() => {
              const link = `${window.location.origin}/acompanhar/${obra.token_acesso}`;
              const texto = encodeURIComponent(`🎨 Acompanhe o progresso da obra "${obra.titulo}" em tempo real:\n\n${link}`);
              window.open(`https://wa.me/?text=${texto}`, '_blank');
            }}
            className="btn-outline px-4 py-2.5 text-sm"
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              Compartilhar
            </span>
          </button>
        </div>
      </div>

      {/* Rodapé */}
      <footer className="border-t border-atelie-borda py-8 text-center">
        <p className="font-display italic text-atelie-dourado text-sm mb-1">Atelier Bruno Amaral</p>
        <p className="text-[10px] text-atelie-textoMuted">Acompanhamento em tempo real · {obra.titulo}</p>
      </footer>
    </div>
  );
}
