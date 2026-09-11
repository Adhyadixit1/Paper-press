import { createClient } from "@supabase/supabase-js";
import { seedCatalog } from "../lib/catalog-seed";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY;
if (!url || !key)
  throw new Error("Load your local Supabase environment first.");
const db = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const entries = seedCatalog().map((entry, index) => {
  const {
    id,
    kind,
    slug,
    name,
    family,
    summary,
    description,
    price,
    moq,
    sizes,
    grades,
    uses,
    branded,
    images,
    image,
    eyebrow,
    delivery,
    badge,
    status,
    seo_title,
    seo_description,
    updated_at,
  } = entry;
  return {
    id,
    kind,
    slug,
    name,
    family,
    summary,
    description,
    price,
    moq,
    sizes,
    grades,
    uses,
    branded,
    images,
    image,
    eyebrow,
    delivery,
    badge: badge || null,
    status,
    seo_title,
    seo_description,
    updated_at,
    sort_order: index,
  };
});
// Idempotent import: existing rows, including archived products, are never overwritten.
const { error } = await db
  .from("products")
  .upsert(entries, { onConflict: "id", ignoreDuplicates: true });
if (error)
  throw new Error(
    `Catalog import failed (${error.code}). Check schema and service credentials.`,
  );
console.log(
  `Catalog import complete: ${entries.length} initial entries considered; existing entries preserved.`,
);
