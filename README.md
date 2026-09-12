# Undangan Pernikahan Digital — Tema **Aurora Glass**

Varian tembus pandang. Foto prewedding menjadi **latar tetap (fixed) yang berganti
mengikuti gulir**; seluruh isi undangan mengambang di atasnya sebagai panel kaca
ber-`backdrop-filter`.

Stack sama dengan dua tema lain — **Vite + TypeScript + Tailwind CSS v4**, tanpa framework
UI — dan memakai kontrak data yang identik, jadi satu berkas konfigurasi bisa dipakai
bergantian antar tema.

---

## 1. Mekanik utama: panggung foto

Foto berada di `position: fixed` di belakang seluruh halaman; isi undangan mengambang
di atasnya. Ada dua mode, diatur lewat `config.stage.mode` di `invitation.config.ts`:

```ts
stage: { mode: 'single', treatment: 'soft' },   // default
// stage: { mode: 'per-section' },
```

### Perlakuan latar — `stage.treatment`

Foto prewedding punya subjek manusia berwajah jelas. Sebagai latar **tetap**, wajah itu
berdiri di belakang setiap panel sepanjang halaman dan terbaca seperti hantu di balik
teks. `treatment` mengubah foto dari "gambar yang dibaca" jadi "tekstur & warna":

| Nilai | Efek | Kapan dipakai |
| --- | --- | --- |
| `'plain'` | foto apa adanya | hanya kalau fotonya memang tanpa subjek (detail, tekstur, lanskap) |
| `'soft'` | blur 16px, brightness 0.8 — **default** | foto berisi orang; warna & suasana foto masih terasa |
| `'muted'` | blur 34px, saturate 0.5 | ingin hampir jadi bidang warna |
| `'gradient'` | tanpa foto sama sekali | paling bersih, tapi kaca kehilangan sesuatu untuk diburamkan |

Catatan soal `'gradient'`: `backdrop-filter` bekerja dengan memburamkan apa yang ada di
belakangnya. Di atas bidang warna yang rata, tidak ada apa pun untuk diburamkan — efek
kacanya praktis tak terlihat dan panel berubah jadi kartu biasa. `'soft'` menyisakan
variasi terang-gelap yang cukup supaya kaca tetap terbaca sebagai kaca.

Pada `'soft'` dan `'muted'`, `--glass-blur` otomatis turun dari 20px ke 13px —
memburamkan latar yang sudah buram itu pekerjaan GPU yang terbuang percuma.

### `'single'` — satu foto tetap (aktif sekarang)

Foto sampul (`config.cover`) dipakai untuk seluruh halaman. Tidak ada crossfade, tidak ada
pemantau gulir, dan hanya satu gambar latar yang diunduh. Panel kaca jadi satu-satunya
yang bergerak, jadi halaman terasa lebih tenang dan jauh lebih ringan —
`mountStage()` berhenti lebih awal tanpa memasang listener `scroll` sama sekali.

Konsekuensi yang perlu diingat: semua bagian kini berbagi satu latar, sehingga
teks yang berdiri **langsung** di atas foto tidak lagi bisa mengandalkan warna
foto per bagian. Aksen `--color-denim-2` misalnya, lenyap di atas latar abu-abu
sedang — di mode ini teks semacam itu harus putih dengan `.t-on-photo`.
Warna aksen aman dipakai selama ada panel kaca di belakangnya.

### `'per-section'` — latar berganti saat digulir

Satu lapisan `fixed` untuk setiap foto (sampul, banner, seluruh galeri, penutup);
hanya satu yang `opacity: 1` pada satu waktu. Tiap bagian menandai foto mana yang aktif:

```html
<section id="acara" data-bg="4" class="panel"> … </section>
```

`mountStage()` memantau posisi tiap penanda terhadap 42% tinggi viewport lalu
menyalakan lapisan yang sesuai, dengan crossfade 1,4 detik plus sedikit gerak skala.
Pemeriksaan memakai `getBoundingClientRect` ber-`requestAnimationFrame`, **bukan**
`IntersectionObserver`, supaya pergantian tetap tepat meski tinggi bagian masih
berubah saat font dan gambar dimuat.

