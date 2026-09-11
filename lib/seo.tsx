import type { Metadata } from "next";
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://paper-press-eight.vercel.app"
).replace(/\/$/, "");
export function pageSeo(
  title: string,
  description: string,
  path: string,
  images: string[] = ["/og.png"],
): Metadata {
  return {
    title,
    description,
    alternates: { canonical: `${siteUrl}${path}` },
    openGraph: {
      title,
      description,
      url: `${siteUrl}${path}`,
      siteName: "Paper & Press",
      locale: "en_IN",
      type: "website",
      images: images.map((url) => ({ url })),
    },
    twitter: { card: "summary_large_image", title, description, images },
  };
}
export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
export function ProductSchema({
  name,
  description,
  images,
  path,
}: {
  name: string;
  description: string;
  images: string[];
  path: string;
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "Product",
            name,
            description,
            image: images.map((i) => (i.startsWith("/") ? siteUrl + i : i)),
            url: siteUrl + path,
            brand: { "@type": "Brand", name: "Paper & Press" },
          },
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
              {
                "@type": "ListItem",
                position: 2,
                name: "Packaging catalog",
                item: siteUrl + "/products",
              },
              { "@type": "ListItem", position: 3, name, item: siteUrl + path },
            ],
          },
        ],
      }}
    />
  );
}
