import type {Metadata} from 'next';
import Link from 'next/link';
import {notFound} from 'next/navigation';
import BoxSizeCalculator from '../../BoxSizeCalculator';
import CategoryCRO from '../../CategoryCRO';
import CategoryGallery from '../../CategoryGallery';
import {b2bCategories,galleryFor} from '../../catalog';

export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{
  const {slug}=await params;
  const item=b2bCategories.find(product=>product.slug===slug);
  return item?{title:`Wholesale ${item.name} India | Paper & Press`,description:`${item.summary} Indicative wholesale pricing from ${item.price}. Custom branded and plain production with pan-India delivery.`}:{};
}

const complements:Record<string,string[]>={
  'Bakery & Confectionery':['packaging-sleeves','box-inserts-dividers','stickers-labels','chocolate-boxes'],
  'QSR & Takeaway':['food-paper','stickers-labels','packaging-sleeves','paper-cups'],
  'Cafés & Beverages':['paper-cups','cup-sleeves','cup-carriers','stickers-labels'],
  'Courier & Corrugated':['plain-corrugated-boxes','box-inserts-dividers','stickers-labels','packaging-sleeves'],
  'Fashion & Retail':['box-inserts-dividers','packaging-sleeves','stickers-labels','retail-paper-bags'],
  'Grocery & FMCG':['box-inserts-dividers','packaging-sleeves','stickers-labels','tea-dryfruit-boxes'],
  'Healthcare & Institutional':['stickers-labels','box-inserts-dividers','office-folders','medicine-cartons'],
  'Beauty & Personal Care':['box-inserts-dividers','packaging-sleeves','stickers-labels','soap-boxes'],
};

export default async function CategoryPage({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params;
  const item=b2bCategories.find(product=>product.slug===slug);
  if(!item)notFound();
  const gallery=galleryFor(slug).map(image=>image.replace('.png','.webp'));
  const priceNumbers=item.price.match(/[\d.]+/g)?.map(Number)||[1,2];
  const minimum=Number(item.moq.replace(/\D/g,''))||500;
  const excludedCalculators=['food-paper','paper-cups','cup-sleeves','cup-carriers','coffee-bags','retail-paper-bags','garment-flyers','hospital-files','office-folders','box-inserts-dividers','packaging-sleeves','stickers-labels'];
  const boxCalculator=!excludedCalculators.includes(slug);
  const candidates=[...(complements[item.family]||[]),...b2bCategories.filter(product=>product.family===item.family).map(product=>product.slug)];
  const related=[...new Set(candidates)].filter(candidate=>candidate!==slug).map(candidate=>b2bCategories.find(product=>product.slug===candidate)).filter(Boolean).slice(0,4) as typeof b2bCategories;

  return <main className="category-page-shell">
    <section className="category-page">
      <CategoryGallery images={gallery} name={item.name}/>
      <div className="category-info">
      <div className="breadcrumbs"><Link href="/products">Catalog</Link><span>/</span><Link href={`/products?family=${encodeURIComponent(item.family)}`}>{item.family}</Link></div>
      <span className="b2b-label">B2B wholesale · Plain and custom branded</span>
      <h1>{item.name}</h1>
      <p className="category-summary">{item.summary}</p>
      <div className="price-panel"><small>Indicative wholesale price</small><strong>{item.price}</strong><span>{item.moq} · Ex-GST · freight calculated by PIN code</span></div>
      <div className="spec-block"><h2>Common sizes</h2><div className="spec-pills">{item.sizes.map(value=><span key={value}>{value}</span>)}</div></div>
      <div className="spec-block"><h2>Quality options</h2>{item.grades.map((value,index)=><div className="grade-row" key={value}><b>{['Economy','Standard','Premium'][index]||`Grade ${index+1}`}</b><span>{value}</span><small>{index===0?'Best unit economics':index===1?'Balanced strength and finish':'Highest presentation value'}</small></div>)}</div>
      <div className="spec-block"><h2>Typical buyers</h2><div className="spec-pills">{item.uses.map(value=><span key={value}>{value}</span>)}</div></div>
      <div className="quote-facts"><span>✓ Door-to-door delivery across India</span><span>✓ Branded and non-branded production</span><span>✓ Artwork and structural proofing</span><span>✓ Scheduled repeat supply available</span></div>
      {boxCalculator&&<BoxSizeCalculator category={item.name} baseMin={priceNumbers[0]} baseMax={priceNumbers[1]||priceNumbers[0]*2} minimum={minimum}/>} 
      <Link className="request-button" href={`/quote?category=${item.slug}`}>Request exact wholesale pricing →</Link>
      <p className="pricing-note">Rates shown are market-informed estimates for budgeting, not a binding offer. Final pricing follows your dimensions, material, printing, finishing, volume and delivery location.</p>
      </div>
    </section>
    <CategoryCRO item={item} related={related} images={gallery}/>
  </main>;
}
