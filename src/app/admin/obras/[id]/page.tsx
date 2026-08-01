import { criarClientAdmin } from '@/lib/supabase/admin';
import { criarClientServidor } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { ProgressBar } from '@/components/admin/ProgressBar';
import { AbasObra } from './components/AbasObra';
import { Obra, Material, FotoProgresso } from '@/lib/types';
import { formatarData, formatarMoeda } from '@/lib/utils';

export const dynamic = 'force-dynamic';

async function buscarObraCompleta(id: string) {
  const tentativas = [criarClientAdmin, criarClientServidor];
  for (const criar of tentativas) {
    try {
      const supabase = criar();
      const [{ data: obra }, { data: materiais }, { data: fotos }] = await Promise.all([
        supabase.from('obras').select('*').eq('id', id).single(),
        supabase.from('materiais').select('*').eq('obra_id', id).order('created_at', { ascending: false }),
        supabase.from('fotos_progresso').select('*').eq('obra_id', id).order('data_upload', { ascending: false }),
      ]);
      if (obra) {
        return {
          obra: obra as Obra,
          materiais: (materiais as Material[]) ?? [],
          fotos: (fotos as FotoProgresso[]) ?? [],
        };
      }
    } catch {
      continue;
    }
  }
  return null;
}

export default async function EditarObraPage({ params }: { params: { id: string } }) {
  const dados = await buscarObraCompleta(params.id);
  if (!dados) notFound();
  const { obra, materiais, fotos } = dados;

  return (
    <div>
      {/* Cabeçalho */}
      <div className="mb-6">
        <a
          href="/admin"
          className="inline-flex items-center gap-1 text-xs text-atelie-textoMuted hover:text-atelie-texto transition-colors mb-3"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Voltar para obras
        </a>

        <div className="flex items-start justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="font-display text-3xl truncate">{obra.titulo}</h1>
              <StatusBadge status={obra.status_atual} />
            </div>
            <div className="flex items-center gap-4 text-sm text-atelie-textoMuted">
              <span>Cliente: {obra.cliente_nome}</span>
              {obra.orcamento_total > 0 && (
                <span className="font-mono text-atelie-douradoClaro">{formatarMoeda(obra.orcamento_total)}</span>
              )}
              <span>Criada em {formatarData(obra.created_at)}</span>
            </div>
          </div>
          <div className="w-48 shrink-0 ml-4">
            <ProgressBar percentual={obra.percentual_conclusao} tamanho="grande" />
            <p className="text-right text-sm text-atelie-textoMuted mt-1">{obra.percentual_conclusao}%</p>
          </div>
        </div>
      </div>

      <AbasObra
        obra={obra}
        materiaisIniciais={materiais}
        fotosIniciais={fotos}
      />
    </div>
  );
}
