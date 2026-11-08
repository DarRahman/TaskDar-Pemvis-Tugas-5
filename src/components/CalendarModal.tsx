import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft,
  ChevronRight,
  X,
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { AcademicTask } from '../types/task';

export interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDateLabel: string;
  onSelectDate: (dateLabel: string) => void;
  tasks: AcademicTask[];
  mode?: 'view' | 'picker';
  isDarkMode?: boolean;
}

const INDONESIAN_MONTHS = [
  { full: 'Januari', short: 'Jan', days: 31 },
  { full: 'Februari', short: 'Feb', days: 28 },
  { full: 'Maret', short: 'Mar', days: 31 },
  { full: 'April', short: 'Apr', days: 30 },
  { full: 'Mei', short: 'Mei', days: 31 },
  { full: 'Juni', short: 'Jun', days: 30 },
  { full: 'Juli', short: 'Jul', days: 31 },
  { full: 'Agustus', short: 'Agu', days: 31 },
  { full: 'September', short: 'Sep', days: 30 },
  { full: 'Oktober', short: 'Okt', days: 31 },
  { full: 'November', short: 'Nov', days: 30 },
  { full: 'Desember', short: 'Des', days: 31 },
] as const;

const WEEKDAY_HEADERS = [
  'Sen',
  'Sel',
  'Rab',
  'Kam',
  'Jum',
  'Sab',
  'Min',
] as const;

function parseDateLabel(label: string): {
  day: number;
  monthIndex: number;
  year: number;
} {
  const parts = label.trim().split(/\s+/);
  if (parts.length === 3) {
    const dayNum = parseInt(parts[0], 10);
    const monthStr = parts[1].toLowerCase();
    const yearNum = parseInt(parts[2], 10);
    const foundMonth = INDONESIAN_MONTHS.findIndex(
      (m) => m.short.toLowerCase() === monthStr.slice(0, 3)
    );
    if (!Number.isNaN(dayNum) && foundMonth >= 0 && !Number.isNaN(yearNum)) {
      return { day: dayNum, monthIndex: foundMonth, year: yearNum };
    }
  }
  const now = new Date();
  return {
    day: now.getDate(),
    monthIndex: now.getMonth(),
    year: now.getFullYear(),
  };
}

function formatIndonesianDate(
  day: number,
  monthIndex: number,
  year: number
): string {
  const dayPadded = day < 10 ? `0${day}` : `${day}`;
  const monthShort = INDONESIAN_MONTHS[monthIndex]?.short ?? 'Nov';
  return `${dayPadded} ${monthShort} ${year}`;
}

/*
 * Full interactive Month and Year Calendar Modal with 31-day grid,
 * month navigation, task deadline indicator dots, and smooth spring animation.
 */
