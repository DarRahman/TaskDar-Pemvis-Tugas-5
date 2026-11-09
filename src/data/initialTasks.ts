import {
  AcademicTask,
  TaskAction,
  CourseDetail,
  CourseColorTheme,
  CourseIconKey,
  CourseStickerOption,
  PodiumTrophyItem,
} from '../types/task';
import { toWebpAssetPath } from '../utils/imageOptimizer';

export const STUDENT_METADATA = {
  name: 'Badar Rahman',
  shortName: 'Badar',
  nim: '14524303',
  classGroup: 'TI-1',
  semester: 'Semester 5',
  program: 'Teknik Informatika',
  institution: 'STIKOM Poltek Cirebon',
  email: 'badarrahman1905@gmail.com',
  avatarUrl: '/assets/mascot-splash.webp',
  attendanceRate: '100%',
  streakDays: 6,
} as const;

export const INDONESIAN_MONTH_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'Mei',
  'Jun',
  'Jul',
  'Agu',
  'Sep',
  'Okt',
  'Nov',
  'Des',
] as const;

export const INDONESIAN_DAY_NAMES_JS_ORDER = [
  'Minggu',
  'Senin',
  'Selasa',
  'Rabu',
  'Kamis',
  'Jumat',
  'Sabtu',
] as const;

export type IndonesianDayName = (typeof INDONESIAN_DAY_NAMES_JS_ORDER)[number];

export const WEEKDAY_FILTER_ITEMS = [
  { dayShort: 'Sen', dayFull: 'Senin' },
  { dayShort: 'Sel', dayFull: 'Selasa' },
  { dayShort: 'Rab', dayFull: 'Rabu' },
  { dayShort: 'Kam', dayFull: 'Kamis' },
  { dayShort: 'Jum', dayFull: 'Jumat' },
  { dayShort: 'Sab', dayFull: 'Sabtu' },
  { dayShort: 'Min', dayFull: 'Minggu' },
] as const;

export function formatDateToIndonesianLabel(dateObj: Date): string {
  const day = dateObj.getDate();
  const dayPadded = day < 10 ? `0${day}` : `${day}`;
  const monthShort = INDONESIAN_MONTH_SHORT[dateObj.getMonth()] ?? 'Nov';
  const year = dateObj.getFullYear();
  return `${dayPadded} ${monthShort} ${year}`;
}

export function parseIndonesianDateLabel(dateLabel: string): Date | null {
  if (!dateLabel) return null;
  const parts = dateLabel.trim().split(/\s+/);
  if (parts.length >= 3) {
    const dayNum = parseInt(parts[0], 10);
    const monthPrefix = parts[1].slice(0, 3).toLowerCase();
    const yearNum = parseInt(parts[2], 10);

    const monthIndex = INDONESIAN_MONTH_SHORT.findIndex(
      (m) => m.toLowerCase() === monthPrefix
    );

    if (!Number.isNaN(dayNum) && monthIndex >= 0 && !Number.isNaN(yearNum)) {
      const dateObj = new Date(yearNum, monthIndex, dayNum);
      dateObj.setHours(0, 0, 0, 0);
      if (!Number.isNaN(dateObj.getTime())) {
        return dateObj;
      }
    }
  }
  return null;
}

export function getIndonesianDayFromDateLabel(
  dateLabel: string
): string | null {
  const parsed = parseIndonesianDateLabel(dateLabel);
  if (!parsed) return null;
  return INDONESIAN_DAY_NAMES_JS_ORDER[parsed.getDay()] ?? null;
}

export function getDaysUntilDeadline(
  dateLabel: string,
  referenceDate: Date = new Date()
): number | null {
  const target = parseIndonesianDateLabel(dateLabel);
  if (!target) return null;
  const today = new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth(),
    referenceDate.getDate()
  );
  today.setHours(0, 0, 0, 0);
  const diffMs = target.getTime() - today.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