Atribut `data-bg` tetap terpasang di semua bagian walau mode `'single'` sedang aktif,
jadi berpindah mode cukup mengganti satu baris config.

Menambah bagian baru = tambahkan `data-bg="<index>"`; indeksnya mengikuti urutan
`backgroundImages()` di `src/components/Stage.ts`.

---

## 2. Sistem kaca

| Kelas | Untuk |
| --- | --- |
| `.glass` | panel terang — mayoritas bagian |
| `.glass-dark` | panel gelap — kutipan ayat & hitung mundur |
| `.glass-sheen` | menambah kilau tipis di tepi atas |
| `.t-on-photo` | teks yang berdiri **langsung** di atas foto, dengan text-shadow |

Nilai kaca diatur lewat token di `@theme`: `--glass-bg`, `--glass-bg-dark`, `--glass-border`,
`--glass-blur`, `--glass-shadow`.

Tiga hal yang menjaga keterbacaan:

1. **Kabut latar** (`.stage__veil`) — gradien gelap di atas dan bawah panggung, sehingga
   teks putih tetap terbaca apa pun foto yang sedang aktif.
2. **Opasitas kaca 0,78** — cukup pekat untuk teks gelap, masih cukup tembus untuk terasa kaca.
3. **Fallback `@supports`** — peramban tanpa `backdrop-filter` mendapat panel nyaris solid,
   bukan panel transparan yang teksnya tidak terbaca.

> Catatan performa: `backdrop-filter` relatif berat. Efek ini sengaja hanya dipasang pada
> panel, tombol, dan dock — bukan pada tiap elemen kecil.

---

## 3. Video

Klip pendek (1080×1620, tanpa audio) dipakai dengan peran yang berbeda.

### Sampul — `coverVideo`

Klip "satu diam, satu melintas". Diputar berulang, bisu, di balik panel kaca sapaan tamu.
Dipilih untuk sampul karena punya **titik fokus yang tetap** — teks di atasnya tidak
bertabrakan dengan gerak — dan karena posisi subjek diam identik di frame pertama dan
terakhir, sehingga potongan loop tidak terlihat patah.

Nama mempelai sengaja ditaruh di kelompok atas, bukan di tengah seperti versi foto:
pada video, subjek berada di tengah frame dan nama yang ikut di tengah akan menimpa wajah.

### Latar Save the Date — `savedateVideo`

Klip "dua arah, satu titik temu" jadi **latar berulang** bagian Save the Date:
keduanya berjalan berlawanan arah, berpapasan, lalu kembali — sejalan dengan
hitung mundur menuju hari pertemuan itu.

**Berkasnya versi ping-pong (maju lalu mundur), dan itu wajib.** Klip aslinya tidak
bisa di-loop dengan potongan langsung: di frame awal Maura di kiri dan Rizki di kanan,
di frame akhir posisinya tertukar total — sambungannya akan terlihat seperti teleport.
Versi ping-pong menyambung maju (85 frame) dengan mundur tanpa frame pertama dan
terakhir (83 frame), jadi titik balik maupun titik loop sama-sama bersebelahan:

```bash
ffmpeg -i interlude-cross-1080.mp4 -filter_complex \
  "[0:v]split=2[a][b];[b]reverse,trim=start_frame=1:end_frame=84,setpts=PTS-STARTPTS[r];[a][r]concat=n=2:v=1[v]" \
  -map "[v]" -an -c:v libx264 -crf 18 -preset slow -pix_fmt yuv420p pingpong.mp4
```

Hasilnya 168 frame / 5,6 detik — cukup panjang supaya pengulangannya tidak terasa.

**Hanya diputar selama bagiannya terlihat** (`ambient: true` → `data-video-ambient` +
IntersectionObserver). Video yang berjalan di balik panel `backdrop-filter` adalah
kombinasi compositing termahal di halaman ini; membiarkannya jalan saat di luar layar
membakar baterai tanpa ada yang menonton.

Kalau `savedateVideo` dikosongkan, bagian Save the Date otomatis kembali jadi
panel biasa di antara panel lain — tidak ada yang perlu diubah di komponennya.

### Selingan berdiri sendiri — `interlude` (nonaktif)

