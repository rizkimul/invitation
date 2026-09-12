import { prefersReducedMotion } from './dom';

/**
 * Debu studio — partikel halus yang melayang di berkas cahaya.
 *
 * Kenapa canvas, bukan elemen DOM: halaman ini sudah punya panggung foto
 * `position: fixed` plus panel `backdrop-filter`. Menambah puluhan node yang
 * beranimasi di atas tumpukan itu persis kombinasi compositing yang bikin
 * gulir patah di perangkat kelas menengah. Satu canvas = satu lapisan.
 *
 * Kenapa "melayang", bukan "gugur": gugur mengandaikan gravitasi dan ruang
 * terbuka. Seluruh pemotretan ini di dalam studio — di sana partikel halus
 * hanyut naik-turun pelan mengikuti udara, tidak jatuh lurus ke bawah.
 */

interface Mote {
  x: number;
  y: number;
  /** Jari-jari dalam piksel CSS. */
  r: number;
  /** Opasitas dasar sebelum kerlip. */
  alpha: number;
  /** Kecepatan vertikal, px/detik. Sebagian bernilai negatif agar ada yang naik. */
  vy: number;
  swayAmp: number;
  swaySpeed: number;
  swayPhase: number;
  twinkleSpeed: number;
  twinklePhase: number;
}

export interface DustOptions {
  /** Pengali jumlah partikel. 1 = bawaan. */
  density?: number;
}

/** Satu sprite radial dipakai ulang untuk semua partikel — jauh lebih murah
 *  daripada membuat createRadialGradient() tiap partikel tiap frame. */
function makeSprite(): HTMLCanvasElement {
  const size = 64;
  const sprite = document.createElement('canvas');
  sprite.width = size;
  sprite.height = size;
  const sctx = sprite.getContext('2d');
  if (sctx) {
    const half = size / 2;
    const gradient = sctx.createRadialGradient(half, half, 0, half, half, half);
    gradient.addColorStop(0, 'rgba(255,255,255,0.95)');
    gradient.addColorStop(0.35, 'rgba(255,255,255,0.42)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    sctx.fillStyle = gradient;
    sctx.fillRect(0, 0, size, size);
  }
  return sprite;
}

export function mountDust(options: DustOptions = {}): () => void {
  const noop = () => {};
  if (prefersReducedMotion()) return noop;

  const canvas = document.getElementById('dust') as HTMLCanvasElement | null;
  const ctx = canvas?.getContext('2d');
  if (!canvas || !ctx) return noop;

  const sprite = makeSprite();
  const density = options.density ?? 1;

  // Perangkat dengan inti sedikit dapat porsi partikel lebih kecil.
  const cores = navigator.hardwareConcurrency ?? 4;
  const budget = cores <= 4 ? 0.6 : 1;

  let width = 0;
  let height = 0;
  let motes: Mote[] = [];
  let raf = 0;
  let last = 0;
  let running = false;

  const spawn = (scattered: boolean): Mote => ({
    x: Math.random() * width,
    y: scattered ? Math.random() * height : height + 24,
    r: 0.5 + Math.random() * 1.8,
    alpha: 0.1 + Math.random() * 0.34,
    // Mayoritas turun pelan, sebagian kecil justru naik.
    vy: Math.random() * 15 - 4,
    swayAmp: 5 + Math.random() * 22,
    swaySpeed: 0.08 + Math.random() * 0.22,
    swayPhase: Math.random() * Math.PI * 2,
    twinkleSpeed: 0.4 + Math.random() * 1.1,
    twinklePhase: Math.random() * Math.PI * 2,
  });

  const build = (): void => {
    width = window.innerWidth;
    height = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const count = Math.round(Math.min((width * height) / 15000, 72) * density * budget);
    motes = Array.from({ length: count }, () => spawn(true));
  };

  const frame = (now: number): void => {
    const dt = Math.min(now - last, 64) / 1000;
    last = now;

    ctx.clearRect(0, 0, width, height);
    const t = now / 1000;

    for (const m of motes) {
      m.y += m.vy * dt;
      const x = m.x + Math.sin(t * m.swaySpeed + m.swayPhase) * m.swayAmp;

      if (m.y > height + 30) {
        m.y = -30;
        m.x = Math.random() * width;
      } else if (m.y < -30) {
        m.y = height + 30;
        m.x = Math.random() * width;
      }

      // Kerlip pelan: debu yang sesekali menangkap cahaya.
      const alpha = m.alpha * (0.6 + 0.4 * Math.sin(t * m.twinkleSpeed + m.twinklePhase));
      if (alpha <= 0.01) continue;

      const size = m.r * 6;
      ctx.globalAlpha = alpha;
      ctx.drawImage(sprite, x - size / 2, m.y - size / 2, size, size);
    }

    ctx.globalAlpha = 1;
    raf = requestAnimationFrame(frame);
  };

  const start = (): void => {
    if (running) return;
    running = true;
    last = performance.now();
    raf = requestAnimationFrame(frame);
    canvas.classList.add('is-on');
  };

  const stop = (): void => {
    running = false;
    cancelAnimationFrame(raf);
  };

  let resizeTimer = 0;
  const onResize = (): void => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(build, 180);
  };

  const onVisibility = (): void => {
    if (document.hidden) stop();
    else start();
  };

  build();
  window.addEventListener('resize', onResize, { passive: true });
  document.addEventListener('visibilitychange', onVisibility);

  // Selama sampul masih tertutup, debunya tidak terlihat — jangan buang baterai.
  document.addEventListener('invitation:open', () => setTimeout(start, 300), { once: true });

  return () => {
    stop();
    window.removeEventListener('resize', onResize);
    document.removeEventListener('visibilitychange', onVisibility);
  };
}
