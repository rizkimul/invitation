/**
 * Kontrak data undangan.
 * Semua konten yang tampil di layar berasal dari objek `InvitationConfig`
 * (lihat `src/config/invitation.config.ts`) sehingga template ini bisa
 * dipakai ulang untuk pasangan lain tanpa menyentuh kode komponen.
 */

export interface Person {
  /** Nama panggilan, dipakai pada judul & cover. */
  nickname: string;
  /** Nama lengkap beserta gelar. */
  fullName: string;
  /** "Putra Pertama" / "Putri Kedua" dst. */
  childOrder: string;
  fatherName: string;
  motherName: string;
  instagram?: string;
  photo: ResponsiveImage;
}

export interface ResponsiveImage {
  /** Sumber utama (jpg fallback). */
  src: string;
  /** Varian webp: [lebar, url]. */
  webp: Array<[number, string]>;
  /** Placeholder super kecil untuk blur-up. */
  thumb: string;
  alt: string;
  /** Rasio intrinsik (w/h) untuk mencegah layout shift. */
  ratio: number;
}

export interface VideoAsset {
  /** Varian mp4 (h264): [lebar, url]. */
  mp4: Array<[number, string]>;
  /** Varian webm (vp9): [lebar, url]. */
  webm: Array<[number, string]>;
  /** Frame pertama, tampil sebelum video termuat atau saat gerak dimatikan. */
  poster: string;
  posterWebp: string;
  /** Placeholder super kecil untuk blur-up. */
  thumb: string;
  alt: string;
  /** Rasio intrinsik (w/h). */
  ratio: number;
}

/**
 * Lokasi acara. Berdiri sendiri di luar `events` karena akad dan resepsi
 * digelar di tempat yang sama — satu alamat, satu peta, satu kartu.
 * Bila suatu saat keduanya terpisah, kembalikan field ini ke dalam EventItem.
 */
export interface VenueInfo {
  name: string;
  address: string;
}

export interface EventItem {
  id: string;
  /** "Akad Nikah" / "Resepsi". */
  title: string;
  /** ISO 8601 dengan offset, mis. "2026-02-14T08:00:00+07:00". */
  startISO: string;
  endISO: string;
  /** Label tanggal yang ditulis manual agar bisa gaya bahasa bebas. */
  dateLabel: string;
  timeLabel: string;
  note?: string;
}

/**
 * Satu babak cerita. Bukan peristiwa bertanggal — karena itu tidak ada `year`.
 *
 * `lines` adalah pemenggalan yang DISENGAJA oleh penulisnya, dan itulah yang
 * menentukan cara babak ini diset di layar: lebih dari satu baris berarti
 * ditulis sebagai bait (dipasang rata tengah, huruf lebih besar, jarak baris
 * lega); satu baris berarti prosa (dipasang rata kiri pada lebar baca yang
 * nyaman). Jadi bentuknya mengikuti tulisannya, bukan diatur terpisah.
 */
export interface StoryItem {
  title: string;
  lines: string[];
}

export interface GalleryItem {
  image: ResponsiveImage;
  /** Caption gaya editorial (opsional). */
  caption?: string;
  /** Penempatan di grid asimetris. */
  layout: 'tall' | 'wide' | 'square' | 'feature';
}

export interface BankAccount {
  bank: string;
  number: string;
  holder: string;
}

export interface GiftConfig {
  enabled: boolean;
  intro: string;
  accounts: BankAccount[];
  eWallets: BankAccount[];
}

export interface QuoteConfig {
  source: string;
  arabic?: string;
  text: string;
}

export interface RsvpConfig {
  enabled: boolean;
  /** Batas konfirmasi (ISO) — ditampilkan sebagai catatan. */
  deadlineLabel: string;
  maxGuests: number;
}

export interface MusicConfig {
  enabled: boolean;
  src: string;
  title: string;
  artist: string;
}

