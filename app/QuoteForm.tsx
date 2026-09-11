"use client";
import { FormEvent, useState } from "react";
import { QUOTE_CART_KEY, type QuoteItem, whatsappUrl } from "./cart";
export default function QuoteForm({
  families: catalogFamilies,
}: {
  families: string[];
}) {
  const [sent, setSent] = useState(false);
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const value = (key: string) => String(f.get(key) || "");
    const item: QuoteItem = {
      id: crypto.randomUUID(),
      category: value("family"),
      sizeLabel: "Custom brief",
      dimensions: "See notes",
      volume: "To be confirmed",
      quantity: Number(value("quantity")),
      grade: value("grade"),
      branding: value("branding"),
      pin: value("pin"),
      estimatedRange: "Written quotation required",
      custom: true,
      notes: `Contact: ${value("name")} · ${value("email")}\n${value("notes")}`,
    };
    let old: QuoteItem[] = [];
    try {
      const saved = JSON.parse(localStorage.getItem(QUOTE_CART_KEY) || "[]");
      if (Array.isArray(saved)) old = saved;
    } catch {}
    const next = [...old, item];
    try {
      localStorage.setItem(QUOTE_CART_KEY, JSON.stringify(next));
    } catch {}
    window.dispatchEvent(new Event("paper-press-cart"));
    window.dispatchEvent(new Event("pp-whatsapp"));
    window.open(whatsappUrl(next), "_blank", "noopener,noreferrer");
    setSent(true);
  }
  if (sent)
    return (
      <div className="quote-success">
        <span>✓</span>
        <h2>Your brief is ready to send.</h2>
        <p>
          WhatsApp opened with your details. Review the message and tap Send to
          share it with our Jaipur team. No enquiry has been sent automatically.
        </p>
        <button onClick={() => setSent(false)}>Send another requirement</button>
      </div>
    );
  return (
    <form className="quote-form" onSubmit={submit}>
      <label>
        Product family
        <select name="family" required defaultValue="">
          <option value="" disabled>
            Select packaging family
          </option>
          {catalogFamilies.map((x) => (
            <option key={x}>{x}</option>
          ))}
        </select>
      </label>
      <div className="form-row">
        <label>
          Required quantity
          <input
            name="quantity"
            required
            type="number"
            min="500"
            placeholder="e.g. 5,000"
          />
        </label>
        <label>
          Delivery PIN code
          <input
            name="pin"
            required
            inputMode="numeric"
            pattern="[0-9]{6}"
            placeholder="6-digit PIN"
          />
        </label>
      </div>
      <div className="form-row">
        <label>
          Quality tier
          <select name="grade">
            <option>Economy / cheapest suitable</option>
            <option>Standard / balanced</option>
            <option>Premium presentation</option>
            <option>Help me choose</option>
          </select>
        </label>
        <label>
          Branding
          <select name="branding">
            <option>Custom printed</option>
            <option>Plain / non-branded</option>
            <option>Both options</option>
          </select>
        </label>
      </div>
      <div className="form-row">
        <label>
          Your name
          <input name="name" required placeholder="Full name" />
        </label>
        <label>
          Business email
          <input
            name="email"
            required
            type="email"
            placeholder="you@company.com"
          />
        </label>
      </div>
      <label>
        Size, material and application
        <textarea
          name="notes"
          rows={5}
          placeholder="Dimensions, product weight, number of colors, finish, monthly repeat volume and target date…"
        />
      </label>
      <button className="dark-button" type="submit">
        Prepare WhatsApp quote →
      </button>
      <small>
        Indicative website prices are budgeting guides. Final quotes are ex-GST
        and confirmed after specification review.
      </small>
    </form>
  );
}
