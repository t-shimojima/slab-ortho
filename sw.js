/* 床版下面オルソ：オフライン用 Service Worker
   版を更新したら VERSION を変える。起動時に新しいファイルを取りに行き、通信できないときは保存済みの版で動く */
const VERSION='slabortho-v1.2.0';
const ASSETS=['./','./index.html','./manifest.webmanifest','./icon-180.png','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(VERSION).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VERSION).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  const req=e.request; if(req.method!=='GET')return;
  const url=new URL(req.url); if(url.origin!==location.origin)return;
  const key=req.mode==='navigate'?'./index.html':req;
  e.respondWith(caches.open(VERSION).then(async c=>{
    const hit=await c.match(key,{ignoreSearch:true});
    const net=fetch(req).then(r=>{if(r&&r.ok)c.put(key,r.clone());return r;}).catch(()=>null);
    return hit||(await net)||new Response('オフラインです',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}});
  }));
});
