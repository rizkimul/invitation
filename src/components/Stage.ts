import { $$, html, raw, type RawHtml } from '@/lib/dom';
import { picture } from '@/lib/image';
import type { InvitationConfig, ResponsiveImage } from '@/types/invitation';

/**
 * Panggung latar: foto tetap (fixed) di belakang seluruh halaman.
 *
 * Dua mode, diatur lewat `config.stage.mode`:
 *
 * - `'single'` (default) — SATU foto saja, yaitu foto sampul, dipakai untuk
 *   seluruh halaman. Tidak ada crossfade, tidak ada pemantau gulir, dan hanya
 *   satu gambar yang diunduh. Panel kaca jadi satu-satunya yang bergerak,
 *   sehingga halaman terasa lebih tenang dan jauh lebih ringan.
 *
 * - `'per-section'` — satu lapisan per foto; bagian undangan menandai foto
 *   mana yang aktif lewat `data-bg="<index>"`, lalu di-crossfade saat digulir.
 */
export function backgroundImages(config: InvitationConfig): ResponsiveImage[] {
  // Mode gradien tidak memuat gambar sama sekali.
  if (config.stage?.mode !== 'per-section' && config.stage?.treatment === 'gradient') return [];

  if (config.stage?.mode === 'per-section') {
    return [config.cover, config.heroBanner, ...config.gallery.map((item) => item.image), config.closingImage];
  }
  return [config.cover];
}

/**
 * Kanvas debu. Diletakkan SETELAH .stage dan sebelum .shell:
 * sama-sama z-index 0, jadi yang belakangan menang urutan cat, sementara
 * .shell di z-index 1 tetap di atas keduanya. Efeknya, partikel tajam di
 * sela-sela panel dan meleleh lembut saat tertutup kaca.
 */
export function Dust(config: InvitationConfig): RawHtml {
  if (!config.particles?.enabled) return raw('');
  return html`<canvas id="dust" class="dust" aria-hidden="true"></canvas>`;
}

export function Stage(config: InvitationConfig): RawHtml {
  const images = backgroundImages(config);
  const isSingle = images.length === 1;
  const treatment = config.stage?.mode === 'per-section' ? 'plain' : (config.stage?.treatment ?? 'plain');

  return html`
    <div class="stage" data-treatment="${treatment}" aria-hidden="true">
      ${images.map(
        (image, index) => html`
          <div class="stage__layer ${index === 0 ? 'is-active' : ''}" data-stage-layer="${index}">
            ${picture(image, {
              sizes: '100vw',
              loading: isSingle || index < 2 ? 'eager' : 'lazy',
              fetchPriority: index === 0 ? 'high' : 'auto',
              blurUp: false,
            })}
          </div>
        `,
      )}
      <div class="stage__veil"></div>
    </div>
  `;
}

/**
 * Menyalakan lapisan sesuai bagian yang sedang dilihat.
 *
 * Memakai posisi tengah viewport, bukan IntersectionObserver, agar pergantian
 * tetap tepat meski tinggi bagian berubah saat font/gambar dimuat.
 *
 * Pada mode 'single' fungsi ini berhenti lebih awal: tidak ada listener gulir
 * yang dipasang sama sekali.
 */
export function mountStage(): void {
  const layers = $$('[data-stage-layer]');
  if (layers.length <= 1) return;

  const markers = $$('[data-bg]');
  if (!markers.length) return;

  let active = -1;
  let ticking = false;

  const apply = (index: number) => {
    if (index === active) return;
    active = index;
    layers.forEach((layer, i) => layer.classList.toggle('is-active', i === index));
  };

  const update = () => {
    ticking = false;
    const mid = window.innerHeight * 0.42;
    let candidate = 0;

    for (const marker of markers) {
      const rect = marker.getBoundingClientRect();
      if (rect.top <= mid) candidate = Number(marker.dataset['bg'] ?? 0);
    }

    apply(Math.min(candidate, layers.length - 1));
  };

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  document.addEventListener('invitation:open', () => setTimeout(update, 200));
  update();
}
