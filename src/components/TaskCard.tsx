import React, { useState } from 'react';
import {
  Check,
  Trash2,
  Code2,
  Cpu,
  Database,
  ShieldCheck,
  Terminal,
  BookOpen,
  BarChart2,
  Layers,
  Globe,
  Smartphone,
  Palette,
  Briefcase,
  Calendar,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { AcademicTask, CourseDetail, CourseIconKey } from '../types/task';
import { INITIAL_COURSES } from '../data/initialTasks';

export interface TaskCardProps {
  task: AcademicTask;
  onToggleStatus: (id: string) => void;
  onDeleteTask: (id: string) => void;
  courses?: readonly CourseDetail[];
  isDarkMode?: boolean;
}

export function renderSubjectIconByKey(
  iconKey: CourseIconKey,
  className = 'w-6 h-6 text-white'
) {
  switch (iconKey) {
    case 'code':
      return <Code2 className={className} aria-hidden="true" />;
    case 'cpu':
      return <Cpu className={className} aria-hidden="true" />;
    case 'database':
      return <Database className={className} aria-hidden="true" />;
    case 'shield':
      return <ShieldCheck className={className} aria-hidden="true" />;
    case 'terminal':
      return <Terminal className={className} aria-hidden="true" />;
    case 'book-open':
      return <BookOpen className={className} aria-hidden="true" />;
    case 'bar-chart-2':
      return <BarChart2 className={className} aria-hidden="true" />;
    case 'layers':
      return <Layers className={className} aria-hidden="true" />;
    case 'globe':
      return <Globe className={className} aria-hidden="true" />;
    case 'smartphone':
      return <Smartphone className={className} aria-hidden="true" />;
    case 'palette':
      return <Palette className={className} aria-hidden="true" />;
    case 'briefcase':
      return <Briefcase className={className} aria-hidden="true" />;
    default:
      return <BookOpen className={className} aria-hidden="true" />;
  }
}

function getCourseBentoStyle(
  courseName: string,
  courses: readonly CourseDetail[]
) {
  const matched = courses.find(
    (c) => c.name.toLowerCase() === courseName.toLowerCase()
  );

  if (matched) {
    return {
      icon: renderSubjectIconByKey(matched.iconKey, 'w-6 h-6 text-white'),
      iconBg: matched.iconBg,
      pastelBg: matched.pastelBg,
      pastelBorder: matched.pastelBorder,
      accentColor: matched.accentColor,
    };
  }

  const normalized = courseName.toLowerCase();
  let fallbackKey: CourseIconKey = 'book-open';
  if (normalized.includes('visual') || normalized.includes('mobile')) {
    fallbackKey = 'code';
  } else if (normalized.includes('robot')) {
    fallbackKey = 'cpu';
  } else if (normalized.includes('data') || normalized.includes('warehouse')) {
    fallbackKey = 'database';
  } else if (normalized.includes('keamanan') || normalized.includes('jaringan')) {
    fallbackKey = 'shield';
  } else if (normalized.includes('objek') || normalized.includes('pbo')) {
    fallbackKey = 'layers';
  }

  return {
    icon: renderSubjectIconByKey(fallbackKey, 'w-6 h-6 text-white'),
    iconBg: '#C41E3A',
    pastelBg: '#FEE2E2',
    pastelBorder: '#FECACA',
    accentColor: '#C41E3A',
  };
}

/*
 * Compact Bento TaskCard component receiving data and action callbacks via Props.
 * Description text is collapsed by default and expands smoothly on card tap
 * so the primary feed stays clean and scannable.
 */
export const TaskCard: React.FC<TaskCardProps> = React.memo(
  ({
    task,
    onToggleStatus,
    onDeleteTask,
    courses = INITIAL_COURSES,
    isDarkMode = false,
  }) => {
    const [isExpanded, setIsExpanded] = useState<boolean>(false);
    const isCompleted = task.status === 'Selesai';
    const { icon, iconBg, pastelBg, pastelBorder, accentColor } =
      getCourseBentoStyle(task.course, courses);

    return (
      <article
        style={
          isDarkMode
            ? undefined
            : {
                backgroundColor: isCompleted ? '#F8FAFC' : pastelBg,
                borderColor: isCompleted ? '#E2E8F0' : pastelBorder,
              }
        }
        className={`relative rounded-3xl border-2 transition-all duration-150 p-3.5 ${
          isDarkMode
            ? isCompleted
              ? 'bg-[#1F242D]/60 border-[#2E3440]'
              : 'bg-[#232934] border-[#323A48]'
            : 'shadow-xs'
        }`}
      >
        <div className="flex items-center gap-3.5">
          {/* Left: 48x48pt Rounded Container in Course Accent Color */}
          <div
            style={{ backgroundColor: iconBg }}
            onClick={() => setIsExpanded((prev) => !prev)}
            className={`w-12 h-12 min-w-[48px] min-h-[48px] rounded-2xl flex items-center justify-center shrink-0 shadow-xs cursor-pointer transition-opacity ${
              isCompleted ? 'opacity-50' : 'opacity-100'
            }`}
          >
            {icon}
          </div>

          {/* Center: 1-Line Bold Assignment Title, Course Subtitle & Deadline */}
          <div
            className="flex-1 min-w-0 cursor-pointer select-none"
            onClick={() => setIsExpanded((prev) => !prev)}
            role="button"
            tabIndex={0}
            aria-expanded={isExpanded}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setIsExpanded((prev) => !prev);
              }
            }}
          >
            <div className="flex items-center gap-1.5 text-[11px] font-extrabold">
              <span
                style={{
                  color: isDarkMode ? '#CBD5E1' : accentColor,
                }}
                className="truncate"
              >
                {task.course}
              </span>
              <span
                aria-hidden="true"
                className={isDarkMode ? 'text-[#64748B]' : 'text-[#64748B]'}
              >
                ·
              </span>
              <span
                className={
                  isCompleted
                    ? 'text-[#059669]'
                    : isDarkMode
                    ? 'text-[#FBBF24]'
                    : 'text-[#0F172A]'
                }
              >
                {task.status}
              </span>
            </div>

            {/* 1-Line Bold Assignment Title */}
            <h3
              className={`mt-0.5 text-sm font-extrabold leading-snug ${
                isExpanded ? '' : 'truncate'
              } ${
                isCompleted
                  ? 'line-through text-[#64748B]'
                  : isDarkMode
                  ? 'text-white'
                  : 'text-[#0F172A]'
              }`}
            >
              {task.title}
            </h3>

            {/* High-Contrast Deadline Row + Expand Indicator */}
            <div className="mt-1.5 flex items-center justify-between gap-2">
              <div
                className={`inline-flex items-center gap-1 text-[11px] font-mono tabular-nums font-bold ${
                  isCompleted
                    ? 'text-[#64748B]'
                    : isDarkMode
                    ? 'text-[#CBD5E1]'
                    : 'text-[#0F172A]'
                }`}
              >
                <Calendar className="w-3 h-3 shrink-0" aria-hidden="true" />
                <span>{task.deadline}</span>
              </div>

              <span
                className={`inline-flex items-center gap-0.5 text-[10px] font-bold ${
                  isDarkMode ? 'text-[#94A3B8]' : 'text-[#475569]'
                }`}
              >
                <span>{isExpanded ? 'Tutup' : 'Rincian'}</span>
                {isExpanded ? (
                  <ChevronUp className="w-3 h-3" aria-hidden="true" />
                ) : (
                  <ChevronDown className="w-3 h-3" aria-hidden="true" />
                )}
              </span>
            </div>
          </div>

          {/* Right: 44x44pt Tactile Checkmark Toggle & Delete Button */}
          <div className="flex items-center gap-0.5 shrink-0 -mr-1.5">
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
                    ? 'bg-[#059669] border-[#059669] text-white'
                    : isDarkMode
                    ? 'bg-transparent border-[#94A3B8] hover:border-[#C41E3A]'
                    : 'bg-white border-[#0F172A]/40 hover:border-[#C41E3A]'
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
                  : 'text-[#475569] hover:text-[#C41E3A] hover:bg-white/70'
              }`}
            >
              <Trash2 className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Expandable Accordion Instructions */}
        {isExpanded && (
          <div
            className={`mt-3 pt-2.5 border-t text-xs leading-relaxed ${
              isDarkMode
                ? 'border-[#323A48] text-[#CBD5E1]'
                : 'border-black/10 text-[#1E293B]'
            }`}
          >
            {task.description}
          </div>
        )}
      </article>
    );
  }
);

TaskCard.displayName = 'TaskCard';
