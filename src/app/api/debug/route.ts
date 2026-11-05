import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { criarClientAdmin } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

type Linha = { id: string; titulo: string; status_atual: string };

async function ler(client: ReturnType<typeof createClient>) {
  const { data, error } = await client
    .from('obras')
    .select('id,titulo,status_atual')
    .order('created_at', { ascending: false });
  if (error) return { ok: false, erro: error.message };
  return { ok: true, total: (data ?? []).length, obras: data as Linha[] };
}

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  let comServiceRole: unknown = null;
  let comAnonKey: unknown = null;

  try {
    comServiceRole = await ler(criarClientAdmin() as ReturnType<typeof createClient>);
  } catch (e) {
    comServiceRole = { ok: false, erro: e instanceof Error ? e.message : 'erro' };
  }

  try {
    const anon = createClient(url!, anonKey!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    comAnonKey = await ler(anon as ReturnType<typeof createClient>);
  } catch (e) {
    comAnonKey = { ok: false, erro: e instanceof Error ? e.message : 'erro' };
  }

  return NextResponse.json({
    supabase_url: url,
    service_role_key: serviceRoleKey
      ? `${serviceRoleKey.slice(0, 10)}... (${serviceRoleKey.length} chars)`
      : '❌ NÃO CONFIGURADA',
    anon_key: anonKey ? `${anonKey.slice(0, 10)}... (${anonKey.length} chars)` : '❌ NÃO CONFIGURADA',
    admin_password: process.env.ADMIN_PASSWORD ? '✓' : '❌ NÃO CONFIGURADO',
    gmail_user: process.env.GMAIL_USER ? '✓' : '❌ NÃO CONFIGURADO',
    gmail_app_password: process.env.GMAIL_APP_PASSWORD ? '✓' : '❌ NÃO CONFIGURADA',
    com_service_role: comServiceRole,
    com_anon_key: comAnonKey,
    vercel_url: process.env.VERCEL_URL || 'local',
    vercel_env: process.env.VERCEL_ENV || 'local',
  });
}
