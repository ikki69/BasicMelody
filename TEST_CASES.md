# Test Case — BasicMelody

Dokumen ini berisi skenario pengujian aplikasi BasicMelody, hasil yang diharapkan, dan hasil
aktual yang sudah diverifikasi.

- **Tanggal pengujian:** 5 November 2026
- **Lingkungan:** Chrome 156.0.8078.80 (headless) via Chrome DevTools Protocol, Vite dev server
  `http://127.0.0.1:5173/`
- **Metode:** 86 pemeriksaan browser otomatis + 20 pemeriksaan statis data/route
- **Hasil akhir:** **106 / 106 lolos**, 0 gagal
- **Legenda:** ✅ Lolos · ⚠️ Perlu uji manual · ❌ Gagal

## 1. Landing, Introduction, dan Routing

| Skenario | Hasil yang Diharapkan | Hasil |
|---|---|---|
| Buka `#/` | Landing page tampil tanpa error | ✅ `.landing-root` tampil |
| Klik CTA **Mulai Belajar** | Menuju halaman Introduction | ✅ `href="#/introduction"` |
| Buka `#/introduction` | Halaman Introduction tampil di langkah 1 | ✅ Langkah 1 aktif |
| Klik **Lanjut** dari langkah 1 | Pindah ke langkah 2, lalu langkah 3 | ✅ Langkah 2 dan 3 aktif berurutan |
| Klik **Lanjut** di langkah terakhir | Introduction ditandai selesai dan membuka daftar materi | ✅ `intro.completed=true`, daftar materi tampil |
| Buka `#/level/m99` | Kembali ke daftar materi, bukan crash | ✅ Fallback ke daftar materi |
| Buka `#/halaman-tidak-ada` | Kembali ke landing page | ✅ Landing tampil |
| Buka `#/level/M8` (huruf besar) | Tetap membuka Materi 8 | ✅ Judul “Materi 8 · Gabungan Nilai Not & Lagu” |

## 2. Struktur Materi dan Level

| Skenario | Hasil yang Diharapkan | Hasil |
|---|---|---|
| Buka daftar materi | Menampilkan 9 kartu materi | ✅ 9 kartu |
| Materi 1 (Mengenal Posisi Not) | 4 level, diawali pengenalan | ✅ 4 level |
| Materi 2 (Nilai Not) | 4 level, diawali pengenalan | ✅ 4 level |
| Materi 3 (Irama) | 7 level, diawali pengenalan | ✅ 7 level |
| Materi 4 (Not C4–G5) | 4 level, diawali pengenalan | ✅ 4 level |
| Materi 5 (Tanda Diam dan Tanda Titik) | 4 level, diawali pengenalan | ✅ 4 level |
| Materi 6 (Gabungan Lagu Mudah) | 4 level, diawali pengenalan | ✅ 4 level |
| Materi 7 (Gabungan Posisi Not & Tanda Diam) | 5 level, diawali pengenalan gabungan | ✅ 5 level |
| Materi 8 (Gabungan Nilai Not & Lagu) | 5 level, diawali pengenalan gabungan | ✅ 5 level |
| Materi 9 (Lagu Medium Gabungan) | 6 level, diawali pengenalan gabungan | ✅ 6 level |
| Total seluruh level | 43 level dengan id unik | ✅ 43 level, tidak ada id duplikat |
| Total level kuis dan bintang maksimum | 34 level kuis, maksimum 102 bintang | ✅ 34 kuis, 102 bintang |
| Level 1 setiap materi | Berjenis `intro`, bukan kuis | ✅ 9 materi diawali intro |
| Header saat progres lengkap | Menampilkan `102 / 102` bintang dan `43/43` level | ✅ `102 / 102 · 43/43 level` |

## 3. Pengenalan Gabungan Materi 7, 8, dan 9

