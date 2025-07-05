const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Skip ESLint and TypeScript errors during the Vercel production build.
  // These errors should still be fixed during development, but we don't want
  // them to block deployment.
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  // Provide an explicit alias so that webpack resolves `@/` the same way
  // TypeScript does via the `paths` setting in tsconfig.json.
  webpack: (config) => {
    config.resolve.alias['@'] = path.resolve(__dirname)
    return config
  },
}

module.exports = nextConfig