import React, { useState, useEffect } from 'react';
import { AlertCircle, RotateCcw, Calendar } from 'lucide-react';
import { NewTaskPayload } from '../types/task';
import { SEMESTER_5_COURSES } from '../data/initialTasks';

export interface AddTaskSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: (payload: NewTaskPayload) => void;
  titleInputRef: React.RefObject<HTMLInputElement | null>;
  initialCourse?: string;
  isDarkMode?: boolean;
}

const QUICK_DEADLINE_OPTIONS = [
  { label: 'Hari Ini', value: '08 Nov 2026' },
  { label: 'Besok', value: '09 Nov 2026' },
  { label: 'Senin Depan', value: '16 Nov 2026' },
] as const;

/*
 * Slide-up bottom sheet modal for adding a new academic assignment.
 * Includes quick date selection chips and programmatic useRef focus
 * on the task title input.
 */
export const AddTaskSheet: React.FC<AddTaskSheetProps> = ({
  isOpen,
  onClose,
  onAddTask,
  titleInputRef,
  initialCourse,
  isDarkMode = false,
}) => {
  const [title, setTitle] = useState<string>('');
  const [course, setCourse] = useState<string>(
    initialCourse || SEMESTER_5_COURSES[0]
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
    setCourse(initialCourse || SEMESTER_5_COURSES[0]);
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
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-[2px] p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-task-sheet-title"
    >
      <div
        className={`w-full max-w-[430px] rounded-t-[32px] sm:rounded-[32px] border shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-150 ${
          isDarkMode
            ? 'bg-[#1A1F28] border-[#2E3440] text-[#F8FAFC]'
            : 'bg-[#FDFBF7] border-[#EFE8DC] text-[#1E1B18]'
        }`}
      >
        {/* Drag Handle Bar */}
        <div className="pt-3 pb-1 flex justify-center">
          <div
            className={`w-11 h-1.5 rounded-full ${
              isDarkMode ? 'bg-[#3B4252]' : 'bg-[#DDD5C7]'
            }`}
            aria-hidden="true"
          />
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {/* Header Bar: Batal · Tambah Tugas · Simpan */}
          <div
            className={`px-4 pb-2.5 flex items-center justify-between border-b ${
              isDarkMode ? 'border-[#2E3440]' : 'border-[#EFE8DC]'
            }`}
          >
            <button
              type="button"
              onClick={onClose}
              className={`min-h-[44px] min-w-[64px] px-2 flex items-center justify-start text-sm font-semibold transition-colors ${
                isDarkMode
                  ? 'text-[#94A3B8] hover:text-white'
                  : 'text-[#6E6658] hover:text-[#1E1B18]'
              }`}
            >
              Batal
            </button>

            <h2
              id="add-task-sheet-title"
              className="text-[15px] font-bold tracking-tight"
            >
              Tambah Tugas
            </h2>

            <button
              type="submit"
              className="min-h-[44px] min-w-[64px] px-2 flex items-center justify-end text-sm font-bold text-[#EC6B56] hover:text-[#D95540] transition-colors"
            >
              Simpan
            </button>
          </div>

          {/* Form Body */}
          <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
            {errorMessage && (
              <div
                role="alert"
                className="flex items-center gap-2 p-3 rounded-2xl bg-[#FFEAE6] border border-[#FBC7BE] text-xs font-semibold text-[#B91C1C]"
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
                  className={`block text-xs font-bold ${
                    isDarkMode ? 'text-[#CBD5E1]' : 'text-[#4A4338]'
                  }`}
                >
                  Judul Tugas
                </label>
                <span
                  className={`text-[11px] font-mono tabular-nums ${
                    isDarkMode ? 'text-[#64748B]' : 'text-[#8C8476]'
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
                    ? 'bg-[#232934] border-[#323A48] text-white placeholder:text-[#64748B] focus:border-[#EC6B56]'
                    : 'bg-[#F4EFE6] border-transparent text-[#1E1B18] placeholder:text-[#8C8476] focus:border-[#EC6B56] focus:bg-white'
                }`}
              />
            </div>

            {/* Pilihan Mata Kuliah */}
            <div>
              <label
                htmlFor="task-course-input"
                className={`block text-xs font-bold mb-1.5 ${
                  isDarkMode ? 'text-[#CBD5E1]' : 'text-[#4A4338]'
                }`}
              >
                Mata Kuliah
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2.5">
                {SEMESTER_5_COURSES.map((courseOption) => {
                  const isSelected = course === courseOption;
                  return (
                    <button
                      key={courseOption}
                      type="button"
                      onClick={() => setCourse(courseOption)}
                      className={`min-h-[44px] px-3.5 py-1.5 rounded-2xl text-xs font-semibold transition-colors ${
                        isSelected
                          ? 'bg-[#EC6B56] text-white'
                          : isDarkMode
                          ? 'bg-[#232934] text-[#CBD5E1] hover:bg-[#2E3440]'
                          : 'bg-[#F4EFE6] text-[#4A4338] hover:bg-[#EAE2D3]'
                      }`}
                    >
                      {courseOption}
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
                    ? 'bg-[#232934] border-[#323A48] text-white placeholder:text-[#64748B] focus:border-[#EC6B56]'
                    : 'bg-[#F4EFE6] border-transparent text-[#1E1B18] placeholder:text-[#8C8476] focus:border-[#EC6B56] focus:bg-white'
                }`}
              />
            </div>

            {/* Deskripsi Tugas */}
            <div>
              <label
                htmlFor="task-desc-input"
                className={`block text-xs font-bold mb-1.5 ${
                  isDarkMode ? 'text-[#CBD5E1]' : 'text-[#4A4338]'
                }`}
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
                    ? 'bg-[#232934] border-[#323A48] text-white placeholder:text-[#64748B] focus:border-[#EC6B56]'
                    : 'bg-[#F4EFE6] border-transparent text-[#1E1B18] placeholder:text-[#8C8476] focus:border-[#EC6B56] focus:bg-white'
                }`}
              />
            </div>

            {/* Tenggat Pengumpulan + Quick Date Selection Chips */}
            <div>
              <label
                htmlFor="task-deadline-input"
                className={`block text-xs font-bold mb-1.5 ${
                  isDarkMode ? 'text-[#CBD5E1]' : 'text-[#4A4338]'
                }`}
              >
                Tenggat Pengumpulan
              </label>

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
                          ? 'bg-[#2A9D8F] border-[#2A9D8F] text-white'
                          : isDarkMode
                          ? 'bg-[#232934] border-[#323A48] text-[#CBD5E1] hover:border-[#2A9D8F]'
                          : 'bg-[#F4EFE6] border-transparent text-[#4A4338] hover:bg-[#EAE2D3]'
                      }`}
                    >
                      <span>{option.label}</span>
                      <span
                        className={`text-[10px] font-mono tabular-nums mt-0.5 ${
                          isSelected
                            ? 'text-white/90'
                            : isDarkMode
                            ? 'text-[#94A3B8]'
                            : 'text-[#6E6658]'
                        }`}
                      >
                        {option.value}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="relative flex items-center">
                <Calendar
                  className={`w-4 h-4 absolute left-3.5 pointer-events-none ${
                    isDarkMode ? 'text-[#94A3B8]' : 'text-[#6E6658]'
                  }`}
                  aria-hidden="true"
                />
                <input
                  id="task-deadline-input"
                  type="text"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  placeholder="Contoh: 18 Nov 2026"
                  className={`w-full min-h-[44px] pl-10 pr-4 py-2.5 rounded-2xl border text-sm font-mono tabular-nums outline-none transition-colors ${
                    isDarkMode
                      ? 'bg-[#232934] border-[#323A48] text-white placeholder:text-[#64748B] focus:border-[#EC6B56]'
                      : 'bg-[#F4EFE6] border-transparent text-[#1E1B18] placeholder:text-[#8C8476] focus:border-[#EC6B56] focus:bg-white'
                  }`}
                />
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
                    : 'bg-[#F4EFE6] hover:bg-[#EAE2D3] text-[#4A4338]'
                }`}
              >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Kosongkan</span>
              </button>

              <button
                type="submit"
                className="flex-1 min-h-[48px] px-5 rounded-2xl bg-[#EC6B56] hover:bg-[#D95540] text-sm font-bold text-white shadow-sm transition-colors"
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
