'use client';

import Link from 'next/link';
import {useEffect,useRef} from 'react';

export type HeroSlide={title:string;image:string;href:string;links:{label:string;href:string}[]};

export default function HomeHero({slides}:{slides:HeroSlide[]}){
  const track=useRef<HTMLElement>(null);
  const active=useRef(0);

  useEffect(()=>{
    const element=track.current;
    if(!element)return;
    const mobile=window.matchMedia('(max-width: 800px)');
    const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
    let timer:number|undefined;
    const start=()=>{
      if(timer)window.clearInterval(timer);
      if(!mobile.matches||reduced.matches)return;
      timer=window.setInterval(()=>{
        const first=element.firstElementChild as HTMLElement|null;
        if(!first)return;
        active.current=(active.current+1)%slides.length;
        element.scrollTo({left:active.current*(first.getBoundingClientRect().width+4),behavior:'smooth'});
      },3000);
    };
    const sync=()=>{
      const first=element.firstElementChild as HTMLElement|null;
      if(!first)return;
      active.current=Math.max(0,Math.min(slides.length-1,Math.round(element.scrollLeft/(first.getBoundingClientRect().width+4))));
    };
    element.addEventListener('scroll',sync,{passive:true});
    mobile.addEventListener('change',start);
    reduced.addEventListener('change',start);
    start();
    return()=>{if(timer)window.clearInterval(timer);element.removeEventListener('scroll',sync);mobile.removeEventListener('change',start);reduced.removeEventListener('change',start)};
  },[slides.length]);

  return <section className="hero-carousel" aria-label="Popular packaging categories" ref={track}>
    {slides.map((slide,index)=><article className="hero-slide" key={slide.title}>
      <img src={slide.image} alt={`${slide.title} by Paper & Press`}/><div className="hero-overlay"/>
      <div className="hero-copy"><span>0{index+1} / 0{slides.length}</span><h1>{slide.title}</h1><div>{slide.links.map(link=><Link href={link.href} key={link.label}>{link.label}</Link>)}</div><Link className="hero-shop" href={slide.href}>Shop now <b>→</b></Link></div>
    </article>)}
  </section>;
}
