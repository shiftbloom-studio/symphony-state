// SPDX-License-Identifier: AGPL-3.0-or-later
import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";

export const dynamic = "force-static";

// Legal pages are noindex and stay out of the sitemap.
const routes = [
  { path: "/", priority: 1 },
  { path: "/docs/mental-model", priority: 0.8 },
  { path: "/playground", priority: 0.7 },
  { path: "/demo/inventory", priority: 0.7 },
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map(({ path, priority }) => ({
    url: new URL(path, siteUrl).toString(),
    changeFrequency: "monthly",
    priority,
  }));
}
