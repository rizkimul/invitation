import type { InvitationStore } from '@/types/invitation';
import { LocalStore } from './local';

let instance: InvitationStore | null = null;

/**
 * Memilih backend secara otomatis:
 * - Jika VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY terisi → Supabase.
 * - Jika tidak → LocalStore (localStorage), sehingga demo tetap jalan.
 *
 * Supabase dimuat secara dinamis agar bundel awal tetap ringan.
 */
export async function getStore(): Promise<InvitationStore> {
  if (instance) return instance;

  const url = import.meta.env['VITE_SUPABASE_URL'] as string | undefined;
  const key = import.meta.env['VITE_SUPABASE_ANON_KEY'] as string | undefined;

  if (url && key) {
    try {
      const { SupabaseStore } = await import('./supabase');
      instance = new SupabaseStore(url, key);
      return instance;
    } catch (error) {
      console.warn('[undangan] Supabase gagal dimuat, memakai penyimpanan lokal.', error);
    }
  }

  instance = new LocalStore();
  return instance;
}

export const isRemoteStore = (): boolean =>
  Boolean(import.meta.env['VITE_SUPABASE_URL'] && import.meta.env['VITE_SUPABASE_ANON_KEY']);
