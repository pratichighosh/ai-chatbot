// src/utils/nhost.js
import { NhostClient } from '@nhost/nhost-js'

export const nhost = new NhostClient({
  subdomain: import.meta.env.VITE_NHOST_SUBDOMAIN,
  region: import.meta.env.VITE_NHOST_REGION,
  // Add these options for better debugging and compatibility
  devTools: import.meta.env.DEV,
  start: true,
})

// Debug logging in development
if (import.meta.env.DEV) {
  console.log('🔧 Nhost Configuration Debug:')
  console.log('Subdomain:', import.meta.env.VITE_NHOST_SUBDOMAIN)
  console.log('Region:', import.meta.env.VITE_NHOST_REGION)
  console.log('Auth URL:', nhost.auth.url)
  console.log('GraphQL URL:', nhost.graphql.getUrl())
  
  // Test connectivity
  fetch(nhost.auth.url + '/healthz')
    .then(res => console.log('✅ Nhost connectivity:', res.ok ? 'OK' : 'Failed'))
    .catch(err => console.log('❌ Nhost connectivity error:', err))
}