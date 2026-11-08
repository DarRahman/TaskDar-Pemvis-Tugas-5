# Rencana Pembaruan UI/UX & Fungsionalitas: TaskDar (Aplikasi Manajemen Tugas Kuliah Universal)

## 1. Rebranding ke **TaskDar** & Full-Screen Splash Screen (Gaya Aptivo)
- **Identitas Universal**: Mengubah nama aplikasi menjadi **TaskDar** dan menghapus seluruh label statis `"STIKOM"` pada header maupun subjudul. Nama kampus kini menjadi data profil dinamis yang dapat diisi dan diubah oleh mahasiswa dari universitas mana pun.
- **Full-Screen Loading Merah Koral (`#E6534E` / `#C41E3A`)**:
  - Merombak layar pembuka menjadi 100% *full-screen* merah koral hangat persis seperti referensi **Aptivo**.
  - Menampilkan ekspresi mata karakter 2D yang hidup di tengah layar dengan tipografi bulat **TaskDar** yang bergerak naik secara mulus sebelum berpindah ke layar Masuk / Daftar Akun.

## 2. Layout Responsif Penuh di Semua Ukuran Layar
- Menghapus bingkai ponsel hitam kaku (`852px`) dan status bar tiruan (`09:41 5G`), menggantinya dengan kontainer aplikasi responsif penuh yang beradaptasi secara proporsional di layar HP, tablet, maupun jendela browser desktop tanpa teks terpotong atau *scrollbar* ganda.
- Mempertahankan *Floating Bottom Navigation Bar* 4 tab yang ergonomis dan responsif.

## 3. Regenerasi 4 Aset Stiker Karakter 2D Tanpa Bingkai Putih
- Memperbarui 4 aset ilustrasi yang sebelumnya memiliki bingkai putih di dalam gambar (`sticker-coding.jpg`, `sticker-robotics.jpg`, `sticker-data.jpg`, `sticker-security.jpg`) agar tampil bersih, penuh, dan berfokus langsung pada karakter seperti stiker Sistem, Pintar, Visual, dan Maskot.

## 4. Perbaikan Halaman Utama (`Tugas`) & Animasi Mekar Tombol `+`
- **Perbaikan Angka Kalender Mingguan**:
  - Mengganti font angka tanggal (`03` s/d `09`) dari monospace bergaris tengah ke sans-serif tebal (`Plus Jakarta Sans`) agar angka `0` tidak terlihat seperti angka `8`.
  - Merapikan ukuran tombol hari dan indikator jumlah tugas agar proporsional dan tidak memanjang ke bawah.
- **Perbaikan Kartu Tugas (`TaskCard`)**:
  - Menghapus bug kotak hitam (`dark:bg-[#141821]`) pada *badge* tenggat waktu.
  - Mengatur tanggal tenggat (`08 Nov 2026`) dengan `whitespace-nowrap` di dalam *pill* bersih berbatas tegas yang sejajar 1 baris dengan tombol **Rincian** dan aksi kanan (**Centang**, **Edit**, **Hapus**).
- **Animasi Mekar dari Tombol `+` (FAB Morph)**:
  - Menambahkan transisi *scale & opacity* dengan titik tumbuh dari posisi tombol `+` di kanan bawah (`origin-bottom-right`), sehingga layar **Tambah Tugas** tampak membesar langsung dari tombol `+` saat ditekan.

## 5. Penyempurnaan Halaman `Mata Kuliah` & Form `Tambah/Ubah Mata Kuliah`
- **Badge `Kode · SKS` Sejajar 1 Baris**: Menambahkan `whitespace-nowrap` dan tata letak fleksibel pada *badge* `TI361 · 3 SKS` di kartu Bento 2 kolom agar tidak pernah patah menjadi 2 baris.
- **Hari Kuliah Senin s/d Minggu**: Menambahkan opsi hari **Minggu (`Min`)** pada deretan pemilih hari perkuliahan.
- **Input SKS Kustom**: Mengubah opsi SKS menjadi pilihan cepat (`2`, `3`) ditambah kolom **Ketik SKS Kustom** (`1` hingga `8` SKS) sesuai kebutuhan mata kuliah pengguna.
- **Pemilih Jam Mulai & Selesai ala HP + Ketik Bebas**: Menyediakan pemilih jam mulai dan jam selesai interaktif (`Jam Mulai` - `Jam Selesai`) dilengkapi mode ketik bebas.
- **Pemilih Warna Kustom RGB / Spektrum Penuh**: Menambahkan pemilih warna bebas (`<input type="color">` / palet RGB) di samping 5 warna kurasi, yang secara otomatis menghasilkan warna aksen pekat dan warna latar pastel lembut untuk kartu Bento.

## 6. Perombakan Halaman `Progres`: Leaderboard Produktivitas Pribadi
- Menghapus daftar mahasiswa lain dan mengubah kartu **Leaderboard** menjadi **Leaderboard Produktivitas Pribadi** dengan pengalih:
  1. **Peringkat Mata Kuliah**: Mengurutkan mata kuliah pengguna sendiri (`#1` s/d `#5`) berdasarkan tingkat ketuntasan tugas dan perolehan poin XP.
  2. **Peringkat Kategori Tugas**: Mengurutkan kategori tugas (`Praktikum`, `Proyek`, `Teori`, `Kuis`) untuk melihat jenis tugas mana yang paling banyak diselesaikan.
- Dilengkapi pengalih periode (**Mingguan** dan **Semester**) sehingga tetap mempertahankan tampilan visual kartu *Learning Olympiad* yang kaya namun 100% relevan untuk penggunaan pribadi.

## 7. Perombakan Halaman `Profil`, Edit Identitas Kampus & Kartu Akun Google
- **Edit Profil & Identitas Kampus Bebas**: Menambahkan modal/form **Ubah Profil Akademik** untuk menyunting **Nama Lengkap**, **NIM / NPM**, **Nama Kampus / Perguruan Tinggi**, **Program Studi**, **Semester**, dan **Kelas**.
- **Galeri Avatar Lengkap (8 Karakter + Upload Foto)**: Menampilkan seluruh 8 karakter stiker di pemilih avatar cepat (tanpa pemotongan 5 item) serta fitur unggah foto profil dari perangkat.
- **Kartu Akun Google Autentik & Pengaturan Mobile Lengkap**:
  - Mendesain ulang kartu sinkronisasi menyerupai tampilan **Akun Google** resmi (ikon G multi-warna, foto profil, nama akun, email Google, status sinkronisasi Cloud Firestore, dan tombol kelola/sinkronkan).
  - Menyusun daftar pengaturan layaknya aplikasi mobile modern: **Preferensi Tampilan (Mode Gelap/Terang)**, **Notifikasi & Pengingat H-1**, **Integrasi Kalender**, **Manajemen Data (Reset Tugas ke Awal)**, dan **Keluar Akun**.
- **Sinkronisasi Kode Expo (`App.js`)**: Memperbarui file `/App.js` agar seluruh perubahan desain, nama **TaskDar**, dan fitur baru selaras dengan versi web.
