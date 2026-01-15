/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  experimental: {
    optimizePackageImports: ["@chakra-ui/react"],
  },
  webpack: (config) => {
    // Configure fallbacks for server-only modules
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false, // Set `fs` to `false` to avoid bundling
      net: false,
      child_process: false,
      // path: require.resolve('path-browserify'), // Use browser polyfill for `path`
      // os: require.resolve('os-browserify/browser'), // Use browser polyfill for `os`
    };
    return config;
  },
  turbopack: {}
}

module.exports = nextConfig
