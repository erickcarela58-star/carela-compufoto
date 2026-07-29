/* ================= D' Carela · site.js (shared) ================= */
(function(){
'use strict';
const IMG='img/';
const WA='18097575644';
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
function wa(m){return 'https://wa.me/'+WA+'?text='+encodeURIComponent(m||"Hola D' Carela, quiero reservar una sesión 📸");}
function seq(p,n){return Array.from({length:n},(_,i)=>IMG+p+i+'.webp');}
// POOL por categoría REAL (inyectado desde portfolio-data.json vía window.DC_POOL). Fallback: por prefijo de archivo.
const POOL=(window.DC_POOL&&Object.keys(window.DC_POOL).length)?window.DC_POOL:{cumpleanos:seq('pf_cumple_',47),embarazadas:seq('pf_emb_',17),graduacion:seq('pf_grad_',17),infantil:seq('pf_inf_',23),xv:seq('pf_xv_',20)};
function mixPool(){let a=[];Object.values(POOL).forEach(x=>a=a.concat(x));for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
window.DC={wa,IMG,POOL,mixPool};

/* ---- default WA links ---- */
$$('[data-wa]').forEach(e=>e.href=wa(e.getAttribute('data-wa')||''));

/* ---- nav ---- */
const nav=$('#nav');
if(nav){
  addEventListener('scroll',()=>nav.classList.toggle('stuck',scrollY>30));
  nav.classList.toggle('stuck',scrollY>30);
  const burger=$('.burger',nav), links=$('.nav-links',nav);
  if(burger&&links){burger.onclick=()=>links.classList.toggle('open');
    $$('.nav-links a',nav).forEach(a=>a.onclick=()=>links.classList.remove('open'));}
}

/* ---- reveal (blur-fade) ---- */
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}}),{threshold:.12,rootMargin:'0px 0px -40px 0px'});
$$('.reveal').forEach(el=>io.observe(el));
const sc=$('#statCard');if(sc){let filled=false;const fillBar=()=>{if(filled)return;filled=true;sc.classList.add('in');const b=sc.querySelector('.bar>i');if(!b)return;const target=Math.round((b.parentElement.clientWidth||300)*0.98);const t0=performance.now();(function step(t){let p=Math.min((t-t0)/1100,1);let e=p<0.5?2*p*p:1-Math.pow(-2*p+2,2)/2;b.style.width=Math.round(target*e)+'px';if(p<1)requestAnimationFrame(step);})(t0);};const io2=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){fillBar();io2.unobserve(e.target);}}),{threshold:.2});io2.observe(sc);setTimeout(fillBar,2700);}

/* ---- animaciones variadas [data-anim] ---- */
const animIO=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');animIO.unobserve(e.target);}}),{threshold:.14,rootMargin:'0px 0px -40px 0px'});
function observeAnims(root){(root||document).querySelectorAll('[data-anim]:not(.in)').forEach(el=>animIO.observe(el));}

/* ---- FAQ ---- */
$$('.qa button').forEach(b=>b.onclick=()=>b.parentElement.classList.toggle('open'));

/* ================= LIGHTBOX (compartido) ================= */
let LB=null,lbList=[],lbIdx=0;
function ensureLB(){
  if(LB)return LB;
  LB=document.createElement('div');LB.className='lightbox';
  LB.innerHTML='<button class="lb-btn lb-close" aria-label="Cerrar">✕</button><button class="lb-btn lb-prev" aria-label="Anterior">‹</button><img alt=""><button class="lb-btn lb-next" aria-label="Siguiente">›</button><div class="lb-count"></div>';
  document.body.appendChild(LB);
  const img=$('img',LB),count=$('.lb-count',LB);
  function show(){img.src=lbList[lbIdx];count.textContent=(lbIdx+1)+' / '+lbList.length;}
  $('.lb-close',LB).onclick=()=>LB.classList.remove('open');
  $('.lb-prev',LB).onclick=e=>{e.stopPropagation();lbIdx=(lbIdx-1+lbList.length)%lbList.length;show();};
  $('.lb-next',LB).onclick=e=>{e.stopPropagation();lbIdx=(lbIdx+1)%lbList.length;show();};
  LB.onclick=e=>{if(e.target===LB)LB.classList.remove('open');};
  addEventListener('keydown',e=>{if(!LB.classList.contains('open'))return;if(e.key==='Escape')LB.classList.remove('open');if(e.key==='ArrowLeft')$('.lb-prev',LB).click();if(e.key==='ArrowRight')$('.lb-next',LB).click();});
  LB._show=show;return LB;
}
function openLB(list,idx){ensureLB();lbList=list;lbIdx=idx;LB._show();LB.classList.add('open');}
window.DC.openLB=openLB;

