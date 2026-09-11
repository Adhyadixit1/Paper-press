"use client";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { CatalogEntry } from "../../lib/catalog";
type SessionRow = {
  id: string;
  started_at: string;
  last_seen: string;
  city: string;
  state: string;
  country: string;
  device: string;
  source: string;
  active_seconds: number;
  page_views: number;
  cart_events: number;
  current_path: string;
  current_product: string;
};
type EventRow = {
  id: string;
  created_at: string;
  type: string;
  product: string;
  path?: string;
  seconds?: number;
  search_term?: string;
  session_id: string;
  city?: string;
  state?: string;
};
type Report = {
  summary: {
    sessions: number;
    live: number;
    pageViews: number;
    cartAdds: number;
    avgSeconds: number;
    cartSessions: number;
    engagedSessions: number;
  };
  daily: { day: string; sessions: number; views: number }[];
  locations: {
    city: string;
    state: string;
    country: string;
    sessions: number;
    carts: number;
  }[];
  products: {
    product: string;
    views: number;
    visitors: number;
    carts: number;
    active_seconds: number;
  }[];
  sources: { source: string; sessions: number }[];
  searches: { term: string; searches: number; sessions: number }[];
  funnel: {
    visited: number;
    viewedProduct: number;
    addedToCart: number;
    openedWhatsApp: number;
  };
  sessions: SessionRow[];
  notifications: EventRow[];
};
let client: SupabaseClient | undefined;
function authClient() {
  if (!client)
    client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    );
  return client;
}
const duration = (n: number) => `${Math.floor(n / 60)}m ${n % 60}s`;
const today = () =>
  new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
const weekAgo = () =>
  new Date(Date.now() - 6 * 86400000).toLocaleDateString("en-CA", {
    timeZone: "Asia/Kolkata",
  });
