# TaskDar: Penyempurnaan Layar Pemuatan, Notifikasi Asli H-1, Sinkronisasi Google Calendar, dan Animasi Interaktif

Pembaruan ini memperbaiki celah putih di dasar layar pemuatan, mengaktifkan notifikasi sistem perangkat asli (`Notification API`) untuk pengingat tugas H-1/Hari Ini, membatasi dan menghubungkan Sinkronisasi Google Calendar secara nyata khusus untuk akun yang sudah tertaut Google, serta mengembalikan animasi kapsul geser (*sliding pill*) pada navigasi bawah dan animasi kemunculan formulir dari tombol tambah (`+`).

## User Review & Critical Decisions

> [!IMPORTANT]
> Seluruh keputusan di bawah ini telah disesuaikan dengan jawaban klarifikasi Anda.

- **Keputusan Terkonfirmasi 1 (Sinkronisasi Google Calendar Nyata & Khusus Akun Google)**: Opsi **Sinkronisasi Google Calendar** di menu Pengaturan disembunyikan saat pengguna memakai sesi Lokal (NIM) dan hanya ditampilkan ketika akun Google sudah terhubung (`isCloudSynced`). Saat diaktifkan, penambahan atau pembaruan tugas otomatis dikirim ke Google Calendar utama pengguna melalui akses token OAuth Google (`calendar.events`), dilengkapi tombol pintas **Simpan ke Google Calendar** pada rincian kartu tugas.
- **Keputusan Terkonfirmasi 2 (Notifikasi Sistem Perangkat Asli untuk Pengingat H-1)**: Mengaktifkan **Pengingat Tugas H-1** akan meminta izin notifikasi perangkat/peramban asli (`window.Notification.requestPermission()`) dan memicu pop-up notifikasi sistem nyata untuk tugas yang jatuh tempo Besok (H-1) atau Hari Ini, disertai tombol uji notifikasi langsung.
- **Keputusan Terkonfirmasi 3 (Animasi Kapsul Geser Navbar Bawah Lebar Penuh)**: Navbar bawah tetap rata penuh mengikuti lebar kartu konten utama (`max-w-[640px]`), namun label teks hanya muncul pada tab yang sedang aktif dengan animasi kapsul merah (`layoutId`) yang bergeser mulus ke kiri dan kanan.
- **Keputusan Terkonfirmasi 4 (Animasi Muncul Formulir dari Tombol `+` & Perbaikan Layar Pemuatan)**:
  1. Kontainer cairan merah pada layar pemuatan dikunci rapat pada dasar layar (`-bottom-24 h-[135%]` bergerak dari `y: '100%'` ke `y: '0%'`) sehingga tidak ada celah putih di bagian bawah layar pada resolusi apa pun.
  2. Menekan tombol mengambang `+` memicu animasi *spring morph* di mana lembar formulir **Tambah Tugas Baru** mekar langsung dari posisi tombol `+` di kanan bawah.

---

## 1. Overview & Core Concept

- **What It Does**: Menjadikan seluruh fitur pengaturan, pengingat, sinkronisasi kalender, dan transisi antarmuka bekerja 100% secara fungsional tanpa elemen statis atau *placeholder*.
- **Target Audience / Persona**: Mahasiswa STIKOM Poltek Cirebon dan perguruan tinggi lainnya yang membutuhkan pengingat tenggat nyata di perangkat serta integrasi langsung dengan Google Calendar pribadi.
- **Key Value**: Pengalaman aplikasi *mobile-first* yang mulus, responsif, dan benar-benar terintegrasi dengan layanan sistem perangkat maupun akun Google pengguna.

---

## 2. User Experience & Visual Design

