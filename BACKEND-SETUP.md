# Paper & Press backend

## Current setup status

Connected and tested on 11 September 2026 using the owner's supplied management token directly through the Supabase HTTP API, not the plugin integration.

- Project: **Paper & Press**, reference `philwkizyiboqqfgaoze`, Mumbai (`ap-south-1`). Organization `uyjweaddkhwtyclosgpg` was verified on the **free** plan; no upgrade was made. The unrelated chat project was untouched.
- Both SQL migrations are applied. The public catalog contains 49 imported entries. The 90-day retention Cron job is enabled (`30 2 * * *`, UTC); its first scheduled execution has not yet been observed.
- Admin: `http://localhost:3000/admin`, email `ojasvy33@gmail.com`. Initial password is in ignored, permission-600 `work/admin-access.txt`. Change it in Admin → Settings and save it in your password manager.
- `.env.local` contains the project publishable key, server-only secret key and independent analytics signing secret. The management token is **not** a runtime environment variable. Credential files are excluded from Git.
- Public signups are disabled; passwords require 12+ characters and password changes require the current password. The website remains local. No Git push or website deployment was performed for this backend setup.

## Reprovisioning reference (already completed for this project)

Do not repeat project creation or the initial table migrations on the configured project. These steps document setup for a separate environment.

1. Confirm the Supabase organization, Mumbai (`ap-south-1`) region, free-plan availability/cost and first administrator email. Do not create paid resources without approval.
2. Create a dedicated project. Never reuse the unrelated existing chat project. Disable public email signups (admin accounts are created by the owner), set the Auth site URL to the current localhost origin, and configure redirect allowlists explicitly before any future deployment.
3. Apply the two SQL migrations in `supabase/migrations` in chronological order. The second enables Supabase Cron and removes analytics sessions older than 90 days daily; their events cascade-delete. Verify the job in `cron.job` and run history after enabling it. This does not deploy the website.
4. Copy `.env.example` to ignored `.env.local`. Supply the project URL, publishable (or anon) key, **server-only** secret/service-role key and a separate random analytics signing secret. Never put the management token or service key in any `NEXT_PUBLIC_` variable.
5. Run `npm run seed:catalog`. It imports 49 existing category/featured-product entries and preserves existing rows, including archived ones. Category and featured-product pages are separate entries because the existing site has both route types.
6. Set `PP_ADMIN_EMAIL` and `PP_ADMIN_PASSWORD` (12+ characters) securely in the ignored local environment, run `npm run admin:create`, then remove the password variable. This creates a new Auth user and inserts its UUID into `public.admin_users`; it will not modify an existing account. A normal authenticated user has no admin access.
7. Restart `npm run dev` and open `http://localhost:3000/admin`. Verify admin sign-in, create/edit/archive/restore, upload and reorder images, storefront refresh and generated sitemap. Set a fresh password after initial setup. Test a nonadmin account receives 403 and anonymous callers receive 401.
8. Run Supabase security/performance advisors. Private tables intentionally have no client policies or grants. No user JWT can read visitor data directly or upload/delete storage objects. Service routes validate the user and admin membership before mutations.

## Admin features

- Sidebar: overview, products, live visitors, analytics, notifications and settings.
- Product title, family, descriptions, indicative price, MOQ, sizes, materials, buyers, image gallery and SEO fields. Draft, publish, archive and restore. Removing an image from a product removes its reference, not the underlying Storage object; storage cleanup is deliberately not destructive.
- Catalog, navigation, industry pages, related products, sitemap and LLM directory use published database entries. Admin changes invalidate the storefront; refresh an already-open storefront tab to see the newest version.
- Images: JPEG, PNG, WebP and AVIF, maximum 8 MB each, maximum 20 per product. Service-authorized upload with basic type/signature checks to public `product-images`; no executable/SVG uploads.

## Analytics definitions and limitations

Analytics begin only after consent; DNT/GPC and recognizable bots are excluded. A signed HttpOnly session cookie rolls for 30 minutes of inactivity. Sessions are not identified people, and counts are not exact unique-user counts. No raw IP, cart notes, order email or screen recordings are stored in these analytics tables.

