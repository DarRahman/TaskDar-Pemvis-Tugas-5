export type TaskStatus = 'Belum Dikerjakan' | 'Selesai';

export type TaskFilterTab = 'Semua' | 'Belum Dikerjakan' | 'Selesai';

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
}

export interface SearchLogEntry {
  id: string;
  timestamp: string;
  query: string;
  matchCount: number;
}
