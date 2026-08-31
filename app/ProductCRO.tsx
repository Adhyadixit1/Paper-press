import Link from 'next/link';
import {b2bCategories} from './catalog';

type ProductLike={slug:string;name:string;eyebrow:string;delivery:string;price:string};
type Profile={buyers:string[];uses:string[];benefit:string;related:string[]};

const profiles:Record<string,Profile>={
  'food-paper':{buyers:['QSR chains','Cloud kitchens','Bakeries'],uses:['Burger and sandwich wrapping','Tray and basket liners','Bakery and deli counter service'],benefit:'Keeps presentation consistent while a grease-resistant sheet protects hands, trays and the food experience.',related:['burger-boxes','food-paper','meal-boxes']},
  'printed-tissue':{buyers:['Fashion labels','D2C stores','Gift businesses'],uses:['Garment wrapping','Box interiors','Retail and gifting'],benefit:'Adds a lightweight branded reveal without changing the primary carton or increasing storage complexity.',related:['garment-boxes','retail-paper-bags','stickers-labels']},
  'cups':{buyers:['Independent cafés','Beverage chains','Events'],uses:['Hot coffee and tea','Cold counter service','Multi-outlet takeaway'],benefit:'Turns every takeaway drink into a repeat brand impression while matching the correct cup wall and serving temperature.',related:['paper-cups','cup-sleeves','cup-carriers']},
  'coffee-bags':{buyers:['Specialty roasters','Café brands','Private labels'],uses:['Whole bean retail','Ground coffee','Subscription dispatch'],benefit:'Combines aroma protection, valve options and shelf communication in a pack designed around roast format and fill weight.',related:['coffee-bags','stickers-labels','corrugated-mailers']},
  'cotton-totes':{buyers:['Fashion labels','Museums and events','Premium retailers'],uses:['Retail carry bags','Launch merchandise','Reusable gifting'],benefit:'Extends the brand beyond the purchase with a useful, repeat-carry format and controlled print placement.',related:['retail-paper-bags','garment-flyers','garment-boxes']},
  'poly-mailers':{buyers:['Fashion ecommerce','Marketplaces','Subscription brands'],uses:['Garment dispatch','Soft-goods courier','Return-ready shipping'],benefit:'Right-sized mailers reduce parcel bulk while a distinctive outer print makes delivery feel intentional.',related:['corrugated-mailers','garment-flyers','stickers-labels']},
  'rigid-boxes':{buyers:['Luxury brands','Corporate gifting','Launch teams'],uses:['Premium product sets','Influencer mailers','Keepsake gifting'],benefit:'A rigid structure adds protection, perceived value and a reveal sequence that folding cartons cannot match.',related:['box-inserts-dividers','packaging-sleeves','stickers-labels']},
  'gift-boxes':{buyers:['Wedding planners','Gifting studios','Hospitality brands'],uses:['Festive assortments','Wedding favours','Corporate hampers'],benefit:'Custom sizing, inserts and finishing keep mixed products secure while making the entire set feel considered.',related:['tea-dryfruit-boxes','box-inserts-dividers','packaging-sleeves']},
  'pizza-boxes':{buyers:['Pizzerias','QSR chains','Cloud kitchens'],uses:['Dine-out takeaway','Delivery aggregators','Event catering'],benefit:'Correct board, ventilation and print placement help pizza travel better and keep branding visible at the table.',related:['pizza-boxes','food-paper','stickers-labels']},
  'cup-sleeves':{buyers:['Coffee shops','Tea brands','Event caterers'],uses:['Hot cup insulation','Seasonal campaigns','Unbranded cup upgrades'],benefit:'A sleeve adds grip, insulation and changeable branding without requiring a fully custom cup run.',related:['cup-sleeves','paper-cups','cup-carriers']},
  'cold-cups':{buyers:['Juice bars','Dessert cafés','Event operators'],uses:['Iced coffee','Juices and coolers','Smoothies and shakes'],benefit:'Clear, size-matched cups make colour and product visible while print and stickers keep the presentation on brand.',related:['paper-cups','cup-carriers','stickers-labels']},
  'napkins':{buyers:['Restaurants','Cafés','Caterers'],uses:['Table service','Takeaway cutlery kits','Events and sampling'],benefit:'A small, high-frequency touchpoint can carry the brand while the correct ply and absorbency handle real service needs.',related:['food-paper','meal-boxes','stickers-labels']},
  'business-cards':{buyers:['Founders','Studios and agencies','Sales teams'],uses:['Meetings and pitches','Retail counters','Event networking'],benefit:'Stock, edge colour and print finish make a compact introduction feel deliberate and easier to remember.',related:['office-folders','garment-flyers','packaging-sleeves']},
  'brochures':{buyers:['Hospitality teams','Real estate','Product brands'],uses:['Catalogues and menus','Sales presentations','Launch storytelling'],benefit:'A considered fold, stock and page sequence turns detailed information into a guided, tactile brand experience.',related:['office-folders','garment-flyers','hospital-files']},
  'press-kits':{buyers:['PR teams','Beauty launches','Fashion brands'],uses:['Media seeding','Influencer mailers','Product launch sets'],benefit:'One coordinated structure can organise products, storytelling and inserts into a memorable launch experience.',related:['cosmetic-cartons','box-inserts-dividers','garment-flyers']},
  'inserts':{buyers:['D2C founders','Marketplaces','Subscription brands'],uses:['Thank-you cards','Care instructions','Offers and referrals'],benefit:'Low-cost printed inserts explain, reassure and bring customers back without changing the shipping pack.',related:['garment-flyers','stickers-labels','corrugated-mailers']},
  'plain-corrugated-boxes':{buyers:['Ecommerce sellers','Warehouses','Manufacturers'],uses:['Everyday courier dispatch','Storage and stock transfer','Outer cartons for distribution'],benefit:'Plain boxes prioritise protection and price: the right internal dimensions and ply prevent wasted space and avoid paying for unnecessary print.',related:['plain-corrugated-boxes','industrial-cartons','box-inserts-dividers']},
};