/* ================= 3D GALLERY (three.js) ================= */
function initGallery3D(){
  const host=$('#gal3d');if(!host)return;
  const imgs=(host.dataset.imgs?host.dataset.imgs.split(','):mixPool()).map(s=>s.trim());
  if(!window.THREE){buildGalFallback(host,imgs);return;}
  let renderer;try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});}catch(e){buildGalFallback(host,imgs);return;}
  const W=()=>host.clientWidth,H=()=>host.clientHeight;
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(W(),H());
  host.appendChild(renderer.domElement);
  const scene=new THREE.Scene();
  const cam=new THREE.PerspectiveCamera(58,W()/H(),0.1,100);cam.position.z=0;
  const DEPTH=52,COUNT=Math.min(28,imgs.length),HALF=DEPTH/2;
  const loader=new THREE.TextureLoader();loader.crossOrigin='anonymous';
  const planes=[];
  function spatial(i){const ha=(i*2.399)% (Math.PI*2),va=(i*1.618+Math.PI/3)%(Math.PI*2);const hr=(i%3)*1.2,vr=((i+1)%4)*0.85;return{x:Math.sin(ha)*hr*8/3,y:Math.cos(va)*vr*8/4};}
  for(let i=0;i<COUNT;i++){
    const sp=spatial(i);
    const mat=new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false});
    const mesh=new THREE.Mesh(new THREE.PlaneGeometry(1,1),mat);
    mesh.position.set(sp.x,sp.y,0);
    mesh.userData={z:(DEPTH/COUNT)*i,imgIndex:i%imgs.length,x:sp.x,y:sp.y,aspect:1};
    scene.add(mesh);planes.push(mesh);
    loader.load(imgs[i%imgs.length],tex=>{tex.colorSpace=THREE.SRGBColorSpace||tex.colorSpace;mat.map=tex;mat.needsUpdate=true;
      const im=tex.image;if(im&&im.width)mesh.userData.aspect=im.width/im.height;});
  }
  // al reciclarse un plano carga una foto ALEATORIA de TODO el pool (no repetitivo)
  function swapTex(m,u){const src=imgs[Math.floor(Math.random()*imgs.length)];
    loader.load(src,tex=>{tex.colorSpace=THREE.SRGBColorSpace||tex.colorSpace;m.material.map=tex;m.material.needsUpdate=true;const im=tex.image;if(im&&im.width)u.aspect=im.width/im.height;});}
  let vel=0.9,drag=false,py=0;
  host.addEventListener('wheel',e=>{e.preventDefault();vel+=e.deltaY*0.008;},{passive:false});
  host.addEventListener('pointerdown',e=>{drag=true;py=e.clientY;host.setPointerCapture(e.pointerId);});
  host.addEventListener('pointermove',e=>{if(!drag)return;vel-=(e.clientY-py)*0.02;py=e.clientY;});
  const relax=e=>{drag=false;try{host.releasePointerCapture(e.pointerId);}catch(_){}};
  host.addEventListener('pointerup',relax);host.addEventListener('pointercancel',relax);
  let last=performance.now();
  function frame(now){
    const dt=Math.min((now-last)/1000,0.05);last=now;
    if(!drag)vel+=0.35*dt; // autoplay drift
    vel*=0.95;
    planes.forEach(m=>{
      const u=m.userData;
      let z=u.z+vel*dt*10;
      if(z>=DEPTH){z-=DEPTH;swapTex(m,u);}
      else if(z<0){z+=DEPTH;swapTex(m,u);}
      u.z=z;
      const np=z/DEPTH;
      let op=1;
      if(np<0.08)op=np/0.08;else if(np>0.86)op=Math.max(0,1-(np-0.86)/0.14);
      m.material.opacity=Math.max(0,Math.min(1,op));
      const worldZ=z-HALF;m.position.z=worldZ;
      const a=u.aspect;const s=a>1?[2*a,2]:[2,2/a];m.scale.set(s[0],s[1],1);
      m.lookAt(cam.position);
    });
    renderer.render(scene,cam);requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  addEventListener('resize',()=>{renderer.setSize(W(),H());cam.aspect=W()/H();cam.updateProjectionMatrix();});
}
function buildGalFallback(host,imgs){
  const d=document.createElement('div');d.className='gal-fallback';
  d.innerHTML=imgs.slice(0,12).map(s=>'<img src="'+s+'" alt="">').join('');
  host.appendChild(d);
}