export function isTaskUrgent(
  task: AcademicTask,
  referenceDate: Date = new Date()
): boolean {
  if (task.status === 'Selesai') return false;
  const diffDays = getDaysUntilDeadline(task.deadline, referenceDate);
  if (diffDays === null) return true;
  return diffDays <= 3;
}

export function getTaskUrgencyMeta(
  task: AcademicTask,
  referenceDate: Date = new Date()
): {
  isUrgent: boolean;
  isOverdue: boolean;
  diffDays: number | null;
  badgeText: string | null;
} {
  if (task.status === 'Selesai') {
    return {
      isUrgent: false,
      isOverdue: false,
      diffDays: null,
      badgeText: null,
    };
  }

  const diffDays = getDaysUntilDeadline(task.deadline, referenceDate);
  if (diffDays === null) {
    return {
      isUrgent: false,
      isOverdue: false,
      diffDays: null,
      badgeText: null,
    };
  }

  if (diffDays < 0) {
    return {
      isUrgent: true,
      isOverdue: true,
      diffDays,
      badgeText: 'Terlewat',
    };
  }

  if (diffDays === 0) {
    return {
      isUrgent: true,
      isOverdue: false,
      diffDays,
      badgeText: 'Hari Ini',
    };
  }

  if (diffDays === 1) {
    return {
      isUrgent: true,
      isOverdue: false,
      diffDays,
      badgeText: 'Besok (H-1)',
    };
  }

  if (diffDays <= 3) {
    return {
      isUrgent: true,
      isOverdue: false,
      diffDays,
      badgeText: `H-${diffDays}`,
    };
  }

  return {
    isUrgent: false,
    isOverdue: false,
    diffDays,
    badgeText: null,
  };
}

export function getNextDateForIndonesianDay(
  dayName: string,
  referenceDate: Date = new Date()
): string {
  const base = new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth(),
    referenceDate.getDate()
  );
  const targetDayIndex = INDONESIAN_DAY_NAMES_JS_ORDER.findIndex(
    (d) => d.toLowerCase() === dayName.trim().toLowerCase()
  );
  if (targetDayIndex < 0) {
    return formatDateToIndonesianLabel(base);
  }
  const currentDayIndex = base.getDay();
  let delta = (targetDayIndex - currentDayIndex + 7) % 7;
  if (delta === 0) delta = 0;
  const next = new Date(base);
  next.setDate(base.getDate() + delta);
  return formatDateToIndonesianLabel(next);
}

export function getDynamicQuickDateChips(
  referenceDate: Date = new Date(),
  scheduledDayName?: string
): { label: string; value: string }[] {
  const base = new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth(),
    referenceDate.getDate()
  );

  const addDays = (days: number) => {
    const next = new Date(base);
    next.setDate(base.getDate() + days);
    return formatDateToIndonesianLabel(next);
  };

  const thirdChip = scheduledDayName
    ? {
        label: `Hari ${scheduledDayName}`,
        value: getNextDateForIndonesianDay(scheduledDayName, base),
      }
    : { label: '3 Hari Lagi', value: addDays(3) };

  return [
    { label: 'Hari Ini', value: addDays(0) },
    { label: 'Besok', value: addDays(1) },
    thirdChip,
    { label: 'Minggu Depan', value: addDays(7) },
  ];
}

export function getCourseScheduledDay(schedule: string): string {
  const firstSegment = schedule.split(',')[0]?.trim() || '';
  const matched = WEEKDAY_FILTER_ITEMS.find(
    (d) => d.dayFull.toLowerCase() === firstSegment.toLowerCase()
  );
  return matched ? matched.dayFull : 'Senin';
}

