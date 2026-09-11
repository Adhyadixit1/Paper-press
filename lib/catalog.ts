import "server-only";
import { cache } from "react";
import { database, databaseConfigured } from "./supabase";
import { seedCatalog, type CatalogEntry } from "./catalog-seed";
export type { CatalogEntry } from "./catalog-seed";
export const getCatalog = cache(async (): Promise<CatalogEntry[]> => {
  if (!databaseConfigured()) return seedCatalog();
  const { data, error } = await database()
    .from("products")
    .select("*")
    .eq("status", "published")
    .order("sort_order")
    .order("name");
  if (error) throw new Error("Catalog temporarily unavailable");
  return data as CatalogEntry[];
});
export async function getCategories() {
  return (await getCatalog()).filter((p) => p.kind === "category");
}
export async function getProducts() {
  return (await getCatalog()).filter((p) => p.kind === "product");
}
export async function getEntry(kind: string, slug: string) {
  return (await getCatalog()).find((p) => p.kind === kind && p.slug === slug);
}