/* ================= ORBITAL (slider circular rotativo) ================= */
function shuf(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function initOrbit(){$$('.orbit-stage').forEach(initOneOrbit);}
function initOneOrbit(stage){
  const ring=$('.ring',stage)||stage.appendChild(Object.assign(document.createElement('div'),{className:'ring'}));
  const base=stage.dataset.imgs?stage.dataset.imgs.split(','):(stage.dataset.cat&&POOL[stage.dataset.cat]?POOL[stage.dataset.cat]:mixPool());
  const imgs=shuf(base).slice(0,8).map(s=>s.trim());
  const cards=imgs.map((n,i)=>{const c=document.createElement('div');c.className='oc';c.style.transform='translate(-50%,-50%)';
    c.innerHTML='<img src="'+n+'" alt="" loading="lazy">';ring.appendChild(c);return{el:c,base:i*(360/imgs.length),rot:(i%2?1:-1)*(5+i*1.4)};});
  let t=0,mx=0,my=0;
  function loop(){t=(t+0.1)%360;const r=stage.getBoundingClientRect();const rad=Math.min(r.width,r.height)*0.34;
    cards.forEach(c=>{const a=(c.base+t)*Math.PI/180;const x=Math.cos(a)*rad,y=Math.sin(a)*rad*0.62;const dp=(Math.sin(a)+1)/2;
      c.el.style.zIndex=Math.round(dp*10);c.el.style.transform='translate(-50%,-50%) translate('+x.toFixed(1)+'px,'+y.toFixed(1)+'px) rotate('+c.rot+'deg) scale('+(0.74+dp*0.4).toFixed(3)+')';c.el.style.opacity=(0.55+dp*0.45).toFixed(2);});
    ring.style.transform='rotateX('+my+'deg) rotateY('+mx+'deg)';requestAnimationFrame(loop);}
  stage.addEventListener('pointermove',e=>{const r=stage.getBoundingClientRect();mx=((e.clientX-r.left)/r.width-.5)*16;my=-((e.clientY-r.top)/r.height-.5)*16;});
  stage.addEventListener('pointerleave',()=>{mx=0;my=0;});requestAnimationFrame(loop);
}

/* ================= EXPANDABLE GALLERY (vestidos) ================= */
const DRESSES=[['Vestido Rojo','vestido_rojo','Un clásico intenso que resalta en cámara.'],['Vestido Morado','vestido_morado','Elegante y real, para un look de gala.'],['Vestido Azul','vestido_azul','Fresco y luminoso, ideal para exteriores.'],['Vestido Gris','vestido_gris','Sobrio y moderno, con personalidad.'],['Vestido Rosa','vestido_rosado','Dulce y romántico, el favorito de muchas.'],['Vestido Azul Corto','vestido_azul_corto','Cómodo y juvenil para el 2º cambio.'],['Vestido Rosa Corto','vestido_rosado_corto','Coqueto y ligero para poses divertidas.']];
function initExpandable(){
  const host=$('#exg');if(!host)return;
  const list=DRESSES.map(d=>IMG+d[1]+'.webp');
  host.innerHTML=DRESSES.map((d,i)=>
    '<div class="exg-item" data-i="'+i+'">'+
      '<img src="'+IMG+d[1]+'.webp" alt="'+d[0]+'" loading="lazy">'+
      '<div class="shade"></div><span class="vname">'+d[0]+'</span>'+
      '<div class="zoom">⤢</div>'+
      '<div class="cap"><h3>'+d[0]+'</h3><small>'+d[2]+'</small></div>'+
    '</div>').join('');
  $$('.exg-item',host).forEach(it=>{
    const i=+it.dataset.i;
    $('.zoom',it).addEventListener('click',e=>{e.stopPropagation();openLB(list,i);});
    it.addEventListener('click',()=>openLB(list,i));
  });
}

/* ================= ÁLBUM DIGITAL (galería demo) ================= */
function initAlbum(){
  const host=$('#album-grid');if(!host)return;
  const cells=$$('.alb-cell',host);
  const list=cells.map(c=>c.dataset.full);
  cells.forEach((c,i)=>c.addEventListener('click',e=>{e.preventDefault();openLB(list,i);}));
}

/* ================= COMPARE (antes/después) ================= */
function initCompare(){
  $$('.compare').forEach(c=>{
    const before=$('.before',c);if(!before)return;
    const setP=p=>{p=Math.max(0,Math.min(100,p));before.style.clipPath='inset(0 '+(100-p)+'% 0 0)';const h=$('.handle',c),k=$('.knob',c);if(h)h.style.left=p+'%';if(k)k.style.left=p+'%';};
    const mode=c.dataset.mode||'hover';
    function move(x){const r=c.getBoundingClientRect();setP(((x-r.left)/r.width)*100);}
    if(mode==='hover'){c.addEventListener('pointermove',e=>move(e.clientX));c.addEventListener('pointerleave',()=>setP(50));}
    let down=false;
    c.addEventListener('pointerdown',e=>{down=true;move(e.clientX);});
    addEventListener('pointermove',e=>{if(down)move(e.clientX);});
    addEventListener('pointerup',()=>down=false);
    setP(parseFloat(c.dataset.start||'50'));
  });
}

/* ================= PORTAFOLIO — DRAG INFINITO (no cambiar) ================= */
function initPortfolio(){
  const wrap=$('#dragwrap');if(!wrap)return;
  const grid=$('#draggrid',wrap);
  const cat=wrap.dataset.cat;
  let pool=cat&&POOL[cat]?POOL[cat].slice():mixPool();
  const block=pool.slice(0,Math.min(pool.length,24));
  const gi=block.map((src,k)=>'<div class="gi" data-idx="'+k+'"><img src="'+src+'" alt="Portafolio D Carela" loading="lazy"></div>').join('');
  const blk='<div class="gblock">'+gi+'</div>';
  grid.innerHTML=blk+blk+blk+blk;
  $$('.gi',grid).forEach(g=>g.addEventListener('click',()=>{if(!wrap._moved)openLB(block,+g.dataset.idx);}));
  let x=0,y=0,vx=0,vy=0,hw=0,hh=0,drag=false,px=0,py=0,raf=null,lt=0,moved=0;
  function measure(){const r=grid.getBoundingClientRect();if(r.width)hw=r.width/2;if(r.height)hh=r.height/2;}
  const wv=(v,h)=>{if(h<=0)return v;let m=v%h;if(m>0)m-=h;return m;};
  function apply(){grid.style.transform='translate('+wv(x,hw)+'px,'+wv(y,hh)+'px)';}
  function inertia(){if(drag)return;vx*=0.93;vy*=0.93;if(Math.abs(vx)<0.05&&Math.abs(vy)<0.05){vx=vy=0;raf=null;return;}x+=vx;y+=vy;apply();raf=requestAnimationFrame(inertia);}
  wrap.addEventListener('pointerdown',e=>{drag=true;moved=0;wrap._moved=false;px=e.clientX;py=e.clientY;vx=vy=0;lt=performance.now();wrap.setPointerCapture(e.pointerId);if(raf){cancelAnimationFrame(raf);raf=null;}});
  wrap.addEventListener('pointermove',e=>{if(!drag)return;if(!hw)measure();const dx=e.clientX-px,dy=e.clientY-py;px=e.clientX;py=e.clientY;moved+=Math.abs(dx)+Math.abs(dy);if(moved>6)wrap._moved=true;const now=performance.now(),dt=Math.max(now-lt,1);lt=now;vx=dx/dt*16;vy=dy/dt*16;x+=dx;y+=dy;apply();});
  function end(e){if(!drag)return;drag=false;try{wrap.releasePointerCapture(e.pointerId);}catch(_){}if(!raf)raf=requestAnimationFrame(inertia);}
  wrap.addEventListener('pointerup',end);wrap.addEventListener('pointercancel',end);wrap.addEventListener('pointerleave',end);
  wrap.addEventListener('wheel',e=>{e.preventDefault();if(!hw)measure();y-=e.deltaY*1.1;x-=e.deltaX*1.1;apply();},{passive:false});
  let drift=true;wrap.addEventListener('pointerdown',()=>drift=false,{once:true});wrap.addEventListener('wheel',()=>drift=false,{once:true});
  function ad(){if(drift&&hh){x-=0.25;y-=0.15;apply();}requestAnimationFrame(ad);}
  grid.querySelectorAll('img').forEach(im=>{if(!im.complete)im.addEventListener('load',measure,{once:true});});
  setTimeout(()=>{measure();apply();ad();},300);window.addEventListener('resize',measure);
}

/* ================= COMBOS ================= */
function escA(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');}
const WORD_CAT={xv:'tus XV años',infantil:'tu peque',graduacion:'tu graduación',cumpleanos:'tu cumpleaños',embarazadas:'tu sesión de maternidad',boda:'tu boda'};
function comboDesc(c,cat){
  const its=(c.items||[]);let d='';
  if(its.length)d+='Este combo incluye '+its.join(', ')+'. ';
  if(c.incluye)d+=c.incluye+'. ';
  d+='Ideal para '+(WORD_CAT[cat]||'tu sesión')+'. El precio mostrado es "desde"; te confirmamos el total por WhatsApp según lo que elijas.';
  return d;
}
function comboCard(c,feat,cat){
  // Imagen ARRIBA (se ve completa la persona) + panel de cristal ABAJO con TODA la lista (no tapa la foto).
  const items=(c.items||[]).map(i=>/[áa]lbum digital online/i.test(i)
    ? '<li><a class="li-link" href="album.html">'+i+' <span class="li-ver">ver ejemplo →</span></a></li>'
    : '<li>'+i+'</li>').join('');
  const hot=feat||/COMPLETO/i.test(c.badge||'');
  return '<article class="ccard'+(feat?' feat':'')+'">'+
    '<div class="cph"><img src="'+c.bg+'" alt="'+escA(c.name)+'" loading="lazy">'+
      (hot?'<span class="ribbon">Más completo</span>':'')+'</div>'+
    '<div class="lg body">'+
      '<h3>'+c.name+'</h3>'+
      '<div class="price"><span class="from">desde</span><span class="cur">RD$</span><span class="val">'+c.price+'</span></div>'+
      (c.total_chip?'<span class="chip">'+c.total_chip+'</span>':'')+
      (items?'<ul class="items">'+items+'</ul>':'')+
      (c.incluye?'<div class="incl">✦ '+c.incluye+'</div>':'')+
      '<button class="lgbtn wa" data-reserve data-cat="'+escA(cat)+'" data-combo="'+escA(c.name)+'" data-price="RD$ '+escA(c.price)+'">Reservar este combo</button>'+
    '</div></article>';
}
function wireExplain(root){}
const GROUP_META=[
  ['completos','Premium','Los combos más completos','Todo el paquete: impresiones, cuadros, álbum y detalles + tus fotos digitales editadas. La experiencia completa de estudio.'],
  ['clasicos','Popular','Combos clásicos','El equilibrio ideal entre impresiones, cuadro y digitales. Los favoritos de siempre.'],
  ['digitales','Ágil','Solo digitales','Perfectos si quieres tus fotos editadas para redes e imprimir por tu cuenta.'],
  ['economicos','Accesible','Opciones económicas','La entrada más accesible sin perder la calidad de nuestro estudio.']
];
// Envuelve un carrusel y le pone flechas prev/next (estilo FocusRail)
function railNav(el,onStep){
  if(el._nav)return;el._nav=1;
  const wrap=document.createElement('div');wrap.className='crsl-wrap';
  el.parentNode.insertBefore(wrap,el);wrap.appendChild(el);
  const prev=document.createElement('button');prev.type='button';prev.className='crsl-nav prev';prev.setAttribute('aria-label','Anterior');prev.textContent='‹';
  const next=document.createElement('button');next.type='button';next.className='crsl-nav next';next.setAttribute('aria-label','Siguiente');next.textContent='›';
  wrap.appendChild(prev);wrap.appendChild(next);
  prev.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();onStep(-1);});
  next.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();onStep(1);});
}
function scrollRailStep(el,dir){const c=el.querySelector('.ccard');const w=(c?c.getBoundingClientRect().width:320)+24;el.scrollBy({left:w*dir,behavior:'smooth'});}
function initCoverflow(cf){
  railNav(cf,dir=>scrollRailStep(cf,dir));
  function upd(){const r=cf.getBoundingClientRect(),cx=r.left+r.width/2;
    $$('.ccard',cf).forEach(card=>{const cr=card.getBoundingClientRect();let d=(cr.left+cr.width/2-cx)/(r.width/2);d=Math.max(-1.4,Math.min(1.4,d));
      const ry=d*-34,sc=1-Math.min(Math.abs(d),1)*0.18,op=1-Math.min(Math.abs(d),1)*0.45;
      card.style.transform='rotateY('+ry.toFixed(1)+'deg) scale('+sc.toFixed(3)+')';card.style.opacity=op.toFixed(2);card.style.zIndex=String(100-Math.round(Math.abs(d)*50));});}
  cf.addEventListener('scroll',()=>requestAnimationFrame(upd),{passive:true});
  window.addEventListener('resize',upd);setTimeout(upd,80);setTimeout(upd,400);
}
function initComboDrag(dc){
  const track=$('.track',dc);let x=0,downX=0,startX=0,down=false,moved=false,vx=0,raf=null,lt=0,min=0;
  function bounds(){min=Math.min(0,dc.clientWidth-track.scrollWidth);}
  function apply(){x=Math.max(min,Math.min(0,x));track.style.transform='translateX('+x+'px)';}
  function inertia(){if(down)return;vx*=0.92;if(Math.abs(vx)<0.1||x<=min||x>=0){vx=0;raf=null;apply();return;}x+=vx;apply();raf=requestAnimationFrame(inertia);}
  dc.addEventListener('pointerdown',e=>{down=true;moved=false;startX=e.clientX;downX=x;vx=0;lt=performance.now();bounds();if(raf){cancelAnimationFrame(raf);raf=null;}});
  window.addEventListener('pointermove',e=>{if(!down)return;const dx=e.clientX-startX;if(Math.abs(dx)>5){moved=true;dc.classList.add('dragging');}if(!moved)return;const now=performance.now(),dt=Math.max(now-lt,1);lt=now;vx=(downX+dx-x)/dt*16;x=downX+dx;apply();});
  window.addEventListener('pointerup',()=>{if(!down)return;down=false;dc.classList.remove('dragging');if(moved&&!raf)raf=requestAnimationFrame(inertia);});
  // evita abrir wizard si venías arrastrando
  dc.addEventListener('click',e=>{if(moved){e.stopPropagation();e.preventDefault();moved=false;}},true);
  railNav(dc,dir=>{bounds();const c=track.querySelector('.ccard');const w=(c?c.getBoundingClientRect().width:330)+20;track.style.transition='transform .45s cubic-bezier(.2,.7,.2,1)';x=Math.max(min,Math.min(0,x-dir*w));apply();setTimeout(()=>{track.style.transition='';},480);});
  bounds();window.addEventListener('resize',()=>{bounds();apply();});
}
/* ===== FocusRail: carrusel 3D con tarjeta central enfocada + flechas/contador/swipe ===== */
function initFocusRail(rail){
  const cards=$$('.ccard',rail);const n=cards.length;if(!n)return;
  const loop=n>3;let active=0,suppress=false;
  const cw=()=>{const c=cards[0];return c?c.getBoundingClientRect().width:300;};
  const wrapIdx=i=>((i%n)+n)%n;
  const shortest=o=>{if(!loop)return o;if(o>n/2)o-=n;if(o<-n/2)o+=n;return o;};
  function layout(){const w=cw();cards.forEach((card,i)=>{let off=shortest(i-active);const d=Math.abs(off);
    if(d>2){card.style.display='none';card.setAttribute('aria-hidden','true');return;}
    card.style.display='';
    const x=off*w*0.58,z=-d*175,sc=off===0?1:0.83,ry=off*-20,op=off===0?1:Math.max(.14,1-d*.45),bl=off===0?0:d*3.5,br=off===0?1:.5;
    card.style.transform='translate(-50%,-50%) translateX('+x.toFixed(1)+'px) translateZ('+z+'px) rotateY('+ry+'deg) scale('+sc+')';
    card.style.opacity=op;card.style.filter='blur('+bl+'px) brightness('+br+')';card.style.zIndex=off===0?40:20-d;
    card.classList.toggle('fr-active',off===0);card.setAttribute('aria-hidden',off===0?'false':'true');});
    if(rail._cnt)rail._cnt.textContent=(wrapIdx(active)+1)+' / '+n;}
  function go(dir){active=loop?wrapIdx(active+dir):Math.max(0,Math.min(n-1,active+dir));layout();}
  cards.forEach((card,i)=>card.addEventListener('click',e=>{
    if(suppress){e.stopPropagation();e.preventDefault();return;}
    if(shortest(i-active)!==0){e.stopPropagation();e.preventDefault();active=wrapIdx(i);layout();}
  }));
  const ctr=document.createElement('div');ctr.className='fr-ctrl';
  ctr.innerHTML='<button type="button" class="fr-btn fr-prev" aria-label="Anterior">‹</button><span class="fr-count"></span><button type="button" class="fr-btn fr-next" aria-label="Siguiente">›</button>';
  rail.after(ctr);rail._cnt=$('.fr-count',ctr);
  $('.fr-prev',ctr).onclick=()=>go(-1);$('.fr-next',ctr).onclick=()=>go(1);
  let down=false,sx=0,mv=0;
  rail.addEventListener('pointerdown',e=>{down=true;sx=e.clientX;mv=0;suppress=false;});
  window.addEventListener('pointermove',e=>{if(!down)return;mv=e.clientX-sx;if(Math.abs(mv)>8)suppress=true;});
  window.addEventListener('pointerup',()=>{if(!down)return;down=false;if(Math.abs(mv)>55)go(mv<0?1:-1);setTimeout(()=>{suppress=false;},30);});
  let wl=0;rail.addEventListener('wheel',e=>{const dd=Math.abs(e.deltaX)>Math.abs(e.deltaY)?e.deltaX:e.deltaY;if(Math.abs(dd)<14)return;const t=Date.now();if(t-wl<400)return;e.preventDefault();go(dd>0?1:-1);wl=t;},{passive:false});
  rail.tabIndex=0;rail.addEventListener('keydown',e=>{if(e.key==='ArrowLeft')go(-1);else if(e.key==='ArrowRight')go(1);});
  function fit(){let mh=0;cards.forEach(c=>{mh=Math.max(mh,c.offsetHeight);});if(mh)rail.style.height=(mh+24)+'px';}
  function all(){fit();layout();}
  all();window.addEventListener('resize',all);
  // reajusta cuando cargan las imágenes (cambian la altura de la tarjeta)
  $$('.ccard img',rail).forEach(im=>{if(!im.complete)im.addEventListener('load',all,{once:true});});
  setTimeout(all,400);
}
function groupCombos(list){
  const g={completos:[],clasicos:[],digitales:[],economicos:[]};
  list.forEach(c=>{const n=(c.name||'').toLowerCase();
    if(/eco/.test(n))g.economicos.push(c);
    else if(/digital/.test(n))g.digitales.push(c);
    else if(/COMPLETO/i.test(c.badge||'')||/deluxe|premium|diamante|golden|luxury|glamour|plan popi/.test(n))g.completos.push(c);
    else g.clasicos.push(c);
  });
  return g;
}
// Solo estas categorías madre tienen subcategorías (Premium/Clásicos/Digitales/Económicos).
// El resto (xv, infantil, graduación) muestra TODOS los combos en un solo carrusel plano.
const GROUPED_CATS={cumpleanos:1,embarazadas:1};
function initCombosGrouped(COMBOS){
  const host=$('#combos-groups');if(!host)return;
  const cat=host.dataset.cat;const list=COMBOS[cat]||[];
  if(!list.length){host.innerHTML='';return;}
  if(!GROUPED_CATS[cat]){
    // PLANO: un solo FocusRail con todos los combos. El "Más completo" primero.
    const sorted=list.slice().sort((a,b)=>(/COMPLETO/i.test(b.badge||'')?1:0)-(/COMPLETO/i.test(a.badge||'')?1:0));
    const cards=sorted.map(c=>comboCard(c,false,cat)).join('');
    host.innerHTML='<div class="cgroup"><div class="frail">'+cards+'</div></div>';
    $$('.frail',host).forEach(initFocusRail);
    wireExplain(host);observeAnims(host);return;
  }
  const g=groupCombos(list);
  const anims=['fade-up','slide-left','zoom','slide-right'];let ai=0,html='';
  GROUP_META.forEach(m=>{
    const key=m[0],kick=m[1],ti=m[2],txt=m[3];const items=g[key];if(!items||!items.length)return;
    const anim=anims[ai%anims.length];ai++;
    const cards=items.map(c=>comboCard(c,false,cat)).join('');
    html+='<div class="cgroup"><div class="cgroup-head" data-anim="'+anim+'"><div class="k">'+kick+'</div><h3>'+ti+'</h3><p>'+txt+'</p></div><div class="frail">'+cards+'</div></div>';
  });
  host.innerHTML=html;
  $$('.frail',host).forEach(initFocusRail);
  wireExplain(host);observeAnims(host);
}

