import Link from 'next/link';
import {notFound} from 'next/navigation';
import type {Metadata} from 'next';
import ProductConfigurator from '../../ProductConfigurator';
import ProductCRO from '../../ProductCRO';
import ProductGallery from '../../ProductGallery';
import {products} from '../../data';
import {productGalleryFor} from '../../cardGalleries';

export function generateStaticParams(){return products.map(product=>({slug:product.slug}));}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{
  const {slug}=await params;
  const product=products.find(item=>item.slug===slug);
  return product?{title:`${product.name} — Paper & Press`,description:`Custom ${product.name.toLowerCase()} with premium stocks, a free expert design proof and pan-India delivery.`}:{};
}

export default async function ProductPage({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params;
  const product=products.find(item=>item.slug===slug);
  if(!product)notFound();
  const gallery=productGalleryFor(slug);

  return <main className="product-detail">
    <ProductGallery images={gallery} name={product.name}/>
    <section className="product-panel">
      <div className="breadcrumbs"><Link href="/products">Products</Link><span>/</span><span>{product.name}</span></div><h1>{product.name}</h1>
      <p className="fulfilment">✓ Free delivery on qualifying orders &nbsp; · &nbsp; ✓ Free expert design proof</p>
      <p className="product-description">{slug==='plain-corrugated-boxes'?'Economical unprinted shipping cartons built around the required internal L × B × H. Choose the ply strength and quantity; we’ll check fit, stacking and courier use before production.':'Premium custom packaging, built around your brand. Choose the size, material and print treatment—we’ll check every detail before production.'}</p>
      <div className="attribute-pills"><span>Wholesale pricing</span><span>Free proof</span><span>Pan-India delivery</span><span>{slug==='plain-corrugated-boxes'?'No design required':'Custom or plain'}</span></div>
      <section className="configure-order" id="configure-order"><span>Build your wholesale order</span><h2>Choose size, material &amp; quantity.</h2><ProductConfigurator minimum={product.eyebrow} slug={product.slug}/></section>
      <div className="support-cards"><article><b>Need help customizing?</b><p>Talk to a packaging specialist for material and finish guidance.</p><Link href="/quote">Book a free consultation →</Link></article><article><b>Free expert design proof</b><p>We check fit, artwork and production details before anything goes to press.</p></article><article><b>Flexible production</b><p>Start at the listed MOQ, then plan repeat supply as demand grows.</p></article></div>
      <ProductCRO product={product}/>
    </section>
    <a className="mobile-order-bar" href={`https://wa.me/918824622541?text=${encodeURIComponent(`Hello Paper & Press Jaipur, I would like to order ${product.name}. Please share wholesale pricing, MOQ and delivery details.`)}`} target="_blank" rel="noopener noreferrer"><span>{product.price}<small>{product.eyebrow}</small></span><b>Order on WhatsApp →</b></a>
  </main>;
}
