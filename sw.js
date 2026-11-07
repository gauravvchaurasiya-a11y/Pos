const CACHE='festival-pos-v5';
const LOCAL=['./','./index.html','./manifest.json','./icon-192.png','./icon-512.png'];
const SDK=['https://www.gstatic.com/firebasejs/11.6.1/firebase-app-compat.js','https://www.gstatic.com/firebasejs/11.6.1/firebase-auth-compat.js','https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore-compat.js'];
const LOCAL_URLS=LOCAL.map(p=>new URL(p,self.registration.scope).href);
self.addEventListener('install', e => {
 self.skipWaiting();
 e.waitUntil(caches.open(CACHE).then(c => {
  return Promise.allSettled([...LOCAL_URLS, ...SDK].map(u => c.add(new Request(u, {cache:'reload'}))));
 }));
});
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('festival-pos-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
 const r=e.request;if(r.method!=='GET')return;
 const u=new URL(r.url);const exact=u.origin+u.pathname;
 // Never intercept authentication, database channels, or other remote API traffic.
 if(!LOCAL_URLS.includes(exact)&&!SDK.includes(r.url))return;
 if(r.mode==='navigate'){
  e.respondWith(fetch(r).then(resp=>{if(resp.ok){const cp=resp.clone();caches.open(CACHE).then(c=>c.put(new URL('./index.html',self.registration.scope).href,cp));}return resp;}).catch(()=>caches.open(CACHE).then(c=>c.match(new URL('./index.html',self.registration.scope).href))));return;
 }
 e.respondWith(caches.open(CACHE).then(async c=>(await c.match(exact))||fetch(r).then(resp=>{if(resp.ok)c.put(exact,resp.clone());return resp;})));
});