/* ================= BODA ================= */
function initBoda(BODA){
  const grid=$('#boda-grid');if(!grid||!BODA)return;
  const cats=Object.keys(BODA.categorias);let cat=cats[0];
  const pills=$('#boda-pills');
  const BP=(window.DC_POOL&&window.DC_POOL.boda)||[];
  const sessions=(window.DC_BODA_SESSIONS||[]).filter(s=>Array.isArray(s)&&s.length);
  const identities={
    'estudio':[
      {title:'Retrato Nupcial',tag:'Sesión íntima',copy:'Retratos de pareja en estudio, con dirección durante toda la sesión.'},
      {title:'Historia de Dos',tag:'Retrato editorial',copy:'Una sesión más amplia para contar la conexión de la pareja con variedad de encuadres.'},
      {title:'Luz de Promesa',tag:'Experiencia clásica',copy:'Más fotografías y tiempo creativo para construir una galería nupcial completa.'},
      {title:'Legado Nupcial',tag:'Experiencia completa',copy:'La colección de estudio más extensa, pensada como memoria visual de la pareja.'}
    ],
    'civil-estudio':[
      {title:'Votos Íntimos',tag:'Ceremonia civil',copy:'Ceremonia civil y retratos de pareja en estudio reunidos en una sola cobertura.'},
      {title:'Promesa Civil',tag:'Civil + retratos',copy:'Una historia equilibrada entre los momentos del acto civil y una sesión dirigida.'},
      {title:'Memoria de Votos',tag:'Cobertura ampliada',copy:'Más espacio para familiares, detalles del acto y retratos editoriales de la pareja.'}
    ],
    'playa':[
      {title:'Luz Natural',tag:'Exterior esencial',copy:'Cobertura flexible en playa, área verde o escenario exterior elegido por la pareja.'},
      {title:'Costa Dorada',tag:'Historia exterior',copy:'Una sesión exterior más amplia, con variedad de ambientes, planos y momentos espontáneos.'},
      {title:'Horizonte Eterno',tag:'Exterior signature',copy:'La experiencia exterior más completa para narrar la celebración con amplitud.'}
    ],
    'preboda':[
      {title:'Camino al Sí',tag:'Preboda + ceremonia',copy:'Preboda, ceremonia y momentos esenciales de la recepción en una historia continua.'},
      {title:'Historia Completa',tag:'Celebración completa',copy:'Cobertura extendida desde la conexión previa hasta la emoción de la recepción.'},
      {title:'Para Siempre',tag:'Legado de boda',copy:'La narración más extensa: preparación, ceremonia, recepción y recuerdos clave del día.'}
    ]
  };
  function identityFor(i){
    const list=identities[cat]||[];
    return list[i]||{title:'Historia de Boda',tag:'Experiencia nupcial',copy:'Una cobertura pensada para conservar su historia con elegancia.'};
  }
  function photosFor(i){
    if(!sessions.length)return BP.length?[BP[i%BP.length]]:[];
    const catOffset=cats.indexOf(cat)*2;
    return [0,1,2].map((step)=>{
      const session=sessions[(catOffset+i+step*2)%sessions.length];
      return session[(i+step)%session.length];
    }).filter(Boolean);
  }
  function mediaFor(i,identity){
    const photos=photosFor(i);
    if(!photos.length)return '<div class="boda-media cph-boda"><span class="cph-tag">'+identity.tag+'</span></div>';
    return '<div class="boda-media">'+photos.map((src,j)=>'<figure class="bm'+j+'"><img src="'+src+'" alt="Sesión real de boda" loading="lazy"></figure>').join('')+
      '<span class="cph-tag">'+identity.tag+'</span></div>';
  }
  function card(c,i){
    const cuadro=BODA.cuadros[0],price=c.precios_por_cuadro[cuadro],identity=identityFor(i);
    return '<article class="boda-card" data-i="'+i+'">'+mediaFor(i,identity)+
      '<div class="boda-body"><div class="boda-kicker">'+BODA.categorias[cat].label+'</div>'+
      '<h3>'+identity.title+'</h3><p class="boda-count">'+c.digitales+' fotos digitales editadas</p>'+
      '<p class="boda-copy">'+identity.copy+'</p>'+
      '<div class="boda-size"><div class="boda-size-head"><b>Tamaño del cuadro incluido</b><span>Conserva el mismo combo; cambia únicamente el cuadro y el precio.</span></div>'+
      '<div class="boda-size-options" role="group" aria-label="Tamaño del cuadro">'+BODA.cuadros.map((q,qi)=>'<button type="button" class="boda-size-btn'+(qi===0?' on':'')+'" data-q="'+q+'" aria-pressed="'+(qi===0?'true':'false')+'">'+q+'</button>').join('')+'</div></div>'+
      '<div class="boda-price"><span>Precio del combo</span><strong><small>RD$</small> <span class="val">'+price.toLocaleString('es-DO')+'</span></strong></div>'+
      '<ul class="boda-includes"><li>'+c.digitales+' digitales</li><li class="frame">1 cuadro '+cuadro+'</li><li>10 impresas 5x7</li><li>2 tazas</li><li>2 llaveros</li></ul>'+
      '<button class="lgbtn wa boda-reserve" data-reserve data-cat="boda" data-combo="'+escA(identity.title+' · '+c.digitales+' fotos digitales')+'" data-price="RD$ '+escA(price.toLocaleString('es-DO'))+'" data-extra="'+escA(BODA.categorias[cat].label+' · Cuadro '+cuadro)+'">Reservar este combo</button>'+
      '</div></article>';
  }
  function wireCards(combos){
    $$('.boda-card',grid).forEach((el,i)=>{
      const combo=combos[i],value=$('.boda-price .val',el),frame=$('.boda-includes .frame',el),reserve=$('.boda-reserve',el);
      $$('.boda-size-btn',el).forEach(btn=>btn.onclick=()=>{
        const q=btn.dataset.q,price=combo.precios_por_cuadro[q];
        $$('.boda-size-btn',el).forEach(x=>{const on=x===btn;x.classList.toggle('on',on);x.setAttribute('aria-pressed',on?'true':'false');});
        value.textContent=price.toLocaleString('es-DO');frame.textContent='1 cuadro '+q;
        reserve.dataset.price='RD$ '+price.toLocaleString('es-DO');reserve.dataset.extra=BODA.categorias[cat].label+' · Cuadro '+q;
      });
    });
  }
  function render(){const combos=BODA.categorias[cat].combos;grid.innerHTML=combos.map(card).join('');wireCards(combos);observeAnims(grid);}
  if(pills){pills.innerHTML=Object.keys(BODA.categorias).map((k,i)=>'<button class="pill'+(i===0?' on':'')+'" data-k="'+k+'">'+BODA.categorias[k].label+'</button>').join('');
    $$('.pill',pills).forEach(p=>p.onclick=()=>{cat=p.dataset.k;$$('.pill',pills).forEach(x=>x.classList.toggle('on',x===p));render();});}
  render();
  // El grid se inyecta después del salto nativo del navegador. Repite el anclaje
  // cuando el alto real de las tarjetas ya existe para no dejar #portafolio arriba.
  if(location.hash==='#portafolio')requestAnimationFrame(()=>requestAnimationFrame(()=>$('#portafolio')?.scrollIntoView({block:'start'})));
}

