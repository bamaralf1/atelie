// Tipos compartilhados entre painel admin e página do cliente.

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
