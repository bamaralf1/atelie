'use client';

import Link from 'next/link';
import { useAtalhos } from '@/components/ui/AtalhosTeclado';
import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';
import { PaletaAtalhos } from '@/components/ui/AtalhosTeclado';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [paletaAberta, setPaletaAberta] = useState(false);

  useAtalhos([
    { tecla: 'meta+n', descricao: 'Nova obra', acao: () => router.push('/admin/nova-obra') },
    { tecla: 'meta+1', descricao: 'Ir para obras', acao: () => router.push('/admin') },
    { tecla: '?', descricao: 'Abrir atalhos', acao: () => setPaletaAberta(true) },
  ]);

  const isObrasPage = pathname === '/admin';

  return (
    <div className="min-h-screen bg-atelie-fundo">
      {paletaAberta && <PaletaAtalhos />}
      <header className="border-b border-white/[0.06] bg-black/60 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/admin" className="font-display text-xl text-atelie-dourado italic hover:text-atelie-douradoClaro transition-colors">
              Ateliê
            </Link>
            <nav className="hidden sm:flex items-center gap-1">
              <Link
                href="/admin"
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  isObrasPage
                    ? 'bg-atelie-dourado/15 text-atelie-douradoClaro'
                    : 'text-atelie-textoMuted hover:text-atelie-texto hover:bg-white/5'
                }`}
              >
                Obras
              </Link>
              <Link
                href="/admin/nova-obra"
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  pathname === '/admin/nova-obra'
                    ? 'bg-atelie-dourado/15 text-atelie-douradoClaro'
                    : 'text-atelie-textoMuted hover:text-atelie-texto hover:bg-white/5'
                }`}
              >
                Nova Obra
              </Link>
            </nav>
          </div>
          <Link
            href="/admin/nova-obra"
            className="btn-dourado px-4 py-1.5 text-xs"
          >
            <span className="flex items-center gap-1.5">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              Nova Obra
            </span>
          </Link>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
