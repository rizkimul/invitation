/** Utilitas DOM minimal — menggantikan kebutuhan framework. */

export function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Tandai string sebagai HTML tepercaya sehingga tidak di-escape oleh `html`. */
export class RawHtml {
  constructor(public readonly value: string) {}
  toString(): string {
    return this.value;
  }
}

export const raw = (value: string): RawHtml => new RawHtml(value);

/**
 * Template tag: meng-escape semua interpolasi kecuali `RawHtml` (dan array-nya).
 *
 * Mengembalikan `RawHtml`, bukan `string`, supaya hasil `html` bersarang
 * tidak ikut ter-escape saat disisipkan ke template induknya —
 * sementara data dari tamu (nama, ucapan) tetap otomatis di-escape.
 */
export function html(strings: TemplateStringsArray, ...values: unknown[]): RawHtml {
  let out = strings[0] ?? '';
  for (let i = 0; i < values.length; i++) {
    out += serialize(values[i]) + (strings[i + 1] ?? '');
  }
  return new RawHtml(out);
}

function serialize(value: unknown): string {
  if (value == null || value === false) return '';
  if (value instanceof RawHtml) return value.value;
  if (Array.isArray(value)) return value.map(serialize).join('');
  return escapeHtml(value);
}

export function $<T extends Element = HTMLElement>(selector: string, scope: ParentNode = document): T | null {
  return scope.querySelector<T>(selector);
}

export function $$<T extends Element = HTMLElement>(selector: string, scope: ParentNode = document): T[] {
  return Array.from(scope.querySelectorAll<T>(selector));
}

export function on<K extends keyof HTMLElementEventMap>(
  target: Element | Document | Window | null,
  type: K | string,
  handler: (event: never) => void,
  options?: AddEventListenerOptions,
): void {
  target?.addEventListener(type, handler as EventListener, options);
}

/** Delegasi event — berguna untuk konten yang dirender ulang. */
export function delegate(
  root: ParentNode & EventTarget,
  type: string,
  selector: string,
  handler: (el: HTMLElement, event: Event) => void,
): void {
  root.addEventListener(type, (event) => {
    const target = event.target as Element | null;
    const match = target?.closest<HTMLElement>(selector);
    if (match && root.contains(match)) handler(match, event);
  });
}

/** Pecah teks menjadi span per karakter untuk animasi bertahap. */
export function splitChars(text: string, baseDelay = 0, step = 26): RawHtml {
  const chars = Array.from(text)
    .map((ch, i) => {
      const delay = baseDelay + i * step;
      const safe = ch === ' ' ? '&nbsp;' : escapeHtml(ch);
      return `<span class="split-char" style="transition-delay:${delay}ms">${safe}</span>`;
    })
    .join('');
  return raw(`<span aria-label="${escapeHtml(text)}" role="text">${chars}</span>`);
}

export function lockScroll(locked: boolean): void {
  document.documentElement.classList.toggle('is-locked', locked);
  document.body.style.overflow = locked ? 'hidden' : '';
}

export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
