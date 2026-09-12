import type { VideoAsset } from '@/types/invitation';
import { $$, html, prefersReducedMotion, raw, type RawHtml } from './dom';

/**
 * Kebijakan pemutaran video.
 *
 * Video di halaman ini murni dekoratif, jadi tidak pernah wajib diputar.
 * Gerak dimatikan bila: pengguna meminta gerakan minimal, mode hemat data
 * aktif, atau koneksi sangat lambat. Dalam kondisi itu yang tampil adalah
 * poster — bukan area kosong.
 */
export function motionAllowed(): boolean {
  if (prefersReducedMotion()) return false;

  const connection = (
    navigator as Navigator & {
      connection?: { saveData?: boolean; effectiveType?: string };
    }
  ).connection;

  if (connection?.saveData) return false;
  if (connection?.effectiveType && ['slow-2g', '2g'].includes(connection.effectiveType)) return false;

  return true;
}

/** Memilih varian lebar sesuai layar & kerapatan piksel, sekali saat render. */
function pickWidth(asset: VideoAsset): number {
  const widths = asset.mp4.map(([w]) => w).sort((a, b) => a - b);
  const target = Math.min(window.innerWidth || 420, 640) * Math.min(window.devicePixelRatio || 1, 2);
  return widths.find((w) => w >= target) ?? widths.at(-1) ?? 720;
}

const sourceFor = (list: Array<[number, string]>, width: number): string =>
  (list.find(([w]) => w === width) ?? list.at(-1))?.[1] ?? '';

interface VideoOptions {
  className?: string;
  /** Berulang terus (sampul) atau sekali jalan (selingan). */
  loop?: boolean;
  /** Mulai otomatis begitu elemen dirender. */
  autoplay?: boolean;
  /**
   * Latar bergerak: berulang, tapi hanya diputar selama bagiannya terlihat.
   * Video di balik panel `backdrop-filter` adalah kombinasi compositing
   * termahal di halaman ini — jangan biarkan berjalan saat tak terlihat.
   */
  ambient?: boolean;
  preload?: 'none' | 'metadata' | 'auto';
}

/**
 * Merender <video> bisu yang aman untuk autoplay di iOS
 * (`muted` + `playsinline` adalah syarat mutlaknya).
 * Bila gerak tidak diizinkan, yang dirender hanya poster.
 */
export function video(asset: VideoAsset, options: VideoOptions = {}): RawHtml {
  const { className = '', loop = false, autoplay = false, ambient = false, preload = 'metadata' } = options;

  if (!motionAllowed()) {
    return html`
      <picture>
        <source type="image/webp" srcset="${asset.posterWebp}" />
        <img src="${asset.poster}" alt="${asset.alt}" class="${className}" loading="lazy" decoding="async" />
      </picture>
    `;
  }

  const width = pickWidth(asset);

  return html`
    <video
      class="${className}"
      poster="${asset.poster}"
      preload="${preload}"
      muted
      playsinline
      webkit-playsinline
      disablepictureinpicture
      ${raw(loop || ambient ? 'loop' : '')}
      ${raw(
        ambient
          ? 'data-video-ambient'
          : autoplay
            ? 'autoplay data-video-autoplay'
            : 'data-video-inview',
      )}
      aria-label="${asset.alt}"
    >
      <source src="${sourceFor(asset.webm, width)}" type="video/webm" />
      <source src="${sourceFor(asset.mp4, width)}" type="video/mp4" />
    </video>
  `;
}

/**
 * Memasang perilaku pemutaran.
 *
 * - `data-video-autoplay` — dicoba diputar segera; kalau ditolak browser,
 *   dicoba lagi pada interaksi pertama pengguna.
 * - `data-video-inview` — diputar sekali saat elemen masuk layar, lalu
 *   berhenti di frame terakhir. Diketuk = ulang dari awal.
 */
export function mountVideos(): void {
  const autoplayed = $$<HTMLVideoElement>('[data-video-autoplay]');
  const inView = $$<HTMLVideoElement>('[data-video-inview]');
  const ambient = $$<HTMLVideoElement>('[data-video-ambient]');

  const tryPlay = (el: HTMLVideoElement) => {
    const attempt = el.play();
    if (attempt && typeof attempt.catch === 'function') attempt.catch(() => {});
  };

  // Latar bergerak: jalan saat masuk layar, berhenti saat keluar.
  if (ambient.length) {
    const ambientObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const el = entry.target as HTMLVideoElement;
          if (entry.isIntersecting) tryPlay(el);
          else el.pause();
        }
      },
      { threshold: 0.15 },
    );
    for (const el of ambient) ambientObserver.observe(el);
  }

  for (const el of autoplayed) {
    tryPlay(el);
    // Sebagian browser menolak autoplay sebelum ada interaksi apa pun.
    document.addEventListener('invitation:open', () => tryPlay(el), { once: true });
  }

  if (!inView.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const el = entry.target as HTMLVideoElement;
        if (!entry.isIntersecting) continue;
        if (el.dataset['played'] === 'true') continue;
        el.dataset['played'] = 'true';
        tryPlay(el);
      }
    },
    { threshold: 0.45 },
  );

  for (const el of inView) {
    observer.observe(el);

    // Ketuk untuk memutar ulang.
    el.addEventListener('click', () => {
      el.currentTime = 0;
      tryPlay(el);
    });

    el.addEventListener('ended', () => {
      const section = el.closest('[data-interlude]');
      section?.classList.add('is-ended');
      // Kelas utilitas `opacity-0` menang atas aturan di @layer components,
      // jadi petunjuk "ketuk untuk ulang" dimunculkan dari sini.
      section?.querySelector('[data-replay-hint]')?.classList.remove('opacity-0');
    });
  }
}
