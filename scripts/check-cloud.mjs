// Creates and cleans up QA fixtures only. Live runs require explicit opt-in.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
const base = process.env.TEST_SITE_URL || "http://127.0.0.1:3000";
const local = ["localhost", "127.0.0.1"].includes(new URL(base).hostname);
assert.ok(
  local ||
    (process.env.ALLOW_LIVE_TESTS === "1" &&
      base === "https://www.paperandpress.in"),
  "Unapproved test origin",
);
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const service = createClient(url, process.env.SUPABASE_SECRET_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const auth = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const password = readFileSync("work/admin-access.txt", "utf8").match(
  /^Password: (.+)$/m,
)[1];
const login = await auth.auth.signInWithPassword({
  email: "ojasvy33@gmail.com",
  password,
});
assert.ifError(login.error);
const headers = {
  Authorization: `Bearer ${login.data.session.access_token}`,
  Origin: base,
};
const slug = "qa-backend-" + Date.now();
const id = "category:" + slug;
let uploadPath, nonadminId, sessionId;
const request = (path, method = "GET", body, extra = {}) =>
  fetch(base + path, {
    method,
    headers: {
      ...headers,
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...extra,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
try {
  assert.equal((await fetch(base + "/api/admin/products")).status, 401);
  const all = await request("/api/admin/products");
  assert.equal(all.status, 200);
  const catalog = await all.json();
  assert.ok(catalog.length >= 49);
  const p = {
    ...catalog[0],
    id,
    kind: "category",
    slug,
    name: "QA backend verification",
    status: "draft",
    isNew: true,
  };
  let r = await request("/api/admin/products", "POST", p);
  assert.equal(r.status, 200, await r.text());
  assert.equal(
    (await auth.from("products").select("id").eq("id", id)).data.length,
    0,
  );
  r = await request("/api/admin/products", "POST", {
    ...p,
    isNew: false,
    status: "published",
    price: "₹10–₹20 / pc",
  });
  assert.equal(r.status, 200, await r.text());
  assert.equal(
    (await auth.from("products").select("price").eq("id", id)).data[0].price,
    "₹10–₹20 / pc",
  );
  assert.ok(
    (await (await fetch(base + "/categories/" + slug)).text()).includes(
      "QA backend verification",
    ),
  );
  assert.ok(
    (await (await fetch(base + "/sitemap.xml")).text()).includes(
      "/categories/" + slug,
    ),
  );
  const form = new FormData();
  form.append(
    "file",
    new File(
      [
        Buffer.from(
          "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aC5kAAAAASUVORK5CYII=",
          "base64",
        ),
      ],
      "qa.png",
      { type: "image/png" },
    ),
  );
  r = await fetch(base + "/api/admin/upload", {
    method: "POST",
    headers,
    body: form,
  });
  assert.equal(r.status, 200);
  const uploaded = await r.json();
  uploadPath = uploaded.url.split("/product-images/")[1];
  assert.equal((await fetch(uploaded.url)).status, 200);
  r = await request("/api/admin/products", "POST", {
    ...p,
    isNew: false,
    status: "published",
    images: [uploaded.url, ...p.images].slice(0, 20),
  });
  assert.equal(r.status, 200, await r.text());
  assert.equal(
    (await request("/api/admin/products", "DELETE", { id })).status,
    200,
  );
  assert.equal(
    (await auth.from("products").select("id").eq("id", id)).data.length,
    0,
  );
  assert.ok(
    !(await (await fetch(base + "/sitemap.xml")).text()).includes(
      "/categories/" + slug,
    ),
  );
  const ordinary = await service.auth.admin.createUser({
    email: `${slug}@example.com`,
    password: randomUUID() + randomUUID(),
    email_confirm: true,
  });
  assert.ifError(ordinary.error);
  nonadminId = ordinary.data.user.id;
  // Obtain an ordinary-user token without granting admin membership.
  const ordinaryPassword = randomUUID() + randomUUID();
  assert.ifError(
    (
      await service.auth.admin.updateUserById(nonadminId, {
        password: ordinaryPassword,
      })
    ).error,
  );
  const other = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const otherLogin = await other.auth.signInWithPassword({
    email: `${slug}@example.com`,
    password: ordinaryPassword,
  });
  assert.ifError(otherLogin.error);
  assert.equal(
    (
      await request("/api/admin/products", "GET", undefined, {
        Authorization: `Bearer ${otherLogin.data.session.access_token}`,
      })
    ).status,
    403,
  );
  for (const table of ["admin_users", "visitor_sessions", "analytics_events"])
    assert.ok((await other.from(table).select("*")).error);
  assert.ok(
    (
      await other.storage
        .from("product-images")
        .upload("qa-denied.png", new Uint8Array([1, 2]))
    ).error,
  );
  await other.auth.signOut();
  let cookie = "";
  const event = async (type, extra = {}) => {
    const res = await fetch(base + "/api/analytics", {
      method: "POST",
      headers: {
        Origin: base,
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 QA Browser",
        Cookie: cookie,
      },
      body: JSON.stringify({
        id: randomUUID(),
        type,
        path: "/categories/cake-boxes",
        product: "categories:cake-boxes",
        source: slug,
        ...extra,
      }),
    });
    assert.equal(res.status, 204);
    cookie = res.headers.get("set-cookie")?.split(";")[0] || cookie;
    sessionId = cookie.split("=")[1]?.split(".")[0];
  };
  await event("page_view");
  await event("product_view");
  await event("add_to_cart");
  await event("search", { search_term: "cake box QA" });
  await event("whatsapp_click");
  await new Promise((resolve) => setTimeout(resolve, 2100));
  await event("heartbeat", { seconds: 2 });
  const reportResponse = await request(
    "/api/admin/analytics?product=categories%3Acake-boxes",
  );
  assert.equal(reportResponse.status, 200);
  const report = await reportResponse.json();
  assert.ok(report.summary.cartAdds >= 1);
  assert.ok(report.searches.some((s) => s.term === "cake box QA"));
  assert.ok(report.summary.live >= 1);
  const session = (
    await service
      .from("visitor_sessions")
      .select("*")
      .eq("id", sessionId)
      .single()
  ).data;
  if (local) assert.equal(session.city, "Unknown");
  else
    console.log("Live geolocation:", {
      city: session.city,
      state: session.state,
      country: session.country,
    });
  assert.ok(session.active_seconds >= 2);
  assert.equal(session.cart_events, 1);
  const timeline = await (
    await request("/api/admin/analytics?session=" + sessionId)
  ).json();
  assert.equal(timeline.events.length, 5);
  console.log(
    "PASS: real Auth, 401/403, catalog CRUD + storefront/sitemap, Storage upload + public URL + denied nonadmin writes, analytics ingestion/report/timeline/time/location.",
  );
} finally {
  if (sessionId)
    await service.from("visitor_sessions").delete().eq("id", sessionId);
  if (uploadPath)
    await service.storage.from("product-images").remove([uploadPath]);
  await service.from("products").delete().eq("id", id);
  if (nonadminId) await service.auth.admin.deleteUser(nonadminId);
  await auth.auth.signOut({ scope: "local" });
  console.log("QA fixtures cleaned up; original catalog and admin preserved.");
}
