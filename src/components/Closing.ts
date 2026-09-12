import { html, type RawHtml } from '@/lib/dom';
import { orderedCouple } from '@/lib/couple';
import type { InvitationConfig } from '@/types/invitation';

/**
 * Penutup: tanpa foto tambahan — foto latar terakhir dibiarkan terbuka
 * penuh, hanya satu panel kaca kecil yang mengambang di atasnya.
 */
export function Closing(config: InvitationConfig): RawHtml {
  const { first, second } = orderedCouple(config);

  return html`
    <section
      id="penutup"
      data-bg="10"
      class="relative flex min-h-[88svh] flex-col items-center justify-center px-5 py-20 text-center"
    >
      <p class="t-label t-on-photo !text-white/70" data-reveal="up">Terima Kasih</p>

      <h2 class="t-display t-on-photo mt-5 text-[clamp(2.4rem,13vw,3.2rem)]" data-reveal="up" style="--reveal-delay:80ms">
        ${first.nickname}
        <span class="t-display-it text-[.42em] text-white/85">&amp;</span>
        ${second.nickname}
      </h2>

      <!-- Tanda pagar dikecualikan dari text-transform uppercase bawaan
           .t-label. Besar-kecil hurufnya di sini membawa arti — itu yang
           memisahkan "RIZK" dan "ZAHRA" dari kata di antaranya — dan jarak
           hurufnya dirapatkan karena ini satu kata utuh, bukan label. -->
      <p
        class="t-label t-on-photo mt-3.5 !text-[.8rem] !normal-case !tracking-[.02em] !text-white/85"
        data-reveal="up"
        style="--reveal-delay:140ms"
      >
        ${config.hashtag}
      </p>

      <div class="glass glass-sheen mt-9 w-full max-w-[24rem] px-6 py-7" data-reveal="rise" style="--reveal-delay:180ms">
        <p class="t-body text-[.85rem] leading-[1.9]">${config.closing.body}</p>
        <div class="mx-auto my-5 h-px w-12 bg-[rgba(34,37,44,.16)]"></div>
        <p class="t-label !text-[.5625rem]">${config.closing.signature}</p>
        <p class="t-display mt-1.5 text-[1.15rem] text-[var(--color-ink)]">
          Keluarga ${first.nickname} &amp; ${second.nickname}
        </p>

      </div>

      <!-- Nama diambil dari config supaya baris kredit ini ikut berubah kalau
           nama panggilannya diganti. Urutannya sengaja TIDAK memakai
           orderedCouple(): kalimatnya menyebut peran, bukan urutan tampil —
           yang membuat dan yang mengkurasi. -->
      <p class="t-label t-on-photo mt-10 !text-[.5rem] !tracking-[.16em] !text-white/55">
        Made by ${config.couple.groom.nickname}, curated with love by ${config.couple.bride.nickname} ·
        ${new Date(config.mainDateISO).getFullYear()}
      </p>
    </section>
  `;
}
