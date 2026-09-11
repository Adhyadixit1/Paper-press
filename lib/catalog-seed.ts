import { b2bCategories, type B2BCategory } from "../app/catalog";
import { products } from "../app/data";
import { categoryCardGallery, productCardGallery } from "../app/cardGalleries";

export type CatalogEntry = B2BCategory & {
  id: string;
  kind: "category" | "product";
  status: "published" | "draft" | "archived";
  images: string[];
  description: string;
  seo_title: string;
  seo_description: string;
  updated_at: string;
  eyebrow: string;
  delivery: string;
  image: string;
  badge?: string;
};
export function seedCatalog(): CatalogEntry[] {
  const base = {
    description: "",
    seo_title: "",
    seo_description: "",
    updated_at: "2026-09-01T00:00:00Z",
    status: "published" as const,
  };
  return [
    ...b2bCategories.map((p) => ({
      ...base,
      ...p,
      id: `category:${p.slug}`,
      kind: "category" as const,
      images: categoryCardGallery(p.slug),
      image: categoryCardGallery(p.slug)[0],
      eyebrow: p.moq,
      delivery: "Quoted per production run",
    })),
    ...products.map((p) => ({
      ...base,
      ...p,
      id: `product:${p.slug}`,
      kind: "product" as const,
      family:
        b2bCategories.find((c) => c.slug === p.slug)?.family ||
        "Print & Packaging",
      summary: `${p.name} with custom artwork, material options and pan-India delivery.`,
      moq: p.eyebrow,
      sizes: ["Custom size"],
      grades: ["Economy", "Standard", "Premium"],
      uses: ["Business buyers"],
      branded: true,
      images: productCardGallery(p.slug, p.image),
    })),
  ];
}
