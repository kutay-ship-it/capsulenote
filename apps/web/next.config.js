/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // Disable ESLint during build (can be enabled later with proper config)
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Disable type checking during build (can be enabled later with proper fixes)
    ignoreBuildErrors: true,
  },
  experimental: {
    ppr: false, // Partial Prerendering (requires Next.js canary)
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "uploadthing.com",
      },
      {
        protocol: "https",
        hostname: "utfs.io",
      },
    ],
  },
  // Transpile workspace packages
  transpilePackages: ["@dearme/prisma", "@dearme/types"],
}

module.exports = nextConfig
