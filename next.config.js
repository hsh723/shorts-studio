/** @type {import('next').NextConfig} */
const port = process.env.PORT || 5000;

const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
    };
    return config;
  },
  server: {
    port: port
  }
}

module.exports = nextConfig 