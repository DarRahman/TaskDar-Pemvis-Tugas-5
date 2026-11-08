export type TaskStatus = 'Belum Dikerjakan' | 'Selesai';

export type TaskFilterTab = 'Semua' | 'Belum Dikerjakan' | 'Selesai';

export type MainBottomTab = 'tugas' | 'matakuliah' | 'progres' | 'profil';

export interface AcademicTask {
  id: string;
  title: string;
  course: string;
  description: string;
  deadline: string;
  status: TaskStatus;
}

export interface NewTaskPayload {
  title: string;
  course: string;
  description: string;
  deadline: string;
}

export type TaskAction =
  | { type: 'ADD_TASK'; payload: NewTaskPayload }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'TOGGLE_STATUS'; payload: string }
  | { type: 'RESET_TASKS' };

export interface TaskMetrics {
  total: number;
  pending: number;
  completed: number;
  completionRate: number;
}

export interface CourseDetail {
  id: string;
  code: string;
  name: string;
  lecturer: string;
  schedule: string;
  room: string;
  credits: number;
  iconKey: 'code' | 'cpu' | 'database' | 'shield' | 'layers';
  pastelBg: string;
  pastelBorder: string;
  accentColor: string;
  iconBg: string;
}

export interface AchievementBadge {
  id: string;
  title: string;
  subtitle: string;
  iconKey: 'clock' | 'flame' | 'terminal' | 'award';
  tintBg: string;
  tintColor: string;
}
