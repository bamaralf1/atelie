import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-atelie-fundo">
      <header className="border-b border-atelie-borda">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link href="/admin" className="font-display text-2xl text-atelie-dourado italic">
            Ateliê
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/admin" className="text-atelie-textoMuted hover:text-atelie-texto transition-colors">
              Obras
            </Link>
            <Link
              href="/admin/nova-obra"
              className="bg-atelie-dourado text-atelie-fundo px-4 py-2 rounded-md font-medium hover:bg-atelie-douradoClaro transition-colors"
            >
              + Nova Obra
            </Link>
          </nav>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
