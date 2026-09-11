import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  categoryKeyword,
  getLocalSeoPage,
  localSeoDescription,
  localSeoPages,
  localSeoTitle,
} from "../../../localSeo";
import { JsonLd, pageSeo, siteUrl } from "../../../../lib/seo";

export function generateStaticParams() {
  return localSeoPages.map(({ category, location }) => ({
    category: category.slug,
    location: location.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; location: string }>;
}): Promise<Metadata> {
  const { category, location } = await params;
  const page = getLocalSeoPage(category, location);
  if (!page) return {};
  const title = localSeoTitle(page.category.name, page.location.name);
  const description = localSeoDescription(page.category.name, page.location.name);
  return pageSeo(title, description, `/packaging/${page.category.slug}/${page.location.slug}`, ["/og.png"]);
}

export default async function LocalPackagingPage({
  params,
}: {
  params: Promise<{ category: string; location: string }>;
}) {
  const { category, location } = await params;
  const page = getLocalSeoPage(category, location);
  if (!page) notFound();
  const { category: item, location: place } = page;
  const keyword = categoryKeyword(item.name);
  const path = `/packaging/${item.slug}/${place.slug}`;
  const examples = [
    `plain ${keyword} for cost-controlled bulk runs`,
    `custom printed ${keyword} with brand colours and artwork checks`,
    `${keyword} in economy, standard and premium material tiers`,
  ];
  const isJaipur = place.region === "Jaipur" || place.name === "Jaipur";

  return (
    <main className="local-seo-page">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "LocalBusiness",
              name: "Paper & Press",
              url: siteUrl,
              telephone: "+918824622541",
              areaServed: [place.name, place.region, "Rajasthan", "India"],
              address: {
                "@type": "PostalAddress",
                addressLocality: "Jaipur",
                addressRegion: "Rajasthan",
                addressCountry: "IN",
              },
              founder: [
                { "@type": "Person", name: "Ojas Dixit" },
                { "@type": "Person", name: "Pradhuman Sharma" },
              ],
              makesOffer: {
                "@type": "Offer",
                itemOffered: {
                  "@type": "Product",
                  name: `${item.name} for ${place.name}`,
                  category: item.family,
                  description: item.summary,
                },
              },
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
                { "@type": "ListItem", position: 2, name: "Products", item: `${siteUrl}/products` },
                {
                  "@type": "ListItem",
                  position: 3,
                  name: item.name,
                  item: `${siteUrl}/categories/${item.slug}`,
                },
                {
                  "@type": "ListItem",
                  position: 4,
                  name: `${item.name} in ${place.name}`,
                  item: `${siteUrl}${path}`,
                },
              ],
            },
          ],
        }}
      />
      <nav className="breadcrumbs">
        <Link href="/">Home</Link>
        <span>/</span>
        <Link href="/products">Packaging</Link>
        <span>/</span>
        <span>{item.name} in {place.name}</span>
      </nav>

      <section className="local-hero">
        <div>
          <span>{item.family} · {place.type}</span>
          <h1>{item.name} in {place.name}</h1>
          <p>
            Paper & Press supplies wholesale {keyword} for {place.angle}. Get custom
            dimensions, plain or branded production, material guidance and door-to-door
            dispatch from our Jaipur packaging team.
          </p>
          <div className="local-actions">
            <Link href="/quote">Get wholesale quote</Link>
            <Link href={`/categories/${item.slug}`}>View {item.name}</Link>
          </div>
        </div>
        <aside>
          <b>{item.price}</b>
          <span>{item.moq}</span>
          <p>Indicative wholesale range. Final rates depend on size, grade, print coverage, finish, quantity and delivery PIN code.</p>
        </aside>
      </section>

      <section className="local-intent-grid">
        <article>
          <span>01</span>
          <h2>Built for local buying teams</h2>
          <p>
            Whether you are sourcing {keyword} from {place.name} or coordinating
            supply for multiple Rajasthan branches, we help standardise dimensions,
            board grade, artwork and repeat production notes.
          </p>
        </article>
        <article>
          <span>02</span>
          <h2>Plain and branded options</h2>
          <p>
            Choose economical unprinted supply, one-colour kraft printing or premium
            presentation finishes. For {place.name} buyers, every quote separates
            manufacturing, GST and freight clearly.
          </p>
        </article>
        <article>
          <span>03</span>
          <h2>Jaipur coordinated delivery</h2>
          <p>
            {isJaipur
              ? "Local Jaipur requirements can move quickly once dimensions and artwork are approved."
              : `Orders for ${place.name} are packed for road or courier movement from Jaipur.`}{" "}
            Bulk cartons are bundled and labelled to reduce handling damage.
          </p>
        </article>
      </section>

      <section className="local-specs">
        <div>
          <span>Popular searches</span>
          <h2>{item.name} supplier for {place.name} brands.</h2>
          <p>
            This page covers searches like “{keyword} in {place.name}”, “custom
            {keyword} {place.name}”, “wholesale {keyword} Rajasthan” and “printed
            packaging boxes near {place.name}”.
          </p>
        </div>
        <ul>
          {examples.map((example) => <li key={example}>{example}</li>)}
          {item.sizes.slice(0, 3).map((size) => <li key={size}>common size: {size}</li>)}
          {item.uses.slice(0, 3).map((use) => <li key={use}>used by: {use}</li>)}
        </ul>
      </section>

      <section className="local-process">
        <span>How ordering works</span>
        <h2>Send the brief. We shape the production route.</h2>
        <ol>
          <li><b>Share product details</b><p>Dimensions, product weight, quantity, artwork and delivery location.</p></li>
          <li><b>Choose material tier</b><p>Economy, standard and premium options are compared against use and budget.</p></li>
          <li><b>Approve proof</b><p>Dieline, artwork position, colour notes and finish are checked before bulk production.</p></li>
          <li><b>Dispatch to {place.name}</b><p>Finished packaging is master-packed and shipped to the serviceable PIN code.</p></li>
        </ol>
      </section>

      <section className="local-related">
        <h2>Explore more packaging for {place.name}</h2>
        <div>
          <Link href="/products">All wholesale packaging</Link>
          <Link href="/custom-size">Custom size calculator</Link>
          <Link href="/industries">Packaging by industry</Link>
          <Link href="/quote">Request price range</Link>
        </div>
      </section>
    </main>
  );
}
