/* ══════════════════════════════════════════════════════════════
   service-worker.js — Study101 PWA shell cache
   Chỉ cache "vỏ app" (index.html, styles.css, js/*.js, manifest, icons) —
   những file tĩnh, ít đổi. KHÔNG đụng vào Firestore/Firebase, Google Fonts,
   hay cdnjs — dữ liệu học tập luôn cần lấy mới nhất, cache nó ở đây sẽ chỉ
   tạo ra bug "thấy dữ liệu cũ". Mục tiêu duy nhất: (1) app cài được lên máy
   (installable), (2) vỏ app vẫn load được khi mạng chập chờn/mất mạng.

   Bump CACHE_NAME mỗi khi đổi danh sách SHELL_FILES để trình duyệt tự dọn
   cache cũ (xem activate bên dưới).
   ══════════════════════════════════════════════════════════════ */
const CACHE_NAME='study101-shell-v1';
const SHELL_FILES=[
  './',
  './index.html',
  './styles.css',
  './manifest.json',
  './js/01-utils.js',
  './js/02-theme.js',
  './js/03-gamification.js',
  './js/04-mastery-engine.js',
  './js/05-firebase.js',
  './js/06-data-model.js',
  './js/07-shared-ui.js',
  './js/08-page-course.js',
  './js/09-page-dashboard-uniphase.js',
  './js/10-page-misc.js',
  './js/12-decision-engine.js',
  './js/11-app-shell.js',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png',
];

self.addEventListener('install',(event)=>{
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache)=>cache.addAll(SHELL_FILES))
      .catch((err)=>console.warn('[SW] precache failed, continuing anyway:',err))
  );
  self.skipWaiting();
});

self.addEventListener('activate',(event)=>{
  event.waitUntil(
    caches.keys().then((names)=>Promise.all(
      names.filter((n)=>n!==CACHE_NAME).map((n)=>caches.delete(n))
    ))
  );
  self.clients.claim();
});

/* Cache-first cho vỏ app, refresh ngầm ở background mỗi lần fetch (stale-
   while-revalidate) — mở app thấy ngay bản cache (nhanh, kể cả offline),
   đồng thời âm thầm cập nhật cache cho lần mở sau. Mọi request khác origin
   (Firestore, fonts, cdnjs) bị bỏ qua hoàn toàn — trả về network mặc định
   của trình duyệt, không can thiệp. */
self.addEventListener('fetch',(event)=>{
  const req=event.request;
  const url=new URL(req.url);
  if(req.method!=='GET'||url.origin!==self.location.origin)return;

  event.respondWith(
    caches.match(req).then((cached)=>{
      if(cached){
        fetch(req).then((res)=>{
          if(res&&res.ok)caches.open(CACHE_NAME).then((cache)=>cache.put(req,res));
        }).catch(()=>{}); // offline lúc refresh ngầm — im lặng bỏ qua, đã có cache rồi
        return cached;
      }
      return fetch(req).then((res)=>{
        if(res&&res.ok){
          const copy=res.clone();
          caches.open(CACHE_NAME).then((cache)=>cache.put(req,copy));
        }
        return res;
      });
    })
  );
});