/* ================= WORD ANIM (blur-fade por palabra) ================= */
function splitWords(el){
  const frag=document.createDocumentFragment(),spans=[];
  [...el.childNodes].forEach(node=>{
    if(node.nodeType===3){
      node.textContent.split(/(\s+)/).forEach(p=>{if(!p)return;
        if(!p.trim()){frag.appendChild(document.createTextNode(p));}
        else{const s=document.createElement('span');s.className='aw';s.textContent=p;frag.appendChild(s);spans.push(s);}});
    }else{const s=document.createElement('span');s.className='aw';s.appendChild(node.cloneNode(true));frag.appendChild(s);spans.push(s);}
  });
  el.textContent='';el.appendChild(frag);return spans;
}
function initWordAnim(){
  const el=$('.gal-hero h1');if(!el)return;
  const spans=splitWords(el);spans.forEach((s,i)=>s.style.transitionDelay=(0.15+i*0.07)+'s');
  requestAnimationFrame(()=>requestAnimationFrame(()=>spans.forEach(s=>s.classList.add('in'))));
}

/* animación DISTINTA por línea de texto (usa el set de animaciones) */
const LINE_ANIMS=['ln-up','ln-left','ln-zoom','ln-right','ln-blur','ln-down'];
function initLineAnim(){
  $$('.lineanim').forEach(el=>{
    if(el._ln)return;el._ln=1;
    const toks=[];
    [...el.childNodes].forEach(n=>{
      if(n.nodeType===3){n.textContent.split(/(\s+)/).forEach(t=>{if(t.trim())toks.push({w:t});else if(t)toks.push({sp:1});});}
      else toks.push({node:n});
    });
    el.textContent='';const spans=[];
    toks.forEach(t=>{if(t.sp){el.appendChild(document.createTextNode(' '));return;}
      const s=document.createElement('span');s.style.display='inline-block';
      if(t.node)s.appendChild(t.node);else s.textContent=t.w;el.appendChild(s);spans.push(s);});
    const lines=[];let top=null;
    spans.forEach(s=>{const t=s.offsetTop;if(top===null||Math.abs(t-top)>6){lines.push([]);top=t;}lines[lines.length-1].push(s);});
    el.textContent='';
    lines.forEach((grp,i)=>{
      const ln=document.createElement('span');ln.className='ln '+LINE_ANIMS[i%LINE_ANIMS.length];ln.style.display='block';
      ln.style.transitionDelay=(0.12+i*0.16)+'s';
      grp.forEach((s,j)=>{while(s.firstChild)ln.appendChild(s.firstChild);if(j<grp.length-1)ln.appendChild(document.createTextNode(' '));});
      el.appendChild(ln);
    });
    const reveal=()=>[...el.children].forEach(c=>c.classList.add('in'));
    const r=el.getBoundingClientRect();
    if(r.top<innerHeight){requestAnimationFrame(()=>requestAnimationFrame(reveal));}
    else{const ob=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){reveal();ob.disconnect();}}),{threshold:.15});ob.observe(el);}
    setTimeout(reveal,1600); // fallback: nunca dejar el texto invisible
  });
}

