import { prefersReducedMotion } from './dom';

/**
 * Animasi masuk untuk elemen ber-atribut `data-reveal`.
 *
 * Memakai sapuan manual (rAF-throttled) alih-alih IntersectionObserver murni:
 * pada pemuatan pertama, tinggi halaman masih berubah saat font & gambar
 * selesai dimuat, sehingga callback pertama IntersectionObserver bisa
 * mencatat posisi yang keliru dan elemen tersebut tidak pernah tampil lagi.
 * Sapuan ulang dijalankan pada beberapa titik aman (fonts.ready, load,
 * saat cover dibuka) agar tidak ada bagian yang "tertinggal" tak terlihat.
 */
const pending = new Set<HTMLElement>();
const repeating = new Set<HTMLElement>();

let scheduled = false;
let bound = false;

/** Ambang: elemen dianggap tampil bila bagian atasnya masuk 92% tinggi layar. */
const ENTER_RATIO = 0.92;

function reveal(el: HTMLElement): void {
  el.classList.add('is-in');
}

function sweep(): void {
  scheduled = false;
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

  for (const el of pending) {
    const rect = el.getBoundingClientRect();
    if (rect.top < viewportHeight * ENTER_RATIO && rect.bottom > 0) {
      reveal(el);
      pending.delete(el);
    }
  }

  for (const el of repeating) {
    const rect = el.getBoundingClientRect();
    const visible = rect.top < viewportHeight * ENTER_RATIO && rect.bottom > 0;
    el.classList.toggle('is-in', visible);
  }
}

function schedule(): void {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(sweep);
}

function bindListeners(): void {
  if (bound) return;
  bound = true;

  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });
  window.addEventListener('orientationchange', schedule, { passive: true });
  window.addEventListener('load', schedule);
  document.addEventListener('invitation:open', () => {
    schedule();
    // Sapuan lanjutan setelah transisi cover selesai.
    setTimeout(schedule, 400);
    setTimeout(schedule, 1200);
  });

  // Setelah webfont terpasang, tinggi teks berubah → ukur ulang.
  document.fonts?.ready.then(schedule).catch(() => {});
}

export function initReveal(root: ParentNode = document): void {
  const elements = Array.from(root.querySelectorAll<HTMLElement>('[data-reveal]'));

  if (prefersReducedMotion()) {
    elements.forEach(reveal);
    return;
  }

  for (const el of elements) {
    if (el.dataset['revealOnce'] === 'false') repeating.add(el);
    else pending.add(el);
  }

  bindListeners();
  schedule();
}

/** Daftarkan node yang baru disisipkan (mis. daftar ucapan yang dirender ulang). */
export function observeNew(el: Element): void {
  if (prefersReducedMotion()) {
    el.classList.add('is-in');
    return;
  }
  pending.add(el as HTMLElement);
  schedule();
}

/** Efek parallax halus untuk gambar besar. */
export function initParallax(): void {
  if (prefersReducedMotion()) return;
  const items = Array.from(document.querySelectorAll<HTMLElement>('[data-parallax]'));
  if (!items.length) return;

  let ticking = false;
  const update = () => {
    ticking = false;
    const viewportHeight = window.innerHeight;
    for (const el of items) {
      const rect = el.getBoundingClientRect();
      if (rect.bottom < -200 || rect.top > viewportHeight + 200) continue;
      const progress = (rect.top + rect.height / 2 - viewportHeight / 2) / viewportHeight; // -1..1
      const strength = Number(el.dataset['parallax'] || 14);
      const img = el.querySelector('img');
      if (img) img.style.transform = `translate3d(0, ${(-progress * strength).toFixed(2)}px, 0) scale(1.08)`;
    }
  };

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  update();
}