| Skenario | Hasil yang Diharapkan | Hasil |
|---|---|---|
| Buka pengenalan Materi 7 | Menampilkan 2 bagian | ✅ 2 bagian |
| Judul bagian Materi 7 | “Posisi Not” + “Tanda Diam & Tanda Titik” | ✅ Sesuai urutan |
| Isi bagian 1 Materi 7 | Paranada posisi not tampil | ✅ `.lv-staff-frame` tampil |
| Isi bagian 2 Materi 7 | Kartu tanda diam dan tanda titik tampil | ✅ `.lv-cards` tampil |
| Buka pengenalan Materi 8 | Menampilkan 2 bagian | ✅ 2 bagian |
| Judul bagian Materi 8 | “Nilai Not” + “Irama & Lagu” | ✅ Sesuai urutan |
| Isi bagian 1 Materi 8 | Kartu nilai not tampil | ✅ `.lv-cards` tampil |
| Isi bagian 2 Materi 8 | Metronom irama tampil | ✅ `.lv-intro__metro` tampil |
| Buka pengenalan Materi 9 | Menampilkan 4 bagian | ✅ 4 bagian |
| Judul bagian Materi 9 | Posisi Not, Nilai Not, Tanda Diam & Titik, Irama & Lagu | ✅ Sesuai urutan |
| Kelengkapan isi Materi 9 | Keempat jenis konten tampil | ✅ Paranada, kartu nilai, kartu simbol, metronom |
| Tombol **Lanjut ke Kuis** di Materi 7 | Pengenalan selesai dan kuis m7-2 langsung terbuka | ✅ Kuis m7-2 tampil, level 2 terbuka |
| Tekan `Esc` saat pengenalan | Keluar tanpa menandai level selesai | ✅ Kembali ke daftar level |
| Ukuran teks bagian pengenalan | Minimal 13px | ✅ 13px (m7, m8, m9) |
| Ukuran subjudul chip pengenalan | Minimal 12px | ✅ 12px (m7, m9) |
| Pindai seluruh teks pengenalan | Tidak ada teks di bawah 12px | ✅ Tidak ditemukan |

## 4. Kuis Posisi Not

| Skenario | Hasil yang Diharapkan | Hasil |
|---|---|---|
| Buka m1-2 lalu tekan **Mulai** | Kotak nada dan paranada tampil | ✅ Kuis berjalan |
| Jawab 8 soal sesuai not pada paranada | Semua jawaban benar | ✅ 0 jawaban salah |
| Selesaikan kuis | Layar hasil muncul dengan predikat “Sempurna!” | ✅ “Sempurna!” |
| Periksa skor hasil | Skor 100% dan jumlah benar 8 | ✅ 100%, benar 8 |
| Periksa bintang hasil | 3 dari 3 bintang | ✅ 3 bintang |
| Periksa mahkota | Mahkota diberikan karena semua benar | ✅ `crown=true` |
| Tekan **Soal berikutnya** | Pindah ke soal berikutnya tanpa error | ✅ 8 soal selesai |
| Tekan **Kembali ke Level** | Kembali ke daftar level | ✅ Path tampil |

## 5. Kuis Nilai Not, Simbol, dan Irama

| Skenario | Hasil yang Diharapkan | Hasil |
|---|---|---|
| Buka m8-2 | Teks “Not ini berapa ketukan?” tampil | ✅ Teks tampil |
| Ukuran teks soal m8-2 | 13px, sama dengan acuan “Not ini berapa ketukan?” | ✅ 13px |
| Jawab seluruh soal m8-2 dengan benar | Hasil “Sempurna!” dan skor 100% | ✅ 100% |
| Pindai teks halaman kuis nilai not | Tidak ada teks di bawah 12px | ✅ Tidak ditemukan |
| Buka m5-2 | Teks “Simbol ini berapa ketukan?” tampil | ✅ Teks tampil |
| Jawab seluruh soal simbol | Hasil “Sempurna!” | ✅ “Sempurna!” |
| Buka kuis irama m3-2 | Kotak nada tampil dan kuis dapat dimulai | ✅ Kotak nada tampil |
| Tombol metronom pada kuis irama | Tersedia dan dapat ditekan | ✅ Tombol tampil |
| Selesaikan kuis irama | Layar hasil muncul dan progres tersimpan | ✅ Hasil “Selesai!”, `m3-2.done=true` |
| Uji suara nada dan ketukan | Nada terdengar sesuai pitch dan ketukan tepat waktu | ⚠️ Perlu uji manual dengan speaker |
| Uji sinkronisasi playhead dan suara | Playhead menyentuh not tepat saat nada berbunyi | ⚠️ Perlu uji manual |
| Uji input keyboard pada kuis | Tombol huruf nada dan nomor kotak berfungsi | ⚠️ Perlu uji manual |

