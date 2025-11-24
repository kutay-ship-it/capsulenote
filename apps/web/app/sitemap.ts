import type { MetadataRoute } from "next"

const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://calsulenote.com").replace(/\/$/, "")

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()

  const routes: Array<{
    path: string
    priority: number
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]
  }> = [
    { path: "", priority: 1.0, changeFrequency: "weekly" },
    { path: "/pricing", priority: 0.9, changeFrequency: "weekly" },
    { path: "/write-letter", priority: 0.8, changeFrequency: "weekly" },
    { path: "/demo-letter", priority: 0.6, changeFrequency: "monthly" },
  ]

  return routes.map(({ path, priority, changeFrequency }) => ({
    url: `${appUrl}${path}`,
    lastModified,
    changeFrequency,
    priority,
  }))
}
