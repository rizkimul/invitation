/**
 * Pemutar musik latar.
 * Autoplay browser modern hanya diizinkan setelah interaksi pengguna —
 * karena itu pemutaran dimulai saat tamu menekan "Buka Undangan".
 */
export class BackgroundAudio {
  private el: HTMLAudioElement | null = null;
  private available = false;
  private fadeTimer: number | null = null;

  constructor(private src: string, private volume = 0.42) {}

  init(): void {
    const audio = new Audio(this.src);
    audio.loop = true;
    audio.preload = 'auto';
    audio.volume = 0;
    audio.addEventListener('canplaythrough', () => (this.available = true), { once: true });
    audio.addEventListener('error', () => (this.available = false), { once: true });
    this.el = audio;
  }

  get isPlaying(): boolean {
    return !!this.el && !this.el.paused;
  }

  get isAvailable(): boolean {
    return this.available;
  }

  async play(): Promise<boolean> {
    if (!this.el) this.init();
    try {
      await this.el!.play();
      this.fadeTo(this.volume);
      return true;
    } catch {
      return false;
    }
  }

  pause(): void {
    if (!this.el) return;
    this.fadeTo(0, () => this.el?.pause());
  }

  toggle(): Promise<boolean> | void {
    return this.isPlaying ? this.pause() : this.play();
  }

  /** Fade in/out agar transisi tidak kasar. */
  private fadeTo(target: number, done?: () => void): void {
    if (!this.el) return;
    if (this.fadeTimer) window.clearInterval(this.fadeTimer);
    const step = (target - this.el.volume) / 18;
    this.fadeTimer = window.setInterval(() => {
      if (!this.el) return;
      const next = this.el.volume + step;
      const finished = step > 0 ? next >= target : next <= target;
      this.el.volume = Math.min(1, Math.max(0, finished ? target : next));
      if (finished) {
        window.clearInterval(this.fadeTimer!);
        this.fadeTimer = null;
        done?.();
      }
    }, 26);
  }
}
