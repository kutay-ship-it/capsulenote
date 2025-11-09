/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    ppr: true, // Partial Prerendering
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
