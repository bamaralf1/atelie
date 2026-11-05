import { NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * ROTA TEMPORÁRIA DE RECUPERAÇÃO.
 *
 * Consulta o Supabase *sem* `cache: 'no-store'`, de propósito, para tentar
 * ler o snapshot antigo que ficou no Data Cache da Vercel (obras "Lucas
 * Peixoto e Família" e "Georgia", apagadas por engano em 05/11).
 *
 * Uso: /api/recuperar?tipo=service  ou  /api/recuperar?tipo=anon
 * Remover depois de recuperar os dados.
 */
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-cache';

function criar(tipo: string | null): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  if (tipo === 'anon') {
    return createClient(url, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function GET(request: Request) {
  const tipo = new URL(request.url).searchParams.get('tipo');
  const client = criar(tipo);

  const { data, error } = await client
    .from('obras')
    .select('*')
    .order('created_at', { ascending: false });

  return NextResponse.json({
    tipo: tipo ?? 'service',
    erro: error?.message ?? null,
    total: data?.length ?? 0,
    titulos: (data ?? []).map((o: { titulo: string }) => o.titulo),
    obras: data ?? [],
  });
}
