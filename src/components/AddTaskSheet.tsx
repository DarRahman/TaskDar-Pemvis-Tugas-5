import React, { useState, useEffect } from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { NewTaskPayload } from '../types/task';
import { SEMESTER_5_COURSES } from '../data/initialTasks';

export interface AddTaskSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: (payload: NewTaskPayload) => void;
  titleInputRef: React.RefObject<HTMLInputElement | null>;
}

/*
 * Bottom sheet form modeled after the Slothy task creation modal.
 * Uses controlled useState inputs and programmatic useRef focus management
 * on the task title input upon opening or form reset.
 */
export const AddTaskSheet: React.FC<AddTaskSheetProps> = ({
  isOpen,
  onClose,
  onAddTask,
  titleInputRef,
}) => {
  const [title, setTitle] = useState<string>('');
  const [course, setCourse] = useState<string>(SEMESTER_5_COURSES[0]);
  const [description, setDescription] = useState<string>('');
  const [deadline, setDeadline] = useState<string>('20 Nov 2026');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
    setCourse(SEMESTER_5_COURSES[0]);
    setDescription('');
    setDeadline('20 Nov 2026');
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
      setErrorMessage('Nama mata kuliah wajib diisi.');
      return;
    }
    if (!description.trim()) {
      setErrorMessage('Deskripsi atau instruksi tugas wajib diisi.');
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
      <div className="w-full max-w-[430px] rounded-t-3xl sm:rounded-3xl bg-[#F5F5F3] border border-[#E4E2DD] shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-150">
        {/* Grab Handle Affordance */}
        <div className="pt-2.5 pb-1 flex justify-center">
          <div className="w-10 h-1.5 rounded-full bg-[#D4D2CD]" aria-hidden="true" />
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {/* Sheet Header: Batal · Tambah Tugas · Simpan */}
          <div className="px-4 pb-2 flex items-center justify-between border-b border-[#E4E2DD]">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] min-w-[64px] px-2 flex items-center justify-start text-sm font-medium text-[#52524E] hover:text-[#18181B] transition-colors"
            >
              Batal
            </button>

            <h2
              id="add-task-sheet-title"
              className="text-[15px] font-bold text-[#18181B] tracking-tight"
            >
              Tambah Tugas
            </h2>

            <button
              type="submit"
              className="min-h-[44px] min-w-[64px] px-2 flex items-center justify-end text-sm font-bold text-[#18181B] hover:text-[#1E5E4E] transition-colors"
            >
              Simpan
            </button>
          </div>

          {/* Sheet Form Fields */}
          <div className="p-4 space-y-4 max-h-[75vh] overflow-y-auto">
            {errorMessage && (
              <div
                role="alert"
                className="flex items-center gap-2 p-3 rounded-xl bg-[#FEE2E2] border border-[#FECACA] text-xs font-medium text-[#991B1B]"
              >
                <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Judul Tugas (Targeted by useRef) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="task-title-input"
                  className="block text-xs font-semibold text-[#3F3F3B]"
                >
                  Judul Tugas (Fokus Otomatis useRef)
                </label>
                <span className="text-[11px] font-mono tabular-nums text-[#64645E]">
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
                placeholder="Contoh: Tugas Pertemuan 6 - Navigasi Stack"
                className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-[#EAE7E1] border border-transparent focus:border-[#18181B] focus:bg-white text-sm text-[#18181B] placeholder:text-[#71716A] outline-none transition-colors"
              />
            </div>

            {/* Mata Kuliah Selector + Custom Input */}
            <div>
              <label
                htmlFor="task-course-input"
                className="block text-xs font-semibold text-[#3F3F3B] mb-1.5"
              >
                Mata Kuliah Semester 5
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {SEMESTER_5_COURSES.map((courseOption) => {
                  const isSelected = course === courseOption;
                  return (
                    <button
                      key={courseOption}
                      type="button"
                      onClick={() => setCourse(courseOption)}
                      className={`min-h-[44px] px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                        isSelected
                          ? 'bg-[#18181B] text-white'
                          : 'bg-[#EAE7E1] text-[#3F3F3B] hover:bg-[#DFDCD4]'
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
                className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-[#EAE7E1] border border-transparent focus:border-[#18181B] focus:bg-white text-sm text-[#18181B] placeholder:text-[#71716A] outline-none transition-colors"
              />
            </div>

            {/* Deskripsi Tugas */}
            <div>
              <label
                htmlFor="task-desc-input"
                className="block text-xs font-semibold text-[#3F3F3B] mb-1.5"
              >
                Deskripsi dan Instruksi
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
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#EAE7E1] border border-transparent focus:border-[#18181B] focus:bg-white text-sm text-[#18181B] placeholder:text-[#71716A] outline-none transition-colors resize-none"
              />
            </div>

            {/* Tenggat Waktu */}
            <div>
              <label
                htmlFor="task-deadline-input"
                className="block text-xs font-semibold text-[#3F3F3B] mb-1.5"
              >
                Tenggat Waktu Pengumpulan
              </label>
              <input
                id="task-deadline-input"
                type="text"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                placeholder="Contoh: 18 Nov 2026"
                className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-[#EAE7E1] border border-transparent focus:border-[#18181B] focus:bg-white text-sm font-mono tabular-nums text-[#18181B] placeholder:text-[#71716A] outline-none transition-colors"
              />
            </div>

            {/* Bottom Sheet Action Footer */}
            <div className="pt-2 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={handleClearForm}
                className="min-h-[44px] px-3.5 rounded-xl bg-[#EAE7E1] hover:bg-[#DFDCD4] text-xs font-semibold text-[#3F3F3B] flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Bersihkan & Fokus Input</span>
              </button>

              <button
                type="submit"
                className="min-h-[44px] px-5 rounded-xl bg-[#18181B] hover:bg-[#27272A] text-xs font-semibold text-white transition-colors"
              >
                Simpan Tugas Baru
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