## 6. Progres, Kunci Level, dan Badge

| Skenario | Hasil yang Diharapkan | Hasil |
|---|---|---|
| Materi 1 tanpa progres | Hanya level 1 terbuka; level 2–4 terkunci | ✅ 3 level terkunci |
| Buka Materi 2 sebelum Materi 1 tuntas | Materi terkunci | ✅ “Materi masih terkunci” |
| Selesaikan pengenalan m1-1 | Progres tersimpan dan kuis m1-2 langsung terbuka | ✅ `m1-1.done=true` |
| Badge setelah m1-1 | Badge level m1-1 dan `special-first` diberikan | ✅ Keduanya tersimpan |
| Selesaikan m1-2 dengan 3 bintang | Progres menyimpan bintang, akurasi, dan mahkota | ✅ `stars=3`, `crown=true` |
| Badge setelah m1-2 | Badge m1-2 dan `special-crown` diberikan | ✅ Keduanya tersimpan |
| Level setelah m1-2 tuntas | Level m1-3 terbuka | ✅ Tidak terkunci |
| Refresh halaman setelah progres | Bintang dan status terbuka tetap tersimpan | ✅ Bintang 3 dan m1-3 tetap terbuka |
| Progres lengkap | Semua 9 materi terbuka | ✅ 0 materi terkunci |
| Koleksi badge | Menampilkan 46 badge | ✅ 46 badge |
| Jumlah badge diraih saat semua terkumpul | 46 | ✅ `data-earned-count="46"` |
| Badge `special-master` setelah semua kuis bermahkota | Diberikan saat kuis terakhir dimahkotai | ⚠️ Perlu uji manual alur penuh |
| Migrasi progres format lama ke `v2` | Progres lama tetap terbaca | ⚠️ Perlu uji manual dengan data lama |

## 7. Tipografi Teks Kecil

| Skenario | Hasil yang Diharapkan | Hasil |
|---|---|---|
| Teks acuan “Not ini berapa ketukan?” | 13px | ✅ 13px |
| Teks kecil pada halaman path | Tidak ada yang di bawah 12px | ✅ Tidak ditemukan |
| Legend panduan pada path | Minimal 13px | ✅ 13px |
| Tag level pada kartu level | Minimal 12px | ✅ 12px |
| Keterangan bawah path | Minimal 13px | ✅ 13px |
| Teks kecil pada daftar materi | Tidak ada yang di bawah 12px | ✅ Tidak ditemukan |
| Deskripsi badge | Minimal 13px | ✅ 13px |
| Teks bagian pengenalan gabungan | Minimal 13px | ✅ 13px |
| Subjudul chip pengenalan | Minimal 12px | ✅ 12px |
| Teks kecil pada halaman kuis | Tidak ada yang di bawah 12px | ✅ Tidak ditemukan |

## 8. Responsif

