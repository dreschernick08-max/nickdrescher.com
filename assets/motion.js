'use strict';
/* A motion layer inspired by the gestures of contemporary creative studios.
   No third-party trackers, libraries or external image sources. */
(() => {
  const root = document.documentElement;
  const body = document.body;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobileQuery = window.matchMedia('(max-width: 650px)');
  const finePointer = window.matchMedia('(pointer: fine)');
  const clamp = (x, min = 0, max = 1) => Math.max(min, Math.min(max, x));
  const lerp = (a, b, t) => a + (b - a) * t;
  root.classList.add('motion-enabled');

  // One logo arrival on the first session visit, and again on explicit reload.
  // Scroll and history restoration never create a new arrival sequence.
  const header=document.querySelector('.site-header');
  const logo=header?.querySelector('.logo img');
  let arrived=false;
  try{arrived=sessionStorage.getItem('nick-logo-arrived')==='1';sessionStorage.setItem('nick-logo-arrived','1');}catch{}
  const navType=performance.getEntriesByType('navigation')[0]?.type;
  if(logo && !reduced && navType!=='back_forward' && (!arrived||navType==='reload')){
    const plane=document.createElement('div');plane.className='logo-arrival logo-click-intro';plane.setAttribute('aria-hidden','true');
    plane.style.background='#000';
    const mark=document.createElement('div');mark.className='logo-arrival-mark';
    const ns='http://www.w3.org/2000/svg';
    const svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox','0 0 1024 1024');
    // Native vector letterforms avoid raster clipping seams between the N and D.
    svg.innerHTML='<circle class="intro-ring" cx="512" cy="512" r="490" fill="none" stroke="#faf9f6" stroke-width="24"/><path class="intro-letter intro-letter-n" fill="#faf9f6" d="M182 310Q182 260 232 260H263Q286 260 300 282L386 414V310Q386 260 436 260H750Q810 260 810 320Q810 380 750 380H553Q506 380 506 427V617Q506 665 460 665H433Q407 665 390 640L303 507V615Q303 665 253 665H232Q182 665 182 615Z"/><path class="intro-letter intro-letter-d" fill="#faf9f6" fill-rule="evenodd" d="M585 400H651C790 400 874 475 874 586C874 706 790 774 651 774H351Q294 774 294 726Q294 680 351 680H474Q524 680 524 630V461Q524 400 585 400ZM646 508V690H660Q750 690 750 599Q750 508 660 508Z"/>';
    mark.append(svg);plane.append(mark);body.append(plane);
    const cleanup=()=>plane.remove();
    setTimeout(()=>plane.classList.add('is-pressed'),740);
    setTimeout(()=>plane.classList.add('is-revealing'),940);
    setTimeout(cleanup,1450);
    addEventListener('pageshow',event=>{if(event.persisted)cleanup();});
  }
  // Resize-only portrait fitting: preserve a measured gap under the title.
  const portraitHero=document.querySelector('.portrait-hero');
  if(portraitHero){
    const fitPortrait=()=>{
      const area=portraitHero.getBoundingClientRect();
      const title=portraitHero.querySelector('.portrait-hero-heading').getBoundingClientRect();
      portraitHero.style.setProperty('--portrait-height',Math.max(260,area.bottom-title.bottom-36)+'px');
    };
    fitPortrait();addEventListener('resize',fitPortrait);addEventListener('load',fitPortrait);
    document.fonts?.ready.then(fitPortrait);
    if('ResizeObserver' in window)new ResizeObserver(fitPortrait).observe(portraitHero.querySelector('.portrait-hero-heading'));
  }
  // Keep the glass header legible above both the black hero and light content.
  let glassFrame=0;
  const paintGlass=()=>{
    glassFrame=0;
    header?.classList.toggle('is-over-light',!!portraitHero&&portraitHero.getBoundingClientRect().bottom<header.getBoundingClientRect().bottom+12);
  };
  addEventListener('scroll',()=>{if(!glassFrame)glassFrame=requestAnimationFrame(paintGlass);},{passive:true});
  addEventListener('resize',paintGlass);paintGlass();

  // Fiasco-like rollover typography, but the link labels stay fully accessible.
  document.querySelectorAll('.site-header #navigation > a').forEach(link => {
    const label = link.textContent.trim();
    if (!label) return;
    const outer = document.createElement('span');
    const rail = document.createElement('span');
    outer.className = 'roll-viewport';
    rail.className = 'roll-set';
    const first = document.createElement('span');
    const second = document.createElement('span');
    first.textContent = label;
    second.textContent = label;
    second.setAttribute('aria-hidden', 'true');
    rail.append(first, second);
    outer.append(rail);
    link.replaceChildren(outer);
    link.setAttribute('aria-label', label);
  });

  // Media remains visible immediately; hover and scroll positioning stay active.
  // Animating the homepage hero images without touching the collision-safe orbit.
  const heroStage = document.querySelector('.hero-stage');
  if (heroStage && !reduced && finePointer.matches) {
    const images = Array.from(heroStage.querySelectorAll('.collage-piece img, .hero-feature > img'));
    let px = 0, py = 0, targetX = 0, targetY = 0, moving = false, frame = 0;
    const draw = () => {
      px = lerp(px, targetX, .075);
      py = lerp(py, targetY, .075);
      images.forEach((img, i) => {
        const factor = .45 + (i % 4) * .13;
        img.style.setProperty('--mouse-x', `${(px * factor).toFixed(2)}px`);
        img.style.setProperty('--mouse-y', `${(py * factor).toFixed(2)}px`);
      });
      if (Math.abs(px - targetX) + Math.abs(py - targetY) > .25 || moving) frame = requestAnimationFrame(draw);
      else frame = 0;
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(draw); };
    heroStage.addEventListener('pointermove', event => {
      const r = heroStage.getBoundingClientRect();
      targetX = clamp((event.clientX - r.left) / Math.max(1, r.width) - .5, -.5, .5) * 22;
      targetY = clamp((event.clientY - r.top) / Math.max(1, r.height) - .5, -.5, .5) * 18;
      moving = true;
      schedule();
    }, {passive:true});
    heroStage.addEventListener('pointerleave', () => { targetX = 0; targetY = 0; moving = false; schedule(); });
    document.addEventListener('visibilitychange', () => { if (document.hidden && frame) { cancelAnimationFrame(frame); frame = 0; } });
  }

  // A sticky, scroll-scrubbed image sequence. Mobile users swipe the same originals.
  const craft = document.querySelector('.craft-journey');
  const craftSticky = craft?.querySelector('.craft-sticky');
  const craftWindow = craft?.querySelector('.craft-window');
  const craftTrack = craft?.querySelector('.craft-track');
  const craftItems = craft ? Array.from(craft.querySelectorAll('.craft-card')) : [];
  const craftProgress = craft?.querySelector('.craft-progress');
  const craftStep = craft?.querySelector('.craft-step');
  let animationRequested = false;
  let motionActive = true;
  const painting = () => {
    animationRequested = false;
    if (!motionActive) return;
    if (craft && craftTrack) {
      const horizontalMax = Math.max(0, craftTrack.scrollWidth - craftWindow.clientWidth);
      let p;
      if (reduced) {
        p = horizontalMax ? clamp(craftWindow.scrollLeft / horizontalMax) : 0;
        craftTrack.style.removeProperty('--craft-x');
      } else {
        const top = craft.getBoundingClientRect().top;
        const scrollSpan = Math.max(1, craft.offsetHeight - craftSticky.offsetHeight);
        const headerH = parseFloat(getComputedStyle(root).getPropertyValue('--header')) || 82;
        p = clamp((headerH - top) / scrollSpan);
        craftTrack.style.setProperty('--craft-x', `${(-horizontalMax * p).toFixed(2)}px`);
        craft.querySelector('.craft-heading').style.opacity = String(1-clamp(p/.18));
      }
      craftProgress.style.setProperty('--craft-progress', p.toFixed(4));
      const activeIndex = Math.min(craftItems.length - 1, Math.max(0, Math.round(p * (craftItems.length - 1))));
      craftStep.textContent = `${String(activeIndex + 1).padStart(2, '0')} / ${String(craftItems.length).padStart(2, '0')}`;
    }
    if (!reduced && !mobileQuery.matches) {
      document.querySelectorAll('.work-image').forEach(frame => {
        const rect = frame.getBoundingClientRect();
        if (rect.bottom <= 0 || rect.top >= innerHeight) return;
        const center = (rect.top + rect.bottom) / 2;
        const t = clamp((center - innerHeight * .5) / innerHeight, -1, 1);
        const img = frame.querySelector('img');
        if (img) img.style.setProperty('--img-y', `${(-t * 19).toFixed(1)}px`);
      });
    }
  };
  const requestPaint = () => {
    if (!animationRequested) { animationRequested = true; requestAnimationFrame(painting); }
  };
  window.addEventListener('scroll', requestPaint, {passive:true});
  window.addEventListener('resize', requestPaint, {passive:true});
  craftWindow?.addEventListener('scroll', requestPaint, {passive:true});
  document.addEventListener('visibilitychange', () => { motionActive = !document.hidden; if (motionActive) requestPaint(); });
  window.addEventListener('load', requestPaint);
  document.fonts?.ready.then(requestPaint);
  requestPaint();

  // Page-change curtain for internal multi-page navigation only.
  if (!reduced) {
    const wipe = document.createElement('div');
    wipe.className = 'page-wipe';wipe.setAttribute('aria-hidden','true');
    body.append(wipe);
    let leaving = false;
    document.addEventListener('click', e => {
      const link=e.target.closest?.('a[href]');
      if (!link || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || leaving) return;
      if (link.target && link.target !== '_self') return;
      if (link.hasAttribute('download')) return;
      const href=link.getAttribute('href');
      if(!href || href.startsWith('#') || /^(mailto:|tel:|javascript:)/i.test(href))return;
      let destination;
      try { destination=new URL(href,location.href); } catch (err) { return; }
      if(destination.protocol!=='http:' && destination.protocol!=='https:')return;
      if(destination.origin!==location.origin)return;
      if(destination.pathname===location.pathname && destination.search===location.search)return;
      e.preventDefault();leaving=true;root.classList.add('is-leaving');
      setTimeout(()=>{ location.assign(destination.href); }, 520);
    });
    window.addEventListener('pageshow',()=>{ leaving=false;root.classList.remove('is-leaving'); });
  }
})();
