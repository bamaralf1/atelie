import { criarClientAdmin } from '@/lib/supabase/admin';
import { notFound } from 'next/navigation';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { ProgressBar } from '@/components/admin/ProgressBar';
import { AbasObra } from './components/AbasObra';
import { ExcluirObra } from './components/ExcluirObra';
import { Obra, Material, FotoProgresso } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function EditarObraPage({ params }: { params: { id: string } }) {
  const supabase = criarClientAdmin();

  const [{ data: obra }, { data: materiais }, { data: fotos }] = await Promise.all([
    supabase.from('obras').select('*').eq('id', params.id).single(),
    supabase.from('materiais').select('*').eq('obra_id', params.id).order('created_at', { ascending: false }),
    supabase.from('fotos_progresso').select('*').eq('obra_id', params.id).order('data_upload', { ascending: false }),
  ]);

  if (!obra) notFound();

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl mb-1">{obra.titulo}</h1>
          <p className="text-atelie-textoMuted text-sm mb-3">Cliente: {obra.cliente_nome}</p>
          <StatusBadge status={obra.status_atual} />
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="w-48">
            <ProgressBar percentual={obra.percentual_conclusao} tamanho="grande" />
            <p className="text-right text-sm text-atelie-textoMuted mt-1">{obra.percentual_conclusao}%</p>
          </div>
          <ExcluirObra obraId={obra.id} titulo={obra.titulo} />
        </div>
      </div>

      <AbasObra
        obra={obra as Obra}
        materiaisIniciais={(materiais as Material[]) ?? []}
        fotosIniciais={(fotos as FotoProgresso[]) ?? []}
      />
    </div>
  );
}
