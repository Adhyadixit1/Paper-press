'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SearchBox() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  function submit(event: FormEvent) { event.preventDefault(); router.push(`/products${query ? `?search=${encodeURIComponent(query)}` : ''}`); }
  return <form className="search" onSubmit={submit}><span aria-hidden="true">⌕</span><input value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search products" placeholder="Search bakery, courier, café, hospital packaging..." /></form>;
}
