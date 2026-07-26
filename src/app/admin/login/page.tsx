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
    <div className="min-h-screen flex items-center justify-center bg-atelie-fundo px-4">
      <div className="w-full max-w-sm animate-fadeInUp">
        {/* Logo */}
        <div className="text-center mb-8">
          <p className="font-display text-5xl text-atelie-dourado italic mb-2">Atelier Bruno Amaral</p>
          <p className="text-atelie-textoMuted text-sm">Acesso ao painel do artista</p>
        </div>

        <form
          action={autenticar}
          className="bg-atelie-superficie border border-atelie-borda rounded-lg p-8"
        >
          <input type="hidden" name="redirect" value={searchParams.redirect || '/admin'} />

          <label className="block text-xs uppercase tracking-wide text-atelie-textoMuted mb-2">
            Senha de acesso
          </label>
          <div className="relative">
            <input
              type="password"
              name="senha"
              required
              autoFocus
              className="input-atelie pr-10"
              placeholder="Digite sua senha"
            />
            <svg
              className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-atelie-textoMuted"
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>

          {searchParams.erro && (
            <div className="flex items-center gap-2 bg-atelie-terracota/10 border border-atelie-terracota/30 rounded-md px-3 py-2 mt-4">
              <svg className="w-4 h-4 text-atelie-terracotaClaro shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-atelie-terracotaClaro text-sm">Senha incorreta. Tente novamente.</p>
            </div>
          )}

          <button
            type="submit"
            className="w-full btn-dourado py-2.5 mt-5"
          >
            Entrar
          </button>

          <p className="text-center text-[10px] text-atelie-textoMuted mt-4">
            Acesso restrito ao artista
          </p>
        </form>
      </div>
    </div>
  );
}
