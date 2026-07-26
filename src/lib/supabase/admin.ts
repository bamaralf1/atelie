import { createClient } from '@supabase/supabase-js';

/**
 * Client Supabase com a SERVICE ROLE KEY.
 *
 * ⚠️ Uso EXCLUSIVO em código que roda no servidor (Server Actions, Route
 * Handlers dentro de /admin). Esta chave ignora RLS — nunca importe este
 * arquivo em um componente "use client" ou o exponha ao navegador.
 */
export function criarClientAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { persistSession: false, autoRefreshToken: false },
    }
  );
}
