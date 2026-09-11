import { requireAdmin, apiError, sameOrigin } from "../../../../lib/supabase";
import type { CatalogEntry } from "../../../../lib/catalog";
import { revalidatePath } from "next/cache";
const imageUrl = (v: string) =>
  /^\/(?!\/)[^\s]*$/.test(v) || /^https:\/\/[^\s]+$/.test(v);
export async function GET(request: Request) {
  try {
    const { db } = await requireAdmin(request);
    const { data, error } = await db
      .from("products")
      .select("*")
      .order("sort_order")
      .order("name");
    if (error) throw error;
    return Response.json(data, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    return apiError(e);
  }
}
export async function POST(request: Request) {
  try {
    if (!sameOrigin(request)) throw new Error("Forbidden");
    const { db } = await requireAdmin(request);
    if (Number(request.headers.get("content-length") || 0) > 64000)
      throw new Error("Invalid product size");
    const raw = await request.text();
    if (raw.length > 64000) throw new Error("Invalid product size");
    const p = JSON.parse(raw) as CatalogEntry & {
      sort_order?: number;
      isNew?: boolean;
      [key: string]: unknown;
    };
    if (!p || typeof p !== "object" || Array.isArray(p))
      throw new Error("Invalid product");
    if (
      !["category", "product"].includes(p.kind) ||
      !["published", "draft", "archived"].includes(p.status) ||
      typeof p.slug !== "string" ||
      !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(p.slug) ||
      p.slug.length > 100
    )
      throw new Error("Invalid slug or status");
    for (const key of [
      "name",
      "family",
      "summary",
      "description",
      "price",
      "moq",
      "seo_title",
      "seo_description",
      "delivery",
    ])
      if (
        typeof p[key] !== "string" ||
        p[key].length > (key === "description" ? 10000 : 1000)
      )
        throw new Error(`Invalid ${key}`);
    if (!p.name.trim() || !p.family.trim())
      throw new Error("Invalid name or family");
    for (const key of ["images", "sizes", "grades", "uses"])
      if (
        !Array.isArray(p[key]) ||
        p[key].length > 20 ||
        p[key].some((s: unknown) => typeof s !== "string" || s.length > 2000)
      )
        throw new Error(`Invalid ${key}`);
    if (
      p.images.some((s: string) => !imageUrl(s)) ||
      (p.status === "published" && !p.images.length)
    )
      throw new Error(
        "Invalid images; published products need at least one image",
      );
    const entry = {
      id: `${p.kind}:${p.slug}`,
      kind: p.kind,
      slug: p.slug,
      name: p.name.trim(),
      family: p.family.trim(),
      summary: p.summary,
      description: p.description,
      price: p.price,
      moq: p.moq,
      images: p.images,
      image: p.images[0] || "",
      sizes: p.sizes,
      grades: p.grades,
      uses: p.uses,
      branded: !!p.branded,
      status: p.status,
      seo_title: p.seo_title,
      seo_description: p.seo_description,
      eyebrow: p.moq,
      delivery: p.delivery,
      badge: typeof p.badge === "string" ? p.badge.slice(0, 80) : null,
      sort_order: Number.isInteger(p.sort_order) ? p.sort_order : 0,
      updated_at: new Date().toISOString(),
    };
    const result = p.isNew
      ? await db.from("products").insert(entry).select().single()
      : await db
          .from("products")
          .update(entry)
          .eq("id", entry.id)
          .select()
          .single();
    if (result.error) {
      if (result.error.code === "23505")
        throw new Error("Invalid slug: already exists");
      throw result.error;
    }
    revalidatePath("/", "layout");
    return Response.json(result.data);
  } catch (e) {
    return apiError(e);
  }
}
export async function DELETE(request: Request) {
  try {
    if (!sameOrigin(request)) throw new Error("Forbidden");
    const { db } = await requireAdmin(request);
    const { id } = (await request.json()) as { id?: unknown };
    if (typeof id !== "string") throw new Error("Invalid product");
    const { error } = await db
      .from("products")
      .update({ status: "archived", updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw error;
    revalidatePath("/", "layout");
    return Response.json({ ok: true });
  } catch (e) {
    return apiError(e);
  }
}
