/**
 * Pemutar musik latar.
 *
 * Autoplay di peramban modern hanya diizinkan setelah interaksi pengguna,
 * jadi pemutaran pertama dimulai saat tamu menekan "Buka Undangan".
 *
 * Hal-hal yang ditangani di sini karena berbeda antar-peramban HP:
 *
 * - **Volume di iOS tidak bisa diatur.** Safari iOS mengabaikan
 *   `audio.volume` — nilainya selalu 1. Fade lama menunggu volume mencapai
 *   target, dan di iOS itu tidak pernah terjadi: timer fade berjalan tanpa
 *   henti dan `pause()` tidak pernah benar-benar menjeda lagu. Sekarang
 *   kemampuan itu dideteksi dulu; bila tidak bisa, lagu langsung diputar
 *   atau dijeda tanpa fade. Kerasnya lagu sudah diturunkan di berkas MP3-nya
 *   sendiri, jadi volumenya sama di semua perangkat.
 *
 * - **Pemutaran bisa ditolak atau terputus.** Bila `play()` ditolak (belum
 *   ada interaksi yang dihitung, koneksi lambat), percobaan diulang pada
 *   ketukan berikutnya di mana pun di halaman. Saat tab disembunyikan
 *   (pindah ke WhatsApp, layar dikunci) lagu dijeda, lalu dilanjutkan
 *   ketika tamu kembali.
 *
 * - **Status diambil dari event media, bukan tebakan waktu.** Tombol musik
 *   berlangganan lewat `onChange`, sehingga tampilannya selalu sesuai
 *   keadaan sebenarnya — termasuk ketika sistem sendiri yang menjeda lagu
 *   (telepon masuk, headset dicabut).
 */

type Listener = (playing: boolean) => void;

/** Safari iOS: properti volume hanya-baca, nilai yang diset diabaikan. */
function canControlVolume(): boolean {
  try {
    const probe = new Audio();
    probe.volume = 0.5;
    return Math.abs(probe.volume - 0.5) < 0.01;
  } catch {
    return false;
  }
}

const FADE_STEP_MS = 26;
const FADE_STEPS = 18;

export class BackgroundAudio {
  private el: HTMLAudioElement | null = null;
  private listeners = new Set<Listener>();
  private fadeTimer: number | null = null;
  private readonly fadable = canControlVolume();
  /** Keinginan tamu: diputar atau tidak. Beda dari `paused` saat sedang fade. */
  private wanted = false;
  /** Dijeda otomatis karena tab disembunyikan — lanjutkan saat kembali. */
  private resumeOnReturn = false;
  private retryArmed = false;

  constructor(
    private src: string,
    private volume = 1,
  ) {}

  init(): void {
    if (this.el) return;
    const audio = new Audio();
    audio.src = this.src;
    audio.loop = true;
    audio.preload = 'auto';
    if (this.fadable) audio.volume = 0;

    const emit = () => this.emit();
    audio.addEventListener('playing', emit);
    audio.addEventListener('pause', emit);
    audio.addEventListener('ended', emit);

    document.addEventListener('visibilitychange', () => this.onVisibility());
    this.el = audio;
  }

  /** Sedang berbunyi, atau sedang menuju berbunyi. */
  get isPlaying(): boolean {
    return this.wanted;
  }

  onChange(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  async play(): Promise<boolean> {
    this.init();
    const el = this.el!;
    this.wanted = true;
    this.resumeOnReturn = false;

    if (this.fadable && el.paused) el.volume = 0;
    try {
      await el.play();
    } catch {
      this.wanted = false;
      this.emit();
      this.armRetry();
      return false;
    }
    if (!this.wanted) return false; // dijeda lagi sebelum sempat berbunyi
    this.fadeTo(this.volume);
    // Bila lagu belum sempat berhenti (diketuk lagi di tengah fade keluar),
    // event `playing` tidak akan muncul — kabari pendengar secara langsung.
    this.emit();
    return true;
  }

  pause(): void {
    this.wanted = false;
    this.resumeOnReturn = false;
    const el = this.el;
    if (!el) return;
    if (!this.fadable) {
      this.stopFade();
      el.pause();
      return;
    }
    this.fadeTo(0, () => {
      if (!this.wanted) el.pause();
    });
  }

  toggle(): Promise<boolean> | void {
    return this.wanted ? this.pause() : this.play();
  }

  private emit(): void {
    const playing = this.wanted && !!this.el && !this.el.paused;
    for (const listener of this.listeners) listener(playing);
  }

  /**
   * Coba lagi pada ketukan berikutnya. `pointerdown`/`touchend` dihitung
   * sebagai aktivasi pengguna di Chrome dan Safari, jadi `play()` dari sana
   * diizinkan.
   */
  private armRetry(): void {
    if (this.retryArmed) return;
    this.retryArmed = true;
    const retry = (event: Event) => {
      this.retryArmed = false;
      document.removeEventListener('touchend', retry, true);
      document.removeEventListener('click', retry, true);
      // Ketukan pada tombol musik sudah menangani dirinya sendiri.
      if ((event.target as Element | null)?.closest?.('#music-toggle')) return;
      if (!this.wanted) void this.play();
    };
    document.addEventListener('touchend', retry, { capture: true, once: true });
    document.addEventListener('click', retry, { capture: true, once: true });
  }

  private onVisibility(): void {
    const el = this.el;
    if (!el) return;
    if (document.hidden) {
      if (this.wanted && !el.paused) {
        this.stopFade();
        el.pause();
        this.resumeOnReturn = true;
      }
    } else if (this.resumeOnReturn) {
      this.resumeOnReturn = false;
      void this.play();
    }
  }

  private stopFade(): void {
    if (this.fadeTimer) window.clearInterval(this.fadeTimer);
    this.fadeTimer = null;
  }

  /** Fade in/out agar transisi tidak kasar. Hanya dipakai bila volume bisa diatur. */
  private fadeTo(target: number, done?: () => void): void {
    const el = this.el;
    if (!el) return;
    this.stopFade();
    if (!this.fadable) {
      done?.();
      return;
    }
    const start = el.volume;
    let step = 0;
    this.fadeTimer = window.setInterval(() => {
      step++;
      const k = Math.min(1, step / FADE_STEPS);
      el.volume = Math.min(1, Math.max(0, start + (target - start) * k));
      if (k >= 1) {
        this.stopFade();
        done?.();
      }
    }, FADE_STEP_MS);
  }
}