export interface InvitationConfig {
  /** Slug/URL kanonik untuk tombol bagikan. */
  siteUrl: string;
  hashtag: string;
  /** Sapaan default bila parameter ?to= kosong. */
  defaultGuest: string;
  couple: {
    groom: Person;
    bride: Person;
    /** Urutan tampil nama pada cover: 'groom-first' umum di Indonesia. */
    order: 'groom-first' | 'bride-first';
  };
  /** Tanggal utama untuk countdown & save-the-date. */
  mainDateISO: string;
  mainDateLabel: string;
  opening: {
    kicker: string;
    salutation: string;
    body: string;
  };
  quote: QuoteConfig;
  /** Satu lokasi untuk seluruh rangkaian acara. */
  venue: VenueInfo;
  /** Rangkaian waktu dalam satu hari, urut. Semuanya di `venue` yang sama. */
  events: EventItem[];
  story: StoryItem[];
  gallery: GalleryItem[];
  cover: ResponsiveImage;
  heroBanner: ResponsiveImage;
  closingImage: ResponsiveImage;
  /**
   * Video sampul. Diputar berulang tanpa suara di balik panel kaca.
   * Bila diisi, `cover` dipakai sebagai poster/fallback.
   */
  coverVideo?: VideoAsset;
  /**
   * Perilaku panggung latar.
   * - 'single'      : satu foto tetap (config.cover) untuk seluruh halaman.
   * - 'per-section' : foto berganti mengikuti gulir, satu lapisan per foto.
   * Default: 'single'.
   */
  stage?: {
    mode: 'single' | 'per-section';
    /**
     * Perlakuan visual latar. Hanya relevan untuk mode 'single'.
     * - 'plain'    : foto apa adanya.
     * - 'soft'     : diburamkan & digelapkan sedikit (rekomendasi).
     * - 'muted'    : buram kuat, nyaris jadi bidang warna.
     * - 'gradient' : tanpa foto, hanya gradien warna dari palet.
     */
    treatment?: 'plain' | 'soft' | 'muted' | 'gradient';
  };
  /**
   * Video latar untuk bagian Save the Date. Diputar berulang tanpa suara,
   * dan hanya berjalan selama bagiannya terlihat di layar.
   */
  savedateVideo?: VideoAsset;
  /**
   * Partikel halus yang melayang di seluruh halaman.
   * Dirender di satu <canvas>, di ATAS panggung foto tapi di BAWAH panel kaca,
   * sehingga panel ikut memburamkan partikel yang lewat di belakangnya.
   */
  particles?: {
    enabled: boolean;
    variant?: 'dust';
    /** Pengali jumlah partikel. 1 = bawaan. */
    density?: number;
  };
  /**
   * Selingan bergerak lebar penuh di antara dua bagian.
   * Diputar sekali saat masuk layar, lalu berhenti di frame terakhir.
   */
  interlude?: {
    video: VideoAsset;
    kicker: string;
    caption: string;
  };
  rsvp: RsvpConfig;
  wishes: { enabled: boolean };
  gift: GiftConfig;
  closing: {
    body: string;
    signature: string;
  };
  music: MusicConfig;
}

/* ---------- Data yang dikirim tamu ---------- */

export type Attendance = 'hadir' | 'tidak-hadir' | 'ragu';

export interface RsvpEntry {
  id: string;
  name: string;
  attendance: Attendance;
  guestCount: number;
  createdAt: string;
}

export interface WishEntry {
  id: string;
  name: string;
  message: string;
  attendance: Attendance | null;
  createdAt: string;
}

export interface InvitationStore {
  submitRsvp(input: Omit<RsvpEntry, 'id' | 'createdAt'>): Promise<RsvpEntry>;
  submitWish(input: Omit<WishEntry, 'id' | 'createdAt'>): Promise<WishEntry>;
  listWishes(limit?: number): Promise<WishEntry[]>;
  countAttendance(): Promise<Record<Attendance, number>>;
}
