import { html, type RawHtml } from '@/lib/dom';
import { picture } from '@/lib/image';
import type { InvitationConfig } from '@/types/invitation';
import { icons } from './icons';
import { sectionHead, title } from './section';

/**
 * Satu kartu untuk seluruh rangkaian acara — akad dan resepsi digelar di hari
 * dan tempat yang sama, jadi tanggal serta alamatnya cukup ditulis sekali.
 *
 * Kepala kartunya sebuah pita foto, lalu tanggal sebagai angka besar. Angka
 * besar itu yang memberi kartu ini urutan baca: sebelumnya semua baris punya
 * bobot yang mirip sehingga mata tidak tahu harus mendarat di mana.
 *
 * Tanggalnya sengaja TIDAK ditumpangkan di atas foto. Foto ini terang di
 * bagian bawah dan subjeknya di tengah — teks putih di atasnya tidak pernah
 * benar-benar aman dibaca, berapa pun pekat kerudungnya.
 */
export function Events(config: InvitationConfig): RawHtml {
  const first = config.events[0];
  const day = first ? new Date(first.startISO) : new Date(config.mainDateISO);
  const dayNum = String(day.getDate());
  const weekday = day.toLocaleDateString('id-ID', { weekday: 'long' });
  const monthYear = day.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  const venue = config.venue;

  return html`
    <section id="acara" data-bg="4" class="panel">
      <div class="glass mb-4 px-6 py-8">${sectionHead('Rangkaian Acara')} ${title('Waktu &', 'tempat')}</div>

      <article class="glass glass-sheen overflow-hidden" data-reveal="rise">
        <div class="relative w-full" style="aspect-ratio:1.6">
          ${picture(config.heroBanner, {
            className: 'absolute inset-0 h-full w-full object-cover',
            sizes: '(min-width:1024px) 28rem, 100vw',
          })}
        </div>

        <div class="px-6 pt-8 pb-9 text-center">
          <p class="t-label !text-[.5625rem] !text-[var(--color-ink-4)]">${weekday}</p>
          <p class="t-display mt-1 text-[4.25rem] leading-[.9] text-[var(--color-ink)]">${dayNum}</p>
          <p class="t-display-it mt-1 text-[1.25rem] text-[var(--color-denim)]">${monthYear}</p>

          <div class="mt-8 space-y-6 border-y border-[rgba(34,37,44,.1)] py-7">
            ${config.events.map(
              (event) => html`
                <div>
                  <p class="t-display text-[1.25rem] leading-none text-[var(--color-ink)]">${event.title}</p>
                  <p class="t-body mt-2 text-[.9rem] tabular-nums text-[var(--color-ink-2)]">${event.timeLabel}</p>
                </div>
              `,
            )}
          </div>

          <div class="mt-8">
            <span class="inline-flex text-[var(--color-denim)]">${icons.pin(15)}</span>
            <p class="mt-2 text-[.9rem] font-medium text-[var(--color-ink)]">${venue.name}</p>
            <p class="t-body mx-auto mt-1 max-w-[19rem] text-[.82rem] leading-[1.65] text-[var(--color-ink-3)]">
              ${venue.address}
            </p>
          </div>
        </div>
      </article>
    </section>
  `;
}
