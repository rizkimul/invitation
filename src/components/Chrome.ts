import { $, $$, delegate, html, type RawHtml } from '@/lib/dom';
import type { BackgroundAudio } from '@/lib/audio';
import type { InvitationConfig } from '@/types/invitation';
import { shareInvitation } from '@/lib/ui';
import { invitationUrl } from '@/lib/guest';
import { icons } from './icons';
import { orderedCouple } from '@/lib/couple';

interface NavItem {
  id: string;
  label: string;
  icon: (size?: number) => ReturnType<typeof icons.pin>;
}

const NAV: NavItem[] = [
  { id: 'beranda', label: 'Beranda', icon: icons.ring },
  { id: 'mempelai', label: 'Mempelai', icon: icons.user },
  { id: 'acara', label: 'Acara', icon: icons.calendar },
  { id: 'galeri', label: 'Galeri', icon: icons.image },
  { id: 'rsvp', label: 'RSVP', icon: icons.chat },
  { id: 'hadiah', label: 'Hadiah', icon: icons.gift },
];

const CONTROL =
  'pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full border border-white/45 bg-white/20 text-white backdrop-blur-[10px] transition-colors hover:bg-white hover:text-[var(--color-ink)]';

/** Dock mengambang berbentuk pil kaca — tidak menempel penuh ke tepi layar. */
export function Chrome(config: InvitationConfig): RawHtml {
  return html`
    <div
      id="floating-controls"
      class="pointer-events-none fixed left-1/2 top-4 z-[75] flex w-full max-w-[30rem] -translate-x-1/2 justify-end gap-2 px-5 opacity-0 transition-opacity duration-700 lg:max-w-[33rem]"
    >
      ${config.music.enabled
        ? html`<button
            id="music-toggle"
            type="button"
            class="${CONTROL}"
            aria-label="Putar atau hentikan musik"
            aria-pressed="false"
          >
            <span data-music-on class="hidden animate-[spin_5s_linear_infinite]">${icons.music(16)}</span>
            <span data-music-off>${icons.mute(16)}</span>
          </button>`
        : ''}

      <button id="share-btn" type="button" class="${CONTROL}" aria-label="Bagikan undangan">
        ${icons.share(16)}
      </button>
    </div>

    <nav
      id="dock"
      class="fixed bottom-4 left-1/2 z-[74] w-[min(26rem,calc(100%-2rem))] -translate-x-1/2 translate-y-[calc(100%+2rem)] rounded-full border border-white/40 bg-[rgba(247,248,249,.62)] shadow-[0_18px_50px_-20px_rgba(20,22,28,.7)] backdrop-blur-[18px] transition-transform duration-700 [transition-timing-function:var(--ease-glass)]"
      style="margin-bottom:env(safe-area-inset-bottom)"
      aria-label="Navigasi bagian undangan"
    >
      <ul class="grid grid-cols-6">
        ${NAV.map(
          (item) => html`
            <li>
              <button
                type="button"
                data-nav="${item.id}"
                class="flex w-full flex-col items-center gap-1 py-2.5 text-[var(--color-ink-4)] transition-colors"
                aria-label="${item.label}"
              >
                ${item.icon(17)}
                <span class="t-label !text-[.4375rem] !tracking-[.08em] !text-current">${item.label}</span>
              </button>
            </li>
          `,
        )}
      </ul>
    </nav>
  `;
}

export function mountChrome(config: InvitationConfig, audio: BackgroundAudio | null): void {
  const dock = $('#dock');
  const controls = $('#floating-controls');

  document.addEventListener('invitation:open', () => {
    dock?.classList.remove('translate-y-[calc(100%+2rem)]');
    controls?.classList.remove('opacity-0');
  });

  delegate(document.body, 'click', '[data-nav]', (el) => {
    const id = el.dataset['nav'];
    if (id) $(`#${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  const sections = NAV.map((item) => $(`#${item.id}`)).filter(Boolean) as HTMLElement[];
  if (sections.length) {
    const spy = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const id = entry.target.id;
          $$('[data-nav]').forEach((btn) => {
            btn.classList.toggle('!text-[var(--color-denim)]', btn.dataset['nav'] === id);
          });
        }
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    sections.forEach((section) => spy.observe(section));
  }

  const musicBtn = $<HTMLButtonElement>('#music-toggle');
  if (musicBtn && audio) {
    const sync = () => {
      const playing = audio.isPlaying;
      musicBtn.setAttribute('aria-pressed', String(playing));
      $('[data-music-on]', musicBtn)?.classList.toggle('hidden', !playing);
      $('[data-music-off]', musicBtn)?.classList.toggle('hidden', playing);
    };
    musicBtn.addEventListener('click', async () => {
      if (audio.isPlaying) audio.pause();
      else await audio.play();
      setTimeout(sync, 60);
    });
    document.addEventListener('invitation:open', () => setTimeout(sync, 400));
  }

  $('#share-btn')?.addEventListener('click', () => {
    const { pairTitle } = orderedCouple(config);
    void shareInvitation({
      title: `Undangan Pernikahan ${pairTitle}`,
      text: `${pairTitle} — ${config.mainDateLabel}`,
      url: invitationUrl(config.siteUrl),
    });
  });
}
