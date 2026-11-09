import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  X,
  Plus,
  Calendar,
  FileText,
  Tag,
  Check,
  Sparkles,
  Edit3,
  Paperclip,
  Film,
  File,
  Trash2,
  Upload,
} from 'lucide-react';
import {
  AcademicTask,
  NewTaskInput,
  EditTaskInput,
  TaskCategory,
  CourseDetail,
  TaskAttachment,
} from '../types/task';
import {
  INITIAL_COURSES,
  formatDateToIndonesianLabel,
  getDynamicQuickDateChips,
  getCourseScheduledDay,
  getNextDateForIndonesianDay,
  resolveCourseForTask,
} from '../data/initialTasks';
import { toWebpAssetPath } from '../utils/imageOptimizer';
import { CalendarModal } from './CalendarModal';

export interface AddTaskSheetProps {
  visible?: boolean;
  isOpen?: boolean;
  onClose: () => void;
  onSubmit?: (input: NewTaskInput) => void;
  onAddTask?: (input: NewTaskInput) => void;
  onEditTask?: (input: EditTaskInput) => void;
  editingTask?: AcademicTask | null;
  titleInputRef?: React.RefObject<HTMLInputElement | null>;
  availableCourses?: readonly string[];
  courses?: CourseDetail[];
  courseList?: CourseDetail[];
  preselectedCourse?: string | null;
  initialCourse?: string | null;
  onRequestCalendarPicker?: (
    currentDate: string,
    onPick: (pickedDate: string) => void
  ) => void;
  isDarkMode?: boolean;
  allTasks?: AcademicTask[];
}

