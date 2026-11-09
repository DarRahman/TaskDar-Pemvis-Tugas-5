export type TaskStatus = 'Belum Dikerjakan' | 'Selesai';

export type PresetTaskCategory = 'Praktikum' | 'Proyek' | 'Teori';

export type TaskCategory = string;

export type TaskFilter = 'Semua' | 'Belum Dikerjakan' | 'Selesai';

export type TaskFilterTab = TaskFilter;

export type MainBottomTab = 'tugas' | 'matakuliah' | 'progres' | 'profil';

export type AppScreenPhase = 'splash' | 'auth' | 'main';

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
  authMethod: 'nim' | 'google';
}

export interface TaskMetrics {
  total: number;
  pending: number;
  completed: number;
  completionRate: number;
  urgent?: number;
}

export interface PersonalLeaderboardEntry {
  id: string;
  title: string;
  subtitle: string;
  avatarUrl: string;
  completedCount: number;
  totalCount: number;
  completionRate: number;
  xpPoints: number;
  accentColor: string;
  pastelBg: string;
}

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

export interface PodiumTrophyItem {
  id: string;
  rank: string;
  title: string;
  subtitle: string;
  metricBadge: string;
  iconKey: 'clock' | 'terminal' | 'flame';
  cardBg: string;
  cardBorder: string;
  rankBg: string;
  accentColor: string;
}

export interface TaskAttachment {
  id: string;
  name: string;
  type: 'image' | 'pdf' | 'video' | 'document';
  sizeLabel: string;
  url: string;
  mimeType: string;
}

export interface AcademicTask {
  id: string;
  courseId?: string;
  title: string;
  course: string;
  category: TaskCategory;
  description: string;
  deadline: string;
  status: TaskStatus;
  attachments?: TaskAttachment[];
}

export interface NewTaskInput {
  id?: string;
  courseId?: string;
  title: string;
  course: string;
  category: TaskCategory;
  description: string;
  deadline: string;
  attachments?: TaskAttachment[];
}

export type NewTaskPayload = NewTaskInput;

export interface EditTaskInput extends NewTaskInput {
  id: string;
}

export type EditTaskPayload = EditTaskInput;

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
  customAccentHex?: string;
}

export type TaskAction =
  | { type: 'ADD_TASK'; payload: NewTaskInput }
  | { type: 'EDIT_TASK'; payload: EditTaskInput }
  | { type: 'DELETE_TASK'; payload: string }
  | {
      type: 'DELETE_TASKS_BY_COURSE';
      payload: { courseId: string; courseName: string };
    }
  | {
      type: 'UPDATE_COURSE_ON_TASKS';
      payload: {
        courseId: string;
        oldCourseName: string;
        newCourseName: string;
      };
    }
  | { type: 'TOGGLE_STATUS'; payload: string }
  | { type: 'SET_TASKS'; payload: AcademicTask[] }
  | { type: 'RESET_TASKS' };
