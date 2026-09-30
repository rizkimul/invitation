import type { InvitationConfig, ResponsiveImage, VideoAsset } from '@/types/invitation';

/* ------------------------------------------------------------------ *
 * Helper agar deklarasi gambar tetap ringkas.
 * File aset ada di /public/images.
 * ------------------------------------------------------------------ */
function img(base: string, alt: string, ratio: number, widths: number[] = [900, 1600]): ResponsiveImage {
  return {
    src: `/images/${base}.jpg`,
    webp: widths.map((w) => [w, `/images/${base}-${w}.webp`] as [number, string]),
    thumb: `/images/${base}-thumb.webp`,
    alt,
    ratio,
  };
}

/** Aset video: mp4 (h264) + webm (vp9), masing-masing dua lebar, plus poster. */
function vid(base: string, alt: string, ratio = 1080 / 1620): VideoAsset {
  return {
    mp4: [
      [720, `/video/${base}-720.mp4`],
      [1080, `/video/${base}-1080.mp4`],
    ],
    webm: [
      [720, `/video/${base}-720.webm`],
      [1080, `/video/${base}-1080.webm`],
    ],
    poster: `/video/${base}-poster.jpg`,
    posterWebp: `/video/${base}-poster.webp`,
    thumb: `/video/${base}-thumb.webp`,
    alt,
    ratio,
  };
}

const PORTRAIT = 3648 / 5472; // 0.667
const LANDSCAPE = 5472 / 3648; // 1.5

/* ==================================================================== *
 *  SEMUA KONTEN UNDANGAN ADA DI SINI.
 *  Ganti nilainya, seluruh halaman ikut berubah.
 * ==================================================================== */
