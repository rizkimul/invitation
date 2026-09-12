import type { InvitationConfig, Person } from '@/types/invitation';

/**
 * Urutan tampil mempelai, dihitung di satu tempat.
 *
 * Sebelumnya tiap komponen menghitung sendiri dengan ternary yang sama persis
 * (`order === 'groom-first' ? groom : bride`), disalin di lima berkas — dan
 * dua tempat lain (judul dokumen dan teks tombol bagikan) lupa ikut menghitung
 * sehingga urutannya selalu pria dulu apa pun isi config. Satu sumber begini
 * membuat kesalahan itu tidak bisa terulang.
 */
export interface OrderedCouple {
  first: Person;
  second: Person;
  firstLabel: 'The Groom' | 'The Bride';
  secondLabel: 'The Groom' | 'The Bride';
  /** Nama panggilan berpasangan menurut urutan, mis. "Zahra & Rizki". */
  pairTitle: string;
}

export function orderedCouple(config: InvitationConfig): OrderedCouple {
  const { groom, bride, order } = config.couple;
  const groomFirst = order === 'groom-first';
  const first = groomFirst ? groom : bride;
  const second = groomFirst ? bride : groom;

  return {
    first,
    second,
    firstLabel: groomFirst ? 'The Groom' : 'The Bride',
    secondLabel: groomFirst ? 'The Bride' : 'The Groom',
    pairTitle: `${first.nickname} & ${second.nickname}`,
  };
}
