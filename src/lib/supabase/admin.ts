import { createClient } from '@supabase/supabase-js';

/**
 * Client Supabase com a SERVICE ROLE KEY.
 *
 * ⚠️ Uso EXCLUSIVO em código que roda no servidor (Server Actions, Route
 * Handlers dentro de /admin). Esta chave ignora RLS — nunca importe este
 * arquivo em um componente "use client" ou o exponha ao navegador.
 *
 * O `cache: 'no-store'` é obrigatório: sem ele o Next.js guarda as respostas
 * GET do Supabase no Data Cache (compartilhado entre deploys na Vercel) e o
 * painel passa a mostrar obras antigas que já nem existem no banco.
 */
export function criarClientAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        fetch: (input, init) => fetch(input, { ...init, cache: 'no-store' }),
      },
    }
  );
}
