import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar,
  AlertCircle,
  Sparkles,
  Pencil,
  Paperclip,
  Upload,
  FileText,
  Film,
  Image as ImageIcon,
  X,
} from 'lucide-react';
import {
  NewTaskPayload,
  EditTaskPayload,
  CourseDetail,
  AcademicTask,
  TaskCategory,
  TaskAttachment,
} from '../types/task';
import {
  INITIAL_COURSES,
  getReadableTextColor,
} from '../data/initialTasks';

export interface AddTaskSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: (payload: NewTaskPayload) => void;
  onEditTask?: (payload: EditTaskPayload) => void;
  editingTask?: AcademicTask | null;
  titleInputRef: React.RefObject<HTMLInputElement | null>;
  courses?: readonly CourseDetail[];
  initialCourse?: string;
  onRequestCalendarPicker?: (
    currentDate: string,
    onPick: (pickedDate: string) => void
  ) => void;
  isDarkMode?: boolean;
}

interface QuickDateChip {
  label: string;
  dateValue: string;
}

const QUICK_DATE_CHIPS: readonly QuickDateChip[] = [
  { label: 'Hari Ini', dateValue: '08 Nov 2026' },
  { label: 'Besok', dateValue: '09 Nov 2026' },
  { label: 'Rabu Depan', dateValue: '11 Nov 2026' },
  { label: 'Senin Depan', dateValue: '16 Nov 2026' },
];