export const config: InvitationConfig = {
  hashtag: '#RIZKitallforZAHRA',
  defaultGuest: 'Bapak / Ibu / Saudara/i',

  couple: {
    order: 'bride-first',
    groom: {
      nickname: 'Rizki',
      fullName: 'Rizki Maulana Sidik, S.Kom.',
      childOrder: 'Putra Pertama',
      fatherName: 'Bapak Otong Hidayat',
      motherName: 'Ibu Dian Cahyawati',
      instagram: '_rizkimul',
      photo: img('feature-groom', 'Potret mempelai pria', 2823 / 4706, [700, 1100]),
    },
    bride: {
      nickname: 'Zahra',
      fullName: 'Luthfiyyah Azzahra Ramadhani, S.M.',
      childOrder: 'Putri Kedua',
      fatherName: 'Bapak Daden Kadarsah (Alm.)',
      motherName: 'Ibu Yully Djuliawati',
      instagram: 'luthfiyyahazhr',
      photo: img('feature-bride', 'Potret mempelai wanita', 2151 / 3583, [700, 1100]),
    },
  },

  mainDateISO: '2026-10-10T08:00:00+07:00',
  mainDateLabel: 'Sabtu, 10 Oktober 2026',

  opening: {
    kicker: 'The Wedding Of',
    salutation: 'Assalamu’alaikum Warahmatullahi Wabarakatuh',
    body:
      'Dengan memohon rahmat dan ridho Allah Subhanahu wa Ta’ala, kami bermaksud menyelenggarakan ' +
      'resepsi pernikahan putra-putri kami. Merupakan suatu kehormatan dan kebahagiaan bagi kami ' +
      'apabila Bapak/Ibu/Saudara/i berkenan hadir untuk memberikan doa restu.',
  },

  quote: {
    source: 'QS. Ar-Rum : 21',
    arabic:
      'وَمِنْ اٰيٰتِهٖٓ اَنْ خَلَقَ لَكُمْ مِّنْ اَنْفُسِكُمْ اَزْوَاجًا لِّتَسْكُنُوْٓا اِلَيْهَا وَجَعَلَ بَيْنَكُمْ مَّوَدَّةً وَّرَحْمَةً',
    text:
      'Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu pasangan hidup dari jenismu sendiri, ' +
      'supaya kamu cenderung dan merasa tenteram kepadanya, dan dijadikan-Nya di antaramu rasa kasih dan sayang.',
  },

  /* Satu lokasi untuk akad dan resepsi. */
  venue: {
    name: 'Bikasoga Indoor Hall',
    address: 'Jl. Suryalaya Indah No. 1-3, Cijagra, Kec. Buahbatu, Kota Bandung, Jawa Barat 40265',
    mapsUrl: 'https://maps.app.goo.gl/4UkvrtSDkVrRAucm7',
  },

  events: [
    {
      id: 'akad',
      title: 'Akad Nikah',
      startISO: '2026-10-10T08:00:00+07:00',
      endISO: '2026-10-10T11:00:00+07:00',
      dateLabel: 'Sabtu, 10 Oktober 2026',
      timeLabel: '08.00 — 11.00 WIB',
    },
    {
      id: 'resepsi',
      title: 'Resepsi',
      startISO: '2026-10-10T11:00:00+07:00',
      endISO: '2026-10-10T14:00:00+07:00',
      dateLabel: 'Sabtu, 10 Oktober 2026',
      timeLabel: '11.00 — 14.00 WIB',
    },
  ],

  /* Tiga babak, bukan linimasa. Pemenggalan baris di bawah disengaja:
     baris ganda dipasang sebagai bait, satu baris panjang sebagai prosa. */
  story: [
    {
      title: 'When We Met',
      lines: [
        'Benar kata mereka, takdir memang menjadi alasan pertemuan.',
        'Sebuah percakapan singkat, yang berujung \u201cAda cerita apa lagi?\u201d.',
      ],
    },
    {
      title: 'Becoming One',
      lines: [
        'Seperti pecahan kaca, kami saling merangkai, menembus sekat hingga dekat. ' +
          'Satu demi satu kepingan, tak lagi sekadar bersebelahan, melainkan menjadi ' +
          'bagian dari satu cerita. Tak lagi mencari sisi yang sempurna, hanya menyadari ' +
          'bahwa setiap keping memang diciptakan untuk saling melengkapi.',
      ],
    },
    {
      title: 'Our Next Chapter',
      lines: [
        'Kini kami adalah tuan dan puan, dengan sisi ego dan kosong yang bertapak di atas permulaan menuju tujuan.',
        'Bersama, kami berlayar.',
      ],
    },
  ],

  cover: img('04-motion-blur', 'Mempelai wanita tersenyum, mempelai pria berjalan melintas', PORTRAIT),
  heroBanner: img('05-books-faces', 'Pasangan menutupi wajah dengan buku', LANDSCAPE),
  closingImage: img('06-sofa-wide', 'Pasangan duduk santai di studio', LANDSCAPE),

  // Panggung latar: satu foto tetap (foto sampul) untuk seluruh halaman.
  // Ganti ke 'per-section' bila ingin latarnya berganti mengikuti gulir.
  stage: { mode: 'single', treatment: 'soft' },

  // Debu studio yang melayang pelan di seluruh halaman.
  particles: { enabled: true, variant: 'dust', density: 1 },

  // Sampul bergerak: Zahra berdiri diam sementara Rizki melintas.
  // Titik fokusnya tetap, jadi teks di atasnya aman dan loop-nya tidak terlihat patah.
  coverVideo: vid('cover-motion', 'Zahra berdiri tersenyum sementara Rizki berjalan melintas'),

  // Latar bergerak untuk Save the Date: versi bolak-balik (ping-pong) dari klip
  // "dua arah, satu titik temu". Maju lalu mundur, jadi loop-nya mulus —
  // potongan langsung akan bikin keduanya teleport karena posisi frame awal
  // dan akhir klip aslinya tertukar total.
  savedateVideo: vid('savedate-loop', 'Rizki dan Zahra berjalan berlawanan arah lalu berpapasan'),

  // Selingan berdiri sendiri dinonaktifkan: klipnya kini jadi latar Save the Date,
  // jadi memakainya dua kali cuma mengulang momen yang sama.
  // Aktifkan lagi dengan membuka komentar di bawah.
  // interlude: {
  //   video: vid('interlude-cross', 'Rizki dan Zahra berjalan berlawanan arah lalu berpapasan'),
  //   kicker: 'Dua arah, satu titik temu',
  //   caption: 'Bandung, 2026 — 3 detik yang kami ulang berkali-kali',
  // },

  gallery: [
    /* Urutan disusun untuk ritme saat digeser: potret (P) dan lanskap (L)
       bergantian — tidak ada dua lanskap berurutan, paling banyak dua potret
       berurutan — dan tiga pose dengan buku sengaja dijauhkan satu sama lain.
       P L P L P P L P L P L P */
    { image: img('g01-dinding-cokelat', 'Berdiri berdampingan di depan dinding panel cokelat', PORTRAIT), layout: 'tall' },
    { image: img('g02-sofa-tersenyum', 'Tersenyum berdampingan di sofa', LANDSCAPE), layout: 'wide' },
    { image: img('g03-sorot-cahaya', 'Berdiri berdampingan di bawah sorot cahaya', 4017 / 5724), layout: 'tall' },
    { image: img('g04-buku-menutup', 'Menutup wajah dengan buku', LANDSCAPE), layout: 'wide' },
    { image: img('g05-sofa-cokelat', 'Zahra berdiri, Rizki duduk di sofa cokelat', PORTRAIT), layout: 'tall' },
    { image: img('g06-karpet-berdiri', 'Berpose di atas karpet dengan mesin tik dan buku', 3764 / 5837), layout: 'tall' },
    { image: img('g07-buku-tersenyum', 'Tersenyum sambil memegang buku di depan wajah', LANDSCAPE), layout: 'wide' },
    { image: img('g08-sofa-bersandar', 'Rizki duduk di sofa, Zahra bersandar di lengannya', PORTRAIT), layout: 'tall' },
    { image: img('g09-sofa-lantai', 'Zahra duduk di sofa, Rizki duduk di lantai', LANDSCAPE), layout: 'wide' },
    { image: img('g10-studio', 'Duduk berdampingan di studio', 3648 / 4159), layout: 'tall' },
    { image: img('g11-buku-mengintip', 'Mengintip dari balik buku', LANDSCAPE), layout: 'wide' },
    { image: img('g12-tertawa', 'Saling menatap dan tertawa di sofa', PORTRAIT), layout: 'tall' },
  ],

  rsvp: {
    enabled: true,
    deadlineLabel: '3 Oktober 2026',
    maxGuests: 4,
  },

  wishes: { enabled: true },

  gift: {
    enabled: true,
    intro:
      'Doa restu Anda adalah hadiah terindah bagi kami. Namun bila berkenan memberi tanda kasih, ' +
      'kami sediakan kanal berikut.',
    accounts: [
      { bank: 'Bank Central Asia', number: '7840271883', holder: 'Luthfiyyah Azzahra Ramadhani' },
      { bank: 'Bank Central Asia', number: '1760111623', holder: 'Rizki Maulana Sidik' },
    ],
    /* Kosong: hanya dua rekening bank. Field-nya dipertahankan supaya
       template ini tetap bisa dipakai pasangan lain yang punya e-wallet. */
    eWallets: [],
    shipping: {
      label: 'Kirim Hadiah',
      recipient: 'Zahra & Rizki',
      address: [
        'Jl. Babakan Tarogong No. 92/197A',
        'Gg. Bojong Asih 3 RT 05 RW 04',
        'Bandung 40232',
      ],
      // phone: '08xxxxxxxxxx',  ← isi nomor yang bisa dihubungi kurir
    },
  },

  closing: {
    body:
      'Merupakan suatu kebahagiaan dan kehormatan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir ' +
      'dan memberikan doa restu kepada kedua mempelai. Atas kehadiran dan doa restunya kami ucapkan terima kasih.',
    signature: 'Kami yang berbahagia',
  },

  music: {
    enabled: true,
    src: '/audio/backsound.mp3',
    title: 'Kisah Sederhana',
    artist: 'Instrumental',
  },
};

export default config;
