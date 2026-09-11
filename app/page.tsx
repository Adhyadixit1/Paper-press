import Link from 'next/link';
import { ProductCard } from './SiteChrome';
import {getCatalog} from '../lib/catalog';
import {JsonLd,pageSeo,siteUrl} from '../lib/seo';
export const metadata=pageSeo('Paper & Press — Wholesale Packaging Jaipur','Custom printed boxes, café packaging, courier cartons and premium print for businesses across India. Explore sizes, materials and wholesale prices.','/');
import HomeHero from './HomeHero';

const heroSlides = [
  { title:'Takeout Containers', image:'/reference/takeout-containers.webp', href:'/products?family=QSR%20%26%20Takeaway', links:[{label:'Pizza Boxes',href:'/categories/pizza-boxes'},{label:'Clamshells',href:'/categories/burger-boxes'},{label:'Trays',href:'/categories/fries-trays'},{label:'Tuck-Top',href:'/categories/meal-boxes'}] },
  { title:'Takeout Bags', image:'/reference/takeout-bags.webp', href:'/products?family=Fashion%20%26%20Retail', links:[{label:'SOS Bags',href:'/categories/retail-paper-bags'},{label:'Bakery Bags',href:'/categories/retail-paper-bags'},{label:'Delivery Bags',href:'/categories/retail-paper-bags'}] },
  { title:'Tissue Paper', image:'/reference/tissue-paper.webp', href:'/products/printed-tissue', links:[{label:'1 & 2 Color',href:'/products/printed-tissue'},{label:'Multi-Color',href:'/products/printed-tissue'},{label:'Kraft',href:'/products/printed-tissue'}] },
  { title:'Food Paper', image:'/reference/food-paper.webp', href:'/categories/food-paper', links:[{label:'Food Paper',href:'/categories/food-paper'},{label:'Deli Paper',href:'/categories/food-paper'},{label:'Greaseproof',href:'/categories/food-paper'},{label:'Foil',href:'/categories/food-paper'}] },
  { title:'Coffee & Café', image:'/generated/cafe-collection.png', href:'/products?family=Caf%C3%A9s%20%26%20Beverages', links:[{label:'Coffee Bags',href:'/categories/coffee-bags'},{label:'Hot Cups',href:'/categories/paper-cups'},{label:'Cup Sleeves',href:'/categories/cup-sleeves'}] },
  { title:'Cups', image:'/reference/cups.webp', href:'/categories/paper-cups', links:[{label:'Hot Cups',href:'/categories/paper-cups'},{label:'Cold Cups',href:'/products/cold-cups'},{label:'Accessories',href:'/categories/cup-carriers'}] },
];

const trends = [
  { name:'Food Paper', image:'/noissue/food-paper.avif', href:'/categories/food-paper' },
  { name:'Pizza Boxes', image:'/reference/pizza-box.webp', href:'/categories/pizza-boxes' },
  { name:'Cold Cups', image:'/noissue/cold-cups.avif', href:'/products/cold-cups' },
  { name:'Napkins', image:'/noissue/napkins.avif', href:'/products/napkins' },
];
const inspirationBrands=['Baggu','Momofuku','Sweetgreen','Carhartt WIP','Partners Coffee','Arc’teryx'];
const founderCards=[
  {name:'Ojas Dixit',initials:'OD',photo:'/founders/ojas-dixit.jpeg',role:'Co-founder · Brand, sales and growth',copy:'Ojas works closest to founders, restaurants, manufacturers and retail teams—turning rough packaging ideas into clear briefs, commercial options and repeatable buying systems.'},
  {name:'Akshay Patel',initials:'AP',role:'Co-founder · Operations and production',copy:'Akshay focuses on production discipline: material selection, vendor coordination, proof checks, timelines and dispatch planning so bulk packaging feels predictable.'},
];
const trustCards=[
  {metric:'Brief clarity first',copy:'Buyers tell us the biggest relief is knowing what size, material, MOQ and finish they should choose before spending on bulk production.'},
  {metric:'Rajasthan-first supply',copy:'Jaipur coordination with door-to-door planning for restaurants, sweet shops, FMCG units, hospitals, salons, garment brands and courier teams.'},
  {metric:'Bulk-only focus',copy:'No confusing retail checkout. Paper & Press is designed for serious B2B orders, repeat supply and brand-ready packaging runs.'},
];
const localSearchLinks=[
  ['Ghee boxes in Jaipur','/packaging/ghee-boxes/jaipur'],
  ['Pizza boxes in Jaipur','/packaging/pizza-boxes/jaipur'],
  ['Sweet boxes in Jaipur','/packaging/mithai-boxes/jaipur'],
  ['Masala boxes in Jaipur','/packaging/masala-boxes/jaipur'],
  ['Coffee cups in Jaipur','/packaging/paper-cups/jaipur'],
  ['Courier boxes in Jaipur','/packaging/courier-boxes/jaipur'],
  ['Hospital files in Jaipur','/packaging/hospital-files/jaipur'],
  ['Retail bags in Jaipur','/packaging/retail-paper-bags/jaipur'],
  ['Bakery boxes in Udaipur','/packaging/cake-boxes/udaipur'],
  ['Corrugated boxes in Neemrana','/packaging/plain-corrugated-boxes/neemrana'],
  ['Spice packaging in Jodhpur','/packaging/masala-boxes/jodhpur'],
  ['Food paper in Kota','/packaging/food-paper/kota'],
];

