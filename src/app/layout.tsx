import type { Metadata } from 'next';
import { Fraunces, Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

// Fonte de display (serifada, com caráter) — usada em títulos e no wordmark do ateliê.
const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
});

// Fonte de corpo — legível e neutra, para textos e formulários.
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['400', '500', '600', '700'],
});

// Fonte utilitária para dados/valores (materiais, custos, datas).
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500'],
});

export const metadata: Metadata = {
  title: 'Ateliê — Acompanhamento de Obras',
  description: 'Acompanhe em tempo real o andamento da sua pintura a óleo.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${fraunces.variable} ${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-atelie-fundo text-atelie-texto font-body antialiased">
        {children}
      </body>
    </html>
  );
}
