import { NextRequest, NextResponse } from 'next/server';

/**
 * Proteção básica do painel /admin por senha simples (variável de ambiente
 * ADMIN_PASSWORD), usando um cookie assinado de forma trivial.
 * Não substitui um sistema de autenticação completo, mas atende ao pedido
 * de "algo simples" enquanto mantém a página do cliente 100% pública.
 */
const COOKIE_NAME = 'atelie_admin_auth';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const precisaProtecao = pathname.startsWith('/admin') && pathname !== '/admin/login';
  if (!precisaProtecao) return NextResponse.next();

  const cookie = request.cookies.get(COOKIE_NAME)?.value;
  const senhaEsperada = process.env.ADMIN_PASSWORD || 'admin123';

  if (cookie && senhaEsperada && cookie === senhaEsperada) {
    return NextResponse.next();
  }

  const loginUrl = new URL('/admin/login', request.url);
  loginUrl.searchParams.set('redirect', pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/admin/:path*'],
};
