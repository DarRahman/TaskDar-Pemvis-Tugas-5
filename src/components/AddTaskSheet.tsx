import React, { useState, useEffect } from 'react';
import { Calendar, AlertCircle, Sparkles, Pencil } from 'lucide-react';
import {
  NewTaskPayload,
  EditTaskPayload,
  CourseDetail,
  AcademicTask,
  TaskCategory,
} from '../types/task';
import { INITIAL_COURSES } from '../data/initialTasks';

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

/*
 * Slide-up bottom sheet modal for creating or editing a coursework task.
 * Integrates useRef auto-focus, Category chips, Quick Date chips, and Full Month Calendar picker.
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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setCourse(editingTask.course);
      setCategory(editingTask.category || 'Praktikum');
      setDeadline(editingTask.deadline);
      setDescription(editingTask.description);
      setErrorMessage(null);
    } else {
      setTitle('');
      setCourse(initialCourse || courses[0]?.name || INITIAL_COURSES[0].name);
      setCategory('Praktikum');
      setDeadline('08 Nov 2026');
      setDescription('');
      setErrorMessage(null);
    }
  }, [editingTask, initialCourse, courses, isOpen]);

  useEffect(() => {
    if (isOpen) {
      const focusTimer = window.setTimeout(() => {
        titleInputRef.current?.focus();
      }, 60);
      return () => window.clearTimeout(focusTimer);
    }
  }, [isOpen, titleInputRef]);

  if (!isOpen) {
    return null;
  }

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
      `Tugas ${category.toLowerCase()} mata kuliah ${course} Semester 5.`;

    if (editingTask && onEditTask) {
      onEditTask({
        id: editingTask.id,
        title: title.trim(),
        course,
        category,
        deadline: deadline.trim(),
        description: cleanDescription,
      });
    } else {
      onAddTask({
        title: title.trim(),
        course,
        category,
        deadline: deadline.trim(),
        description: cleanDescription,
      });
    }

    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/55 backdrop-blur-[2px] p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-task-sheet-title"
    >
      <div
        className={`w-full max-w-[430px] rounded-t-[32px] sm:rounded-[32px] border-2 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-150 ${
          isDarkMode
            ? 'bg-[#161A22] border-[#262C3A] text-white'
            : 'bg-white border-[#0F172A] text-[#0F172A]'
        }`}
      >
        {/* Drag Handle */}
        <div className="pt-3 pb-1 flex justify-center">
          <div
            className={`w-11 h-1.5 rounded-full ${
              isDarkMode ? 'bg-[#334155]' : 'bg-[#CBD5E1]'
            }`}
            aria-hidden="true"
          />
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {/* Sheet Header */}
          <div
            className={`px-4 pb-2.5 flex items-center justify-between border-b ${
              isDarkMode ? 'border-[#262C3A]' : 'border-[#F1F5F9]'
            }`}
          >
            <button
              type="button"
              onClick={onClose}
              className={`min-h-[44px] min-w-[64px] px-2 flex items-center justify-start text-sm font-semibold ${
                isDarkMode
                  ? 'text-[#94A3B8] hover:text-white'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              Batal
            </button>

            <div className="flex items-center gap-1.5">
              {editingTask ? (
                <Pencil className="w-4 h-4 text-[#C41E3A]" aria-hidden="true" />
              ) : (
                <Sparkles className="w-4 h-4 text-[#C41E3A]" aria-hidden="true" />
              )}
              <h2
                id="add-task-sheet-title"
                className="text-[15px] font-extrabold tracking-tight"
              >
                {editingTask ? 'Edit Tugas Kuliah' : 'Tambah Tugas Baru'}
              </h2>
            </div>

            <button
              type="submit"
              className="min-h-[44px] min-w-[64px] px-2 flex items-center justify-end text-sm font-extrabold text-[#C41E3A] hover:text-[#A3162E]"
            >
              Simpan
            </button>
          </div>

          <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
            {errorMessage && (
              <div
                role="alert"
                className="flex items-center gap-2 p-3 rounded-2xl bg-[#FEE2E2] border border-[#FECACA] text-xs font-semibold text-[#C41E3A]"
              >
                <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
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
                    : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#0F172A] placeholder:text-[#94A3B8] focus:border-[#C41E3A] focus:bg-white'
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
                      className={`min-h-[40px] rounded-xl text-xs font-extrabold border-2 transition-colors ${
                        isSelected
                          ? 'bg-[#C41E3A] border-[#0F172A] text-white'
                          : isDarkMode
                          ? 'bg-[#232934] border-[#323A48] text-[#CBD5E1]'
                          : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#334155]'
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
                            }
                          : undefined
                      }
                      className={`min-h-[42px] px-3 py-1.5 rounded-2xl text-xs font-bold transition-all border-2 flex items-center gap-2 ${
                        isSelected
                          ? 'text-white shadow-xs'
                          : isDarkMode
                          ? 'bg-[#232934] border-[#323A48] text-[#CBD5E1]'
                          : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#334155] hover:bg-[#F1F5F9]'
                      }`}
                    >
                      <img
                        src={courseOption.stickerUrl}
                        alt=""
                        className="w-5 h-5 rounded-md object-cover border border-black/15"
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
                    className="text-xs font-extrabold text-[#C41E3A] hover:underline flex items-center gap-1"
                  >
                    <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Buka Kalender Bulan</span>
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
                      className={`min-h-[40px] px-1.5 py-1.5 rounded-xl text-[11px] font-bold transition-colors border ${
                        isChipActive
                          ? 'bg-[#FFE4E6] border-[#C41E3A] text-[#C41E3A]'
                          : isDarkMode
                          ? 'bg-[#232934] border-[#323A48] text-[#CBD5E1]'
                          : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#334155]'
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
                  className={`w-full min-h-[44px] pl-10 pr-28 py-2.5 rounded-2xl border-2 text-sm font-mono tabular-nums font-bold outline-none transition-colors ${
                    isDarkMode
                      ? 'bg-[#232934] border-[#323A48] text-white focus:border-[#C41E3A]'
                      : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#0F172A] focus:border-[#C41E3A] focus:bg-white'
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
                    className="absolute right-1.5 min-h-[34px] px-3 rounded-xl bg-[#C41E3A] text-white text-xs font-bold"
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
                    : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#0F172A] placeholder:text-[#94A3B8] focus:border-[#C41E3A] focus:bg-white'
                }`}
              />
            </div>

            <button
              type="submit"
              className="w-full min-h-[48px] rounded-2xl bg-[#C41E3A] hover:bg-[#A3162E] text-white text-sm font-extrabold border-2 border-[#0F172A] shadow-xs transition-colors"
            >
              {editingTask ? 'Simpan Perubahan Tugas' : 'Simpan Tugas Kuliah'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
