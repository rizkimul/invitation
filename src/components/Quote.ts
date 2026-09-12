import { html, type RawHtml } from '@/lib/dom';
import type { InvitationConfig } from '@/types/invitation';

/** Kutipan pembuka dalam panel kaca gelap — kontras dengan panel terang lain. */
export function Quote(config: InvitationConfig): RawHtml {
  return html`
    <section id="pembuka" data-bg="1" class="panel">
      <div class="glass-dark glass-sheen px-6 py-10 text-center" data-reveal="rise">
        ${config.quote.arabic
          ? html`<p
              dir="rtl"
              lang="ar"
              class="text-[1.35rem] leading-[2.3] text-white"
              style="font-family:'Amiri','Scheherazade New',serif"
            >
              ${config.quote.arabic}
            </p>`
          : ''}

        <p class="t-display-it mt-6 text-[1.02rem] leading-[1.85] text-white/90">“${config.quote.text}”</p>

        <p class="t-label mt-6 !text-[.625rem] !text-[var(--color-denim-2)]">${config.quote.source}</p>
      </div>

      <div class="glass mt-4 px-6 py-8 text-center" data-reveal="rise" style="--reveal-delay:120ms">
        <p class="t-label !text-[.625rem]">${config.opening.salutation}</p>
        <p class="t-body mt-4 text-[.86rem] leading-[1.9]">${config.opening.body}</p>
      </div>
    </section>
  `;
}
