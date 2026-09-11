"use client";
import { useState } from "react";
import { QUOTE_CART_KEY, type QuoteItem, whatsappUrl } from "./cart";

export default function ProductConfigurator({
  minimum,
  slug,
  name,
  price,
  sizes: availableSizes,
}: {
  minimum: string;
  slug: string;
  name: string;
  price: string;
  sizes: string[];
}) {
  const min = Math.max(
    1,
    Number(minimum.match(/[\d,]+/)?.[0].replaceAll(",", "")) || 500,
  );
  const plain = slug === "plain-corrugated-boxes";
  const choices = plain
    ? {
        Material: ["3 Ply Kraft", "5 Ply Kraft", "7 Ply Heavy-Duty"],
        Color: ["Unprinted Kraft", "White Kraft"],
        Print: ["No Print", "Handling Marks"],
      }
    : {
        Material: ["Premium White", "Natural Kraft", "Textured Ivory"],
        Color: ["1 Color", "2 Colors", "Multi Color (CMYK)"],
        Print: ["Outside Only", "Inside Only", "Inside & Outside"],
      };
  const sizes = [
    ...new Set([
      ...availableSizes.filter(Boolean),
      "Custom size — specify below",
    ]),
  ];
  const [quantity, setQuantity] = useState(min),
    [size, setSize] = useState(sizes[0]),
    [options, setOptions] = useState({
      Material: choices.Material[0],
      Color: choices.Color[0],
      Print: choices.Print[0],
    }),
    [notes, setNotes] = useState(""),
    [shipping, setShipping] = useState("One time"),
    [email, setEmail] = useState(""),
    [pin, setPin] = useState(""),
    [message, setMessage] = useState("");
  function submit(e: React.FormEvent) {
    e.preventDefault();
    const item: QuoteItem = {
      id: `product:${slug}:${size}`,
      category: name,
      sizeLabel: size,
      dimensions: /custom/i.test(size) ? "To be confirmed" : size,
      volume: "To be confirmed from final dimensions",
      quantity,
      grade: options.Material,
      branding: `${options.Color}; ${options.Print}`,
      pin,
      estimatedRange: price,
      custom: /custom/i.test(size),
      notes: `${notes}\nShipping: ${shipping}\nEmail: ${email}`,
    };
    try {
      const stored = JSON.parse(localStorage.getItem(QUOTE_CART_KEY) || "[]");
      const previous: QuoteItem[] = Array.isArray(stored) ? stored : [];
      const next = [...previous.filter((p) => p.id !== item.id), item];
      localStorage.setItem(QUOTE_CART_KEY, JSON.stringify(next));
      window.dispatchEvent(new Event("paper-press-cart"));
      window.dispatchEvent(new Event("pp-whatsapp"));
      window.open(whatsappUrl(next), "_blank", "noopener,noreferrer");
      setMessage(
        "Added to your WhatsApp cart. Review the message and tap Send in WhatsApp.",
      );
    } catch {
      setMessage(
        "Your browser blocked cart storage. Please enable storage and try again.",
      );
    }
  }
  return (
    <form className="configurator" onSubmit={submit}>
      <label className="config-select">
        <span>Size</span>
        <select value={size} onChange={(e) => setSize(e.target.value)}>
          {sizes.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </label>
      {Object.entries(choices).map(([label, items]) => (
        <fieldset key={label}>
          <legend>{label}</legend>
          <div className="option-grid">
            {items.map((item) => (
              <label key={item}>
                <input
                  type="radio"
                  name={`${slug}-${label}`}
                  checked={options[label as keyof typeof options] === item}
                  onChange={() => setOptions({ ...options, [label]: item })}
                />
                <span>{item}</span>
              </label>
            ))}
          </div>
        </fieldset>
      ))}
      <label className="config-select">
        <span>Dimensions & extra information</span>
        <textarea
          required={/custom/i.test(size)}
          rows={3}
          placeholder="Length × width × height, units, finish, product weight…"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </label>
      <fieldset>
        <legend>Shipping method</legend>
        <div className="ship-grid">
          {[
            ["One time", "One delivery"],
            ["Planned", "Split by date"],
            ["Distribution", "Multiple locations"],
          ].map(([title, copy]) => (
            <label key={title}>
              <input
                type="radio"
                name={`${slug}-shipping`}
                checked={shipping === title}
                onChange={() => setShipping(title)}
              />
              <span>
                <b>{title}</b>
                <small>{copy}</small>
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className="quantity-row">
        <label>
          <span>Quantity</span>
          <input
            required
            type="number"
            min={min}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
          />
          <small>{minimum}</small>
        </label>
        <label>
          <span>Email</span>
          <input
            type="email"
            placeholder="you@brand.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
      </div>
      <label className="config-select">
        <span>Delivery PIN code</span>
        <input
          required
          inputMode="numeric"
          pattern="[0-9]{6}"
          maxLength={6}
          placeholder="6-digit PIN"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
        />
      </label>
      <button className="request-button" type="submit">
        Add to cart & order on WhatsApp →
      </button>
      <p role="status">
        {message ||
          "Indicative prices only. Review your complete order in WhatsApp before sending."}
      </p>
    </form>
  );
}
