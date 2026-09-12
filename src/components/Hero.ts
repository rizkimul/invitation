import { html, splitChars, type RawHtml } from '@/lib/dom';
import { orderedCouple } from '@/lib/couple';
import type { InvitationConfig } from '@/types/invitation';
import { icons } from './icons';

/**
 * Beranda: sengaja TIDAK memakai panel kaca — nama berdiri langsung
 * di atas foto latar, supaya perbedaan antara "di atas foto" dan
 * "di dalam kaca" terbaca sejak layar pertama.
 */
export function Hero(config: InvitationConfig): RawHtml {
  const { first, second } = orderedCouple(config);

  return html`
    <header
      id="beranda"
      data-bg="0"
      class="relative flex min-h-[92svh] flex-col items-center justify-center px-8 py-24 text-center"
    >
      <p class="t-label t-on-photo !text-white/75" data-reveal="up">${config.opening.kicker}</p>

      <h1 class="mt-6">
        <span class="t-display t-on-photo block text-[clamp(2.8rem,15vw,3.8rem)]" data-reveal="fade">
          ${splitChars(first.nickname, 180, 36)}
        </span>
        <span
          class="t-display-it t-on-photo my-1 block text-[1.5rem] text-white/85"
          data-reveal="up"
          style="--reveal-delay:400ms"
          >and</span
        >
        <span class="t-display t-on-photo block text-[clamp(2.8rem,15vw,3.8rem)]" data-reveal="fade">
          ${splitChars(second.nickname, 500, 36)}
        </span>
      </h1>

      <div
        class="glass mt-10 inline-flex items-center gap-3 px-5 py-2.5"
        data-reveal="up"
        style="--reveal-delay:760ms"
      >
        <span class="t-label !text-[.625rem] !text-[var(--color-ink-2)]">${config.mainDateLabel}</span>
      </div>

      <p class="t-label t-on-photo mt-4 !text-[.625rem] !text-white/65" data-reveal="up" style="--reveal-delay:840ms">
        Bandung, Jawa Barat
      </p>

      <div class="absolute bottom-8 flex flex-col items-center gap-2" data-reveal="fade">
        <span class="t-label t-on-photo !text-[.5625rem] !text-white/60">Gulir</span>
        <span class="animate-bounce text-white/70">${icons.arrowDown(16)}</span>
      </div>
    </header>
  `;
}
