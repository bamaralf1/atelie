export type StatusObra =
  | 'Esboço'
  | 'Imprimatura'
  | 'Pintura em andamento'
  | 'Retoques finais'
  | 'Verniz final'
  | 'Concluída';

export const STATUS_OPCOES: StatusObra[] = [
  'Esboço',
  'Imprimatura',
  'Pintura em andamento',
  'Retoques finais',
  'Verniz final',
  'Concluída',
];

export const STATUS_CORES = {
  'Esboço': { bg: 'bg-zinc-500/20', text: 'text-zinc-300', border: 'border-zinc-500/40', dot: 'bg-zinc-400' },
  'Imprimatura': { bg: 'bg-atelie-terracota/15', text: 'text-atelie-terracotaClaro', border: 'border-atelie-terracota/40', dot: 'bg-atelie-terracota' },
  'Pintura em andamento': { bg: 'bg-atelie-dourado/15', text: 'text-atelie-douradoClaro', border: 'border-atelie-dourado/40', dot: 'bg-atelie-dourado' },
  'Retoques finais': { bg: 'bg-atelie-dourado/20', text: 'text-atelie-douradoClaro', border: 'border-atelie-dourado/50', dot: 'bg-atelie-douradoClaro' },
  'Verniz final': { bg: 'bg-atelie-terracota/20', text: 'text-atelie-terracotaClaro', border: 'border-atelie-terracota/50', dot: 'bg-atelie-terracotaClaro' },
  'Concluída': { bg: 'bg-emerald-900/30', text: 'text-emerald-300', border: 'border-emerald-700/50', dot: 'bg-emerald-400' },
} as const;

export interface Obra {
  id: string;
  titulo: string;
  cliente_nome: string;
  cliente_email: string | null;
  token_acesso: string;
  status_atual: StatusObra;
  percentual_conclusao: number;
  estimativa_conclusao: string | null;
  orcamento_total: number;
  custo_materiais: number;
  descricao: string | null;
  observacoes: string | null;
  exibir_custos: boolean;
  imagem_referencia_url: string | null;
  imagem_obra_atual_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Material {
  id: string;
  obra_id: string;
  nome: string;
  quantidade: number;
  custo_unitario: number;
  fornecedor: string | null;
  created_at: string;
}

export interface HistoricoStatus {
  id: string;
  obra_id: string;
  status_anterior: string | null;
  status_novo: string;
  observacao: string | null;
  data_mudanca: string;
}

export interface FotoProgresso {
  id: string;
  obra_id: string;
  url_foto: string;
  legenda: string | null;
  etapa: string | null;
  data_upload: string;
}

export interface Comentario {
  id: string;
  obra_id: string;
  autor: 'artista' | 'cliente';
  texto: string;
  criado_em: string;
}

export interface EstatisticasDashboard {
  total: number;
  emAndamento: number;
  concluidas: number;
  receitaTotal: number;
  custoTotal: number;
  porStatus: { status: string; quantidade: number }[];
}