const emptyProduct: CatalogEntry = {
  id: "",
  kind: "category",
  slug: "",
  name: "",
  family: "",
  summary: "",
  description: "",
  price: "",
  moq: "MOQ 500 pcs",
  sizes: [],
  grades: ["Economy", "Standard", "Premium"],
  uses: [],
  branded: true,
  images: [],
  image: "",
  status: "draft",
  seo_title: "",
  seo_description: "",
  eyebrow: "",
  delivery: "Quoted per production run",
  updated_at: "",
};
export default function AdminApp() {
  const [refreshedAt, setRefreshedAt] = useState(0);
  const [token, setToken] = useState(""),
    [ready, setReady] = useState(false),
    [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [tab, setTab] = useState("Overview"),
    [catalog, setCatalog] = useState<CatalogEntry[]>([]),
    [report, setReport] = useState<Report | null>(null),
    [edit, setEdit] = useState<(CatalogEntry & { isNew?: boolean }) | null>(
      null,
    );
  const [query, setQuery] = useState(""),
    [status, setStatus] = useState(""),
    [family, setFamily] = useState(""),
    [imageUrl, setImageUrl] = useState(""),
    [timeline, setTimeline] = useState<EventRow[] | null>(null),
    [selectedSession, setSelectedSession] = useState("");
  const [filters, setFilters] = useState({
    from: weekAgo(),
    to: today(),
    city: "",
    state: "",
    device: "",
    product: "",
    event: "",
    offset: 0,
  });
  const [notificationsEnabled, setNotificationsEnabled] = useState(false),
    [lastUpdated, setLastUpdated] = useState("");
  const knownEvents = useRef(new Set<string>()),
    firstReport = useRef(true);
  const configured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
  useEffect(() => {
    if (!configured) {
      setTimeout(() => setReady(true), 0);
      return;
    }
    const auth = authClient();
    void auth.auth.getSession().then(({ data }) => {
      setToken(data.session?.access_token || "");
      setReady(true);
    });
    const { data } = auth.auth.onAuthStateChange((event, session) => {
      setToken(session?.access_token || "");
      if (event === "SIGNED_OUT") {
        setCatalog([]);
        setReport(null);
        setEdit(null);
        setTimeline(null);
        setMessage("");
        setPassword("");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        knownEvents.current.clear();
        firstReport.current = true;
      }
    });
    return () => data.subscription.unsubscribe();
  }, [configured]);
  const api = useCallback(
    async <T,>(path: string, options: RequestInit = {}): Promise<T> => {
      const response = await fetch(path, {
        ...options,
        headers: {
          Authorization: `Bearer ${token}`,
          ...(!(options.body instanceof FormData)
            ? { "Content-Type": "application/json" }
            : {}),
          ...options.headers,
        },
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error((data as { error?: string }).error || "Request failed");
      return data as T;
    },
    [token],
  );
  const refreshCatalog = useCallback(async () => {
    try {
      setCatalog(await api<CatalogEntry[]>("/api/admin/products"));
    } catch (e) {
      setMessage((e as Error).message);
    }
  }, [api]);
  const refreshAnalytics = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        ...filters,
        offset: String(filters.offset),
        from: filters.from + "T00:00:00+05:30",
        to: new Date(
          new Date(filters.to + "T00:00:00+05:30").getTime() + 86400000,
        ).toISOString(),
      });
      const data: Report = await api<Report>("/api/admin/analytics?" + params);
      setReport(data);
      setRefreshedAt(Date.now());
      setLastUpdated(new Date().toLocaleTimeString());
      for (const event of data.notifications) {
        if (
          !knownEvents.current.has(event.id) &&
          !firstReport.current &&
          notificationsEnabled &&
          typeof Notification !== "undefined" &&
          Notification.permission === "granted"
        )
          new Notification("Paper & Press activity", {
            body: `${event.type.replaceAll("_", " ")} · ${event.product || event.city || "Visitor"}`,
          });
        knownEvents.current.add(event.id);
      }
      firstReport.current = false;
    } catch (e) {
      setMessage((e as Error).message);
    }
  }, [api, filters, notificationsEnabled]);
  useEffect(() => {
    if (!token) return;
    // Remote data is resolved asynchronously; this effect synchronizes the authenticated API.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refreshCatalog();
  }, [token, refreshCatalog]);
  useEffect(() => {
    if (!token || tab === "Products" || tab === "Settings") return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- asynchronous report fetch
    void refreshAnalytics();
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") void refreshAnalytics();
    }, 10000);
    return () => clearInterval(timer);
  }, [token, tab, refreshAnalytics]);
  async function login(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    const { error } = await authClient().auth.signInWithPassword({
      email,
      password,
    });
    if (error) setMessage(error.message);
    setBusy(false);
  }
  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!edit) return;
    setBusy(true);
    setMessage("");
    try {
      await api("/api/admin/products", {
        method: "POST",
        body: JSON.stringify(edit),
      });
      await refreshCatalog();
      setEdit(null);
      setMessage("Product saved. Storefront updated.");
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage("New passwords do not match.");
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const { error } = await authClient().auth.updateUser({
        password: newPassword,
        current_password: currentPassword,
      });
      if (error) throw error;
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setMessage(
        "Password updated. Save your new password in your password manager.",
      );
    } catch (e) {
      setMessage(
        e instanceof Error ? e.message : "Password change failed. Try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function upload(files: FileList | null) {
    if (!files || !edit) return;
    setBusy(true);
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        const form = new FormData();
        form.append("file", file);
        urls.push(
          (
            await api<{ url: string }>("/api/admin/upload", {
              method: "POST",
              body: form,
            })
          ).url,
        );
      }
      setEdit((current) =>
        current ? { ...current, images: [...current.images, ...urls] } : null,
      );
      setMessage("Images uploaded. Save the product to publish changes.");
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function archive(item: CatalogEntry) {
    if (
      !confirm(
        `Remove ${item.name} from the storefront? You can restore it from Archived.`,
      )
    )
      return;
    try {
      await api("/api/admin/products", {
        method: "DELETE",
        body: JSON.stringify({ id: item.id }),
      });
      await refreshCatalog();
      setMessage("Product archived.");
    } catch (e) {
      setMessage((e as Error).message);
    }
  }
  async function showSession(id: string) {
    setSelectedSession(id);
    try {
      setTimeline(
        (
          await api<{ events: EventRow[] }>(
            "/api/admin/analytics?session=" + id,
          )
        ).events,
      );
    } catch (e) {
      setMessage((e as Error).message);
    }
  }
  function exportCsv() {
    if (!report) return;
    const rows = [
      [
        "Session",
        "Started",
        "City",
        "State",
        "Country",
        "Device",
        "Source",
        "Active seconds",
        "Page views",
        "Cart additions",
        "Current page",
      ],
      ...report.sessions.map((s) => [
        s.id,
        s.started_at,
        s.city,
        s.state,
        s.country,
        s.device,
        s.source,
        s.active_seconds,
        s.page_views,
        s.cart_events,
        s.current_path,
      ]),
    ];
    const safe = (v: unknown) =>
      `"${String(v)
        .replace(/^[=+@-]/, "'")
        .replaceAll('"', '""')}"`;
    const blob = new Blob([rows.map((r) => r.map(safe).join(",")).join("\n")], {
      type: "text/csv",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "paper-press-sessions-page.csv";
    a.click();
    URL.revokeObjectURL(url);
  }
  if (!ready) return <div className="admin-login">Loading your workspace…</div>;
  if (!configured)
    return (
      <div className="admin-login">
        <h1>Connect your store</h1>
        <p>
          Supabase setup is pending. Add the project URL and publishable key to
          the local environment and restart the server.
        </p>
      </div>
    );
  if (!token)
    return (
      <div className="admin-login">
        <div className="admin-brand">
          Paper <i>&</i> Press
        </div>
        <h1>Your store, in focus.</h1>
        <p>Sign in to manage products and understand your customers.</p>
        <form onSubmit={login}>
          <label>
            Email
            <input
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
          </label>
          <button disabled={busy}>
            {busy ? "Signing in…" : "Sign in to admin →"}
          </button>
        </form>
        {message && <p role="alert">{message}</p>}
        <Link href="/">Back to store</Link>
      </div>
    );
  const families = [...new Set(catalog.map((p) => p.family))];
  const visible = catalog.filter(
    (p) =>
      (!status || p.status === status) &&
      (!family || p.family === family) &&
      `${p.name} ${p.slug}`.toLowerCase().includes(query.toLowerCase()),
  );
  const filterField = (key: keyof typeof filters, value: string) =>
    setFilters((f) => ({ ...f, [key]: value, offset: 0 }));
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Link className="admin-brand" href="/">
          Paper <i>&</i> Press
        </Link>
        <span className="admin-workspace">STORE WORKSPACE</span>
        <nav>
          {[
            "Overview",
            "Products",
            "Live visitors",
            "Analytics",
            "Notifications",
            "Settings",
          ].map((name, i) => (
            <button
              className={tab === name ? "selected" : ""}
              onClick={() => {
                setTab(name);
                setEdit(null);
              }}
              key={name}
            >
              <span>{["◈", "▣", "◉", "▥", "♧", "⚙"][i]}</span>
              {name}
              {name === "Notifications" && report ? (
                <small>{report.notifications.length}</small>
              ) : null}
            </button>
          ))}
        </nav>
        <div className="admin-sidebar-foot">
          <Link href="/" target="_blank">
            View storefront ↗
          </Link>
          <button onClick={() => void authClient().auth.signOut()}>
            Sign out
          </button>
        </div>
      </aside>
      <main className="admin-main">
        <header className="admin-topbar">
          <span>Paper & Press / {tab}</span>
          <span className="admin-connected">● Connected to Supabase</span>
        </header>
        <div className="admin-heading">
          <div>
            <span>JAIPUR STUDIO</span>
            <h1>{edit ? (edit.isNew ? "Create product" : edit.name) : tab}</h1>
            <p>
              {tab === "Products"
                ? "Create, refine and publish your packaging catalog."
                : "A clear picture of how people discover and shop your packaging."}
            </p>
          </div>
          {tab === "Products" && !edit ? (
            <button
              className="admin-primary"
              onClick={() => setEdit({ ...emptyProduct, isNew: true })}
            >
              + Add product
            </button>
          ) : (
            <Link href="/products" target="_blank">
              Open store ↗
            </Link>
          )}
        </div>
        {message && (
          <div className="admin-message" role="status">
            {message}
            <button onClick={() => setMessage("")}>×</button>
          </div>
        )}
        {tab === "Products" && !edit && (
          <>
            <div className="admin-filters">
              <input
                aria-label="Search products"
                placeholder="Search name or slug…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <select
                aria-label="Product status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="">All statuses</option>
                {["published", "draft", "archived"].map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
              <select
                aria-label="Product family"
                value={family}
                onChange={(e) => setFamily(e.target.value)}
              >
                <option value="">All families</option>
                {families.map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
              <span>{visible.length} products</span>
            </div>
            <div className="admin-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Family</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <div className="admin-product-cell">
                          {p.images[0] && <img src={p.images[0]} alt="" />}
                          <div>
                            <strong>{p.name}</strong>
                            <small>
                              /
                              {p.kind === "category"
                                ? "categories"
                                : "products"}
                              /{p.slug}
                            </small>
                          </div>
                        </div>
                      </td>
                      <td>{p.family}</td>
                      <td>{p.price}</td>
                      <td>
                        <span className={`admin-pill ${p.status}`}>
                          {p.status}
                        </span>
                      </td>
                      <td>
                        <button onClick={() => setEdit({ ...p, isNew: false })}>
                          Edit
                        </button>
                        <button onClick={() => void archive(p)}>Archive</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!visible.length && (
                <p className="admin-empty">No products match these filters.</p>
              )}
            </div>
          </>
        )}
        {tab === "Products" && edit && (
          <form onSubmit={save} className="admin-editor">
            <section>
              <h2>Product information</h2>
              <label>
                Name
                <input
                  required
                  value={edit.name}
                  onChange={(e) => setEdit({ ...edit, name: e.target.value })}
                />
              </label>
              <div className="admin-two">
                <label>
                  Page type
                  <select
                    disabled={!edit.isNew}
                    value={edit.kind}
                    onChange={(e) =>
                      setEdit({
                        ...edit,
                        kind: e.target.value as "category" | "product",
                      })
                    }
                  >
                    <option value="category">Packaging category</option>
                    <option value="product">Featured product</option>
                  </select>
                </label>
                <label>
                  URL slug
                  <input
                    required
                    pattern="[a-z0-9]+(-[a-z0-9]+)*"
                    disabled={!edit.isNew}
                    value={edit.slug}
                    onChange={(e) => setEdit({ ...edit, slug: e.target.value })}
                  />
                </label>
              </div>
              <label>
                Family
                <input
                  list="families"
                  required
                  value={edit.family}
                  onChange={(e) => setEdit({ ...edit, family: e.target.value })}
                />
                <datalist id="families">
                  {families.map((f) => (
                    <option key={f} value={f} />
                  ))}
                </datalist>
              </label>
              <label>
                Short description
                <textarea
                  rows={3}
                  value={edit.summary}
                  onChange={(e) =>
                    setEdit({ ...edit, summary: e.target.value })
                  }
                />
              </label>
              <label>
                Full description
                <textarea
                  rows={7}
                  value={edit.description}
                  onChange={(e) =>
                    setEdit({ ...edit, description: e.target.value })
                  }
                />
              </label>
              <h2>Images</h2>
              <p>
                First image is the cover. Upload multiple images or add an HTTPS
                URL. Maximum 8 MB per image.
              </p>
              <div className="admin-images">
                {edit.images.map((url, i) => (
                  <div key={`${url}-${i}`}>
                    <img src={url} alt={`Product image ${i + 1}`} />
                    <div>
                      <button
                        type="button"
                        disabled={i === 0}
                        aria-label={`Move image ${i + 1} left`}
                        onClick={() => {
                          const images = [...edit.images];
                          [images[i - 1], images[i]] = [
                            images[i],
                            images[i - 1],
                          ];
                          setEdit({ ...edit, images });
                        }}
                      >
                        ←
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setEdit({
                            ...edit,
                            images: edit.images.filter((_, n) => n !== i),
                          })
                        }
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <input
                aria-label="Upload product images"
                type="file"
                accept="image/png,image/jpeg,image/webp,image/avif"
                multiple
                disabled={busy}
                onChange={(e) => void upload(e.target.files)}
              />
              <div className="admin-inline">
                <input
                  aria-label="Image URL"
                  placeholder="https://… or /catalog/…"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (imageUrl) {
                      setEdit({ ...edit, images: [...edit.images, imageUrl] });
                      setImageUrl("");
                    }
                  }}
                >
                  Add URL
                </button>
              </div>
            </section>
            <section>
              <h2>Publishing & pricing</h2>
              <label>
                Status
                <select
                  value={edit.status}
                  onChange={(e) =>
                    setEdit({
                      ...edit,
                      status: e.target.value as CatalogEntry["status"],
                    })
                  }
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </label>
              <label>
                Price / price range
                <input
                  placeholder="₹8–₹32 / pc"
                  required
                  value={edit.price}
                  onChange={(e) => setEdit({ ...edit, price: e.target.value })}
                />
              </label>
              <label>
                Minimum quantity
                <input
                  value={edit.moq}
                  onChange={(e) => setEdit({ ...edit, moq: e.target.value })}
                />
              </label>
              <label>
                Production time
                <input
                  value={edit.delivery}
                  onChange={(e) =>
                    setEdit({ ...edit, delivery: e.target.value })
                  }
                />
              </label>
              {(["sizes", "grades", "uses"] as const).map((key) => (
                <label key={key}>
                  {key === "uses"
                    ? "Typical buyers"
                    : key === "grades"
                      ? "Quality options"
                      : "Sizes"}{" "}
                  (one per line)
                  <textarea
                    rows={3}
                    value={edit[key].join("\n")}
                    onChange={(e) =>
                      setEdit({ ...edit, [key]: e.target.value.split("\n") })
                    }
                  />
                </label>
              ))}
              <label className="admin-checkbox">
                <input
                  type="checkbox"
                  checked={edit.branded}
                  onChange={(e) =>
                    setEdit({ ...edit, branded: e.target.checked })
                  }
                />
                Custom branding available
              </label>
              <h2>Search preview</h2>
              <label>
                SEO title
                <input
                  maxLength={80}
                  value={edit.seo_title}
                  onChange={(e) =>
                    setEdit({ ...edit, seo_title: e.target.value })
                  }
                />
              </label>
              <label>
                Meta description
                <textarea
                  maxLength={200}
                  rows={3}
                  value={edit.seo_description}
                  onChange={(e) =>
                    setEdit({ ...edit, seo_description: e.target.value })
                  }
                />
              </label>
              <div className="admin-save">
                <button className="admin-primary" disabled={busy}>
                  {busy ? "Saving…" : "Save product"}
                </button>
                <button type="button" onClick={() => setEdit(null)}>
                  Cancel
                </button>
              </div>
            </section>
          </form>
        )}
        {["Overview", "Live visitors", "Analytics", "Notifications"].includes(
          tab,
        ) && (
          <>
            <div className="admin-filters">
              <label>
                From
                <input
                  type="date"
                  value={filters.from}
                  onChange={(e) => filterField("from", e.target.value)}
                />
              </label>
              <label>
                Through
                <input
                  type="date"
                  value={filters.to}
                  onChange={(e) => filterField("to", e.target.value)}
                />
              </label>
              <input
                aria-label="Filter city"
                placeholder="City (exact)"
                value={filters.city}
                onChange={(e) => filterField("city", e.target.value)}
              />
              <input
                aria-label="Filter state"
                placeholder="State (exact)"
                value={filters.state}
                onChange={(e) => filterField("state", e.target.value)}
              />
              <select
                aria-label="Device"
                value={filters.device}
                onChange={(e) => filterField("device", e.target.value)}
              >
                <option value="">All devices</option>
                {["Desktop", "Mobile", "Tablet"].map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
              <select
                aria-label="Viewed product"
                value={filters.product}
                onChange={(e) => filterField("product", e.target.value)}
              >
                <option value="">All products</option>
                {catalog.map((p) => (
                  <option
                    key={p.id}
                    value={`${p.kind === "category" ? "categories" : "products"}:${p.slug}`}
                  >
                    {p.name}
                  </option>
                ))}
              </select>
              <select
                aria-label="Event filter"
                value={filters.event}
                onChange={(e) => filterField("event", e.target.value)}
              >
                <option value="">All behavior</option>
                {[
                  "product_view",
                  "add_to_cart",
                  "whatsapp_click",
                  "engaged",
                  "search",
                ].map((v) => (
                  <option key={v} value={v}>
                    {v.replaceAll("_", " ")}
                  </option>
                ))}
              </select>
              <button onClick={() => void refreshAnalytics()}>Refresh</button>
            </div>
            <p className="admin-caption">
              Updates every 10 seconds ·{" "}
              {lastUpdated ? "Updated " + lastUpdated : "Loading…"} · Live =
              activity in the last 60 seconds · Consent-based sessions,
              approximate location · Dates in IST
            </p>
            {report && (
              <>
                <div className="admin-stats">
                  {[
                    ["Live visitors", report.summary.live],
                    ["Sessions", report.summary.sessions],
                    ["Page views", report.summary.pageViews],
                    ["Cart additions", report.summary.cartAdds],
                    ["Avg. active time", duration(report.summary.avgSeconds)],
                    [
                      "Cart session rate",
                      `${report.summary.sessions ? Math.round((report.summary.cartSessions / report.summary.sessions) * 100) : 0}%`,
                    ],
                  ].map(([name, value]) => (
                    <article key={name}>
                      <span>{name}</span>
                      <strong>{value}</strong>
                    </article>
                  ))}
                </div>
                {tab === "Overview" && (
                  <div className="admin-panels">
                    <section>
                      <h2>Visits over time</h2>
                      {report.daily.length ? (
                        <div className="admin-chart">
                          {report.daily.map((d) => (
                            <div
                              key={d.day}
                              title={`${d.day}: ${d.sessions} sessions`}
                            >
                              <b>{d.sessions}</b>
                              <i
                                style={{
                                  height: `${Math.max(3, (150 * d.sessions) / Math.max(...report.daily.map((x) => x.sessions), 1))}px`,
                                }}
                              />
                              <small>{d.day.slice(5)}</small>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="admin-empty">
                          Your first visitor session will appear here.
                        </p>
                      )}
                    </section>
                    <section>
                      <h2>Discovery sources</h2>
                      {report.sources.map((s) => (
                        <div className="admin-metric-row" key={s.source}>
                          <span>{s.source}</span>
                          <b>{s.sessions}</b>
                        </div>
                      ))}
                      {!report.sources.length && (
                        <p className="admin-empty">No recorded traffic yet.</p>
                      )}
                    </section>
                  </div>
                )}
                {tab === "Analytics" && (
                  <div className="admin-panels">
                    <section>
                      <h2>Buying-intent milestones</h2>
                      <p>
                        Sessions reaching each action. These are not confirmed
                        purchases or a sequential checkout funnel.
                      </p>
                      {Object.entries(report.funnel).map(([key, count]) => (
                        <div className="admin-metric-row" key={key}>
                          <span>
                            {
                              {
                                visited: "Visited store",
                                viewedProduct: "Viewed product",
                                addedToCart: "Added to cart",
                                openedWhatsApp: "Opened WhatsApp",
                              }[key]
                            }
                          </span>
                          <b>{count}</b>
                        </div>
                      ))}
                    </section>
                    <section>
                      <h2>What visitors search for</h2>
                      {report.searches.length ? (
                        <table>
                          <thead>
                            <tr>
                              <th>Search</th>
                              <th>Count</th>
                              <th>Sessions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {report.searches.map((s) => (
                              <tr key={s.term}>
                                <td>{s.term}</td>
                                <td>{s.searches}</td>
                                <td>{s.sessions}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <p>No searches recorded for these filters.</p>
                      )}
                    </section>
                  </div>
                )}
                {tab === "Analytics" && (
                  <div className="admin-panels">
                    <section>
                      <h2>Products & buying intent</h2>
                      <table>
                        <thead>
                          <tr>
                            <th>Product</th>
                            <th>Views</th>
                            <th>Sessions</th>
                            <th>Cart adds</th>
                            <th>Active time</th>
                          </tr>
                        </thead>
                        <tbody>
                          {report.products.map((p) => (
                            <tr key={p.product}>
                              <td>{p.product}</td>
                              <td>{p.views}</td>
                              <td>{p.visitors}</td>
                              <td>{p.carts}</td>
                              <td>{duration(p.active_seconds)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </section>
                    <section>
                      <h2>Locations</h2>
                      <table>
                        <thead>
                          <tr>
                            <th>City / state</th>
                            <th>Sessions</th>
                            <th>Cart adds</th>
                            <th>Active time</th>
                          </tr>
                        </thead>
                        <tbody>
                          {report.locations.map((l) => (
                            <tr key={`${l.city}-${l.state}-${l.country}`}>
                              <td>
                                {l.city}
                                <small>
                                  {l.state} · {l.country}
                                </small>
                              </td>
                              <td>{l.sessions}</td>
                              <td>{l.carts}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </section>
                  </div>
                )}
                {tab === "Notifications" ? (
                  <section className="admin-card">
                    <h2>Customer activity</h2>
                    <button
                      onClick={async () => {
                        if (typeof Notification !== "undefined") {
                          const permission =
                            await Notification.requestPermission();
                          setNotificationsEnabled(permission === "granted");
                        }
                      }}
                    >
                      {notificationsEnabled
                        ? "Desktop notifications enabled"
                        : "Enable desktop notifications"}
                    </button>
                    <p>
                      Cart additions, WhatsApp clicks, and visitors engaged for
                      at least two minutes. Desktop alerts are active while this
                      admin panel is open.
                    </p>
                    {report.notifications.map((n) => (
                      <button
                        className="admin-notification"
                        key={n.id}
                        onClick={() => void showSession(n.session_id)}
                      >
                        <strong>{n.type.replaceAll("_", " ")}</strong>
                        <span>
                          {n.product || "Store visit"} · {n.city}, {n.state}
                        </span>
                        <small>{new Date(n.created_at).toLocaleString()}</small>
                      </button>
                    ))}
                    {!report.notifications.length && (
                      <p className="admin-empty">
                        New customer activity will appear here.
                      </p>
                    )}
                  </section>
                ) : (
                  <section className="admin-card">
                    <div className="admin-inline">
                      <h2>
                        {tab === "Live visitors"
                          ? "Live sessions"
                          : "Visitor sessions"}
                      </h2>
                      <button onClick={exportCsv}>Export this page CSV</button>
                    </div>
                    <div className="admin-table-wrap">
                      <table>
                        <thead>
                          <tr>
                            <th>Visitor</th>
                            <th>Location</th>
                            <th>Current product / page</th>
                            <th>Time</th>
                            <th>Views</th>
                            <th>Cart</th>
                          </tr>
                        </thead>
                        <tbody>
                          {report.sessions
                            .filter(
                              (s) =>
                                tab !== "Live visitors" ||
                                refreshedAt - new Date(s.last_seen).getTime() <
                                  60000,
                            )
                            .map((s) => (
                              <tr
                                key={s.id}
                                onClick={() => void showSession(s.id)}
                                tabIndex={0}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") void showSession(s.id);
                                }}
                              >
                                <td>
                                  <strong>{s.id.slice(0, 8)}</strong>
                                  <small>
                                    {s.device} · {s.source}
                                  </small>
                                </td>
                                <td>
                                  {s.city}
                                  <small>
                                    {s.state} · {s.country}
                                  </small>
                                </td>
                                <td>{s.current_product || s.current_path}</td>
                                <td>{duration(s.active_seconds)}</td>
                                <td>{s.page_views}</td>
                                <td>{s.cart_events}</td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                    {!report.sessions.length && (
                      <p className="admin-empty">
                        No sessions for these filters.
                      </p>
                    )}
                    <div className="admin-inline">
                      <button
                        disabled={filters.offset === 0}
                        onClick={() =>
                          setFilters((f) => ({
                            ...f,
                            offset: Math.max(0, f.offset - 100),
                          }))
                        }
                      >
                        Previous
                      </button>
                      <span>
                        Page {1 + filters.offset / 100} · up to 100 sessions
                      </span>
                      <button
                        disabled={report.sessions.length < 100}
                        onClick={() =>
                          setFilters((f) => ({ ...f, offset: f.offset + 100 }))
                        }
                      >
                        Next
                      </button>
                    </div>
                  </section>
                )}
              </>
            )}
          </>
        )}
        {tab === "Settings" && (
          <section className="admin-card">
            <h2>Store settings</h2>
            <p>Catalog currency: INR · Studio: Jaipur · Delivery: Pan-India</p>
            <p>
              Analytics are recorded after consent. IP addresses are not stored.
              Location is approximate and supplied by trusted hosting headers;
              local visits show Unknown.
            </p>
            <p>
              Admin access is granted in the protected admin_users table. Being
              a signed-in Supabase user alone does not grant access.
            </p>
            <p>
              Archiving removes products from the public catalog and sitemap.
              Restore by editing their status to Published.
            </p>
            <Link href="/sitemap.xml" target="_blank">
              Sitemap ↗
            </Link>{" "}
            ·{" "}
            <Link href="/robots.txt" target="_blank">
              Robots ↗
            </Link>{" "}
            ·{" "}
            <Link href="/llms.txt" target="_blank">
              LLM directory ↗
            </Link>
            <form
              onSubmit={changePassword}
              style={{ display: "grid", gap: 16, maxWidth: 480, marginTop: 32 }}
            >
              <h2>Change admin password</h2>
              <label>
                Current password
                <input
                  type="password"
                  autoComplete="current-password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </label>
              <label>
                New password
                <input
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={12}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </label>
              <label>
                Confirm new password
                <input
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={12}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </label>
              <p>
                Use a unique password of at least 12 characters. Your initial
                local credentials file will not update automatically.
              </p>
              <button type="submit" className="admin-primary" disabled={busy}>
                {busy ? "Updating…" : "Update password"}
              </button>
            </form>
          </section>
        )}
        {timeline && (
          <div
            className="admin-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Visitor journey"
          >
            <section>
              <button onClick={() => setTimeline(null)}>Close ×</button>
              <h2>Visitor journey</h2>
              <p>
                Session {selectedSession} · first 500 events; heartbeat noise
                hidden
              </p>
              {timeline.map((e) => (
                <article key={e.id}>
                  <small>{new Date(e.created_at).toLocaleString()}</small>
                  <strong>{e.type.replaceAll("_", " ")}</strong>
                  <p>
                    {e.product || e.path}
                    {e.search_term ? ` · Search: ${e.search_term}` : ""}
                  </p>
                </article>
              ))}
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
