import {
  AcademicTask,
  TaskAction,
  CourseDetail,
  CourseColorTheme,
  CourseIconKey,
  CourseStickerOption,
  PodiumTrophyItem,
} from '../types/task';

export const STUDENT_METADATA = {
  name: 'Badar Rahman',
  shortName: 'Badar',
  nim: '14524303',
  classGroup: 'TI-1',
  semester: 'Semester 5',
  program: 'Teknik Informatika',
  institution: 'STIKOM Poltek Cirebon',
  email: 'badarrahman1905@gmail.com',
  avatarUrl: '/assets/mascot-splash.jpg',
  attendanceRate: '100%',
  streakDays: 6,
} as const;

export const COURSE_STICKER_GALLERY: readonly CourseStickerOption[] = [
  {
    id: 'sticker-coding',
    label: 'Karakter Koding',
    imageUrl: '/assets/sticker-coding.jpg',
    defaultIconKey: 'code',
  },
  {
    id: 'sticker-robotics',
    label: 'Karakter Robotik',
    imageUrl: '/assets/sticker-robotics.jpg',
    defaultIconKey: 'cpu',
  },
  {
    id: 'sticker-data',
    label: 'Karakter Data',
    imageUrl: '/assets/sticker-data.jpg',
    defaultIconKey: 'database',
  },
  {
    id: 'sticker-security',
    label: 'Karakter Siber',
    imageUrl: '/assets/sticker-security.jpg',
    defaultIconKey: 'shield',
  },
  {
    id: 'sticker-oop',
    label: 'Karakter Sistem',
    imageUrl: '/assets/sticker-oop.jpg',
    defaultIconKey: 'layers',
  },
  {
    id: 'sticker-ai',
    label: 'Karakter Pintar',
    imageUrl: '/assets/sticker-ai.jpg',
    defaultIconKey: 'book-open',
  },
  {
    id: 'sticker-design',
    label: 'Karakter Visual',
    imageUrl: '/assets/sticker-design.jpg',
    defaultIconKey: 'palette',
  },
  {
    id: 'sticker-mascot',
    label: 'Karakter Maskot',
    imageUrl: '/assets/mascot-splash.jpg',
    defaultIconKey: 'briefcase',
  },
];

export const SUBJECT_ICON_OPTIONS: readonly {
  key: CourseIconKey;
  label: string;
}[] = [
  { key: 'code', label: 'Kode' },
  { key: 'cpu', label: 'Robotik' },
  { key: 'database', label: 'Basis Data' },
  { key: 'shield', label: 'Keamanan' },
  { key: 'terminal', label: 'Terminal' },
  { key: 'book-open', label: 'Teori' },
  { key: 'bar-chart-2', label: 'Analitik' },
  { key: 'layers', label: 'Arsitektur' },
  { key: 'globe', label: 'Jaringan' },
  { key: 'smartphone', label: 'Mobile' },
  { key: 'palette', label: 'Desain' },
  { key: 'briefcase', label: 'Proyek' },
];

export const BENTO_COLOR_THEMES: readonly CourseColorTheme[] = [
  {
    id: 'crimson',
    name: 'Merah Koral',
    pastelBg: '#FEE2E2',
    pastelBorder: '#FECACA',
    accentColor: '#C41E3A',
    iconBg: '#C41E3A',
  },
  {
    id: 'indigo',
    name: 'Indigo Tekno',
    pastelBg: '#EEF2FF',
    pastelBorder: '#C7D2FE',
    accentColor: '#4F46E5',
    iconBg: '#4F46E5',
  },
  {
    id: 'amber',
    name: 'Jingga Amber',
    pastelBg: '#FEF3C7',
    pastelBorder: '#FDE68A',
    accentColor: '#D97706',
    iconBg: '#D97706',
  },
  {
    id: 'emerald',
    name: 'Hijau Zamrud',
    pastelBg: '#D1FAE5',
    pastelBorder: '#A7F3D0',
    accentColor: '#059669',
    iconBg: '#059669',
  },
  {
    id: 'cyan',
    name: 'Sian Elektrik',
    pastelBg: '#CFFAFE',
    pastelBorder: '#A5F3FC',
    accentColor: '#0891B2',
    iconBg: '#0891B2',
  },
];

/*
 * Converts any user-picked RGB/Hex color into a harmonious Bento card theme
 * with a soft tinted pastel surface, border, and high-contrast accent.
 */
