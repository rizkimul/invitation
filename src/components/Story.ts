import { html, raw, type RawHtml } from '@/lib/dom';
import type { InvitationConfig, StoryItem } from '@/types/invitation';
import { sectionHead, title } from './section';

const NUMERALS = ['I', 'II', 'III', 'IV', 'V', 'VI'];

/**
 * Tiga babak dalam satu bidang kaca.
 *
 * Versi lama memakai linimasa tahun — satu kartu per tahun, lengkap dengan
 * lencana angka dan garis penghubung. Bentuk itu menjanjikan kronologi, dan
 * tulisan ini bukan kronologi: tidak ada tanggal yang ingin disampaikan,
 * yang ada perpindahan keadaan. Jadi angka tahunnya hilang, kartunya lebur
 * jadi satu panel, dan yang memisahkan babak tinggal sebuah ornamen kecil —
 * seperti jeda antar bait, bukan baris berikutnya dalam sebuah daftar.
 *
 * Semua babak rata tengah. Prosa panjang yang rata tengah sebenarnya lebih
 * berat dibaca — kedua tepinya bergerigi, jadi mata harus mencari awal tiap
 * baris — tapi konsistensi satu sumbu di seluruh panel lebih diutamakan.
 * Bebannya ditekan dengan `text-pretty` (memperbaiki rag dan baris yatim)
 * dan jarak baris yang lega.
 *
 * Yang tetap mengikuti tulisannya sendiri (lihat StoryItem) adalah bobotnya:
 * bait yang dipenggal penulisnya diset lebih besar dan berjarak lebar, prosa
 * yang mengalir diset lebih kecil dan rapat. Hasilnya babak 1 dan 3 terasa
 * ringan, babak 2 di tengahnya terasa padat — persis ritme isinya.
 */
function movement(item: StoryItem, index: number): RawHtml {
  const isVerse = item.lines.length > 1;
  const numeral = NUMERALS[index] ?? String(index + 1);

  return html`
    <article>
      <!-- Angka Romawi diset dengan huruf display, bukan huruf label.
           Pada ukuran label yang berjarak lebar, "II" dan "III" terbaca
           sebagai deretan garis, bukan angka. -->
      <p
        class="t-display text-center text-[.9rem] tracking-[.12em] text-[var(--color-denim)]"
        data-reveal="fade"
      >
        ${numeral}
      </p>

      <h3
        class="t-display-it mt-3 text-center text-[1.55rem] leading-tight text-[var(--color-ink)]"
        data-reveal="up"
        style="--reveal-delay:70ms"
      >
        ${item.title}
      </h3>

      <div class="mx-auto mt-6 max-w-[20rem] text-center text-pretty">
        ${item.lines.map(
          (line, i) => html`
            <p
              class="t-body ${isVerse ? 'text-[.95rem]' : 'text-[.875rem]'} leading-[2] text-[var(--color-ink-2)] ${i >
              0
                ? 'mt-5'
                : ''}"
              data-reveal="up"
              style="--reveal-delay:${150 + i * 100}ms"
            >
              ${line}
            </p>
          `,
        )}
      </div>
    </article>
  `;
}

export function Story(config: InvitationConfig): RawHtml {
  if (!config.story.length) return raw('');

  return html`
    <section id="cerita" data-bg="5" class="panel">
      <div class="glass mb-4 px-6 py-8">${sectionHead('Perjalanan')} ${title('Sebuah cerita', 'yang panjang')}</div>

      <div class="glass glass-sheen px-6 py-11">
        ${config.story.map(
          (item, index) => html`
            ${index > 0 ? html`<div class="story-rule" data-reveal="fade" aria-hidden="true"></div>` : ''}
            ${movement(item, index)}
          `,
        )}
      </div>
    </section>
  `;
}
