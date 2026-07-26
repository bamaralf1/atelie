import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const status = {
    ambiente: process.env.NODE_ENV,
    vercel_env: process.env.VERCEL_ENV || 'local',
    supabase_url: supabaseUrl ? `${supabaseUrl.slice(0, 20)}...${supabaseUrl.slice(-10)}` : '❌ NÃO CONFIGURADO',
    supabase_url_ok: !!supabaseUrl,
    service_role_key: serviceRoleKey ? `✓ Configurada (${serviceRoleKey.slice(0, 8)}...)` : '❌ NÃO CONFIGURADA',
    service_role_key_ok: !!serviceRoleKey,
    anon_key: anonKey ? `✓ Configurada (${anonKey.slice(0, 8)}...)` : '❌ NÃO CONFIGURADA',
    anon_key_ok: !!anonKey,
    admin_password: adminPassword ? '✓ Configurado' : '❌ NÃO CONFIGURADO',
    admin_password_ok: !!adminPassword,
  };

  return NextResponse.json({
    mensagem: 'Diagnóstico de ambiente',
    instrucao: 'Copie estas informações e envie para o suporte.',
    status,
  });
}
