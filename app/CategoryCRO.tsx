import Link from 'next/link';
import type {B2BCategory} from './catalog';
import {categoryStories} from './categoryStories';

const stepCopy:Record<string,[string,string,string,string]>={
  food:['Share the menu item, serving temperature, hold time and daily volume.','We test capacity, food-contact material, barrier and closure around the real serve.','Approve the structural sample, print position and filled-product fit.','We produce, quality check and schedule repeat supply around outlet demand.'],
  transit:['Share product dimensions, packed weight, route, stack height and handling method.','We calculate board, flute, internal fit and closure from the transport conditions.','A physical sample is packed, handled and approved before the bulk run.','Approved specifications are held for consistent replenishment across India.'],
  retail:['Share the primary pack, shelf position, variant range and target opening experience.','We build structure, artwork hierarchy and finishes as one coordinated system.','Review colour, dieline, fit and the complete opening sequence before production.','Bulk packs are inspected, dispatched and preserved as your repeat standard.'],
  document:['Share the workflow, document count, fields, pockets and expected handling life.','We organise information, material and construction around the people using it.','Review a printed and assembled sample with the working documents inside.','We supply consistently across teams, departments and repeat procurement cycles.'],
};

function processFor(item:B2BCategory){
  if(['QSR & Takeaway','Cafés & Beverages','Bakery & Confectionery'].includes(item.family))return stepCopy.food;
  if(item.family==='Courier & Corrugated')return stepCopy.transit;
  if(item.family==='Healthcare & Institutional'&&['hospital-files','office-folders'].includes(item.slug))return stepCopy.document;
  return stepCopy.retail;
}

