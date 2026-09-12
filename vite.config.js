import { defineConfig } from 'vite';

// `base: './'` keeps asset URLs relative so the built site works when served
// from any path (e.g. username.github.io/nlanding/ on GitHub Pages).
// `host: 0.0.0.0` + `allowedHosts: true` make the dev server reachable
// through proxied preview environments.
export default defineConfig({
  base: './',
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: true,
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
  },
  build: {
    outDir: 'dist',
    assetsInlineLimit: 4096,
  },
});
