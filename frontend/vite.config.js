import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'
import { visualizer } from 'rollup-plugin-visualizer'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    visualizer({
      filename: 'dist/bundle-analysis.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
    // Fix MIME type issues for CSS files
    {
      name: 'fix-css-mime-type',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url && req.url.endsWith('.css')) {
            // Force the content type for CSS files
            res.setHeader('Content-Type', 'text/css; charset=utf-8');
            res.setHeader('X-Content-Type-Options', 'nosniff');
          }
          next();
        });
      }
    }
  ],
  root: __dirname,
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    open: true,
    https: true, // Enable HTTPS for security headers like HSTS
    fs: {
      // Allow serving files from one level up to the project root
      allow: ['..']
    },
    // Fix MIME type issues for CSS files - ensure proper content type
    mimeTypes: {
      '.css': 'text/css',
      'text/css': 'text/css'
    },
    headers: {
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
      'X-Frame-Options': 'DENY',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-eval'; connect-src 'self' ws://localhost:* https://*.googleapis.com https://*.firebaseapp.com https://*.firebase.com https://*.firebaseio.com wss://*.firebaseio.com wss://*.firebaseapp.com https://*.socket.io wss://*.socket.io; font-src 'self' data: https://fonts.gstatic.com https://fonts.googleapis.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://*.googleapis.com https://firebasestorage.googleapis.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none';",
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'geolocation=(), payment=(), usb=(), accelerometer=(), gyroscope=(), magnetometer=(), microphone=(), speaker=(), fullscreen=(), ambient-light-sensor=(), autoplay=(), camera=(), encrypted-media=(), display-capture=(), document-domain=(), midi=(), vr=(), xr-spatial-tracking=()'
    },
    // Optimize for Playwright tests - prevent HMR overload
    hmr: process.env.CI ? false : true, // Disable HMR in CI to prevent rate limiting
    watch: process.env.CI ? null : undefined, // Disable file watching in CI
    // Increase middleware timeout to prevent 429 errors
    middlewareMode: false,
    strictPort: true, // Fail if port is already in use
    // Pre-transform known imports to reduce runtime load
    warmup: {
      clientFiles: [
        './src/main.jsx',
        './src/App.jsx',
        './src/components/app-header.jsx',
        './src/components/footer.jsx'
      ]
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Tier 1: Core React vendor (most stable, best caching)
          'vendor-react': [
            'react',
            'react-dom',
            'react-router-dom'
          ],
          
          // Tier 2: UI component libraries
          'vendor-ui': [
            'lucide-react',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-dialog',
            '@radix-ui/react-popover',
            '@radix-ui/react-toast',
            '@radix-ui/react-tooltip',
            '@radix-ui/react-accordion',
            '@radix-ui/react-alert-dialog',
            '@radix-ui/react-tabs',
            '@radix-ui/react-select',
            '@radix-ui/react-scroll-area',
            '@radix-ui/react-progress',
            '@radix-ui/react-avatar',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-label',
            '@radix-ui/react-separator',
            '@radix-ui/react-switch',
            '@radix-ui/react-slot'
          ],
          
          // Tier 3: Firebase (split for better caching)
          'vendor-firebase-app': ['firebase/app'],
          'vendor-firebase-auth': ['firebase/auth'],
          'vendor-firebase-firestore': ['firebase/firestore'],
          
          // Tier 3b: Socket.io (large, separate)
          'vendor-socket': [
            'socket.io-client'
          ],
          
          // Tier 4: Form & validation libraries
          'vendor-forms': [
            'react-hook-form',
            '@hookform/resolvers',
            'zod'
          ]
        }
      }
    },
    // Increase chunk size warning limit for vendor bundles
    chunkSizeWarningLimit: 1000,
    // Enable source maps for debugging in dev, disabled in production
    sourcemap: false,
    // Enable compression
    minify: 'esbuild',
    // Optimize CSS
    cssCodeSplit: true,
    // Preload modules
    modulePreload: {
      polyfill: false
    }
  },
  optimizeDeps: {
    include: ['socket.io-client', 'firebase/app', 'firebase/auth', 'firebase/firestore'],
  },
})