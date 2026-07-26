import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Client Supabase para uso em Server Components / route handlers.
 * Usa a chave anônima — adequado para leituras públicas (ex: página do cliente).
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
    }
  );
}
