const path = require("path")
const createNextIntlPlugin = require("next-intl/plugin")
const { withSentryConfig } = require("@sentry/nextjs")

// Only load bundle-analyzer when ANALYZE=true (it's a devDependency)
const withBundleAnalyzer = process.env.ANALYZE === "true"
  ? require("@next/bundle-analyzer")({ enabled: true })
  : (config) => config

const withNextIntl = createNextIntlPlugin("./i18n/request.ts")

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Set workspace root to monorepo root to avoid lockfile detection issues
  outputFileTracingRoot: path.join(__dirname, "../../"),
  // Mark packages as external that need special handling on serverless
  serverExternalPackages: [],
  // Next.js 16: React Compiler for auto-memoization (major TBT reduction)
  reactCompiler: true,
  experimental: {
    // Next.js 16: ppr replaced by cacheComponents (not enabling yet)
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  // Security headers for all routes
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.clerk.com https://challenges.cloudflare.com https://js.stripe.com https://*.clerk.accounts.dev https://clerk.capsulenote.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https: blob:",
              "font-src 'self' data:",
              "connect-src 'self' https://api.clerk.com https://api.stripe.com https://api.resend.com https://*.upstash.io wss://*.clerk.com https://*.clerk.accounts.dev https://clerk.capsulenote.com",
              "frame-src https://challenges.cloudflare.com https://js.stripe.com https://hooks.stripe.com https://*.clerk.accounts.dev https://clerk.capsulenote.com",
              "frame-ancestors 'none'",
              "worker-src 'self' blob:",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
        ],
      },
    ]
  },
  async redirects() {
    return [
      // Legacy app routes → V3 equivalents
      { source: "/dashboard", destination: "/journey", permanent: true },
      { source: "/:locale(en|tr)/dashboard", destination: "/:locale/journey", permanent: true },
      // Preserve nested legacy dashboard links (e.g. /dashboard/settings → /settings)
      { source: "/dashboard/:path*", destination: "/:path*", permanent: true },
      { source: "/:locale(en|tr)/dashboard/:path*", destination: "/:locale/:path*", permanent: true },
      { source: "/deliveries", destination: "/letters", permanent: true },
      { source: "/:locale(en|tr)/deliveries", destination: "/:locale/letters", permanent: true },
      // Delivery IDs don't map cleanly; redirect to letters hub
      { source: "/deliveries/:path*", destination: "/letters", permanent: true },
      { source: "/:locale(en|tr)/deliveries/:path*", destination: "/:locale/letters", permanent: true },

      // Deprecated support route (redirect to Contact)
      { source: "/support", destination: "/contact", permanent: true },
      { source: "/support/:path*", destination: "/contact", permanent: true },
      { source: "/:locale(en|tr)/support", destination: "/:locale/contact", permanent: true },
      { source: "/:locale(en|tr)/support/:path*", destination: "/:locale/contact", permanent: true },

      // Deprecated marketing route (removed)
      { source: "/landing-v2", destination: "/", permanent: true },
      { source: "/landing-v2/:path*", destination: "/", permanent: true },
      { source: "/:locale(en|tr)/landing-v2", destination: "/:locale", permanent: true },
      { source: "/:locale(en|tr)/landing-v2/:path*", destination: "/:locale", permanent: true },
    ]
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

// Wrap with next-intl first, then bundle analyzer, then Sentry
module.exports = withSentryConfig(
  withBundleAnalyzer(withNextIntl(nextConfig)),
  sentryWebpackPluginOptions
)