- Live = session last active within 60 seconds. Admin refreshes every 10 seconds while visible. This is polling, not Supabase Realtime.
- Active time = visible-tab heartbeat time, including a final partial interval on page changes. Concurrent tabs are conservatively capped against server time. It is not a claim that the visitor was reading or looking at the screen.
- Approximate city/state/country use trusted Vercel geo headers only when actually running on Vercel. Local and unsupported-host visits show Unknown. Region values may be provider codes such as RJ. No paid geolocation service is configured.
- Page/product views, searches, cart additions/quantity changes, removals and WhatsApp opening are separate events. WhatsApp opening is buying intent, **not a sent message or confirmed order**. The quote form prepares WhatsApp and does not falsely claim server receipt.
- Date/device/location/product/event filters select matching sessions; reports aggregate those sessions and their journeys. Dates are in IST. CSV exports the visible page of up to 100 sessions; journeys show the first 500 non-heartbeat events. Products/locations/search aggregates show their leading 50 groups.
- Notifications: cart additions, WhatsApp opens and sessions crossing two minutes of accumulated active time. Browser notifications require opt-in and an open admin panel; there is no background push service.
- Session ingestion is deduplicated and capped at 40 events/minute and 4,000 events/session. For high-volume public deployment, configure hosting rate limits/bot protection and review free-plan database quotas. No application rate limit can make client-reported events audit-grade.
- Automated retention: 90 days once the Cron migration is applied. Privacy text must be reviewed by the business before launch; this is not legal advice or a compliance certification.

## SEO

Dynamic sitemap includes published pages, image URLs and actual product update times. `robots.txt` excludes admin/API; admin also emits noindex. `/llms.txt` and `/llm.txt` provide a generated catalog directory. Unique canonicals, page titles/descriptions, Open Graph, Twitter metadata, Organization, Product and Breadcrumb JSON-LD are included. No invented review ratings or binding offers are placed in structured data.

Set `NEXT_PUBLIC_SITE_URL` to the real canonical domain before any authorized release. LLM text files do not guarantee indexing or ranking; neither these changes nor a Lighthouse score can guarantee “100 SEO.” Search Console verification/sitemap submission and live Core Web Vitals require the actual live property and a separate authorization. Static editorial marketing sections remain code-managed rather than a full CMS.

## Verification

```sh
npm run test:database
npm run build
npm run dev
# In another terminal:
npm run test:store
```

The database test uses in-memory PostgreSQL (PGlite) and checks RLS/grants, archive visibility, event deduplication, reporting filters, active-time counters and cascading deletion. It stubs only Supabase-owned Auth/Storage schemas.

Live integration verification passed against the new Supabase project: admin login, anonymous 401 and nonadmin 403 responses, product create/edit/publish/archive, public draft exclusion, storefront and sitemap updates, image upload and public serving, blocked nonadmin Storage writes and private-table reads, analytics ingestion, reports, searches, timelines, live counts and measured active time. `node --env-file=.env.local scripts/check-cloud.mjs` recreates and cleans up only its own QA fixtures; it expects the initial credentials file to match the current admin password.

Browser verification passed for admin login and draft creation; mobile storefront gallery and admin table had no page-level horizontal overflow or framework error overlay. A consented mobile visit was recorded as `categories:cake-boxes` with accumulating active time. All QA products, uploaded test images, ordinary test accounts and QA visitor sessions were removed afterward; the original 49 entries and owner admin were retained.

The route checker passed for 63 public routes, single H1s, metadata/canonicals, JSON-LD, sitemap/robots/LLM files, missing-page noindex, and rejected cross-origin writes. Next can stream missing routes with HTTP 200 plus noindex; this test does not claim every missing path returns HTTP 404.

Supabase advisors found no security ERRORs. Intentional INFO notices remain for private RLS tables without client policies and unused indexes on a fresh database. Leaked-password protection has a WARN because it is a Pro-plan feature; no paid upgrade was made. Use a generated, unique admin password. The password-change UI and current-password enforcement are enabled.

The runtime was updated to Next.js 16.3.4. Production dependency audit passes; legacy development-only Vinext/Cloudflare dependencies still have advisories and are not part of the `next build` runtime. Never use `npm audit fix --force` without reviewing its changes.

The management access token was supplied in chat. Revoke/rotate it after setup; never commit it or reuse it as the app's runtime key.
