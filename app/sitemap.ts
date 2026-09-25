import type { MetadataRoute } from "next"
import { CASE_SLUGS } from "@/lib/case-studies"

export const dynamic = "force-static"

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://monteirotf.com",
      changeFrequency: "monthly",
      priority: 1,
    },
    ...CASE_SLUGS.map((slug) => ({
      url: `https://monteirotf.com/projects/${slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ]
}
