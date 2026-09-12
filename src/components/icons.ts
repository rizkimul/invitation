import { raw, type RawHtml } from '@/lib/dom';

const svg = (path: string, size = 16, extra = ''): RawHtml =>
  raw(
    `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}>${path}</svg>`,
  );

export const icons = {
  envelope: (s = 16) =>
    svg('<rect x="2.5" y="5" width="19" height="14" rx="1"/><path d="m2.5 6.5 9.5 7 9.5-7"/>', s),
  pin: (s = 16) => svg('<path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z"/><circle cx="12" cy="10" r="2.6"/>', s),
  calendar: (s = 16) =>
    svg('<rect x="3" y="5" width="18" height="16" rx="1"/><path d="M3 10h18M8 3v4M16 3v4"/>', s),
  gift: (s = 16) =>
    svg(
      '<rect x="3" y="9" width="18" height="12" rx="1"/><path d="M3 13h18M12 9v12"/><path d="M12 9S9.5 3.8 7.3 5.2C5.6 6.3 7 9 12 9Zm0 0s2.5-5.2 4.7-3.8C18.4 6.3 17 9 12 9Z"/>',
      s,
    ),
  chat: (s = 16) => svg('<path d="M20 4.5H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3v4l4.5-4H20a1 1 0 0 0 1-1v-10a1 1 0 0 0-1-1Z"/>', s),
  image: (s = 16) =>
    svg('<rect x="3" y="4.5" width="18" height="15" rx="1"/><circle cx="8.5" cy="9.5" r="1.6"/><path d="m3.5 17 5-5 4.5 4.5 3-2.5 4.5 4"/>', s),
  music: (s = 16) => svg('<path d="M9 18V5.5l11-2v12"/><circle cx="6.2" cy="18" r="2.8"/><circle cx="17.2" cy="15.5" r="2.8"/>', s),
  mute: (s = 16) =>
    svg('<path d="M9 18V5.5l11-2v12"/><circle cx="6.2" cy="18" r="2.8"/><circle cx="17.2" cy="15.5" r="2.8"/><path d="m3 3 18 18"/>', s),
  copy: (s = 16) => svg('<rect x="8.5" y="8.5" width="12" height="12" rx="1"/><path d="M15.5 5.5h-11a1 1 0 0 0-1 1v11"/>', s),
  check: (s = 16) => svg('<path d="m4.5 12.5 5 5 10-11"/>', s),
  share: (s = 16) =>
    svg('<circle cx="18" cy="5.5" r="2.6"/><circle cx="6" cy="12" r="2.6"/><circle cx="18" cy="18.5" r="2.6"/><path d="m8.4 10.8 7.2-4M8.4 13.2l7.2 4"/>', s),
  instagram: (s = 16) =>
    svg('<rect x="3.5" y="3.5" width="17" height="17" rx="4.5"/><circle cx="12" cy="12" r="3.8"/><circle cx="17" cy="7" r="1" fill="currentColor" stroke="none"/>', s),
  arrowDown: (s = 16) => svg('<path d="M12 4.5v15M6 13.5l6 6 6-6"/>', s),
  close: (s = 16) => svg('<path d="m5 5 14 14M19 5 5 19"/>', s),
  chevronL: (s = 16) => svg('<path d="m14.5 5-7 7 7 7"/>', s),
  chevronR: (s = 16) => svg('<path d="m9.5 5 7 7-7 7"/>', s),
  user: (s = 16) => svg('<circle cx="12" cy="8.5" r="4"/><path d="M4.5 20.5a7.5 7.5 0 0 1 15 0"/>', s),
  whatsapp: (s = 16) =>
    svg(
      '<path d="M3.5 20.5 4.8 16A8 8 0 1 1 8 19.2l-4.5 1.3Z"/><path d="M9.2 9c.3-.8.6-.8 1-.8h.5c.2 0 .4 0 .6.5l.7 1.6c.1.3 0 .5-.1.7l-.4.5c-.1.2-.2.3 0 .6a6 6 0 0 0 2.6 2.2c.3.1.5.1.7-.1l.6-.7c.2-.2.4-.2.6-.1l1.6.8c.2.1.4.2.4.4v.5c0 .5-.4 1.2-1.3 1.3-1 .2-2.5-.2-4.4-1.5a9 9 0 0 1-3.3-4c-.4-1-.3-1.7 0-2Z"/>',
      s,
    ),
  quote: (s = 20) =>
    svg('<path d="M9.5 6.5c-3 1-5 3.4-5 6.6 0 2.4 1.5 4.4 3.7 4.4 1.9 0 3.3-1.4 3.3-3.3 0-1.8-1.3-3.1-3-3.1-.3 0-.6 0-.8.1.4-1.6 1.6-2.9 3.2-3.6ZM19.5 6.5c-3 1-5 3.4-5 6.6 0 2.4 1.5 4.4 3.7 4.4 1.9 0 3.3-1.4 3.3-3.3 0-1.8-1.3-3.1-3-3.1-.3 0-.6 0-.8.1.4-1.6 1.6-2.9 3.2-3.6Z"/>', s),
  ring: (s = 16) =>
    svg('<circle cx="12" cy="14.5" r="6"/><path d="m9 6 3-3 3 3-3 2.5Z"/>', s),
  replay: (s = 16) =>
    svg('<path d="M3.5 12a8.5 8.5 0 1 1 2.8 6.3"/><path d="M3 7.5v5h5"/>', s),
};