const TASK_CATEGORIES: readonly TaskCategory[] = [
  'Praktikum',
  'Proyek',
  'Teori',
  'Kuis',
];

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(1)} MB`;
}

function detectAttachmentKind(
  mimeType: string,
  fileName: string
): 'image' | 'video' | 'document' {
  const lowerMime = mimeType.toLowerCase();
  const lowerName = fileName.toLowerCase();
  if (
    lowerMime.startsWith('image/') ||
    /\.(jpg|jpeg|png|gif|webp|svg)$/.test(lowerName)
  ) {
    return 'image';
  }
  if (
    lowerMime.startsWith('video/') ||
    /\.(mp4|webm|mov|mkv|avi)$/.test(lowerName)
  ) {
    return 'video';
  }
  return 'document';
}

/*
 * Slide-up / FAB-morph bottom sheet modal for creating or editing a coursework task.
 * Supports multi-file attachments (Photos, PDFs/Documents, Videos) and smooth spring animation.
 */
export const AddTaskSheet: React.FC<AddTaskSheetProps> = ({
  isOpen,
  onClose,
  onAddTask,
  onEditTask,
  editingTask = null,
  titleInputRef,
  courses = INITIAL_COURSES,
  initialCourse,
  onRequestCalendarPicker,
  isDarkMode = false,
}) => {
  const [title, setTitle] = useState<string>('');
  const [course, setCourse] = useState<string>(
    initialCourse || courses[0]?.name || INITIAL_COURSES[0].name
  );
  const [category, setCategory] = useState<TaskCategory>('Praktikum');
  const [deadline, setDeadline] = useState<string>('08 Nov 2026');
  const [description, setDescription] = useState<string>('');
  const [attachments, setAttachments] = useState<TaskAttachment[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const attachmentInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setCourse(editingTask.course);
      setCategory(editingTask.category || 'Praktikum');
      setDeadline(editingTask.deadline);
      setDescription(editingTask.description);
      setAttachments(editingTask.attachments ?? []);
      setErrorMessage(null);
    } else {
      setTitle('');
      setCourse(initialCourse || courses[0]?.name || INITIAL_COURSES[0].name);
      setCategory('Praktikum');
      setDeadline('08 Nov 2026');
      setDescription('');
      setAttachments([]);
      setErrorMessage(null);
    }
  }, [editingTask, initialCourse, courses, isOpen]);

  useEffect(() => {
    if (isOpen) {
      const focusTimer = window.setTimeout(() => {
        titleInputRef.current?.focus();
      }, 120);
      return () => window.clearTimeout(focusTimer);
    }
  }, [isOpen, titleInputRef]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (!fileList || fileList.length === 0) return;

    Array.from(fileList).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          const newAttachment: TaskAttachment = {
            id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            name: file.name,
            mimeType: file.type || 'application/octet-stream',
            sizeLabel: formatFileSize(file.size),
            dataUrl: reader.result,
            kind: detectAttachmentKind(file.type, file.name),
          };
          setAttachments((prev) => [...prev, newAttachment]);
        }
      };
      reader.readAsDataURL(file);
    });

    event.target.value = '';
  };

  const handleRemoveAttachment = (attId: string) => {
    setAttachments((prev) => prev.filter((item) => item.id !== attId));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!title.trim()) {
      setErrorMessage('Judul tugas wajib diisi.');
      titleInputRef.current?.focus();
      return;
    }

    if (!deadline.trim()) {
      setErrorMessage('Tenggat pengumpulan wajib diisi.');
      return;
    }

    const cleanDescription =
      description.trim() ||
      `Tugas ${category.toLowerCase()} mata kuliah ${course}.`;

    if (editingTask && onEditTask) {
      onEditTask({
        id: editingTask.id,
        title: title.trim(),
        course,
        category,
        deadline: deadline.trim(),
        description: cleanDescription,
        attachments,
      });
    } else {
      onAddTask({
        title: title.trim(),
        course,
        category,
        deadline: deadline.trim(),
        description: cleanDescription,
        attachments,
      });
    }

    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="add-task-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/55 backdrop-blur-[2px] p-0 sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-task-sheet-title"
        >
          {/* Sheet Container Expanding from the FAB (+) Position (bottom-right) */}
          <motion.div
            key="add-task-sheet-body"
            initial={{
              scale: 0.22,
              opacity: 0,
              x: 120,
              y: 190,
              borderRadius: '999px',
            }}
            animate={{
              scale: 1,
              opacity: 1,
              x: 0,
              y: 0,
              borderRadius: '32px',
            }}
            exit={{
              scale: 0.22,
              opacity: 0,
              x: 120,
              y: 190,
              borderRadius: '999px',
            }}
            transition={{
              type: 'spring',
              stiffness: 290,
              damping: 25,
            }}
            onClick={(e) => e.stopPropagation()}
            style={{ transformOrigin: 'bottom right' }}
            className={`w-full max-w-[480px] rounded-t-[32px] sm:rounded-[32px] border-2 shadow-2xl overflow-hidden ${
              isDarkMode
                ? 'bg-[#161A22] border-[#262C3A] text-white'
                : 'bg-white border-[#0F172A] text-[#0F172A]'
            }`}
          >
            {/* Dominant Red Top Header Band */}
            <div className="bg-[#C41E3A] text-white px-4 pt-3 pb-3 border-b-2 border-[#0F172A]">
              <div className="pb-2 flex justify-center">
                <div
                  className="w-11 h-1.5 rounded-full bg-white/40"
                  aria-hidden="true"
                />
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={onClose}
                  className="min-h-[38px] px-3 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-extrabold border border-white/30 transition-colors"
                >
                  Batal
                </button>

                <div className="flex items-center gap-1.5">
                  {editingTask ? (
                    <Pencil className="w-4 h-4 text-white" aria-hidden="true" />
                  ) : (
                    <Sparkles
                      className="w-4 h-4 text-white"
                      aria-hidden="true"
                    />
                  )}
                  <h2
                    id="add-task-sheet-title"
                    className="text-[15px] font-black tracking-tight"
                  >
                    {editingTask ? 'Edit Tugas Kuliah' : 'Tambah Tugas Baru'}
                  </h2>
                </div>

                <button
                  type="submit"
                  form="add-task-form"
                  className="min-h-[38px] px-3.5 rounded-xl bg-white text-[#C41E3A] border-2 border-[#0F172A] text-xs font-black shadow-[0_2px_0_0_#0F172A] active:translate-y-0.5 transition-all"
                >
                  Simpan
                </button>
              </div>
            </div>

            <form id="add-task-form" onSubmit={handleSubmit} noValidate>
              <div className="p-5 space-y-4 max-h-[76vh] overflow-y-auto no-scrollbar">
                {errorMessage && (
                  <div
                    role="alert"
                    className="flex items-center gap-2 p-3 rounded-2xl bg-[#FEE2E2] border-2 border-[#C41E3A] text-xs font-extrabold text-[#C41E3A]"
                  >
                    <AlertCircle
                      className="w-4 h-4 shrink-0"
                      aria-hidden="true"
                    />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Judul Tugas Input (Bound to useRef) */}
                <div>
                  <label
                    htmlFor="sheet-task-title"
                    className="block text-xs font-extrabold mb-1.5"
                  >
                    Judul Tugas Kuliah
                  </label>
                  <input
                    ref={titleInputRef}
                    id="sheet-task-title"
                    type="text"
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder="Contoh: Laporan Praktikum Sensor Ultrasonik"
                    className={`w-full min-h-[46px] px-4 py-2.5 rounded-2xl border-2 text-sm font-semibold outline-none transition-colors ${
                      isDarkMode
                        ? 'bg-[#232934] border-[#323A48] text-white placeholder:text-[#64748B] focus:border-[#C41E3A]'
                        : 'bg-[#F8FAFC] border-[#CBD5E1] text-[#0F172A] placeholder:text-[#94A3B8] focus:border-[#C41E3A] focus:bg-white'
                    }`}
                  />
                </div>

                {/* Kategori Tugas Chips */}
                <div>
                  <span className="block text-xs font-extrabold mb-1.5">
                    Jenis / Kategori Tugas
                  </span>
                  <div className="grid grid-cols-4 gap-1.5">
                    {TASK_CATEGORIES.map((cat) => {
                      const isSelected = category === cat;
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setCategory(cat)}
                          className={`min-h-[40px] rounded-xl text-xs font-extrabold border-2 transition-all ${
                            isSelected
                              ? 'bg-[#C41E3A] border-[#0F172A] text-white shadow-[0_2px_0_0_#0F172A]'
                              : isDarkMode
                              ? 'bg-[#232934] border-[#323A48] text-[#CBD5E1]'
                              : 'bg-[#F8FAFC] border-[#CBD5E1] text-[#334155]'
                          }`}
                        >
                          {cat}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Mata Kuliah Selector Chips with Character Sticker Preview */}
                <div>
                  <span className="block text-xs font-extrabold mb-1.5">
                    Pilih Mata Kuliah
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {courses.map((courseOption) => {
                      const isSelected = course === courseOption.name;
                      const readableText = getReadableTextColor(
                        courseOption.iconBg
                      );
                      return (
                        <button
                          key={courseOption.id}
                          type="button"
                          onClick={() => setCourse(courseOption.name)}
                          style={
                            isSelected
                              ? {
                                  backgroundColor: courseOption.iconBg,
                                  borderColor: '#0F172A',
                                  color: readableText,
                                }
                              : undefined
                          }
                          className={`min-h-[42px] px-3 py-1.5 rounded-2xl text-xs font-extrabold transition-all border-2 flex items-center gap-2 ${
                            isSelected
                              ? 'shadow-[0_2px_0_0_#0F172A]'
                              : isDarkMode
                              ? 'bg-[#232934] border-[#323A48] text-[#CBD5E1]'
                              : 'bg-[#F8FAFC] border-[#CBD5E1] text-[#334155] hover:bg-[#F1F5F9]'
                          }`}
                        >
                          <img
                            src={courseOption.stickerUrl}
                            alt=""
                            className="w-5 h-5 rounded-md object-cover border border-black/20 bg-white"
                          />
                          <span>{courseOption.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Quick Date Selection + Full Interactive Calendar Picker Trigger */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="sheet-task-deadline"
                      className="block text-xs font-extrabold"
                    >
                      Tanggal Tenggat Pengumpulan
                    </label>
                    {onRequestCalendarPicker && (
                      <button
                        type="button"
                        onClick={() =>
                          onRequestCalendarPicker(deadline, (picked) =>
                            setDeadline(picked)
                          )
                        }
                        className="px-2.5 py-1 rounded-xl bg-white border-2 border-[#0F172A] text-[11px] font-extrabold text-[#C41E3A] shadow-[0_2px_0_0_#0F172A] flex items-center gap-1"
                      >
                        <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Kalender Bulan</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-4 gap-1.5 mb-2.5">
                    {QUICK_DATE_CHIPS.map((chip) => {
                      const isChipActive = deadline === chip.dateValue;
                      return (
                        <button
                          key={chip.label}
                          type="button"
                          onClick={() => {
                            setDeadline(chip.dateValue);
                            if (errorMessage) setErrorMessage(null);
                          }}
                          className={`min-h-[40px] px-1.5 py-1.5 rounded-xl text-[11px] font-extrabold transition-all border-2 ${
                            isChipActive
                              ? 'bg-[#C41E3A] border-[#0F172A] text-white shadow-[0_2px_0_0_#0F172A]'
                              : isDarkMode
                              ? 'bg-[#232934] border-[#323A48] text-[#CBD5E1]'
                              : 'bg-[#F8FAFC] border-[#CBD5E1] text-[#334155]'
                          }`}
                        >
                          {chip.label}
                        </button>
                      );
                    })}
                  </div>

                  <div className="relative flex items-center">
                    <Calendar
                      className="w-4 h-4 text-[#C41E3A] absolute left-3.5 pointer-events-none"
                      aria-hidden="true"
                    />
                    <input
                      id="sheet-task-deadline"
                      type="text"
                      value={deadline}
                      onChange={(e) => {
                        setDeadline(e.target.value);
                        if (errorMessage) setErrorMessage(null);
                      }}
                      placeholder="Contoh: 18 Nov 2026"
                      className={`w-full min-h-[44px] pl-10 pr-28 py-2.5 rounded-2xl border-2 text-sm font-bold outline-none transition-colors ${
                        isDarkMode
                          ? 'bg-[#232934] border-[#323A48] text-white focus:border-[#C41E3A]'
                          : 'bg-[#F8FAFC] border-[#CBD5E1] text-[#0F172A] focus:border-[#C41E3A] focus:bg-white'
                      }`}
                    />
                    {onRequestCalendarPicker && (
                      <button
                        type="button"
                        onClick={() =>
                          onRequestCalendarPicker(deadline, (picked) =>
                            setDeadline(picked)
                          )
                        }
                        className="absolute right-1.5 min-h-[34px] px-3 rounded-xl bg-[#C41E3A] text-white border border-[#0F172A] text-xs font-extrabold"
                      >
                        Pilih Tanggal
                      </button>
                    )}
                  </div>
                </div>

                {/* Rincian Instruksi */}
                <div>
                  <label
                    htmlFor="sheet-task-desc"
                    className="block text-xs font-extrabold mb-1.5"
                  >
                    Catatan / Instruksi Tugas (Opsional)
                  </label>
                  <textarea
                    id="sheet-task-desc"
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Tuliskan rincian materi, tautan pengumpulan, atau catatan kelompok..."
                    className={`w-full px-4 py-2.5 rounded-2xl border-2 text-sm outline-none resize-none transition-colors ${
                      isDarkMode
                        ? 'bg-[#232934] border-[#323A48] text-white placeholder:text-[#64748B] focus:border-[#C41E3A]'
                        : 'bg-[#F8FAFC] border-[#CBD5E1] text-[#0F172A] placeholder:text-[#94A3B8] focus:border-[#C41E3A] focus:bg-white'
                    }`}
                  />
                </div>

                {/* Multi-File Attachment Upload (Photos, PDFs/Documents, Videos) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-extrabold flex items-center gap-1.5">
                      <Paperclip
                        className="w-3.5 h-3.5 text-[#C41E3A]"
                        aria-hidden="true"
                      />
                      <span>Lampiran File (Foto, Dokumen PDF, Video)</span>
                    </span>

                    <input
                      ref={attachmentInputRef}
                      type="file"
                      multiple
                      accept="image/*,video/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.rar,.txt"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => attachmentInputRef.current?.click()}
                      className="min-h-[34px] px-3 py-1 rounded-xl bg-white hover:bg-[#FFF1F2] text-[#C41E3A] border-2 border-[#0F172A] shadow-[0_2px_0_0_#0F172A] text-[11px] font-extrabold flex items-center gap-1.5 transition-all active:translate-y-0.5"
                    >
                      <Upload className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Unggah File</span>
                    </button>
                  </div>

                  {attachments.length === 0 ? (
                    <button
                      type="button"
                      onClick={() => attachmentInputRef.current?.click()}
                      className={`w-full p-3.5 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-1 text-center transition-colors ${
                        isDarkMode
                          ? 'bg-[#232934]/60 border-[#323A48] text-[#94A3B8] hover:border-[#C41E3A]'
                          : 'bg-[#F8FAFC] border-[#CBD5E1] text-[#64748B] hover:border-[#C41E3A] hover:bg-[#FFF1F2]/30'
                      }`}
                    >
                      <Upload
                        className="w-5 h-5 text-[#C41E3A]"
                        aria-hidden="true"
                      />
                      <span className="text-xs font-extrabold text-[#0F172A]">
                        Ketuk untuk melampirkan foto, modul PDF, atau video
                      </span>
                      <span className="text-[10px] font-semibold">
                        Lampiran otomatis tampil di bagian Rincian kartu tugas
                      </span>
                    </button>
                  ) : (
                    <div className="space-y-2 mt-2">
                      {attachments.map((att) => (
                        <div
                          key={att.id}
                          className={`p-2.5 rounded-2xl border-2 border-[#0F172A] flex items-center justify-between gap-2.5 ${
                            isDarkMode
                              ? 'bg-[#232934] text-white'
                              : 'bg-[#F8FAFC] text-[#0F172A]'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            {att.kind === 'image' ? (
                              <img
                                src={att.dataUrl}
                                alt={att.name}
                                className="w-11 h-11 rounded-xl object-cover border border-[#0F172A] bg-white shrink-0"
                              />
                            ) : att.kind === 'video' ? (
                              <div className="w-11 h-11 rounded-xl bg-[#0F172A] text-white flex items-center justify-center shrink-0">
                                <Film className="w-5 h-5 text-[#C41E3A]" />
                              </div>
                            ) : (
                              <div className="w-11 h-11 rounded-xl bg-[#C41E3A] text-white border border-[#0F172A] flex items-center justify-center shrink-0">
                                <FileText className="w-5 h-5" />
                              </div>
                            )}

                            <div className="min-w-0">
                              <p className="text-xs font-extrabold truncate">
                                {att.name}
                              </p>
                              <p className="text-[10px] font-bold text-[#64748B] flex items-center gap-1">
                                {att.kind === 'image' ? (
                                  <ImageIcon className="w-3 h-3 text-[#C41E3A]" />
                                ) : att.kind === 'video' ? (
                                  <Film className="w-3 h-3 text-[#C41E3A]" />
                                ) : (
                                  <FileText className="w-3 h-3 text-[#C41E3A]" />
                                )}
                                <span>
                                  {att.kind === 'image'
                                    ? 'Foto'
                                    : att.kind === 'video'
                                    ? 'Video'
                                    : 'Dokumen'}{' '}
                                  · {att.sizeLabel}
                                </span>
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveAttachment(att.id)}
                            aria-label={`Hapus lampiran ${att.name}`}
                            className="w-8 h-8 rounded-xl bg-white text-[#C41E3A] border border-[#0F172A] flex items-center justify-center shrink-0 hover:bg-[#FEE2E2]"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full min-h-[48px] rounded-2xl bg-[#C41E3A] hover:bg-[#A3162E] text-white text-sm font-black border-2 border-[#0F172A] shadow-[0_3px_0_0_#0F172A] active:translate-y-0.5 transition-all"
                >
                  {editingTask
                    ? 'Simpan Perubahan Tugas'
                    : 'Simpan Tugas Kuliah'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
