# Penyempurnaan Akhir UI/UX, Maskot Merah Baru, Filter Hari & Penyimpanan Permanen TaskDar

Rencana ini menindaklanjuti seluruh hasil diskusi dan preferensi Anda untuk menyempurnakan **TaskDar** menjadi aplikasi manajemen tugas kuliah dan jadwal akademik yang siap dipakai sehari-hari dengan identitas visual **Merah Utama (`#C41E3A`)** dan **Putih Bersih (`#FFFFFF`)** yang utuh.

## Keputusan Pengguna yang Dikonfirmasi

> [!IMPORTANT]
> Seluruh poin berikut telah dikonfirmasi melalui pilihan Anda dan menjadi acuan utama pengerjaan:

- **Filter Hari `Sen` s/d `Min` dengan Jumlah Jadwal Matkul**: Baris `Sen` sampai `Min` di halaman **Tugas** berfungsi sebagai filter hari kuliah (`Senin` s/d `Minggu` lintas minggu, sehingga tugas minggu depan atau bulan depan tetap terfilter sesuai harinya). Angka di bagian bawah tiap tombol hari menampilkan **jumlah jadwal mata kuliah** pada hari tersebut (contoh: `1 MK`, `2 MK`), sedangkan gelembung kecil di sudut menampilkan jumlah tugas aktif pada hari itu. Untuk memilih tanggal spesifik (`18 Nov 2026`, dll.), tombol **Kalender Bulan** tetap tersedia.
- **Ganti Lencana Streak `6 Hari` dengan Indikator Tugas Mendesak & Hapus XP**: Lencana api `6h` / `6 Hari` dan poin `XP` dihapus karena mahasiswa tidak memiliki tugas setiap hari. Sebagai gantinya, pojok kanan atas menampilkan **Lencana Tugas Mendesak / Aktif** (contoh: `2 Mendesak` atau `Semua Tuntas`) yang langsung memfilter daftar tugas yang belum selesai saat diketuk.
- **Logo Loading Screen *Serif Italic* Mewah + Maskot Merah Baru**:
  1. Teks **TaskDar** pada layar *loading* menggunakan font *Serif Italic* mewah dan elegan (**Playfair Display Black Italic**) dengan subjudul `Manajer Tugas & Jadwal Kuliah Mahasiswa` tampil bersih berupa teks putih tanpa kotak (*box*) pembungkus.
  2. Membuat aset ilustrasi **Maskot Utama TaskDar Baru** (`mascot-splash.jpg` dan ikon aplikasi) yang berfokus pada karakter 2D berwarna **Merah TaskDar (`#C41E3A`)** dan **Putih (`#FFFFFF`)** dengan garis tepi hitam tegas di atas latar putih bersih (menggantikan maskot lama yang berwarna oranye dengan kotak krem).
- **Simpan Permanen Otomatis (`localStorage` + Cloud) & Kalender *Real-Time* Akurat**: Seluruh perubahan tugas, mata kuliah, lampiran file, profil mahasiswa, dan pengaturan tersimpan otomatis di perangkat (`localStorage`) serta tersinkron ke Firestore saat login Google, didukung perhitungan hari kalender asli (`Date` *real-time*).

---

## 1. Gambaran Umum Perubahan per Halaman

### A. Layar Loading (*Splash Screen*) & Halaman Masuk Tunggal
1. **Tipografi *Serif Italic* Mewah & Tanpa Kotak Subjudul**:
   - Memuat font **Playfair Display (Italic 800/900)** untuk judul **TaskDar** di layar *loading* merah `#C41E3A`.
   - Menghapus kotak putih pada teks `Manajer Tugas & Jadwal Kuliah Mahasiswa` sehingga tampil sebagai teks putih bersih yang simpel dan elegan di bawah logo.
2. **Penyatuan Login & Register Menjadi Satu Form Langsung**:
   - Menghapus tab pengalih `Masuk Akun | Daftar Baru` di bagian atas kartu.
   - Menyajikan satu form terpadu yang ringkas: tombol **Lanjutkan dengan Akun Google** (dengan alur Langkah 2 isi Kampus & NIM) atau pengisian langsung identitas mahasiswa (Nama Lengkap, NIM/NPM, Nama Kampus, Program Studi, Semester, Kelas) dalam satu langkah.
3. **Maskot Utama Merah TaskDar Baru**:
   - Mengganti maskot oranye berlatar krem dengan maskot 2D baru berwarna merah `#C41E3A` bertopi toga hitam-emas dengan latar putih bersih.

### B. Tab 1: Halaman Tugas (`Tugas`)
1. **Filter Hari Kuliah (`Sen` s/d `Min`) + Angka Jumlah Matkul**:
   - Setiap tombol hari menampilkan nama hari (`Sen`, `Sel`, `Rab`, `Kam`, `Jum`, `Sab`, `Min`) di baris atas dan **jumlah mata kuliah pada hari tersebut** (misal `1 MK`) di baris bawah.
   - Mengetuk salah satu hari (misal `Sel`) akan memfilter tugas yang jatuh pada hari Selasa (di minggu mana pun) atau tugas dari mata kuliah hari Selasa, sementara tombol **Kalender Bulan** memungkinkan filter tanggal spesifik lintas bulan/tahun.
2. **Indikator Tugas Mendesak (Pengganti Streak `6h`)**:
   - Mengganti tombol api `6h` di kanan atas dengan tombol taktil **`X Mendesak`** (atau **`0 Mendesak`** berwarna hijau saat tuntas) yang langsung mengarahkan pengguna ke daftar tugas yang belum dikerjakan.

