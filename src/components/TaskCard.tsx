import React, { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Calendar,
  Trash2,
  Edit3,
  ChevronDown,
  ChevronUp,
  Paperclip,
  FileText,
  Film,
  File,
  ExternalLink,
  X,
  Download,
  Flame,
} from 'lucide-react';
import {
  AcademicTask,
  CourseDetail,
  TaskAttachment,
} from '../types/task';
import {
  INITIAL_COURSES,
  getReadableTextColor,
  getTaskUrgencyMeta,
  resolveCourseForTask,
} from '../data/initialTasks';
import {
  toWebpAssetPath,
  getStickerStageBackground,
} from '../utils/imageOptimizer';

export interface TaskCardProps {
  task: AcademicTask;
  index?: number;
  courses?: CourseDetail[];
  courseList?: CourseDetail[];
  onToggleStatus: (id: string) => void;
  onEditTask?: (task: AcademicTask) => void;
  onEdit?: (task: AcademicTask) => void;
  onDeleteTask?: (id: string) => void;
  onDelete?: (id: string) => void;
  layoutMode?: 'list' | 'grid';
  isDarkMode?: boolean;
}

const PRESET_CATEGORY_STYLES: Record<
  string,
  { bg: string; text: string }
> = {
  Praktikum: {
    bg: '#4F46E5',
    text: '#FFFFFF',
  },
  Proyek: {
    bg: '#C41E3A',
    text: '#FFFFFF',
  },
  Teori: {
    bg: '#0891B2',
    text: '#FFFFFF',
  },
  Kuis: {
    bg: '#D97706',
    text: '#FFFFFF',
  },
};

const CUSTOM_CATEGORY_PALETTE = [
  '#D97706',
  '#7C3AED',
  '#059669',
  '#E11D48',
  '#2563EB',
  '#0D9488',
] as const;