export const CalendarModal: React.FC<CalendarModalProps> = ({
  isOpen,
  onClose,
  selectedDateLabel,
  onSelectDate,
  tasks,
  mode = 'view',
  isDarkMode = false,
}) => {
  const initialParsed = parseDateLabel(selectedDateLabel);
  const [viewMonth, setViewMonth] = useState<number>(initialParsed.monthIndex);
  const [viewYear, setViewYear] = useState<number>(initialParsed.year);

  useEffect(() => {
    if (isOpen) {
      const parsed = parseDateLabel(selectedDateLabel);
      setViewMonth(parsed.monthIndex);
      setViewYear(parsed.year);
    }
  }, [isOpen, selectedDateLabel]);

  const calendarCells = useMemo(() => {
    const firstDayJs = new Date(viewYear, viewMonth, 1).getDay();
    const mondayBasedOffset = (firstDayJs + 6) % 7;
    const isLeapYear =
      (viewYear % 4 === 0 && viewYear % 100 !== 0) || viewYear % 400 === 0;
    const daysInMonth =
      viewMonth === 1 && isLeapYear ? 29 : INDONESIAN_MONTHS[viewMonth].days;

    const cells: Array<{ day: number | null; dateLabel: string }> = [];
    for (let i = 0; i < mondayBasedOffset; i += 1) {
      cells.push({ day: null, dateLabel: `empty-${i}` });
    }
    for (let d = 1; d <= daysInMonth; d += 1) {
      cells.push({
        day: d,
        dateLabel: formatIndonesianDate(d, viewMonth, viewYear),
      });
    }
    return cells;
  }, [viewMonth, viewYear]);

  const tasksOnSelectedDate = useMemo(
    () => tasks.filter((t) => t.deadline === selectedDateLabel),
    [tasks, selectedDateLabel]
  );

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="calendar-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/55 backdrop-blur-[2px] p-0 sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="calendar-modal-title"
        >
          <motion.div
            key="calendar-modal-body"
            initial={{ scale: 0.9, opacity: 0, y: 24 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 24 }}
            transition={{ type: 'spring', stiffness: 300, damping: 26 }}
            onClick={(e) => e.stopPropagation()}
            className={`w-full max-w-[430px] rounded-t-[32px] sm:rounded-[32px] border-2 shadow-2xl overflow-hidden ${
              isDarkMode
                ? 'bg-[#161A22] border-[#262C3A] text-white'
                : 'bg-white border-[#0F172A] text-[#0F172A]'
            }`}
          >
            {/* Dominant Red Top Header */}
            <div className="px-5 pt-4 pb-3.5 bg-[#C41E3A] text-white border-b-2 border-[#0F172A] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-white text-[#C41E3A] border-2 border-[#0F172A] flex items-center justify-center shadow-[0_2px_0_0_#0F172A]">
                  <CalendarIcon className="w-4 h-4" aria-hidden="true" />
                </div>
                <div>
                  <h2
                    id="calendar-modal-title"
                    className="text-sm font-black tracking-tight"
                  >
                    {mode === 'picker'
                      ? 'Pilih Tanggal Tenggat'
                      : 'Kalender Akademik TaskDar'}
                  </h2>
                  <p className="text-[11px] font-bold text-white/90">
                    Terpilih: {selectedDateLabel}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Tutup kalender"
                className="min-w-[40px] min-h-[40px] rounded-2xl bg-white text-[#0F172A] border-2 border-[#0F172A] flex items-center justify-center shadow-[0_2px_0_0_#0F172A] active:translate-y-0.5 transition-all"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            {/* Month & Year Navigation Bar */}
            <div className="px-5 pt-3 pb-2 flex items-center justify-between">
              <button
                type="button"
                onClick={handlePrevMonth}
                aria-label="Bulan sebelumnya"
                className={`min-w-[42px] min-h-[42px] rounded-2xl border-2 flex items-center justify-center transition-colors ${
                  isDarkMode
                    ? 'bg-[#232934] border-[#323A48] text-white'
                    : 'bg-[#F8FAFC] border-[#0F172A] text-[#0F172A] hover:bg-[#F1F5F9]'
                }`}
              >
                <ChevronLeft className="w-4 h-4" aria-hidden="true" />
              </button>

              <div className="text-center">
                <span className="text-base font-black tracking-tight">
                  {INDONESIAN_MONTHS[viewMonth].full} {viewYear}
                </span>
              </div>

              <button
                type="button"
                onClick={handleNextMonth}
                aria-label="Bulan berikutnya"
                className={`min-w-[42px] min-h-[42px] rounded-2xl border-2 flex items-center justify-center transition-colors ${
                  isDarkMode
                    ? 'bg-[#232934] border-[#323A48] text-white'
                    : 'bg-[#F8FAFC] border-[#0F172A] text-[#0F172A] hover:bg-[#F1F5F9]'
                }`}
              >
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            {/* 7-Column Weekday Headers */}
            <div className="px-4 grid grid-cols-7 gap-1 text-center">
              {WEEKDAY_HEADERS.map((dayName) => (
                <div
                  key={dayName}
                  className={`py-1.5 text-[11px] font-extrabold ${
                    dayName === 'Min'
                      ? 'text-[#C41E3A]'
                      : isDarkMode
                      ? 'text-[#94A3B8]'
                      : 'text-[#64748B]'
                  }`}
                >
                  {dayName}
                </div>
              ))}
            </div>

            {/* 31-Day Interactive Grid */}
            <div className="px-4 pb-3 grid grid-cols-7 gap-1">
              {calendarCells.map((cell) => {
                if (cell.day === null) {
                  return <div key={cell.dateLabel} className="min-h-[42px]" />;
                }

                const isSelected = cell.dateLabel === selectedDateLabel;
                const tasksOnDay = tasks.filter(
                  (t) => t.deadline === cell.dateLabel
                );
                const hasPending = tasksOnDay.some(
                  (t) => t.status === 'Belum Dikerjakan'
                );
                const hasAnyTask = tasksOnDay.length > 0;

                return (
                  <button
                    key={cell.dateLabel}
                    type="button"
                    onClick={() => {
                      onSelectDate(cell.dateLabel);
                      if (mode === 'picker') {
                        onClose();
                      }
                    }}
                    aria-label={`Tanggal ${cell.dateLabel}${
                      hasAnyTask ? `, ${tasksOnDay.length} tugas` : ''
                    }`}
                    aria-pressed={isSelected}
                    className={`min-h-[42px] rounded-2xl flex flex-col items-center justify-center relative transition-all text-xs font-black border ${
                      isSelected
                        ? 'bg-[#C41E3A] text-white border-[#0F172A] shadow-[0_2px_0_0_#0F172A] scale-[1.03]'
                        : isDarkMode
                        ? 'border-transparent hover:bg-[#232934] text-[#E2E8F0]'
                        : 'border-transparent hover:bg-[#FFF1F2] text-[#0F172A]'
                    }`}
                  >
                    <span>{cell.day}</span>
                    {hasAnyTask && (
                      <span
                        className={`mt-0.5 w-1.5 h-1.5 rounded-full ${
                          isSelected
                            ? 'bg-white'
                            : hasPending
                            ? 'bg-[#C41E3A]'
                            : 'bg-[#059669]'
                        }`}
                        aria-hidden="true"
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Selected Date Tasks Preview / Action Footer */}
            <div
              className={`px-5 py-4 border-t-2 ${
                isDarkMode
                  ? 'bg-[#1F242D] border-[#262C3A]'
                  : 'bg-[#F8FAFC] border-[#0F172A]'
              }`}
            >
              {mode === 'view' && (
                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs font-extrabold mb-2">
                    <span>Jadwal Tenggat ({selectedDateLabel})</span>
                    <span className="px-2 py-0.5 rounded-lg bg-[#C41E3A] text-white border border-[#0F172A] text-[10px] font-black">
                      {tasksOnSelectedDate.length} Tugas
                    </span>
                  </div>

                  {tasksOnSelectedDate.length > 0 ? (
                    <div className="space-y-1.5 max-h-28 overflow-y-auto no-scrollbar">
                      {tasksOnSelectedDate.map((t) => (
                        <div
                          key={t.id}
                          className={`px-3 py-2 rounded-xl border-2 flex items-center justify-between gap-2 text-xs ${
                            isDarkMode
                              ? 'bg-[#161A22] border-[#323A48]'
                              : 'bg-white border-[#0F172A]'
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <p className="font-extrabold truncate">{t.title}</p>
                            <p
                              className={`text-[11px] font-semibold truncate ${
                                isDarkMode ? 'text-[#94A3B8]' : 'text-[#64748B]'
                              }`}
                            >
                              {t.course}
                            </p>
                          </div>
                          {t.status === 'Selesai' ? (
                            <CheckCircle2
                              className="w-4 h-4 text-[#059669] shrink-0"
                              aria-hidden="true"
                            />
                          ) : (
                            <Clock
                              className="w-4 h-4 text-[#C41E3A] shrink-0"
                              aria-hidden="true"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p
                      className={`text-xs font-semibold ${
                        isDarkMode ? 'text-[#94A3B8]' : 'text-[#64748B]'
                      }`}
                    >
                      Tidak ada tenggat tugas pada tanggal ini.
                    </p>
                  )}
                </div>
              )}

              <button
                type="button"
                onClick={onClose}
                className="w-full min-h-[46px] rounded-2xl bg-[#C41E3A] hover:bg-[#A3162E] text-white text-xs font-black border-2 border-[#0F172A] shadow-[0_3px_0_0_#0F172A] active:translate-y-0.5 transition-all"
              >
                {mode === 'picker'
                  ? `Gunakan Tanggal ${selectedDateLabel}`
                  : 'Selesai'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
