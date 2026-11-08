export type TaskStatus = 'Belum Dikerjakan' | 'Selesai';

export type TaskFilterTab = 'Semua' | 'Belum Dikerjakan' | 'Selesai';

export type TaskCategory = 'Praktikum' | 'Proyek' | 'Teori' | 'Kuis';

export type MainBottomTab = 'tugas' | 'matakuliah' | 'progres' | 'profil';

export type AppScreenPhase = 'splash' | 'auth' | 'main';

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
  category?: TaskCategory;
  description: string;
  deadline: string;
  status: TaskStatus;
}

export interface NewTaskPayload {
  title: string;
  course: string;
  category: TaskCategory;
  description: string;
  deadline: string;
}

export interface EditTaskPayload extends NewTaskPayload {
  id: string;
}

export type TaskAction =
  | { type: 'ADD_TASK'; payload: NewTaskPayload }
  | { type: 'EDIT_TASK'; payload: EditTaskPayload }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'TOGGLE_STATUS'; payload: string }
  | { type: 'SET_TASKS'; payload: AcademicTask[] }
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

export interface CourseStickerOption {
  id: string;
  label: string;
  imageUrl: string;
  defaultIconKey: CourseIconKey;
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
  stickerUrl: string;
  pastelBg: string;
  pastelBorder: string;
  accentColor: string;
  iconBg: string;
}

export interface NewCoursePayload {
  id?: string;
  name: string;
  lecturer: string;
  credits: number;
  schedule: string;
  room: string;
  iconKey: CourseIconKey;
  stickerUrl: string;
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

export interface ClassLeaderboardPeer {
  id: string;
  name: string;
  nim: string;
  avatarUrl: string;
  weeklyBasePoints: number;
  monthlyBasePoints: number;
  weeklyCompletion: number;
  monthlyCompletion: number;
  badgeColor: string;
  surfaceColor: string;
  isCurrentUser?: boolean;
}

export interface StudentUserSession {
  uid: string;
  name: string;
  shortName: string;
  nim: string;
  classGroup: string;
  semester: string;
  program: string;
  institution: string;
  email: string;
  avatarUrl: string;
  authMethod: 'google' | 'nim';
}
