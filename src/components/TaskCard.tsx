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
  Paperclip,
  FileText,
  Film,
  Image as ImageIcon,
  Download,
  X,
} from 'lucide-react';
import {
  AcademicTask,
  CourseDetail,
  CourseIconKey,
  TaskAttachment,
} from '../types/task';
import {
  INITIAL_COURSES,
  getReadableTextColor,
} from '../data/initialTasks';

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
    pastelBg: '#FFE4E6',
    pastelBorder: '#FDA4AF',
    accentColor: '#C41E3A',
  };
}

/*
 * Visual Bento TaskCard component supporting 2-column Aptivo Bento Grid
 * and Wide Character Card with aligned single-line deadline chips and multi-file attachment previews.
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
    const [previewAttachment, setPreviewAttachment] =
      useState<TaskAttachment | null>(null);

    const isCompleted = task.status === 'Selesai';
    const { stickerUrl, iconBg, pastelBg, accentColor } = getCourseBentoStyle(
      task.course,
      courses
    );
    const badgeTextColor = getReadableTextColor(iconBg);
    const attachments = task.attachments ?? [];

    const renderAttachmentsSection = () => {
      if (attachments.length === 0) return null;

      return (
        <div className="mt-2.5 pt-2.5 border-t border-black/10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold flex items-center gap-1 text-[#C41E3A]">
              <Paperclip className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Lampiran Tugas ({attachments.length} File)</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {attachments.map((att) => {
              if (att.kind === 'image') {
                return (
                  <div
                    key={att.id}
                    onClick={() => setPreviewAttachment(att)}
                    className={`group relative rounded-2xl border-2 border-[#0F172A] overflow-hidden cursor-pointer bg-white shadow-[0_2px_0_0_#0F172A] ${
                      isDarkMode ? 'bg-[#141821]' : 'bg-white'
                    }`}
                  >
                    <img
                      src={att.dataUrl}
                      alt={att.name}
                      className="w-full h-28 object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    <div className="px-2.5 py-1.5 bg-white border-t border-[#0F172A] flex items-center justify-between gap-2 text-[#0F172A]">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <ImageIcon className="w-3.5 h-3.5 text-[#C41E3A] shrink-0" />
                        <span className="text-[10px] font-extrabold truncate">
                          {att.name}
                        </span>
                      </div>
                      <span className="text-[9px] font-bold text-[#64748B] shrink-0">
                        {att.sizeLabel}
                      </span>
                    </div>
                  </div>
                );
              }

              if (att.kind === 'video') {
                return (
                  <div
                    key={att.id}
                    className="rounded-2xl border-2 border-[#0F172A] overflow-hidden bg-white shadow-[0_2px_0_0_#0F172A]"
                  >
                    <video
                      src={att.dataUrl}
                      controls
                      preload="metadata"
                      className="w-full h-28 object-cover bg-black"
                    />
                    <div className="px-2.5 py-1.5 bg-white border-t border-[#0F172A] flex items-center justify-between gap-2 text-[#0F172A]">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Film className="w-3.5 h-3.5 text-[#C41E3A] shrink-0" />
                        <span className="text-[10px] font-extrabold truncate">
                          {att.name}
                        </span>
                      </div>
                      <span className="text-[9px] font-bold text-[#64748B] shrink-0">
                        {att.sizeLabel}
                      </span>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={att.id}
                  className="p-2.5 rounded-2xl border-2 border-[#0F172A] bg-white text-[#0F172A] shadow-[0_2px_0_0_#0F172A] flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-[#C41E3A] text-white border border-[#0F172A] flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-extrabold truncate">
                        {att.name}
                      </p>
                      <p className="text-[9px] font-bold text-[#64748B]">
                        Dokumen · {att.sizeLabel}
                      </p>
                    </div>
                  </div>

                  <a
                    href={att.dataUrl}
                    download={att.name}
                    onClick={(e) => e.stopPropagation()}
                    className="min-h-[32px] px-2.5 rounded-xl bg-[#F8FAFC] hover:bg-[#FEE2E2] text-[#0F172A] border border-[#0F172A] text-[10px] font-extrabold inline-flex items-center gap-1 shrink-0"
                  >
                    <Download className="w-3 h-3 text-[#C41E3A]" />
                    <span>Unduh</span>
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      );
    };

    const renderImageLightbox = () => {
      if (!previewAttachment) return null;
      return (
        <div
          onClick={() => setPreviewAttachment(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`Pratinjau ${previewAttachment.name}`}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[500px] rounded-[28px] bg-white border-2 border-[#0F172A] overflow-hidden shadow-2xl"
          >
            <div className="px-4 py-3 bg-[#C41E3A] text-white border-b-2 border-[#0F172A] flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs font-black truncate">
                  {previewAttachment.name}
                </p>
                <p className="text-[10px] font-bold text-white/85">
                  Lampiran Foto · {previewAttachment.sizeLabel}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewAttachment(null)}
                className="w-9 h-9 rounded-xl bg-white text-[#0F172A] border-2 border-[#0F172A] flex items-center justify-center shrink-0"
                aria-label="Tutup pratinjau"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-3 bg-[#0F172A] flex items-center justify-center max-h-[70vh] overflow-auto no-scrollbar">
              <img
                src={previewAttachment.dataUrl}
                alt={previewAttachment.name}
                className="max-w-full max-h-[64vh] object-contain rounded-xl"
              />
            </div>
            <div className="px-4 py-3 bg-white flex items-center justify-between">
              <span className="text-xs font-extrabold text-[#0F172A] truncate">
                {task.title}
              </span>
              <a
                href={previewAttachment.dataUrl}
                download={previewAttachment.name}
                className="min-h-[38px] px-3.5 rounded-xl bg-[#C41E3A] text-white border-2 border-[#0F172A] text-xs font-extrabold inline-flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Simpan Gambar</span>
              </a>
            </div>
          </div>
        </div>
      );
    };

    if (layoutMode === 'grid') {
      return (
        <>
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
              isDarkMode
                ? 'bg-[#1F242D] border-[#2E3440]'
                : isCompleted
                ? 'shadow-none'
                : 'shadow-[0_3px_0_0_#0F172A]'
            }`}
          >
            {/* Top Row: Character Sticker + Checkmark */}
            <div className="flex items-start justify-between gap-2">
              <div
                onClick={() => setIsExpanded((prev) => !prev)}
                className={`w-14 h-14 rounded-2xl border-2 border-[#0F172A] overflow-hidden bg-white shrink-0 cursor-pointer ${
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
                  style={{
                    backgroundColor: iconBg,
                    color: badgeTextColor,
                  }}
                  className="px-2 py-0.5 rounded-lg text-[10px] font-extrabold whitespace-nowrap border border-[#0F172A]"
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
                <div
                  className={`mt-1.5 text-[11px] leading-relaxed ${
                    isDarkMode ? 'text-[#CBD5E1]' : 'text-[#334155]'
                  }`}
                >
                  <p>{task.description}</p>
                  {renderAttachmentsSection()}
                </div>
              )}
            </div>

            {/* Footer Row: Single-Line Deadline + Attachments + Edit/Delete */}
            <div className="mt-3 pt-2 border-t border-black/10 flex items-center justify-between gap-1.5">
              <div className="flex items-center gap-1 min-w-0">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-xl border text-[10px] font-extrabold whitespace-nowrap shrink-0 ${
                    isDarkMode
                      ? 'bg-[#141821] border-[#2E3440] text-[#CBD5E1]'
                      : 'bg-white border-[#0F172A] text-[#0F172A]'
                  }`}
                >
                  <Calendar
                    className="w-3 h-3 shrink-0 text-[#C41E3A]"
                    aria-hidden="true"
                  />
                  <span>{task.deadline}</span>
                </span>

                {attachments.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setIsExpanded((prev) => !prev)}
                    className="inline-flex items-center gap-0.5 px-1.5 py-1 rounded-xl bg-[#C41E3A] text-white border border-[#0F172A] text-[10px] font-extrabold shrink-0"
                    title={`${attachments.length} lampiran file`}
                  >
                    <Paperclip className="w-2.5 h-2.5" />
                    <span>{attachments.length}</span>
                  </button>
                )}
              </div>

              <div className="flex items-center -mr-1">
                {onEditTask && (
                  <button
                    type="button"
                    onClick={() => onEditTask(task)}
                    aria-label={`Edit tugas ${task.title}`}
                    className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-xl text-[#0F172A] bg-white/80 border border-[#0F172A]/20 hover:bg-white mr-1"
                  >
                    <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onDeleteTask(task.id)}
                  aria-label={`Hapus tugas ${task.title}`}
                  className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-xl text-[#C41E3A] bg-white/80 border border-[#0F172A]/20 hover:bg-white"
                >
                  <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>
            </div>
          </article>
          {renderImageLightbox()}
        </>
      );
    }

    return (
      <>
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
              : isCompleted
              ? 'shadow-none'
              : 'shadow-[0_3px_0_0_#0F172A]'
          }`}
        >
          {/* Top Content Row: Character Sticker + Full-Width Course & Title */}
          <div className="flex items-start gap-3.5">
            <div
              onClick={() => setIsExpanded((prev) => !prev)}
              className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border-2 border-[#0F172A] bg-white flex items-center justify-center shrink-0 overflow-hidden cursor-pointer transition-opacity ${
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
                  style={{
                    backgroundColor: iconBg,
                    color: badgeTextColor,
                  }}
                  className="px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold whitespace-nowrap shrink-0 border border-[#0F172A]"
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

          {/* Bottom Aligned Bar: Crisp 1-Line Date Pill + Attachments + Rincian on Left, Actions on Right */}
          <div
            className={`mt-3 pt-2.5 border-t flex items-center justify-between gap-2 ${
              isDarkMode ? 'border-[#323A48]' : 'border-black/10'
            }`}
          >
            <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-xs font-extrabold whitespace-nowrap shrink-0 ${
                  isCompleted
                    ? isDarkMode
                      ? 'bg-[#141821] border-[#2E3440] text-[#64748B]'
                      : 'bg-white/70 border-[#CBD5E1] text-[#64748B]'
                    : isDarkMode
                    ? 'bg-[#141821] border-[#323A48] text-[#F8FAFC]'
                    : 'bg-white border-[#0F172A] text-[#0F172A]'
                }`}
              >
                <Calendar
                  className={`w-3.5 h-3.5 shrink-0 ${
                    isCompleted ? 'text-[#64748B]' : 'text-[#C41E3A]'
                  }`}
                  aria-hidden="true"
                />
                <span>{task.deadline}</span>
              </span>

              {attachments.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsExpanded((prev) => !prev)}
                  className="min-h-[30px] px-2.5 py-0.5 rounded-xl bg-[#C41E3A] text-white border border-[#0F172A] text-[11px] font-extrabold inline-flex items-center gap-1 shrink-0"
                  title="Lihat file lampiran di Rincian"
                >
                  <Paperclip className="w-3 h-3" aria-hidden="true" />
                  <span>{attachments.length} File</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsExpanded((prev) => !prev)}
                className={`min-h-[32px] px-2.5 rounded-xl inline-flex items-center gap-1 text-xs font-extrabold border transition-colors whitespace-nowrap ${
                  isDarkMode
                    ? 'bg-[#141821] border-[#323A48] text-[#CBD5E1] hover:text-white'
                    : 'bg-white/90 border-[#0F172A]/25 text-[#0F172A] hover:bg-white'
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
                title={
                  isCompleted ? 'Ubah ke Belum Dikerjakan' : 'Tandai Selesai'
                }
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
                      : 'bg-white border-[#0F172A] text-[#0F172A] hover:bg-[#F8FAFC]'
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
                    : 'bg-white border-[#0F172A] text-[#C41E3A] hover:bg-[#FFF1F2]'
                }`}
              >
                <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Expandable Accordion Instructions + Multi-File Attachments */}
          {isExpanded && (
            <div
              className={`mt-2.5 pt-2.5 border-t text-xs leading-relaxed ${
                isDarkMode
                  ? 'border-[#323A48] text-[#CBD5E1]'
                  : 'border-black/10 text-[#0F172A]'
              }`}
            >
              <p className="font-medium">{task.description}</p>
              {renderAttachmentsSection()}
            </div>
          )}
        </article>
        {renderImageLightbox()}
      </>
    );
  }
);

TaskCard.displayName = 'TaskCard';
