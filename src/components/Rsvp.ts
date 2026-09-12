import { $, html, raw, type RawHtml } from '@/lib/dom';
import { getStore, isRemoteStore } from '@/lib/store';
import { toast } from '@/lib/ui';
import type { Attendance, InvitationConfig } from '@/types/invitation';
import { icons } from './icons';
import { sectionHead, title } from './section';

const OPTIONS: Array<{ value: Attendance; label: string }> = [
  { value: 'hadir', label: 'Hadir' },
  { value: 'ragu', label: 'Ragu' },
  { value: 'tidak-hadir', label: 'Berhalangan' },
];

export function Rsvp(config: InvitationConfig, guestName: string): RawHtml {
  if (!config.rsvp.enabled) return raw('');

  return html`
    <section id="rsvp" data-bg="7" class="panel">
      <div class="glass glass-sheen px-6 py-8">
        ${sectionHead('Konfirmasi Kehadiran')} ${title('Akan hadir', 'bersama kami?')}

        <p class="t-body mt-4 text-[.86rem] leading-[1.85]" data-reveal="up" style="--reveal-delay:80ms">
          Mohon konfirmasi paling lambat
          <span class="font-medium text-[var(--color-denim)]">${config.rsvp.deadlineLabel}</span>
          agar kami dapat menyiapkan tempat dengan baik.
        </p>

        <form id="rsvp-form" class="mt-7 space-y-5" novalidate data-reveal="up" style="--reveal-delay:140ms">
          <div>
            <label class="t-label !text-[.5625rem]" for="rsvp-name">Nama</label>
            <input
              id="rsvp-name"
              name="name"
              type="text"
              class="field mt-2"
              placeholder="Nama Anda / keluarga"
              required
              maxlength="80"
              value="${guestName === config.defaultGuest ? '' : guestName}"
              autocomplete="name"
            />
          </div>

          <fieldset>
            <legend class="t-label !text-[.5625rem]">Kehadiran</legend>
            <div class="mt-2 grid grid-cols-3 gap-2">
              ${OPTIONS.map(
                (option, index) => html`
                  <label class="radio-card relative">
                    <input type="radio" name="attendance" value="${option.value}" ${index === 0 ? 'checked' : ''} />
                    <span>${option.label}</span>
                  </label>
                `,
              )}
            </div>
          </fieldset>

          <div id="rsvp-count-wrap">
            <label class="t-label !text-[.5625rem]" for="rsvp-count">Jumlah Tamu</label>
            <select id="rsvp-count" name="guestCount" class="field mt-2">
              ${Array.from({ length: config.rsvp.maxGuests }, (_, i) => i + 1).map(
                (n) => html`<option value="${n}">${n} orang</option>`,
              )}
            </select>
          </div>

          <button type="submit" class="btn btn-solid w-full" id="rsvp-submit">
            ${icons.check(14)} <span>Kirim Konfirmasi</span>
          </button>

          <!-- Catatan hanya muncul bila konfirmasi benar-benar terkirim ke
               mempelai. Pada mode lokal tidak ada catatan sama sekali: kalimat
               "mode demo" itu bahasa pengembang, bukan bahasa tamu undangan. -->
          ${isRemoteStore()
            ? html`<p class="t-label !text-[.5rem] !tracking-[.08em] !normal-case !text-[var(--color-ink-4)]">
                Konfirmasi dikirim langsung ke mempelai.
              </p>`
            : ''}
        </form>

        <div id="rsvp-summary" class="mt-7 grid grid-cols-3 gap-2" data-reveal="up">
          ${OPTIONS.map(
            (option) => html`
              <div class="rounded-2xl border border-[rgba(34,37,44,.12)] bg-white/40 py-4 text-center">
                <p class="t-display text-[1.45rem] text-[var(--color-ink)]" data-summary="${option.value}">0</p>
                <p class="t-label mt-0.5 !text-[.5rem] !tracking-[.1em]">${option.label}</p>
              </div>
            `,
          )}
        </div>
      </div>
    </section>
  `;
}

export async function mountRsvp(): Promise<void> {
  const form = $<HTMLFormElement>('#rsvp-form');
  if (!form) return;

  const store = await getStore();
  const countWrap = $('#rsvp-count-wrap');

  const refreshSummary = async () => {
    const counts = await store.countAttendance();
    for (const [key, value] of Object.entries(counts)) {
      const node = $(`[data-summary="${key}"]`);
      if (node) node.textContent = String(value);
    }
  };

  form.addEventListener('change', (event) => {
    const target = event.target as HTMLInputElement;
    if (target.name !== 'attendance') return;
    countWrap?.classList.toggle('hidden', target.value === 'tidak-hadir');
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const name = String(data.get('name') ?? '').trim();
    const attendance = (data.get('attendance') as Attendance) ?? 'hadir';
    const guestCount = attendance === 'tidak-hadir' ? 0 : Number(data.get('guestCount') ?? 1);

    if (name.length < 2) {
      toast('Mohon isi nama Anda', 'error');
      $<HTMLInputElement>('#rsvp-name')?.focus();
      return;
    }

    const button = $<HTMLButtonElement>('#rsvp-submit');
    if (button) button.disabled = true;

    try {
      await store.submitRsvp({ name, attendance, guestCount });
      toast(attendance === 'tidak-hadir' ? 'Terima kasih atas kabarnya' : 'Terima kasih, sampai jumpa!');
      await refreshSummary();
      $('#ucapan')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      const wishName = $<HTMLInputElement>('#wish-name');
      if (wishName && !wishName.value) wishName.value = name;
    } catch (error) {
      console.error(error);
      toast('Gagal mengirim, coba lagi', 'error');
    } finally {
      if (button) button.disabled = false;
    }
  });

  await refreshSummary();
}
