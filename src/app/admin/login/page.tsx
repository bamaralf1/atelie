import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

async function autenticar(formData: FormData) {
  'use server';
  const senha = formData.get('senha') as string;
  const redirectPara = (formData.get('redirect') as string) || '/admin';

  if (senha && senha === process.env.ADMIN_PASSWORD) {
    cookies().set('atelie_admin_auth', senha, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });
    redirect(redirectPara);
  }

  redirect('/admin/login?erro=1');
}

export default function LoginAdminPage({
  searchParams,
}: {
  searchParams: { redirect?: string; erro?: string };
}) {
  return (
    <div className="min-h-screen bg-atelie-fundo flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-atelie-dourado/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-80 h-80 bg-atelie-terracota/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-atelie-dourado/[0.03] to-transparent rounded-full" />
      </div>

      <div className="w-full max-w-sm animate-fadeInUp relative">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gradient-to-br from-atelie-dourado/20 to-atelie-dourado/5 border border-atelie-dourado/20 flex items-center justify-center">
            <svg className="w-7 h-7 text-atelie-dourado" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
          </div>
          <p className="font-display text-4xl text-atelie-dourado italic mb-1">Ateliê</p>
          <p className="text-atelie-textoMuted text-sm">Acesso ao painel do artista</p>
        </div>

        <form
          action={autenticar}
          className="card-glass p-8 space-y-5"
        >
          <input type="hidden" name="redirect" value={searchParams.redirect || '/admin'} />

          <div>
            <label className="block text-[10px] uppercase tracking-[0.2em] text-atelie-textoMuted/60 mb-2">
              Senha de acesso
            </label>
            <div className="relative group">
              <input
                type="password"
                name="senha"
                required
                autoFocus
                className="input-premium pr-10"
                placeholder="Digite sua senha"
              />
              <svg
                className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-atelie-textoMuted/40 group-focus-within:text-atelie-dourado/60 transition-colors"
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>

          {searchParams.erro && (
            <div className="flex items-center gap-3 bg-atelie-terracota/10 border border-atelie-terracota/20 rounded-lg px-4 py-3 animate-scaleIn">
              <svg className="w-4 h-4 text-atelie-terracotaClaro shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-atelie-terracotaClaro text-sm">Senha incorreta. Tente novamente.</p>
            </div>
          )}

          <button type="submit" className="w-full btn-dourado py-2.5">
            Entrar
          </button>

          <div className="divider-gold" />

          <p className="text-center text-[10px] text-atelie-textoMuted/50 uppercase tracking-[0.1em]">
            Acesso restrito ao artista
          </p>
        </form>
      </div>
    </div>
  );
}
