// Simple Service Worker - Fixed for Vite
const CACHE_NAME = 'ai-chatbot-v1.0.0'
const STATIC_CACHE_NAME = 'ai-chatbot-static-v1.0.0'

// Basic assets to cache
const STATIC_ASSETS = [
  '/',
  '/manifest.json'
]

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...')
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching static assets')
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => {
        console.log('Service Worker: Static assets cached')
        return self.skipWaiting()
      })
      .catch((error) => {
        console.error('Service Worker: Failed to cache static assets', error)
      })
  )
})

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...')
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE_NAME) {
            console.log('Service Worker: Deleting old cache', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    }).then(() => {
      console.log('Service Worker: Activated')
      return self.clients.claim()
    })
  )
})

// Fetch event - simplified to avoid Response conversion errors
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests and development requests
  if (event.request.method !== 'GET' || 
      event.request.url.includes('?t=') || 
      event.request.url.includes('localhost:3000/src/') ||
      event.request.url.includes('@vite') ||
      event.request.url.includes('node_modules')) {
    return
  }

  // Only handle specific requests to avoid errors
  if (event.request.url.startsWith(self.location.origin)) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Only cache successful responses
          if (response.status === 200) {
            const responseClone = response.clone()
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseClone)
            })
          }
          return response
        })
        .catch(() => {
          // Fallback to cache if network fails
          return caches.match(event.request)
        })
    )
  }
})

console.log('Service Worker: Loaded successfully')