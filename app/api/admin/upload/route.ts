import { requireAdmin, apiError, sameOrigin } from "../../../../lib/supabase";
export async function POST(request: Request) {
  try {
    if (!sameOrigin(request)) throw new Error("Forbidden");
    const { db } = await requireAdmin(request);
    if (Number(request.headers.get("content-length") || 0) > 9 * 1024 * 1024)
      throw new Error("Invalid upload: maximum 8 MB");
    const file = (await request.formData()).get("file");
    const ext: Record<string, string> = {
      "image/png": "png",
      "image/jpeg": "jpg",
      "image/webp": "webp",
      "image/avif": "avif",
    };
    if (
      !(file instanceof File) ||
      !ext[file.type] ||
      file.size > 8 * 1024 * 1024
    )
      throw new Error("Invalid image: PNG, JPEG, WebP or AVIF, maximum 8 MB");
    const bytes = new Uint8Array(await file.arrayBuffer());
    const valid =
      file.type === "image/png"
        ? bytes[0] === 137 && bytes[1] === 80
        : file.type === "image/jpeg"
          ? bytes[0] === 255 && bytes[1] === 216
          : file.type === "image/webp"
            ? new TextDecoder().decode(bytes.slice(8, 12)) === "WEBP"
            : new TextDecoder().decode(bytes.slice(4, 12)) === "ftypavif";
    if (!valid) throw new Error("Invalid image contents");
    const path = `catalog/${crypto.randomUUID()}.${ext[file.type]}`;
    const { error } = await db.storage
      .from("product-images")
      .upload(path, bytes, { contentType: file.type, upsert: false });
    if (error) throw error;
    return Response.json({
      url: db.storage.from("product-images").getPublicUrl(path).data.publicUrl,
    });
  } catch (e) {
    return apiError(e);
  }
}
