import { $, html, lockScroll } from '@/lib/dom';
import { initReveal } from '@/lib/reveal';
import { BackgroundAudio } from '@/lib/audio';
import { getGuestName } from '@/lib/guest';
import { orderedCouple } from '@/lib/couple';
import { mountVideos } from '@/lib/video';
import { mountDust } from '@/lib/particles';
import config from '@/config/invitation.config';

import { Stage, Dust, mountStage } from '@/components/Stage';
import { Cover, coverStyles } from '@/components/Cover';
import { Hero } from '@/components/Hero';
import { Quote } from '@/components/Quote';
import { Couple } from '@/components/Couple';
import { Countdown, mountCountdown } from '@/components/Countdown';
import { Events } from '@/components/Events';
import { Story } from '@/components/Story';
import { Interlude } from '@/components/Interlude';
import { Gallery, mountGallery } from '@/components/Gallery';
import { Rsvp, mountRsvp } from '@/components/Rsvp';
import { Wishes, mountWishes } from '@/components/Wishes';
import { Gift, mountGift } from '@/components/Gift';
import { Closing } from '@/components/Closing';
import { Chrome, mountChrome } from '@/components/Chrome';

export function bootstrap(root: HTMLElement): void {
  const guestName = getGuestName(config.defaultGuest);
  document.title = `${orderedCouple(config).pairTitle} — Undangan Pernikahan`;

  root.innerHTML = String(html`
    ${coverStyles} ${Cover(config, guestName)} ${Stage(config)} ${Dust(config)}

    <div class="shell pb-28">
      <main id="invitation" class="relative">
        ${Hero(config)} ${Quote(config)} ${Couple(config)} ${Countdown(config)} ${Events(config)}
        ${Story(config)} ${Interlude(config)} ${Gallery(config)} ${Rsvp(config, guestName)} ${Wishes(config, guestName)}
        ${Gift(config)} ${Closing(config)}
      </main>
    </div>

    ${Chrome(config)}
  `);

  lockScroll(true);

  const audio = config.music.enabled ? new BackgroundAudio(config.music.src) : null;
  audio?.init();

  mountCover(audio);
  mountChrome(config, audio);
  mountStage();
  mountDust({ density: config.particles?.density ?? 1 });
  mountVideos();
  mountGallery(config);
  mountGift();
  mountCountdown(config);

  initReveal();

  void mountRsvp();
  void mountWishes();
}

function mountCover(audio: BackgroundAudio | null): void {
  const cover = $('#cover');
  const button = $<HTMLButtonElement>('#open-invitation');
  if (!cover || !button) return;

  button.addEventListener(
    'click',
    async () => {
      cover.classList.add('is-open');
      lockScroll(false);
      window.scrollTo({ top: 0, behavior: 'auto' });

      void audio?.play();
      document.dispatchEvent(new CustomEvent('invitation:open'));

      setTimeout(() => {
        cover.style.visibility = 'hidden';
        cover.setAttribute('aria-hidden', 'true');
      }, 1300);
    },
    { once: true },
  );
}
