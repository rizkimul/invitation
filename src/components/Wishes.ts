import { $, escapeHtml, html, raw, type RawHtml } from '@/lib/dom';
import { observeNew } from '@/lib/reveal';
import { getStore } from '@/lib/store';
import { relativeTime, toast } from '@/lib/ui';
import type { Attendance, InvitationConfig, WishEntry } from '@/types/invitation';
import { icons } from './icons';
import { sectionHead, title } from './section';

const BADGE: Record<Attendance, string> = {
  hadir: 'Hadir',
  ragu: 'Ragu',
  'tidak-hadir': 'Berhalangan',
};

export function Wishes(config: InvitationConfig, guestName: string): RawHtml {
  if (!config.wishes.enabled) return raw('');

  return html`
    <section id="ucapan" data-bg="8" class="panel">
      <div class="glass glass-sheen px-6 py-8">
        ${sectionHead('Buku Ucapan')} ${title('Doa &', 'restu')}

        <p class="t-body mt-4 text-[.86rem] leading-[1.85]" data-reveal="up" style="--reveal-delay:80ms">
          Tinggalkan pesan, doa, atau sekadar sapa. Setiap kata akan kami simpan.
        </p>

        <form id="wish-form" class="mt-6 space-y-4" novalidate data-reveal="up" style="--reveal-delay:140ms">
          <input
            id="wish-name"
            name="name"
            type="text"
            class="field"
            placeholder="Nama Anda"
            maxlength="80"
            required
            value="${guestName === config.defaultGuest ? '' : guestName}"
          />

          <div>
            <textarea
              id="wish-message"
              name="message"
              rows="4"
              class="field resize-none"
              placeholder="Tulis ucapan &amp; doa terbaik Anda…"
              maxlength="500"
              required
            ></textarea>
            <div class="mt-1 text-right">
              <span id="wish-counter" class="t-label !text-[.5rem] !text-[var(--color-ink-4)]">0 / 500</span>
            </div>
          </div>

          <button type="submit" class="btn w-full" id="wish-submit">
            ${icons.chat(14)} <span>Kirim Ucapan</span>
          </button>
        </form>
      </div>

      <div class="mt-4">
        <div class="mb-3 flex items-center justify-between px-2">
          <span class="t-label t-on-photo !text-[.5625rem] !text-white/80">Ucapan Masuk</span>
          <span id="wish-total" class="t-label t-on-photo !text-[.5625rem] !text-white/60">—</span>
        </div>

        <div id="wish-list" class="no-scrollbar max-h-[26rem] space-y-3 overflow-y-auto pb-1">
          <p class="t-label t-on-photo py-6 text-center !text-[.5625rem] !text-white/70">Memuat…</p>
        </div>
      </div>
    </section>
  `;
}

function wishItem(entry: WishEntry): string {
  const initial = escapeHtml(entry.name.trim().charAt(0).toUpperCase() || '?');
  return `
    <article class="glass glass-sheen flex gap-3.5 px-5 py-4" data-reveal="rise">
      <span class="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-[var(--color-ink)] text-[.85rem] text-[var(--color-frost)]" style="font-family:var(--font-display)">${initial}</span>
      <div class="min-w-0 flex-1">
        <div class="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
          <span class="text-[.86rem] font-medium text-[var(--color-ink)]">${escapeHtml(entry.name)}</span>
          ${
            entry.attendance
              ? `<span class="rounded-full bg-[rgba(70,83,107,.12)] px-2 py-0.5 text-[.5625rem] font-medium uppercase tracking-[.08em] text-[var(--color-denim)]">${BADGE[entry.attendance]}</span>`
              : ''
          }
          <span class="ml-auto text-[.625rem] text-[var(--color-ink-4)]">${relativeTime(entry.createdAt)}</span>
        </div>
        <p class="t-body mt-1.5 text-[.84rem] leading-[1.75] break-words">${escapeHtml(entry.message)}</p>
      </div>
    </article>
  `;
}

export async function mountWishes(): Promise<void> {
  const form = $<HTMLFormElement>('#wish-form');
  const list = $('#wish-list');
  const total = $('#wish-total');
  if (!form || !list) return;

  const store = await getStore();

  const textarea = $<HTMLTextAreaElement>('#wish-message');
  const counter = $('#wish-counter');
  textarea?.addEventListener('input', () => {
    if (counter) counter.textContent = `${textarea.value.length} / 500`;
  });

  const render = (entries: WishEntry[]) => {
    if (!entries.length) {
      list.innerHTML = `<p class="t-label t-on-photo py-6 text-center !text-[.5625rem] !text-white/70">Jadilah yang pertama mengirim ucapan</p>`;
    } else {
      list.innerHTML = entries.map(wishItem).join('');
      list.querySelectorAll('[data-reveal]').forEach((el) => observeNew(el));
    }
    if (total) total.textContent = String(entries.length).padStart(2, '0');
  };

  try {
    render(await store.listWishes(60));
  } catch (error) {
    console.error(error);
    list.innerHTML = `<p class="t-label t-on-photo py-6 text-center !text-[.5625rem] !text-white/70">Gagal memuat ucapan</p>`;
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const name = String(data.get('name') ?? '').trim();
    const message = String(data.get('message') ?? '').trim();

    if (name.length < 2 || message.length < 3) {
      toast('Nama dan ucapan wajib diisi', 'error');
      return;
    }

    const attendanceInput = $<HTMLInputElement>('#rsvp-form input[name="attendance"]:checked');
    const attendance = (attendanceInput?.value as Attendance | undefined) ?? null;

    const button = $<HTMLButtonElement>('#wish-submit');
    if (button) button.disabled = true;

    try {
      await store.submitWish({ name, message, attendance });
      toast('Terima kasih atas doanya');
      form.reset();
      if (counter) counter.textContent = '0 / 500';
      render(await store.listWishes(60));
      list.scrollTop = 0;
    } catch (error) {
      console.error(error);
      toast('Gagal mengirim ucapan', 'error');
    } finally {
      if (button) button.disabled = false;
    }
  });
}
