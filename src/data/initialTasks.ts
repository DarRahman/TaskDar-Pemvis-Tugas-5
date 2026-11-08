import { AcademicTask, TaskAction } from '../types/task';

export const STUDENT_METADATA = {
  name: 'Badar Rahman',
  nim: '14524303',
  program: 'TI-1 (Semester 5 Teknik Informatika)',
  institution: 'STIKOM Poltek Cirebon',
  coursework: 'Pemrograman Visual I (TI361)',
  repository: 'DarRahman/pemvis-tugas5-task-manager',
} as const;

export const SEMESTER_5_COURSES: readonly string[] = [
  'Pemrograman Visual I',
  'Robotika',
  'Data Warehouse & Data Mining',
  'Keamanan Informasi & Jaringan',
  'Pemrograman Berorientasi Objek',
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
    course: 'Pemrograman Berorientasi Objek',
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
export function taskReducer(state: AcademicTask[], action: TaskAction): AcademicTask[] {
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
              status: task.status === 'Selesai' ? 'Belum Dikerjakan' : 'Selesai',
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
