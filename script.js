/* ===== CONFIG ===== */
const CONFIG = {
  CA: 'TBA',
  CHAIN: 'solana',
  X: 'https://x.com/spaceboss_elon',
  TG: 'https://t.me/spaceboss_elon',
  BUY_BASE: 'https://swap.pump.fun/?input=So11111111111111111111111111111111111111112&output=',
  CHART_BASE: 'https://dexscreener.com/solana/'
};
(function(){
  const q = new URLSearchParams(location.search).get('ca'); // test hook: ?ca=<address>
  if (q) CONFIG.CA = q;
})();
const SOL_RE = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
const caValid = () => SOL_RE.test(CONFIG.CA);
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const touch = matchMedia('(pointer: coarse)').matches || innerWidth < 820;

/* ===== LINKS ===== */
function applyLinks(){
  const id = caValid() ? CONFIG.CA : 'TBA';
  const map = { buy: CONFIG.BUY_BASE + id, chart: CONFIG.CHART_BASE + id, x: CONFIG.X, tg: CONFIG.TG };
  $$('[data-link]').forEach(a => { a.href = map[a.dataset.link]; });
  $$('[data-ca]').forEach(c => c.textContent = caValid() ? CONFIG.CA : 'TBA');
  const scope = $('.scope'), fr = $('#dexFrame');
  if (caValid()) {
    fr.src = `https://dexscreener.com/solana/${CONFIG.CA}?embed=1&theme=dark&trades=0&info=0`;
    scope.classList.add('live');
  } else { fr.removeAttribute('src'); scope.classList.remove('live'); }
}
applyLinks();

/* ===== COPY ===== */
const toast = $('#toast'); let tt;
function say(msg){ toast.textContent = msg; toast.classList.add('show'); clearTimeout(tt); tt = setTimeout(() => toast.classList.remove('show'), 2200); }
async function copyCA(){
  const v = caValid() ? CONFIG.CA : 'TBA';
  let ok = false;
  try { if (navigator.clipboard && isSecureContext) { await navigator.clipboard.writeText(v); ok = true; } } catch(e){}
  if (!ok) { const t = document.createElement('textarea'); t.value = v; t.setAttribute('readonly',''); t.style.cssText='position:fixed;opacity:0;left:-9999px'; document.body.appendChild(t); t.select(); try { ok = document.execCommand('copy'); } catch(e){} t.remove(); }
  say(ok ? (caValid() ? 'CA COPIED. ONLY TRUST THIS ONE.' : 'CA IS TBA. WATCH OUR OFFICIAL X.') : 'COPY FAILED. SELECT MANUALLY.');
  window.__lastCopy = v;
}
$$('[data-copy]').forEach(b => b.addEventListener('click', copyCA));

/* ===== BOOT ===== */
const boot = $('#boot');
let started = false;
function start(){
  if (started) return; started = true;
  if (reduce) { endBoot(); return; }
  boot.classList.add('alert');
  setTimeout(endBoot, 1500);
}
function endBoot(){
  boot.classList.add('gone'); document.body.classList.remove('booting');
  intro();
}
$('#pressStart').addEventListener('click', start);
boot.addEventListener('click', start);
addEventListener('keydown', start, { once: true });
setTimeout(start, reduce ? 0 : 2600); // auto insert coin

/* ===== HUD / MINIMAP ===== */
const objs = ['Read the briefing','Deploy the army','Win the battle','Speedrun to Mars','Join the army'];
const lvIds = ['briefing','deploy','battle','mars','join'];
const mmLinks = $$('.minimap a');
function hud(){
  const h = document.documentElement, p = h.scrollTop / Math.max(1, h.scrollHeight - innerHeight);
  $('#mmFill').style.height = (p*100) + '%';
  $('#hudAmmo').style.width = (100 - p*70) + '%';
  let cur = 0; lvIds.forEach((id,i) => { const el = document.getElementById(id); if (el.getBoundingClientRect().top < innerHeight*0.5) cur = i; });
  mmLinks.forEach((a,i) => { a.classList.toggle('on', i===cur); a.classList.toggle('done', i<cur); });
  $('#hudObj').textContent = objs[cur];
}
addEventListener('scroll', hud, { passive: true }); hud();

