import { cookies } from "next/headers";
import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import {
  database,
  databaseConfigured,
  sameOrigin,
} from "../../../lib/supabase";
const allowed = [
  "page_view",
  "product_view",
  "add_to_cart",
  "remove_from_cart",
  "whatsapp_click",
  "search",
  "heartbeat",
];
export async function POST(request: Request) {
  if (!databaseConfigured()) return new Response(null, { status: 204 });
  if (!sameOrigin(request)) return new Response(null, { status: 403 });
  if (
    /bot|crawler|spider|headless/i.test(
      request.headers.get("user-agent") || "",
    ) ||
    request.headers.get("sec-gpc") === "1" ||
    request.headers.get("dnt") === "1"
  )
    return new Response(null, { status: 204 });
  try {
    if (Number(request.headers.get("content-length") || 0) > 4096)
      return new Response(null, { status: 413 });
    const raw = await request.text();
    if (raw.length > 4096) return new Response(null, { status: 413 });
    const p = JSON.parse(raw);
    if (
      !allowed.includes(p.type) ||
      !/^\/(?!\/)/.test(p.path) ||
      p.path.length > 200 ||
      !/^[0-9a-f-]{36}$/.test(p.id)
    )
      return new Response(null, { status: 400 });
    if (p.path.startsWith("/admin")) return new Response(null, { status: 204 });
    const cookieStore = await cookies();
    const secret = process.env.ANALYTICS_SIGNING_SECRET;
    if (!secret) return new Response(null, { status: 503 });
    const sign = (id: string) =>
      createHmac("sha256", secret).update(id).digest("hex");
    const value = cookieStore.get("pp_session")?.value || "";
    const [existing, signature] = value.split(".");
    const verified =
      existing &&
      /^[0-9a-f-]{36}$/.test(existing) &&
      signature?.length === 64 &&
      timingSafeEqual(Buffer.from(sign(existing)), Buffer.from(signature));
    const session = verified ? existing : randomUUID();
    const ua = request.headers.get("user-agent") || "";
    const geo = (header: string) =>
      process.env.VERCEL === "1"
        ? decodeURIComponent(request.headers.get(header) || "Unknown").slice(
            0,
            100,
          )
        : "Unknown";
    const ref = typeof p.referrer === "string" ? p.referrer : "";
    let referrer = "Direct";
    try {
      referrer = new URL(ref).hostname;
    } catch {}
    const payload = {
      id: p.id,
      session_id: session,
      type: p.type,
      path: p.path.split("?")[0],
      product: typeof p.product === "string" ? p.product.slice(0, 150) : "",
      seconds:
        p.type === "heartbeat"
          ? Math.max(0, Math.min(30, Math.floor(Number(p.seconds) || 0)))
          : 0,
      search_term:
        typeof p.search_term === "string" ? p.search_term.slice(0, 100) : "",
      city: geo("x-vercel-ip-city"),
      state: geo("x-vercel-ip-country-region"),
      country: geo("x-vercel-ip-country"),
      device: /iPad|Tablet/i.test(ua)
        ? "Tablet"
        : /Mobi|Android/i.test(ua)
          ? "Mobile"
          : "Desktop",
      referrer,
      source:
        typeof p.source === "string" && p.source
          ? p.source.slice(0, 100)
          : referrer,
    };
    const { error } = await database().rpc("record_event", { payload });
    if (error) return new Response(null, { status: 503 });
    cookieStore.set("pp_session", `${session}.${sign(session)}`, {
      httpOnly: true,
      sameSite: "lax",
      secure: new URL(request.url).protocol === "https:",
      maxAge: 1800,
      path: "/",
    });
    return new Response(null, { status: 204 });
  } catch {
    return new Response(null, { status: 400 });
  }
}
