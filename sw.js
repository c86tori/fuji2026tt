/* FUJI '26 timetable — offline service worker.
   To publish updated content, bump CACHE (e.g. v1 -> v2). */
const CACHE = 'fuji2026-v27';

const ASSETS = [
  './', 'index.html',
  'en/', 'en/index.html',
  'zh-tw/', 'zh-tw/index.html',
  '24fri-live.html', '25sat-live.html', '26sun-live.html',
  '24fri-landscape.html', '25sat-landscape.html', '26sun-landscape.html',
  'en/24fri-live.html', 'en/25sat-live.html', 'en/26sun-live.html',
  'en/24fri-landscape.html', 'en/25sat-landscape.html', 'en/26sun-landscape.html',
  'zh-tw/24fri-live.html', 'zh-tw/25sat-live.html', 'zh-tw/26sun-live.html',
  'zh-tw/24fri-landscape.html', 'zh-tw/25sat-landscape.html', 'zh-tw/26sun-landscape.html',
  'pdf-viewer.html',
  'assets/24fri.png', 'assets/25sat.png', 'assets/26sun.png',
  'assets/24fri.csv', 'assets/25sat.csv', 'assets/26sun.csv',
  'assets/icon-180.png', 'assets/icon-192.png', 'assets/icon-512.png',
  'farewell-2027.js',
  'timetable-ui.js',
  'manifest.webmanifest'
];

self.addEventListener('install', function(e){
  e.waitUntil(
    caches.open(CACHE).then(function(c){
      var failed = false;
      return Promise.all(ASSETS.map(function(u){
        var url = new URL(u, self.registration.scope).href;
        return fetch(url, { cache:'reload' }).then(function(res){
          if (!res || !res.ok) throw new Error('Precache failed: ' + u);
          return c.put(url, res);
        }).catch(function(){
          failed = true;
        });
      })).then(function(){
        if (!failed) return;
        return caches.delete(CACHE).then(function(){
          throw new Error('Precache incomplete; keeping the previous version.');
        });
      });
    }).then(function(){ return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.filter(function(k){ return k !== CACHE; }).map(function(k){ return caches.delete(k); }));
    }).then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(e){
  var req = e.request;
  if (req.method !== 'GET') return;
  if (new URL(req.url).origin !== location.origin) return;   // same-origin only
  e.respondWith(
    caches.match(req, { ignoreSearch: true }).then(function(cached){
      if (cached) return cached;
      return fetch(req).then(function(res){
        // runtime-cache successful responses (e.g. PDFs opened on demand)
        if (res && res.status === 200 && res.type === 'basic') {
          var copy = res.clone();
          caches.open(CACHE).then(function(c){ c.put(req, copy); });
        }
        return res;
      }).catch(function(){
        // offline fallback for page navigations
        if (req.mode === 'navigate') return caches.match('index.html');
        return new Response('', { status: 504, statusText: 'offline' });
      });
    })
  );
});