export default async function Home() {
  const catalog=await getCatalog();const products=catalog.filter(p=>p.kind==='product');const urls=new Set(catalog.map(p=>`/${p.kind==='category'?'categories':'products'}/${p.slug}`));const available=(href:string)=>!/^\/(categories|products)\//.test(href)||urls.has(href);const slides=heroSlides.filter(s=>available(s.href)).map(s=>({...s,links:s.links.filter(l=>available(l.href))}));
  return <main>
    <JsonLd data={{"@context":"https://schema.org","@graph":[{"@type":"WebSite",name:"Paper & Press",url:siteUrl,potentialAction:{"@type":"SearchAction",target:`${siteUrl}/products?search={search_term_string}`,"query-input":"required name=search_term_string"}},{"@type":"LocalBusiness",name:"Paper & Press",url:siteUrl,telephone:"+918824622541",slogan:"Print packaging possibilities",description:"Jaipur-based B2B packaging startup supplying custom printed boxes, plain corrugated cartons, cafe packaging, sweet boxes, pizza boxes, ghee cartons, masala boxes, hospital files, retail bags and paper packaging across Rajasthan and India.",address:{"@type":"PostalAddress",addressLocality:"Jaipur",addressRegion:"Rajasthan",addressCountry:"IN"},areaServed:["Jaipur","Rajasthan","India"],founder:founderCards.map(f=>({"@type":"Person",name:f.name,jobTitle:f.role}))}]}} />
    <HomeHero slides={slides}/>

    <section className="brand-rail" aria-label="Packaging inspiration from leading brands"><div className="brand-rail-track">{[0,1].map(loop=><div className="brand-rail-group" aria-hidden={loop===1?'true':undefined} key={loop}><span>Packaging inspiration from leading brands</span>{inspirationBrands.map(brand=><b key={`${loop}-${brand}`}>{brand}</b>)}</div>)}</div></section>

    <section className="home-story" id="founders">
      <div className="home-story-copy">
        <span>Built in Jaipur</span>
        <h2>Two brothers making packaging easier for ambitious Indian brands.</h2>
        <p>Paper & Press is led by Ojas Dixit and Akshay Patel, two brothers from Jaipur building a practical, design-aware packaging partner for businesses that are ready to scale. The idea is simple: if a brand can describe what it sells, we should be able to guide the right box, paper, print finish, quantity plan and delivery route without making the buyer chase five different suppliers.</p>
        <p>From ghee cartons, pizza boxes and mithai boxes to masala packaging, courier boxes, cafe cups, hospital files and garment inserts, the team focuses on bulk production that looks good, protects the product and arrives with clear communication.</p>
        <div className="home-story-links">
          <Link href="/about">Read our story</Link>
          <Link href="/quote">Start a packaging brief</Link>
        </div>
      </div>
      <div className="founder-grid" aria-label="Founder image placeholders">
        {founderCards.map(founder=><article key={founder.name}>
          <div className={`founder-photo ${founder.photo?'has-photo':''}`}>{founder.photo?<img src={founder.photo} alt={`${founder.name}, Paper & Press founder`}/>:<><b>{founder.initials}</b><span>Image placeholder</span></>}</div>
          <h3>{founder.name}</h3>
          <small>{founder.role}</small>
          <p>{founder.copy}</p>
        </article>)}
      </div>
    </section>

    <section className="home-trust">
      <div>
        <span>Why buyers remember us</span>
        <h2>Structured sourcing, better packaging decisions.</h2>
      </div>
      <div className="trust-grid">
        {trustCards.map(card=><article key={card.metric}><b>{card.metric}</b><p>{card.copy}</p></article>)}
      </div>
    </section>

    <section className="product-shelf"><div className="shelf-heading"><h2>Wholesale Must-Haves</h2><div><button aria-label="Previous products">←</button><button aria-label="Next products">→</button></div></div><div className="product-track">{products.slice(0,9).map(product => <ProductCard key={product.slug} product={product}/>)}</div><Link className="all-link" href="/products">Shop all products →</Link></section>

    <section className="campaign"><img src="/generated/cafe-collection.png" alt="Paper & Press café and takeaway collection"/><div><span>Designed to work together</span><h2>One brand.<br/>Every touchpoint.</h2><p>Carry your identity from the first coffee of the day to the box your customer takes home.</p><Link href="/industries">Explore food & hospitality →</Link></div></section>

    <section className="trending"><div className="shelf-heading"><h2>Trending now</h2><Link href="/products">Shop all →</Link></div><div className="trend-grid">{trends.filter(trend=>available(trend.href)).map(trend => <Link href={trend.href} key={trend.name}><img src={trend.image} alt={trend.name}/><h3>{trend.name}</h3><span>Shop now →</span></Link>)}</div></section>

    <section className="local-search-hub">
      <div>
        <span>Local packaging supply</span>
        <h2>Find box and paper packaging by product and city.</h2>
        <p>We’ve organised local packaging pages for Jaipur localities and Rajasthan cities so buyers can quickly compare use cases, sizes, material tiers, wholesale ranges and the production process for their product category.</p>
      </div>
      <nav aria-label="Popular local packaging searches">
        {localSearchLinks.map(([label,href])=><Link href={href} key={href}>{label} →</Link>)}
      </nav>
    </section>

    <section className="home-signup"><div><span>Fresh from the press</span><h2>More possibilities,<br/>less inbox noise.</h2></div><form><p>Material guides, new products and packaging ideas sent occasionally.</p><div><input aria-label="Email address" placeholder="Email address" type="email"/><button type="button">Sign up now →</button></div></form></section>
  </main>;
}
