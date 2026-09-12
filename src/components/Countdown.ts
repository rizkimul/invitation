import { $, html, raw, type RawHtml } from '@/lib/dom';
import { pad, startCountdown } from '@/lib/countdown';
import { video } from '@/lib/video';
import type { InvitationConfig } from '@/types/invitation';

const CELLS: Array<{ key: 'days' | 'hours' | 'minutes' | 'seconds'; label: string }> = [
  { key: 'days', label: 'Hari' },
  { key: 'hours', label: 'Jam' },
  { key: 'minutes', label: 'Menit' },
  { key: 'seconds', label: 'Detik' },
];

/**
 * Save the Date, berdiri langsung di atas latar bergerak.
 *
 * Klip "dua arah, satu titik temu" dipakai sebagai latar berulang: keduanya
 * berjalan berlawanan arah, berpapasan, lalu kembali — persis gagasan hitung
 * mundur menuju hari pertemuan itu.
 *
 * Berkas latarnya versi ping-pong (maju lalu mundur). Klip aslinya tidak bisa
 * di-loop dengan potongan langsung: posisi keduanya di frame awal dan akhir
 * tertukar total, jadi sambungannya akan terlihat seperti teleport.
 *
 * Tanpa panel kaca, keterbacaan sepenuhnya bergantung pada dua hal: kerudung
 * gelap berlapis (linear + vignette radial) dan `.t-on-photo` di setiap teks.
 * Itu juga alasan tidak ada satu pun warna aksen di sini — di atas foto,
 * warna redup seperti --color-denim-2 langsung lenyap.
 */
export function Countdown(config: InvitationConfig): RawHtml {
  const bg = config.savedateVideo;

  const content = html`
    <div class="relative w-full max-w-[23rem] text-center">
      <p class="t-label t-on-photo !text-[.625rem] !text-white/70" data-reveal="up">Menghitung Hari</p>

      <h2
        class="t-display t-on-photo mt-3 text-[clamp(2.1rem,9.5vw,2.6rem)]"
        data-reveal="up"
        style="--reveal-delay:60ms"
      >
        Save the <span class="t-display-it !text-white/85">date</span>
      </h2>

      <p class="t-body t-on-photo mt-2 text-[.84rem] !text-white/75" data-reveal="up" style="--reveal-delay:100ms">
        ${config.mainDateLabel}
      </p>

      <div id="countdown" class="mt-9 grid grid-cols-4" data-reveal="up" style="--reveal-delay:160ms">
        ${CELLS.map(
          (cell) => html`
            <div class="cd-cell">
              <div class="cd-num t-on-photo" data-cd="${cell.key}">00</div>
              <div class="t-label t-on-photo mt-2 !text-[.5rem] !tracking-[.14em] !text-white/60">${cell.label}</div>
            </div>
          `,
        )}
      </div>

      <p id="countdown-done" class="t-display-it t-on-photo mt-6 hidden text-[1.25rem] !text-white/85">
        Hari bahagia telah tiba
      </p>
    </div>
  `;

  // Tanpa video latar, teks putih ini akan melayang di atas panggung foto tanpa
  // pegangan apa pun — jadi di jalur itu panel kacanya tetap dipakai.
  if (!bg) {
    return html`
      <section id="hitung-mundur" data-bg="3" class="panel">
        <div class="glass-dark glass-sheen flex justify-center px-6 py-9">${content}</div>
      </section>
    `;
  }

  return html`
    <section
      id="hitung-mundur"
      data-bg="3"
      class="relative my-6 flex min-h-[92svh] items-center justify-center overflow-hidden px-6 py-20"
    >
      ${video(bg, {
        className: 'absolute inset-0 h-full w-full object-cover',
        ambient: true,
        preload: 'metadata',
      })}

      <!-- Dua lapis kerudung. Yang linear menjaga tepi atas-bawah, yang radial
           menggelapkan tengah layar tepat di bawah blok teks tanpa membuat
           seluruh bingkai jadi rata gelap. -->
      <div class="cd-veil pointer-events-none absolute inset-0"></div>

      ${content}

      <p
        class="t-label t-on-photo absolute inset-x-0 bottom-24 text-center !text-[.5rem] !tracking-[.14em] !text-white/55"
      >
        Dua arah, satu titik temu
      </p>
    </section>
  `;
}

export function mountCountdown(config: InvitationConfig): () => void {
  const root = $('#countdown');
  if (!root) return () => {};

  const nodes = new Map<string, HTMLElement>();
  for (const cell of CELLS) {
    const node = $(`[data-cd="${cell.key}"]`, root);
    if (node) nodes.set(cell.key, node);
  }
  const doneNode = $('#countdown-done');

  return startCountdown(config.mainDateISO, (value) => {
    nodes.get('days')!.textContent = pad(value.days);
    nodes.get('hours')!.textContent = pad(value.hours);
    nodes.get('minutes')!.textContent = pad(value.minutes);
    nodes.get('seconds')!.textContent = pad(value.seconds);

    if (value.done) {
      root.classList.add('opacity-40');
      doneNode?.classList.remove('hidden');
    }
  });
}

export const countdownDecor = raw('');
