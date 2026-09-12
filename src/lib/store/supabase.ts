import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Attendance, InvitationStore, RsvpEntry, WishEntry } from '@/types/invitation';

/**
 * Adapter Supabase.
 * Skema tabel ada di README (bagian "Backend opsional").
 */
export class SupabaseStore implements InvitationStore {
  private client: SupabaseClient;

  constructor(url: string, anonKey: string) {
    this.client = createClient(url, anonKey, { auth: { persistSession: false } });
  }

  async submitRsvp(input: Omit<RsvpEntry, 'id' | 'createdAt'>): Promise<RsvpEntry> {
    const { data, error } = await this.client
      .from('rsvp')
      .insert({ name: input.name, attendance: input.attendance, guest_count: input.guestCount })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return mapRsvp(data);
  }

  async submitWish(input: Omit<WishEntry, 'id' | 'createdAt'>): Promise<WishEntry> {
    const { data, error } = await this.client
      .from('wishes')
      .insert({ name: input.name, message: input.message, attendance: input.attendance })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return mapWish(data);
  }

  async listWishes(limit = 50): Promise<WishEntry[]> {
    const { data, error } = await this.client
      .from('wishes')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw new Error(error.message);
    return (data ?? []).map(mapWish);
  }

  async countAttendance(): Promise<Record<Attendance, number>> {
    const base: Record<Attendance, number> = { hadir: 0, 'tidak-hadir': 0, ragu: 0 };
    const { data, error } = await this.client.from('rsvp').select('attendance');
    if (error) return base;
    for (const row of data ?? []) {
      const key = (row as { attendance: Attendance }).attendance;
      if (key in base) base[key] += 1;
    }
    return base;
  }
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function mapRsvp(row: any): RsvpEntry {
  return {
    id: String(row.id),
    name: row.name,
    attendance: row.attendance,
    guestCount: row.guest_count ?? 1,
    createdAt: row.created_at ?? new Date().toISOString(),
  };
}

function mapWish(row: any): WishEntry {
  return {
    id: String(row.id),
    name: row.name,
    message: row.message,
    attendance: row.attendance ?? null,
    createdAt: row.created_at ?? new Date().toISOString(),
  };
}
