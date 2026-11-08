import React, { useState, useEffect, useRef } from 'react';
import { AlertCircle, Check, BookPlus, Upload, Sparkles } from 'lucide-react';
import {
  NewCoursePayload,
  CourseIconKey,
  CourseDetail,
} from '../types/task';
import {
  BENTO_COLOR_THEMES,
  COURSE_STICKER_GALLERY,
} from '../data/initialTasks';

export interface AddCourseSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCourse: (payload: NewCoursePayload) => void;
  editingCourse?: CourseDetail | null;
  isDarkMode?: boolean;
}

const CREDIT_OPTIONS = [2, 3, 4] as const;

const DAY_CHIPS = [
  'Senin',
  'Selasa',
  'Rabu',
  'Kamis',
  'Jumat',
  'Sabtu',
] as const;

const TIME_SLOT_CHIPS = [
  '08:00 - 10:30 WIB',
  '10:30 - 13:00 WIB',
  '13:00 - 15:30 WIB',
  '15:30 - 18:00 WIB',
] as const;

/*
 * Slide-up bottom sheet modal for adding or editing a course in Tab 2 (Mata Kuliah),
 * featuring an 8-character Expressive 2D Sticker Picker, Custom Image Upload,
 * Quick Day & Time Slot Chips, and 5 Bento Color Themes.
 */