export const COURSE_STICKER_GALLERY: readonly CourseStickerOption[] = [
  {
    id: 'sticker-coding',
    label: 'Karakter Koding',
    imageUrl: '/assets/sticker-coding.webp',
    defaultIconKey: 'code',
  },
  {
    id: 'sticker-robotics',
    label: 'Karakter Robotik',
    imageUrl: '/assets/sticker-robotics.webp',
    defaultIconKey: 'cpu',
  },
  {
    id: 'sticker-data',
    label: 'Karakter Data',
    imageUrl: '/assets/sticker-data.webp',
    defaultIconKey: 'database',
  },
  {
    id: 'sticker-security',
    label: 'Karakter Siber',
    imageUrl: '/assets/sticker-security.webp',
    defaultIconKey: 'shield',
  },
  {
    id: 'sticker-oop',
    label: 'Karakter Sistem',
    imageUrl: '/assets/sticker-oop.webp',
    defaultIconKey: 'layers',
  },
  {
    id: 'sticker-ai',
    label: 'Karakter Pintar',
    imageUrl: '/assets/sticker-ai.webp',
    defaultIconKey: 'book-open',
  },
  {
    id: 'sticker-design',
    label: 'Karakter Visual',
    imageUrl: '/assets/sticker-design.webp',
    defaultIconKey: 'palette',
  },
  {
    id: 'sticker-mascot',
    label: 'Karakter Maskot',
    imageUrl: '/assets/mascot-splash.webp',
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
    name: 'Merah Utama',
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

function parseHexChannels(hexColor: string): { r: number; g: number; b: number } {
  const cleanHex = hexColor.replace('#', '').trim();
  const fullHex =
    cleanHex.length === 3
      ? cleanHex
          .split('')
          .map((c) => c + c)
          .join('')
      : cleanHex.padEnd(6, '0').slice(0, 6);

  const parsedR = parseInt(fullHex.slice(0, 2), 16);
  const parsedG = parseInt(fullHex.slice(2, 4), 16);
  const parsedB = parseInt(fullHex.slice(4, 6), 16);

  return {
    r: Number.isNaN(parsedR) ? 196 : parsedR,
    g: Number.isNaN(parsedG) ? 30 : parsedG,
    b: Number.isNaN(parsedB) ? 58 : parsedB,
  };
}

export function isLightHexColor(hexColor: string): boolean {
  const { r, g, b } = parseHexChannels(hexColor);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.64;
}

export function getReadableTextColor(hexColor: string): '#0F172A' | '#FFFFFF' {
  return isLightHexColor(hexColor) ? '#0F172A' : '#FFFFFF';
}

export function deriveBentoThemeFromHex(hexColor: string): CourseColorTheme {
  const { r, g, b } = parseHexChannels(hexColor);

  const mixWithWhite = (channel: number, whiteRatio: number) =>
    Math.round(channel * (1 - whiteRatio) + 255 * whiteRatio);

  const toHex = (n: number) =>
    Math.max(0, Math.min(255, n)).toString(16).padStart(2, '0').toUpperCase();

  const normalizedHex = `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  const isVeryLight = isLightHexColor(normalizedHex);

  const bgR = isVeryLight ? Math.max(242, r) : mixWithWhite(r, 0.85);
  const bgG = isVeryLight ? Math.max(244, g) : mixWithWhite(g, 0.85);
  const bgB = isVeryLight ? Math.max(248, b) : mixWithWhite(b, 0.85);

  const borderR = isVeryLight ? 203 : mixWithWhite(r, 0.68);
  const borderG = isVeryLight ? 213 : mixWithWhite(g, 0.68);
  const borderB = isVeryLight ? 225 : mixWithWhite(b, 0.68);

  const readableAccent = isVeryLight ? '#0F172A' : normalizedHex;

  return {
    id: 'custom',
    name: 'Warna Kustom',
    pastelBg: `#${toHex(bgR)}${toHex(bgG)}${toHex(bgB)}`,
    pastelBorder: `#${toHex(borderR)}${toHex(borderG)}${toHex(borderB)}`,
    accentColor: readableAccent,
    iconBg: normalizedHex,
  };
}

export const INITIAL_COURSES: CourseDetail[] = [
  {
    id: 'course-ti361',
    code: 'TI361',
    name: 'Pemrograman Visual I',
    lecturer: 'Rifky Hilmanudin, S.Kom., M.Kom.',
    schedule: 'Senin, 08:00 - 10:30 WIB',
    room: 'Lab Multimedia',
    credits: 3,
    iconKey: 'code',
    stickerUrl: '/assets/sticker-coding.webp',
    pastelBg: '#FEE2E2',
    pastelBorder: '#FECACA',
    accentColor: '#C41E3A',
    iconBg: '#C41E3A',
  },
  {
    id: 'course-ti362',
    code: 'TI362',
    name: 'Robotika',
    lecturer: 'Dr. Faisal Akbar, S.Kom., M.T.',
    schedule: 'Selasa, 10:30 - 13:00 WIB',
    room: 'Ruang 203',
    credits: 3,
    iconKey: 'cpu',
    stickerUrl: '/assets/sticker-robotics.webp',
    pastelBg: '#EEF2FF',
    pastelBorder: '#C7D2FE',
    accentColor: '#4F46E5',
    iconBg: '#4F46E5',
  },
  {
    id: 'course-ti363',
    code: 'TI363',
    name: 'Data Warehouse & Data Mining',
    lecturer: 'Prio Wahono, M.Kom.',
    schedule: 'Rabu, 08:00 - 10:30 WIB',
    room: 'Ruang 103',
    credits: 3,
    iconKey: 'database',
    stickerUrl: '/assets/sticker-data.webp',
    pastelBg: '#FEF3C7',
    pastelBorder: '#FDE68A',
    accentColor: '#D97706',
    iconBg: '#D97706',
  },
  {
    id: 'course-ti364',
    code: 'TI364',
    name: 'Keamanan Informasi & Jaringan',
    lecturer: 'Sergi Roseli, S.Kom., M.Kom.',
    schedule: 'Kamis, 13:00 - 15:30 WIB',
    room: 'Ruang 205',
    credits: 3,
    iconKey: 'shield',
    stickerUrl: '/assets/sticker-security.webp',
    pastelBg: '#D1FAE5',
    pastelBorder: '#A7F3D0',
    accentColor: '#059669',
    iconBg: '#059669',
  },
  {
    id: 'course-ti365',
    code: 'TI365',
    name: 'Pemodelan Berorientasi Objek',
    lecturer: 'Wahyu Ariandi, S.Kom., M.Cs.',
    schedule: 'Jumat, 08:00 - 10:30 WIB',
    room: 'Ruang 103',
    credits: 3,
    iconKey: 'layers',
    stickerUrl: '/assets/sticker-oop.webp',
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
    subtitle: 'Mempertahankan ketuntasan tugas kuliah pada seluruh mata kuliah',
    metricBadge: 'Target Tuntas',
    iconKey: 'flame',
    cardBg: '#FEF3C7',
    cardBorder: '#FDE68A',
    rankBg: '#D97706',
    accentColor: '#92400E',
  },
];

/*
 * Authentic academic tasks aligned 1:1 with each course's ID and scheduled day:
 * - Pemrograman Visual I (course-ti361, Senin) -> 09 Nov 2026 (Senin)
 * - Robotika (course-ti362, Selasa) -> 10 Nov 2026 (Selasa)
 * - Data Warehouse & Data Mining (course-ti363, Rabu) -> 11 Nov 2026 (Rabu)
 * - Keamanan Informasi & Jaringan (course-ti364, Kamis) -> 05 Nov 2026 (Kamis)
 * - Pemodelan Berorientasi Objek (course-ti365, Jumat) -> 06 Nov 2026 (Jumat)
 */
export const INITIAL_TASKS: AcademicTask[] = [
  {
    id: 'task-ti361-01',
    courseId: 'course-ti361',
    title: 'Tugas Pertemuan 5 - Aplikasi Manajemen Tugas Mahasiswa',
    course: 'Pemrograman Visual I',
    category: 'Proyek',
    description:
      'Merancang antarmuka aplikasi daftar tugas mahasiswa dengan fitur pencarian langsung, filter status penyelesaian, dan ringkasan progres.',
    deadline: '09 Nov 2026',
    status: 'Belum Dikerjakan',
    attachments: [],
  },
  {
    id: 'task-ti361-02',
    courseId: 'course-ti361',
    title: 'Tugas Pertemuan 3 & 4 - Komponen & State Management React Native',
    course: 'Pemrograman Visual I',
    category: 'Teori',
    description:
      'Implementasi hooks useState, useEffect, useMemo, useCallback, useRef, dan useReducer pada antarmuka mobile.',
    deadline: '02 Nov 2026',
    status: 'Selesai',
    attachments: [],
  },
  {
    id: 'task-ti361-03',
    courseId: 'course-ti361',
    title: 'Tugas Pertemuan 2 - Sintaks ES6, State, dan Props Dasar',
    course: 'Pemrograman Visual I',
    category: 'Teori',
    description:
      'Pengenalan props, immutable data, functional component, dan siklus render antarmuka React Native.',
    deadline: '19 Okt 2026',
    status: 'Selesai',
    attachments: [],
  },
  {
    id: 'task-rob-04',
    courseId: 'course-ti362',
    title: 'Tugas 2 Robotika 26/27 - Kinematika dan Transformasi Koordinat',
    course: 'Robotika',
    category: 'Praktikum',
    description:
      'Perhitungan kinematika maju, koordinat silinder, dan matriks rotasi 3D robot manipulator.',
    deadline: '15 Okt 2026',
    status: 'Selesai',
    attachments: [],
  },
  {
    id: 'task-dwdm-05',
    courseId: 'course-ti363',
    title: 'Tugas 2 - Analisis Fenomena 3V Big Data Tokopedia dan Shopee',
    course: 'Data Warehouse & Data Mining',
    category: 'Teori',
    description:
      'Karakteristik Volume, Velocity, Variety pada arsitektur data lake e-commerce dan pipeline analitik data.',
    deadline: '28 Okt 2026',
    status: 'Selesai',
    attachments: [],
  },
];

/*
 * Strict relational resolver between an AcademicTask and its parent CourseDetail.
 * Matches by courseId first, then by normalized course name. Never returns an unrelated course.
 */
export function resolveCourseForTask(
  task: Pick<AcademicTask, 'courseId' | 'course'>,
  courses: readonly CourseDetail[]
): CourseDetail | undefined {
  if (task.courseId) {
    const byId = courses.find((c) => c.id === task.courseId);
    if (byId) return byId;
  }
  const normalizedName = (task.course || '').trim().toLowerCase();
  if (!normalizedName) return undefined;
  return courses.find((c) => c.name.trim().toLowerCase() === normalizedName);
}

const LEGACY_INITIAL_DEADLINE_FIXES: Record<string, string> = {
  'task-ti361-01:08 Nov 2026': '09 Nov 2026',
  'task-rob-02:04 Nov 2026': '10 Nov 2026',
  'task-dwdm-03:07 Nov 2026': '11 Nov 2026',
  'task-pbo-05:09 Nov 2026': '06 Nov 2026',
};

/*
 * Sanitizes, deduplicates, and enforces 1:1 referential integrity between courses and tasks.
 * Any orphaned task whose parent course was deleted is pruned, and duplicate tasks are removed.
 */
export function sanitizeAndLinkCoursesAndTasks(
  rawCourses: readonly CourseDetail[],
  rawTasks: readonly AcademicTask[]
): {
  courses: CourseDetail[];
  tasks: AcademicTask[];
  removedTaskIds: string[];
} {
  const seenCourseIds = new Set<string>();
  const seenCourseNames = new Set<string>();
  const cleanCourses: CourseDetail[] = [];

  for (const c of rawCourses) {
    if (!c || !c.name) continue;
    const normId = (c.id || '').trim();
    const normName = c.name.trim().toLowerCase();
    if (!normId || seenCourseIds.has(normId) || seenCourseNames.has(normName)) {
      continue;
    }
    seenCourseIds.add(normId);
    seenCourseNames.add(normName);
    cleanCourses.push({
      ...c,
      id: normId,
      name: c.name.trim(),
      stickerUrl: toWebpAssetPath(c.stickerUrl),
    });
  }

  const seenTaskIds = new Set<string>();
  const seenTaskSignatures = new Set<string>();
  const cleanTasks: AcademicTask[] = [];
  const removedTaskIds: string[] = [];

  for (const t of rawTasks) {
    if (!t || !t.title) continue;
    const normId = (t.id || '').trim();
    const matchedCourse = resolveCourseForTask(t, cleanCourses);

    /* If parent course no longer exists (deleted), prune this orphaned task */
    if (!matchedCourse) {
      if (normId) removedTaskIds.push(normId);
      continue;
    }

    const upgradedDeadline =
      LEGACY_INITIAL_DEADLINE_FIXES[`${normId}:${t.deadline}`] ||
      t.deadline.trim();

    const signature = `${matchedCourse.id}::${t.title.trim().toLowerCase()}`;
    if (
      !normId ||
      seenTaskIds.has(normId) ||
      seenTaskSignatures.has(signature)
    ) {
      if (normId && !seenTaskIds.has(normId)) {
        removedTaskIds.push(normId);
      }
      continue;
    }

    seenTaskIds.add(normId);
    seenTaskSignatures.add(signature);
    cleanTasks.push({
      ...t,
      id: normId,
      courseId: matchedCourse.id,
      course: matchedCourse.name,
      title: t.title.trim(),
      category: (t.category || 'Praktikum').trim() || 'Praktikum',
      deadline: upgradedDeadline,
    });
  }

  return {
    courses: cleanCourses,
    tasks: cleanTasks,
    removedTaskIds,
  };
}

export function taskReducer(
  state: AcademicTask[],
  action: TaskAction
): AcademicTask[] {
  switch (action.type) {
    case 'ADD_TASK': {
      const createdId = action.payload.id || `task-${Date.now()}`;
      const filteredState = state.filter((t) => t.id !== createdId);
      const newTask: AcademicTask = {
        id: createdId,
        courseId: action.payload.courseId,
        title: action.payload.title.trim(),
        course: action.payload.course.trim(),
        category: action.payload.category.trim() || 'Praktikum',
        description: action.payload.description.trim(),
        deadline: action.payload.deadline.trim(),
        status: 'Belum Dikerjakan',
        attachments: action.payload.attachments || [],
      };
      return [newTask, ...filteredState];
    }

    case 'EDIT_TASK': {
      return state.map((task) =>
        task.id === action.payload.id
          ? {
              ...task,
              courseId: action.payload.courseId ?? task.courseId,
              title: action.payload.title.trim(),
              course: action.payload.course.trim(),
              category: action.payload.category.trim() || 'Praktikum',
              description: action.payload.description.trim(),
              deadline: action.payload.deadline.trim(),
              attachments: action.payload.attachments ?? task.attachments ?? [],
            }
          : task
      );
    }

    case 'DELETE_TASK': {
      return state.filter((task) => task.id !== action.payload);
    }

    case 'DELETE_TASKS_BY_COURSE': {
      const targetId = action.payload.courseId;
      const targetName = action.payload.courseName.trim().toLowerCase();
      return state.filter(
        (task) =>
          task.courseId !== targetId &&
          task.course.trim().toLowerCase() !== targetName
      );
    }

    case 'UPDATE_COURSE_ON_TASKS': {
      const { courseId, oldCourseName, newCourseName } = action.payload;
      const oldNorm = oldCourseName.trim().toLowerCase();
      return state.map((task) => {
        if (
          task.courseId === courseId ||
          task.course.trim().toLowerCase() === oldNorm
        ) {
          return {
            ...task,
            courseId,
            course: newCourseName.trim(),
          };
        }
        return task;
      });
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
