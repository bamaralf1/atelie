'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { Obra, Material, HistoricoStatus, FotoProgresso, Comentario, ItemVisor } from '@/lib/types';
import { useRealtimeObra } from '@/hooks/useRealtimeObra';
import { useTempoDecorrido } from '@/hooks/useTempoDecorrido';
import { ProgressBar } from '@/components/admin/ProgressBar';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { Timeline } from '@/components/cliente/Timeline';
import { Lightbox } from '@/components/cliente/Lightbox';
import { VisorImagem } from '@/components/cliente/VisorImagem';
import { PdfButton } from '@/components/cliente/PdfButton';
import { ComparacaoSlider } from '@/components/cliente/ComparacaoSlider';
import { Celebracao } from '@/components/cliente/Celebracao';
import { Comentarios } from '@/components/cliente/Comentarios';
import { formatarData, formatarMoeda, formatarDiasRestantes, corStatusDot, indiceEntrega } from '@/lib/utils';
import { ENTREGA_OPCOES } from '@/lib/types';

const SECOES = [
  { id: 'progresso', label: 'Progresso' },
  { id: 'comparacao', label: 'Comparação' },
  { id: 'galeria', label: 'Galeria' },
  { id: 'timeline', label: 'Linha do tempo' },
  { id: 'comentarios', label: 'Comentários' },
  { id: 'materiais', label: 'Materiais' },
  { id: 'observacoes', label: 'Observações' },
];

