/* 床版オルソ v1.8 — オフライン用キャッシュ
   画面（index.html）はネット優先：つながるときは常に最新版を取り直し、圏外ではキャッシュで動く */
const CACHE='slabortho-v1.10';
const FILES=['./','index.html','manifest.webmanifest','icon-180.png','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>Promise.all(FILES.map(f=>c.add(new Request(f,{cache:'reload'})).catch(()=>{})))).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  const req=e.request; if(req.method!=='GET')return;
  const url=new URL(req.url); if(url.origin!==location.origin)return;
  const isPage=req.mode==='navigate'||url.pathname.endsWith('/')||url.pathname.endsWith('.html');
  if(isPage){
    e.respondWith(fetch(req,{cache:'no-store'}).then(r=>{const c=r.clone();caches.open(CACHE).then(k=>k.put('index.html',c));return r;})
      .catch(()=>caches.match('index.html').then(r=>r||caches.match('./'))));
  }else{
    e.respondWith(caches.match(req).then(r=>r||fetch(req).then(n=>{if(n.ok){const c=n.clone();caches.open(CACHE).then(k=>k.put(req,c));}return n;})));
  }
});
