import { $, $$, delegate, html, type RawHtml } from '@/lib/dom';
import type { BackgroundAudio } from '@/lib/audio';
import type { InvitationConfig } from '@/types/invitation';
import { icons } from './icons';

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
            class="music-btn ${CONTROL}"
            data-state="paused"
            aria-label="Putar atau hentikan musik"
            aria-pressed="false"
          >
            <span data-music-on><span data-music-disc class="inline-flex">${icons.music(16)}</span></span>
            <span data-music-off>${icons.mute(16)}</span>
          </button>`
        : ''}
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

export function mountChrome(audio: BackgroundAudio | null): void {
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
  if (musicBtn && audio) mountMusicButton(musicBtn, audio);
}

/**
 * Tombol musik.
 *
 * Saat diputar, ikon not berputar pelan seperti piringan hitam. Saat dijeda,
 * putarannya tidak berhenti mendadak: ia melambat sampai diam (bersamaan
 * dengan volume yang memudar di BackgroundAudio), sebuah cincin tipis beriak
 * keluar dari tombol, lalu ikonnya berganti ke ikon bisu dengan sedikit
 * pantulan. Memutar lagi menjalankan kebalikannya.
 *
 * Putaran digerakkan lewat Web Animations API, bukan kelas CSS, supaya sudut
 * terakhirnya bisa dibaca — perlambatan dimulai dari sudut itu, bukan
 * melompat kembali ke 0°.
 */
const SPIN_MS = 5000;
const SETTLE_MS = 900;

function mountMusicButton(button: HTMLButtonElement, audio: BackgroundAudio): void {
  const disc = $('[data-music-disc]', button);
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let spin: Animation | null = null;
  let settle: Animation | null = null;
  let angle = 0;

  const setState = (playing: boolean): void => {
    button.dataset['state'] = playing ? 'playing' : 'paused';
    button.setAttribute('aria-pressed', String(playing));
  };

  const pulse = (): void => {
    if (reduceMotion) return;
    button.classList.remove('is-pulse');
    void button.offsetWidth; // mulai ulang animasi riak
    button.classList.add('is-pulse');
  };
  button.addEventListener('animationend', () => button.classList.remove('is-pulse'));

  const startSpin = (): void => {
    if (reduceMotion || !disc || spin) return;
    settle?.cancel();
    settle = null;
    spin = disc.animate([{ transform: `rotate(${angle}deg)` }, { transform: `rotate(${angle + 360}deg)` }], {
      duration: SPIN_MS,
      iterations: Infinity,
    });
  };

  /** Memperlambat putaran sampai berhenti. Mengembalikan lamanya (ms). */
  const settleSpin = (): number => {
    if (!spin || !disc) return 0;
    const elapsed = Number(spin.currentTime ?? 0) % SPIN_MS;
    angle = (angle + (elapsed / SPIN_MS) * 360) % 360;
    spin.cancel();
    spin = null;
    const end = angle + 140;
    settle = disc.animate([{ transform: `rotate(${angle}deg)` }, { transform: `rotate(${end}deg)` }], {
      duration: SETTLE_MS,
      easing: 'cubic-bezier(.15,.6,.3,1)',
      fill: 'forwards',
    });
    angle = end % 360;
    return SETTLE_MS;
  };

  // Tampilan mengikuti event media dari BackgroundAudio, bukan tebakan waktu.
  // Saat dijeda lewat tombol, perlambatan putaran sudah dimulai di handler
  // klik; event `pause` (yang datang setelah volume selesai memudar) tinggal
  // mengganti ikonnya. Saat dijeda oleh sistem, perlambatan dimulai di sini.
  audio.onChange((playing) => {
    if (playing) {
      setState(true);
      startSpin();
    } else {
      if (spin) settleSpin();
      setState(false);
    }
  });

  button.addEventListener('click', () => {
    pulse();
    if (audio.isPlaying) {
      settleSpin();
      audio.pause();
    } else {
      void audio.play();
    }
  });
}
