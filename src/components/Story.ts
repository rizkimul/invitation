import { html, raw, type RawHtml } from '@/lib/dom';
import type { InvitationConfig, StoryItem } from '@/types/invitation';
import { sectionHead, title } from './section';

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
 * Semua babak rata tengah dan memakai satu ukuran: huruf, jarak baris, dan
 * jarak antar paragraf sama, berapa pun panjang tulisannya. Sebelumnya bait
 * (lebih dari satu `lines`) diset lebih besar dan lebih renggang daripada
 * prosa; hasilnya jarak antar babak terasa tidak seragam dan terlalu lega.
 * `text-pretty` tetap dipakai untuk merapikan rag dan baris yatim.
 */
function movement(item: StoryItem): RawHtml {
  return html`
    <article>
      <h3
        class="t-display-it text-center text-[1.55rem] leading-tight text-[var(--color-ink)]"
        data-reveal="up"
      >
        ${item.title}
      </h3>

      <div class="mx-auto mt-4 max-w-[20rem] space-y-3 text-center text-pretty">
        ${item.lines.map(
          (line, i) => html`
            <p
              class="t-body text-[.9rem] leading-[1.8] text-[var(--color-ink-2)]"
              data-reveal="up"
              style="--reveal-delay:${80 + i * 80}ms"
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
      <div class="glass mb-4 px-6 py-8">${sectionHead('Cerita Kami')} ${title('Sebuah cerita', 'perjalanan')}</div>

      <div class="glass glass-sheen px-6 py-10">
        ${config.story.map(
          (item, index) => html`
            ${index > 0 ? html`<div class="story-rule" data-reveal="fade" aria-hidden="true"></div>` : ''}
            ${movement(item)}
          `,
        )}
      </div>
    </section>
  `;
}
