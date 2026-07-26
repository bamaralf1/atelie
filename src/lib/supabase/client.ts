'use client';

import { createBrowserClient } from '@supabase/ssr';

/**
 * Client Supabase para uso em componentes do lado do cliente ("use client").
 * Usa a chave anônima (anon key) — respeita as políticas de RLS de leitura pública.
 * Nunca use a service role key aqui.
 */
export function criarClientBrowser() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
