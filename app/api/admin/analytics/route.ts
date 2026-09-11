import { requireAdmin, apiError } from "../../../../lib/supabase";
export async function GET(request: Request) {
  try {
    const { db } = await requireAdmin(request);
    const q = new URL(request.url).searchParams;
    const session = q.get("session");
    if (session) {
      if (!/^[0-9a-f-]{36}$/.test(session)) throw new Error("Invalid session");
      const { data, error } = await db
        .from("analytics_events")
        .select("*")
        .eq("session_id", session)
        .neq("type", "heartbeat")
        .order("created_at")
        .limit(500);
      if (error) throw error;
      return Response.json(
        { events: data },
        { headers: { "Cache-Control": "no-store" } },
      );
    }
    const from = new Date(q.get("from") || Date.now() - 7 * 86400000);
    const to = new Date(q.get("to") || Date.now());
    if (
      !Number.isFinite(+from) ||
      !Number.isFinite(+to) ||
      to <= from ||
      +to - +from > 366 * 86400000
    )
      throw new Error("Invalid date range: choose up to 366 days");
    const filters = {
      from: from.toISOString(),
      to: to.toISOString(),
      city: (q.get("city") || "").slice(0, 100),
      state: (q.get("state") || "").slice(0, 100),
      product: (q.get("product") || "").slice(0, 150),
      device: q.get("device") || "",
      event: q.get("event") || "",
      offset: Math.max(0, Math.min(100000, Number(q.get("offset")) || 0)),
    };
    const { data, error } = await db.rpc("analytics_report", { filters });
    if (error) throw error;
    return Response.json(data, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    return apiError(e);
  }
}
