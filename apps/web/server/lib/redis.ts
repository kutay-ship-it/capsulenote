import { Redis } from "@upstash/redis"
import { Ratelimit } from "@upstash/ratelimit"
import { env } from "@/env.mjs"

export const redis = new Redis({
  url: env.UPSTASH_REDIS_REST_URL,
  token: env.UPSTASH_REDIS_REST_TOKEN,
})

// Rate limiters
export const ratelimit = {
  // General API rate limit: 100 requests per minute
  api: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, "1 m"),
    analytics: true,
  }),

  // Letter creation: 10 per hour
  createLetter: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "1 h"),
    analytics: true,
  }),

  // Delivery scheduling: 20 per hour
  scheduleDelivery: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, "1 h"),
    analytics: true,
  }),

  // Contact form: 5 per hour per IP
  contactForm: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "1 h"),
    analytics: true,
  }),

  // Webhook rate limits (per IP)
  webhook: {
    stripe: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(200, "1 m"),
      analytics: true,
      prefix: "ratelimit:webhook:stripe",
    }),
    clerk: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(200, "1 m"),
      analytics: true,
      prefix: "ratelimit:webhook:clerk",
    }),
    resend: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(500, "1 m"),
      analytics: true,
      prefix: "ratelimit:webhook:resend",
    }),
    lob: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(100, "1 m"),
      analytics: true,
      prefix: "ratelimit:webhook:lob",
    }),
  },

  // Cron job rate limit: 20 per hour (prevents abuse)
  cron: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, "1 h"),
    analytics: true,
    prefix: "ratelimit:cron",
  }),

  // Share token access: 20 per hour per token
  shareToken: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, "1 h"),
    analytics: true,
    prefix: "ratelimit:share",
  }),
}
