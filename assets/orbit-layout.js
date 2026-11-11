/* Geometry shared by the homepage motion and its verification script. */
(function (root) {
  'use strict';
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  function aroundText(angle,image,area,view) {
    const cx=(area.left+area.right)/2,cy=(area.top+area.bottom)/2;
    const dx=Math.cos(angle)*view.width/view.height,dy=Math.sin(angle);
    const gap=24, bx=(area.right-area.left)/2,by=(area.bottom-area.top)/2;
    function limits(scale) {
      const hw=image.width*scale/2,hh=image.height*scale/2;
      const tx=Math.abs(dx)<1e-9?Infinity:(dx>0?view.right-cx-hw:cx-view.left-hw)/Math.abs(dx);
      const ty=Math.abs(dy)<1e-9?Infinity:(dy>0?view.bottom-cy-hh:cy-view.top-hh)/Math.abs(dy);
      const inner=Math.min((bx+gap+hw)/Math.max(1e-9,Math.abs(dx)),(by+gap+hh)/Math.max(1e-9,Math.abs(dy)));
      return {inner,outer:Math.min(tx,ty)};
    }
    let scale=1;
    if(limits(1).inner>limits(1).outer) {
      let low=0,high=1;
      for(let i=0;i<14;i++){const mid=(low+high)/2,l=limits(mid);if(l.inner<=l.outer)low=mid;else high=mid;}
      scale=low*.98;
    }
    const l=limits(scale),radius=l.inner+(l.outer-l.inner)*.5;
    return {x:cx+dx*radius,y:cy+dy*radius,scale};
  }
  function inBand(angle,image,area,view,base,phase=0) {
    const gap=20,above=base.y<(area.top+area.bottom)/2;
    const top=above?view.top:area.bottom+gap;
    const bottom=above?area.top-gap:view.bottom;
    const scale=Math.max(0,Math.min(1,(bottom-top)/image.height,(view.right-view.left)/image.width));
    const hw=image.width*scale/2,hh=image.height*scale/2;
    return {
      x:clamp(base.x+8*(Math.sin(angle+phase)-Math.sin(phase)),view.left+hw,view.right-hw),
      y:clamp(base.y+8*(Math.cos(phase)-Math.cos(angle+phase)),top+hh,bottom-hh),scale
    };
  }
  const api={aroundText,inBand};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.PortfolioMotion=api;
})(typeof window==='undefined'?{}:window);
