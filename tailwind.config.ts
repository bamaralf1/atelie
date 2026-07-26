import type { Config } from 'tailwindcss';

// Paleta do ateliê: pretos e cinzas quentes, com dourado e terracota como acentos.
const config: Config = {
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        atelie: {
          fundo: '#0E0D0C',      // preto quente de fundo
          superficie: '#18160F', // cards e painéis
          superficie2: '#211E17',
          borda: '#332E24',
          texto: '#EDE7DC',      // texto principal (marfim)
          textoMuted: '#9A9086', // texto secundário
          dourado: '#C6A15B',    // acento principal (dourado envelhecido)
          douradoClaro: '#E0C27E',
          terracota: '#B5563A',  // acento secundário (terracota)
          terracotaClaro: '#D97B5E',
        },
      },
      fontFamily: {
        display: ['var(--font-display)'],
        body: ['var(--font-body)'],
        mono: ['var(--font-mono)'],
      },
      boxShadow: {
        dourado: '0 0 0 1px rgba(198,161,91,0.35)',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        progresso: {
          '0%': { width: '0%' },
        },
      },
      animation: {
        fadeInUp: 'fadeInUp .5s ease-out both',
      },
    },
  },
  plugins: [],
};

export default config;