/* ===== LOADOUT ===== */
const units = [
  ['COMMANDER','assets/img/army_salute.webp','Supply officer. Keeps the whole army fair-launched.'],
  ['BLASTER','assets/img/army_fire.webp','Plasma rifle. Deletes outdated plans at range.'],
  ['WARDEN','assets/img/army_shield.webp','Hex shield. Diamond hands, rendered in hardware.'],
  ['JETBOOST','assets/img/army_fly.webp','Orbit-capable. First to the Mars transfer window.'],
  ['SPRINTER','assets/img/army_run.webp','Speedrun specialist. Any% or nothing.']
];
$$('.unit').forEach(b => b.addEventListener('click', () => {
  $$('.unit').forEach(x => { x.classList.remove('on'); x.setAttribute('aria-selected','false'); });
  b.classList.add('on'); b.setAttribute('aria-selected','true');
  const u = units[+b.dataset.unit]; const img = $('#unitImg');
  $('#unitName').textContent = u[0]; $('#unitRole').textContent = u[2];
  if (window.gsap && !reduce) gsap.fromTo(img,{opacity:0,y:30,filter:'brightness(3)'},{opacity:1,y:0,filter:'brightness(1)',duration:.45});
  img.src = u[1];
}));

/* ===== ORDER TYPING ===== */
const ORDER = '> ORDER 66.6: ARMY, ADVANCE. DELETE ALL OUTDATED PLANS.';
function setOrder(p){ $('#orderText').textContent = ORDER.slice(0, Math.round(ORDER.length * Math.min(1,p))); }

/* ===== ARCADE MINI GAME ===== */
(function(){
  const arena = $('#arena'), btn = $('#arenaStart'); let score=0, time=30, timer, spawn, hi = +(localStorage.getItem('eb_hi')||0);
  $('#hi').textContent = hi;
  const imgs = ['assets/img/enemy_walk.webp','assets/img/enemy_attack.webp'];
  function addT(){
    const t = document.createElement('img'); t.src = imgs[Math.random()*2|0]; t.className='tgt'; t.alt='Outdated plan bot'; t.draggable=false;
    const w = arena.clientWidth, h = arena.clientHeight;
    t.style.left = (w*0.35 + Math.random()*(w*0.55)) + 'px'; t.style.top = (50 + Math.random()*(h-180)) + 'px';
    t.addEventListener('pointerdown', e => hit(e, t)); arena.appendChild(t);
    setTimeout(() => t.remove(), 1600);
  }
  function hit(e, t){
    e.stopPropagation(); score += 100; $('#score').textContent = score;
    const r = arena.getBoundingClientRect(), g = $('#gunner').getBoundingClientRect();
    const x0 = g.right - r.left - 10, y0 = g.top - r.top + 40, x1 = e.clientX - r.left, y1 = e.clientY - r.top;
    const s = document.createElement('i'); s.className='shot'; s.style.left=x0+'px'; s.style.top=y0+'px';
    s.style.width = Math.hypot(x1-x0,y1-y0)+'px'; s.style.transform = `rotate(${Math.atan2(y1-y0,x1-x0)}rad)`;
    arena.appendChild(s); setTimeout(()=>s.remove(),120);
    t.src='assets/img/enemy_explode.webp'; t.style.pointerEvents='none'; setTimeout(()=>t.remove(),250);
    const p = document.createElement('span'); p.className='pop'; p.textContent='+100'; p.style.left=x1+'px'; p.style.top=y1+'px'; arena.appendChild(p);
    if (window.gsap) gsap.to(p,{y:-40,opacity:0,duration:.6,onComplete:()=>p.remove()}); else setTimeout(()=>p.remove(),600);
  }
  btn.addEventListener('click', () => {
    score=0; time=30; $('#score').textContent=0; $('#time').textContent=30; btn.style.display='none';
    spawn = setInterval(addT, 650); timer = setInterval(() => { time--; $('#time').textContent=time; if (time<=0) over(); }, 1000);
  });
  function over(){ clearInterval(spawn); clearInterval(timer); $$('.tgt',arena).forEach(t=>t.remove());
    if (score>hi){ hi=score; localStorage.setItem('eb_hi',hi); $('#hi').textContent=hi; }
    btn.textContent = `SCORE ${score} // PLAY AGAIN`; btn.style.display='block'; }
})();

/* ===== CONTINUE COUNTDOWN (pauses off-screen) ===== */
(function(){
  let n = 9, iv; const el = $('#count');
  const io = new IntersectionObserver(([e]) => {
    if (e.isIntersecting && !iv) iv = setInterval(() => { n = n<=0 ? 9 : n-1; el.textContent = n; }, 1000);
    if (!e.isIntersecting && iv) { clearInterval(iv); iv = null; }
  }); io.observe($('#join'));
})();

/* pause CSS loops off-screen */
const loopIO = new IntersectionObserver(es => es.forEach(e => e.target.style.animationPlayState = e.isIntersecting ? 'running' : 'paused'));
$$('.holo-ring,.holo-scan,.sweep,.press-start').forEach(el => loopIO.observe(el));

