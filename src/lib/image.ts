import type { ResponsiveImage } from '@/types/invitation';
import { html, raw, type RawHtml } from './dom';

interface PictureOptions {
  /** class untuk elemen <picture>/<img> pembungkus. */
  className?: string;
  sizes?: string;
  loading?: 'lazy' | 'eager';
  fetchPriority?: 'high' | 'low' | 'auto';
  /** Terapkan blur-up dari thumb. */
  blurUp?: boolean;
}

/**
 * Merender <picture> dengan srcset webp + fallback jpg,
 * lengkap dengan width/height agar tidak terjadi layout shift.
 */
export function picture(image: ResponsiveImage, options: PictureOptions = {}): RawHtml {
  const {
    className = '',
    sizes = '(min-width: 1024px) 34rem, 100vw',
    loading = 'lazy',
    fetchPriority = 'auto',
    blurUp = true,
  } = options;

  const srcset = image.webp.map(([w, url]) => `${url} ${w}w`).join(', ');
  const w = 1000;
  const h = Math.round(w / image.ratio);

  const style = blurUp
    ? `background-image:url('${image.thumb}');background-size:cover;background-position:center;`
    : '';

  return html`
    <picture>
      <source type="image/webp" srcset="${raw(srcset)}" sizes="${sizes}" />
      <img
        src="${image.src}"
        alt="${image.alt}"
        width="${w}"
        height="${h}"
        loading="${loading}"
        decoding="async"
        fetchpriority="${fetchPriority}"
        class="${className}"
        style="${raw(style)}"
        onload="this.style.backgroundImage='none'"
      />
    </picture>
  `;
}
