'use client';

import {useRef,useState} from 'react';

export default function ProductGallery({images,name}:{images:string[];name:string}){
  const track=useRef<HTMLDivElement>(null);
  const [active,setActive]=useState(0);
  function goTo(index:number){
    const element=track.current;
    if(!element)return;
    element.scrollTo({left:element.clientWidth*index,behavior:'smooth'});
    setActive(index);
  }
  function trackScroll(){
    const element=track.current;
    if(!element||!element.clientWidth)return;
    setActive(Math.max(0,Math.min(images.length-1,Math.round(element.scrollLeft/element.clientWidth))));
  }
  return <section className="media-gallery" aria-label={`${name} image gallery`}>
    <div className="gallery-track" ref={track} onScroll={trackScroll}>
      {images.map((image,index)=><figure className={`gallery-image gallery-${index}`} key={`${image}-${index}`}><img src={image} alt={`${name} view ${index+1}`} loading={index===0?'eager':'lazy'}/></figure>)}
    </div>
    <div className="gallery-nav">
      <div className="gallery-status"><span>{String(active+1).padStart(2,'0')}</span><i/><span>{String(images.length).padStart(2,'0')}</span></div>
      <div className="gallery-thumbs" aria-label="Choose product image">
        {images.map((image,index)=><button className={active===index?'active':''} aria-current={active===index?'true':undefined} aria-label={`Show ${name} image ${index+1}`} onClick={()=>goTo(index)} key={`${image}-thumb`}><img src={image} alt=""/></button>)}
      </div>
      <span className="swipe-hint">Swipe to explore ↔</span>
    </div>
  </section>;
}
