import Link from 'next/link';
import { Suspense } from 'react';
import SearchBox from './SearchBox';
import MegaMenu from './MegaMenu';
import QuoteCart from './QuoteCart';
import HoverCardGallery from './HoverCardGallery';
import {productCardGallery} from './cardGalleries';

const clientBrands=['Baggu','PopUp Grocer','Momofuku','Flamingo Estate','Garmentory','Micos','Edie Parker','For Love & Lemons','Carhartt WIP','Partners Coffee','Sweetgreen','Arc’teryx'];

export function Header(){ const announcement='B2B WHOLESALE ONLY · BULK PRODUCTION · PAN-INDIA DOOR-TO-DOOR DELIVERY'; return <>
  <div className="review-strip" aria-label="Wholesale delivery announcement"><div className="announcement-track">{[0,1].map(loop=><Link className="announcement-group" href="/delivery" aria-hidden={loop===1?'true':undefined} key={loop}><b>{announcement}</b><span>HOW DELIVERY WORKS →</span></Link>)}</div></div>
  <header className="site-header">
    <Link className="wordmark" href="/" aria-label="Paper and Press home">Paper <i>&amp;</i> Press</Link>
    <Suspense fallback={<nav className="desktop-nav" aria-label="Main navigation"/>}><MegaMenu/></Suspense>
    <SearchBox/>
    <div className="header-actions"><Link className="ship-button" href="/delivery">Deliver to: <b>All India</b></Link><Link className="account-button" href="/quote">Get wholesale quote</Link><QuoteCart/></div>
  </header>
  <div className="client-marquee" aria-label="Brands inspiring our packaging"><div className="client-marquee-track">{[0,1].map(loop=><div className="client-marquee-group" aria-hidden={loop===1?'true':undefined} key={loop}>{clientBrands.map(name=><span key={`${loop}-${name}`}>{name}</span>)}</div>)}</div></div>
  </>; }

const columns=[
 {title:'Wholesale products',links:[['All categories','/products'],['Size & price calculator','/custom-size'],['Bakery packaging','/products?family=Bakery'],['Café & QSR','/products?family=Cafe'],['Courier boxes','/products?family=Courier'],['Healthcare files','/categories/hospital-files']]},
 {title:'Industries',links:[['Food & hospitality','/industries#food'],['Fashion & retail','/industries#fashion'],['Grocery & FMCG','/industries#grocery'],['Healthcare','/industries#healthcare'],['Beauty & care','/industries#beauty'],['Institutional supply','/wholesale']]},
 {title:'Company',links:[['About Paper & Press','/about'],['Sustainability','/sustainability'],['Pan-India delivery','/delivery'],['Samples & prototyping','/samples'],['Help centre','/help'],['Contact Jaipur studio','/contact']]},
 {title:'Trade',links:[['Wholesale program','/wholesale'],['Request pricing','/quote'],['Artwork guidelines','/help'],['Privacy','/privacy'],['Terms','/terms']]},
];
export function Footer(){ return <footer className="footer"><div className="footer-main"><div className="footer-links">{columns.map(c=><div key={c.title}><h3>{c.title}</h3>{c.links.map(([l,h])=><Link href={h} key={l}>{l}</Link>)}</div>)}</div><div className="footer-signup"><span>Wholesale enquiries</span><h2>Planning your next<br/>packaging run?</h2><p>Share dimensions, monthly volume, printing and destination. Our Jaipur team will reply with the right board and price tier.</p><Link className="footer-quote" href="/quote">Request a B2B quote →</Link><small>Door-to-door shipping available across India.</small></div></div><div className="footer-bottom"><Link className="wordmark footer-mark" href="/">Paper <i>&amp;</i> Press</Link><p>JAIPUR · PRINT · PACKAGING · POSSIBILITIES</p><div><span>GST invoices</span><span>Bulk only</span><span>Pan-India</span></div></div></footer>; }

export type Product={slug:string;name:string;eyebrow:string;delivery:string;price:string;image:string;className?:string;badge?:string};
export function ProductCard({product}:{product:Product}){return <Link className="product-card" href={`/products/${product.slug}`}><div className={`product-image ${product.className||''}`}><HoverCardGallery images={productCardGallery(product.slug,product.image)} alt={product.name}/>{product.badge&&<span className="card-badge">{product.badge}</span>}<span className="product-arrow">↗</span></div><div className="product-meta"><p>{product.eyebrow}<span>{product.delivery}</span></p><h3>{product.name}</h3><small>{product.price}</small></div></Link>}
