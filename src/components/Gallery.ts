import { $, delegate, html, lockScroll, raw, type RawHtml } from '@/lib/dom';
import { picture } from '@/lib/image';
import type { InvitationConfig } from '@/types/invitation';
import { icons } from './icons';
import { sectionHead, title } from './section';

/**
 * Galeri sebagai rel geser horizontal dengan scroll-snap —
 * bukan grid — supaya foto latar tetap terlihat di sisi kiri/kanan
 * dan gerakannya terasa seperti membalik kartu kaca.
 */
export function Gallery(config: InvitationConfig): RawHtml {
  if (!config.gallery.length) return raw('');

  return html`
    <section id="galeri" data-bg="6" class="relative py-4">
      <div class="panel !mb-0 !py-0">
        <div class="glass px-6 py-8">
          ${sectionHead('Galeri')} ${title('Potret', 'kami berdua')}
          <p class="t-label mt-4 !text-[.5625rem] !text-[var(--color-ink-4)]">
            Geser ke samping · ketuk untuk memperbesar
          </p>
        </div>
      </div>

      <div class="rail no-scrollbar mt-5 pb-2">
        ${config.gallery.map(
          (item, index) => html`
            <figure
              class="cursor-zoom-in"
              data-lightbox="${index}"
              data-reveal="blur"
              style="--reveal-delay:${(index % 3) * 70}ms"
            >
              <div class="frame aspect-[3/4] shadow-[0_20px_50px_-24px_rgba(20,22,28,.7)] ring-1 ring-white/40">
                ${picture(item.image, { sizes: '78vw' })}
              </div>
              ${item.caption
                ? html`<figcaption class="t-label t-on-photo mt-2.5 !text-[.5rem] !text-white/75">
                    ${item.caption}
                  </figcaption>`
                : ''}
            </figure>
          `,
        )}
      </div>
    </section>

    <!-- Lightbox -->
    <div
      id="lightbox"
      class="fixed inset-0 z-[90] hidden items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Pratinjau foto"
      style="background:rgba(20,22,28,.72);backdrop-filter:blur(22px);-webkit-backdrop-filter:blur(22px)"
    >
      <button
        type="button"
        class="btn btn-light absolute right-4 top-4 z-10 !h-11 !w-11 !rounded-full !p-0"
        data-lb-close
        aria-label="Tutup"
      >
        ${icons.close(18)}
      </button>

      <button
        type="button"
        class="btn btn-light absolute left-3 top-1/2 z-10 !h-11 !w-11 -translate-y-1/2 !rounded-full !p-0"
        data-lb-prev
        aria-label="Sebelumnya"
      >
        ${icons.chevronL(20)}
      </button>
      <button
        type="button"
        class="btn btn-light absolute right-3 top-1/2 z-10 !h-11 !w-11 -translate-y-1/2 !rounded-full !p-0"
        data-lb-next
        aria-label="Berikutnya"
      >
        ${icons.chevronR(20)}
      </button>

      <figure class="max-h-full w-full max-w-[32rem]">
        <img id="lb-image" src="" alt="" class="mx-auto max-h-[74vh] w-auto rounded-2xl object-contain" />
        <figcaption class="mt-4 flex items-center justify-between gap-4">
          <span id="lb-caption" class="t-label !text-[.5625rem] !text-white/75"></span>
          <span id="lb-counter" class="t-label !text-[.5625rem] !text-white/55"></span>
        </figcaption>
      </figure>
    </div>
  `;
}

export function mountGallery(config: InvitationConfig): void {
  const box = $('#lightbox');
  const image = $<HTMLImageElement>('#lb-image');
  const caption = $('#lb-caption');
  const counter = $('#lb-counter');
  const gallerySection = $('#galeri');
  if (!box || !image || !gallerySection) return;

  let current = 0;

  const render = () => {
    const item = config.gallery[current];
    if (!item) return;
    image.src = item.image.webp.at(-1)?.[1] ?? item.image.src;
    image.alt = item.image.alt;
    if (caption) caption.textContent = item.caption ?? '';
    if (counter) counter.textContent = `${current + 1} / ${config.gallery.length}`;
  };

  const open = (index: number) => {
    current = index;
    render();
    box.classList.remove('hidden');
    box.classList.add('flex');
    lockScroll(true);
  };

  const close = () => {
    box.classList.add('hidden');
    box.classList.remove('flex');
    lockScroll(false);
  };

  const step = (delta: number) => {
    current = (current + delta + config.gallery.length) % config.gallery.length;
    render();
  };

  delegate(gallerySection, 'click', '[data-lightbox]', (el) => open(Number(el.dataset['lightbox'] ?? 0)));

  box.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;
    if (target.closest('[data-lb-close]') || target === box) return close();
    if (target.closest('[data-lb-prev]')) return step(-1);
    if (target.closest('[data-lb-next]')) return step(1);
  });

  document.addEventListener('keydown', (event) => {
    if (box.classList.contains('hidden')) return;
    if (event.key === 'Escape') close();
    if (event.key === 'ArrowLeft') step(-1);
    if (event.key === 'ArrowRight') step(1);
  });

  let startX = 0;
  box.addEventListener('touchstart', (e) => (startX = e.changedTouches[0]?.clientX ?? 0), { passive: true });
  box.addEventListener(
    'touchend',
    (e) => {
      const delta = (e.changedTouches[0]?.clientX ?? 0) - startX;
      if (Math.abs(delta) > 50) step(delta < 0 ? 1 : -1);
    },
    { passive: true },
  );
}
