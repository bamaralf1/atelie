import { StatusObra, STATUS_CORES } from './types';

export function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor ?? 0);
}

export function formatarData(data: string | null): string {
  if (!data) return '—';
  const d = new Date(data);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function formatarDataHora(data: string): string {
  const d = new Date(data);
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function tempoRelativo(data: string): string {
  const agora = new Date().getTime();
  const entao = new Date(data).getTime();
  const diffSegundos = Math.floor((agora - entao) / 1000);

  if (diffSegundos < 60) return 'há poucos segundos';
  const diffMinutos = Math.floor(diffSegundos / 60);
  if (diffMinutos < 60) return `há ${diffMinutos} minuto${diffMinutos > 1 ? 's' : ''}`;
  const diffHoras = Math.floor(diffMinutos / 60);
  if (diffHoras < 24) return `há ${diffHoras} hora${diffHoras > 1 ? 's' : ''}`;
  const diffDias = Math.floor(diffHoras / 24);
  return `há ${diffDias} dia${diffDias > 1 ? 's' : ''}`;
}

export function corDoStatus(status: StatusObra | string): string {
  const cores = STATUS_CORES[status as StatusObra];
  return cores ? `${cores.bg} ${cores.text} ${cores.border}` : STATUS_CORES['Esboço'].bg + ' ' + STATUS_CORES['Esboço'].text + ' ' + STATUS_CORES['Esboço'].border;
}

export function montarLinkAcompanhamento(token: string): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : '');
  return `${base}/acompanhar/${token}`;
}

export function calcularDiasRestantes(data: string | null): number | null {
  if (!data) return null;
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const alvo = new Date(data);
  alvo.setHours(0, 0, 0, 0);
  const diff = Math.ceil((alvo.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
  return diff;
}

export function formatarDiasRestantes(data: string | null): { texto: string; classe: string } | null {
  const dias = calcularDiasRestantes(data);
  if (dias === null) return null;
  if (dias < 0) return { texto: `Atrasado ${Math.abs(dias)} dia${Math.abs(dias) > 1 ? 's' : ''}`, classe: 'text-atelie-terracotaClaro' };
  if (dias === 0) return { texto: 'Hoje', classe: 'text-atelie-douradoClaro font-semibold' };
  if (dias === 1) return { texto: 'Amanhã', classe: 'text-atelie-douradoClaro' };
  return { texto: `${dias} dias restantes`, classe: 'text-atelie-textoMuted' };
}

export function corStatusDot(status: StatusObra | string): string {
  return STATUS_CORES[status as StatusObra]?.dot ?? STATUS_CORES['Esboço'].dot;
}

export function classNames(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