Komponennya masih ada dan berfungsi (`Interlude.ts`): bagian lebar penuh antara
Perjalanan dan Galeri, diputar sekali saat masuk layar lalu berhenti di frame terakhir,
bisa diulang dengan mengetuknya. Sekarang dinonaktifkan karena klipnya sudah dipakai
sebagai latar Save the Date — memakainya dua kali cuma mengulang momen yang sama.
Aktifkan lagi dengan membuka komentar blok `interlude:` di config.

### Kebijakan pemutaran

`motionAllowed()` di `src/lib/video.ts` mematikan gerak dan menampilkan poster bila:

- `prefers-reduced-motion: reduce` aktif,
- `navigator.connection.saveData` menyala, atau
- `effectiveType` koneksi `slow-2g` / `2g`.

Semua `<video>` dirender `muted` + `playsinline` — dua atribut ini syarat mutlak agar
autoplay diizinkan di iOS. Varian lebar (720/1080) dipilih sekali saat render berdasarkan
lebar layar × kerapatan piksel, bukan lewat atribut `media` pada `<source>` yang
penanganannya tidak konsisten antar peramban.

### Mengganti video

Taruh berkas di `public/video/` dengan pola:

```
<nama>-720.mp4    <nama>-720.webm
<nama>-1080.mp4   <nama>-1080.webm
<nama>-poster.jpg <nama>-poster.webp  <nama>-thumb.webp
```

Perintah encode yang dipakai:

```bash
ffmpeg -i sumber.mp4 -an -vf "scale=720:1080:flags=lanczos" \
  -c:v libx264 -profile:v main -crf 26 -preset slow -pix_fmt yuv420p \
  -movflags +faststart public/video/nama-720.mp4

ffmpeg -i sumber.mp4 -an -vf "scale=720:1080:flags=lanczos" \
  -c:v libvpx-vp9 -crf 36 -b:v 0 -row-mt 1 public/video/nama-720.webm
```

Lalu daftarkan lewat helper `vid()` di `src/config/invitation.config.ts`.
Ukuran sekarang: 88–146 kB per klip untuk webm, 137–300 kB untuk mp4.

---

## 4. Debu studio (partikel)

Partikel halus yang melayang di seluruh halaman, diatur lewat config:

```ts
particles: { enabled: true, variant: 'dust', density: 1 },
```

**Kenapa debu, bukan kelopak.** Seluruh pemotretan berlatar studio — dinding polos,
lampu, properti yang ditata. Debu di berkas cahaya adalah penghuni asli dunia itu;
kelopak sakura atau daun gugur ditempel dari luar dan berkelahi dengan palet abu-navy.

**Kenapa "melayang", bukan "gugur".** Gugur mengandaikan gravitasi dan ruang terbuka.
Di dalam studio partikel halus hanyut naik-turun mengikuti udara — karena itu sebagian
`vy` sengaja bernilai negatif, dan tiap partikel punya ayunan sinus horizontal.

**Penempatan lapisan — ini yang bikin efeknya bagus.** Kanvas berada di `z-index: 0`
sama seperti `.stage`, tapi muncul belakangan di DOM sehingga dicat di atasnya.
`.shell` di `z-index: 1` tetap di atas keduanya, jadi `backdrop-filter` panel ikut
**memburamkan partikel yang lewat di belakangnya** — debu tajam di sela-sela panel,
meleleh lembut saat tertutup kaca. Kalau kanvas ditaruh di lapisan paling atas,
partikel akan melayang menutupi teks dan hasilnya murahan.

**Kenapa canvas, bukan elemen DOM.** Halaman ini sudah punya panggung `fixed` plus
panel `backdrop-filter`. Menambah puluhan node beranimasi di atas tumpukan itu persis
kombinasi compositing yang bikin gulir patah di perangkat kelas menengah. Satu canvas
= satu lapisan, dan semua partikel memakai satu sprite radial yang dibuat sekali
(bukan `createRadialGradient()` per partikel per frame).

