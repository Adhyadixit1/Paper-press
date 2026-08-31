'use client';

import {useRef,useState} from 'react';

export default function CategoryGallery({images,name}:{images:string[];name:string}){
  const track=useRef<HTMLDivElement>(null);
  const [active,setActive]=useState(0);
  function goTo(index:number){
    const element=track.current;
    if(!element)return;
    element.scrollTo({left:element.clientWidth*index,behavior:'smooth'});
    setActive(index);
  }
  function updateActive(){
    const element=track.current;
    if(!element||!element.clientWidth)return;
    setActive(Math.max(0,Math.min(images.length-1,Math.round(element.scrollLeft/element.clientWidth))));
  }
  return <div className="category-gallery category-gallery-interactive" aria-label={`${name} image gallery`}>
    <div className="category-gallery-track" ref={track} onScroll={updateActive}>
      {images.map((image,index)=><figure key={image}><img src={image} alt={`${name} wholesale gallery view ${index+1}`} loading={index===0?'eager':'lazy'}/><span>0{index+1}</span></figure>)}
    </div>
    <div className="category-gallery-mobile-nav">
      <div className="category-gallery-status"><span>{String(active+1).padStart(2,'0')}</span><i/><span>{String(images.length).padStart(2,'0')}</span></div>
      <div className="category-gallery-thumbs" aria-label="Choose category image">
        {images.map((image,index)=><button className={active===index?'active':''} aria-current={active===index?'true':undefined} aria-label={`Show ${name} image ${index+1}`} onClick={()=>goTo(index)} key={`${image}-thumb`}><img src={image} alt=""/></button>)}
      </div>
      <small>Swipe to explore ↔</small>
    </div>
  </div>;
}
