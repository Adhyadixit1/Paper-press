'use client';

import { FormEvent, useState } from 'react';

export default function QuoteForm() {
  const [sent, setSent] = useState(false);
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setSent(true); }
  if (sent) return <div className="quote-success"><span>✓</span><h2>Your project is on our desk.</h2><p>Thank you. We’ll review the details and get back to you with the best next step.</p><button onClick={() => setSent(false)}>Send another enquiry</button></div>;
  return <form className="quote-form" onSubmit={submit}><label>What are you creating?<select required defaultValue=""><option value="" disabled>Select a product</option><option>Premium packaging</option><option>Cards &amp; stationery</option><option>Brochures &amp; editorial</option><option>Something entirely bespoke</option></select></label><div className="form-row"><label>Quantity<input required type="number" min="1" placeholder="e.g. 250" /></label><label>Target date<input required type="date" /></label></div><div className="form-row"><label>Your name<input required placeholder="Full name" /></label><label>Email address<input required type="email" placeholder="you@company.com" /></label></div><label>Tell us about the project<textarea rows={5} placeholder="Size, materials, finishes, budget or anything useful..." /></label><button className="dark-button" type="submit">Request a quote <span>→</span></button></form>;
}
