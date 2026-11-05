import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Client Supabase para uso em Server Components / route handlers.
 * Usa a chave anônima — adequado para leituras públicas (ex: página do cliente).
 *
 * O `cache: 'no-store'` evita que o Next.js reaproveite respostas GET antigas
 * do Data Cache (que é compartilhado entre deploys na Vercel).
 */
export function criarClientServidor() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set() {
          // Não precisamos persistir sessão de usuário: app não usa auth Supabase.
        },
        remove() {},
      },
      global: {
        fetch: (input: RequestInfo | URL, init?: RequestInit) =>
          fetch(input, { ...init, cache: 'no-store' }),
      },
    }
  );
}
