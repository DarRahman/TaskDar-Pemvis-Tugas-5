import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  AlertCircle,
  Check,
  BookPlus,
  Upload,
  Sparkles,
  Clock,
  Palette,
} from 'lucide-react';
import {
  NewCoursePayload,
  CourseIconKey,
  CourseDetail,
} from '../types/task';
import {
  BENTO_COLOR_THEMES,
  COURSE_STICKER_GALLERY,
  deriveBentoThemeFromHex,
  getReadableTextColor,
} from '../data/initialTasks';
import {
  convertImageFileToWebpDataUrl,
  toWebpAssetPath,
} from '../utils/imageOptimizer';

export interface AddCourseSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCourse: (payload: NewCoursePayload) => void;
  editingCourse?: CourseDetail | null;
  isDarkMode?: boolean;
}

const DAY_CHIPS = [
  { full: 'Senin', short: 'Sen' },
  { full: 'Selasa', short: 'Sel' },
  { full: 'Rabu', short: 'Rab' },
  { full: 'Kamis', short: 'Kam' },
  { full: 'Jumat', short: 'Jum' },
  { full: 'Sabtu', short: 'Sab' },
  { full: 'Minggu', short: 'Min' },
] as const;

const QUICK_TIME_PRESETS = [
  { label: 'Pagi 08:00', start: '08:00', end: '10:30' },
  { label: 'Siang 10:30', start: '10:30', end: '13:00' },
  { label: 'Sore 13:00', start: '13:00', end: '15:30' },
  { label: 'Petang 15:30', start: '15:30', end: '18:00' },
] as const;

