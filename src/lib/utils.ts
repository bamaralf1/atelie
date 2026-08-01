import { StatusObra, EntregaStatus, ENTREGA_OPCOES } from './types';

/** Formata um valor numérico como moeda brasileira (R$). */
export function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor ?? 0);
}

/** Formata uma data ISO para o padrão dd/mm/aaaa. */
export function formatarData(data: string | null): string {
  if (!data) return '—';
  const d = new Date(data);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

/** Formata data e hora completas, usado na linha do tempo. */
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

/** Retorna string do tipo "há 5 minutos" / "há 3 horas" a partir de uma data ISO. */
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

/** Cor de destaque associada a cada status, usada em badges e na timeline. */
export function corDoStatus(status: StatusObra | string): string {
  const mapa: Record<string, string> = {
    'Esboço': 'bg-atelie-textoMuted/20 text-atelie-texto border-atelie-borda',
    'Imprimatura': 'bg-atelie-terracota/15 text-atelie-terracotaClaro border-atelie-terracota/40',
    'Blocagem': 'bg-atelie-terracota/15 text-atelie-terracotaClaro border-atelie-terracota/40',
    'Pintura': 'bg-atelie-dourado/15 text-atelie-douradoClaro border-atelie-dourado/40',
    'Detalhamento final': 'bg-atelie-dourado/20 text-atelie-douradoClaro border-atelie-dourado/50',
    'Concluída': 'bg-emerald-900/30 text-emerald-300 border-emerald-700/50',
  };
  return mapa[status] ?? mapa['Esboço'];
}

/** Retorna o índice (0..2) da etapa de entrega atual; -1 se ainda não iniciada. */
export function indiceDaEntrega(status: EntregaStatus | null): number {
  if (!status) return -1;
  return ENTREGA_OPCOES.indexOf(status);
}

/** Monta a URL pública de acompanhamento a partir do token. */
export function montarLinkAcompanhamento(token: string): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : '');
  return `${base}/acompanhar/${token}`;
}
