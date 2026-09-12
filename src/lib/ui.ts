/** Notifikasi ringkas ala toast, bergaya kertas. */
let host: HTMLElement | null = null;

export function toast(message: string, tone: 'default' | 'error' = 'default'): void {
  if (!host) {
    host = document.createElement('div');
    host.className = 'fixed inset-x-0 bottom-24 z-[80] flex justify-center px-6 pointer-events-none';
    document.body.appendChild(host);
  }

  const item = document.createElement('div');
  item.setAttribute('role', 'status');
  item.className =
    'pointer-events-auto max-w-[26rem] border px-4 py-3 text-center transition-all duration-500 ' +
    (tone === 'error'
      ? 'border-[color-mix(in_srgb,var(--color-clay)_55%,transparent)] bg-[var(--color-paper)] text-[var(--color-clay)]'
      : 'border-[var(--color-ink)] bg-[var(--color-ink)] text-[var(--color-paper)]');
  item.style.cssText += 'font-family:var(--font-mono);font-size:.6875rem;letter-spacing:.14em;text-transform:uppercase;opacity:0;transform:translateY(10px)';
  item.textContent = message;
  host.appendChild(item);

  requestAnimationFrame(() => {
    item.style.opacity = '1';
    item.style.transform = 'translateY(0)';
  });

  setTimeout(() => {
    item.style.opacity = '0';
    item.style.transform = 'translateY(10px)';
    setTimeout(() => item.remove(), 550);
  }, 2600);
}

export async function copyText(value: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    // Fallback untuk konteks non-secure (http)
    const area = document.createElement('textarea');
    area.value = value;
    area.setAttribute('readonly', '');
    area.style.cssText = 'position:fixed;top:-1000px;opacity:0';
    document.body.appendChild(area);
    area.select();
    let ok = false;
    try {
      ok = document.execCommand('copy');
    } catch {
      ok = false;
    }
    area.remove();
    return ok;
  }
}

export async function shareInvitation(payload: { title: string; text: string; url: string }): Promise<void> {
  if (navigator.share) {
    try {
      await navigator.share(payload);
      return;
    } catch {
      /* dibatalkan pengguna — jatuh ke salin tautan */
    }
  }
  const ok = await copyText(payload.url);
  toast(ok ? 'Tautan undangan disalin' : 'Gagal menyalin tautan', ok ? 'default' : 'error');
}

export function formatNumber(value: string): string {
  return value.replace(/(\d{4})(?=\d)/g, '$1 ');
}

export function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'baru saja';
  if (min < 60) return `${min} menit lalu`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} jam lalu`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day} hari lalu`;
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}