export const AddCourseSheet: React.FC<AddCourseSheetProps> = ({
  isOpen,
  onClose,
  onAddCourse,
  editingCourse = null,
  isDarkMode = false,
}) => {
  const [name, setName] = useState<string>('');
  const [lecturer, setLecturer] = useState<string>('');
  const [credits, setCredits] = useState<number>(3);
  const [selectedDay, setSelectedDay] = useState<string>('Senin');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>(
    '08:00 - 10:30 WIB'
  );
  const [room, setRoom] = useState<string>('Lab Mobile 2');
  const [selectedIconKey, setSelectedIconKey] = useState<CourseIconKey>('code');
  const [selectedStickerUrl, setSelectedStickerUrl] = useState<string>(
    COURSE_STICKER_GALLERY[0].imageUrl
  );
  const [colorThemeId, setColorThemeId] = useState<string>(
    BENTO_COLOR_THEMES[0].id
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (editingCourse) {
      setName(editingCourse.name);
      setLecturer(editingCourse.lecturer);
      setCredits(editingCourse.credits);
      setRoom(editingCourse.room);
      setSelectedIconKey(editingCourse.iconKey);
      setSelectedStickerUrl(
        editingCourse.stickerUrl || COURSE_STICKER_GALLERY[0].imageUrl
      );
      const parts = editingCourse.schedule.split(',');
      if (parts.length >= 2) {
        setSelectedDay(parts[0].trim());
        setSelectedTimeSlot(parts.slice(1).join(',').trim());
      }
      const matchedTheme = BENTO_COLOR_THEMES.find(
        (t) => t.iconBg.toLowerCase() === editingCourse.iconBg.toLowerCase()
      );
      if (matchedTheme) {
        setColorThemeId(matchedTheme.id);
      }
      setErrorMessage(null);
    } else {
      setName('');
      setLecturer('');
      setCredits(3);
      setSelectedDay('Senin');
      setSelectedTimeSlot('08:00 - 10:30 WIB');
      setRoom('Lab Mobile 2');
      setSelectedIconKey('code');
      setSelectedStickerUrl(COURSE_STICKER_GALLERY[0].imageUrl);
      setColorThemeId(BENTO_COLOR_THEMES[0].id);
      setErrorMessage(null);
    }
  }, [editingCourse, isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleCustomStickerUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setSelectedStickerUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

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
    if (!room.trim()) {
      setErrorMessage('Ruang kuliah wajib diisi.');
      return;
    }

    onAddCourse({
      id: editingCourse?.id,
      name: name.trim(),
      lecturer: lecturer.trim(),
      credits,
      schedule: `${selectedDay}, ${selectedTimeSlot}`,
      room: room.trim(),
      iconKey: selectedIconKey,
      stickerUrl: selectedStickerUrl,
      colorThemeId,
    });

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
                isDarkMode ? 'text-[#94A3B8]' : 'text-[#64748B]'
              }`}
            >
              Batal
            </button>

            <div className="flex items-center gap-1.5">
              <BookPlus className="w-4 h-4 text-[#C41E3A]" aria-hidden="true" />
              <h2
                id="add-course-sheet-title"
                className="text-[15px] font-extrabold tracking-tight"
              >
                {editingCourse ? 'Edit Mata Kuliah' : 'Tambah Mata Kuliah'}
              </h2>
            </div>

            <button
              type="submit"
              className="min-h-[44px] min-w-[64px] px-2 flex items-center justify-end text-sm font-extrabold text-[#C41E3A] hover:text-[#A3162E]"
            >
              Simpan
            </button>
          </div>

          <div className="p-5 space-y-4 max-h-[76vh] overflow-y-auto">
            {errorMessage && (
              <div
                role="alert"
                className="flex items-center gap-2 p-3 rounded-2xl bg-[#FEE2E2] border border-[#FECACA] text-xs font-semibold text-[#C41E3A]"
              >
                <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Expressive 2D Character Sticker Picker + Custom Upload */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-extrabold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#C41E3A]" aria-hidden="true" />
                  <span>Pilih Karakter Stiker Visual</span>
                </span>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleCustomStickerUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="min-h-[34px] px-2.5 py-1 rounded-xl bg-[#FEE2E2] hover:bg-[#FECACA] text-[#C41E3A] text-[11px] font-extrabold flex items-center gap-1 transition-colors"
                >
                  <Upload className="w-3 h-3" aria-hidden="true" />
                  <span>Unggah Gambar Sendiri</span>
                </button>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {COURSE_STICKER_GALLERY.map((sticker) => {
                  const isPicked = selectedStickerUrl === sticker.imageUrl;
                  return (
                    <button
                      key={sticker.id}
                      type="button"
                      onClick={() => {
                        setSelectedStickerUrl(sticker.imageUrl);
                        setSelectedIconKey(sticker.defaultIconKey);
                      }}
                      className={`p-1.5 rounded-2xl border-2 flex flex-col items-center gap-1 transition-all ${
                        isPicked
                          ? 'border-[#C41E3A] bg-[#FFF1F2] scale-[1.03] shadow-xs'
                          : isDarkMode
                          ? 'border-[#323A48] bg-[#232934]'
                          : 'border-[#E2E8F0] bg-[#F8FAFC]'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-xl overflow-hidden border border-[#0F172A]/20 bg-white">
                        <img
                          src={sticker.imageUrl}
                          alt={sticker.label}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="text-[10px] font-bold truncate max-w-full">
                        {sticker.label.replace('Karakter ', '')}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Preview if user uploaded custom image */}
              {!COURSE_STICKER_GALLERY.some(
                (s) => s.imageUrl === selectedStickerUrl
              ) && (
                <div className="mt-2 p-2.5 rounded-2xl bg-[#D1FAE5] border border-[#A7F3D0] flex items-center gap-3">
                  <img
                    src={selectedStickerUrl}
                    alt="Stiker Kustom"
                    className="w-11 h-11 rounded-xl object-cover border border-[#0F172A]"
                  />
                  <div className="text-xs font-bold text-[#065F46]">
                    Gambar sampul kustom berhasil dipilih!
                  </div>
                </div>
              )}
            </div>

            {/* Nama Mata Kuliah */}
            <div>
              <label
                htmlFor="course-name-input"
                className="block text-xs font-extrabold mb-1.5"
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
                className={`w-full min-h-[44px] px-4 py-2.5 rounded-2xl border-2 text-sm font-semibold outline-none transition-colors ${
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
                className="block text-xs font-extrabold mb-1.5"
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
                className={`w-full min-h-[44px] px-4 py-2.5 rounded-2xl border-2 text-sm font-semibold outline-none transition-colors ${
                  isDarkMode
                    ? 'bg-[#232934] border-[#323A48] text-white placeholder:text-[#64748B] focus:border-[#C41E3A]'
                    : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#0F172A] placeholder:text-[#94A3B8] focus:border-[#C41E3A] focus:bg-white'
                }`}
              />
            </div>

            {/* Jumlah SKS & Ruang Kuliah */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="block text-xs font-extrabold mb-1.5">
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
                        className={`min-h-[44px] rounded-2xl text-xs font-extrabold font-mono tabular-nums border-2 transition-colors ${
                          isSelected
                            ? 'bg-[#C41E3A] border-[#0F172A] text-white'
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
                  className="block text-xs font-extrabold mb-1.5"
                >
                  Ruang Kuliah
                </label>
                <input
                  id="course-room-input"
                  type="text"
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  placeholder="Ruang 302"
                  className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-2xl border-2 text-sm font-semibold outline-none transition-colors ${
                    isDarkMode
                      ? 'bg-[#232934] border-[#323A48] text-white'
                      : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#0F172A]'
                  }`}
                />
              </div>
            </div>

            {/* Quick Day Chips & Time Slot Chips (No More Manual Typing!) */}
            <div>
              <span className="block text-xs font-extrabold mb-1.5">
                Pilih Hari Kuliah
              </span>
              <div className="grid grid-cols-6 gap-1.5 mb-2.5">
                {DAY_CHIPS.map((day) => {
                  const isSelected = selectedDay === day;
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => setSelectedDay(day)}
                      className={`min-h-[38px] rounded-xl text-[11px] font-extrabold border transition-colors ${
                        isSelected
                          ? 'bg-[#C41E3A] border-[#0F172A] text-white'
                          : isDarkMode
                          ? 'bg-[#232934] border-[#323A48] text-[#CBD5E1]'
                          : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#334155]'
                      }`}
                    >
                      {day.slice(0, 3)}
                    </button>
                  );
                })}
              </div>

              <span className="block text-xs font-extrabold mb-1.5">
                Pilih Jam Perkuliahan
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {TIME_SLOT_CHIPS.map((slot) => {
                  const isSelected = selectedTimeSlot === slot;
                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedTimeSlot(slot)}
                      className={`min-h-[40px] px-2 rounded-xl text-[11px] font-mono font-bold border transition-colors ${
                        isSelected
                          ? 'bg-[#FEE2E2] border-[#C41E3A] text-[#C41E3A]'
                          : isDarkMode
                          ? 'bg-[#232934] border-[#323A48] text-[#CBD5E1]'
                          : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#334155]'
                      }`}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bento Color Theme Selector (5 Color Chips) */}
            <div>
              <span className="block text-xs font-extrabold mb-2">
                Pilih Tema Warna Kartu Bento
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
                        borderColor: isPicked ? '#0F172A' : theme.pastelBorder,
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
                        className="text-[10px] font-extrabold truncate max-w-full"
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
              className="w-full min-h-[48px] rounded-2xl bg-[#C41E3A] hover:bg-[#A3162E] text-white text-sm font-extrabold border-2 border-[#0F172A] shadow-xs transition-colors"
            >
              {editingCourse
                ? 'Simpan Perubahan Mata Kuliah'
                : 'Simpan Mata Kuliah Baru'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
