import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

export const env = createEnv({
  /**
   * Server-side environment variables schema
   */
  server: {
    // App
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

    // Database
    DATABASE_URL: z.string().url(),

    // Clerk
    CLERK_SECRET_KEY: z.string().min(1),
    CLERK_WEBHOOK_SECRET: z.string().min(1),

    // Stripe
    STRIPE_SECRET_KEY: z.string().min(1),
    STRIPE_WEBHOOK_SECRET: z.string().min(1),
    STRIPE_PRICE_PRO_MONTHLY: z.string().min(1),
    STRIPE_PRICE_PRO_ANNUAL: z.string().min(1),

    // Email
    RESEND_API_KEY: z.string().min(1),
    EMAIL_FROM: z.string().email().default("no-reply@mail.dearme.app"),

    // Inngest
    INNGEST_SIGNING_KEY: z.string().min(1),
    INNGEST_EVENT_KEY: z.string().min(1),

    // Upstash Redis
    UPSTASH_REDIS_REST_URL: z.string().url(),
    UPSTASH_REDIS_REST_TOKEN: z.string().min(1),

    // Lob (Optional)
    LOB_API_KEY: z.string().optional(),
  },

  /**
   * Client-side environment variables schema
   */
  client: {
    NEXT_PUBLIC_APP_URL: z.string().url(),
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1),
    NEXT_PUBLIC_CLERK_SIGN_IN_URL: z.string().default("/sign-in"),
    NEXT_PUBLIC_CLERK_SIGN_UP_URL: z.string().default("/sign-up"),
    NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: z.string().default("/dashboard"),
    NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: z.string().default("/dashboard"),
  },

  /**
   * Runtime environment variables mapping
   */
  runtimeEnv: {
    // Server
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL,
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
    CLERK_WEBHOOK_SECRET: process.env.CLERK_WEBHOOK_SECRET,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    STRIPE_PRICE_PRO_MONTHLY: process.env.STRIPE_PRICE_PRO_MONTHLY,
    STRIPE_PRICE_PRO_ANNUAL: process.env.STRIPE_PRICE_PRO_ANNUAL,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    EMAIL_FROM: process.env.EMAIL_FROM,
    INNGEST_SIGNING_KEY: process.env.INNGEST_SIGNING_KEY,
    INNGEST_EVENT_KEY: process.env.INNGEST_EVENT_KEY,
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
    LOB_API_KEY: process.env.LOB_API_KEY,

    // Client
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    NEXT_PUBLIC_CLERK_SIGN_IN_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL,
    NEXT_PUBLIC_CLERK_SIGN_UP_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL,
    NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL,
    NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL,
  },

  /**
   * Skip validation in build if true
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,

  /**
   * Empty strings should be treated as undefined
   */
  emptyStringAsUndefined: true,
})
