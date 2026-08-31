import Link from 'next/link';
import SearchBox from './SearchBox';

export function Header() {
  return <><div className="trustbar"><span>Crafted for ambitious brands.</span><strong>Premium print, personal service.</strong><Link href="/about">Our studio</Link></div><header className="site-header"><Link className="wordmark" href="/" aria-label="Paper and Press home">Paper <i>&amp;</i> Press</Link><nav aria-label="Main navigation"><Link href="/products">Products</Link><Link href="/industries">Industries</Link></nav><SearchBox /><div className="header-actions"><Link href="/about">About</Link><Link className="quote-button" href="/quote">Start a quote</Link><Link className="bag" href="/products" aria-label="Browse products">▱</Link></div><details className="mobile-nav"><summary aria-label="Open menu">Menu</summary><div><Link href="/products">Products</Link><Link href="/industries">Industries</Link><Link href="/about">About</Link><Link href="/quote">Start a quote</Link></div></details></header></>;
}

export function Footer() {
  return <footer className="footer"><div className="footer-top"><div><Link className="wordmark footer-mark" href="/">Paper <i>&amp;</i> Press</Link><p>PRINT&nbsp; • &nbsp;PACKAGING&nbsp; • &nbsp;POSSIBILITIES</p></div><div><h3>Company</h3><Link href="/about">About</Link><Link href="/industries">Industries</Link><Link href="/quote">Contact</Link></div><div><h3>Shop</h3><Link href="/products">All products</Link><Link href="/products">Samples</Link><Link href="/quote">Custom projects</Link></div><div className="footer-note"><h3>Have something in mind?</h3><p>Tell us what you are making. We will help with materials, finishes and the smartest way to produce it.</p><Link className="light-button" href="/quote">Start a project →</Link></div></div><div className="footer-bottom"><span>© Paper &amp; Press 2026</span><span>Made with care in India</span><span>Instagram &nbsp; Pinterest &nbsp; LinkedIn</span></div></footer>;
}

export function ProductCard({ product }: { product: { slug:string; name:string; eyebrow:string; delivery:string; price:string; image:string; className:string } }) {
  return <Link className="product-card" href={`/products/${product.slug}`}><div className={`product-image ${product.className}`}><img src={product.image} alt="" /><span className="product-arrow">↗</span></div><div className="product-meta"><p>{product.eyebrow}<span>· {product.delivery}</span></p><h3>{product.name}</h3><small>{product.price}</small></div></Link>;
}
