'use client';

import {usePathname} from 'next/navigation';

const WHATSAPP_NUMBER='918824622541';

function pageLabel(pathname:string){
  const slug=pathname.split('/').filter(Boolean).pop();
  if(!slug)return 'wholesale packaging';
  return decodeURIComponent(slug).replace(/-/g,' ');
}

export default function WhatsAppSticky(){
  const pathname=usePathname();
  const message=`Hello Paper & Press Jaipur, I would like to order ${pageLabel(pathname)}. Please help me with wholesale pricing, MOQ and delivery.`;
  return <a className="whatsapp-sticky" href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`} target="_blank" rel="noopener noreferrer" aria-label="Order packaging on WhatsApp at 88246 22541">
    <span aria-hidden="true">W</span><div><small>Wholesale enquiry</small><b>Order on WhatsApp</b></div><i aria-hidden="true">→</i>
  </a>;
}