/* ===== MOTION ===== */
let introTl;
function intro(){
  if (!window.gsap || reduce) return;
  gsap.from('.boss-hpbar', { y: -80, opacity: 0, duration: .7, ease: 'back.out(1.6)' });
  gsap.from('.bh-bar i', { scaleX: 0, duration: 1.2, delay: .3, ease: 'power3.out' });
  gsap.from('.boss-bust', { x: 80, opacity: 0, scale: 1.08, duration: 1.1, ease: 'power3.out' });
  gsap.from('.namecard', { x: -60, opacity: 0, duration: .6, delay: .6 });
  gsap.from(['.enc-copy .eyebrow','.title','.unlock','.enc-copy .cta','.ca-box','.scam'], { y: 30, opacity: 0, stagger: .08, duration: .6, delay: .2 });
}

function motion(){
  if (!window.gsap || !window.ScrollTrigger) { document.body.classList.add('static'); setOrder(1); return; }
  gsap.registerPlugin(ScrollTrigger);
  if (reduce) { document.body.classList.add('static'); setOrder(1); return; }

  if (!touch && window.Lenis) {
    const lenis = new Lenis({ lerp: .1 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0);
    $$('.minimap a').forEach(a => a.addEventListener('click', e => { e.preventDefault(); lenis.scrollTo(a.getAttribute('href')); }));
  }
  const k = touch ? .5 : 1; // dampen on touch

  // boss bust parallax hover
  const st = $('#bossStage');
  if (!touch) st.addEventListener('pointermove', e => { const r = st.getBoundingClientRect(); const x=(e.clientX-r.left)/r.width-.5, y=(e.clientY-r.top)/r.height-.5;
    gsap.to('.boss-bust',{x:x*24,y:y*16,rotateY:x*8,duration:.6}); gsap.to('.holo-ring',{x:-x*30,y:-y*20,duration:.8}); });

  gsap.to('.boss-bust', { yPercent: 10*k, scrollTrigger: { trigger: '.encounter', start: 'top top', end: 'bottom top', scrub: true } });

  // section heads
  $$('.lv-head').forEach(h => gsap.from(h.children, { y: 40, opacity: 0, stagger: .08, duration: .7, scrollTrigger: { trigger: h, start: 'top 85%' } }));
  gsap.from('.statlist li', { x: 40, opacity: 0, stagger: .06, scrollTrigger: { trigger: '.statlist', start: 'top 85%' } });
  gsap.from('.bar i', { width: 0, stagger: .06, duration: 1, scrollTrigger: { trigger: '.statlist', start: 'top 80%' } });
  gsap.from('.quests li', { x: -60, opacity: 0, stagger: .12, scrollTrigger: { trigger: '.quests', start: 'top 85%' } });
  gsap.from('.replays figure', { y: 40, opacity: 0, stagger: .07, scrollTrigger: { trigger: '.replays', start: 'top 90%' } });

  // BATTLE
  const tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: '#battle', start: 'top top', end: () => '+=' + innerHeight * (touch ? 2.2 : 3.2), pin: true, scrub: .6, anticipatePin: 1 } });
  gsap.set('.a', { xPercent: -260, opacity: 0 });
  gsap.set('.foe-u', { xPercent: 160, opacity: 0 });
  const o = { p: 0 };
  tl.from('.cmd', { x: -200, opacity: 0, duration: .6 })
    .to(o, { p: 1, duration: 1.2, onUpdate: () => setOrder(o.p) })
    .to('.order-pulse', { opacity: 1, scale: 3, duration: .3 }).to('.order-pulse', { opacity: 0, duration: .2 })
    .to('.foe-u', { xPercent: 0, opacity: 1, stagger: .15, duration: 1 }, '<-.2')
    .to('.a', { xPercent: 0, opacity: 1, stagger: .12, duration: 1 }, '<')
    .to('.z1', { width: '30%', duration: .3 }).to('.z1', { opacity: 0, duration: .1 })
    .to('.z2', { width: '38%', duration: .3 }, '<').to('.z3', { width: '24%', duration: .3 })
    .to('.f1 .fhp i', { scaleX: 0, duration: .3 }, '<').to('#foeHp', { scaleX: .66, duration: .3 }, '<')
    .to('.m1', { opacity: 1, scale: 1.2, duration: .2 }, '<.1').to('.f1', { opacity: 0, rotate: -20, y: 40, duration: .3 }).to('.m1', { opacity: 0, duration: .2 })
    .to('.z4', { width: '42%', duration: .3 }).to('.f2 .fhp i', { scaleX: 0, duration: .3 }, '<').to('#foeHp', { scaleX: .33, duration: .3 }, '<')
    .to('#allyHp', { scaleX: .82, duration: .3 }, '<')
    .to('.m2', { opacity: 1, scale: 1.2, duration: .2 }).to('.f2', { opacity: 0, y: 50, duration: .3 }).to('.m2', { opacity: 0, duration: .2 })
    .to('.lz', { width: '50%', opacity: 1, duration: .4 }).to('.f3 .fhp i', { scaleX: 0, duration: .5 }, '<').to('#foeHp', { scaleX: 0, duration: .5 }, '<')
    .to('.f3', { x: 20, repeat: 5, yoyo: true, duration: .05 })
    .to('.m3', { opacity: 1, scale: 1.4, duration: .3 }).to('.f3', { opacity: 0, duration: .3 }, '<').to('.lz', { opacity: 0, duration: .2 }, '<')
    .to('.m3', { opacity: 0, duration: .3 })
    .fromTo('.ko', { opacity: 0, scale: 2.4 }, { opacity: 1, scale: 1, duration: .5, ease: 'back.out(2)' })
    .to('.a', { y: -12, stagger: .05, duration: .3 }).to({}, { duration: .6 });

  // ROCKET reuse: launch & land with scroll, counter climbs
  let launches = 0, lastDir = 0;
  const rk = gsap.timeline({ scrollTrigger: { trigger: '#rocketScene', start: 'top 75%', end: 'bottom 10%', scrub: .5,
      onUpdate: s => { $('#rkState').textContent = s.progress < .08 ? 'STANDBY' : s.progress < .5 ? 'ASCENT' : s.progress < .92 ? 'BOOSTBACK / LANDING' : 'LANDED. REFUEL.';
        if (s.progress > .92 && lastDir !== 1) { lastDir = 1; launches++; $('#launches').textContent = String(launches).padStart(3,'0'); }
        if (s.progress < .1) lastDir = 0; } } });
  rk.to('.rocket .flame', { opacity: 1, duration: .05 })
    .to('#rocket', { y: -360 * (innerWidth<820?.8:1), duration: .45, ease: 'power2.in' }, '<')
    .to('#rocket', { rotate: 180, duration: .1 })
    .to('#rocket', { rotate: 360, duration: .1 })
    .to('#rocket', { y: 0, duration: .35, ease: 'power2.out' })
    .to('.rocket .flame', { opacity: 0, duration: .05 });

  // SPEEDRUN timer
  const tm = { t: 0 }; const splits = $$('.splits li'); const marks = [8.4, 21.7, 33.9, 42.0];
  gsap.to(tm, { t: 42, ease: 'none', scrollTrigger: { trigger: '.splits', start: 'top 80%', end: 'bottom 30%', scrub: true },
    onUpdate: () => { const s = tm.t; const m = Math.floor(s/60); $('#timer').textContent = `${String(m).padStart(2,'0')}:${(s%60).toFixed(3).padStart(6,'0')}`;
      splits.forEach((li,i) => li.classList.toggle('hit', s >= marks[i])); } });

  gsap.from('.j-l', { x: -200, opacity: 0, scrollTrigger: { trigger: '.join', start: 'top 70%' } });
  gsap.from('.j-r', { x: 200, opacity: 0, scrollTrigger: { trigger: '.join', start: 'top 70%' } });
  gsap.from('.cont', { scale: .6, opacity: 0, duration: .8, ease: 'back.out(2)', scrollTrigger: { trigger: '.join', start: 'top 60%' } });

  // boss pointing ORDER pulse loop (only when visible)
  const pulse = gsap.to('#bossPoint', { scale: 1.02, transformOrigin: '20% 40%', repeat: -1, yoyo: true, duration: .8, paused: true });
  ScrollTrigger.create({ trigger: '#battle', start: 'top bottom', end: 'bottom top', onToggle: s => s.isActive ? pulse.play() : pulse.pause() });
  addEventListener('load', () => ScrollTrigger.refresh());
}
try { motion(); } catch (e) { console.warn('motion fallback', e); document.body.classList.add('static'); setOrder(1); }

/* mobile pad: reveal only after hero CTA/CA block leaves view */
(()=>{const s=document.querySelector('#briefing .scam');if(!s)return;let t=0;
const f=()=>{t=0;document.body.classList.toggle('pad-on',s.getBoundingClientRect().bottom<0)};
addEventListener('scroll',()=>{if(!t)t=requestAnimationFrame(f)},{passive:true});f();})();
