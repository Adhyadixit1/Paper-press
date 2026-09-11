import "server-only";
import { createClient } from "@supabase/supabase-js";

export const databaseConfigured = () =>
  Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SECRET_KEY,
  );
export function database() {
  if (!databaseConfigured()) throw new Error("Supabase is not configured");
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
export async function requireAdmin(request: Request) {
  const token = request.headers.get("authorization")?.replace(/^Bearer /, "");
  if (!token) throw new Error("Unauthorized");
  const db = database();
  const {
    data: { user },
    error,
  } = await db.auth.getUser(token);
  if (error || !user) throw new Error("Unauthorized");
  const { data } = await db
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!data) throw new Error("Forbidden");
  return { db, user };
}
export function apiError(error: unknown) {
  const message =
    error instanceof SyntaxError
      ? "Invalid JSON request"
      : error instanceof Error
        ? error.message
        : "Request failed";
  const status =
    message === "Unauthorized"
      ? 401
      : message === "Forbidden"
        ? 403
        : message.startsWith("Invalid")
          ? 400
          : 503;
  return Response.json(
    {
      error:
        status === 503
          ? "Service unavailable. Check database setup and try again."
          : message,
    },
    { status },
  );
}
export function sameOrigin(request: Request) {
  const url = new URL(request.url);
  // Next normalizes loopback request.url to localhost; the browser's Host
  // retains 127.0.0.1. Compare against that actual host, never an arbitrary
  // forwarded-host header, while retaining exact scheme/port validation.
  const host = request.headers.get("host") || url.host;
  return request.headers.get("origin") === `${url.protocol}//${host}`;
}
