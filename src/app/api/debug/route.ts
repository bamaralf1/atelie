import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return NextResponse.json({
    supabase_url: supabaseUrl ? `${supabaseUrl.slice(0, 12)}...${supabaseUrl.slice(-8)}` : 'NÃO CONFIGURADO',
    service_role_key: serviceRoleKey ? '✓' : '❌ NÃO CONFIGURADA',
    anon_key: anonKey ? '✓' : 'NÃO CONFIGURADA',
    admin_password: process.env.ADMIN_PASSWORD ? '✓' : 'NÃO CONFIGURADO',
    ambiente: process.env.NODE_ENV,
    vercel_env: process.env.VERCEL_ENV || 'local',
  });
}
