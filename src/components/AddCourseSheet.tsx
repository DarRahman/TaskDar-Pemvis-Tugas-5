import React, { useState } from 'react';
import { AlertCircle, Check, BookPlus } from 'lucide-react';
import { NewCoursePayload, CourseIconKey } from '../types/task';
import { BENTO_COLOR_THEMES, SUBJECT_ICON_OPTIONS } from '../data/initialTasks';
import { renderSubjectIconByKey } from './TaskCard';

export interface AddCourseSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCourse: (payload: NewCoursePayload) => void;
  isDarkMode?: boolean;
}

const CREDIT_OPTIONS = [2, 3, 4] as const;

/*
 * Slide-up bottom sheet modal for adding a new course to Tab 2 (Mata Kuliah),
 * featuring the 12-icon Subject Vector Icon Picker and 5 Bento Color Chips.
 */
export const AddCourseSheet: React.FC<AddCourseSheetProps> = ({
  isOpen,
  onClose,
  onAddCourse,
  isDarkMode = false,
}) => {
  const [name, setName] = useState<string>('');
  const [lecturer, setLecturer] = useState<string>('');
  const [credits, setCredits] = useState<number>(3);
  const [schedule, setSchedule] = useState<string>('Senin, 13:00 - 15:30 WIB');
  const [room, setRoom] = useState<string>('Lab Mobile 2');
  const [selectedIconKey, setSelectedIconKey] = useState<CourseIconKey>('code');
  const [colorThemeId, setColorThemeId] = useState<string>(
    BENTO_COLOR_THEMES[0].id
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) {
    return null;
  }

  const activeTheme =
    BENTO_COLOR_THEMES.find((t) => t.id === colorThemeId) ||
    BENTO_COLOR_THEMES[0];

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!name.trim()) {
      setErrorMessage('Nama mata kuliah wajib diisi.');
      return;
    }
    if (!lecturer.trim()) {
      setErrorMessage('Nama dosen pengampu wajib diisi.');
      return;
    }
    if (!schedule.trim()) {
      setErrorMessage('Hari dan jam perkuliahan wajib diisi.');
      return;
    }
    if (!room.trim()) {
      setErrorMessage('Ruang kuliah wajib diisi.');
      return;
    }

    onAddCourse({
      name: name.trim(),
      lecturer: lecturer.trim(),
      credits,
      schedule: schedule.trim(),
      room: room.trim(),
      iconKey: selectedIconKey,
      colorThemeId,
    });

    setName('');
    setLecturer('');
    setCredits(3);
    setSelectedIconKey('code');
    setErrorMessage(null);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/55 backdrop-blur-[2px] p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-course-sheet-title"
    >
      <div
        className={`w-full max-w-[430px] rounded-t-[32px] sm:rounded-[32px] border shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-150 ${
          isDarkMode
            ? 'bg-[#161A22] border-[#262C3A] text-white'
            : 'bg-white border-[#E2E8F0] text-[#0F172A]'
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
                isDarkMode ? 'text-[#94A3B8]' : 'text-[#64748B]'
              }`}
            >
              Batal
            </button>

            <div className="flex items-center gap-1.5">
              <BookPlus className="w-4 h-4 text-[#C41E3A]" aria-hidden="true" />
              <h2
                id="add-course-sheet-title"
                className="text-[15px] font-bold tracking-tight"
              >
                Tambah Mata Kuliah
              </h2>
            </div>

            <button
              type="submit"
              className="min-h-[44px] min-w-[64px] px-2 flex items-center justify-end text-sm font-bold text-[#C41E3A] hover:text-[#A3162E]"
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

            {/* Nama Mata Kuliah */}
            <div>
              <label
                htmlFor="course-name-input"
                className="block text-xs font-bold mb-1.5"
              >
                Nama Mata Kuliah
              </label>
              <input
                id="course-name-input"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder="Contoh: Kecerdasan Buatan"
                className={`w-full min-h-[44px] px-4 py-2.5 rounded-2xl border text-sm outline-none transition-colors ${
                  isDarkMode
                    ? 'bg-[#232934] border-[#323A48] text-white placeholder:text-[#64748B] focus:border-[#C41E3A]'
                    : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#0F172A] placeholder:text-[#94A3B8] focus:border-[#C41E3A] focus:bg-white'
                }`}
              />
            </div>

            {/* Dosen Pengampu */}
            <div>
              <label
                htmlFor="course-lecturer-input"
                className="block text-xs font-bold mb-1.5"
              >
                Dosen Pengampu
              </label>
              <input
                id="course-lecturer-input"
                type="text"
                value={lecturer}
                onChange={(e) => {
                  setLecturer(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder="Contoh: Ir. Ahmad Fauzi, M.Kom."
                className={`w-full min-h-[44px] px-4 py-2.5 rounded-2xl border text-sm outline-none transition-colors ${
                  isDarkMode
                    ? 'bg-[#232934] border-[#323A48] text-white placeholder:text-[#64748B] focus:border-[#C41E3A]'
                    : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#0F172A] placeholder:text-[#94A3B8] focus:border-[#C41E3A] focus:bg-white'
                }`}
              />
            </div>

            {/* Jumlah SKS & Ruang Kuliah */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="block text-xs font-bold mb-1.5">
                  Jumlah SKS
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  {CREDIT_OPTIONS.map((sks) => {
                    const isSelected = credits === sks;
                    return (
                      <button
                        key={sks}
                        type="button"
                        onClick={() => setCredits(sks)}
                        className={`min-h-[44px] rounded-2xl text-xs font-bold font-mono tabular-nums border transition-colors ${
                          isSelected
                            ? 'bg-[#C41E3A] border-[#C41E3A] text-white'
                            : isDarkMode
                            ? 'bg-[#232934] border-[#323A48] text-[#CBD5E1]'
                            : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#0F172A]'
                        }`}
                      >
                        {sks}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label
                  htmlFor="course-room-input"
                  className="block text-xs font-bold mb-1.5"
                >
                  Ruang Kuliah
                </label>
                <input
                  id="course-room-input"
                  type="text"
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  placeholder="Ruang 302"
                  className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-2xl border text-sm outline-none transition-colors ${
                    isDarkMode
                      ? 'bg-[#232934] border-[#323A48] text-white'
                      : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#0F172A]'
                  }`}
                />
              </div>
            </div>

            {/* Hari & Jam Kuliah */}
            <div>
              <label
                htmlFor="course-schedule-input"
                className="block text-xs font-bold mb-1.5"
              >
                Hari dan Jam Perkuliahan
              </label>
              <input
                id="course-schedule-input"
                type="text"
                value={schedule}
                onChange={(e) => setSchedule(e.target.value)}
                placeholder="Contoh: Senin, 13:00 - 15:30 WIB"
                className={`w-full min-h-[44px] px-4 py-2.5 rounded-2xl border text-sm font-mono tabular-nums outline-none transition-colors ${
                  isDarkMode
                    ? 'bg-[#232934] border-[#323A48] text-white'
                    : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#0F172A]'
                }`}
              />
            </div>

            {/* Subject Vector Icon Picker (12 Options) */}
            <div>
              <span className="block text-xs font-bold mb-2">
                Pilih Ikon Mata Kuliah (12 Pilihan)
              </span>
              <div className="grid grid-cols-6 gap-2">
                {SUBJECT_ICON_OPTIONS.map((item) => {
                  const isPicked = selectedIconKey === item.key;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setSelectedIconKey(item.key)}
                      title={item.label}
                      aria-label={`Pilih ikon ${item.label}`}
                      aria-pressed={isPicked}
                      style={
                        isPicked
                          ? {
                              backgroundColor: activeTheme.iconBg,
                              borderColor: activeTheme.iconBg,
                            }
                          : undefined
                      }
                      className={`min-h-[44px] min-w-[44px] rounded-2xl border flex items-center justify-center transition-all ${
                        isPicked
                          ? 'text-white shadow-xs scale-[1.04]'
                          : isDarkMode
                          ? 'bg-[#232934] border-[#323A48] text-[#CBD5E1] hover:border-[#C41E3A]'
                          : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#0F172A] hover:bg-[#F1F5F9]'
                      }`}
                    >
                      {renderSubjectIconByKey(
                        item.key,
                        `w-4 h-4 ${
                          isPicked
                            ? 'text-white'
                            : isDarkMode
                            ? 'text-[#CBD5E1]'
                            : 'text-[#0F172A]'
                        }`
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bento Color Theme Selector (5 Color Chips) */}
            <div>
              <span className="block text-xs font-bold mb-2">
                Pilih Tema Warna Bento
              </span>
              <div className="grid grid-cols-5 gap-2">
                {BENTO_COLOR_THEMES.map((theme) => {
                  const isPicked = colorThemeId === theme.id;
                  return (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => setColorThemeId(theme.id)}
                      style={{
                        backgroundColor: theme.pastelBg,
                        borderColor: isPicked ? theme.iconBg : theme.pastelBorder,
                      }}
                      className="min-h-[48px] rounded-2xl border-2 flex flex-col items-center justify-center gap-1 p-1 transition-transform active:scale-95"
                      title={theme.name}
                    >
                      <span
                        style={{ backgroundColor: theme.iconBg }}
                        className="w-5 h-5 rounded-full flex items-center justify-center text-white"
                      >
                        {isPicked && <Check className="w-3 h-3 stroke-[3]" />}
                      </span>
                      <span
                        style={{ color: theme.accentColor }}
                        className="text-[10px] font-bold truncate max-w-full"
                      >
                        {theme.name.split(' ')[0]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              className="w-full min-h-[48px] rounded-2xl bg-[#C41E3A] hover:bg-[#A3162E] text-white text-sm font-bold shadow-sm transition-colors"
            >
              Simpan Mata Kuliah
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
