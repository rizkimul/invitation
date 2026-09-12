import { html, type RawHtml } from '@/lib/dom';
import { picture } from '@/lib/image';
import { orderedCouple } from '@/lib/couple';
import type { InvitationConfig, Person } from '@/types/invitation';
import { icons } from './icons';
import { sectionHead, title } from './section';

/**
 * Potret mempelai sebagai bidang foto lebar penuh dengan teks di atasnya —
 * bukan kartu kaca.
 *
 * Foto-nya dibuat berasio ~0.60 dengan ruang kosong di satu sisi, supaya
 * nama dan silsilah punya tempat berdiri tanpa menutupi wajah. Gradien gelap
 * di bagian bawah yang menjaga teks putih tetap terbaca, bukan panel kaca.
 */
function personFeature(person: Person, label: string, delay: number): RawHtml {
  return html`
    <article class="relative overflow-hidden" data-reveal="blur" style="--reveal-delay:${delay}ms">
      <div class="relative w-full" style="aspect-ratio:${person.photo.ratio}">
        ${picture(person.photo, {
          className: 'absolute inset-0 h-full w-full object-cover',
          sizes: '(min-width:1024px) 33rem, 100vw',
        })}

        <!-- Gradien pengikat teks: pekat di bawah, bersih di area wajah. -->
        <div
          class="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(28,31,38,.28)_0%,transparent_26%,transparent_42%,rgba(28,31,38,.62)_70%,rgba(28,31,38,.92)_100%)]"
        ></div>

        <div class="absolute inset-x-0 bottom-0 px-7 pb-14">
          <p class="t-display-it t-on-photo text-[1.05rem] text-white/85">${label}</p>

          <h3 class="t-display t-on-photo mt-1.5 text-[clamp(1.6rem,7.2vw,2.05rem)] leading-[1.12] text-balance">
            ${person.fullName}
          </h3>

          <p class="t-on-photo mt-3.5 text-[.8rem] leading-[1.65] text-white/75">
            ${person.childOrder} dari<br />
            ${person.fatherName} &amp; ${person.motherName}
          </p>

          ${person.instagram
            ? html`<a
                class="btn btn-light mt-5 !px-4 !py-2 !text-[.625rem]"
                href="https://instagram.com/${person.instagram}"
                target="_blank"
                rel="noopener noreferrer"
              >
                ${icons.instagram(13)} <span>@${person.instagram}</span>
              </a>`
            : ''}
        </div>
      </div>
    </article>
  `;
}

export function Couple(config: InvitationConfig): RawHtml {
  const { first, second, firstLabel, secondLabel } = orderedCouple(config);

  return html`
    <section id="mempelai" data-bg="2" class="relative">
      <div class="panel !pb-0">
        <div class="glass px-6 py-8">
          ${sectionHead('Mempelai')} ${title('Dua orang, satu', 'perjalanan baru')}
        </div>
      </div>

      <div class="mt-6 space-y-6">
        ${personFeature(first, firstLabel, 0)}

        <div class="flex justify-center" data-reveal="fade">
          <span
            class="glass-dark flex h-14 w-14 items-center justify-center !rounded-full text-[1.5rem] leading-none"
            aria-hidden="true"
          >
            <span class="t-display-it text-white/90">&amp;</span>
          </span>
        </div>

        ${personFeature(second, secondLabel, 60)}
      </div>
    </section>
  `;
}
