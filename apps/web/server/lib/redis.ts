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
}
