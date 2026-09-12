import { delegate, html, raw, type RawHtml } from '@/lib/dom';
import { copyText, formatNumber, toast } from '@/lib/ui';
import type { BankAccount, InvitationConfig } from '@/types/invitation';
import { icons } from './icons';
import { sectionHead, title } from './section';

function accountCard(account: BankAccount, index: number): RawHtml {
  return html`
    <div class="glass glass-sheen px-5 py-5" data-reveal="rise" style="--reveal-delay:${index * 70}ms">
      <div class="flex items-start justify-between gap-4">
        <div class="min-w-0">
          <p class="t-label !text-[.5625rem]">${account.bank}</p>
          <p class="t-display mt-1.5 text-[1.15rem] tracking-[.04em] text-[var(--color-ink)]">
            ${formatNumber(account.number)}
          </p>
          <!-- Nama pemilik dinaikkan bobotnya. Dua rekening di bank yang sama
               berarti label banknya kembar; yang membedakan tinggal nama ini,
               jadi ia tidak boleh jadi baris paling redup di kartu. -->
          <p class="mt-1 text-[.83rem] font-medium text-[var(--color-ink-2)]">a.n. ${account.holder}</p>
        </div>
        <button
          type="button"
          class="btn !h-10 !w-10 flex-none !rounded-full !p-0"
          data-copy="${account.number}"
          aria-label="Salin nomor ${account.bank}"
        >
          ${icons.copy(15)}
        </button>
      </div>
    </div>
  `;
}

export function Gift(config: InvitationConfig): RawHtml {
  if (!config.gift.enabled) return raw('');
  const { gift } = config;

  return html`
    <section id="hadiah" data-bg="9" class="panel">
      <div class="glass mb-4 px-6 py-8">
        ${sectionHead('Tanda Kasih')} ${title('Amplop', 'digital')}
        <p class="t-body mt-4 text-[.86rem] leading-[1.85]" data-reveal="up" style="--reveal-delay:80ms">
          ${gift.intro}
        </p>
      </div>

      <div class="space-y-3">
        ${gift.accounts.map((account, index) => accountCard(account, index))}
        ${gift.eWallets.map((wallet, index) => accountCard(wallet, gift.accounts.length + index))}
      </div>

      <p class="t-label t-on-photo mt-6 text-center !text-[.5625rem] !leading-[1.9] !text-white/75" data-reveal="up">
        Kehadiran dan doa Anda sudah lebih dari cukup bagi kami
      </p>
    </section>
  `;
}

export function mountGift(): void {
  delegate(document.body, 'click', '[data-copy]', async (el) => {
    const value = el.dataset['copy'] ?? '';
    if (!value) return;
    const ok = await copyText(value);
    toast(ok ? 'Berhasil disalin' : 'Gagal menyalin', ok ? 'default' : 'error');

    if (ok && !el.textContent?.trim()) {
      const original = el.innerHTML;
      el.innerHTML = String(icons.check(15));
      setTimeout(() => (el.innerHTML = original), 1600);
    }
  });
}
