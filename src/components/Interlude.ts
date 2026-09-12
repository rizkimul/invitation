import { html, raw, type RawHtml } from '@/lib/dom';
import { motionAllowed, video } from '@/lib/video';
import type { InvitationConfig } from '@/types/invitation';
import { icons } from './icons';

/**
 * Selingan bergerak lebar penuh di antara Perjalanan dan Galeri.
 *
 * Sengaja TIDAK dijadikan latar yang berputar terus:
 * - klip hanya 3 detik, loop tanpa henti cepat terasa gelisah;
 * - video yang terus diputar di balik panel `backdrop-filter` adalah
 *   kombinasi compositing terberat dan bikin gulir patah di HP kelas menengah;
 * - momen "dua jalan berpapasan" ini terlalu bagus untuk dikubur di belakang teks.
 *
 * Jadi: diputar SEKALI saat masuk layar, berhenti di frame terakhir,
 * dan bisa diulang dengan mengetuknya.
 */
export function Interlude(config: InvitationConfig): RawHtml {
  if (!config.interlude) return raw('');
  const { video: asset, kicker, caption } = config.interlude;

  return html`
    <section id="selingan" class="relative my-6" data-interlude>
      <figure class="relative overflow-hidden">
        <div class="relative aspect-[2/3] w-full bg-[#1c1f26]">
          ${video(asset, { className: 'h-full w-full object-cover', preload: 'metadata' })}

          <!-- Kabut tipis atas–bawah supaya teks tetap terbaca -->
          <div
            class="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(28,31,38,.5)_0%,transparent_28%,transparent_62%,rgba(28,31,38,.72)_100%)]"
          ></div>

          <p class="t-label t-on-photo absolute inset-x-0 top-6 text-center !text-[.5625rem] !text-white/75">
            ${kicker}
          </p>

          <!-- Petunjuk ketuk-untuk-ulang, muncul setelah video selesai -->
          <span
            class="pointer-events-none absolute bottom-16 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/40 bg-white/15 px-3.5 py-1.5 opacity-0 backdrop-blur-[8px] transition-opacity duration-700"
            data-replay-hint
          >
            ${icons.replay(13)}
            <span class="t-label !text-[.5rem] !tracking-[.1em] !text-white">Ketuk untuk ulang</span>
          </span>

          <figcaption class="absolute inset-x-0 bottom-6 px-6 text-center">
            <span class="t-label t-on-photo !text-[.5rem] !tracking-[.12em] !text-white/70">${caption}</span>
          </figcaption>
        </div>
      </figure>

      ${motionAllowed()
        ? ''
        : html`<p class="t-label mt-3 px-6 text-center !text-[.5rem] !text-white/60">
            Mode hemat gerak aktif — menampilkan gambar diam.
          </p>`}
    </section>
  `;
}