const PRESET_CATEGORIES: readonly string[] = ['Praktikum', 'Proyek', 'Teori'];

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(1)} MB`;
}

function detectAttachmentType(
  mimeType: string,
  fileName: string
): TaskAttachment['type'] {
  const lower = fileName.toLowerCase();
  if (
    mimeType.startsWith('image/') ||
    /\.(jpg|jpeg|png|gif|webp|svg)$/.test(lower)
  ) {
    return 'image';
  }
  if (
    mimeType.startsWith('video/') ||
    /\.(mp4|webm|mov|mkv|avi)$/.test(lower)
  ) {
    return 'video';
  }
  if (mimeType === 'application/pdf' || lower.endsWith('.pdf')) {
    return 'pdf';
  }
  return 'document';
}

export const AddTaskSheet: React.FC<AddTaskSheetProps> = ({
  visible,
  isOpen,
  onClose,
  onSubmit,
  onAddTask,
  onEditTask,
  editingTask = null,
  titleInputRef,
  availableCourses,
  courses,
  courseList,
  preselectedCourse = null,
  initialCourse = null,
  onRequestCalendarPicker,
  allTasks = [],
}) => {
  const sheetVisible = Boolean(isOpen ?? visible);
  const resolvedCourseList = courses || courseList || INITIAL_COURSES;
  const resolvedPreselectedCourse = initialCourse || preselectedCourse;

  const coursesToRender =
    availableCourses && availableCourses.length > 0
      ? availableCourses
      : resolvedCourseList.map((c) => c.name);

  const defaultTodayLabel = useMemo(
    () => formatDateToIndonesianLabel(new Date()),
    []
  );

  const [title, setTitle] = useState('');
  const [course, setCourse] = useState<string>(
    coursesToRender[0] || 'Pemrograman Visual I'
  );
  const [category, setCategory] = useState<TaskCategory>('Praktikum');
  const [customCategoryText, setCustomCategoryText] = useState('');
  const [isCustomCategoryActive, setIsCustomCategoryActive] = useState(false);
  const [deadline, setDeadline] = useState(defaultTodayLabel);
  const [description, setDescription] = useState('');
  const [attachments, setAttachments] = useState<TaskAttachment[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);

  const selectedCourseDetail = useMemo(
    () =>
      resolvedCourseList.find(
        (c) => c.name.trim().toLowerCase() === course.trim().toLowerCase()
      ),
    [resolvedCourseList, course]
  );

  const scheduledDayName = useMemo(
    () =>
      selectedCourseDetail
        ? getCourseScheduledDay(selectedCourseDetail.schedule)
        : undefined,
    [selectedCourseDetail]
  );

  const quickDateChips = useMemo(
    () => getDynamicQuickDateChips(new Date(), scheduledDayName),
    [scheduledDayName]
  );

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const customCategoryInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      const matched = resolveCourseForTask(editingTask, resolvedCourseList);
      setCourse(matched ? matched.name : editingTask.course);
      const isPreset = PRESET_CATEGORIES.includes(editingTask.category);
      if (isPreset) {
        setCategory(editingTask.category);
        setCustomCategoryText('');
        setIsCustomCategoryActive(false);
      } else {
        setCategory(editingTask.category);
        setCustomCategoryText(editingTask.category);
        setIsCustomCategoryActive(true);
      }
      setDeadline(editingTask.deadline);
      setDescription(editingTask.description);
      setAttachments(editingTask.attachments || []);
      setErrorMessage(null);
    } else {
      const initialCourseName =
        resolvedPreselectedCourse &&
        resolvedCourseList.some(
          (c) =>
            c.name.trim().toLowerCase() ===
            resolvedPreselectedCourse.trim().toLowerCase()
        )
          ? resolvedPreselectedCourse
          : coursesToRender[0] || 'Pemrograman Visual I';
      const initialDetail = resolvedCourseList.find(
        (c) =>
          c.name.trim().toLowerCase() ===
          initialCourseName.trim().toLowerCase()
      );
      setTitle('');
      setCourse(initialCourseName);
      setCategory('Praktikum');
      setCustomCategoryText('');
      setIsCustomCategoryActive(false);
      setDeadline(
        initialDetail
          ? getNextDateForIndonesianDay(
              getCourseScheduledDay(initialDetail.schedule)
            )
          : formatDateToIndonesianLabel(new Date())
      );
      setDescription('');
      setAttachments([]);
      setErrorMessage(null);
    }
  }, [editingTask, sheetVisible, resolvedPreselectedCourse, resolvedCourseList]);

  if (!sheetVisible) return null;

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const attType = detectAttachmentType(file.type, file.name);
      const sizeStr = formatFileSize(file.size);

      if (attType === 'image' && file.size <= 3 * 1024 * 1024) {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            setAttachments((prev) => [
              ...prev,
              {
                id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
                name: file.name,
                type: attType,
                sizeLabel: sizeStr,
                url: reader.result as string,
                mimeType: file.type || 'image/jpeg',
              },
            ]);
          }
        };
        reader.readAsDataURL(file);
      } else {
        const objectUrl = URL.createObjectURL(file);
        setAttachments((prev) => [
          ...prev,
          {
            id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            name: file.name,
            type: attType,
            sizeLabel: sizeStr,
            url: objectUrl,
            mimeType: file.type || 'application/octet-stream',
          },
        ]);
      }
    });

    event.target.value = '';
  };

  const handleRemoveAttachment = (attId: string) => {
    setAttachments((prev) => prev.filter((item) => item.id !== attId));
  };

  const handleSelectPresetCategory = (preset: string) => {
    setIsCustomCategoryActive(false);
    setCategory(preset);
    if (errorMessage) setErrorMessage(null);
  };

  const handleActivateCustomCategory = () => {
    setIsCustomCategoryActive(true);
    const trimmed = customCategoryText.trim();
    setCategory(trimmed || 'Kuis');
    setTimeout(() => {
      customCategoryInputRef.current?.focus();
    }, 20);
  };

  const handleCustomCategoryChange = (value: string) => {
    setIsCustomCategoryActive(true);
    setCustomCategoryText(value);
    setCategory(value.trim() || 'Kuis');
    if (errorMessage) setErrorMessage(null);
  };

  const handleOpenCalendarPicker = () => {
    if (onRequestCalendarPicker) {
      onRequestCalendarPicker(deadline, (picked) => setDeadline(picked));
    } else {
      setIsCalendarModalOpen(true);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMessage(
        'Judul tugas wajib diisi agar tercatat di daftar akademik.'
      );
      return;
    }

    const finalCategory = isCustomCategoryActive
      ? customCategoryText.trim() || 'Kuis'
      : category.trim() || 'Praktikum';

    const payload: NewTaskInput = {
      courseId: selectedCourseDetail?.id,
      title: title.trim(),
      course: selectedCourseDetail?.name || course,
      category: finalCategory,
      deadline: deadline.trim() || defaultTodayLabel,
      description:
        description.trim() ||
        'Dokumentasi pengerjaan dan pengumpulan tugas perkuliahan.',
      attachments,
    };

    if (editingTask && onEditTask) {
      onEditTask({
        ...payload,
        id: editingTask.id,
      });
    } else if (onAddTask) {
      onAddTask(payload);
    } else if (onSubmit) {
      onSubmit(payload);
    }

    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#0F172A]/60 backdrop-blur-[2px] p-0 sm:p-4 animate-fade-in">
        <div
          className="fixed inset-0"
          onClick={onClose}
          aria-label="Tutup panel formulir"
        />

        <div className="relative z-10 w-full max-w-[520px] max-h-[92vh] flex flex-col bg-white rounded-t-[30px] sm:rounded-[30px] border-2 border-[#0F172A] shadow-[0_8px_0_0_#0F172A] overflow-hidden animate-pop-scale">
          {/* Solid Crimson Header */}
          <div className="px-5 pt-4 pb-4 bg-[#C41E3A] border-b-2 border-[#0F172A] shrink-0">
            <div className="w-11 h-1.5 rounded-full bg-white/40 mx-auto mb-3" />

            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={onClose}
                className="min-h-[44px] px-3.5 rounded-2xl bg-[#9F1239] hover:bg-[#881337] border-2 border-[#0F172A] text-[13px] font-bold text-white shadow-[0_2px_0_0_#0F172A] transition-all cursor-pointer active:scale-95"
              >
                Batal
              </button>

              <div className="flex items-center gap-2">
                {editingTask ? (
                  <Edit3 className="w-4 h-4 text-white" />
                ) : (
                  <Sparkles className="w-4 h-4 text-white" />
                )}
                <h2 className="text-[16px] font-extrabold text-white tracking-tight">
                  {editingTask ? 'Ubah Rincian Tugas' : 'Tambah Tugas Baru'}
                </h2>
              </div>

              <button
                type="submit"
                form="taskdar-task-form"
                className="min-h-[44px] px-4 rounded-2xl bg-white hover:bg-[#FFF5F5] text-[#C41E3A] border-2 border-[#0F172A] text-[13px] font-extrabold shadow-[0_2px_0_0_#0F172A] active:scale-95 transition-all cursor-pointer"
              >
                Simpan
              </button>
            </div>
          </div>

          <form
            id="taskdar-task-form"
            onSubmit={handleSave}
            className="p-5 overflow-y-auto space-y-5 flex-1"
          >
            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-[#FEE2E2] border-2 border-[#0F172A] text-[12px] font-bold text-[#991B1B] flex items-center justify-between">
                <span>{errorMessage}</span>
                <button
                  type="button"
                  onClick={() => setErrorMessage(null)}
                  className="min-w-[36px] min-h-[36px] flex items-center justify-center text-[#991B1B] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Task Title */}
            <div>
              <label
                htmlFor="task-title-input"
                className="block text-[12px] font-extrabold text-[#0F172A] mb-1.5"
              >
                Judul Tugas Kuliah
              </label>
              <input
                ref={titleInputRef}
                id="task-title-input"
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder="Contoh: Laporan Praktikum Sensor Ultrasonik"
                className="w-full min-h-[48px] px-4 py-2.5 rounded-2xl bg-[#F8FAFC] border-2 border-[#CBD5E1] text-[14px] font-bold text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:bg-white focus:border-[#0F172A] transition-colors"
              />
            </div>

            {/* Task Category Selector: 3 Preset Columns + 4th Custom Input Column */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="custom-task-category-input"
                  className="block text-[12px] font-extrabold text-[#0F172A]"
                >
                  Jenis / Kategori Tugas
                </label>
                {isCustomCategoryActive && (
                  <span className="text-[11px] font-extrabold text-[#C41E3A]">
                    Kategori: {customCategoryText.trim() || 'Kuis'}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {PRESET_CATEGORIES.map((cat) => {
                  const isSelected =
                    !isCustomCategoryActive && category === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => handleSelectPresetCategory(cat)}
                      className={`min-h-[44px] px-3 py-2 rounded-2xl text-[12px] font-extrabold border-2 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 ${
                        isSelected
                          ? 'bg-[#C41E3A] text-white border-[#0F172A] shadow-[0_2px_0_0_#0F172A]'
                          : 'bg-white text-[#334155] border-[#CBD5E1] hover:border-[#0F172A]'
                      }`}
                    >
                      <Tag className="w-3.5 h-3.5 shrink-0" />
                      <span>{cat}</span>
                    </button>
                  );
                })}

                {/* 4th Slot: Custom Category Free-Type Input keeping the exact 4-column layout */}
                <div
                  onClick={handleActivateCustomCategory}
                  className={`min-h-[44px] px-2.5 py-1.5 rounded-2xl border-2 flex items-center justify-center transition-all cursor-text ${
                    isCustomCategoryActive
                      ? 'bg-[#C41E3A] border-[#0F172A] shadow-[0_2px_0_0_#0F172A]'
                      : 'bg-white border-[#CBD5E1] hover:border-[#0F172A]'
                  }`}
                >
                  <input
                    ref={customCategoryInputRef}
                    id="custom-task-category-input"
                    type="text"
                    maxLength={28}
                    value={customCategoryText}
                    onFocus={() => setIsCustomCategoryActive(true)}
                    onChange={(e) => handleCustomCategoryChange(e.target.value)}
                    placeholder="Ketik..."
                    aria-label="Ketik kategori tugas"
                    className={`w-full text-center text-[12px] font-extrabold bg-transparent focus:outline-none ${
                      isCustomCategoryActive
                        ? 'text-white placeholder:text-white/75'
                        : 'text-[#0F172A] placeholder:text-[#64748B]'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Course Selector Pills with Sticker Thumbnails */}
            <div>
              <span className="block text-[12px] font-extrabold text-[#0F172A] mb-1.5">
                Pilih Mata Kuliah
              </span>
              <div className="flex flex-wrap gap-2">
                {coursesToRender.map((item) => {
                  const isSelected = course === item;
                  const detail = resolvedCourseList.find(
                    (c) => c.name === item
                  );
                  const stickerUrl = toWebpAssetPath(
                    detail?.stickerUrl || '/assets/sticker-coding.webp'
                  );
                  const accentColor = detail?.accentColor || '#C41E3A';

                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setCourse(item);
                        if (!editingTask && detail) {
                          const dayOfCourse = getCourseScheduledDay(
                            detail.schedule
                          );
                          setDeadline(getNextDateForIndonesianDay(dayOfCourse));
                        }
                      }}
                      style={
                        isSelected
                          ? {
                              backgroundColor: accentColor,
                              borderColor: '#0F172A',
                              color: '#FFFFFF',
                            }
                          : undefined
                      }
                      className={`min-h-[44px] pl-2 pr-3.5 py-1.5 rounded-2xl text-[12px] font-bold border-2 transition-all flex items-center gap-2 text-left cursor-pointer active:scale-95 ${
                        isSelected
                          ? 'shadow-[0_2px_0_0_#0F172A]'
                          : 'bg-white text-[#334155] border-[#CBD5E1] hover:border-[#0F172A]'
                      }`}
                    >
                      <img
                        src={stickerUrl}
                        alt={item}
                        className="w-7 h-7 rounded-lg object-cover border border-[#0F172A]/20 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <span>{item}</span>
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 shrink-0 ml-0.5" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Deadline Selector with Real-Time Quick Chips & Full Month Calendar Trigger */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="task-deadline-input"
                  className="block text-[12px] font-extrabold text-[#0F172A]"
                >
                  Tanggal Tenggat Pengumpulan
                </label>
                <button
                  type="button"
                  onClick={handleOpenCalendarPicker}
                  className="min-h-[34px] px-3 py-1 rounded-xl bg-[#FFF1F2] hover:bg-[#FFE4E6] text-[#C41E3A] border-2 border-[#0F172A] shadow-[0_2px_0_0_#0F172A] text-[11px] font-extrabold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Kalender Bulan</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2.5">
                {quickDateChips.map((chip) => {
                  const isChipActive = deadline === chip.value;
                  return (
                    <button
                      key={chip.label}
                      type="button"
                      onClick={() => setDeadline(chip.value)}
                      className={`min-h-[42px] px-2.5 py-1.5 rounded-xl text-[11px] font-extrabold border-2 transition-all cursor-pointer active:scale-95 ${
                        isChipActive
                          ? 'bg-[#C41E3A] text-white border-[#0F172A] shadow-[0_2px_0_0_#0F172A]'
                          : 'bg-white text-[#475569] border-[#CBD5E1] hover:border-[#0F172A]'
                      }`}
                    >
                      {chip.label}
                    </button>
                  );
                })}
              </div>

              <div className="relative flex items-center">
                <Calendar className="w-4 h-4 text-[#C41E3A] absolute left-4 pointer-events-none" />
                <input
                  id="task-deadline-input"
                  type="text"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  placeholder={`Contoh: ${defaultTodayLabel}`}
                  className="w-full min-h-[48px] pl-11 pr-28 py-2.5 rounded-2xl bg-[#F8FAFC] border-2 border-[#CBD5E1] text-[14px] font-bold text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:bg-white focus:border-[#0F172A] transition-colors"
                />
                <button
                  type="button"
                  onClick={handleOpenCalendarPicker}
                  className="absolute right-2 min-h-[36px] px-3 rounded-xl bg-[#C41E3A] text-white text-[11px] font-extrabold border border-[#0F172A] hover:bg-[#A01830] transition-colors cursor-pointer"
                >
                  Pilih Tanggal
                </button>
              </div>
            </div>

            {/* Notes / Description */}
            <div>
              <label
                htmlFor="task-desc-input"
                className="block text-[12px] font-extrabold text-[#0F172A] mb-1.5"
              >
                Catatan / Instruksi Tugas (Opsional)
              </label>
              <textarea
                id="task-desc-input"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tuliskan rincian materi, tautan pengumpulan, atau catatan kelompok..."
                className="w-full p-4 rounded-2xl bg-[#F8FAFC] border-2 border-[#CBD5E1] text-[13px] font-semibold text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:bg-white focus:border-[#0F172A] transition-colors resize-none"
              />
            </div>

            {/* Multi-File Attachment Upload (Photo, PDF/Document, Video) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[12px] font-extrabold text-[#0F172A] flex items-center gap-1.5">
                  <Paperclip className="w-3.5 h-3.5 text-[#C41E3A]" />
                  <span>Lampiran File (Foto, Dokumen PDF, Video)</span>
                </label>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="min-h-[34px] px-3 py-1 rounded-xl bg-[#FFF1F2] hover:bg-[#FFE4E6] text-[#C41E3A] border-2 border-[#0F172A] shadow-[0_2px_0_0_#0F172A] text-[11px] font-extrabold flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Unggah File</span>
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.rar,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />

              {attachments.length === 0 ? (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-4 px-4 rounded-2xl border-2 border-dashed border-[#CBD5E1] hover:border-[#C41E3A] bg-[#F8FAFC] hover:bg-[#FFF5F5] flex flex-col items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Upload className="w-5 h-5 text-[#C41E3A]" />
                  <span className="text-[12px] font-extrabold text-[#334155]">
                    Ketuk untuk melampirkan foto, modul PDF, atau video
                  </span>
                  <span className="text-[11px] font-semibold text-[#64748B]">
                    Lampiran otomatis tampil di bagian Rincian kartu tugas
                  </span>
                </button>
              ) : (
                <div className="space-y-2">
                  {attachments.map((att) => (
                    <div
                      key={att.id}
                      className="p-2.5 rounded-2xl bg-[#F8FAFC] border-2 border-[#0F172A] flex items-center justify-between gap-2.5"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {att.type === 'image' ? (
                          <div className="w-11 h-11 rounded-xl overflow-hidden border border-[#0F172A] bg-white shrink-0">
                            <img
                              src={att.url}
                              alt={att.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-11 h-11 rounded-xl border border-[#0F172A] bg-[#FEE2E2] text-[#C41E3A] flex items-center justify-center shrink-0">
                            {att.type === 'video' ? (
                              <Film className="w-5 h-5" />
                            ) : att.type === 'pdf' ? (
                              <FileText className="w-5 h-5" />
                            ) : (
                              <File className="w-5 h-5" />
                            )}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-[12px] font-extrabold text-[#0F172A] truncate">
                            {att.name}
                          </p>
                          <p className="text-[10px] font-bold text-[#64748B] uppercase">
                            {att.type} · {att.sizeLabel}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveAttachment(att.id)}
                        aria-label={`Hapus lampiran ${att.name}`}
                        className="min-w-[38px] min-h-[38px] rounded-xl bg-[#FEE2E2] hover:bg-[#FECACA] text-[#B91C1C] border border-[#0F172A] flex items-center justify-center shrink-0 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-1">
              <button
                type="submit"
                className="w-full min-h-[52px] rounded-2xl bg-[#C41E3A] hover:bg-[#A01830] active:scale-[0.99] text-white font-extrabold text-[14px] border-2 border-[#0F172A] shadow-[0_3px_0_0_#0F172A] flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {editingTask ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Simpan Perubahan Tugas</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Simpan Tugas Kuliah</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <CalendarModal
        isOpen={isCalendarModalOpen}
        onClose={() => setIsCalendarModalOpen(false)}
        selectedDateLabel={deadline}
        onSelectDate={(newDate) => setDeadline(newDate)}
        tasks={allTasks}
      />
    </>
  );
};
