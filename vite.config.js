import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    react({
      // Enable fast refresh
      fastRefresh: true,
      // Include .jsx files
      include: "**/*.{jsx,tsx}",
    })
  ],
  
  // Define global variables
  define: {
    global: 'globalThis',
  },
  
  // Development server configuration
  server: {
    port: 3000,
    host: true, // Allow external access
    open: true, // Auto-open browser
    strictPort: false, // Try other ports if 3000 is occupied
  },
  
  // Build configuration
  build: {
    outDir: 'dist',
    sourcemap: false, // Disable in production for smaller bundle
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks for better caching
          'vendor-react': ['react', 'react-dom'],
          'vendor-apollo': ['@apollo/client', 'graphql'],
          'vendor-ui': ['@heroicons/react', 'framer-motion', 'react-hot-toast'],
          'vendor-nhost': ['@nhost/react', '@nhost/nhost-js'],
        }
      }
    },
    // Chunk size warning limit
    chunkSizeWarningLimit: 1000,
  },
  
  // Path resolution
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@hooks': resolve(__dirname, 'src/hooks'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@styles': resolve(__dirname, 'src/styles'),
      '@contexts': resolve(__dirname, 'src/contexts'),
      '@graphql': resolve(__dirname, 'src/graphql'),
    }
  },
  
  // CSS configuration
  css: {
    postcss: './postcss.config.js',
    devSourcemap: true,
  },
  
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@apollo/client',
      'graphql',
      '@nhost/react',
      '@nhost/nhost-js',
      'react-hot-toast',
      'clsx',
      'uuid'
    ],
    exclude: ['@vite/client', '@vite/env']
  },
  
  // Preview configuration (for production preview)
  preview: {
    port: 3001,
    host: true,
    strictPort: false,
  },
  
  // Environment variables prefix
  envPrefix: 'VITE_',
  
  // Enable experimental features
  experimental: {
    renderBuiltUrl(filename, { hostType }) {
      if (hostType === 'js') {
        return { js: `/${filename}` }
      } else {
        return { relative: true }
      }
    }
  }
})