export default function CategoryCRO({item,related,images}:{item:B2BCategory;related:B2BCategory[];images:string[]}){
  const story=categoryStories[item.slug];
  if(!story)return null;
  const variant=Math.abs(item.slug.split('').reduce((sum,char)=>sum+char.charCodeAt(0),0))%3;
  const process=processFor(item);
  return <div className={`category-story story-${variant}`}>
    <section className="story-opener">
      <div className="story-opener-copy">
        <span>{story.eyebrow}</span>
        <h2>{story.headline}</h2>
        <p>{story.intro}</p>
        <div className="story-proof-line">{story.proof.map(value=><b key={value}>✓ {value}</b>)}</div>
        <Link href={`/quote?category=${item.slug}`}>Build your specification →</Link>
      </div>
      <div className="story-opener-media">
        <img src={images[0]} alt={`${item.name} designed for wholesale use`}/>
        <img src={images[3]||images[1]} alt={`${item.name} materials and construction detail`}/>
      </div>
    </section>

    <section className="story-scenes">
      <header><span>Built for real operations</span><h2>Where {item.name.toLowerCase()} earn their place.</h2><p>Not every order faces the same pressure. We design around the point of use, the handling journey and the impression your customer should receive.</p></header>
      <div className="story-scene-grid">{story.scenes.map((scene,index)=><article key={scene.title}>
        <div><img src={images[(index+1)%images.length]} alt={`${scene.title} use of ${item.name}`}/><span>0{index+1}</span></div>
        <h3>{scene.title}</h3><p>{scene.body}</p>
      </article>)}</div>
    </section>

    <section className="story-performance">
      <div className="story-performance-image"><img src={images[2]||images[0]} alt={`${item.name} performance and product fit`}/><span>Made for your product—not pulled from a generic shelf.</span></div>
      <div className="story-performance-copy">
        <span>Purpose-built beats one-size-fits-all</span>
        <h2>The details customers never name—but always feel.</h2>
        <p>{story.intro} That is why we resolve the whole packaging system before discussing decorative finishes in isolation.</p>
        <div className="comparison-table"><div><b>Paper &amp; Press brief</b><b>Generic stock pack</b></div>{story.proof.map(value=><div key={value}><span>✓ {value}</span><span>Usually compromised</span></div>)}</div>
        <Link href={`/quote?category=${item.slug}`}>Talk to a packaging specialist →</Link>
      </div>
    </section>

    <section className="story-specification">
      <header><span>Engineered choice by choice</span><h2>One category. Three levels of construction.</h2><p>Start with unit economics or build toward a high-presentation finish. Every route is checked against the same product and operational brief.</p></header>
      <div className="story-grade-grid">{item.grades.map((grade,index)=><article key={grade}><small>0{index+1}</small><h3>{['Efficient everyday','Balanced branded','Premium presentation'][index]||'Custom specification'}</h3><b>{grade}</b><p>{index===0?'Best for dependable repeat volume and controlled unit cost.':index===1?'The practical midpoint of strength, print quality and speed.':'For launches, gifting and high-value shelf or unboxing moments.'}</p></article>)}</div>
      <div className="story-size-run"><span>Common starting formats</span>{item.sizes.map(size=><b key={size}>{size}</b>)}<Link href="/custom-size">Need another size? Calculate it →</Link></div>
    </section>

    <section className="story-process">
      <header><span>From brief to repeat supply</span><h2>A clear four-step production path.</h2></header>
      <ol>{['Understand','Engineer','Prove','Produce'].map((title,index)=><li key={title}><span>0{index+1}</span><h3>{title}</h3><p>{process[index]}</p></li>)}</ol>
    </section>

    <section className="story-reviews">
      <header><span>Buyer perspective</span><h2>What a successful pack should change.</h2><p>Illustrative feedback based on the outcomes procurement teams evaluate. Replace these with verified customer reviews as projects are completed.</p></header>
      <div>{story.reviews.map((review,index)=><article key={review}><span>★★★★★</span><blockquote>“{review}”</blockquote><b>{item.uses[index]||item.uses[0]}</b><small>Illustrative B2B review</small></article>)}</div>
    </section>

    <section className="story-related">
      <header><span>Build the complete system</span><h2>Often specified alongside {item.name.toLowerCase()}.</h2></header>
      <div>{related.map(product=><Link href={`/categories/${product.slug}`} key={product.slug}><img src={`/catalog/${product.slug}-01.webp`} alt={`${product.name} wholesale packaging`}/><small>{product.family}</small><h3>{product.name}</h3><b>{product.price}</b><span>{product.moq} · Explore →</span></Link>)}</div>
    </section>

    <section className="story-faq">
      <header><span>Before you request a quote</span><h2>Questions worth answering early.</h2></header>
      <div>
        <details open><summary>{story.faq.question}</summary><p>{story.faq.answer}</p></details>
        <details><summary>What changes the final unit price?</summary><p>Finished size, material grade, print coverage, lamination, foil or texture, insert complexity, quantity and delivery PIN code shape the final rate. The listed range is for early budgeting.</p></details>
        <details><summary>Can Paper &amp; Press create the structure and artwork?</summary><p>Yes. We develop the dieline, recommend construction and review artwork placement. Brand identity creation or complex illustration can be scoped separately when needed.</p></details>
        <details><summary>What is the practical minimum order?</summary><p>The indicative starting point is {item.moq.toLowerCase()}. A different print method, material or finish can change the commercially viable minimum.</p></details>
        <details><summary>Can you deliver outside Jaipur?</summary><p>Yes. Production is coordinated from Jaipur with door-to-door delivery across India. Freight is confirmed from packed volume, weight and the destination PIN code.</p></details>
      </div>
    </section>

    <section className="story-final">
      <span>B2B production · Pan-India delivery</span><h2>Make the next {item.name.toLowerCase()} run work harder.</h2><p>Share the product, size, quantity and delivery PIN code. We will return a recommended construction and exact wholesale quote.</p>
      <div><Link href={`/quote?category=${item.slug}`}>Request exact pricing →</Link><Link href="/custom-size">Calculate custom dimensions</Link></div>
    </section>
  </div>;
}
