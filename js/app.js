/* Fernline Media — demo storefront logic (no backend). */
(function(){
const BRAND="Fernline Media";
const LICENSES={
  standard:{name:"Standard",sub:"Web & social",desc:"Websites, social posts, email, blogs. Up to 500k impressions. Non-exclusive.",price:[29,49]},
  extended:{name:"Extended",sub:"Print & paid ads",desc:"Everything in Standard plus print, packaging, paid ads, brochures and signage. Unlimited impressions.",price:[99,149]},
  exclusive:{name:"Exclusive buyout",sub:"Remove from sale",desc:"Extended rights plus we pull the image from the catalog. You're the only business using it going forward.",price:[999,1999]}
};
const PLANS={
  trail:{name:"Explorer",monthly:49,annual:39,dl:"10 downloads / mo"},
  basecamp:{name:"Basecamp",monthly:149,annual:119,dl:"50 downloads / mo"},
  summit:{name:"Summit Team",monthly:399,annual:319,dl:"Unlimited downloads, 5 seats"}
};
const ACTIVITIES={kayaking:"Kayaking",hiking:"Hiking",camping:"Camping",climbing:"Climbing",biking:"Biking",skiing:"Skiing",fishing:"Fishing",water:"Paddle & Surf"};
window.TL={LICENSES,PLANS,ACTIVITIES};
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const money=n=>"$"+n.toLocaleString("en-US",{minimumFractionDigits:0,maximumFractionDigits:2});
const photoById=id=>(window.PHOTOS||[]).find(p=>p.id===id);
const priceFor=(p,lic)=>LICENSES[lic].price[p.premium?1:0];
TL.money=money;TL.priceFor=priceFor;TL.photoById=photoById;

/* ---------- cart (localStorage) ---------- */
const KEY="fernline_cart_v1";
const cart={
  get(){try{return JSON.parse(localStorage.getItem(KEY))||[]}catch(e){return[]}},
  set(v){localStorage.setItem(KEY,JSON.stringify(v));updateCount()},
  addPhoto(id,lic){const c=this.get();const ex=c.find(i=>i.type==="photo"&&i.id===id);if(ex){ex.license=lic}else c.push({type:"photo",id,license:lic});this.set(c)},
  addPlan(key,billing){const c=this.get().filter(i=>i.type!=="plan");c.push({type:"plan",id:key,billing});this.set(c)},
  remove(idx){const c=this.get();c.splice(idx,1);this.set(c)},
  clear(){this.set([])},
  lineTotal(i){if(i.type==="photo"){const p=photoById(i.id);return p?priceFor(p,i.license):0}const pl=PLANS[i.id];return i.billing==="annual"?pl.annual*12:pl.monthly},
  total(){return this.get().reduce((s,i)=>s+this.lineTotal(i),0)}
};
TL.cart=cart;
function updateCount(){const n=cart.get().length;$$(".cart-count").forEach(e=>e.textContent=n)}
function toast(msg){let t=$(".toast");if(!t){t=document.createElement("div");t.className="toast";document.body.appendChild(t)}t.textContent=msg;t.classList.add("show");clearTimeout(t._h);t._h=setTimeout(()=>t.classList.remove("show"),2400)}
TL.toast=toast;

/* ---------- layout ---------- */
const LOGO=`<svg viewBox="0 0 40 40" aria-hidden="true"><rect width="40" height="40" rx="10" fill="#1f5c46"/><path d="M6 30 L16 14 L22 23 L26 18 L34 30 Z" fill="#f7f5f0"/><circle cx="29" cy="11" r="4" fill="#e8873a"/></svg>`;
function header(){
  const page=document.body.dataset.page;
  const links=[["index.html","Home","home"],["gallery.html","Browse photos","gallery"],["pricing.html","Pricing","pricing"],["about.html","About","about"],["contact.html","Contact","contact"]];
  return `<div class="demo-bar">Prototype demo — sample photos are stand-ins. No real payments are processed.</div>
  <header class="site-header"><div class="container nav">
    <a class="logo" href="index.html">${LOGO}<span>${BRAND}<small>Outdoor imagery for business</small></span></a>
    <button class="menu-btn" aria-label="Menu" onclick="document.querySelector('.nav-links').classList.toggle('open')">☰</button>
    <nav class="nav-links">${links.map(l=>`<a href="${l[0]}" class="${page===l[2]?"active":""}">${l[1]}</a>`).join("")}
      <a href="cart.html" class="cart-link ${page==="cart"?"active":""}">Cart <span class="cart-count">0</span></a></nav>
  </div></header>`;
}
function footer(){
  return `<footer><div class="container"><div class="foot-grid">
   <div><a class="logo" href="index.html" style="color:#fff">${LOGO}<span>${BRAND}</span></a><p style="max-width:320px;font-size:.92rem">Licensed outdoor adventure photography for outfitters, resorts, tourism boards, gear shops and agencies.</p></div>
   <div><h4>Explore</h4>${Object.entries(ACTIVITIES).slice(0,5).map(([k,v])=>`<a href="gallery.html?activity=${k}">${v}</a>`).join("")}</div>
   <div><h4>Business</h4><a href="pricing.html">Plans & pricing</a><a href="pricing.html#licenses">License types</a><a href="pricing.html#faq">FAQ</a><a href="cart.html">Cart</a></div>
   <div><h4>Company</h4><a href="about.html">About</a><a href="about.html#photographers">For photographers</a><a href="contact.html">Contact</a><a href="CREDITS.md">Image credits</a></div>
  </div><div class="foot-bottom">© 2026 ${BRAND} · Prototype for demonstration only · Sample images are CC0 from StockSnap.io — see CREDITS.md</div></div></footer>`;
}

/* ---------- photo card + modal ---------- */
function card(p){
  const s=priceFor(p,"standard"),e=priceFor(p,"extended"),x=priceFor(p,"exclusive");
  return `<article class="card" data-id="${p.id}">
   <div class="thumb" data-open="${p.id}"><img loading="eager" src="${p.img}" alt="${p.title} — ${p.desc}"><span class="badge">${ACTIVITIES[p.activity]}</span>${p.premium?'<span class="badge prem">Premium</span>':""}<span class="wm">Fernline Media</span></div>
   <div class="body"><h3>${p.title}</h3><div class="by">by ${p.photographer} · ${p.id}</div>
   <div class="prices"><span>Standard <b>${money(s)}</b></span><span>Extended <b>${money(e)}</b></span><span>Exclusive <b>${money(x)}</b></span></div>
   <div class="actions"><button class="btn small" data-open="${p.id}">View licenses</button><button class="btn small ghost" data-quick="${p.id}">+ Quick add</button></div></div></article>`;
}
TL.card=card;
function ensureModal(){
  if($("#photoModal"))return;
  const m=document.createElement("div");m.className="modal";m.id="photoModal";m.setAttribute("role","dialog");m.setAttribute("aria-modal","true");
  m.innerHTML=`<div class="modal-box"><div class="modal-img"><img alt=""><span class="wm" style="font-size:1.6rem">Fernline Media · preview</span></div><div class="modal-info"></div></div>`;
  document.body.appendChild(m);
  m.addEventListener("click",e=>{if(e.target===m)closeModal()});
  document.addEventListener("keydown",e=>{if(e.key==="Escape")closeModal()});
}
function openModal(id){
  const p=photoById(id);if(!p)return;ensureModal();const m=$("#photoModal");
  $(".modal-img img",m).src=p.img;$(".modal-img img",m).alt=p.title;
  $(".modal-info",m).innerHTML=`<button class="close" aria-label="Close">✕</button>
   <span class="eyebrow">${ACTIVITIES[p.activity]}${p.premium?" · Premium":""}</span><h2 style="font-size:1.7rem">${p.title}</h2>
   <p style="color:var(--muted);margin-top:0">${p.desc}</p>
   <div class="meta"><span>Photographer</span><b>${p.photographer}</b><span>Image ID</span><b>${p.id}</b><span>Orientation</span><b style="text-transform:capitalize">${p.orientation}</b><span>Releases</span><b>Demo — verify before launch</b><span>Keywords</span><b>${p.tags.join(", ")}</b></div>
   <form id="licForm">${Object.entries(LICENSES).map(([k,l],i)=>`<label class="lic"><div class="row"><span><input type="radio" name="lic" value="${k}" ${i===0?"checked":""}>${l.name} <span style="font-weight:500;color:var(--muted)">· ${l.sub}</span></span><span>${money(priceFor(p,k))}</span></div><small>${l.desc}</small></label>`).join("")}
   <button class="btn block" type="submit" style="margin-top:8px">Add to cart</button></form>
   <p style="font-size:.8rem;color:var(--muted);margin-top:12px">Subscribers on Basecamp or Summit get Standard + Extended rights included. <a href="pricing.html">See plans</a></p>`;
  $(".close",m).onclick=closeModal;
  $("#licForm",m).onsubmit=e=>{e.preventDefault();const lic=new FormData(e.target).get("lic");cart.addPhoto(p.id,lic);toast(`Added "${p.title}" — ${LICENSES[lic].name} license`);closeModal()};
  m.classList.add("open");document.body.style.overflow="hidden";
  history.replaceState(null,"","#"+p.id);
}
function closeModal(){const m=$("#photoModal");if(m&&m.classList.contains("open")){m.classList.remove("open");document.body.style.overflow="";history.replaceState(null,"",location.pathname+location.search)}}
TL.openModal=openModal;
document.addEventListener("click",e=>{
  const o=e.target.closest("[data-open]");if(o){openModal(o.dataset.open);return}
  const q=e.target.closest("[data-quick]");if(q){const p=photoById(q.dataset.quick);cart.addPhoto(p.id,"standard");toast(`Added "${p.title}" — Standard license`)}
});

document.addEventListener("DOMContentLoaded",()=>{
  document.body.insertAdjacentHTML("afterbegin",header());
  document.body.insertAdjacentHTML("beforeend",footer());
  updateCount();
  if(location.hash&&photoById(location.hash.slice(1)))openModal(location.hash.slice(1));
  $$("form[data-demo]").forEach(f=>f.addEventListener("submit",e=>{e.preventDefault();const n=$(".form-ok",f.parentElement);if(n){n.hidden=false;n.scrollIntoView({behavior:"smooth",block:"center"})}f.reset()}));
});
})();
