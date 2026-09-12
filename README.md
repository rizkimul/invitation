# Undangan Pernikahan Digital — Aurora Glass

Vite + TypeScript + Tailwind CSS v4. Tanpa framework UI.

---

## Menjalankan

Butuh **Node 20+**.

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # tsc --noEmit && vite build  →  dist/
npm run preview    # pratinjau hasil build di :4173
npm run typecheck
```

---

## Mengubah isi undangan

Semua teks, tanggal, foto, dan nomor ada di satu berkas:

```
src/config/invitation.config.ts
```

Tidak perlu menyentuh berkas komponen untuk mengganti konten. Bagian yang paling sering diubah:

| Kunci | Isi |
|---|---|
| `couple.groom` / `couple.bride` | Nama, gelar, urutan anak, nama orang tua, Instagram, foto |
| `couple.order` | `'bride-first'` atau `'groom-first'` — mengatur urutan tampil di **seluruh** halaman |
| `mainDateISO` / `mainDateLabel` | Tanggal utama untuk hitung mundur |
| `venue` | Satu lokasi untuk seluruh rangkaian acara |
| `events[]` | Jadwal dalam satu hari. Semuanya di `venue` yang sama |
| `story[]` | Babak cerita. Lihat catatan di bawah |
| `gallery[]` | Foto galeri beserta caption dan penempatan grid |
| `gift.accounts` | Rekening bank |
| `rsvp.deadlineLabel` | Batas konfirmasi |
| `hashtag` | Tagar di bagian penutup |

### Catatan: `story[]`

Bentuk tampilnya mengikuti cara kamu menulis, bukan diatur terpisah:

- **Lebih dari satu `lines`** → dipasang sebagai bait: huruf lebih besar, jarak baris lega.
- **Satu `lines` panjang** → dipasang sebagai prosa: huruf sedikit lebih kecil dan rapat.

Jadi penggalan baris yang kamu tulis itulah yang menentukan ritmenya.

### Catatan: tanggal ada di beberapa tempat

Mengganti hari-H berarti mengubah `mainDateISO`, `mainDateLabel`, lalu `startISO`, `endISO`, dan
`dateLabel` di **setiap** entri `events[]`. Jangan lupa `rsvp.deadlineLabel`.

---

## Mengganti foto

Taruh di `public/images/` dengan pola nama:

```
<nama>.jpg              ← fallback
<nama>-900.webp         ← varian lebar (angkanya bebas, harus cocok dengan config)
<nama>-1600.webp
<nama>-thumb.webp       ← placeholder blur-up, ~20px
```

Lalu daftarkan lewat helper `img()`:

```ts
img('nama-berkas', 'Teks alternatif', 1600 / 1067, [900, 1600])
//   base          alt                rasio w/h      daftar lebar webp
```

Rasio wajib diisi benar — itu yang mencegah halaman melompat saat gambar dimuat.

Membuat variannya:

```bash
cd public/images
magick sumber.jpg -auto-orient -resize 900x   -quality 82 nama-900.webp
magick sumber.jpg -auto-orient -resize 1600x  -quality 82 nama-1600.webp
magick sumber.jpg -auto-orient -resize 20x    -quality 45 nama-thumb.webp
magick sumber.jpg -auto-orient -resize 1600x  -quality 84 nama.jpg
```

`-auto-orient` penting: banyak foto dari kamera menyimpan orientasi di EXIF, dan tanpa flag ini
hasilnya bisa terbalik.

---

## Mengganti video

Taruh di `public/video/` dengan pola:

```
<nama>-720.mp4    <nama>-720.webm
<nama>-1080.mp4   <nama>-1080.webm
<nama>-poster.jpg <nama>-poster.webp  <nama>-thumb.webp
```

Encode:

```bash
ffmpeg -i sumber.mp4 -an -vf "scale=720:-2:flags=lanczos" \
  -c:v libx264 -profile:v main -crf 26 -preset slow -pix_fmt yuv420p \
  -movflags +faststart public/video/nama-720.mp4

ffmpeg -i sumber.mp4 -an -vf "scale=720:-2:flags=lanczos" \
  -c:v libvpx-vp9 -crf 36 -b:v 0 -row-mt 1 public/video/nama-720.webm
```

Ulangi untuk `1080`. Lalu daftarkan lewat helper `vid()` di config.

**Video yang dipakai sebagai latar berulang harus mulus saat mengulang.** Kalau posisi subjek
di frame pertama dan terakhir berbeda jauh, potongan langsung akan terlihat seperti teleport.
Buat versi bolak-balik (ping-pong) dulu:

```bash
ffmpeg -i sumber.mp4 -filter_complex \
  "[0:v]split=2[a][b];[b]reverse,trim=start_frame=1:end_frame=<N-1>,setpts=PTS-STARTPTS[r];[a][r]concat=n=2:v=1[v]" \
  -map "[v]" -an -c:v libx264 -crf 18 -preset slow -pix_fmt yuv420p pingpong.mp4
