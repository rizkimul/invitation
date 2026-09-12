import '@/styles/fonts.css';
import '@/styles/main.css';
import { bootstrap } from '@/app';

const root = document.getElementById('app');

if (root) {
  bootstrap(root);
} else {
  console.error('[undangan] Elemen #app tidak ditemukan.');
}
