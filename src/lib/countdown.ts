export interface Remaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  done: boolean;
}

export function remainingTo(targetISO: string, now: number = Date.now()): Remaining {
  const diff = new Date(targetISO).getTime() - now;
  if (Number.isNaN(diff)) return { days: 0, hours: 0, minutes: 0, seconds: 0, done: true };
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, done: true };

  const seconds = Math.floor(diff / 1000);
  return {
    days: Math.floor(seconds / 86400),
    hours: Math.floor((seconds % 86400) / 3600),
    minutes: Math.floor((seconds % 3600) / 60),
    seconds: seconds % 60,
    done: false,
  };
}

export function startCountdown(targetISO: string, onTick: (value: Remaining) => void): () => void {
  const tick = () => onTick(remainingTo(targetISO));
  tick();
  const id = window.setInterval(tick, 1000);
  return () => window.clearInterval(id);
}

export const pad = (n: number): string => String(n).padStart(2, '0');
