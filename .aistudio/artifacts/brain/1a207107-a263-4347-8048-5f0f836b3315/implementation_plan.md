# Rencana Perombakan Total Visual, UI/UX, dan Fitur Aplikasi Tugas Kuliah (Gaya Aptivo, Charmi & Learning Olympiad)

## 1. Tujuan & Arah Desain Visual
Merombak antarmuka yang sebelumnya didominasi teks menjadi aplikasi konsumen mobile yang kaya ilustrasi karakter 2D ekspresif, interaktif, dan nyaman digunakan sehari-hari oleh mahasiswa **STIKOM Poltek Cirebon**, mengacu langsung pada referensi **Aptivo**, **Charmi**, dan **Learning Olympiad**.

---

## 2. Pembuatan Aset Ilustrasi & Karakter Visual Asli (`/public/assets/`)
Alih-alih hanya menggunakan ikon garis kecil dan kotak SVG kaku, kita akan men-generate aset gambar ilustrasi 2D ekspresif beresolusi tinggi yang disimpan di `/public/assets/` (siap ditampilkan di aplikasi web maupun diunduh untuk keperluan build APK React Native Expo):
1. **Karakter Maskot Utama (`mascot-hero.png` & `mascot-splash.png`)**: Karakter 2D ekspresif dengan mata besar ikonik bergaya *Aptivo* dan *Charmi* dalam balutan warna merah-putih STIKOM.
2. **Stiker Karakter Visual Mata Kuliah (`sticker-coding.png`, `sticker-robotics.png`, `sticker-data.png`, `sticker-security.png`, `sticker-oop.png`, `sticker-ai.png`)**: Ilustrasi karakter tematik untuk menghiasi setiap kartu mata kuliah dan tugas.
3. **Ilustrasi Trofi & Selebrasi (`trophy-olympiad.png` & `mascot-celebrate.png`)**: Aset visual untuk kartu banner *Leaderboard Kelas TI-1* dan kondisi ketika seluruh tugas selesai.

---

## 3. Alur Pembuka Aplikasi: Animasi Splash Naik (`Aptivo-Style`) + Login Google & NIM
1. **Layar Splash Animasi Full-Screen (Bukan Pop-up Modal)**:
   * Saat aplikasi dibuka, layar menampilkan latar penuh warna merah koral/crimson dengan karakter maskot besar yang **muncul naik dari bawah ke atas layar secara halus** (seperti layar pembuka *Aptivo*), lalu otomatis bertransisi ke layar Masuk atau Beranda.
2. **Layar Masuk & Daftar Mahasiswa (Login / Register)**:
   * **Integrasi Akun Google**: Tombol **Masuk dengan Akun Google** (terhubung dengan Firebase Authentication) untuk menyinkronkan profil dan tugas mahasiswa.
   * **Login NIM & Profil Mahasiswa STIKOM**: Form masuk/daftar menggunakan Nama, NIM (`14524303`), dan Kelas (`TI-1 Semester 5`), ditambah tombol akses cepat akun mahasiswa **Badar Rahman**.
3. **Pembersihan Halaman Profil**:
   * Menghapus tombol uji coba *"Buka Layar Sambutan"* dari halaman Profil.
   * Memperbaiki proporsi kartu identitas dan avatar profil agar tidak terpotong.
   * Menambahkan fitur **Edit Profil Mahasiswa** dan tombol **"Keluar Akun (Logout)"** yang secara alami mengembalikan pengguna ke layar Login.

---

## 4. Perombakan 4 Tab Utama & Perbaikan UX Menyeluruh

