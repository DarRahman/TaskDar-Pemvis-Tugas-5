export type TaskStatus = 'Belum Dikerjakan' | 'Selesai';

export type TaskFilterTab = 'Semua' | 'Belum Dikerjakan' | 'Selesai';

export type MainBottomTab = 'tugas' | 'matakuliah' | 'progres' | 'profil';

export type CourseIconKey =
  | 'code'
  | 'cpu'
  | 'database'
  | 'shield'
  | 'terminal'
  | 'book-open'
  | 'bar-chart-2'
  | 'layers'
  | 'globe'
  | 'smartphone'
  | 'palette'
  | 'briefcase';

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

export interface CourseColorTheme {
  id: string;
  name: string;
  pastelBg: string;
  pastelBorder: string;
  accentColor: string;
  iconBg: string;
}

export interface CourseDetail {
  id: string;
  code: string;
  name: string;
  lecturer: string;
  schedule: string;
  room: string;
  credits: number;
  iconKey: CourseIconKey;
  pastelBg: string;
  pastelBorder: string;
  accentColor: string;
  iconBg: string;
}

export interface NewCoursePayload {
  name: string;
  lecturer: string;
  credits: number;
  schedule: string;
  room: string;
  iconKey: CourseIconKey;
  colorThemeId: string;
}

export interface PodiumTrophyItem {
  id: string;
  rank: '01' | '02' | '03';
  title: string;
  subtitle: string;
  metricBadge: string;
  iconKey: 'clock' | 'terminal' | 'flame';
  cardBg: string;
  cardBorder: string;
  rankBg: string;
  accentColor: string;
}