export function getCategoryBadgeStyle(category: string): {
  bg: string;
  text: string;
} {
  const trimmed = (category || 'Praktikum').trim();
  if (PRESET_CATEGORY_STYLES[trimmed]) {
    return PRESET_CATEGORY_STYLES[trimmed];
  }
  let hash = 0;
  for (let i = 0; i < trimmed.length; i += 1) {
    hash = (hash * 31 + trimmed.charCodeAt(i)) >>> 0;
  }
  const bg = CUSTOM_CATEGORY_PALETTE[hash % CUSTOM_CATEGORY_PALETTE.length];
  return {
    bg,
    text: '#FFFFFF',
  };
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  courses,
  courseList,
  onToggleStatus,
  onEditTask,
  onEdit,
  onDeleteTask,
  onDelete,
  isDarkMode = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [previewAttachment, setPreviewAttachment] =
    useState<TaskAttachment | null>(null);
  const isCompleted = task.status === 'Selesai';

  const resolvedCourseList = courses || courseList || INITIAL_COURSES;
  const matchedCourse =
    resolveCourseForTask(task, resolvedCourseList) ??
    resolveCourseForTask(task, INITIAL_COURSES);

  const cardBg = isDarkMode
    ? '#1F242D'
    : isCompleted
    ? '#F8FAFC'
    : matchedCourse?.pastelBg || '#FEE2E2';
  const accentColor = matchedCourse?.accentColor || '#C41E3A';
  const iconBg = matchedCourse?.iconBg || '#C41E3A';
  const stickerUrl = toWebpAssetPath(
    matchedCourse?.stickerUrl || '/assets/sticker-coding.webp'
  );
  const stickerStageBg = getStickerStageBackground(stickerUrl, iconBg);
  const codeTextColor = getReadableTextColor(iconBg);

  const catStyle = getCategoryBadgeStyle(task.category);
  const attachments = task.attachments || [];
  const urgencyMeta = getTaskUrgencyMeta(task);

  const handleTriggerEdit = () => {
    if (onEditTask) onEditTask(task);
    else if (onEdit) onEdit(task);
  };

  const handleTriggerDelete = () => {
    if (onDeleteTask) onDeleteTask(task.id);
    else if (onDelete) onDelete(task.id);
  };

  return (
    <>
      <article
        style={{
          backgroundColor: cardBg,
        }}
        className={`rounded-[26px] border-2 border-[#0F172A] p-4 sm:p-5 transition-all duration-200 ${
          isCompleted
            ? 'opacity-85 shadow-[0_2px_0_0_#0F172A]'
            : 'shadow-[0_4px_0_0_#0F172A] hover:-translate-y-[1px]'
        }`}
      >
        <div className="flex items-start gap-3.5">
          {/* Course Character Sticker Avatar */}
          <div className="relative shrink-0">
            <div
              style={{
                backgroundColor: stickerStageBg,
              }}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden border-2 border-[#0F172A] shadow-[0_2px_0_0_#0F172A]"
            >
              <img
                src={stickerUrl}
                alt={matchedCourse?.name || task.course}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <span
              style={{
                backgroundColor: iconBg,
                color: codeTextColor,
              }}
              className="absolute -bottom-1.5 -right-1.5 px-1.5 py-0.5 rounded-md text-[9px] font-extrabold border border-[#0F172A] shadow-[0_1px_0_0_#0F172A] tracking-tight"
            >
              {matchedCourse?.code || 'MK'}
            </span>
          </div>

          {/* Center Content */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
              <span
                style={{
                  backgroundColor: iconBg,
                  color: codeTextColor,
                }}
                className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-[#0F172A] tracking-tight"
              >
                {task.course}
              </span>

              <span
                style={{
                  backgroundColor: catStyle.bg,
                  color: catStyle.text,
                }}
                className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-[#0F172A]"
              >
                {task.category || 'Praktikum'}
              </span>

              {urgencyMeta.isUrgent && urgencyMeta.badgeText && (
                <span
                  className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-[#0F172A] flex items-center gap-1 ${
                    urgencyMeta.isOverdue
                      ? 'bg-[#0F172A] text-[#FCA5A5]'
                      : 'bg-[#FEF3C7] text-[#92400E]'
                  }`}
                >
                  <Flame className="w-3 h-3 shrink-0 text-[#C41E3A]" />
                  <span>{urgencyMeta.badgeText}</span>
                </span>
              )}

              {attachments.length > 0 && (
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-white text-[#0F172A] border border-[#0F172A] flex items-center gap-1">
                  <Paperclip className="w-2.5 h-2.5 text-[#C41E3A]" />
                  <span>{attachments.length} File</span>
                </span>
              )}
            </div>

            <h3
              className={`text-[15px] sm:text-[16px] font-extrabold leading-snug break-words ${
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
              <div className="mt-2.5 p-3.5 rounded-2xl bg-white border-2 border-[#0F172A] shadow-[0_2px_0_0_#0F172A] space-y-3 animate-fade-in">
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#64748B] mb-1">
                    Catatan & Instruksi Tugas
                  </p>
                  <p className="text-[12px] text-[#1E293B] leading-relaxed font-semibold">
                    {task.description ||
                      'Belum ada rincian catatan tambahan untuk tugas ini.'}
                  </p>
                </div>

                {/* Shortcut Google Calendar */}
                <div className="pt-2 border-t border-[#E2E8F0] flex items-center justify-between gap-2 flex-wrap">
                  <a
                    href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
                      task.title
                    )}&details=${encodeURIComponent(
                      `${task.course} - ${task.description || ''}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-[#F8FAFC] border-2 border-[#0F172A] text-[10px] font-extrabold text-[#059669] shadow-[0_2px_0_0_#0F172A] transition-all cursor-pointer active:scale-95"
                  >
                    <Calendar className="w-3.5 h-3.5 text-[#059669]" />
                    <span>Simpan ke Google Calendar</span>
                  </a>
                </div>

                {/* Attachments Section Inside Rincian */}
                {attachments.length > 0 && (
                  <div className="pt-2.5 border-t border-[#E2E8F0]">
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#C41E3A] mb-2 flex items-center gap-1.5">
                      <Paperclip className="w-3 h-3" />
                      <span>Lampiran Tugas ({attachments.length})</span>
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {attachments.map((att) => (
                        <div
                          key={att.id}
                          className="p-2 rounded-xl bg-[#F8FAFC] border-2 border-[#0F172A] flex items-center justify-between gap-2"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            {att.type === 'image' ? (
                              <button
                                type="button"
                                onClick={() => setPreviewAttachment(att)}
                                className="w-10 h-10 rounded-lg overflow-hidden border border-[#0F172A] shrink-0 cursor-pointer"
                              >
                                <img
                                  src={att.url}
                                  alt={att.name}
                                  className="w-full h-full object-cover"
                                />
                              </button>
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-[#FEE2E2] text-[#C41E3A] border border-[#0F172A] flex items-center justify-center shrink-0">
                                {att.type === 'video' ? (
                                  <Film className="w-4 h-4" />
                                ) : att.type === 'pdf' ? (
                                  <FileText className="w-4 h-4" />
                                ) : (
                                  <File className="w-4 h-4" />
                                )}
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="text-[11px] font-extrabold text-[#0F172A] truncate">
                                {att.name}
                              </p>
                              <p className="text-[10px] font-bold text-[#64748B] uppercase">
                                {att.type} · {att.sizeLabel}
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => setPreviewAttachment(att)}
                            className="min-h-[32px] px-2.5 rounded-lg bg-[#C41E3A] text-white text-[10px] font-extrabold border border-[#0F172A] flex items-center gap-1 shrink-0 cursor-pointer hover:bg-[#A01830]"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>Lihat</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Status Toggle Button (44x44pt touch target) */}
          <button
            type="button"
            onClick={() => onToggleStatus(task.id)}
            aria-label={
              isCompleted ? 'Tandai belum selesai' : 'Tandai selesai'
            }
            className={`min-w-[44px] min-h-[44px] rounded-2xl flex items-center justify-center transition-all shrink-0 border-2 border-[#0F172A] cursor-pointer active:scale-95 ${
              isCompleted
                ? 'bg-[#059669] text-white shadow-[0_2px_0_0_#0F172A]'
                : 'bg-white text-[#0F172A] hover:bg-[#FEE2E2] shadow-[0_2px_0_0_#0F172A]'
            }`}
          >
            {isCompleted ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <Circle className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Bottom Metadata & Action Row */}
        <div className="mt-3.5 pt-3 border-t border-[#0F172A]/15 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border-2 border-[#0F172A] text-[11px] font-extrabold text-[#0F172A] shadow-[0_2px_0_0_#0F172A]">
              <Calendar
                style={{ color: accentColor }}
                className="w-3.5 h-3.5 shrink-0"
              />
              <span>{task.deadline}</span>
            </div>

            <button
              type="button"
              onClick={() => setIsExpanded((prev) => !prev)}
              className="min-h-[36px] px-3 py-1 rounded-xl bg-white hover:bg-[#F8FAFC] border-2 border-[#0F172A] text-[11px] font-extrabold text-[#0F172A] shadow-[0_2px_0_0_#0F172A] flex items-center gap-1 transition-all cursor-pointer active:scale-95"
            >
              <span>
                {isExpanded
                  ? 'Tutup Rincian'
                  : attachments.length > 0
                  ? `Rincian (${attachments.length} File)`
                  : 'Rincian'}
              </span>
              {isExpanded ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleTriggerEdit}
              aria-label={`Ubah tugas ${task.title}`}
              className="min-w-[40px] min-h-[40px] rounded-xl bg-white hover:bg-[#F8FAFC] text-[#0F172A] border-2 border-[#0F172A] shadow-[0_2px_0_0_#0F172A] flex items-center justify-center transition-all cursor-pointer active:scale-95"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleTriggerDelete}
              aria-label={`Hapus tugas ${task.title}`}
              className="min-w-[40px] min-h-[40px] rounded-xl bg-[#FEE2E2] hover:bg-[#FECACA] text-[#B91C1C] border-2 border-[#0F172A] shadow-[0_2px_0_0_#0F172A] flex items-center justify-center transition-all cursor-pointer active:scale-95"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </article>

      {/* Attachment Preview Modal */}
      {previewAttachment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/70 backdrop-blur-[2px] p-4 animate-fade-in">
          <div
            className="fixed inset-0"
            onClick={() => setPreviewAttachment(null)}
          />
          <div className="relative z-10 w-full max-w-[480px] bg-white rounded-[28px] border-2 border-[#0F172A] shadow-[0_8px_0_0_#0F172A] overflow-hidden animate-pop-scale">
            <div className="px-5 py-3.5 bg-[#C41E3A] border-b-2 border-[#0F172A] flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[13px] font-extrabold text-white truncate">
                  {previewAttachment.name}
                </p>
                <p className="text-[10px] font-bold text-white/80 uppercase">
                  {previewAttachment.type} · {previewAttachment.sizeLabel}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewAttachment(null)}
                className="w-9 h-9 rounded-xl bg-white text-[#0F172A] border-2 border-[#0F172A] flex items-center justify-center shrink-0 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 flex flex-col items-center justify-center bg-[#F8FAFC]">
              {previewAttachment.type === 'image' ? (
                <img
                  src={previewAttachment.url}
                  alt={previewAttachment.name}
                  className="max-h-[340px] w-auto rounded-2xl border-2 border-[#0F172A] object-contain bg-white"
                />
              ) : previewAttachment.type === 'video' ? (
                <video
                  src={previewAttachment.url}
                  controls
                  className="max-h-[320px] w-full rounded-2xl border-2 border-[#0F172A] bg-black"
                />
              ) : (
                <div className="py-8 px-4 text-center flex flex-col items-center gap-3">
                  <div className="w-16 h-16 rounded-2xl bg-[#FEE2E2] text-[#C41E3A] border-2 border-[#0F172A] flex items-center justify-center">
                    <FileText className="w-8 h-8" />
                  </div>
                  <p className="text-[14px] font-extrabold text-[#0F172A]">
                    {previewAttachment.name}
                  </p>
                  <p className="text-[12px] font-semibold text-[#64748B]">
                    Dokumen siap diunduh atau dibuka pada perangkat Anda.
                  </p>
                </div>
              )}

              <div className="mt-4 w-full flex items-center justify-end gap-2">
                <a
                  href={previewAttachment.url}
                  download={previewAttachment.name}
                  className="min-h-[42px] px-4 rounded-xl bg-[#C41E3A] hover:bg-[#A01830] text-white text-[12px] font-extrabold border-2 border-[#0F172A] shadow-[0_2px_0_0_#0F172A] flex items-center gap-1.5"
                >
                  <Download className="w-4 h-4" />
                  <span>Unduh Lampiran</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
