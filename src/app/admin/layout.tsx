'use client';

import Link from 'next/link';
import { useAtalhos } from '@/components/ui/AtalhosTeclado';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { PaletaAtalhos } from '@/components/ui/AtalhosTeclado';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [paletaAberta, setPaletaAberta] = useState(false);

  useAtalhos([
    { tecla: 'meta+n', descricao: 'Nova obra', acao: () => router.push('/admin/nova-obra') },
    { tecla: 'meta+1', descricao: 'Ir para obras', acao: () => router.push('/admin') },
    { tecla: '?', descricao: 'Abrir atalhos', acao: () => setPaletaAberta(true) },
  ]);

  return (
    <div className="min-h-screen bg-atelie-fundo">
      {paletaAberta && <PaletaAtalhos />}
      <header className="border-b border-atelie-borda bg-atelie-superficie/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/admin" className="font-display text-2xl text-atelie-dourado italic hover:text-atelie-douradoClaro transition-colors">
            Ateliê
          </Link>
          <nav className="flex items-center gap-3 text-sm">
            <Link
              href="/admin"
              className="text-atelie-textoMuted hover:text-atelie-texto transition-colors"
            >
              Obras
            </Link>
            <Link
              href="/admin/nova-obra"
              className="btn-dourado px-4 py-2 text-sm"
            >
              <span className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Nova Obra
              </span>
            </Link>
          </nav>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
