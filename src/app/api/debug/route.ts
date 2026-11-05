import { NextResponse } from 'next/server';
import { criarClientAdmin } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const gmailUser = process.env.GMAIL_USER;

  let banco: { ok: boolean; erro?: string; obras?: string[] } = { ok: false };
  try {
    const supabase = criarClientAdmin();
    const { data, error } = await supabase.from('obras').select('id, titulo').limit(5);
    banco = error ? { ok: false, erro: error.message } : { ok: true, obras: (data ?? []).map((o) => o.titulo) };
  } catch (e) {
    banco = { ok: false, erro: e instanceof Error ? e.message : 'erro desconhecido' };
  }

  return NextResponse.json({
    supabase_ref: supabaseUrl ? supabaseUrl.replace('https://', '').replace('.supabase.co', '') : 'NÃO CONFIGURADO',
    service_role_key: serviceRoleKey ? '✓' : '❌ NÃO CONFIGURADA',
    anon_key: anonKey ? '✓' : 'NÃO CONFIGURADA',
    admin_password: process.env.ADMIN_PASSWORD ? '✓' : 'NÃO CONFIGURADO',
    gmail_user: gmailUser ? `${gmailUser.slice(0, 3)}***@${gmailUser.split('@')[1] ?? '?'}` : '❌ NÃO CONFIGURADO',
    gmail_app_password: process.env.GMAIL_APP_PASSWORD ? '✓' : '❌ NÃO CONFIGURADA',
    banco,
    ambiente: process.env.NODE_ENV,
    vercel_env: process.env.VERCEL_ENV || 'local',
  });
}
