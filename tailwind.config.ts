import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        atelie: {
          fundo: '#0E0D0C',
          superficie: '#18160F',
          superficie2: '#211E17',
          borda: '#332E24',
          texto: '#EDE7DC',
          textoMuted: '#9A9086',
          dourado: '#C6A15B',
          douradoClaro: '#E0C27E',
          terracota: '#B5563A',
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
        'dourado-lg': '0 0 25px rgba(198,161,91,0.15), 0 0 0 1px rgba(198,161,91,0.3)',
        'dourado-xl': '0 0 40px rgba(198,161,91,0.12), 0 0 0 1px rgba(198,161,91,0.25)',
        glass: '0 8px 32px rgba(0,0,0,0.3)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseDot: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        goldPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(198,161,91,0.15)' },
          '50%': { boxShadow: '0 0 30px rgba(198,161,91,0.3)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
      animation: {
        fadeInUp: 'fadeInUp .5s ease-out both',
        fadeIn: 'fadeIn .4s ease-out both',
        slideUp: 'slideUp .5s ease-out both',
        pulseDot: 'pulseDot 2s ease-in-out infinite',
        shimmer: 'shimmer 2s linear infinite',
        goldPulse: 'goldPulse 2s ease-in-out infinite',
        float: 'float 3s ease-in-out infinite',
        scaleIn: 'scaleIn .3s ease-out both',
        slideInRight: 'slideInRight .4s ease-out both',
      },
    },
  },
  plugins: [],
};

export default config;
