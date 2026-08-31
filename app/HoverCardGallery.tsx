'use client';

import {useEffect,useState} from 'react';

export default function HoverCardGallery({images,alt}:{images:string[];alt:string}){
  const [active,setActive]=useState(0);
  const [running,setRunning]=useState(false);

  useEffect(()=>{
    if(!running||images.length<2||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    const timer=window.setInterval(()=>setActive(index=>(index+1)%images.length),850);
    return()=>window.clearInterval(timer);
  },[running,images.length]);

  function stop(){setRunning(false);setActive(0)}

  return <div className={`hover-card-gallery${running?' is-running':''}`} onPointerEnter={()=>setRunning(true)} onPointerLeave={stop}>
    {images.map((image,index)=><img className={active===index?'active':''} src={image} alt={index===0?alt:''} aria-hidden={index===0?undefined:'true'} loading={index===0?'eager':'lazy'} key={`${image}-${index}`}/>)}
    <div className="hover-gallery-progress" aria-hidden="true">{images.map((_,index)=><i className={active===index?'active':''} key={index}/>)}</div>
  </div>;
}
