"use client";
import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { QUOTE_CART_KEY } from "./cart";
import Link from "next/link";
// Serialize across route changes so the first session cookie is established once.
let eventQueue = Promise.resolve();
export default function VisitorAnalytics() {
  const path = usePathname();
  const query = useSearchParams().toString();
  const [consent, setConsent] = useState<string | null>(null);
  useEffect(() => {
    const open = () => setConsent("ask");
    window.addEventListener("pp-privacy", open);
    const id = setTimeout(() => {
      try {
        setConsent(localStorage.getItem("pp_analytics_consent") || "ask");
      } catch {
        setConsent("no");
      }
    }, 0);
    return () => {
      clearTimeout(id);
      window.removeEventListener("pp-privacy", open);
    };
  }, []);
  useEffect(() => {
    if (
      consent !== "yes" ||
      path.startsWith("/admin") ||
      navigator.doNotTrack === "1" ||
      (navigator as Navigator & { globalPrivacyControl?: boolean })
        .globalPrivacyControl
    )
      return;
    let last = Date.now();
    let visible = document.visibilityState === "visible";
    const product = /^\/(categories|products)\/([^/]+)$/.test(path)
      ? path.split("/").slice(1).join(":")
      : "";
    const send = (type: string, extra: Record<string, unknown> = {}) => {
      const gtag = (window as Window & {
        gtag?: (...args: unknown[]) => void;
      }).gtag;
      gtag?.("event", type, {
        page_path: path,
        item_name: product || extra.product,
        search_term: extra.search_term,
      });
      eventQueue = eventQueue.then(async () => {
        try {
          if (localStorage.getItem("pp_analytics_consent") !== "yes") return;
          await fetch("/api/analytics", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: crypto.randomUUID(),
              type,
              path,
              product,
              referrer: document.referrer,
              source:
                new URLSearchParams(location.search).get("utm_source") || "",
              ...extra,
            }),
            keepalive: true,
          });
        } catch {}
      });
    };
    send("page_view");
    if (product) send("product_view");
    const term = new URLSearchParams(location.search).get("search");
    if (term) send("search", { search_term: term });
    const heartbeat = () => {
      const now = Date.now();
      const seconds = visible
        ? Math.min(15, Math.floor((now - last) / 1000))
        : 0;
      last = now;
      if (seconds) send("heartbeat", { seconds });
    };
    const timer = setInterval(heartbeat, 15000);
    const readCart = () => {
      try {
        return JSON.parse(localStorage.getItem(QUOTE_CART_KEY) || "[]") as {
          id: string;
          category: string;
          quantity: number;
        }[];
      } catch {
        return [];
      }
    };
    let previous = readCart();
    const cart = () => {
      const next = readCart();
      for (const item of next) {
        const old = previous.find((x) => x.id === item.id);
        if (!old || old.quantity !== item.quantity)
          send("add_to_cart", { product: product || item.category });
      }
      for (const item of previous)
        if (!next.some((x) => x.id === item.id))
          send("remove_from_cart", { product: product || item.category });
      previous = next;
    };
    const click = (e: MouseEvent) => {
      if ((e.target as Element).closest('a[href*="wa.me"]'))
        send("whatsapp_click");
    };
    const whatsapp = () => send("whatsapp_click");
    const visibility = () => {
      heartbeat();
      visible = document.visibilityState === "visible";
      last = Date.now();
    };
    window.addEventListener("paper-press-cart", cart);
    window.addEventListener("pp-whatsapp", whatsapp);
    document.addEventListener("click", click);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      heartbeat();
      clearInterval(timer);
      window.removeEventListener("paper-press-cart", cart);
      window.removeEventListener("pp-whatsapp", whatsapp);
      document.removeEventListener("click", click);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [consent, path, query]);
  if (path.startsWith("/admin")) return null;
  const choose = (value: string) => {
    try {
      localStorage.setItem("pp_analytics_consent", value);
    } catch {}
    setConsent(value);
  };
  if (consent === "ask")
    return (
      <aside className="analytics-consent" aria-label="Analytics preference">
        <p>
          Help us improve our packaging store? Allow pseudonymous visit, product
          and cart analytics. <Link href="/privacy">Privacy details</Link>
        </p>
        <button onClick={() => choose("no")}>Decline</button>
        <button onClick={() => choose("yes")}>Allow analytics</button>
      </aside>
    );
  return null;
}
export function PrivacyChoices() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event("pp-privacy"))}
      style={{
        background: "transparent",
        border: "none",
        padding: "8px 0",
        textDecoration: "underline",
        fontSize: 14,
      }}
    >
      Privacy choices
    </button>
  );
}
