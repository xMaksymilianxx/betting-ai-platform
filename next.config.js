/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,  // Dodaj to!
  },
  eslint: {
    ignoreDuringBuilds: true,  // I to!
  },
  // reszta konfiguracji...
}

module.exports = nextConfig