/* ================= WIZARD de reserva ================= */
function initWizard(){
  const SUC={'Sucursal La Central / Villa Hermosa':'18495245620','Sucursal Plaza Artesanal':'18098337809','Fuera del estudio':'18495245620'};
  const DRESS_NAMES=DRESSES.map(d=>d[0]).concat(['Confirmar por WhatsApp']);
  const back=document.createElement('div');back.className='wiz-back';
  back.innerHTML='<div class="wiz" role="dialog" aria-modal="true"><div class="wiz-head"><div class="row"><div>'+
    '<div class="wiz-combo" id="wzCombo"></div><h3 id="wzTitle">Reserva tu sesión</h3><p id="wzSub"></p></div>'+
    '<button class="wiz-x" aria-label="Cerrar">✕</button></div><div class="wiz-prog"><i id="wzProg"></i></div></div>'+
    '<div class="wiz-body" id="wzBody"></div>'+
    '<div class="wiz-foot"><button class="wiz-ghost" id="wzBack">Atrás</button><button class="lgbtn wa" id="wzNext">Continuar</button></div></div>';
  document.body.appendChild(back);
  const bodyEl=$('#wzBody',back),progEl=$('#wzProg',back),titleEl=$('#wzTitle',back),subEl=$('#wzSub',back),comboEl=$('#wzCombo',back),backBtn=$('#wzBack',back),nextBtn=$('#wzNext',back);
  let ctx=null,steps=[],idx=0,lastFocus=null;
  const todayIso=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');};
  function stepsFor(cat){
    const s=[{key:'sucursal',q:'¿En qué sucursal deseas la sesión?',help:'Si quieres que vayamos a tu locación, elige "Fuera del estudio".',type:'options',opts:Object.keys(SUC),req:true}];
    if(cat==='xv'){s.push({key:'vestido',q:'Elige el vestido de XV',help:'Incluido en tu combo. Puedes confirmarlo luego por WhatsApp.',type:'options',opts:DRESS_NAMES,req:true});
      s.push({key:'maquillaje',q:'¿Deseas maquillaje?',help:'Extra desde RD$2,500 si no está incluido.',type:'options',opts:['Sí, lo quiero','Consultar estilo','No, gracias'],req:false});}
    else if(cat==='infantil'){s.push({key:'tematica',q:'¿Qué temática o fondo prefieres?',help:'Elige un fondo digital de nuestro catálogo, tráenos una referencia de Pinterest o pide una temática a medida — la afinamos por WhatsApp.',type:'options',opts:['Fondo digital de catálogo','Globos y bizcocho','Personaje / muñequito','Referencia de Pinterest','Tengo mi propia temática','Minimalista'],req:true});}
    else if(cat==='cumpleanos'){s.push({key:'fondo',q:'Color de fondo',help:'Elige el color base para tu sesión.',type:'options',opts:['Gris','Blanco','Beige','Rosado','Rojo','Verde','Azul','Otro'],req:true});
      s.push({key:'tematica',q:'Estilo de la sesión',help:'',type:'options',opts:['Bizcocho, flores y globos','Círculo de sombras','Montajes avanzados','Envío mi idea por WhatsApp'],req:false});}
    else if(cat==='embarazadas'){s.push({key:'vestido',q:'¿Vestido de maternidad?',help:'Vestido, tutú y tiara incluidos.',type:'options',opts:['Sí, incluido','Consultar color','No lo necesito'],req:false});}
    else if(cat==='graduacion'){s.push({key:'nivel',q:'¿Qué graduación celebras?',help:'Toga, birrete, carpeta y anillo incluidos según el combo.',type:'options',opts:['Kínder / Pre-primaria','Colegio / Bachillerato','Universidad','Técnico / Postgrado'],req:true});
      s.push({key:'modo',q:'¿Individual o en grupo?',help:'Fotografiamos a una persona o a toda la promoción.',type:'options',opts:['Individual','Con amistades','Toda la promoción'],req:false});}
    s.push({key:'fecha',q:'¿Para qué fecha?',help:'Elige el día que prefieres.',type:'date',req:true});
    s.push({key:'hora',q:'¿A qué hora?',help:'Opcional — podemos coordinar después.',type:'time',req:false});
    s.push({key:'nombre',q:'¿A nombre de quién?',help:'Tu nombre para apartar la cita.',type:'text',req:true,ph:'Ej. María Pérez'});
    s.push({key:'resumen',q:'Confirma tu reserva',help:'Revisa y envíanos por WhatsApp.',type:'summary',req:false});
    return s;
  }
  const val=k=>ctx.state[k];
  function summaryRows(){
    const r=[['Combo',ctx.combo],['Precio',ctx.price]];if(ctx.extra)r.push(['Detalle',ctx.extra]);
    [['sucursal','Sucursal'],['nivel','Graduación'],['modo','Modalidad'],['vestido','Vestido'],['maquillaje','Maquillaje'],['fondo','Fondo'],['tematica','Temática'],['fecha','Fecha'],['hora','Hora'],['nombre','Nombre']].forEach(p=>{if(val(p[0]))r.push([p[1],val(p[0])]);});
    return r;
  }
  function render(){
    const st=steps[idx];
    progEl.style.width=Math.round(idx/(steps.length-1)*100)+'%';
    titleEl.textContent=ctx.cat==='boda'?'Reserva de boda':'Reserva tu sesión';
    subEl.textContent='Paso '+(idx+1)+' de '+steps.length;
    let h='<div class="wiz-q">'+st.q+'</div>'+(st.help?'<div class="wiz-help">'+st.help+'</div>':'');
    if(st.type==='options')h+='<div class="wiz-opts">'+st.opts.map(o=>'<button class="wiz-opt'+(val(st.key)===o?' on':'')+'" data-o="'+escA(o)+'"><span class="dot"></span>'+o+'</button>').join('')+'</div>';
    else if(st.type==='date')h+='<input class="wiz-input" type="date" id="wzF" min="'+todayIso()+'" value="'+escA(val(st.key)||'')+'">';
    else if(st.type==='time')h+='<input class="wiz-input" type="time" id="wzF" value="'+escA(val(st.key)||'')+'">';
    else if(st.type==='text')h+='<input class="wiz-input" type="text" id="wzF" placeholder="'+escA(st.ph||'')+'" value="'+escA(val(st.key)||'')+'">';
    else if(st.type==='summary')h+='<div class="wiz-sum">'+summaryRows().map(r=>'<div class="r"><b>'+r[0]+'</b><span>'+escA(r[1])+'</span></div>').join('')+'</div>';
    h+='<div class="wiz-err" id="wzErr"></div>';
    bodyEl.innerHTML=h;backBtn.disabled=idx===0;nextBtn.textContent=st.type==='summary'?'Enviar por WhatsApp ✓':'Continuar';
    $$('.wiz-opt',bodyEl).forEach(b=>b.onclick=()=>{ctx.state[st.key]=b.dataset.o;render();});
    const f=$('#wzF',bodyEl);if(f)f.oninput=()=>ctx.state[st.key]=f.value;
  }
  function validate(){const st=steps[idx],err=$('#wzErr',bodyEl);
    if(st.req&&!val(st.key)){err.textContent='Completa este paso para continuar.';return false;}
    if(st.type==='date'&&val('fecha')&&val('fecha')<todayIso()){err.textContent='Elige una fecha de hoy en adelante.';return false;}
    return true;}
  function send(){const num=SUC[val('sucursal')]||'18097575644';let msg="Hola D' Carela, quiero reservar:\n";
    summaryRows().forEach(r=>{if(r[1])msg+='• '+r[0]+': '+r[1]+'\n';});
    window.open('https://wa.me/'+num+'?text='+encodeURIComponent(msg),'_blank','noopener');close();}
  function open(btn){lastFocus=btn;ctx={cat:btn.dataset.cat||'',combo:btn.dataset.combo||'',price:btn.dataset.price||'',extra:btn.dataset.extra||'',state:{}};
    steps=stepsFor(ctx.cat);idx=0;comboEl.textContent=ctx.combo+(ctx.price?' · '+ctx.price:'');back.classList.add('on');render();}
  function close(){back.classList.remove('on');if(lastFocus&&lastFocus.focus)lastFocus.focus();}
  nextBtn.onclick=()=>{const st=steps[idx];if(st.type==='summary'){send();return;}if(!validate())return;idx=Math.min(idx+1,steps.length-1);render();};
  backBtn.onclick=()=>{idx=Math.max(0,idx-1);render();};
  $('.wiz-x',back).onclick=close;back.onclick=e=>{if(e.target===back)close();};
  addEventListener('keydown',e=>{if(back.classList.contains('on')&&e.key==='Escape')close();});
  document.addEventListener('click',e=>{const b=e.target.closest('[data-reserve]');if(b){e.preventDefault();open(b);}});
}