### Tab 1: Tugas Kuliah (Gaya *Charmi* & *Aptivo*)
* **Header Ringkas & Lega**: Mengganti kotak merah besar yang memakan separuh layar menjadi bar sapaan horizontal yang bersih (Avatar Karakter + *"Halo, Badar!"* + Lencana Streak `6 Hari` & Persentase Progres), sehingga kartu tugas langsung mendominasi layar.
* **Strip Kalender 7 Hari yang Aktif Memfilter**:
  * Menekan tanggal pada strip 7 hari atau memilih tanggal di **Kalender Bulan** akan **langsung memfilter daftar tugas** untuk tanggal tersebut, dilengkapi tombol chip **"Semua Tanggal"** agar pengguna leluasa melihat jadwal harian maupun seluruh tugas.
* **Kartu Tugas Visual Berkarakter + Fitur Edit Tugas**:
  * Kartu tugas menampilkan ilustrasi stiker mata kuliah, label kategori tugas (*Praktikum*, *Proyek*, *Teori*, *Kuis*), tenggat waktu yang jelas, tombol centang, serta tombol **Edit Tugas** (mengubah judul, mata kuliah, kategori, tanggal tenggat, dan deskripsi).

### Tab 2: Mata Kuliah (Grid Bento 2 Kolom Berilustrasi ala *Aptivo*)
* **Grid Bento 2 Kolom Berkarakter**:
  * Menampilkan mata kuliah dalam **Grid Bento 2 Kolom** yang penuh warna dengan karakter ekspresif yang mengintip di bagian atas kartu (persis seperti halaman *My Courses* pada referensi *Aptivo*), serta tombol pengalih apabila pengguna ingin melihat daftar jadwal & ruangan secara rinci.
* **Stiker Visual Custom, Upload Gambar Sendiri, & Edit/Hapus Mata Kuliah**:
  * Pada modal **Tambah / Edit Mata Kuliah**, pengguna dapat:
    1. Memilih dari koleksi **Stiker Karakter Visual** atau **Mengunggah Gambar/Ikon Sendiri (Custom Image Upload)** dari perangkat.
    2. Memilih **Hari Kuliah** menggunakan tombol chip (*Senin* s/d *Sabtu*) dan **Jam Kuliah** tanpa perlu mengetik format jadwal secara manual.
    3. Mengedit atau menghapus mata kuliah yang sudah ada.

### Tab 3: Progres & Leaderboard Kelas TI-1 (Gaya *Learning Olympiad*)
* **Banner Olimpiade & Grafik Progres**:
  * Menampilkan kartu banner bergaya *Learning Olympiad* lengkap dengan ilustrasi trofi besar, persentase ketuntasan (`78%` / dinamis mengikuti tugas selesai), dan grafik bar aktivitas belajar mingguan.
* **Leaderboard Kelas TI-1 Interaktif (Tab Mingguan & Bulanan)**:
  * Mengganti podium statis menjadi **Papan Peringkat (Leaderboard) Kelas TI-1** dengan tab **Mingguan** dan **Bulanan** (seperti layar kanan atas referensi *Learning Olympiad*).
  * Poin dan peringkat **Badar Rahman** di dalam Leaderboard akan **naik secara dinamis** setiap kali pengguna menyelesaikan tugas kuliah!

### Tab 4: Profil Mahasiswa & Sinkronisasi Akun Google
* Kartu profil mahasiswa yang proporsional dengan foto/karakter avatar yang dapat diganti (pilih karakter atau unggah foto profil).
* Status koneksi **Akun Google & Sinkronisasi Cloud**, pengaturan pengingat tugas, tombol **Atur Ulang Data Awal**, dan tombol **Keluar Akun**.

---

## 5. Arsitektur Kode & Kesiapan APK React Native Expo
* Mempertahankan ke-7 konsep inti React (*Props*, `useState`, `useEffect`, `useMemo`, `useCallback`, `useRef`, `useReducer`) secara bersih di balik layar tanpa satu pun istilah teknis di antarmuka pengguna.
* Memperbarui file `/App.js` dan menyiapkan seluruh aset gambar di `/public/assets/` sehingga kode siap dijalankan baik di preview web maupun saat di-build menjadi APK melalui React Native Expo.
