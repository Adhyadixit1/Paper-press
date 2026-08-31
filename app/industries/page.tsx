import type { Metadata } from 'next';
import Link from 'next/link';
import { industries } from '../data';

export const metadata: Metadata = { title: 'Industries — Paper & Press', description: 'Print and packaging possibilities for hospitality, beauty, retail and events.' };
export default function IndustriesPage() { return <main><section className="page-hero industry-hero"><p>Solutions by industry</p><h1>Every brand has a story.<br /><i>Make yours tangible.</i></h1><span>Flexible print and packaging made around how your customers buy, open, keep and share.</span></section><section className="industry-list">{industries.map((item,index) => <article key={item.title}><div className="industry-list-image"><img className={item.className} src={item.image} alt="" /><b>0{index+1}</b></div><div><p>Built for your world</p><h2>{item.title}</h2><p>{item.body} We balance impact, practicality and production details so every piece earns its place.</p><ul><li>Custom dimensions</li><li>Premium finishing options</li><li>Scalable quantities</li></ul><Link href="/quote">Plan a project →</Link></div></article>)}</section></main>; }
