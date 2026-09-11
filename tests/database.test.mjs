import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { PGlite } from "@electric-sql/pglite";

test("catalog RLS, private analytics, deduplication, reports and archival", async () => {
  const db = new PGlite();
  try {
    // Supabase-owned schemas/roles are represented locally; real Auth/Storage require cloud verification.
    await db.exec(`create role anon; create role authenticated; create role service_role bypassrls;
   create schema auth;create table auth.users(id uuid primary key);
   create schema storage;create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
   grant usage on schema public to anon,authenticated,service_role;`);
    await db.exec(
      await readFile(
        new URL(
          "../supabase/migrations/20260911054737_admin_catalog_analytics.sql",
          import.meta.url,
        ),
        "utf8",
      ),
    );
    await db.exec(`insert into public.products(id,kind,slug,name,family,status) values
   ('category:test','category','test','Test box','Test','published'),
   ('category:draft','category','draft','Draft box','Test','draft'); set role anon;`);
    assert.equal(
      (await db.query("select * from public.products")).rows.length,
      1,
    );
    await assert.rejects(
      db.query("select * from public.visitor_sessions"),
      /permission denied/,
    );
    await assert.rejects(
      db.query("select * from public.analytics_events"),
      /permission denied/,
    );
    await assert.rejects(
      db.query("select * from public.admin_users"),
      /permission denied/,
    );
    await assert.rejects(
      db.query("update public.products set name='Hacked'"),
      /permission denied/,
    );
    await assert.rejects(
      db.query("select public.analytics_report('{}'::jsonb)"),
      /permission denied/,
    );
    await db.exec("reset role;set role authenticated;");
    await assert.rejects(
      db.query("select * from public.admin_users"),
      /permission denied/,
    );
    await db.exec("reset role;set role service_role;");
    const sid = randomUUID();
    const record = async (type, extra = {}) => {
      const event = {
        id: randomUUID(),
        session_id: sid,
        type,
        path: "/categories/test",
        product: "categories:test",
        city: "Jaipur",
        state: "RJ",
        country: "IN",
        device: "Mobile",
        source: "Test",
        ...extra,
      };
      await db.query("select public.record_event($1::jsonb)", [
        JSON.stringify(event),
      ]);
      return event;
    };
    const page = await record("page_view");
    await db.query("select public.record_event($1::jsonb)", [
      JSON.stringify(page),
    ]);
    await record("product_view");
    await record("add_to_cart");
    await record("whatsapp_click");
    await record("search", { search_term: "pizza" });
    await db.exec(
      "update public.visitor_sessions set last_timed_at=now()-interval '30 seconds',active_seconds=105",
    );
    await record("heartbeat", { seconds: 15 });
    const report = async (extra = {}) =>
      (
        await db.query("select public.analytics_report($1::jsonb) report", [
          JSON.stringify({ from: "2020-01-01", to: "2100-01-01", ...extra }),
        ])
      ).rows[0].report;
    const result = await report();
    assert.equal(result.summary.sessions, 1);
    assert.equal(result.summary.pageViews, 1);
    assert.equal(result.summary.cartAdds, 1);
    assert.equal(result.summary.live, 1);
    assert.equal(result.summary.avgSeconds, 120);
    assert.equal(result.products[0].views, 1);
    assert.equal(result.products[0].active_seconds, 15);
    assert.equal(result.searches[0].term, "pizza");
    assert.equal(result.funnel.openedWhatsApp, 1);
    assert.ok(result.notifications.some((e) => e.type === "engaged"));
    assert.equal((await report({ city: "Mumbai" })).summary.sessions, 0);
    assert.equal(
      (
        await report({
          city: "Jaipur",
          device: "Mobile",
          event: "add_to_cart",
          product: "categories:test",
        })
      ).summary.sessions,
      1,
    );
    await db.exec(
      "update public.products set status='archived' where slug='test';reset role;set role anon;",
    );
    assert.equal(
      (await db.query("select * from public.products")).rows.length,
      0,
    );
    await db.exec("reset role;delete from public.visitor_sessions;");
    assert.equal(
      (await db.query("select * from public.analytics_events")).rows.length,
      0,
    );
  } finally {
    await db.close();
  }
});
