'use strict';
// Navigation works without JavaScript on desktop; mobile controls announce their state.
const menu = document.querySelector('.menu-toggle');
const nav = document.querySelector('#navigation');
function closeMenu() { nav.classList.remove('is-open'); menu.setAttribute('aria-expanded', 'false'); }
menu.addEventListener('click', () => { const open = nav.classList.toggle('is-open'); menu.setAttribute('aria-expanded', String(open)); });
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
nav.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
if ('IntersectionObserver' in window && !reduceMotion) {
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.remove('is-pending'); observer.unobserve(entry.target); }
  }), { threshold: 0.06 });
  document.querySelectorAll('.reveal').forEach(element => {
    if(element.matches('img,video,iframe,.video-shell') || element.querySelector('img,video,iframe,.video-shell')) return;
    // Never hide content already visible or an element taller than the viewport.
    if (element.getBoundingClientRect().top > innerHeight * .9) element.classList.add('is-pending');
    observer.observe(element);
  });
}
// Scroll motion uses native scrolling and one animation frame per update.
// No wheel interception: keyboard, touch and browser scrolling remain native.
const hero = document.querySelector('.scroll-hero');
const stage = document.querySelector('.hero-stage');
const heading = document.querySelector('.hero-heading');
const heroFeature = document.querySelector('.hero-feature');
const heroPoster = document.querySelector('.hero-poster');
const heroLabel = document.querySelector('.hero-feature-label');
const collage = [...document.querySelectorAll('.collage-piece')];
const orbitImages = [...collage,heroPoster].filter(Boolean);
const collageScroll = collage.map(() => ({x:0,y:0}));
let heroScrollBlend = 0;
let orbitHeaderClearance = 18;
let heroReadingArea = null;
let orbitViewportBottom = Infinity;
const rail = document.querySelector('.photo-rail');
const railSection = document.querySelector('.photo-section');
let railManual = false;
if (rail) rail.addEventListener('focusin', () => { railManual = true; rail.style.transform = 'none'; });
const wordLine = document.querySelector('.word-reveal');
const words = [];
if (wordLine && !reduceMotion) {
  const text = wordLine.textContent;
  wordLine.setAttribute('aria-label', text);
  wordLine.textContent = '';
  text.trim().split(/\s+/).forEach((word, index) => {
    const span = document.createElement('span'); span.className = 'word'; span.textContent = word; span.setAttribute('aria-hidden','true');
    wordLine.append(span, document.createTextNode(' ')); words.push(span);
  });
}
const clamp = (n, min=0, max=1) => Math.max(min, Math.min(max, n));
const mix = (a,b,t) => a + (b-a)*t;
let scheduled = false;
function updateMotion() {
  const max = document.documentElement.scrollHeight - innerHeight;
  document.querySelector('.scroll-progress').style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
  if (!reduceMotion && rail && !railManual && innerWidth > 650) {
    const rect = railSection.getBoundingClientRect();
    const t = clamp((innerHeight-rect.top)/(innerHeight+rect.height));
    const overflow = Math.max(0,rail.scrollWidth-innerWidth+70);
    rail.style.transform = `translateX(${-overflow*t}px)`;
  }
  if (words.length) {
    const rect=wordLine.getBoundingClientRect();
    const t=clamp((innerHeight*.86-rect.top)/(innerHeight*.52));
    words.forEach((word,i)=>word.classList.toggle('is-lit',i/words.length<t));
  }
  scheduled=false;
}
function requestMotion() { if (!scheduled) { requestAnimationFrame(updateMotion); scheduled=true; } }
addEventListener('scroll', requestMotion, {passive:true});
addEventListener('resize', requestMotion);
addEventListener('load', requestMotion);
updateMotion();

