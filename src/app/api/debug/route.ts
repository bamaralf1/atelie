import { NextResponse } from 'next/server';
import { carregarObras } from '@/lib/obras';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;

  let painel: unknown = null;
  try {
    const { obras, error, origem } = await carregarObras();
    painel = {
      origem,
      erro: error?.message ?? null,
      total: obras?.length ?? 0,
      obras: (obras ?? []).map((o) => ({ id: o.id, titulo: o.titulo, status: o.status_atual })),
    };
  } catch (e) {
    painel = { erro: e instanceof Error ? e.message : 'erro desconhecido' };
  }

  return NextResponse.json({
    supabase_url: url,
    service_role_key: process.env.SUPABASE_SERVICE_ROLE_KEY
      ? `${process.env.SUPABASE_SERVICE_ROLE_KEY.slice(0, 10)}... (${process.env.SUPABASE_SERVICE_ROLE_KEY.length} chars)`
      : '❌ NÃO CONFIGURADA',
    anon_key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      ? `${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.slice(0, 10)}... (${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length} chars)`
      : '❌ NÃO CONFIGURADA',
    admin_password: process.env.ADMIN_PASSWORD ? '✓' : '❌ NÃO CONFIGURADO',
    gmail_user: process.env.GMAIL_USER ? '✓' : '❌ NÃO CONFIGURADO',
    gmail_app_password: process.env.GMAIL_APP_PASSWORD ? '✓' : '❌ NÃO CONFIGURADA',
    painel,
    vercel_url: process.env.VERCEL_URL || 'local',
    vercel_env: process.env.VERCEL_ENV || 'local',
  });
}
