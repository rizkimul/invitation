import { defineConfig, type Plugin } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';

/**
 * Mengisi %SITE_URL% di index.html saat build.
 *
 * Tag og:image dan og:url HARUS berupa URL absolut — WhatsApp, Facebook, dan
 * Telegram tidak menjalankan JavaScript dan tidak bisa membaca path relatif,
 * jadi preview undangannya akan kosong. Nilainya diambil dari:
 *
 *   1. VITE_SITE_URL          — diisi manual, menang atas segalanya
 *   2. VERCEL_PROJECT_PRODUCTION_URL — otomatis tersedia di Vercel
 *   3. kosong                 — %SITE_URL% jadi string kosong, sehingga
 *                               "/video/..." kembali seperti sebelumnya
 *
 * Karena butir 3 itu, build lokal tanpa env apa pun tetap jalan dan tidak
 * pernah menghasilkan tautan yang lebih buruk daripada keadaan sekarang.
 */
function siteUrlHtml(): Plugin {
  return {
    name: 'site-url-html',
    transformIndexHtml(html) {
      const vercel = process.env['VERCEL_PROJECT_PRODUCTION_URL'];
      const site = (process.env['VITE_SITE_URL'] || (vercel ? `https://${vercel}` : '')).replace(/\/+$/, '');
      return html.replaceAll('%SITE_URL%', site);
    },
  };
}

export default defineConfig({
  plugins: [tailwindcss(), siteUrlHtml()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    target: 'es2020',
    cssTarget: 'chrome80',
    assetsInlineLimit: 2048,
  },
  server: {
    host: true,
    port: 5173,
  },
});
