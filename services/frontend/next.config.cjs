/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
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