import type { MetadataRoute } from "next";
import { getCatalog } from "../lib/catalog";
import { siteUrl } from "../lib/seo";
export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = [
    "",
    "/products",
    "/industries",
    "/about",
    "/quote",
    "/custom-size",
    "/delivery",
    "/sustainability",
    "/samples",
    "/help",
    "/contact",
    "/wholesale",
    "/privacy",
    "/terms",
  ];
  return [
    ...pages.map((path) => ({
      url: siteUrl + path,
      changeFrequency: "monthly" as const,
      priority: path === "" ? 1 : 0.6,
    })),
    ...(await getCatalog()).map((p) => ({
      url: `${siteUrl}/${p.kind === "category" ? "categories" : "products"}/${p.slug}`,
      lastModified: p.updated_at,
      changeFrequency: "weekly" as const,
      priority: 0.8,
      images: p.images.map((img) => new URL(img, siteUrl).href),
    })),
  ];
}
