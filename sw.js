/* documentation and code snippets from
 * https://developers.google.com/web/fundamentals/primers/service-workers/
 */

if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {

        navigator.serviceWorker.register('/sw.js').then(function (registration) {

            // Registration was successful
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
        }, function (err) {

            // registration failed :(
            console.log('ServiceWorker registration failed: ', err);
        });
    });
} else {
    console.log('Service worker is not supported.');
}


var CACHE_NAME = 'restaurant-review';
var urlsToCache = [
    // cache  HTML, CSS, JS and any static files
    '/', // the root must be included
    '/css/styles.css',
    '/css/normalize.css',
    '/css/responsive.css',
    '/js/dbhelper.js',
    '/js/main.js',
    '/js/restaurant_info.js',
    '/index.html',
    '/restaurant.html',
    '/data/restaurants.json',
    'favicon.ico',
    '/img/1.jpg',
    '/img/2.jpg',
    '/img/3.jpg',
    '/img/4.jpg',
    '/img/5.jpg',
    '/img/6.jpg',
    '/img/7.jpg',
    '/img/8.jpg',
    '/img/9.jpg',
    '/img/10.jpg',
    '/img/hot-chili.png'
];

self.addEventListener('install', function (event) {

    // Perform install steps
    event.waitUntil(

        caches.open(CACHE_NAME)
        .then(function (cache) {
            console.log('Opened cache');
            return cache.addAll(urlsToCache);
        })
    );
});

self.addEventListener('fetch', function (event) {

    if (event.request.method !== 'GET') {
        /* only GET requests are fetched
         */
        console.log('Fetch event ignored.', event.request.method, event.request.url);
        return;
    }

    event.respondWith(

        /* Check if the requested resource  was previously cached
         */
        caches.match(event.request)
        .then(function (response) {

            /* If the requested resource exist in cache
             */
            if (response) {
                console.log("Resource found in cache", event.request.url);
                return response;
            }

            /* If requested resource  was not cached
             */
            var requestClone = event.request.clone();
            return fetch(requestClone)
                .then(function (response) {

                    if (!response) {
                        console.log('Fail fetching request')
                        return response;
                    }

                    var responseClone = response.clone();
                    caches.open(CACHE_NAME).then(function (cache) {

                        /* Put the fetched response in the cache
                         */
                        cache.put(event.request, responseClone);
                        console.log('Resource from network cached', event.request.url);
                        return response;
                    });
                    /* return a fresh resource
                     */
                    return response;

                })
                .catch(function (err) {
                    console.log('Error:', err);
                });


        })
        .catch(function (event) {
            console.log('Error:', event)
        })
    );
});