/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.NEXT_PUBLIC_API_URL 
          ? `${process.env.NEXT_PUBLIC_API_URL}/api/:path*`
          : 'http://localhost:5000/api/:path*', // Si estás en local
      },
    ];
  },
  webpack: (config, { isServer }) => {
    // Ejemplo de uso de __dirname en CommonJS
    config.resolve.alias['@my-path'] = require('path').join(__dirname, 'src', 'my-path');
    return config;
  },
  // Otras configuraciones...
  // --- MODIFICA ESTA LÍNEA ---
  //transpilePackages: ['@react-pdf/renderer', 'fontkit'],
  // -------------------------
};

module.exports = nextConfig;