// Native dialog supplies focus trapping, Escape support and focus restoration.
const dialog = document.querySelector('.lightbox');
let currentGroup = [], currentIndex = 0, opener;
function showImage() {
  const source = currentGroup[currentIndex].querySelector('img');
  dialog.querySelector('figure').classList.toggle('poster-lightbox', Boolean(source.closest('.poster-artwork')));
  dialog.querySelector('figure').classList.toggle('flower-lightbox', Boolean(source.closest('.flower-artwork')));
  dialog.querySelector('figure img').src = source.src;
  dialog.querySelector('figure img').alt = source.alt;
  dialog.querySelector('figcaption').textContent = `${source.alt} · ${currentIndex + 1} / ${currentGroup.length}`;
  dialog.querySelectorAll('.lightbox-prev,.lightbox-next').forEach(button => { button.hidden = currentGroup.length < 2; });
}
document.querySelectorAll('[data-gallery]').forEach(button => button.addEventListener('click', () => {
  opener = button;
  currentGroup = Array.from(document.querySelectorAll('[data-gallery]')).filter(item => item.dataset.gallery === button.dataset.gallery);
  currentIndex = currentGroup.indexOf(button);
  showImage(); dialog.showModal(); document.body.classList.add('modal-open');
}));
function step(direction) { currentIndex = (currentIndex + direction + currentGroup.length) % currentGroup.length; showImage(); }
dialog.querySelector('.lightbox-close').addEventListener('click', () => dialog.close());
dialog.querySelector('.lightbox-prev').addEventListener('click', () => step(-1));
dialog.querySelector('.lightbox-next').addEventListener('click', () => step(1));
dialog.addEventListener('keydown', event => { if (event.key === 'ArrowRight') step(1); if (event.key === 'ArrowLeft') step(-1); });
dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
dialog.addEventListener('close', () => { document.body.classList.remove('modal-open'); if (opener) opener.focus(); });

// No player, YouTube request, tracking or stored consent before an explicit click.
const videoOriginals = new Map();
function bindVideo(shell) {
  const button = shell.querySelector('.video-play');
  button.addEventListener('click', () => {
    videoOriginals.set(shell, shell.innerHTML);
    const frame = document.createElement('iframe');
    frame.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(shell.dataset.video)}?autoplay=1`;
    frame.title = button.getAttribute('aria-label'); frame.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    frame.allowFullscreen = true; frame.referrerPolicy = 'strict-origin-when-cross-origin';
    shell.replaceChildren(frame); frame.focus();
  });
}
document.querySelectorAll('[data-video]').forEach(bindVideo);
let toastTimeout;
document.querySelector('[data-reset-video]').addEventListener('click', () => {
  videoOriginals.forEach((original, shell) => { shell.innerHTML = original; bindVideo(shell); });
  videoOriginals.clear();
  const toast = document.querySelector('.toast'); toast.textContent = 'YouTube-Player entfernt. Videos laden erst nach erneutem Klick.';
  toast.classList.add('visible'); clearTimeout(toastTimeout); toastTimeout = setTimeout(() => toast.classList.remove('visible'), 4500);
});

// The repeated logo group makes the loop seamless; no app data leaves the browser.
const softwareSection=document.querySelector('.software-section');
if(softwareSection){
 // Fill wide screens without gaps and keep the travel speed at 42 px/second.
 const viewport=softwareSection.querySelector('.software-viewport');
 const track=softwareSection.querySelector('.software-track');
 const groups=[...softwareSection.querySelectorAll('.software-group')];
 const originals=[...groups[0].children].map(item=>item.cloneNode(true));
 function sizeSoftwareStrip(){
  groups.forEach(group=>{
   group.replaceChildren(...originals.map(item=>item.cloneNode(true)));
   const repeats=Math.max(1,Math.ceil((viewport.clientWidth+140)/group.scrollWidth));
   for(let i=1;i<repeats;i++)originals.forEach(item=>{
    const copy=item.cloneNode(true);copy.setAttribute('aria-hidden','true');group.append(copy);
   });
  });
  track.style.setProperty('--software-duration',`${groups[0].scrollWidth/42}s`);
 }
 sizeSoftwareStrip();
 if('ResizeObserver' in window)new ResizeObserver(sizeSoftwareStrip).observe(viewport);
 else addEventListener('resize',sizeSoftwareStrip);

 const pauseButton=softwareSection.querySelector('.software-pause');
 pauseButton.addEventListener('click',()=>{
  const paused=softwareSection.classList.toggle('is-paused');
  pauseButton.setAttribute('aria-pressed',String(paused));
  pauseButton.setAttribute('aria-label',paused?'Logoanimation fortsetzen':'Logoanimation pausieren');
  pauseButton.textContent=paused?'Weiter':'Pause';
 });
}
