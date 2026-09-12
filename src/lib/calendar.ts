import type { EventItem, VenueInfo } from '@/types/invitation';

const toUtcStamp = (iso: string): string =>
  new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

export function googleCalendarUrl(event: EventItem, coupleTitle: string, venue: VenueInfo): string {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `${event.title} — ${coupleTitle}`,
    dates: `${toUtcStamp(event.startISO)}/${toUtcStamp(event.endISO)}`,
    details: `${event.title} ${coupleTitle}\n${venue.name}\n${venue.address}`,
    location: `${venue.name}, ${venue.address}`,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/** Membuat berkas .ics agar bisa disimpan ke Apple/Outlook Calendar. */
export function downloadIcs(event: EventItem, coupleTitle: string, venue: VenueInfo): void {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Undangan Editorial Vintage//ID',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${event.id}-${Date.now()}@undangan`,
    `DTSTAMP:${toUtcStamp(new Date().toISOString())}`,
    `DTSTART:${toUtcStamp(event.startISO)}`,
    `DTEND:${toUtcStamp(event.endISO)}`,
    `SUMMARY:${escapeIcs(`${event.title} — ${coupleTitle}`)}`,
    `LOCATION:${escapeIcs(`${venue.name}, ${venue.address}`)}`,
    `DESCRIPTION:${escapeIcs(event.note ?? '')}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ];

  const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${event.id}-${coupleTitle.toLowerCase().replace(/\s+/g, '-')}.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function escapeIcs(value: string): string {
  return value.replace(/[\\;,]/g, (m) => `\\${m}`).replace(/\n/g, '\\n');
}
