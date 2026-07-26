import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

/**
 * Login simples do painel admin: compara a senha enviada com ADMIN_PASSWORD
 * e grava um cookie de sessão. Ver src/middleware.ts para a proteção de rotas.
 */
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
      maxAge: 60 * 60 * 24 * 7, // 7 dias
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
      <form
        action={autenticar}
        className="w-full max-w-sm bg-atelie-superficie border border-atelie-borda rounded-lg p-8 animate-fadeInUp"
      >
        <h1 className="font-display text-3xl text-atelie-dourado mb-1">Ateliê</h1>
        <p className="text-atelie-textoMuted text-sm mb-6">Acesso ao painel do artista</p>

        <input type="hidden" name="redirect" value={searchParams.redirect || '/admin'} />

        <label className="block text-xs uppercase tracking-wide text-atelie-textoMuted mb-2">
          Senha
        </label>
        <input
          type="password"
          name="senha"
          required
          autoFocus
          className="w-full bg-atelie-fundo border border-atelie-borda rounded-md px-3 py-2 text-atelie-texto focus:outline-none focus:ring-2 focus:ring-atelie-dourado/60 mb-4"
        />

        {searchParams.erro && (
          <p className="text-atelie-terracotaClaro text-sm mb-4">Senha incorreta. Tente novamente.</p>
        )}

        <button
          type="submit"
          className="w-full bg-atelie-dourado text-atelie-fundo font-medium rounded-md py-2 hover:bg-atelie-douradoClaro transition-colors"
        >
          Entrar
        </button>
      </form>
    </div>
  );
}
