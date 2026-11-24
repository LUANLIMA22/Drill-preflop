const CACHE_NAME = "preflop-drill-v1";

const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./manifest.json"
];

self.addEventListener("install", event => {

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(FILES_TO_CACHE))
      .then(() => self.skipWaiting())
  );

});

self.addEventListener("activate", event => {

  event.waitUntil(
    caches.keys().then(keys => {

      return Promise.all(
        keys.map(key => {

          if(key !== CACHE_NAME){
            return caches.delete(key);
          }

        })
      );

    }).then(() => self.clients.claim())
  );

});

self.addEventListener("fetch", event => {

  if(event.request.method !== "GET"){
    return;
  }

  event.respondWith(

    caches.match(event.request).then(cachedResponse => {

      if(cachedResponse){
        return cachedResponse;
      }

      return fetch(event.request).then(response => {

        if(response && response.status === 200){

          const responseClone = response.clone();

          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });

        }

        return response;

      }).catch(() => {

        return caches.match("./index.html");

      });

    })

  );

});
