import { html, type RawHtml } from '@/lib/dom';

/*
 * Ornamen undangan: dua tema benda cetak yang saling melengkapi.
 *
 * - Kertas undangan: kartu acara berbentuk tiket, monogram timbul tanpa
 *   tinta di pojok kartu, dan segel monogram yang menahan kartu penutup.
 * - Foto cetak: foto asli dari sesi studio terselip di belakang kartu.
 *
 * Monogram memakai logo mempelai (public/images/monogram.svg, hasil trace
 * dari logo aslinya) sebagai MASKER, bukan gambar berwarna. Bentuknya tetap,
 * warnanya mengikuti permukaan tempat ia berada: putih di atas foto, timbul
 * senada kartu di atas kaca, dan biru denim di segel penutup.
 */

/** Logo mempelai; warnanya diatur lewat CSS (`background` + `mask`). */
export function monogram(className = ''): RawHtml {
  return html`<span class="monogram ${className}" aria-hidden="true"></span>`;
}

/** Cetakan foto yang terselip di belakang kartu sesudahnya. */
export function print(name: string): RawHtml {
  return html`
    <figure class="orn-print" aria-hidden="true">
      <img src="/images/orn/${name}-420.webp" alt="" loading="lazy" decoding="async" />
    </figure>
  `;
}

/** Segel lilin bermonogram, separuhnya menindih tepi atas kartu berikutnya. */
export function seal(): RawHtml {
  return html`<div class="orn-seal" aria-hidden="true">${monogram('orn-seal__mark')}</div>`;
}

/** Monogram timbul tanpa tinta (blind emboss) di pojok kanan bawah kartu. */
export function emboss(): RawHtml {
  return html`<div class="orn-emboss" aria-hidden="true">${monogram('orn-emboss__mark')}</div>`;
}

/**
 * Takik tiket di kartu acara. Posisinya harus tepat di garis sobek, dan
 * tinggi isi di atas garis itu bergantung pada lebar layar dan font — jadi
 * diukur, bukan ditebak.
 */
export function mountTicket(): void {
  const card = document.querySelector<HTMLElement>('.orn-ticket');
  const seam = card?.querySelector<HTMLElement>('.orn-ticket__seam');
  if (!card || !seam) return;
  const set = () => card.style.setProperty('--notch-y', `${seam.offsetTop}px`);
  set();
  addEventListener('resize', set);
  addEventListener('load', set);
  void document.fonts?.ready.then(set);
}