export function deriveBentoThemeFromHex(hexColor: string): CourseColorTheme {
  const cleanHex = hexColor.replace('#', '').trim();
  const fullHex =
    cleanHex.length === 3
      ? cleanHex
          .split('')
          .map((c) => c + c)
          .join('')
      : cleanHex.padEnd(6, '0').slice(0, 6);

  const r = parseInt(fullHex.slice(0, 2), 16) || 196;
  const g = parseInt(fullHex.slice(2, 4), 16) || 30;
  const b = parseInt(fullHex.slice(4, 6), 16) || 58;

  const mixWithWhite = (channel: number, whiteRatio: number) =>
    Math.round(channel * (1 - whiteRatio) + 255 * whiteRatio);

  const toHex = (n: number) =>
    Math.max(0, Math.min(255, n)).toString(16).padStart(2, '0').toUpperCase();

  const bgR = mixWithWhite(r, 0.86);
  const bgG = mixWithWhite(g, 0.86);
  const bgB = mixWithWhite(b, 0.86);

  const borderR = mixWithWhite(r, 0.72);
  const borderG = mixWithWhite(g, 0.72);
  const borderB = mixWithWhite(b, 0.72);

  const normalizedHex = `#${toHex(r)}${toHex(g)}${toHex(b)}`;

  return {
    id: 'custom',
    name: 'Warna Kustom',
    pastelBg: `#${toHex(bgR)}${toHex(bgG)}${toHex(bgB)}`,
    pastelBorder: `#${toHex(borderR)}${toHex(borderG)}${toHex(borderB)}`,
    accentColor: normalizedHex,
    iconBg: normalizedHex,
  };
}

export const INITIAL_COURSES: CourseDetail[] = [
  {
    id: 'course-ti361',
    code: 'TI361',
    name: 'Pemrograman Visual I',
    lecturer: 'Kusnadi, M.Kom.',
    schedule: 'Senin, 08:00 - 10:30 WIB',
    room: 'Lab Mobile 1',
    credits: 3,
    iconKey: 'code',
    stickerUrl: '/assets/sticker-coding.jpg',
    pastelBg: '#FEE2E2',
    pastelBorder: '#FECACA',
    accentColor: '#C41E3A',
    iconBg: '#C41E3A',
  },
  {
    id: 'course-ti362',
    code: 'TI362',
    name: 'Robotika',
    lecturer: 'Bambang Sugiarto, M.T.',
    schedule: 'Selasa, 10:30 - 13:00 WIB',
    room: 'Lab IoT & Robotika',
    credits: 3,
    iconKey: 'cpu',
    stickerUrl: '/assets/sticker-robotics.jpg',
    pastelBg: '#EEF2FF',
    pastelBorder: '#C7D2FE',
    accentColor: '#4F46E5',
    iconBg: '#4F46E5',
  },
  {
    id: 'course-ti363',
    code: 'TI363',
    name: 'Data Warehouse & Data Mining',
    lecturer: 'Dr. Rina Kurniawati, M.Kom.',
    schedule: 'Rabu, 08:00 - 10:30 WIB',
    room: 'Ruang 304',
    credits: 3,
    iconKey: 'database',
    stickerUrl: '/assets/sticker-data.jpg',
    pastelBg: '#FEF3C7',
    pastelBorder: '#FDE68A',
    accentColor: '#D97706',
    iconBg: '#D97706',
  },
  {
    id: 'course-ti364',
    code: 'TI364',
    name: 'Keamanan Informasi & Jaringan',
    lecturer: 'Hendra Wijaya, S.Kom., M.T.',
    schedule: 'Kamis, 13:00 - 15:30 WIB',
    room: 'Lab Jaringan',
    credits: 3,
    iconKey: 'shield',
    stickerUrl: '/assets/sticker-security.jpg',
    pastelBg: '#D1FAE5',
    pastelBorder: '#A7F3D0',
    accentColor: '#059669',
    iconBg: '#059669',
  },
  {
    id: 'course-ti365',
    code: 'TI365',
    name: 'Pemodelan Berorientasi Objek',
    lecturer: 'Dedi Pratama, M.Kom.',
    schedule: 'Jumat, 08:00 - 10:30 WIB',
    room: 'Lab Pemrograman 2',
    credits: 3,
    iconKey: 'layers',
    stickerUrl: '/assets/sticker-oop.jpg',
    pastelBg: '#CFFAFE',
    pastelBorder: '#A5F3FC',
    accentColor: '#0891B2',
    iconBg: '#0891B2',
  },
];

export const COURSE_DIRECTORY = INITIAL_COURSES;

export const SEMESTER_5_COURSES: readonly string[] = INITIAL_COURSES.map(
  (course) => course.name
);

