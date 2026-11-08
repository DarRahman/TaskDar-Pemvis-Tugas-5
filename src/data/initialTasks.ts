import {
  AcademicTask,
  TaskAction,
  CourseDetail,
  AchievementBadge,
} from '../types/task';

export const STUDENT_METADATA = {
  name: 'Badar Rahman',
  nim: '14524303',
  classGroup: 'Kelas TI-1',
  semester: 'Semester 5',
  program: 'Teknik Informatika',
  institution: 'STIKOM Poltek Cirebon',
  academicYear: 'Tahun Akademik 2026/2027',
  streakDays: 6,
  repository: 'DarRahman/pemvis-tugas5-task-manager',
} as const;

export const COURSE_DIRECTORY: readonly CourseDetail[] = [
  {
    id: 'course-ti361',
    code: 'TI361',
    name: 'Pemrograman Visual I',
    lecturer: 'Kusnadi, M.Kom.',
    schedule: 'Senin, 08:00 - 10:30 WIB',
    room: 'Lab Mobile 1',
    credits: 3,
    iconKey: 'code',
    pastelBg: '#E6F4F1',
    pastelBorder: '#BFE3DC',
    accentColor: '#1E7A68',
    iconBg: '#2A9D8F',
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
    pastelBg: '#EAF2FF',
    pastelBorder: '#C5DCFA',
    accentColor: '#2563EB',
    iconBg: '#3B82F6',
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
    pastelBg: '#F3EEFF',
    pastelBorder: '#D9C8FF',
    accentColor: '#6D28D9',
    iconBg: '#7C3AED',
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
    pastelBg: '#FFF3E0',
    pastelBorder: '#FCD9A8',
    accentColor: '#C25E00',
    iconBg: '#EA8C28',
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
    pastelBg: '#FFEAE6',
    pastelBorder: '#FBC7BE',
    accentColor: '#C84332',
    iconBg: '#EC6B56',
  },
];

export const SEMESTER_5_COURSES: readonly string[] = COURSE_DIRECTORY.map(
  (course) => course.name
);

export const ACHIEVEMENT_BADGES: readonly AchievementBadge[] = [
  {
    id: 'badge-ontime',
    title: 'Tepat Waktu',
    subtitle: 'Menyelesaikan tugas sebelum tenggat',
    iconKey: 'clock',
    tintBg: '#E6F4F1',
    tintColor: '#1E7A68',
  },
  {
    id: 'badge-consistent',
    title: 'Konsisten',
    subtitle: 'Aktif belajar 6 hari berturut-turut',
    iconKey: 'flame',
    tintBg: '#FFEAE6',
    tintColor: '#EC6B56',
  },
  {
    id: 'badge-lab',
    title: 'Modul Praktikum',
    subtitle: 'Menuntaskan latihan lab & jaringan',
    iconKey: 'terminal',
    tintBg: '#EAF2FF',
    tintColor: '#2563EB',
  },
  {
    id: 'badge-semester',
    title: 'Tuntas Semester',
    subtitle: 'Selesaikan seluruh tugas aktif',
    iconKey: 'award',
    tintBg: '#FFF3E0',
    tintColor: '#C25E00',
  },
];

export const INITIAL_TASKS: AcademicTask[] = [
  {
    id: 'task-ti361-01',
    title: 'Tugas Pertemuan 5 - Implementasi React Native Hooks',
    course: 'Pemrograman Visual I',
    description:
      'Membangun aplikasi to-do dengan Props, useState, useEffect, useMemo, useCallback, useRef, dan useReducer.',
    deadline: '09 Nov 2026',
    status: 'Belum Dikerjakan',
  },
  {
    id: 'task-rob-02',
    title: 'Latihan 4 - Kinematika Ruang dan Transformasi Koordinat',
    course: 'Robotika',
    description:
      'Konversi koordinat bola ke kartesian dan matriks rotasi end-effector robot manipulator.',
    deadline: '04 Nov 2026',
    status: 'Selesai',
  },
  {
    id: 'task-dwdm-03',
    title: 'Analisis 3V Big Data Tokopedia dan Shopee',
    course: 'Data Warehouse & Data Mining',
    description:
      'Arsitektur data lake, streaming kafka, dan pemisahan sistem OLTP vs OLAP.',
    deadline: '07 Nov 2026',
    status: 'Selesai',
  },
  {
    id: 'task-kij-04',
    title: 'Praktikum Modul 1.4.1 - Uji Port Nmap Kali Linux',
    course: 'Keamanan Informasi & Jaringan',
    description:
      'Pengujian network scanner Nmap 7.99 pada subsistem WSL Kali Linux.',
    deadline: '05 Nov 2026',
    status: 'Selesai',
  },
  {
    id: 'task-pbo-05',
    title: 'Analisis OOM Perancangan Sistem Pasar Cirebon',
    course: 'Pemodelan Berorientasi Objek',
    description:
      'Pemodelan class diagram dan use case spesifikasi harga pangan Cirebon.',
    deadline: '14 Nov 2026',
    status: 'Belum Dikerjakan',
  },
];

/*
 * Central state reducer guaranteeing immutable task array updates across
 * creation, deletion, status toggling, and dataset restoration.
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
        description: action.payload.description.trim(),
        deadline: action.payload.deadline.trim(),
        status: 'Belum Dikerjakan',
      };
      return [newTask, ...state];
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

    case 'RESET_TASKS': {
      return INITIAL_TASKS.map((task) => ({ ...task }));
    }

    default:
      return state;
  }
}
