import React from 'react';
import {
  Check,
  Trash2,
  Code2,
  Cpu,
  Database,
  ShieldCheck,
  Layers,
  BookOpen,
  Calendar,
} from 'lucide-react';
import { AcademicTask } from '../types/task';

export interface TaskCardProps {
  task: AcademicTask;
  onToggleStatus: (id: string) => void;
  onDeleteTask: (id: string) => void;
}

/*
 * Maps each Semester 5 course to a distinct vector icon so visual scanning
 * remains rapid without relying on prohibited Unicode emojis.
 */
function getCourseIcon(courseName: string) {
  const normalized = courseName.toLowerCase();
  if (normalized.includes('visual') || normalized.includes('mobile')) {
    return <Code2 className="w-4 h-4 text-[#18181B]" aria-hidden="true" />;
  }
  if (normalized.includes('robot')) {
    return <Cpu className="w-4 h-4 text-[#18181B]" aria-hidden="true" />;
  }
  if (normalized.includes('data') || normalized.includes('warehouse')) {
    return <Database className="w-4 h-4 text-[#18181B]" aria-hidden="true" />;
  }
  if (normalized.includes('keamanan') || normalized.includes('jaringan')) {
    return <ShieldCheck className="w-4 h-4 text-[#18181B]" aria-hidden="true" />;
  }
  if (normalized.includes('objek') || normalized.includes('pbo')) {
    return <Layers className="w-4 h-4 text-[#18181B]" aria-hidden="true" />;
  }
  return <BookOpen className="w-4 h-4 text-[#18181B]" aria-hidden="true" />;
}

/*
 * Dedicated child component receiving data and mutation callbacks exclusively
 * via Props to satisfy Requirement 1 (Component Delegation) and prevent
 * unnecessary re-renders when sibling items change.
 */
export const TaskCard: React.FC<TaskCardProps> = React.memo(
  ({ task, onToggleStatus, onDeleteTask }) => {
    const isCompleted = task.status === 'Selesai';

    return (
      <article
        className={`group relative rounded-2xl border transition-colors duration-150 ${
          isCompleted
            ? 'bg-[#EFECE6]/75 border-[#E4E2DD]'
            : 'bg-white border-[#E4E2DD] hover:border-[#C8C5BC]'
        } p-4`}
      >
        <div className="flex items-start gap-3">
          {/* Course Vector Glyph Container */}
          <div
            className={`mt-0.5 w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
              isCompleted
                ? 'bg-[#E6E3DC] border-[#D8D5CD] opacity-70'
                : 'bg-[#F5F5F3] border-[#E4E2DD]'
            }`}
          >
            {getCourseIcon(task.course)}
          </div>

          {/* Primary Content Column */}
          <div
            className="flex-1 min-w-0 cursor-pointer select-none"
            onClick={() => onToggleStatus(task.id)}
          >
            {/* Unboxed Metadata Kicker: Course · Status */}
            <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs font-medium text-[#52524E]">
              <span className="truncate">{task.course}</span>
              <span aria-hidden="true">·</span>
              <span
                className={
                  isCompleted
                    ? 'text-[#1E5E4E] font-semibold'
                    : 'text-[#854D0E] font-semibold'
                }
              >
                {task.status}
              </span>
            </div>

            {/* Task Title */}
            <h3
              className={`mt-1 text-[15px] font-semibold leading-snug transition-colors ${
                isCompleted
                  ? 'line-through text-[#64645E]'
                  : 'text-[#18181B]'
              }`}
            >
              {task.title}
            </h3>

            {/* Task Description */}
            <p
              className={`mt-1.5 text-[13px] leading-relaxed ${
                isCompleted ? 'text-[#71716A]' : 'text-[#484843]'
              }`}
            >
              {task.description}
            </p>

            {/* Unboxed Footer Metadata: Deadline */}
            <div className="mt-2.5 flex items-center gap-1.5 text-xs font-mono tabular-nums text-[#52524E]">
              <Calendar className="w-3.5 h-3.5 shrink-0 text-[#64645E]" aria-hidden="true" />
              <span>Tenggat: {task.deadline}</span>
            </div>
          </div>

          {/* Right Action Controls: 44x44pt minimum touch targets */}
          <div className="flex items-center gap-1 shrink-0 -mr-1 -mt-1">
            <button
              type="button"
              onClick={() => onToggleStatus(task.id)}
              aria-label={
                isCompleted
                  ? `Tandai ${task.title} sebagai belum dikerjakan`
                  : `Tandai ${task.title} sebagai selesai`
              }
              title={isCompleted ? 'Ubah ke Belum Dikerjakan' : 'Tandai Selesai'}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#18181B] transition-transform active:scale-95"
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-colors duration-150 ${
                  isCompleted
                    ? 'bg-[#18181B] border-[#18181B] text-white'
                    : 'bg-transparent border-[#71716A] hover:border-[#18181B]'
                }`}
              >
                {isCompleted && <Check className="w-3.5 h-3.5 stroke-[2.75]" aria-hidden="true" />}
              </span>
            </button>

            <button
              type="button"
              onClick={() => onDeleteTask(task.id)}
              aria-label={`Hapus tugas ${task.title}`}
              title="Hapus Tugas"
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-[#64645E] hover:text-[#B91C1C] hover:bg-[#FEE2E2]/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B91C1C] transition-colors"
            >
              <Trash2 className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </article>
    );
  }
);

TaskCard.displayName = 'TaskCard';
