/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['media.api-sports.io', 'assets.football-data.org'],
    unoptimized: false,
  },
  env: {
    FOOTBALL_DATA_API_KEY: process.env.FOOTBALL_DATA_API_KEY,
    SPORTMONKS_API_KEY: process.env.SPORTMONKS_API_KEY,
    LIVE_SCORE_API_KEY: process.env.LIVE_SCORE_API_KEY,
    LIVE_SCORE_API_SECRET: process.env.LIVE_SCORE_API_SECRET,
    API_FOOTBALL_KEY: process.env.API_FOOTBALL_KEY,
  },
  experimental: {
    serverActions: true,
  },
};

module.exports = nextConfig;
