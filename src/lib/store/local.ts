import type { Attendance, InvitationStore, RsvpEntry, WishEntry } from '@/types/invitation';

const RSVP_KEY = 'undangan:rsvp';
const WISH_KEY = 'undangan:wishes';

const SEED: WishEntry[] = [
  {
    id: 'seed-1',
    name: 'Keluarga Bapak Hendra',
    message: 'Barakallahu lakuma wa baraka alaikuma wa jama’a bainakuma fi khair. Selamat menempuh hidup baru!',
    attendance: 'hadir',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
  },
  {
    id: 'seed-2',
    name: 'Dinda & Farhan',
    message: 'Akhirnya! Selamat ya kalian berdua. Semoga jadi keluarga sakinah, mawaddah, warahmah.',
    attendance: 'hadir',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
  {
    id: 'seed-3',
    name: 'Tim Studio Cikutra',
    message: 'Maaf belum bisa hadir karena di luar kota, tapi doa terbaik selalu menyertai kalian.',
    attendance: 'tidak-hadir',
    createdAt: new Date(Date.now() - 1000 * 60 * 48).toISOString(),
  },
];

function read<T>(key: string, fallback: T[]): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as T[];
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage penuh / private mode — abaikan */
  }
}

const uid = (): string =>
  (crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`);

/**
 * Penyimpanan lokal (browser).
 * Dipakai saat variabel Supabase belum diisi — undangan tetap bisa didemokan
 * tanpa backend, meskipun data tidak terkirim ke mempelai.
 */
export class LocalStore implements InvitationStore {
  async submitRsvp(input: Omit<RsvpEntry, 'id' | 'createdAt'>): Promise<RsvpEntry> {
    const entry: RsvpEntry = { ...input, id: uid(), createdAt: new Date().toISOString() };
    write(RSVP_KEY, [entry, ...read<RsvpEntry>(RSVP_KEY, [])]);
    return entry;
  }

  async submitWish(input: Omit<WishEntry, 'id' | 'createdAt'>): Promise<WishEntry> {
    const entry: WishEntry = { ...input, id: uid(), createdAt: new Date().toISOString() };
    write(WISH_KEY, [entry, ...read<WishEntry>(WISH_KEY, [])]);
    return entry;
  }

  async listWishes(limit = 50): Promise<WishEntry[]> {
    const stored = read<WishEntry>(WISH_KEY, []);
    return [...stored, ...SEED].slice(0, limit);
  }

  async countAttendance(): Promise<Record<Attendance, number>> {
    const all = read<RsvpEntry>(RSVP_KEY, []);
    const base: Record<Attendance, number> = { hadir: 0, 'tidak-hadir': 0, ragu: 0 };
    for (const item of all) base[item.attendance] += 1;
    return base;
  }
}