export const PODIUM_TROPHY_SHELF: readonly PodiumTrophyItem[] = [
  {
    id: 'trophy-01',
    rank: '01',
    title: 'Tepat Waktu',
    subtitle: 'Menuntaskan pengumpulan tugas sebelum batas waktu berakhir',
    metricBadge: '100% Disiplin',
    iconKey: 'clock',
    cardBg: '#FEE2E2',
    cardBorder: '#FECACA',
    rankBg: '#C41E3A',
    accentColor: '#991B1B',
  },
  {
    id: 'trophy-02',
    rank: '02',
    title: 'Pejuang Praktikum',
    subtitle: 'Menyelesaikan modul laboratorium jaringan dan robotika',
    metricBadge: 'Lab Tuntas',
    iconKey: 'terminal',
    cardBg: '#EEF2FF',
    cardBorder: '#C7D2FE',
    rankBg: '#4F46E5',
    accentColor: '#3730A3',
  },
  {
    id: 'trophy-03',
    rank: '03',
    title: 'Konsisten Semester',
    subtitle: 'Mempertahankan ritme belajar aktif setiap hari tanpa putus',
    metricBadge: '6 Hari Aktif',
    iconKey: 'flame',
    cardBg: '#FEF3C7',
    cardBorder: '#FDE68A',
    rankBg: '#D97706',
    accentColor: '#92400E',
  },
];

export const INITIAL_TASKS: AcademicTask[] = [
  {
    id: 'task-ti361-01',
    title: 'Tugas Pertemuan 5 - Aplikasi Manajemen Tugas Mahasiswa',
    course: 'Pemrograman Visual I',
    category: 'Proyek',
    description:
      'Merancang antarmuka aplikasi daftar tugas mahasiswa dengan fitur pencarian langsung, filter status penyelesaian, dan ringkasan progres.',
    deadline: '08 Nov 2026',
    status: 'Belum Dikerjakan',
  },
  {
    id: 'task-rob-02',
    title: 'Latihan 4 - Kinematika Ruang dan Transformasi Koordinat',
    course: 'Robotika',
    category: 'Praktikum',
    description:
      'Konversi koordinat bola ke kartesian dan matriks rotasi end-effector robot manipulator.',
    deadline: '04 Nov 2026',
    status: 'Selesai',
  },
  {
    id: 'task-dwdm-03',
    title: 'Analisis 3V Big Data Tokopedia dan Shopee',
    course: 'Data Warehouse & Data Mining',
    category: 'Teori',
    description:
      'Arsitektur data lake, pemrosesan aliran data, dan pemisahan sistem transaksi dengan analitik.',
    deadline: '07 Nov 2026',
    status: 'Selesai',
  },
  {
    id: 'task-kij-04',
    title: 'Praktikum Modul 1.4.1 - Uji Port Nmap Kali Linux',
    course: 'Keamanan Informasi & Jaringan',
    category: 'Praktikum',
    description:
      'Pengujian pemindaian port jaringan menggunakan Nmap 7.99 pada lingkungan Kali Linux.',
    deadline: '05 Nov 2026',
    status: 'Selesai',
  },
  {
    id: 'task-pbo-05',
    title: 'Analisis OOM Perancangan Sistem Pasar Cirebon',
    course: 'Pemodelan Berorientasi Objek',
    category: 'Proyek',
    description:
      'Pemodelan diagram kelas dan skenario kebutuhan spesifikasi harga pangan daerah Cirebon.',
    deadline: '09 Nov 2026',
    status: 'Belum Dikerjakan',
  },
];

/*
 * Central state reducer guaranteeing immutable task array updates across
 * creation, editing, deletion, status toggling, cloud sync, and restoration.
 */
export function taskReducer(
  state: AcademicTask[],
  action: TaskAction
): AcademicTask[] {
  switch (action.type) {
    case 'ADD_TASK': {
      const newTask: AcademicTask = {
        id: `task-${Date.now()}`,
        title: action.payload.title.trim(),
        course: action.payload.course.trim(),
        category: action.payload.category || 'Praktikum',
        description: action.payload.description.trim(),
        deadline: action.payload.deadline.trim(),
        status: 'Belum Dikerjakan',
      };
      return [newTask, ...state];
    }

    case 'EDIT_TASK': {
      return state.map((task) =>
        task.id === action.payload.id
          ? {
              ...task,
              title: action.payload.title.trim(),
              course: action.payload.course.trim(),
              category: action.payload.category,
              description: action.payload.description.trim(),
              deadline: action.payload.deadline.trim(),
            }
          : task
      );
    }

    case 'DELETE_TASK': {
      return state.filter((task) => task.id !== action.payload);
    }

    case 'TOGGLE_STATUS': {
      return state.map((task) =>
        task.id === action.payload
          ? {
              ...task,
              status:
                task.status === 'Selesai' ? 'Belum Dikerjakan' : 'Selesai',
            }
          : task
      );
    }

    case 'SET_TASKS': {
      return action.payload;
    }

    case 'RESET_TASKS': {
      return INITIAL_TASKS.map((task) => ({ ...task }));
    }

    default:
      return state;
  }
}
