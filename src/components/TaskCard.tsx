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
import { COURSE_DIRECTORY } from '../data/initialTasks';

export interface TaskCardProps {
  task: AcademicTask;
  onToggleStatus: (id: string) => void;
  onDeleteTask: (id: string) => void;
  isDarkMode?: boolean;
}

function getCourseStyleAndIcon(courseName: string) {
  const matched = COURSE_DIRECTORY.find(
    (c) => c.name.toLowerCase() === courseName.toLowerCase()
  );
  const normalized = courseName.toLowerCase();

  let icon = <BookOpen className="w-4 h-4 text-white" aria-hidden="true" />;
  if (normalized.includes('visual') || normalized.includes('mobile')) {
    icon = <Code2 className="w-4 h-4 text-white" aria-hidden="true" />;
  } else if (normalized.includes('robot')) {
    icon = <Cpu className="w-4 h-4 text-white" aria-hidden="true" />;
  } else if (normalized.includes('data') || normalized.includes('warehouse')) {
    icon = <Database className="w-4 h-4 text-white" aria-hidden="true" />;
  } else if (normalized.includes('keamanan') || normalized.includes('jaringan')) {
    icon = <ShieldCheck className="w-4 h-4 text-white" aria-hidden="true" />;
  } else if (normalized.includes('objek') || normalized.includes('pbo')) {
    icon = <Layers className="w-4 h-4 text-white" aria-hidden="true" />;
  }

  return {
    icon,
    iconBg: matched?.iconBg ?? '#EC6B56',
    pastelBg: matched?.pastelBg ?? '#FFEAE6',
    accentColor: matched?.accentColor ?? '#C84332',
  };
}

/*
 * Pure child component receiving task data and action callbacks via Props.
 * Maintains 44x44pt minimum touch hitboxes and WCAG AA contrast ratios.
 */
export const TaskCard: React.FC<TaskCardProps> = React.memo(
  ({ task, onToggleStatus, onDeleteTask, isDarkMode = false }) => {
    const isCompleted = task.status === 'Selesai';
    const { icon, iconBg } = getCourseStyleAndIcon(task.course);

    return (
      <article
        className={`relative rounded-3xl border transition-all duration-150 p-4 ${
          isDarkMode
            ? isCompleted
              ? 'bg-[#1F242D]/60 border-[#2E3440]'
              : 'bg-[#232934] border-[#323A48]'
            : isCompleted
            ? 'bg-[#F4EFE6]/85 border-[#E6DEC8]'
            : 'bg-white border-[#EFE8DC] shadow-xs'
        }`}
      >
        <div className="flex items-start gap-3.5">
          {/* Subject Vector Icon Badge */}
          <div
            style={{ backgroundColor: iconBg }}
            className={`mt-0.5 w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 transition-opacity ${
              isCompleted ? 'opacity-55' : 'opacity-100'
            }`}
          >
            {icon}
          </div>

          {/* Task Content Column */}
          <div
            className="flex-1 min-w-0 cursor-pointer select-none"
            onClick={() => onToggleStatus(task.id)}
          >
            {/* Unboxed Course & Status Line */}
            <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs font-semibold">
              <span
                className={`truncate ${
                  isDarkMode ? 'text-[#CBD5E1]' : 'text-[#5C5549]'
                }`}
              >
                {task.course}
              </span>
              <span
                aria-hidden="true"
                className={isDarkMode ? 'text-[#64748B]' : 'text-[#A39B8B]'}
              >
                ·
              </span>
              <span
                className={
                  isCompleted
                    ? isDarkMode
                      ? 'text-[#34D399]'
                      : 'text-[#1E7A68]'
                    : isDarkMode
                    ? 'text-[#FBBF24]'
                    : 'text-[#C25E00]'
                }
              >
                {task.status}
              </span>
            </div>

            {/* Task Title */}
            <h3
              className={`mt-1 text-[15px] font-bold leading-snug transition-colors ${
                isCompleted
                  ? isDarkMode
                    ? 'line-through text-[#64748B]'
                    : 'line-through text-[#8C8476]'
                  : isDarkMode
                  ? 'text-[#F8FAFC]'
                  : 'text-[#1E1B18]'
              }`}
            >
              {task.title}
            </h3>

            {/* Task Description */}
            <p
              className={`mt-1.5 text-xs leading-relaxed ${
                isCompleted
                  ? isDarkMode
                    ? 'text-[#64748B]'
                    : 'text-[#968E80]'
                  : isDarkMode
                  ? 'text-[#94A3B8]'
                  : 'text-[#5C5549]'
              }`}
            >
              {task.description}
            </p>

            {/* Unboxed Footer Deadline */}
            <div
              className={`mt-2.5 flex items-center gap-1.5 text-xs font-mono tabular-nums ${
                isDarkMode ? 'text-[#94A3B8]' : 'text-[#6E6658]'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>Tenggat: {task.deadline}</span>
            </div>
          </div>

          {/* Right Action Controls: 44x44pt minimum touch targets */}
          <div className="flex items-center gap-0.5 shrink-0 -mr-1.5 -mt-1">
            <button
              type="button"
              onClick={() => onToggleStatus(task.id)}
              aria-label={
                isCompleted
                  ? `Tandai ${task.title} sebagai belum dikerjakan`
                  : `Tandai ${task.title} sebagai selesai`
              }
              title={isCompleted ? 'Ubah ke Belum Dikerjakan' : 'Tandai Selesai'}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-2xl transition-transform active:scale-95"
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-colors duration-150 ${
                  isCompleted
                    ? 'bg-[#2A9D8F] border-[#2A9D8F] text-white'
                    : isDarkMode
                    ? 'bg-transparent border-[#64748B] hover:border-[#EC6B56]'
                    : 'bg-transparent border-[#B5AC9C] hover:border-[#EC6B56]'
                }`}
              >
                {isCompleted && (
                  <Check className="w-3.5 h-3.5 stroke-[3]" aria-hidden="true" />
                )}
              </span>
            </button>

            <button
              type="button"
              onClick={() => onDeleteTask(task.id)}
              aria-label={`Hapus tugas ${task.title}`}
              title="Hapus Tugas"
              className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-2xl transition-colors ${
                isDarkMode
                  ? 'text-[#94A3B8] hover:text-[#F87171] hover:bg-[#3B2329]'
                  : 'text-[#8C8476] hover:text-[#C84332] hover:bg-[#FFEAE6]'
              }`}
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