export default function ProductCRO({product}:{product:ProductLike}){
  const profile=profiles[product.slug]||profiles['rigid-boxes'];
  const related=profile.related.map(slug=>b2bCategories.find(item=>item.slug===slug)).filter(Boolean) as typeof b2bCategories;
  return <div className="product-cro">
    <section className="product-proof"><div><strong>Free</strong><span>expert design proof</span></div><div><strong>Pan-India</strong><span>door-to-door delivery</span></div><div><strong>{product.delivery}</strong><span>indicative production</span></div></section>

    <section className="product-cro-section">
      <span className="product-cro-kicker">Designed for real businesses</span><h2>Who we make {product.name.toLowerCase()} for.</h2>
      <div className="product-buyer-grid">{profile.buyers.map((buyer,index)=><article key={buyer}><span>0{index+1}</span><h3>{buyer}</h3><p>Built around your product, order volume, service environment and repeat-supply needs.</p></article>)}</div>
    </section>

    <section className="product-cro-section use-section">
      <span className="product-cro-kicker">Where it is used</span><h2>Made for the way your product moves.</h2>
      <div className="use-list">{profile.uses.map((use,index)=><div key={use}><b>0{index+1}</b><span>{use}</span></div>)}</div>
    </section>

    <section className="custom-case">
      <span>Why custom packaging</span><h2>Fit first.<br/>Brand second.<br/>Waste less.</h2><p>{profile.benefit}</p>
      <ul><li>Choose dimensions around the actual product</li><li>Select economy, standard or premium materials</li><li>Control colours, pattern, tape and finishing</li><li>Preserve the approved specification for repeat runs</li></ul>
    </section>

    <section className="product-cro-section">
      <span className="product-cro-kicker">Included before production</span><h2>We help design it—free.</h2><p className="section-lead">You do not need a production-ready dieline. Share the product and direction; our team checks the structure and prepares a proof before anything goes to press.</p>
      <ol className="free-design-steps"><li><b>Share the brief</b><span>Product, quantity, dimensions and inspiration.</span></li><li><b>Choose a route</b><span>Plain, one-colour, patterned or premium finish.</span></li><li><b>Review the proof</b><span>Dieline, artwork position and production notes.</span></li><li><b>Approve production</b><span>Nothing is printed until the proof is signed off.</span></li></ol>
      <Link className="outline-cta" href={`/quote?product=${product.slug}`}>Book a free design consultation →</Link>
    </section>

    <section className="product-cro-section review-section">
      <span className="product-cro-kicker">Buyer review checklist</span><h2>What teams ask us to get right.</h2>
      <div className="review-cards"><article><div>★★★★★</div><p>“Will the material hold up through packing, stacking and delivery?”</p><span>Structure &amp; protection review</span></article><article><div>★★★★★</div><p>“Will the printed colour and finish feel consistent across a full run?”</p><span>Artwork &amp; production proof</span></article><article><div>★★★★★</div><p>“Can the exact approved specification be repeated next month?”</p><span>Reorder &amp; supply planning</span></article></div>
    </section>

    <section className="product-cro-section">
      <span className="product-cro-kicker">Build the complete system</span><h2>Related packaging.</h2>
      <div className="product-related">{related.map(item=><Link key={item.slug} href={`/categories/${item.slug}`}><img src={`/catalog/${item.slug}-01.webp`} alt={item.name}/><div><small>{item.family}</small><h3>{item.name}</h3><b>{item.price}</b><span>Explore →</span></div></Link>)}</div>
    </section>

    <section className="product-cro-section product-faq"><span className="product-cro-kicker">Good to know</span><h2>Before you order.</h2><details><summary>Can I order it completely plain?</summary><p>Yes. Where the format allows, we can quote an unprinted economy version as well as branded options.</p></details><details><summary>What do you need for an exact quote?</summary><p>Dimensions, quantity, product weight or use, material preference, print coverage and delivery PIN code. A sample photo is useful when available.</p></details><details><summary>Is design support really included?</summary><p>Yes. Basic dieline setup, artwork positioning and a digital production proof are included before manufacturing. Complex brand identity or illustration work is quoted separately.</p></details><details><summary>Can I reorder the same specification?</summary><p>Yes. Once approved, the structure and artwork specification can be used for planned repeat production.</p></details></section>

    <section className="product-final-cta"><span>{product.eyebrow} · {product.price}</span><h2>Make the next run easier.</h2><p>Tell us what you pack and where it needs to go. We’ll recommend the most practical route.</p><Link href={`/quote?product=${product.slug}`}>Start your free design proof →</Link></section>
  </div>;
}
