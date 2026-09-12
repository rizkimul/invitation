import { html, type RawHtml } from '@/lib/dom';

/** Label kecil + garis tipis, dipakai di kepala tiap panel. */
export function sectionHead(label: string, dark = false): RawHtml {
  return html`
    <div class="flex items-center gap-3" data-reveal="up">
      <span class="t-label ${dark ? '!text-[rgba(255,255,255,.72)]' : ''}">${label}</span>
      <span
        class="h-px flex-1 ${dark ? 'bg-[rgba(255,255,255,.28)]' : 'bg-[rgba(34,37,44,.14)]'}"
        data-reveal="line"
      ></span>
    </div>
  `;
}

/** Judul dua baris: baris kedua italic. */
export function title(main: string, accent?: string, dark = false): RawHtml {
  return html`
    <h2
      class="t-display mt-5 text-[clamp(1.9rem,8.5vw,2.4rem)] ${dark ? 'text-white' : 'text-[var(--color-ink)]'}"
      data-reveal="up"
      style="--reveal-delay:60ms"
    >
      ${main}${accent
        ? html`<br /><span class="t-display-it ${dark ? 'text-[var(--color-denim-2)]' : 'text-[var(--color-denim)]'}"
            >${accent}</span
          >`
        : ''}
    </h2>
  `;
}

/** Paragraf pengantar. */
export function lede(text: string, delay = 120, dark = false): RawHtml {
  return html`
    <p
      class="t-body mt-4 text-[.88rem] leading-[1.85] ${dark ? '!text-[rgba(255,255,255,.78)]' : ''}"
      data-reveal="up"
      style="--reveal-delay:${delay}ms"
    >
      ${text}
    </p>
  `;
}
