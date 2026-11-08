import React, { useState, useEffect } from 'react';
import { AlertCircle, RotateCcw, Calendar } from 'lucide-react';
import { NewTaskPayload, CourseDetail } from '../types/task';
import { INITIAL_COURSES } from '../data/initialTasks';

export interface AddTaskSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: (payload: NewTaskPayload) => void;
  titleInputRef: React.RefObject<HTMLInputElement | null>;
  courses?: readonly CourseDetail[];
  initialCourse?: string;
  onRequestCalendarPicker?: (
    currentDate: string,
    onPick: (pickedDate: string) => void
  ) => void;
  isDarkMode?: boolean;
}

const QUICK_DEADLINE_OPTIONS = [
  { label: 'Hari Ini', value: '08 Nov 2026' },
  { label: 'Besok', value: '09 Nov 2026' },
  { label: 'Senin Depan', value: '16 Nov 2026' },
] as const;

/*
 * Slide-up bottom sheet modal for adding a new academic assignment.
 * Includes quick date selection chips, interactive calendar picker trigger,
 * and programmatic useRef focus on the task title input.
 */
export const AddTaskSheet: React.FC<AddTaskSheetProps> = ({
  isOpen,
  onClose,
  onAddTask,
  titleInputRef,
  courses = INITIAL_COURSES,
  initialCourse,
  onRequestCalendarPicker,
  isDarkMode = false,
}) => {
  const [title, setTitle] = useState<string>('');
  const [course, setCourse] = useState<string>(
    initialCourse || courses[0]?.name || 'Pemrograman Visual I'
  );
  const [description, setDescription] = useState<string>('');
  const [deadline, setDeadline] = useState<string>('09 Nov 2026');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (initialCourse) {
      setCourse(initialCourse);
    }
  }, [initialCourse]);

  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);
      const focusTimer = window.setTimeout(() => {
        titleInputRef.current?.focus();
      }, 60);
      return () => window.clearTimeout(focusTimer);
    }
  }, [isOpen, titleInputRef]);

  if (!isOpen) {
    return null;
  }

  const handleClearForm = () => {
    setTitle('');
    setCourse(initialCourse || courses[0]?.name || 'Pemrograman Visual I');
    setDescription('');
    setDeadline('09 Nov 2026');
    setErrorMessage(null);
    titleInputRef.current?.focus();
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!title.trim()) {
      setErrorMessage('Judul tugas wajib diisi.');
      titleInputRef.current?.focus();
      return;
    }
    if (!course.trim()) {
      setErrorMessage('Pilih atau ketik nama mata kuliah.');
      return;
    }
    if (!description.trim()) {
      setErrorMessage('Deskripsi atau rincian tugas wajib diisi.');
      return;
    }
    if (!deadline.trim()) {
      setErrorMessage('Tenggat waktu pengumpulan wajib diisi.');
      return;
    }

    onAddTask({
      title: title.trim(),
      course: course.trim(),
      description: description.trim(),
      deadline: deadline.trim(),
    });

    setTitle('');
    setDescription('');
    setErrorMessage(null);
    titleInputRef.current?.focus();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/55 backdrop-blur-[2px] p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-task-sheet-title"
    >
      <div
        className={`w-full max-w-[430px] rounded-t-[32px] sm:rounded-[32px] border shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-150 ${
          isDarkMode
            ? 'bg-[#161A22] border-[#262C3A] text-white'
            : 'bg-white border-[#E2E8F0] text-[#0F172A]'
        }`}
      >
        {/* Drag Handle Bar */}
        <div className="pt-3 pb-1 flex justify-center">
          <div
            className={`w-11 h-1.5 rounded-full ${
              isDarkMode ? 'bg-[#334155]' : 'bg-[#CBD5E1]'
            }`}
            aria-hidden="true"
          />
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {/* Header Bar: Batal · Tambah Tugas · Simpan */}
          <div
            className={`px-4 pb-2.5 flex items-center justify-between border-b ${
              isDarkMode ? 'border-[#262C3A]' : 'border-[#F1F5F9]'
            }`}
          >
            <button
              type="button"
              onClick={onClose}
              className={`min-h-[44px] min-w-[64px] px-2 flex items-center justify-start text-sm font-semibold transition-colors ${
                isDarkMode
                  ? 'text-[#94A3B8] hover:text-white'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              Batal
            </button>

            <h2
              id="add-task-sheet-title"
              className="text-[15px] font-bold tracking-tight"
            >
              Tambah Tugas Baru
            </h2>

            <button
              type="submit"
              className="min-h-[44px] min-w-[64px] px-2 flex items-center justify-end text-sm font-bold text-[#C41E3A] hover:text-[#A3162E] transition-colors"
            >
              Simpan
            </button>
          </div>

          {/* Form Body */}
          <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
            {errorMessage && (
              <div
                role="alert"
                className="flex items-center gap-2 p-3 rounded-2xl bg-[#FFE4E6] border border-[#FECDD3] text-xs font-semibold text-[#BE123C]"
              >
                <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Judul Tugas */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="task-title-input"
                  className="block text-xs font-bold"
                >
                  Judul Tugas
                </label>
                <span
                  className={`text-[11px] font-mono tabular-nums ${
                    isDarkMode ? 'text-[#94A3B8]' : 'text-[#64748B]'
                  }`}
                >
                  {title.length}/100
                </span>
              </div>
              <input
                ref={titleInputRef}
                id="task-title-input"
                type="text"
                maxLength={100}
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder="Contoh: Tugas Pertemuan 6 - Navigasi Layar"
                className={`w-full min-h-[44px] px-4 py-2.5 rounded-2xl border text-sm outline-none transition-colors ${
                  isDarkMode
                    ? 'bg-[#232934] border-[#323A48] text-white placeholder:text-[#64748B] focus:border-[#C41E3A]'
                    : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#0F172A] placeholder:text-[#94A3B8] focus:border-[#C41E3A] focus:bg-white'
                }`}
              />
            </div>

            {/* Pilihan Mata Kuliah */}
            <div>
              <label
                htmlFor="task-course-input"
                className="block text-xs font-bold mb-1.5"
              >
                Mata Kuliah
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2.5">
                {courses.map((courseItem) => {
                  const isSelected = course === courseItem.name;
                  return (
                    <button
                      key={courseItem.id}
                      type="button"
                      onClick={() => setCourse(courseItem.name)}
                      style={
                        isSelected
                          ? {
                              backgroundColor: courseItem.iconBg,
                              borderColor: courseItem.iconBg,
                            }
                          : undefined
                      }
                      className={`min-h-[44px] px-3.5 py-1.5 rounded-2xl text-xs font-bold border transition-colors ${
                        isSelected
                          ? 'text-white'
                          : isDarkMode
                          ? 'bg-[#232934] border-[#323A48] text-[#CBD5E1] hover:bg-[#2E3440]'
                          : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#0F172A] hover:bg-[#F1F5F9]'
                      }`}
                    >
                      {courseItem.name}
                    </button>
                  );
                })}
              </div>
              <input
                id="task-course-input"
                type="text"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                placeholder="Ketik atau pilih mata kuliah"
                className={`w-full min-h-[44px] px-4 py-2.5 rounded-2xl border text-sm outline-none transition-colors ${
                  isDarkMode
                    ? 'bg-[#232934] border-[#323A48] text-white placeholder:text-[#64748B] focus:border-[#C41E3A]'
                    : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#0F172A] placeholder:text-[#94A3B8] focus:border-[#C41E3A] focus:bg-white'
                }`}
              />
            </div>

            {/* Deskripsi Tugas */}
            <div>
              <label
                htmlFor="task-desc-input"
                className="block text-xs font-bold mb-1.5"
              >
                Deskripsi dan Catatan
              </label>
              <textarea
                id="task-desc-input"
                rows={3}
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder="Tuliskan rincian materi, spesifikasi laporan, atau instruksi praktikum..."
                className={`w-full px-4 py-2.5 rounded-2xl border text-sm outline-none transition-colors resize-none ${
                  isDarkMode
                    ? 'bg-[#232934] border-[#323A48] text-white placeholder:text-[#64748B] focus:border-[#C41E3A]'
                    : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#0F172A] placeholder:text-[#94A3B8] focus:border-[#C41E3A] focus:bg-white'
                }`}
              />
            </div>

            {/* Tenggat Pengumpulan + Quick Date Chips + Full Calendar Picker Trigger */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="task-deadline-input"
                  className="block text-xs font-bold"
                >
                  Tenggat Pengumpulan
                </label>
                {onRequestCalendarPicker && (
                  <button
                    type="button"
                    onClick={() =>
                      onRequestCalendarPicker(deadline, (picked) =>
                        setDeadline(picked)
                      )
                    }
                    className="text-xs font-bold text-[#C41E3A] hover:underline flex items-center gap-1"
                  >
                    <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Pilih dari Kalender</span>
                  </button>
                )}
              </div>

              {/* Quick Date Selection Buttons: Hari Ini, Besok, Senin Depan */}
              <div className="grid grid-cols-3 gap-2 mb-2.5">
                {QUICK_DEADLINE_OPTIONS.map((option) => {
                  const isSelected = deadline === option.value;
                  return (
                    <button
                      key={option.label}
                      type="button"
                      onClick={() => setDeadline(option.value)}
                      className={`min-h-[44px] px-2.5 py-1.5 rounded-2xl text-xs font-bold flex flex-col items-center justify-center transition-colors border ${
                        isSelected
                          ? 'bg-[#C41E3A] border-[#C41E3A] text-white'
                          : isDarkMode
                          ? 'bg-[#232934] border-[#323A48] text-[#CBD5E1] hover:border-[#C41E3A]'
                          : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#0F172A] hover:bg-[#FFF1F2]'
                      }`}
                    >
                      <span>{option.label}</span>
                      <span
                        className={`text-[10px] font-mono tabular-nums mt-0.5 ${
                          isSelected
                            ? 'text-white/90'
                            : isDarkMode
                            ? 'text-[#94A3B8]'
                            : 'text-[#64748B]'
                        }`}
                      >
                        {option.value}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2">
                <div className="relative flex-1 flex items-center">
                  <Calendar
                    className={`w-4 h-4 absolute left-3.5 pointer-events-none ${
                      isDarkMode ? 'text-[#94A3B8]' : 'text-[#64748B]'
                    }`}
                    aria-hidden="true"
                  />
                  <input
                    id="task-deadline-input"
                    type="text"
                    value={deadline}
                    onClick={() => {
                      if (onRequestCalendarPicker) {
                        onRequestCalendarPicker(deadline, (picked) =>
                          setDeadline(picked)
                        );
                      }
                    }}
                    onChange={(e) => setDeadline(e.target.value)}
                    placeholder="Contoh: 18 Nov 2026"
                    className={`w-full min-h-[44px] pl-10 pr-4 py-2.5 rounded-2xl border text-sm font-mono tabular-nums outline-none transition-colors cursor-pointer ${
                      isDarkMode
                        ? 'bg-[#232934] border-[#323A48] text-white focus:border-[#C41E3A]'
                        : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#0F172A] focus:border-[#C41E3A] focus:bg-white'
                    }`}
                  />
                </div>

                {onRequestCalendarPicker && (
                  <button
                    type="button"
                    onClick={() =>
                      onRequestCalendarPicker(deadline, (picked) =>
                        setDeadline(picked)
                      )
                    }
                    aria-label="Buka kalender bulan"
                    className="min-w-[44px] min-h-[44px] px-3 rounded-2xl bg-[#FFE4E6] text-[#C41E3A] font-bold text-xs flex items-center justify-center shrink-0 hover:bg-[#FECDD3] transition-colors"
                  >
                    <Calendar className="w-4 h-4" aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-2 flex items-center justify-between gap-2.5">
              <button
                type="button"
                onClick={handleClearForm}
                className={`min-h-[44px] px-4 rounded-2xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
                  isDarkMode
                    ? 'bg-[#232934] hover:bg-[#2E3440] text-[#CBD5E1]'
                    : 'bg-[#F8FAFC] border border-[#E2E8F0] hover:bg-[#F1F5F9] text-[#0F172A]'
                }`}
              >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Kosongkan</span>
              </button>

              <button
                type="submit"
                className="flex-1 min-h-[48px] px-5 rounded-2xl bg-[#C41E3A] hover:bg-[#A3162E] text-sm font-bold text-white shadow-sm transition-colors"
              >
                Simpan Tugas
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
