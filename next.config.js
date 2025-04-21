// In next.config.js
const nextConfig = {
    images: {
      domains: ['firebasestorage.googleapis.com'],
      formats: ['image/avif', 'image/webp'],
    },
    webpack(config) {
      config.module.rules.push({
        test: /\.svg$/,
        use: ['@svgr/webpack'],
      });
      return config;
    },
  };
  
  module.exports = nextConfig;