/**
 * Sapaan personal via query string.
 * Mendukung: ?to=, ?kepada=, ?guest=, ?u=
 * Contoh: https://undangan.example.id/?to=Keluarga%20Bapak%20Hendra
 */
const KEYS = ['to', 'kepada', 'guest', 'u'];

export function getGuestName(fallback: string): string {
  const params = new URLSearchParams(window.location.search);
  for (const key of KEYS) {
    const value = params.get(key);
    if (value && value.trim()) return sanitize(value);
  }
  // Dukungan format hash: #/to/Nama
  const hash = decodeURIComponent(window.location.hash.replace(/^#\/?/, ''));
  const match = hash.match(/^(?:to|kepada)\/(.+)$/i);
  if (match?.[1]) return sanitize(match[1]);
  return fallback;
}

function sanitize(value: string): string {
  return value
    .replace(/[<>]/g, '')
    .replace(/\+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 80);
}

/** URL undangan lengkap untuk tombol bagikan. */
export function invitationUrl(siteUrl: string): string {
  if (typeof window === 'undefined') return siteUrl;
  return window.location.href || siteUrl;
}
