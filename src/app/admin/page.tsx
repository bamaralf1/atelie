import { criarClientAdmin } from '@/lib/supabase/admin';
import { ObraCard } from '@/components/admin/ObraCard';
import { Obra } from '@/lib/types';
import Link from 'next/link';

export const dynamic = 'force-dynamic'; // sempre buscar dados atualizados

export default async function DashboardAdmin() {
  const supabase = criarClientAdmin();
  const { data: obras, error } = await supabase
    .from('obras')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return (
      <div className="text-atelie-terracotaClaro">
        Erro ao carregar obras: {error.message}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl mb-1">Suas obras</h1>
          <p className="text-atelie-textoMuted text-sm">
            {obras?.length ?? 0} obra{(obras?.length ?? 0) !== 1 ? 's' : ''} cadastrada{(obras?.length ?? 0) !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {!obras || obras.length === 0 ? (
        <div className="border border-dashed border-atelie-borda rounded-lg py-16 text-center">
          <p className="text-atelie-textoMuted mb-4">Nenhuma obra cadastrada ainda.</p>
          <Link
            href="/admin/nova-obra"
            className="inline-block bg-atelie-dourado text-atelie-fundo px-5 py-2.5 rounded-md font-medium hover:bg-atelie-douradoClaro transition-colors"
          >
            Cadastrar primeira obra
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {(obras as Obra[]).map((obra) => (
            <ObraCard key={obra.id} obra={obra} />
          ))}
        </div>
      )}
    </div>
  );
}