| Skenario | Hasil yang Diharapkan | Hasil |
|---|---|---|
| Mobile 375×812 — daftar materi | Tidak ada overflow horizontal | ✅ 0px overflow |
| Mobile 375×812 — path Materi 9 | Tidak ada overflow horizontal | ✅ 0px overflow |
| Mobile 375×812 — pengenalan Materi 9 | 4 bagian tampil tanpa overflow | ✅ 4 bagian, 0px overflow |
| Tablet 768×1024 — daftar materi | Tidak ada overflow horizontal | ✅ 0px overflow |
| Tablet 768×1024 — path Materi 9 | Tidak ada overflow horizontal | ✅ 0px overflow |
| Tablet 768×1024 — pengenalan Materi 9 | 4 bagian tampil tanpa overflow | ✅ 4 bagian, 0px overflow |
| Desktop 1440×900 — daftar materi | Tidak ada overflow horizontal | ✅ 0px overflow |
| Desktop 1440×900 — path Materi 9 | Tidak ada overflow horizontal | ✅ 0px overflow |
| Desktop 1440×900 — pengenalan Materi 9 | 4 bagian tampil tanpa overflow | ✅ 4 bagian, 0px overflow |
| Sentuhan pada perangkat nyata | Tombol mudah ditekan dan tidak salah tekan | ⚠️ Perlu uji manual di HP/tablet |

## 9. Validasi Statis Data dan Route

| Skenario | Hasil yang Diharapkan | Hasil |
|---|---|---|
| Jumlah materi | 9 materi berurutan `m1`–`m9` | ✅ 9 materi |
| Keunikan id level | Semua id level unik | ✅ 43 id unik |
| Urutan level per materi | Berurutan mulai dari 1 dan diawali intro | ✅ Semua materi sesuai |
| Kelengkapan legend | Setiap materi punya legend panduan | ✅ 9 legend |
| Badge setiap level | Semua level punya badge | ✅ Lengkap |
| Keunikan id badge | Semua id badge unik | ✅ 46 badge unik |
| Pose mentor materi 7–9 | Tersedia untuk m7, m8, m9 | ✅ Ketiganya ada |
| Panjang pola irama | `steps = beats × subdivisions` | ✅ 17 level irama sesuai |
| Validitas nada irama | Semua nada berada di C4–G5 | ✅ Semua valid |
| Konfigurasi pengenalan gabungan | m7 dan m8 punya 2 bagian, m9 punya 4 bagian | ✅ Sesuai |
| Router `#/level/m1`–`#/level/m9` | Semua materi dikenali | ✅ 9/9 |
| Router `parseLevelRoute` | Menerima huruf besar dan kecil | ✅ `#/level/M8` → `m8` |
| `levelHashFor('m7')` | Menghasilkan `#/level/m7` | ✅ Sesuai |
| `levelHashFor()` tanpa argumen | Menghasilkan `#/level` | ✅ Sesuai |
| Hash materi tak dikenal | Kembali ke daftar materi tanpa crash | ✅ Sesuai |
| Hash halaman Introduction | Dikenali sebagai route `introduction` | ✅ Sesuai |
| Hash tak dikenal | Kembali ke landing | ✅ Sesuai |

## 10. Uji Manual yang Masih Diperlukan

| Skenario | Hasil yang Diharapkan | Hasil |
|---|---|---|
| Kualitas audio nada | Pitch benar, tidak pecah, volume seimbang | ⚠️ Perlu uji manual |
| Kualitas metronom | Bunyi konsisten dan tidak terlambat | ⚠️ Perlu uji manual |
| Sinkronisasi irama dengan telinga | Ketukan terasa tepat saat playhead menyentuh not | ⚠️ Perlu uji manual |
| Animasi, confetti, dan transisi | Halus, tidak patah-patah, tidak mengganggu | ⚠️ Perlu uji manual |
| Tampilan di Safari/Firefox | Layout dan audio berjalan sama baiknya | ⚠️ Perlu uji manual |
| Navigasi keyboard dan pembaca layar | Fokus terlihat, urutan logis, label terbaca | ⚠️ Perlu uji manual |
| Perangkat sentuh nyata | Tombol nada nyaman ditekan dengan jari | ⚠️ Perlu uji manual |

## Cara Menjalankan Ulang

1. Jalankan dev server: `npm run dev -- --host 127.0.0.1 --port 5173`
2. Jalankan Chrome dengan remote debugging port `9222`
3. Jalankan validasi statis: `node validate.mjs`
4. Jalankan uji browser: `node cdp-suite.mjs`

Skrip pengujian berada di folder kerja pengujian (`bm-validate`) dan tidak disertakan ke dalam
repositori aplikasi.
