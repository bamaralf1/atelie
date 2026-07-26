/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // otimizado para deploy na Vercel/containers
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