### C. Tab 2: Halaman Mata Kuliah (`Mata Kuliah`)
1. **Penghapusan Efek Blur / Zoom Saat Kursor Menyentuh Gambar**:
   - Menghapus *class* `group-hover:scale-105 transition-transform` pada gambar karakter mata kuliah sehingga ilustrasi tetap tajam 100% dan tenang saat kursor diarahkan ke kartu.

### D. Tab 3: Halaman Progres (`Progres`)
1. **Hapus Poin XP & Ganti Lencana Streak**:
   - Pojok kanan atas menampilkan status **`X Tugas Mendesak`** (bukan `6 Hari Aktif`).
   - Kartu utama dan baris *Leaderboard* menampilkan rasio penyelesaian nyata (`3 dari 5 tugas kuliah selesai · 60% Tuntas`) tanpa embel-embel poin `XP`.
2. **Perombakan 3 Kotak Ringkasan (`Total Tugas`, `Selesai`, `Menunggu`)**:
   - Mengganti 3 kotak pastel pudar dengan kartu taktil **Putih Bersih (`#FFFFFF`)** bergaris tepi tebal (`border-2 border-[#0F172A] shadow-[0_3px_0_0_#0F172A]`) yang dilengkapi lencana warna tegas (`#0F172A` Hitam untuk Total, `#059669` Hijau untuk Selesai, dan `#C41E3A` Merah untuk Menunggu).
3. **Perbaikan Proporsi Grafik Distribusi Beban Tugas (`Sen` s/d `Min`)**:
   - Menghitung beban tugas berdasarkan hari dalam seminggu (`Senin` s/d `Minggu`) dengan skala kapasitas proporsional (1 tugas = 30%, 2 tugas = 55%, 3 tugas = 80%, 4+ tugas = 100%) sehingga batang grafik dengan `1 tgs` tidak lagi memenuhi 100% tinggi kotak seperti persegi penuh.
   - Di dalam tiap batang ditampilkan indikator visual terpisah antara tugas yang sudah selesai (hijau `#059669`) dan tugas yang masih menunggu (merah `#C41E3A`).

### E. Tab 4: Halaman Profil & Pengaturan (`Profil`)
1. **Ikon Pengaturan Solid & Kontras Tinggi**:
   - Mengganti lingkaran ikon pastel pudar pada bagian **Pengaturan Aplikasi & Akademik** menjadi kotak ikon solid bertepi tegas (`border-2 border-[#0F172A] shadow-[0_2px_0_0_#0F172A]`) dengan warna utama merah `#C41E3A` dan putih `#FFFFFF`.
2. **Penyembunyian Otomatis Opsi Portal Kampus**:
   - Baris pengaturan *Pembaruan Jadwal Portal Kampus* hanya ditampilkan apabila nama kampus pengguna mengandung kata `stikom` (`studentUser.institution.toLowerCase().includes('stikom')`). Jika pengguna mengisi kampus lain, baris tersebut otomatis disembunyikan tanpa menyebut nama kampus tertentu.

---

## 2. Arsitektur Teknis & Alur Data Permanen

```
┌─────────────────────────────────────────────────────────────────────────┐
│                   PENYIMPANAN PERMANEN OTOMATIS                         │
│  localStorage ('taskdar_tasks_v2', 'taskdar_courses_v2',                │
│                'taskdar_user_v2', 'taskdar_settings_v2')                │
│         + Sinkronisasi Cloud Firestore (Saat Login Google)              │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     MESIN KALENDER & FILTER HARI                        │
│  • Deteksi Hari Otomatis dari Tanggal ('08 Nov 2026' -> 'Minggu')       │
│  • Filter Strip Hari ('Sen'..'Min') + Hitung Jadwal Matkul per Hari     │
│  • Filter Tanggal Spesifik via Kalender Bulan Real-Time                 │
└─────────┬───────────────────┬────────────────────┬──────────────────────┘
          │                   │                    │
          ▼                   ▼                    ▼
┌───────────────────┐ ┌──────────────────┐ ┌──────────────────────────────┐
│   Tab 1: Tugas    │ │ Tab 2: Matkul    │ │   Tab 3 & 4: Progres/Profil  │
│ • Badge Mendesak  │ │ • Stiker Stabil  │ │ • 3 Kartu Metrik Putih-Merah │
│ • Strip Sen..Min  │ │   (Tanpa Zoom)   │ │ • Bar Proporsional Sen..Min  │
│   (Jumlah Matkul) │ │ • Kontras RGB    │ │ • Tanpa XP & Ikon Solid      │
└───────────────────┘ └──────────────────┘ └──────────────────────────────┘
```

### Pemetaan Interaksi & State Utama
- **Deteksi Hari Akurat (`getIndonesianDayNameFromDateLabel`)**: Setiap tanggal tenggat tugas (contoh: `04 Nov 2026` atau tanggal mana pun di bulan/tahun lain) dipetakan menggunakan objek `new Date(year, monthIndex, day)` asli ke nama hari Indonesia (`Senin` s/d `Minggu`).
- **Filter Hari vs Filter Tanggal Kalender**:
  - Mengetuk kotak hari `Sen` s/d `Min` menyaring tugas berdasarkan hari tenggat atau hari kuliah (`selectedDayOfWeek: 'Senin' | ... | 'Minggu' | 'Semua'`).
  - Memilih tanggal dari **Kalender Bulan** menyaring tugas pada tanggal spesifik tersebut (`selectedExactDate`).
- **Persistensi Data (`localStorage`)**: Saat pengguna menambah tugas, mengunggah file lampiran, menambah mata kuliah, atau mengubah profil/pengaturan, data langsung disimpan ke `localStorage` sehingga tidak hilang ketika halaman dimuat ulang (*refresh*).
