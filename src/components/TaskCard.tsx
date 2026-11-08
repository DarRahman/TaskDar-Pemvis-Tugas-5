import React, { useState } from 'react';
import {
  Check,
  Trash2,
  Pencil,
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
  onEditTask?: (task: AcademicTask) => void;
  courses?: readonly CourseDetail[];
  layoutMode?: 'grid' | 'list';
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
      icon: renderSubjectIconByKey(matched.iconKey, 'w-5 h-5 text-white'),
      stickerUrl: matched.stickerUrl || '/assets/sticker-coding.jpg',
      iconBg: matched.iconBg,
      pastelBg: matched.pastelBg,
      pastelBorder: matched.pastelBorder,
      accentColor: matched.accentColor,
    };
  }

  return {
    icon: renderSubjectIconByKey('code', 'w-5 h-5 text-white'),
    stickerUrl: '/assets/sticker-coding.jpg',
    iconBg: '#C41E3A',
    pastelBg: '#FEE2E2',
    pastelBorder: '#FECACA',
    accentColor: '#C41E3A',
  };
}

/*
 * Visual Bento TaskCard component supporting both 2-column Aptivo Bento Grid
 * and Charmi-style Wide Character Card with aligned single-line deadline chips.
 */
export const TaskCard: React.FC<TaskCardProps> = React.memo(
  ({
    task,
    onToggleStatus,
    onDeleteTask,
    onEditTask,
    courses = INITIAL_COURSES,
    layoutMode = 'list',
    isDarkMode = false,
  }) => {
    const [isExpanded, setIsExpanded] = useState<boolean>(false);
    const isCompleted = task.status === 'Selesai';
    const { stickerUrl, iconBg, pastelBg, accentColor } = getCourseBentoStyle(
      task.course,
      courses
    );

    if (layoutMode === 'grid') {
      return (
        <article
          style={
            isDarkMode
              ? undefined
              : {
                  backgroundColor: isCompleted ? '#F8FAFC' : pastelBg,
                  borderColor: isCompleted ? '#CBD5E1' : '#0F172A',
                }
          }
          className={`rounded-[26px] border-2 p-3.5 flex flex-col justify-between transition-all ${
            isDarkMode ? 'bg-[#1F242D] border-[#2E3440]' : 'shadow-xs'
          }`}
        >
          {/* Top Row: Character Sticker + Checkmark */}
          <div className="flex items-start justify-between gap-2">
            <div
              onClick={() => setIsExpanded((prev) => !prev)}
              className={`w-14 h-14 rounded-2xl border-2 border-[#0F172A] overflow-hidden bg-white shrink-0 cursor-pointer shadow-2xs ${
                isCompleted ? 'opacity-55 grayscale' : ''
              }`}
            >
              <img
                src={stickerUrl}
                alt={task.course}
                className="w-full h-full object-cover"
              />
            </div>

            <button
              type="button"
              onClick={() => onToggleStatus(task.id)}
              aria-label={
                isCompleted
                  ? `Tandai ${task.title} belum selesai`
                  : `Tandai ${task.title} selesai`
              }
              className="min-w-[44px] min-h-[44px] -mt-1 -mr-1 flex items-center justify-center"
            >
              <span
                className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-colors ${
                  isCompleted
                    ? 'bg-[#059669] border-[#0F172A] text-white'
                    : 'bg-white border-[#0F172A] text-transparent hover:border-[#C41E3A]'
                }`}
              >
                <Check className="w-4 h-4 stroke-[3]" aria-hidden="true" />
              </span>
            </button>
          </div>

          {/* Center Course & Title */}
          <div
            onClick={() => setIsExpanded((prev) => !prev)}
            className="mt-2.5 cursor-pointer"
          >
            <div className="flex items-center gap-1.5 flex-wrap">
              <span
                style={{ backgroundColor: iconBg }}
                className="px-2 py-0.5 rounded-lg text-[10px] font-extrabold text-white whitespace-nowrap"
              >
                {task.category || 'Tugas'}
              </span>
              <span
                style={{ color: isDarkMode ? '#CBD5E1' : accentColor }}
                className="text-[11px] font-extrabold truncate"
              >
                {task.course}
              </span>
            </div>

            <h3
              className={`mt-1 text-xs sm:text-[13px] font-extrabold leading-snug ${
                isExpanded ? '' : 'line-clamp-2'
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

            {isExpanded && (
              <p
                className={`mt-1.5 text-[11px] leading-relaxed ${
                  isDarkMode ? 'text-[#CBD5E1]' : 'text-[#334155]'
                }`}
              >
                {task.description}
              </p>
            )}
          </div>

          {/* Footer Row: Single-Line Deadline + Edit/Delete */}
          <div className="mt-3 pt-2 border-t border-black/10 flex items-center justify-between gap-1.5">
            <span
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-xl border text-[10px] font-extrabold whitespace-nowrap shrink-0 ${
                isDarkMode
                  ? 'bg-[#141821] border-[#2E3440] text-[#CBD5E1]'
                  : 'bg-white border-[#0F172A]/20 text-[#0F172A]'
              }`}
            >
              <Calendar
                style={{ color: iconBg }}
                className="w-3 h-3 shrink-0"
                aria-hidden="true"
              />
              <span>{task.deadline}</span>
            </span>

            <div className="flex items-center -mr-1">
              {onEditTask && (
                <button
                  type="button"
                  onClick={() => onEditTask(task)}
                  aria-label={`Edit tugas ${task.title}`}
                  className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-xl text-[#334155] hover:text-[#0F172A] hover:bg-white/60"
                >
                  <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              )}
              <button
                type="button"
                onClick={() => onDeleteTask(task.id)}
                aria-label={`Hapus tugas ${task.title}`}
                className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-xl text-[#C41E3A] hover:bg-white/60"
              >
                <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </article>
      );
    }

    return (
      <article
        style={
          isDarkMode
            ? undefined
            : {
                backgroundColor: isCompleted ? '#F8FAFC' : pastelBg,
                borderColor: isCompleted ? '#CBD5E1' : '#0F172A',
              }
        }
        className={`relative rounded-[26px] border-2 transition-all duration-150 p-3.5 sm:p-4 ${
          isDarkMode
            ? isCompleted
              ? 'bg-[#1F242D]/60 border-[#2E3440]'
              : 'bg-[#232934] border-[#323A48]'
            : 'shadow-xs'
        }`}
      >
        {/* Top Content Row: Character Sticker + Full-Width Course & Title */}
        <div className="flex items-start gap-3.5">
          <div
            onClick={() => setIsExpanded((prev) => !prev)}
            className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border-2 border-[#0F172A] bg-white flex items-center justify-center shrink-0 overflow-hidden shadow-2xs cursor-pointer transition-opacity ${
              isCompleted ? 'opacity-55 grayscale' : 'opacity-100'
            }`}
          >
            <img
              src={stickerUrl}
              alt={task.course}
              className="w-full h-full object-cover"
            />
          </div>

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
            <div className="flex items-center gap-1.5 flex-wrap">
              <span
                style={{ backgroundColor: iconBg }}
                className="px-2.5 py-0.5 rounded-lg text-[10px] text-white font-extrabold whitespace-nowrap shrink-0"
              >
                {task.category || 'Praktikum'}
              </span>
              <span
                style={{
                  color: isDarkMode ? '#CBD5E1' : accentColor,
                }}
                className="text-xs font-extrabold truncate"
              >
                {task.course}
              </span>
            </div>

            <h3
              className={`mt-1 text-sm sm:text-[15px] font-extrabold leading-snug ${
                isExpanded ? '' : 'line-clamp-2'
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
          </div>
        </div>

        {/* Bottom Aligned Bar: Crisp 1-Line Date Pill + Rincian on Left, Actions on Right */}
        <div
          className={`mt-3 pt-2.5 border-t flex items-center justify-between gap-2 ${
            isDarkMode ? 'border-[#323A48]' : 'border-black/10'
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-xs font-extrabold whitespace-nowrap shrink-0 ${
                isCompleted
                  ? isDarkMode
                    ? 'bg-[#141821] border-[#2E3440] text-[#64748B]'
                    : 'bg-white/70 border-[#CBD5E1] text-[#64748B]'
                  : isDarkMode
                  ? 'bg-[#141821] border-[#323A48] text-[#F8FAFC]'
                  : 'bg-white border-[#0F172A] text-[#0F172A] shadow-2xs'
              }`}
            >
              <Calendar
                style={{ color: isCompleted ? '#64748B' : iconBg }}
                className="w-3.5 h-3.5 shrink-0"
                aria-hidden="true"
              />
              <span>{task.deadline}</span>
            </span>

            <button
              type="button"
              onClick={() => setIsExpanded((prev) => !prev)}
              className={`min-h-[34px] px-2 rounded-xl inline-flex items-center gap-1 text-xs font-bold transition-colors whitespace-nowrap ${
                isDarkMode
                  ? 'text-[#94A3B8] hover:text-white hover:bg-[#2E3440]'
                  : 'text-[#334155] hover:text-[#0F172A] hover:bg-white/60'
              }`}
            >
              <span>{isExpanded ? 'Tutup' : 'Rincian'}</span>
              {isExpanded ? (
                <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
              )}
            </button>
          </div>

          {/* Right Action Buttons: Checkmark, Edit, Delete */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => onToggleStatus(task.id)}
              aria-label={
                isCompleted
                  ? `Tandai ${task.title} sebagai belum dikerjakan`
                  : `Tandai ${task.title} sebagai selesai`
              }
              title={isCompleted ? 'Ubah ke Belum Dikerjakan' : 'Tandai Selesai'}
              className={`min-h-[38px] px-2.5 rounded-xl border-2 text-xs font-extrabold flex items-center gap-1.5 transition-all active:scale-95 ${
                isCompleted
                  ? 'bg-[#059669] border-[#0F172A] text-white'
                  : isDarkMode
                  ? 'bg-[#141821] border-[#94A3B8] text-[#CBD5E1] hover:border-[#C41E3A]'
                  : 'bg-white border-[#0F172A] text-[#0F172A] hover:bg-[#F8FAFC]'
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full flex items-center justify-center border ${
                  isCompleted
                    ? 'bg-white text-[#059669] border-white'
                    : 'border-current'
                }`}
              >
                {isCompleted && (
                  <Check className="w-3 h-3 stroke-[3]" aria-hidden="true" />
                )}
              </span>
              <span className="hidden xs:inline">
                {isCompleted ? 'Selesai' : 'Tandai'}
              </span>
            </button>

            {onEditTask && (
              <button
                type="button"
                onClick={() => onEditTask(task)}
                aria-label={`Edit tugas ${task.title}`}
                title="Edit Tugas"
                className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-colors ${
                  isDarkMode
                    ? 'bg-[#141821] border-[#323A48] text-[#CBD5E1] hover:text-white'
                    : 'bg-white/85 border-[#0F172A]/20 text-[#334155] hover:text-[#0F172A] hover:bg-white'
                }`}
              >
                <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            )}

            <button
              type="button"
              onClick={() => onDeleteTask(task.id)}
              aria-label={`Hapus tugas ${task.title}`}
              title="Hapus Tugas"
              className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-colors ${
                isDarkMode
                  ? 'bg-[#141821] border-[#323A48] text-[#F87171] hover:bg-[#3B2329]'
                  : 'bg-white/85 border-[#0F172A]/20 text-[#C41E3A] hover:bg-white'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Expandable Accordion Instructions */}
        {isExpanded && (
          <div
            className={`mt-2.5 pt-2.5 border-t text-xs leading-relaxed ${
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
