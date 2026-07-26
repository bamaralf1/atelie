/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // otimizado para deploy na Vercel/containers
  experimental: {
    // O padrão do Next.js para envio de dados em Server Actions é 1MB,
    // insuficiente para fotos de obras/referências. Aumentamos para 10MB.
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        // Aceita qualquer subdomínio *.supabase.co (Supabase Storage)
        hostname: '*.supabase.co',
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