function useScrollReveal() {
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('reveal-visible');
            obs.unobserve(e.target);
          }
        });
      },
      { rootMargin: '-60px 0px' }
    );
    document.querySelectorAll('.reveal').forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

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
  const [scrollY, setScrollY] = useState(0);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  useScrollReveal();

  useEffect(() => {
    const handleScroll = () => {
      setMostrarNav(window.scrollY > 350);
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setSecaoAtiva(entry.target.id);
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
    { label: 'Blocagem', min: 30 },
    { label: 'Pintura', min: 60 },
    { label: 'Detalhamento final', min: 80 },
    { label: 'Concluída', min: 100 },
  ];

  const itensVisor: ItemVisor[] = [
    ...(obra.imagem_referencia_url
      ? [{ id: 'referencia', url: obra.imagem_referencia_url, legenda: 'A imagem que serviu de inspiração', etapa: 'Referência inicial' }]
      : []),
    ...(obra.imagem_obra_atual_url
      ? [{ id: 'atual', url: obra.imagem_obra_atual_url, legenda: 'Estado mais recente da pintura', etapa: 'Progresso atual' }]
      : []),
    ...fotos.map((f) => ({ id: f.id, url: f.url_foto, legenda: f.legenda, etapa: f.etapa, data: f.data_upload })),
  ];
  const [visorIndice, setVisorIndice] = useState<number | null>(null);
  const abrirVisor = (id: string) => {
    const i = itensVisor.findIndex((item) => item.id === id);
    if (i >= 0) setVisorIndice(i);
  };
  const indiceEntregaAtual = indiceEntrega(obra.entrega_status);

  const heroBgY = scrollY * 0.35;
  const heroOpacity = Math.max(0, 1 - scrollY / 600);

  const bgImg = obra.imagem_obra_atual_url || obra.imagem_referencia_url;

  return (
    <div className="min-h-screen bg-atelie-fundo overflow-x-hidden">
      <style>{`
        .reveal { opacity: 0; transform: translateY(30px); transition: opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1), transform 0.7s cubic-bezier(0.16, 1, 0.3, 1); }
        .reveal-visible { opacity: 1; transform: translateY(0); }
      `}</style>

      <Celebracao ativo={obra.percentual_conclusao >= 100} />

      {/* Notification */}
      {notificacao && (
        <div className="fixed top-4 right-4 z-50 bg-black/70 backdrop-blur-xl border border-atelie-dourado/30 text-atelie-douradoClaro text-sm px-5 py-3 rounded-2xl shadow-2xl animate-slideInRight shadow-dourado">
          <span className="flex items-center gap-3">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-atelie-dourado opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-atelie-dourado" />
            </span>
            {notificacao}
          </span>
        </div>
      )}

      {/* Sticky nav */}
      <nav
        className={`fixed top-0 inset-x-0 z-40 transition-all duration-700 ease-out ${
          mostrarNav ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
        }`}
      >
        <div className="bg-black/60 backdrop-blur-2xl border-b border-atelie-borda/50">
          <div className="max-w-3xl mx-auto px-4 py-2.5 flex items-center gap-1 overflow-x-auto scrollbar-none">
            {SECOES.map((s) => (
              <button
                key={s.id}
                onClick={() => scrollPara(s.id)}
                className={`relative whitespace-nowrap px-3 py-1.5 rounded-full text-[11px] font-medium transition-all duration-300 ${
                  secaoAtiva === s.id
                    ? 'text-atelie-douradoClaro'
                    : 'text-atelie-textoMuted/70 hover:text-atelie-texto'
                }`}
              >
                {secaoAtiva === s.id && (
                  <span className="absolute inset-0 rounded-full bg-atelie-dourado/10 border border-atelie-dourado/30 animate-scaleSm" />
                )}
                <span className="relative z-10">{s.label}</span>
              </button>
            ))}
            <div className="ml-auto shrink-0 pl-2">
              <PdfButton obra={obra} materiais={materiais} historico={historico} />
            </div>
          </div>
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <section ref={heroRef} className="relative min-h-[80vh] sm:min-h-[75vh] flex items-end justify-center pb-16 sm:pb-20 px-6 overflow-hidden">
        {/* Background com parallax */}
        {bgImg ? (
          <div className="absolute inset-0" style={{ transform: `translateY(${heroBgY}px)` }}>
            <img src={bgImg} alt="" className="w-full h-[120%] object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-atelie-fundo via-atelie-fundo/70 to-atelie-fundo/40" />
            <div className="absolute inset-0 bg-gradient-to-r from-atelie-fundo/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-atelie-fundo" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-atelie-superficie to-atelie-fundo">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(198,161,91,0.06),transparent_60%)]" />
          </div>
        )}

        {/* Anel decorativo */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-atelie-dourado/5 pointer-events-none" style={{ opacity: heroOpacity }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-atelie-dourado/10 pointer-events-none" style={{ opacity: heroOpacity }} />

        <div className="relative text-center max-w-2xl" style={{ opacity: heroOpacity, transform: `translateY(${scrollY * 0.1}px)` }}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-atelie-dourado/10 border border-atelie-dourado/20 backdrop-blur-sm mb-5 animate-fadeInUp">
            <span className="w-1.5 h-1.5 rounded-full bg-atelie-dourado animate-pulseDot" />
            <span className="text-[10px] uppercase tracking-[0.2em] text-atelie-douradoClaro font-medium">
              Atelier Bruno Amaral
            </span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl md:text-7xl mb-4 leading-[1.1] text-atelie-texto drop-shadow-2xl">
            {obra.titulo}
          </h1>
          <p className="text-atelie-textoMuted text-base sm:text-lg mb-8 max-w-lg mx-auto">
            Acompanhamento exclusivo para{' '}
            <span className="text-atelie-texto font-medium border-b border-atelie-dourado/30">{obra.cliente_nome}</span>
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <StatusBadge status={obra.status_atual} tamanho="grande" />
            <span className="flex items-center gap-2 text-xs text-atelie-textoMuted/70">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Atualizado {tempoAtualizacao}
            </span>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2" style={{ opacity: heroOpacity }}>
          <span className="text-[9px] uppercase tracking-[0.2em] text-atelie-textoMuted/40">Rolar</span>
          <svg className="w-4 h-4 text-atelie-dourado/40 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* ===== CONTEÚDO ===== */}
      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 pb-20 -mt-8 space-y-20">

        {/* Progresso */}
        <section id="secao-progresso" className="scroll-mt-24 reveal">
          <div className="relative bg-atelie-superficie/60 backdrop-blur-xl border border-atelie-borda/60 rounded-3xl p-6 sm:p-8 shadow-xl shadow-black/20 hover:shadow-dourado-glow transition-shadow duration-500">
            <div className="absolute -top-px left-8 right-8 h-px bg-gradient-to-r from-transparent via-atelie-dourado/30 to-transparent" />

            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="font-display text-2xl sm:text-3xl text-atelie-texto">Progresso</h2>
                <p className="text-atelie-textoMuted text-sm mt-1">Acompanhe cada etapa da criação</p>
              </div>
              <div className="text-right">
                <span className="font-display text-4xl sm:text-5xl gradient-text">{obra.percentual_conclusao}%</span>
                <p className="text-[10px] uppercase tracking-wider text-atelie-textoMuted/60 mt-0.5">concluído</p>
              </div>
            </div>

            {/* Milestones */}
            <div className="relative mb-8">
              <ProgressBar percentual={obra.percentual_conclusao} tamanho="grande" mostrarMarcadores />
              <div className="flex justify-between mt-3">
                {milestones.map((m, i) => {
                  const atingido = obra.percentual_conclusao >= m.min;
                  const atual = obra.percentual_conclusao >= m.min && obra.percentual_conclusao < (milestones[i + 1]?.min ?? 101);
                  return (
                    <div key={m.label} className="flex flex-col items-center gap-1.5">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-700 ${
                          atingido
                            ? 'bg-gradient-to-br from-atelie-dourado to-atelie-douradoClaro shadow-[0_0_12px_rgba(198,161,91,0.4)]'
                            : 'bg-atelie-superficie2 border border-atelie-borda'
                        } ${atual ? 'scale-110' : ''}`}
                      >
                        {atingido ? (
                          <svg className="w-3 h-3 text-atelie-fundo" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <span className="text-[8px] text-atelie-textoMuted">{i + 1}</span>
                        )}
                      </div>
                      <span className={`text-[9px] text-center leading-tight max-w-[48px] ${atingido ? 'text-atelie-douradoClaro font-medium' : 'text-atelie-textoMuted/50'}`}>
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
                <span className={`text-xs font-medium ${diasInfo.classe}`}>{diasInfo.texto}</span>
              )}
              {obra.status_atual === 'Concluída' && (
                <span className="text-xs text-emerald-400 flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Concluída
                </span>
              )}
            </div>

            {/* Entrega */}
            {obra.entrega_status && (
              <div className="mt-8 pt-7 border-t border-atelie-borda/40">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400/20 to-emerald-400/5 border border-emerald-400/20 flex items-center justify-center">
                      <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 3l1.912 5.813a2 2 0 001.272 1.272L21 12l-5.816 1.915a2 2 0 00-1.272 1.272L12 21l-1.912-5.816a2 2 0 00-1.272-1.272L3 12l5.816-1.915a2 2 0 001.272-1.272L12 3z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-display text-lg text-atelie-texto">Entrega</h3>
                      <p className="text-atelie-textoMuted text-xs mt-0.5">Acompanhe o envio da obra</p>
                    </div>
                  </div>
                  <StatusBadge status={obra.entrega_status} tamanho="normal" />
                </div>

                <div className="flex justify-between items-start">
                  {ENTREGA_OPCOES.map((etapa, i) => {
                    const feita = indiceEntregaAtual >= i;
                    const atual = indiceEntregaAtual === i;
                    return (
                      <div key={etapa} className="flex flex-col items-center gap-2 flex-1 min-w-0">
                        <div className="w-full flex items-center">
                          <div className={`h-1 flex-1 rounded-full transition-all duration-700 ${i === 0 ? 'bg-transparent' : feita ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.4)]' : 'bg-atelie-superficie2'}`} />
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-500 ${
                            feita
                              ? 'bg-gradient-to-br from-emerald-400 to-emerald-500 shadow-[0_0_14px_rgba(52,211,153,0.45)]'
                              : 'bg-atelie-superficie2 border border-atelie-borda'
                          } ${atual ? 'scale-110' : ''}`}>
                            {feita ? (
                              <svg className="w-4 h-4 text-atelie-fundo" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              <span className="text-[9px] text-atelie-textoMuted">{i + 1}</span>
                            )}
                          </div>
                          <div className={`h-1 flex-1 rounded-full transition-all duration-700 ${i === ENTREGA_OPCOES.length - 1 ? 'bg-transparent' : feita ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' : 'bg-atelie-superficie2'}`} />
                        </div>
                        <span className={`text-[10px] text-center leading-tight px-1 ${feita ? 'text-emerald-300 font-medium' : 'text-atelie-textoMuted/50'}`}>
                          {etapa}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Comparação */}
        {temComparacao && (
          <section id="secao-comparacao" className="scroll-mt-24 reveal">
            <h2 className="font-display text-2xl sm:text-3xl text-atelie-texto mb-1">Referência × Progresso</h2>
            <p className="text-atelie-textoMuted text-sm mb-5">Compare a foto de referência com o estado atual da obra</p>
            <div className="rounded-2xl overflow-hidden border border-atelie-borda/60 shadow-xl shadow-black/20">
              <ComparacaoSlider
                imagemAntes={obra.imagem_referencia_url!}
                imagemDepois={obra.imagem_obra_atual_url!}
                labelAntes="Referência inicial"
                labelDepois="Progresso atual"
                onExpand={() => abrirVisor('atual')}
              />
            </div>
          </section>
        )}

        {/* Foto destaque */}
        {!temComparacao && obra.imagem_obra_atual_url && (
          <section className="reveal">
            <h2 className="font-display text-2xl sm:text-3xl text-atelie-texto mb-1">A obra hoje</h2>
            <p className="text-atelie-textoMuted text-sm mb-5">Estado mais recente da pintura</p>
            <button
              onClick={() => abrirVisor('atual')}
              className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden border border-atelie-borda/60 shadow-xl shadow-black/20 group cursor-zoom-in"
              aria-label="Ampliar foto da obra"
            >
              <Image src={obra.imagem_obra_atual_url} alt={obra.titulo} fill className="object-cover transition-transform duration-700 group-hover:scale-105" priority />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <span className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white text-[10px] px-2.5 py-1.5 rounded-full flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Ampliar
              </span>
            </button>
          </section>
        )}

        {/* Galeria */}
        {fotos.length > 0 && (
          <section id="secao-galeria" className="scroll-mt-24 reveal">
            <div className="flex items-end justify-between mb-5">
              <div>
                <h2 className="font-display text-2xl sm:text-3xl text-atelie-texto mb-1">Galeria de progresso</h2>
                <p className="text-atelie-textoMuted text-sm">Registro fotográfico de cada etapa</p>
              </div>
              <span className="text-xs text-atelie-textoMuted/60 font-mono shrink-0 ml-4">{fotos.length} foto{fotos.length !== 1 ? 's' : ''}</span>
            </div>
            <Lightbox fotos={fotos} />
          </section>
        )}

        {/* Referência isolada */}
        {!temComparacao && !obra.imagem_obra_atual_url && obra.imagem_referencia_url && (
          <section className="reveal">
            <h2 className="font-display text-2xl sm:text-3xl text-atelie-texto mb-1">Referência inicial</h2>
            <p className="text-atelie-textoMuted text-sm mb-5">A imagem que serviu de inspiração</p>
            <button
              onClick={() => abrirVisor('referencia')}
              className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden border border-atelie-borda/60 shadow-xl shadow-black/20 group cursor-zoom-in"
              aria-label="Ampliar referência"
            >
              <Image src={obra.imagem_referencia_url} alt="Referência" fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <span className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white text-[10px] px-2.5 py-1.5 rounded-full flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Ampliar
              </span>
            </button>
          </section>
        )}

        {/* Timeline */}
        <section id="secao-timeline" className="scroll-mt-24 reveal">
          <h2 className="font-display text-2xl sm:text-3xl text-atelie-texto mb-1">Linha do tempo</h2>
          <p className="text-atelie-textoMuted text-sm mb-5">Cada mudança de status registrada</p>
          <Timeline historico={historico} fotos={fotos} />
        </section>

        {/* Comentários */}
        <section id="secao-comentarios" className="scroll-mt-24 reveal">
          <div className="relative bg-atelie-superficie/60 backdrop-blur-xl border border-atelie-borda/60 rounded-3xl p-6 sm:p-8 shadow-xl shadow-black/20">
            <div className="absolute -top-px left-8 right-8 h-px bg-gradient-to-r from-transparent via-atelie-dourado/30 to-transparent" />
            <h2 className="font-display text-2xl sm:text-3xl text-atelie-texto mb-1">Comentários</h2>
            <p className="text-atelie-textoMuted text-sm mb-6">Tire dúvidas ou deixe um feedback sobre a obra.</p>
            <Comentarios token={obra.token_acesso} obraId={obra.id} comentariosIniciais={comentarios} />
          </div>
        </section>

        {/* Materiais */}
        {obra.exibir_custos && (
          <section id="secao-materiais" className="scroll-mt-24 reveal">
            <h2 className="font-display text-2xl sm:text-3xl text-atelie-texto mb-1">Materiais utilizados</h2>
            <p className="text-atelie-textoMuted text-sm mb-5">Transparência sobre cada insumo da obra</p>
            <div className="bg-atelie-superficie/60 backdrop-blur-xl border border-atelie-borda/60 rounded-3xl overflow-hidden shadow-xl shadow-black/20">
              <div className="divide-y divide-atelie-borda/50">
                {materiais.map((m) => (
                  <div key={m.id} className="flex items-center justify-between px-5 sm:px-7 py-4 hover:bg-atelie-dourado/[0.02] transition-colors group">
                    <div>
                      <p className="text-sm text-atelie-texto group-hover:text-atelie-douradoClaro transition-colors">{m.nome}</p>
                      <p className="text-[11px] text-atelie-textoMuted/60">{m.quantidade}x {formatarMoeda(m.custo_unitario)} cada</p>
                    </div>
                    <span className="font-mono text-sm text-atelie-douradoClaro">{formatarMoeda(m.quantidade * m.custo_unitario)}</span>
                  </div>
                ))}
              </div>
              <div className="bg-gradient-to-r from-atelie-dourado/5 to-transparent px-5 sm:px-7 py-5 flex items-center justify-between border-t border-atelie-borda/50">
                <span className="text-sm text-atelie-textoMuted">Total investido em materiais</span>
                <span className="font-display text-xl gradient-text font-semibold">{formatarMoeda(totalMateriais)}</span>
              </div>
            </div>
          </section>
        )}

        {/* Previsão */}
        {obra.estimativa_conclusao && (
          <section className="reveal">
            <div className="relative bg-atelie-superficie/40 backdrop-blur-xl border border-atelie-borda/50 rounded-3xl p-6 sm:p-8 flex items-center justify-between shadow-xl shadow-black/20 group hover:border-atelie-dourado/30 transition-colors duration-500">
              <div className="absolute -top-px left-8 right-8 h-px bg-gradient-to-r from-transparent via-atelie-dourado/20 to-transparent" />
              <div>
                <p className="text-xs uppercase tracking-[0.15em] text-atelie-textoMuted/60 mb-1">Previsão de conclusão</p>
                <span className="font-display text-xl sm:text-2xl text-atelie-texto">{formatarData(obra.estimativa_conclusao)}</span>
              </div>
              {diasInfo && obra.status_atual !== 'Concluída' && (
                <div className={`text-right ${diasInfo.classe}`}>
                  <p className="text-2xl sm:text-3xl font-display">{diasInfo.texto.replace(/\D+/g, '')}</p>
                  <p className="text-xs">{diasInfo.texto.replace(/\d+/g, '').trim()}</p>
                </div>
              )}
              {obra.status_atual === 'Concluída' && (
                <div className="text-right">
                  <span className="text-emerald-400 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Concluída
                  </span>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Observações */}
        {obra.observacoes && (
          <section id="secao-observacoes" className="scroll-mt-24 reveal">
            <h2 className="font-display text-2xl sm:text-3xl text-atelie-texto mb-1">Observações do artista</h2>
            <p className="text-atelie-textoMuted text-sm mb-5">Notas e detalhes sobre o processo criativo</p>
            <div className="relative bg-atelie-superficie/60 backdrop-blur-xl border border-atelie-borda/60 rounded-3xl p-6 sm:p-8 shadow-xl shadow-black/20">
              <div className="absolute -top-px left-8 right-8 h-px bg-gradient-to-r from-transparent via-atelie-dourado/30 to-transparent" />
              <div className="flex items-start gap-5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-atelie-dourado/20 to-atelie-dourado/5 flex items-center justify-center shrink-0 border border-atelie-dourado/10">
                  <svg className="w-6 h-6 text-atelie-douradoClaro" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </div>
                <p className="text-atelie-textoMuted leading-relaxed whitespace-pre-line text-sm sm:text-base">{obra.observacoes}</p>
              </div>
            </div>
          </section>
        )}

        {/* Ações */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4 reveal">
          <PdfButton obra={obra} materiais={materiais} historico={historico} />

          <button
            onClick={() => {
              const link = `${window.location.origin}/acompanhar/${obra.token_acesso}`;
              const texto = encodeURIComponent(`🎨 Acompanhe o progresso da obra "${obra.titulo}" em tempo real:\n\n${link}`);
              window.open(`https://wa.me/?text=${texto}`, '_blank');
            }}
            className="group relative px-6 py-3 rounded-xl border border-atelie-borda/60 text-atelie-textoMuted hover:text-atelie-texto hover:border-atelie-dourado/40 transition-all duration-300 text-sm overflow-hidden"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-atelie-dourado/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="relative flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              Compartilhar no WhatsApp
            </span>
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-atelie-borda/50 py-12 text-center">
        <div className="max-w-3xl mx-auto px-6">
          <div className="w-10 h-10 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-atelie-dourado/20 to-atelie-dourado/5 border border-atelie-dourado/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-atelie-dourado" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="font-display italic text-atelie-dourado text-base mb-1">Atelier Bruno Amaral</p>
          <p className="text-xs text-atelie-textoMuted/50">Acompanhamento em tempo real · {obra.titulo}</p>
        </div>
      </footer>

      {visorIndice !== null && itensVisor[visorIndice] && (
        <VisorImagem itens={itensVisor} indiceInicial={visorIndice} onFechar={() => setVisorIndice(null)} />
      )}
    </div>
  );
}
