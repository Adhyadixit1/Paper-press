import assert from "node:assert/strict";
const origin = process.env.TEST_SITE_URL || "http://127.0.0.1:3000";
assert.ok(
  ["localhost", "127.0.0.1"].includes(new URL(origin).hostname) ||
    (process.env.ALLOW_LIVE_TESTS === "1" &&
      origin === "https://www.paperandpress.in"),
  "Live checks require ALLOW_LIVE_TESTS=1 and the verified production origin.",
);
const xml = await (await fetch(origin + "/sitemap.xml")).text();
const paths = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(
  (m) => new URL(m[1]).pathname,
);
assert.ok(paths.length > 40, "Expected the existing catalog in sitemap");
const failures = [];
for (let i = 0; i < paths.length; i += 6) {
  await Promise.all(
    paths.slice(i, i + 6).map(async (path) => {
      const response = await fetch(origin + path);
      const html = await response.text();
      try {
        assert.equal(response.status, 200);
        assert.equal(
          (html.match(/<h1(?:\s|>)/g) || []).length,
          1,
          "Exactly one H1",
        );
        assert.match(
          html,
          /<link rel="canonical" href="https:\/\/[^\"]+"/,
          "Canonical URL",
        );
        assert.match(
          html,
          /<meta name="description" content="[^\"]+"/,
          "Meta description",
        );
        for (const match of html.matchAll(
          /<script type="application\/ld\+json">(.*?)<\/script>/gs,
        ))
          JSON.parse(match[1]);
      } catch (e) {
        failures.push(`${path}: ${e.message}`);
      }
    }),
  );
}
for (const path of ["/api/admin/products", "/api/admin/analytics"])
  assert.equal(
    (await fetch(origin + path)).status,
    401,
    "Anonymous admin API must reject",
  );
assert.equal(
  (
    await fetch(origin + "/api/admin/products", {
      method: "POST",
      headers: {
        Origin: "https://untrusted.invalid",
        "Content-Type": "application/json",
      },
      body: "{}",
    })
  ).status,
  403,
);
const missing = await fetch(origin + "/categories/not-a-real-category");
const missingHtml = await missing.text();
// Next.js streaming may already send HTTP 200 before notFound resolves.
assert.ok([200, 404].includes(missing.status));
assert.match(missingHtml, /<meta name="robots" content="noindex"/);
for (const path of ["/robots.txt", "/llms.txt", "/llm.txt"])
  assert.equal((await fetch(origin + path)).status, 200);
const admin = await (await fetch(origin + "/admin")).text();
assert.match(admin, /noindex/);
assert.deepEqual(failures, []);
console.log(
  `PASS: ${paths.length} public routes, canonical URLs, descriptions, single H1s, JSON-LD, SEO endpoints, missing-page noindex, anonymous API rejection and cross-origin write rejection.`,
);