/*
 * Slide-up / button-morph modal for adding or editing a course in Tab 2 (Mata Kuliah),
 * featuring an 8-character clean 2D Sticker Picker, Custom Image Upload,
 * 7-Day Selection (Sen-Min), Custom SKS Input, Mobile Time Picker + Free Text,
 * and Custom RGB / Full-Spectrum Color Picker with automatic contrast protection.
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
  const [customCreditsMode, setCustomCreditsMode] = useState<boolean>(false);
  const [customCreditsText, setCustomCreditsText] = useState<string>('4');

  const [selectedDay, setSelectedDay] = useState<string>('Senin');
  const [timeMode, setTimeMode] = useState<'picker' | 'manual'>('picker');
  const [startTime, setStartTime] = useState<string>('08:00');
  const [endTime, setEndTime] = useState<string>('10:30');
  const [manualTimeText, setManualTimeText] = useState<string>(
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
  const [customHexColor, setCustomHexColor] = useState<string>('#7C3AED');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const customCreditsInputRef = useRef<HTMLInputElement | null>(null);
  const colorInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (editingCourse) {
      setName(editingCourse.name);
      setLecturer(editingCourse.lecturer);
      setCredits(editingCourse.credits);
      if (editingCourse.credits !== 2 && editingCourse.credits !== 3) {
        setCustomCreditsMode(true);
        setCustomCreditsText(String(editingCourse.credits));
      } else {
        setCustomCreditsMode(false);
        setCustomCreditsText('4');
      }
      setRoom(editingCourse.room);
      setSelectedIconKey(editingCourse.iconKey);
      setSelectedStickerUrl(
        editingCourse.stickerUrl || COURSE_STICKER_GALLERY[0].imageUrl
      );

      const parts = editingCourse.schedule.split(',');
      if (parts.length >= 2) {
        setSelectedDay(parts[0].trim());
        const timePart = parts.slice(1).join(',').trim();
        setManualTimeText(timePart);
        const match = timePart.match(/(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})/);
        if (match) {
          setStartTime(match[1]);
          setEndTime(match[2]);
          setTimeMode('picker');
        } else {
          setTimeMode('manual');
        }
      }

      const matchedTheme = BENTO_COLOR_THEMES.find(
        (t) => t.iconBg.toLowerCase() === editingCourse.iconBg.toLowerCase()
      );
      if (matchedTheme) {
        setColorThemeId(matchedTheme.id);
      } else {
        setColorThemeId('custom');
        setCustomHexColor(editingCourse.iconBg);
      }
      setErrorMessage(null);
    } else {
      setName('');
      setLecturer('');
      setCredits(3);
      setCustomCreditsMode(false);
      setCustomCreditsText('4');
      setSelectedDay('Senin');
      setTimeMode('picker');
      setStartTime('08:00');
      setEndTime('10:30');
      setManualTimeText('08:00 - 10:30 WIB');
      setRoom('Lab Mobile 2');
      setSelectedIconKey('code');
      setSelectedStickerUrl(COURSE_STICKER_GALLERY[0].imageUrl);
      setColorThemeId(BENTO_COLOR_THEMES[0].id);
      setCustomHexColor('#7C3AED');
      setErrorMessage(null);
    }
  }, [editingCourse, isOpen]);

  const handleCustomStickerUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const webpDataUrl = await convertImageFileToWebpDataUrl(file, 768, 0.92);
      setSelectedStickerUrl(webpDataUrl);
    } catch {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setSelectedStickerUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
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

    const parsedCredits = customCreditsMode
      ? Math.max(1, Math.min(12, parseInt(customCreditsText, 10) || 1))
      : credits;

    const finalTimeString =
      timeMode === 'picker'
        ? `${startTime} - ${endTime} WIB`
        : manualTimeText.trim() || '08:00 - 10:30 WIB';

    onAddCourse({
      id: editingCourse?.id,
      name: name.trim(),
      lecturer: lecturer.trim(),
      credits: parsedCredits,
      schedule: `${selectedDay}, ${finalTimeString}`,
      room: room.trim(),
      iconKey: selectedIconKey,
      stickerUrl: selectedStickerUrl,
      colorThemeId,
      customAccentHex: colorThemeId === 'custom' ? customHexColor : undefined,
    });

    onClose();
  };

  const customPreviewTheme = deriveBentoThemeFromHex(customHexColor);
  const customCircleText = getReadableTextColor(customHexColor);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="add-course-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/55 backdrop-blur-[2px] p-0 sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-course-sheet-title"
        >
          <motion.div
            key="add-course-sheet-body"
            initial={{
              scale: 0.25,
              opacity: 0,
              x: 110,
              y: -180,
              borderRadius: '48px',
            }}
            animate={{
              scale: 1,
              opacity: 1,
              x: 0,
              y: 0,
              borderRadius: '32px',
            }}
            exit={{
              scale: 0.25,
              opacity: 0,
              x: 110,
              y: -180,
              borderRadius: '48px',
            }}
            transition={{
              type: 'spring',
              stiffness: 290,
              damping: 25,
            }}
            onClick={(e) => e.stopPropagation()}
            style={{ transformOrigin: 'top right' }}
            className={`w-full max-w-[480px] rounded-t-[32px] sm:rounded-[32px] border-2 shadow-2xl overflow-hidden ${
              isDarkMode
                ? 'bg-[#161A22] border-[#262C3A] text-white'
                : 'bg-white border-[#0F172A] text-[#0F172A]'
            }`}
          >
            {/* Dominant Red Header Band */}
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
                  <BookPlus
                    className="w-4 h-4 text-white"
                    aria-hidden="true"
                  />
                  <h2
                    id="add-course-sheet-title"
                    className="text-[15px] font-black tracking-tight"
                  >
                    {editingCourse ? 'Edit Mata Kuliah' : 'Tambah Mata Kuliah'}
                  </h2>
                </div>

                <button
                  type="submit"
                  form="add-course-form"
                  className="min-h-[38px] px-3.5 rounded-xl bg-white text-[#C41E3A] border-2 border-[#0F172A] text-xs font-black shadow-[0_2px_0_0_#0F172A] active:translate-y-0.5 transition-all"
                >
                  Simpan
                </button>
              </div>
            </div>

            <form id="add-course-form" onSubmit={handleSubmit} noValidate>
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

                {/* Expressive 2D Character Sticker Picker + Custom Upload */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-extrabold flex items-center gap-1">
                      <Sparkles
                        className="w-3.5 h-3.5 text-[#C41E3A]"
                        aria-hidden="true"
                      />
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
                      className="min-h-[34px] px-2.5 py-1 rounded-xl bg-white hover:bg-[#FFF1F2] text-[#C41E3A] border-2 border-[#0F172A] shadow-[0_2px_0_0_#0F172A] text-[11px] font-extrabold flex items-center gap-1 transition-all active:translate-y-0.5"
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
                              ? 'border-[#C41E3A] bg-[#FFF1F2] text-[#0F172A] scale-[1.02] shadow-[0_2px_0_0_#C41E3A]'
                              : isDarkMode
                              ? 'border-[#323A48] bg-[#232934] text-white'
                              : 'border-[#CBD5E1] bg-[#F8FAFC] text-[#0F172A]'
                          }`}
                        >
                          <img
                            src={toWebpAssetPath(sticker.imageUrl)}
                            alt={sticker.label}
                            className="w-11 h-11 rounded-xl object-cover border border-[#0F172A]/20"
                          />
                          <span className="text-[10px] font-extrabold truncate max-w-full">
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
                    <div className="mt-2 p-2.5 rounded-2xl bg-[#D1FAE5] border-2 border-[#0F172A] flex items-center gap-3">
                      <img
                        src={selectedStickerUrl}
                        alt="Stiker Kustom"
                        className="w-11 h-11 rounded-xl object-cover border border-[#0F172A] bg-white"
                      />
                      <div className="text-xs font-extrabold text-[#065F46]">
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
                    placeholder="Pemvis 1"
                    className={`w-full min-h-[44px] px-4 py-2.5 rounded-2xl border-2 text-sm font-semibold outline-none transition-colors ${
                      isDarkMode
                        ? 'bg-[#232934] border-[#323A48] text-white placeholder:text-[#64748B] focus:border-[#C41E3A]'
                        : 'bg-[#F8FAFC] border-[#CBD5E1] text-[#0F172A] placeholder:text-[#94A3B8] focus:border-[#C41E3A] focus:bg-white'
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
                    placeholder="Contoh: Rifky Hilmanudin, S.Kom., M.Kom."
                    className={`w-full min-h-[44px] px-4 py-2.5 rounded-2xl border-2 text-sm font-semibold outline-none transition-colors ${
                      isDarkMode
                        ? 'bg-[#232934] border-[#323A48] text-white placeholder:text-[#64748B] focus:border-[#C41E3A]'
                        : 'bg-[#F8FAFC] border-[#CBD5E1] text-[#0F172A] placeholder:text-[#94A3B8] focus:border-[#C41E3A] focus:bg-white'
                    }`}
                  />
                </div>

                {/* Jumlah SKS (2, 3, or Custom Typed SKS) & Ruang Kuliah */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="block text-xs font-extrabold mb-1.5">
                      Jumlah SKS (Pilih atau Ketik)
                    </span>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[2, 3].map((sks) => {
                        const isSelected =
                          !customCreditsMode && credits === sks;
                        return (
                          <button
                            key={sks}
                            type="button"
                            onClick={() => {
                              setCustomCreditsMode(false);
                              setCredits(sks);
                            }}
                            className={`min-h-[44px] rounded-2xl text-xs font-extrabold border-2 transition-all ${
                              isSelected
                                ? 'bg-[#C41E3A] border-[#0F172A] text-white shadow-[0_2px_0_0_#0F172A]'
                                : isDarkMode
                                ? 'bg-[#232934] border-[#323A48] text-[#CBD5E1]'
                                : 'bg-[#F8FAFC] border-[#CBD5E1] text-[#0F172A]'
                            }`}
                          >
                            {sks} SKS
                          </button>
                        );
                      })}

                      {/* Option 3: Custom Typed SKS Input */}
                      <div className="relative">
                        <input
                          ref={customCreditsInputRef}
                          type="number"
                          min={1}
                          max={12}
                          value={customCreditsMode ? customCreditsText : ''}
                          onFocus={() => setCustomCreditsMode(true)}
                          onChange={(e) => {
                            setCustomCreditsMode(true);
                            setCustomCreditsText(e.target.value);
                          }}
                          placeholder="Ketik..."
                          aria-label="Ketik jumlah SKS kustom"
                          className={`w-full min-h-[44px] px-2 text-center rounded-2xl text-xs font-extrabold border-2 outline-none transition-colors ${
                            customCreditsMode
                              ? 'bg-[#FFF1F2] border-[#C41E3A] text-[#C41E3A]'
                              : isDarkMode
                              ? 'bg-[#232934] border-[#323A48] text-[#CBD5E1] placeholder:text-[#94A3B8]'
                              : 'bg-[#F8FAFC] border-[#CBD5E1] text-[#0F172A] placeholder:text-[#64748B]'
                          }`}
                        />
                      </div>
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
                      placeholder="Contoh: Lab Multimedia / Ruang 203"
                      className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-2xl border-2 text-sm font-semibold outline-none transition-colors ${
                        isDarkMode
                          ? 'bg-[#232934] border-[#323A48] text-white'
                          : 'bg-[#F8FAFC] border-[#CBD5E1] text-[#0F172A]'
                      }`}
                    />
                  </div>
                </div>

                {/* 7-Day Selection (Senin s/d Minggu) */}
                <div>
                  <span className="block text-xs font-extrabold mb-1.5">
                    Pilih Hari Kuliah (Senin s/d Minggu)
                  </span>
                  <div className="grid grid-cols-7 gap-1">
                    {DAY_CHIPS.map((day) => {
                      const isSelected = selectedDay === day.full;
                      return (
                        <button
                          key={day.full}
                          type="button"
                          onClick={() => setSelectedDay(day.full)}
                          className={`min-h-[40px] rounded-xl text-[11px] font-extrabold border-2 transition-all ${
                            isSelected
                              ? 'bg-[#C41E3A] border-[#0F172A] text-white shadow-[0_2px_0_0_#0F172A]'
                              : isDarkMode
                              ? 'bg-[#232934] border-[#323A48] text-[#CBD5E1]'
                              : 'bg-[#F8FAFC] border-[#CBD5E1] text-[#334155]'
                          }`}
                        >
                          {day.short}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Jam Perkuliahan: Mobile-Style Start & End Time Picker + Free Typing (Zero dark: bug!) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-extrabold flex items-center gap-1">
                      <Clock
                        className="w-3.5 h-3.5 text-[#C41E3A]"
                        aria-hidden="true"
                      />
                      <span>Jam Perkuliahan</span>
                    </span>

                    <div
                      className={`flex items-center gap-1 p-1 rounded-xl border-2 ${
                        isDarkMode
                          ? 'bg-[#232934] border-[#323A48]'
                          : 'bg-[#F1F5F9] border-[#0F172A]'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setTimeMode('picker')}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition-colors ${
                          timeMode === 'picker'
                            ? 'bg-[#C41E3A] text-white border border-[#0F172A]'
                            : isDarkMode
                            ? 'text-[#CBD5E1]'
                            : 'text-[#0F172A]'
                        }`}
                      >
                        Pilih Jam HP
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setManualTimeText(`${startTime} - ${endTime} WIB`);
                          setTimeMode('manual');
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition-colors ${
                          timeMode === 'manual'
                            ? 'bg-[#C41E3A] text-white border border-[#0F172A]'
                            : isDarkMode
                            ? 'text-[#CBD5E1]'
                            : 'text-[#0F172A]'
                        }`}
                      >
                        Ketik Bebas
                      </button>
                    </div>
                  </div>

                  {timeMode === 'picker' ? (
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2.5">
                        <div
                          className={`p-2.5 rounded-2xl border-2 ${
                            isDarkMode
                              ? 'bg-[#232934] border-[#323A48]'
                              : 'bg-[#F8FAFC] border-[#CBD5E1]'
                          }`}
                        >
                          <label
                            htmlFor="course-start-time"
                            className="block text-[10px] font-bold text-[#64748B] mb-1"
                          >
                            Jam Mulai
                          </label>
                          <input
                            id="course-start-time"
                            type="time"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            className="w-full bg-transparent text-sm font-black outline-none"
                          />
                        </div>

                        <div
                          className={`p-2.5 rounded-2xl border-2 ${
                            isDarkMode
                              ? 'bg-[#232934] border-[#323A48]'
                              : 'bg-[#F8FAFC] border-[#CBD5E1]'
                          }`}
                        >
                          <label
                            htmlFor="course-end-time"
                            className="block text-[10px] font-bold text-[#64748B] mb-1"
                          >
                            Jam Selesai
                          </label>
                          <input
                            id="course-end-time"
                            type="time"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            className="w-full bg-transparent text-sm font-black outline-none"
                          />
                        </div>
                      </div>

                      {/* Quick Time Presets */}
                      <div className="grid grid-cols-4 gap-1.5">
                        {QUICK_TIME_PRESETS.map((preset) => {
                          const active =
                            startTime === preset.start &&
                            endTime === preset.end;
                          return (
                            <button
                              key={preset.label}
                              type="button"
                              onClick={() => {
                                setStartTime(preset.start);
                                setEndTime(preset.end);
                              }}
                              className={`min-h-[34px] px-1.5 rounded-xl text-[10px] font-extrabold border-2 transition-all ${
                                active
                                  ? 'bg-[#C41E3A] border-[#0F172A] text-white'
                                  : isDarkMode
                                  ? 'bg-[#232934] border-[#323A48] text-[#CBD5E1]'
                                  : 'bg-white border-[#CBD5E1] text-[#0F172A]'
                              }`}
                            >
                              {preset.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={manualTimeText}
                      onChange={(e) => setManualTimeText(e.target.value)}
                      placeholder="Contoh: 08:00 - 10:30 WIB atau Malam 19:00"
                      className={`w-full min-h-[44px] px-4 py-2.5 rounded-2xl border-2 text-sm font-semibold outline-none ${
                        isDarkMode
                          ? 'bg-[#232934] border-[#323A48] text-white focus:border-[#C41E3A]'
                          : 'bg-[#F8FAFC] border-[#CBD5E1] text-[#0F172A] focus:border-[#C41E3A] focus:bg-white'
                      }`}
                    />
                  )}
                </div>

                {/* Bento Color Theme Selector (5 Curated Themes + Custom RGB Spectrum Picker) */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-extrabold">
                      Pilih Tema Warna Kartu Bento
                    </span>
                    <span className="text-[10px] font-bold text-[#64748B]">
                      5 Preset + RGB Bebas
                    </span>
                  </div>

                  <div className="grid grid-cols-6 gap-1.5">
                    {BENTO_COLOR_THEMES.map((theme) => {
                      const isPicked = colorThemeId === theme.id;
                      return (
                        <button
                          key={theme.id}
                          type="button"
                          onClick={() => setColorThemeId(theme.id)}
                          style={{
                            backgroundColor: theme.pastelBg,
                            borderColor: isPicked
                              ? '#0F172A'
                              : theme.pastelBorder,
                          }}
                          className="min-h-[54px] rounded-2xl border-2 flex flex-col items-center justify-center gap-1 p-1 transition-transform active:scale-95"
                          title={theme.name}
                        >
                          <span
                            style={{ backgroundColor: theme.iconBg }}
                            className="w-5 h-5 rounded-full flex items-center justify-center text-white border border-[#0F172A]"
                          >
                            {isPicked && (
                              <Check className="w-3 h-3 stroke-[3]" />
                            )}
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

                    {/* 6th Tile: Custom RGB / Hex Color Picker */}
                    <button
                      type="button"
                      onClick={() => {
                        setColorThemeId('custom');
                        colorInputRef.current?.click();
                      }}
                      style={{
                        backgroundColor: customPreviewTheme.pastelBg,
                        borderColor:
                          colorThemeId === 'custom'
                            ? '#0F172A'
                            : customPreviewTheme.pastelBorder,
                      }}
                      className="min-h-[54px] rounded-2xl border-2 flex flex-col items-center justify-center gap-1 p-1 transition-transform active:scale-95 relative"
                      title="Pilih Warna Kustom RGB"
                    >
                      <input
                        ref={colorInputRef}
                        type="color"
                        value={customHexColor}
                        onChange={(e) => {
                          setCustomHexColor(e.target.value);
                          setColorThemeId('custom');
                        }}
                        className="sr-only"
                        aria-label="Pilih warna kustom RGB"
                      />
                      <span
                        style={{
                          backgroundColor: customHexColor,
                          color: customCircleText,
                        }}
                        className="w-5 h-5 rounded-full flex items-center justify-center border border-[#0F172A]"
                      >
                        {colorThemeId === 'custom' ? (
                          <Check className="w-3 h-3 stroke-[3]" />
                        ) : (
                          <Palette className="w-3 h-3" />
                        )}
                      </span>
                      <span
                        style={{ color: customPreviewTheme.accentColor }}
                        className="text-[10px] font-extrabold truncate max-w-full"
                      >
                        RGB
                      </span>
                    </button>
                  </div>

                  {colorThemeId === 'custom' && (
                    <div
                      style={{
                        backgroundColor: customPreviewTheme.pastelBg,
                        borderColor: '#0F172A',
                      }}
                      className="mt-2 p-2.5 rounded-2xl border-2 flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          style={{ backgroundColor: customHexColor }}
                          className="w-6 h-6 rounded-lg border-2 border-[#0F172A]"
                        />
                        <span className="text-xs font-extrabold text-[#0F172A]">
                          Warna Kustom ({customHexColor.toUpperCase()})
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => colorInputRef.current?.click()}
                        className="px-2.5 py-1 rounded-xl bg-white border-2 border-[#0F172A] text-[11px] font-extrabold text-[#0F172A] shadow-[0_2px_0_0_#0F172A]"
                      >
                        Ubah RGB
                      </button>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full min-h-[48px] rounded-2xl bg-[#C41E3A] hover:bg-[#A3162E] text-white text-sm font-black border-2 border-[#0F172A] shadow-[0_3px_0_0_#0F172A] active:translate-y-0.5 transition-all"
                >
                  {editingCourse
                    ? 'Simpan Perubahan Mata Kuliah'
                    : 'Simpan Mata Kuliah Baru'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
