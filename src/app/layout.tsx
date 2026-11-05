import type { Metadata } from 'next';
import './globals.css';
import { ToastProvider } from '@/components/ui/Toast';

export const metadata: Metadata = {
  title: 'Atelier Bruno Amaral — Acompanhamento de Obras',
  description: 'Acompanhe em tempo real o andamento da sua pintura a óleo.',
  icons: { icon: '/favicon.svg' },
  manifest: '/manifest.json',
  appleWebApp: { capable: true, title: 'Atelier Bruno Amaral', statusBarStyle: 'black-translucent' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Fontes carregadas em runtime: evita falha de build quando o Google Fonts está indisponível. */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
        />
      </head>
      <body className="bg-atelie-fundo text-atelie-texto font-body antialiased">
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