```

Ganti `<N-1>` dengan jumlah frame sumber dikurangi satu — kalau tidak, frame balik pertama akan
menduplikasi frame terakhir dan terlihat tersendat.

---

## Musik latar

Ganti `public/audio/backsound.mp3`, lalu sesuaikan `music.title` dan `music.artist` di config.
Setel `music.enabled: false` untuk mematikannya.

---

## Sapaan nama tamu

Tambahkan parameter `?to=` di alamat undangan:

```
https://domain-kamu.com/?to=Bapak%20Budi%20Santoso
```

Namanya muncul di sampul. Tanpa parameter, yang tampil adalah `defaultGuest` dari config.

---

## RSVP & buku ucapan

Secara bawaan data tersimpan di `localStorage` peramban tamu — artinya **kamu tidak akan
menerima apa pun**. Untuk undangan yang benar-benar disebar, sambungkan Supabase.

**1. Buat dua tabel** di Supabase (SQL Editor):

```sql
create table rsvp (
  id          bigserial primary key,
  name        text not null,
  attendance  text not null check (attendance in ('hadir','tidak-hadir','ragu')),
  guest_count int  not null default 1,
  created_at  timestamptz not null default now()
);

create table wishes (
  id          bigserial primary key,
  name        text not null,
  message     text not null,
  attendance  text check (attendance in ('hadir','tidak-hadir','ragu')),
  created_at  timestamptz not null default now()
);

alter table rsvp   enable row level security;
alter table wishes enable row level security;

-- Tamu boleh mengirim dan membaca ucapan, tapi tidak boleh mengubah atau menghapus.
create policy "tamu boleh kirim rsvp"   on rsvp   for insert with check (true);
create policy "tamu boleh kirim ucapan" on wishes for insert with check (true);
create policy "ucapan boleh dibaca"     on wishes for select using (true);
create policy "rsvp boleh dihitung"     on rsvp   for select using (true);
```

**2. Isi env** — salin `.env.example` jadi `.env.local`:

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

Adapter Supabase aktif otomatis begitu keduanya terisi, dan dimuat secara dinamis sehingga
bundel awal tetap ringan bagi yang tidak memakainya.

Butuh backend lain? Implementasikan antarmuka `InvitationStore` di
`src/types/invitation.ts`, lalu daftarkan di `src/lib/store/index.ts`.

---

## Deploy

Hasil build adalah berkas statis di `dist/` — bisa di host mana saja.

**Vercel / Netlify / Cloudflare Pages** mendeteksi Vite sendiri:

| Setelan | Nilai |
|---|---|
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |

### Environment Variables

| Nama | Wajib? | Isi |
|---|---|---|
| `VITE_SUPABASE_URL` | kalau pakai Supabase | URL project Supabase |
| `VITE_SUPABASE_ANON_KEY` | kalau pakai Supabase | Anon key |
| `VITE_SITE_URL` | opsional | Alamat kanonik, tanpa garis miring di akhir |

### Preview WhatsApp

`og:url` dan `og:image` **harus URL absolut** — WhatsApp, Facebook, dan Telegram tidak
menjalankan JavaScript dan tidak bisa membaca path relatif, jadi preview undangannya akan
kosong. Keduanya diisi otomatis saat build dari `%SITE_URL%` di `index.html`, dengan urutan:

1. `VITE_SITE_URL` kalau diisi
2. `VERCEL_PROJECT_PRODUCTION_URL` — otomatis ada di Vercel, jadi **tidak perlu diatur apa-apa**
3. kosong — kembali jadi path relatif, sama seperti tanpa plugin ini

Jadi di Vercel tidak ada yang perlu disentuh setelah deploy. Isi `VITE_SITE_URL` hanya kalau
memakai domain sendiri, atau saat host-nya bukan Vercel.

Uji hasilnya lewat [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
setelah deploy pertama.

---

## Sebelum disebar

- [ ] Nama, gelar, dan nama orang tua kedua mempelai
- [ ] Tanggal & jam di `mainDateISO`, `mainDateLabel`, dan setiap entri `events[]`
- [ ] Nama dan alamat `venue`
- [ ] Nomor rekening yang asli
- [ ] Tagar
- [ ] Preview WhatsApp sudah muncul gambarnya (uji lewat Sharing Debugger)
- [ ] Berkas `public/audio/backsound.mp3`
- [ ] Isi `story[]` dan caption galeri
- [ ] Supabase tersambung, dan sudah diuji kirim satu RSVP

---

## Satu jebakan saat menyunting komponen

Komentar HTML di dalam template `html\`...\`` **tidak boleh mengandung backtick**. Karakter itu
mengakhiri template literal-nya dan berkasnya gagal di-parse dengan pesan `TS1005: ';' expected`
yang tidak menunjuk ke penyebab sebenarnya.
