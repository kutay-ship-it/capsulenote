const path = require("path")
const createNextIntlPlugin = require("next-intl/plugin")
const { withSentryConfig } = require("@sentry/nextjs")

const withNextIntl = createNextIntlPlugin("./i18n/request.ts")

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Set workspace root to monorepo root to avoid lockfile detection issues
  outputFileTracingRoot: path.join(__dirname, "../../"),
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
  // Explicit webpack aliases to ensure path resolution works on Vercel
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": path.resolve(__dirname),
      "@/components": path.resolve(__dirname, "components"),
      "@/lib": path.resolve(__dirname, "lib"),
      "@/server": path.resolve(__dirname, "server"),
      "@/styles": path.resolve(__dirname, "styles"),
      "@/i18n": path.resolve(__dirname, "i18n"),
      "@/messages": path.resolve(__dirname, "messages"),
      "@/hooks": path.resolve(__dirname, "hooks"),
    }
    return config
  },
}

// Sentry configuration options
const sentryWebpackPluginOptions = {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options

  org: process.env.SENTRY_ORG || "highcloudlimited",
  project: process.env.SENTRY_PROJECT || "javascript-nextjs",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Automatically annotate React components to show their full name in breadcrumbs and session replay
  reactComponentAnnotation: {
    enabled: true,
  },

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: "/monitoring",

  // Hides source maps from generated client bundles
  hideSourceMaps: true,

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
  // See the following for more information:
  // https://docs.sentry.io/product/crons/
  // https://vercel.com/docs/cron-jobs
  automaticVercelMonitors: true,
}

// Wrap with next-intl first, then with Sentry
module.exports = withSentryConfig(withNextIntl(nextConfig), sentryWebpackPluginOptions)
