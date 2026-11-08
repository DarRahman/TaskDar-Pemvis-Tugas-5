# Rencana Penyempurnaan Akhir UI/UX, Fungsionalitas, & Audit Codebase TaskDar

Rencana ini mencakup seluruh revisi visual, mekanisme kerja fitur, optimasi resolusi gambar (WebP), serta hasil audit menyeluruh agar aplikasi **TaskDar** siap digunakan secara nyata tanpa ada data statis (*hardcoded placeholder*).

---

## 1. Layar Loading Cairan Bergelombang (*Bottom-to-Top Liquid Wave*)
* **Animasi Cairan Naik Penuh**: Menggantikan bilah *loading* kecil di bawah dengan efek **cairan merah koral (`#C41E3A`) bergelombang (*animated SVG dual-wave crest*)** yang naik secara halus dari dasar layar berlatar putih bersih (`0%` di bawah hingga `100%` memenuhi seluruh layar).
* **Transisi Kontras Otomatis**: Saat permukaan gelombang cairan merah naik melewati area tengah layar, ilustrasi mata karakter **TaskDar** dan tipografi *Serif Italic* mewah (`Playfair Display` / `Instrument Serif`) beserta subjudul bersih tanpa kotak akan tampil kontras dan tajam di atas cairan merah tersebut.

---

## 2. Konsistensi Ikon Pengaturan & Lebar Penuh Navbar Bawah
* **Ikon Pengaturan Ke-2 (`Pengingat Tugas H-1`)**: Menghapus bayangan merah (`shadow-[0_2px_0_0_#C41E3A]`) dan latar hitam pada ikon lonceng, lalu menyamakannya dengan 4 ikon pengaturan lainnya menggunakan garis tepi dan bayangan hitam pekat (`border-2 border-[#0F172A] shadow-[0_2px_0_0_#0F172A]`) serta latar warna solid kontras (`#E11D48` / `#F43F5E` dengan ikon putih tajam).
* **Lebar Navbar Bawah Sejajar Konten Utama**: Menyesuaikan ukuran kontainer navigasi bawah agar sejajar persis dengan lebar penuh kartu konten utama di atasnya (`max-w-[640px]` dengan *padding* horizontal yang sama persis `px-4 sm:px-6`), sehingga garis tepi kiri dan kanan *navbar* lurus sejajar dengan kartu-kartu di halaman Tugas, Mata Kuliah, Progres, dan Profil.

---

## 3. Logika "Tugas Mendesak" (Tenggat H-3, Hari Ini, atau Terlewat)
* **Perhitungan Kalender Akurat**: Lencana **Tugas Mendesak** di pojok kanan atas kini membandingkan tanggal tenggat setiap tugas berstatus `Belum Dikerjakan` terhadap tanggal hari ini (`new Date()`):
  * Menghitung selisih hari (`diffDays`) antara tanggal tenggat tugas dan hari ini.
  * Tugas dihitung sebagai **Mendesak** apabila statusnya `Belum Dikerjakan` dan `diffDays <= 3` (mencakup tugas yang tenggatnya lewat/terlambat, hari ini, H-1, H-2, hingga H-3).
* **Filter Interaktif & Indikator Kartu**: Mengetuk lencana **Mendesak** di pojok kanan atas akan menyaring daftar tugas agar menampilkan khusus tugas-tugas mendesak tersebut, dilengkapi penanda sisa hari (contoh: `Hari Ini`, `Besok`, `2 Hari Lagi`, atau `Terlewat`).

---

## 4. Kategori Tugas Custom (Pengganti "Kuis") & Integrasi Menyeluruh
* **Layout 4 Kolom Tetap Sama di `AddTaskSheet.tsx`**:
  * Kolom 1: `Praktikum`
  * Kolom 2: `Proyek`
  * Kolom 3: `Teori`
  * Kolom 4: **Input / Tombol Custom (`Ketik...`)** menggantikan `Kuis` dengan ukuran kotak dan tata letak 4 kolom yang tetap identik (seperti input SKS *custom* pada form Tambah Mata Kuliah). Pengguna dapat mengetik bebas jenis tugas apa saja (misalnya `Kuis`, `UTS`, `UAS`, `Makalah`, `Resume`, `Presentasi`).
