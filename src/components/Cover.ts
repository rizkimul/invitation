import { html, raw, type RawHtml } from '@/lib/dom';
import { picture } from '@/lib/image';
import { video } from '@/lib/video';
import { orderedCouple } from '@/lib/couple';
import type { InvitationConfig } from '@/types/invitation';
import { icons } from './icons';

/**
 * Sampul: foto penuh layar yang tajam, dengan satu panel kaca mengambang
 * di atasnya. Panel inilah yang memperkenalkan bahasa visual seluruh tema.
 */
export function Cover(config: InvitationConfig, guestName: string): RawHtml {
  const { first, second } = orderedCouple(config);

  return html`
    <div
      id="cover"
      class="fixed inset-0 z-[70] overflow-hidden bg-[#1c1f26] transition-[opacity,transform] duration-[1200ms] [transition-timing-function:var(--ease-glass)]"
    >
      <div class="absolute inset-0">
        <!-- Video sampul bila ada; kalau tidak, kembali ke foto diam.
             Helper video() sendiri sudah menurunkan ke poster saat gerak dimatikan. -->
        ${config.coverVideo
          ? video(config.coverVideo, {
              className: 'h-full w-full object-cover',
              loop: true,
              autoplay: true,
              preload: 'auto',
            })
          : picture(config.cover, {
              className: 'h-full w-full object-cover',
              loading: 'eager',
              fetchPriority: 'high',
              sizes: '100vw',
            })}
        <div
          class="absolute inset-0 bg-[linear-gradient(180deg,rgba(28,31,38,.45)_0%,rgba(28,31,38,.1)_35%,rgba(28,31,38,.72)_100%)]"
        ></div>
      </div>

      <div class="relative mx-auto flex h-full max-w-[30rem] flex-col justify-between px-5 py-10">
        <!-- Kicker + nama disatukan di kelompok atas.
             Pada video sampul, subjek berada di tengah frame; nama yang ikut
             di tengah akan menimpa wajah. Ditaruh di atas, wajah tetap bersih. -->
        <div class="text-center">
          <p class="t-label t-on-photo !text-white/80" data-cover-anim style="--d:120ms">
            ${config.opening.kicker}
          </p>

          <div data-cover-anim style="--d:280ms">
            <h1 class="t-display t-on-photo mt-5 text-[clamp(2.6rem,13vw,3.5rem)]">
              ${first.nickname}
              <span class="t-display-it block py-0.5 text-[.4em] text-white/85">and</span>
              ${second.nickname}
            </h1>
            <p class="t-label t-on-photo mt-4 !text-[.625rem] !text-white/80">${config.mainDateLabel}</p>
          </div>
        </div>

        <!-- Panel kaca -->
        <div class="glass glass-sheen p-6 text-center" data-cover-anim style="--d:480ms">
          <p class="t-label !text-[.625rem]">Kepada Yth.</p>
          <p id="cover-guest" class="t-display mt-2.5 text-[1.35rem] leading-snug break-words text-[var(--color-ink)]">
            ${guestName}
          </p>
          <p class="t-body mt-2 text-[.78rem] leading-[1.7] text-[var(--color-ink-3)]">
            Tanpa mengurangi rasa hormat, kami mengundang Anda
          </p>

          <button id="open-invitation" type="button" class="btn btn-solid mt-5 w-full">
            ${icons.envelope(14)} <span>Buka Undangan</span>
          </button>
        </div>
      </div>
    </div>
  `;
}

export const coverStyles = raw(`
  <style>
    [data-cover-anim]{opacity:0;transform:translateY(20px);animation:coverIn 1.1s var(--ease-glass) forwards;animation-delay:var(--d,0ms)}
    @keyframes coverIn{to{opacity:1;transform:none}}
    #cover.is-open{opacity:0;transform:scale(1.08)}
    @media (prefers-reduced-motion: reduce){[data-cover-anim]{opacity:1;transform:none;animation:none}#cover.is-open{transform:none;visibility:hidden}}
  </style>
`);
