import type { Metadata } from 'next';
import QuoteForm from '../QuoteForm';

export const metadata: Metadata = { title: 'Start a quote — Paper & Press', description: 'Tell Paper & Press about your custom print or packaging project.' };
export default function QuotePage() { return <main className="quote-page"><section><p>Start a quote</p><h1>Bring us the idea.<br /><i>We’ll find the way.</i></h1><span>Share what you know so far. It does not need to be a perfect brief—we will help shape the details.</span><div className="quote-contact"><p><b>Prefer email?</b><br />hello@paperandpress.com</p><p><b>Studio hours</b><br />Monday–Friday, 9:30–18:00 IST</p></div></section><QuoteForm /></main>; }
