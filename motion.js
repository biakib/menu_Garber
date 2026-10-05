'use strict';
// Content stays readable if animation support is absent or motion is reduced.
function contentMotion(element,frames,options){
  if(!element?.animate || !window.matchMedia || window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  element.getAnimations?.().forEach(animation=>animation.cancel());
  return element.animate(frames,{easing:'cubic-bezier(.16,1,.3,1)',...options});
}
function revealContent(element){
  contentMotion(element,[{opacity:.25,transform:'translateY(18px)'},{opacity:1,transform:'translateY(0)'}],{duration:520});
  const items=element?.querySelectorAll?.('tbody tr, .steps li, .meal li')||[];
  items.forEach((item,index)=>contentMotion(item,[{opacity:.15,transform:'translateY(12px)'},{opacity:1,transform:'translateY(0)'}],{duration:440,delay:Math.min(index*40,360),fill:'backwards'}));
}
function revealSource(element){
  return contentMotion(element,[{opacity:0,transform:'translateY(16px)'},{opacity:1,transform:'translateY(0)'}],{duration:480});
}
function stopContentMotion(){document.getAnimations?.().forEach(animation=>animation.cancel());}
window.addEventListener?.('beforeprint',stopContentMotion);
window.matchMedia?.('(prefers-reduced-motion: reduce)').addEventListener?.('change',event=>{if(event.matches)stopContentMotion();});