/* ================= VIDEOS (reels) ================= */
function initVideos(){
  const vids=$$('video[data-vid]');if(!vids.length)return;
  const io=new IntersectionObserver(es=>es.forEach(e=>{const v=e.target;if(e.intersectionRatio>0.1){if(!v._userPaused)v.play().catch(()=>{});}else{v.pause();}}),{threshold:[0,0.1,0.35]});
  vids.forEach(v=>{io.observe(v);
    const slot=v.parentElement,btn=$('.vsound',slot);
    const sync=()=>{slot.classList.toggle('playing',!v.paused);slot.classList.toggle('unmuted',!v.muted&&!v.paused);if(btn)btn.textContent=v.paused?'▶':(v.muted?'🔇':'🔊');};
    const click=e=>{e.preventDefault();e.stopPropagation();
      if(v.paused){v._userPaused=false;v.muted=false;v.play().catch(()=>{v.muted=true;v.play().catch(()=>{});});}
      else{v.muted=!v.muted;}sync();};
    v.addEventListener('click',click);if(btn)btn.addEventListener('click',click);
    v.addEventListener('play',sync);v.addEventListener('pause',sync);v.addEventListener('volumechange',sync);sync();
  });
}

/* ================= boot ================= */
initGallery3D();initOrbit();initExpandable();initCompare();initPortfolio();initWordAnim();initLineAnim();initWizard();initVideos();initAlbum();observeAnims();
// Animaciones con el SCROLL: revela solo lo que ya está en pantalla al cargar; lo demás se revela al hacer scroll (IntersectionObserver).
requestAnimationFrame(function(){$$('.reveal:not(.in),[data-anim]:not(.in)').forEach(function(e){if(e.getBoundingClientRect().top<innerHeight*0.9)e.classList.add('in');});});
const needCombos=$('#combos-groups'),needBoda=$('#boda-grid');
const _cv='?v='+(window.DC_V||Date.now());
if(needCombos){fetch('combos-data.json'+_cv).then(r=>r.json()).then(initCombosGrouped).catch(()=>{});}
if(needBoda){fetch('combos-boda-data.json'+_cv).then(r=>r.json()).then(initBoda).catch(()=>{});}
})();
