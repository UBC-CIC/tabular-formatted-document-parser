import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'build',
    // semantic-ui-css 2.5.0 ships some legacy/invalid selectors (e.g.
    // `::after .header`) that Vite 8's default Lightning CSS minifier rejects.
    // Disabling CSS minification avoids the parse error; JS is still minified.
    // (The CSS size delta is negligible for this app.)
    cssMinify: false,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
    css: true,
  },
});
