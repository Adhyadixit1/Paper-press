import Link from 'next/link';
import { ProductCard } from './SiteChrome';
import { products } from './data';
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

export default function Home() {
  return <main>
    <HomeHero slides={heroSlides}/>

    <section className="brand-rail" aria-label="Packaging inspiration from leading brands"><div className="brand-rail-track">{[0,1].map(loop=><div className="brand-rail-group" aria-hidden={loop===1?'true':undefined} key={loop}><span>Packaging inspiration from leading brands</span>{inspirationBrands.map(brand=><b key={`${loop}-${brand}`}>{brand}</b>)}</div>)}</div></section>

    <section className="product-shelf"><div className="shelf-heading"><h2>Wholesale Must-Haves</h2><div><button aria-label="Previous products">←</button><button aria-label="Next products">→</button></div></div><div className="product-track">{products.slice(0,9).map(product => <ProductCard key={product.slug} product={product}/>)}</div><Link className="all-link" href="/products">Shop all products →</Link></section>

    <section className="campaign"><img src="/generated/cafe-collection.png" alt="Paper & Press café and takeaway collection"/><div><span>Designed to work together</span><h2>One brand.<br/>Every touchpoint.</h2><p>Carry your identity from the first coffee of the day to the box your customer takes home.</p><Link href="/industries">Explore food & hospitality →</Link></div></section>

    <section className="trending"><div className="shelf-heading"><h2>Trending now</h2><Link href="/products">Shop all →</Link></div><div className="trend-grid">{trends.map(trend => <Link href={trend.href} key={trend.name}><img src={trend.image} alt={trend.name}/><h3>{trend.name}</h3><span>Shop now →</span></Link>)}</div></section>

    <section className="home-signup"><div><span>Fresh from the press</span><h2>More possibilities,<br/>less inbox noise.</h2></div><form><p>Material guides, new products and packaging ideas sent occasionally.</p><div><input aria-label="Email address" placeholder="Email address" type="email"/><button type="button">Sign up now →</button></div></form></section>
  </main>;
}
