'use client';

import { useState } from 'react';

const choices = {
  stock:['Premium White','Natural Kraft','Textured Ivory'],
  colour:['1 Color','2 Colors','Multi Color (CMYK)'],
  print:['Outside Only','Inside Only','Inside & Outside'],
};

export default function ProductConfigurator({ minimum,slug }: { minimum:string;slug?:string }) {
  const [quantity,setQuantity] = useState(250);
  const [requested,setRequested] = useState(false);
  const plain=slug==='plain-corrugated-boxes';
  const activeChoices=plain?{stock:['3 Ply Kraft','5 Ply Kraft','7 Ply Heavy-Duty'],colour:['Unprinted Kraft','White Kraft','Custom Print'],print:['No Print','Handling Marks','Shipping Label Area']}:choices;
  const sizes=plain?['6 × 4 × 4 in','10 × 8 × 6 in','14 × 10 × 8 in','Custom L × B × H']:['Custom size — tell us below','Small','Medium','Large'];
  return <div className="configurator">
    <label className="config-select"><span>Size</span><select>{sizes.map(size=><option key={size}>{size}</option>)}</select></label>
    {Object.entries(activeChoices).map(([label,items]) => <fieldset key={label}><legend>{label === 'stock' ? 'Material' : label === 'colour' ? 'Color' : 'Print option'}</legend><div className="option-grid">{items.map((item,index) => <label key={item}><input type="radio" name={label} defaultChecked={index===0}/><span>{item}</span></label>)}</div></fieldset>)}
    <label className="config-select"><span>Extra information</span><textarea rows={3} placeholder="Dimensions, Pantone colors, finishes or anything useful…"/></label>
    <fieldset><legend>Shipping method</legend><div className="ship-grid">{[['One time','One delivery'],['Planned','Split by date'],['Distribution','Multiple locations']].map(([title,copy],index)=><label key={title}><input type="radio" name="shipping" defaultChecked={index===0}/><span><b>{title}</b><small>{copy}</small></span></label>)}</div></fieldset>
    <div className="quantity-row"><div><span>Quantity</span><div className="stepper"><button onClick={()=>setQuantity(Math.max(1,quantity-50))}>−</button><b>{quantity}</b><button onClick={()=>setQuantity(quantity+50)}>＋</button></div><small>{minimum}</small></div><label><span>Email</span><input type="email" placeholder="you@brand.com"/></label></div>
    <button className="request-button" onClick={()=>setRequested(true)}>{requested ? 'Quote request added ✓' : 'Request a quote →'}</button>
    <a className="whatsapp" href="mailto:hello@paperandpress.com">Need it sooner? Message our print team</a>
  </div>;
}