Pengaman yang terpasang: mati total saat `prefers-reduced-motion`, jumlah partikel
dipangkas 40% bila `navigator.hardwareConcurrency <= 4`, loop berhenti saat tab
tidak terlihat, dan baru mulai setelah sampul dibuka — selama sampul tertutup
partikelnya tidak terlihat, jadi tidak ada gunanya membakar baterai.

Mau lebih ramai atau lebih sepi, ubah `density` (1 = bawaan). Matikan dengan
`enabled: false`.

---

## 5. Beda struktur dengan tema lain

| | Editorial Vintage | **Aurora Glass** |
| --- | --- | --- |
| Latar | warna kertas solid | **foto tetap** — satu foto, atau berganti saat digulir |
| Bagian | menempel penuh selebar kolom | panel melayang dengan jarak, foto terlihat di sela |
| Beranda | masthead di atas kertas | nama langsung di atas foto, tanpa kaca |
| Mempelai | potret arch | potret bundar menembus tepi atas panel |
| Galeri | grid asimetris | **rel geser horizontal** dengan `scroll-snap` |
| Hitung mundur | kotak persegi | pil transparan di panel kaca gelap |
| Dock | bar penuh di tepi bawah | **pil kaca mengambang** |
| Penutup | foto + panel gelap | foto latar terbuka penuh, satu panel kaca kecil |
| Gerak | tidak ada | **video sampul berulang + latar video di Save the Date** |

Urutan bagian: Cover → Beranda → Pembuka → Mempelai → **Save the Date (latar video)** →
Acara → Perjalanan → Galeri → RSVP → Buku Ucapan → Tanda Kasih → Penutup.

---

## 6. Tipografi

- **Fraunces** — judul. Serif kontemporer berlekuk lembut (`SOFT`/`WONK` variable axis),
  tetap tegas walau berada di atas panel tembus pandang.
- **Manrope** — teks isi & antarmuka. Tinggi-x besar, legibel pada ukuran kecil di atas foto.
- **Amiri** — kutipan ayat.

Di-host sendiri lewat `@fontsource`.

---

## 7. Menjalankan

```bash
npm install
npm run dev        # http://localhost:5173
npm run build
npm run preview
npm run typecheck
```

Butuh Node 20+.

Konten diubah di **`src/config/invitation.config.ts`**. Cara mengganti foto, musik latar,
sapaan nama tamu lewat `?to=`, serta pemasangan backend RSVP/ucapan (Supabase, atau adapter
buatan sendiri lewat antarmuka `InvitationStore`) mengikuti README tema Editorial Vintage.

**Satu hal khusus tema ini:** pada mode `'per-section'`, jumlah foto memengaruhi jumlah
lapisan panggung. Kalau galeri diisi banyak foto, pertimbangkan membatasi lapisan panggung
ke beberapa foto pilihan saja — ubah `backgroundImages()` di `src/components/Stage.ts`.
Mode `'single'` tidak terpengaruh karena hanya memuat satu gambar.

---

## 8. Catatan implementasi

- `.glass-sheen` memakai `overflow: hidden`. Elemen yang sengaja menembus tepi panel —
  seperti potret bundar mempelai — harus diletakkan **di luar** panel, bukan di dalamnya,
  atau lingkarannya akan terpotong separuh.
- Panggung foto berada di `z-index: 0` dengan `position: fixed`; `.shell` di `z-index: 1`
  dan latarnya transparan. Jangan memberi `background` solid pada `.shell` atau seluruh
  efeknya hilang.
- `prefers-reduced-motion` dihormati: crossfade, animasi masuk, dan pemutaran video dimatikan.
- Komentar HTML di dalam template `html\`...\`` tidak boleh mengandung backtick — karakter
  itu mengakhiri template literal-nya dan bikin berkas gagal di-parse.

---

## 9. Yang perlu diganti sebelum dipakai

- [ ] Nama, gelar, dan nama orang tua kedua mempelai
- [ ] Tanggal, jam, dan lokasi akad/resepsi
- [ ] Nomor rekening & e-wallet yang asli
- [ ] Nomor WhatsApp (format `62xxx`)
- [ ] `siteUrl` dan tagar
- [ ] Berkas `public/audio/backsound.mp3`
- [ ] Isi love story dan caption galeri
- [ ] Dua berkas video di `public/video/` beserta poster-nya
