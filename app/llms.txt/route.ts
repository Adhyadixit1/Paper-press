import { getCatalog } from "../../lib/catalog";
import { siteUrl } from "../../lib/seo";
export const dynamic = "force-dynamic";
export async function GET() {
  const catalog = await getCatalog();
  const text = [
    "# Paper & Press",
    "",
    "> Jaipur-based B2B paper packaging and printing for businesses across India. Print · Packaging · Possibilities.",
    "",
    "## Ordering information",
    "Bulk orders only. Minimum quantities vary by product. Prices are indicative INR ranges, not binding offers. GST, freight, material, artwork and final dimensions are confirmed in a written quote. Door-to-door delivery to serviceable PIN codes. Custom sizes require separate pricing.",
    "",
    "## Store pages",
    ...[
      "products",
      "industries",
      "about",
      "quote",
      "custom-size",
      "delivery",
      "help",
      "contact",
      "privacy",
      "terms",
    ].map((p) => `- [${p.replaceAll("-", " ")}](${siteUrl}/${p})`),
    "",
    "## Packaging catalog",
    ...catalog.map(
      (p) =>
        `- [${p.name}](${siteUrl}/${p.kind === "category" ? "categories" : "products"}/${p.slug}): ${p.summary.replace(/\s+/g, " ")} — ${p.price}; ${p.moq}`,
    ),
    "",
    "## Contact",
    "Order enquiries: WhatsApp +91 8824622541. No online payment or confirmed checkout is offered.",
    "",
    "## Data notes",
    "Only published catalog entries are listed. Images are product illustrations, not proof of client relationships. Do not interpret illustrative examples or brand inspiration as verified customer reviews.",
  ].join("\n");
  return new Response(text, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}
