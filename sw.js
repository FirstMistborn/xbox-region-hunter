self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open("xbox-hunt-v2").then((c) =>
      c.addAll(["./", "./index.html", "./styles.css", "./app.js", "./manifest.json", "./icon.svg"])
    )
  );
  self.skipWaiting();
});
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== "xbox-hunt-v2").map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});
self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;
  e.respondWith(caches.match(e.request).then((r) => r || fetch(e.request)));
});