* **Integrasi Otomatis di Seluruh Komponen**:
  * **Kartu Tugas (`TaskCard.tsx`)**: Mendukung kategori *custom* apa pun dengan palet warna lencana solid yang otomatis menyesuaikan.
  * **Peringkat Kategori Tugas (Tab 3 `Progres`)**: Menghitung dan mengurutkan seluruh kategori tugas secara dinamis (termasuk kategori *custom* yang dibuat pengguna) lengkap dengan warna peringkat 1 s/d 5+ yang berbeda-beda.
  * **Aturan Keamanan Cloud (`firestore.rules`)**: Memperbarui validasi `isValidTaskDoc` agar mengizinkan string kategori *custom* (`data.category is string && data.category.size() >= 1 && data.category.size() <= 60`).

---

## 5. Skala Grafik Batang Proporsional Murni (Tab 3 `Progres`)
* **Perhitungan Tinggi Batang Proporsional**:
  * Menghapus batas minimum `32%` yang sebelumnya membuat batang 1 tugas terlihat terlalu tinggi.
  * Patokan tinggi penuh (`100%`) diambil dari jumlah tugas terbanyak pada satu hari di minggu tersebut (`maxTasksInDay`, dengan batas dasar minimal `4` jika semua hari memiliki kurang dari 4 tugas agar 1 tugas tidak langsung memenuhi kotak).
  * Contoh nyata: Jika **Senin = 1 tugas**, **Rabu = 7 tugas**, dan **Minggu = 15 tugas**, maka:
    * **Minggu (15 tgs)**: Tinggi batang **100% penuh** menyentuh atas kapsul.
    * **Rabu (7 tgs)**: Tinggi batang **47%** (setengah kapsul).
    * **Senin (1 tgs)**: Tinggi batang **~8%** (sangat pendek di dasar kapsul, proporsional dengan 1/15).

---

## 6. Perbaikan Ketajaman Gambar Mata Kuliah & Optimasi WebP
* **Solusi Gambar Mata Kuliah Tidak Buram / Tidak Terpotong**:
  * Mengubah bingkai ilustrasi pada kartu Mata Kuliah dari `object-cover` (yang memotong atas-bawah dan menarik gambar persegi 1:1 menjadi melebar) menjadi tata letak proporsional (`object-contain` di dalam panggung berlatar warna aksen mata kuliah dengan tinggi yang pas), sehingga karakter stiker tampil 100% utuh dan beresolusi tajam.
* **Konversi & Kompresi WebP Tanpa Menurunkan Resolusi**:
  * Mengonversi seluruh aset gambar bawaan aplikasi (stiker mata kuliah dan maskot) ke format `.webp` kualitas tinggi.
  * Menambahkan utilitas konversi otomatis HTML5 Canvas ke `image/webp` (`quality: 0.92`) khusus saat pengguna mengunggah foto profil atau ikon/stiker mata kuliah agar ringan di memori perangkat mobile/APK, sedangkan file lampiran tugas (Foto, PDF, Video) tetap disimpan utuh sesuai aslinya.

---

## 7. Isolasi Data Per Akun & Sinkronisasi Otomatis Lokal ke Google Cloud
* **Penyimpanan Terpisah Per Akun (`NIM` / `UID`)**:
  * Kunci penyimpanan lokal menggunakan identitas aktif (`taskdar_tasks_${accountKey}` dan `taskdar_courses_${accountKey}`), sehingga jika berganti akun atau NIM berbeda pada perangkat yang sama, daftar tugas dan mata kuliah masing-masing akun terpisah dengan aman.
* **Sinkronisasi Dua Arah Lokal & Google (`Tasks` + `Courses`)**:
  * Saat pengguna masuk dengan akun lokal lalu menghubungkan akun Google (atau masuk dengan Google), seluruh tugas dan mata kuliah yang telah dicatat di sesi lokal akan otomatis digabungkan (*merged*) dan diunggah ke koleksi Cloud Firestore (`users/{uid}/tasks` dan `users/{uid}/courses`).

---

## 8. Pembersihan Nilai Statis (*Codebase Audit*)
* **Tombol Tanggal Cepat Real-Time (`AddTaskSheet.tsx`)**: Mengubah tombol *Hari Ini*, *Besok*, *Rabu Depan*, dan *Senin Depan* beserta nilai tanggal awal (`default deadline`) agar dihitung langsung secara dinamis dari tanggal kalender perangkat saat ini (`new Date()`), bukan lagi tanggal statis `08 Nov 2026`.
* **Validasi Seluruh Kontrol UI**: Memastikan seluruh tombol, filter hari (`Sen` s/d `Min` dengan angka jumlah jadwal matkul), pemilih jam mulai/selesai, unggah multi-file tugas, hingga pengaturan profil berfungsi penuh tanpa ada elemen statis.