- **Key User Flows**:
  1. **Layar Pemuatan Cairan Merah Tanpa Celah Putih**: Gelombang cairan merah (`#C41E3A`) naik dari dasar putih hingga menutupi 100% layar penuh tanpa menyisakan garis putih di bagian bawah.
  2. **Notifikasi Perangkat H-1 & Hari Ini**: Saat sakelar **Pengingat Tugas H-1** dinyalakan, aplikasi meminta izin notifikasi sistem pada HP/laptop. Jika diizinkan, aplikasi otomatis memindai tugas aktif yang bertenggat Hari Ini atau H-1 dan mengirimkan pop-up notifikasi sistem perangkat (lengkap dengan judul tugas, mata kuliah, dan tenggat).
  3. **Sinkronisasi Google Calendar Khusus Akun Google**:
     - Jika pengguna masuk hanya dengan NIM lokal, baris **Sinkronisasi Google Calendar** disembunyikan agar tidak membingungkan.
     - Begitu pengguna terhubung dengan Akun Google, baris pengaturan **Sinkronisasi Google Calendar** muncul. Saat aktif, tugas baru otomatis dikirim ke kalender akun Google pengguna dan setiap kartu tugas memiliki pintasan satu ketukan untuk membuka/menyimpan jadwal di Google Calendar.
  4. **Navbar Bawah Lebar Penuh dengan Kapsul Geser (*Sliding Pill*)**: Kontainer navbar tetap lebar penuh sejajar kartu utama, dengan tab tidak aktif menampilkan ikon bersih dan tab aktif melebar mulus menampilkan ikon + teks di atas kapsul merah yang bergeser kiri-kanan.
  5. **Animasi Mekar dari Tombol Tambah (`+`)**: Saat tombol `+` di kanan bawah ditekan, tombol `+` bertransformasi secara mulus (*origin bottom-right spring transition*) menjadi lembar **Tambah Tugas Baru**.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Integrasi Ganda Google Calendar (API Langsung + Pintasan Kalender)**
  - *Chosen Approach*: Meminta cakupan `https://www.googleapis.com/auth/calendar.events` saat autentikasi Google untuk mengirim jadwal tenggat secara otomatis ke Google Calendar pengguna, serta menyediakan tautan pintas Google Calendar pada rincian kartu tugas.
  - *Why*: Menjamin jadwal benar-benar masuk ke akun Google masing-masing pengguna, sekaligus tetap berfungsi instan meskipun pengguna menutup pop-up izin tambahan.
- **Decision 2: Mesin Notifikasi Perangkat Asli (`Web Notification API`) dengan Penjaga Duplikasi Harian**
  - *Chosen Approach*: Memeriksa izin `window.Notification`, mengirim notifikasi sistem asli untuk tugas H-1 dan Hari Ini, serta mencatat ID tugas yang sudah dinotifikasi pada hari tersebut di penyimpanan lokal agar tidak membanjiri layar setiap kali halaman dimuat ulang.
  - *Why*: Memberikan pengalaman notifikasi layaknya aplikasi *native* di HP/laptop tanpa pengulangan yang mengganggu.

---

## 4. Technical Architecture & Data Strategy

### Architecture & Component Diagram

```
┌───────────────────────────────────────────────────────────────────────────┐
│                         TaskDar Application Core                          │
├───────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌──────────────────────────────┐     ┌────────────────────────────────┐  │
│  │  Full-Bleed Liquid Splash    │     │  Real Device Notification Hub  │  │
│  │  - Anchored bottom (-bottom) │     │  - Notification.requestPerm()  │  │
│  │  - Zero bottom white gap     │     │  - H-1 & H-0 deadline scanner  │  │
│  └──────────────────────────────┘     └────────────────────────────────┘  │
│                                                                           │
│  ┌──────────────────────────────┐     ┌────────────────────────────────┐  │
│  │  Google Calendar Sync Engine │     │  Interactive Motion Layer      │  │
│  │  - Hidden in Local NIM mode  │     │  - Full-width Navbar layoutId  │  │
│  │  - OAuth calendar.events API │     │    sliding pill + active label │  │
│  │  - Direct Calendar shortcut  │     │  - FAB (+) morph to Task Sheet │  │
│  └──────────────────────────────┘     └────────────────────────────────┘  │
│                                                                           │
└───────────────────────────────────────────────────────────────────────────┘
```

### Interactive Component & State Mapping
- **Layar Pemuatan**: Kontainer gelombang memiliki tinggi ekstra di bawah batas layar (`-bottom-24 h-[135%]`) sehingga saat bergerak dari `y: '100%'` menuju `y: '0%'`, bagian dasar layar tetap tertutup warna `#C41E3A` sepenuhnya.
- **Pengingat Tugas H-1**: Sakelar memverifikasi dukungan `Notification` di peramban, meminta izin jika belum diberikan, memicu notifikasi sistem perangkat untuk tugas H-1/Hari Ini, dan menampilkan status izin secara akurat pada subjudul pengaturan.
- **Sinkronisasi Google Calendar**: Ditampilkan secara kondisional (`isCloudSynced && studentUser.authMethod === 'google'`), menyimpan *access token* Google di memori untuk mengirim *event* ke endpoint `https://www.googleapis.com/calendar/v3/calendars/primary/events`, serta menyediakan tombol pintas Google Calendar pada rincian tugas.
- **Navigasi Bawah & FAB (`+`)**: Menggunakan `motion.div` dengan `layoutId="taskdar-active-nav-pill"` untuk pergeseran kapsul merah kiri-kanan dan `AnimatePresence` dengan `transformOrigin: 'calc(100% - 36px) calc(100% - 96px)'` agar formulir Tambah Tugas mekar langsung dari tombol `+`.
