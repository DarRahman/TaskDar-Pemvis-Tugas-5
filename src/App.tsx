import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
  useReducer,
} from 'react';
import {
  Plus,
  Search,
  X,
  RotateCcw,
  CheckSquare,
  BookOpen,
  PieChart,
  User,
  Flame,
  Clock,
  Terminal,
  Award,
  Bell,
  Moon,
  Sun,
  Calendar,
  MapPin,
  UserCheck,
  ChevronRight,
  CheckCircle2,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import {
  INITIAL_TASKS,
  INITIAL_COURSES,
  BENTO_COLOR_THEMES,
  STUDENT_METADATA,
  PODIUM_TROPHY_SHELF,
  taskReducer,
} from './data/initialTasks';
import {
  TaskFilterTab,
  MainBottomTab,
  NewTaskPayload,
  NewCoursePayload,
  TaskMetrics,
  CourseDetail,
  PodiumTrophyItem,
} from './types/task';
import { TaskCard, renderSubjectIconByKey } from './components/TaskCard';
import { AddTaskSheet } from './components/AddTaskSheet';
import { AddCourseSheet } from './components/AddCourseSheet';
import { CalendarModal } from './components/CalendarModal';
import { WelcomeSplashModal } from './components/WelcomeSplashModal';
import {
  StudentMascotAvatar,
  CelebrationMascotIllustration,
} from './components/StudentMascot';

const FILTER_TABS: readonly TaskFilterTab[] = [
  'Semua',
  'Belum Dikerjakan',
  'Selesai',
];

interface WeeklyDayItem {
  dayShort: string;
  dayFull: string;
  dateNumber: string;
  fullDateLabel: string;
}

const WEEKLY_CALENDAR_DAYS: readonly WeeklyDayItem[] = [
  {
    dayShort: 'Sen',
    dayFull: 'Senin',
    dateNumber: '03',
    fullDateLabel: '03 Nov 2026',
  },
  {
    dayShort: 'Sel',
    dayFull: 'Selasa',
    dateNumber: '04',
    fullDateLabel: '04 Nov 2026',
  },
  {
    dayShort: 'Rab',
    dayFull: 'Rabu',
    dateNumber: '05',
    fullDateLabel: '05 Nov 2026',
  },
  {
    dayShort: 'Kam',
    dayFull: 'Kamis',
    dateNumber: '06',
    fullDateLabel: '06 Nov 2026',
  },
  {
    dayShort: 'Jum',
    dayFull: 'Jumat',
    dateNumber: '07',
    fullDateLabel: '07 Nov 2026',
  },
  {
    dayShort: 'Sab',
    dayFull: 'Sabtu',
    dateNumber: '08',
    fullDateLabel: '08 Nov 2026',
  },
  {
    dayShort: 'Min',
    dayFull: 'Minggu',
    dateNumber: '09',
    fullDateLabel: '09 Nov 2026',
  },
];

function renderPodiumVectorIcon(
  iconKey: PodiumTrophyItem['iconKey'],
  color: string
) {
  switch (iconKey) {
    case 'clock':
      return <Clock className="w-4 h-4" style={{ color }} aria-hidden="true" />;
    case 'flame':
      return <Flame className="w-4 h-4" style={{ color }} aria-hidden="true" />;
    case 'terminal':
      return (
        <Terminal className="w-4 h-4" style={{ color }} aria-hidden="true" />
      );
  }
}

export default function App() {
  /*
   * Hook 7 (useReducer): Central state engine managing task list mutations
   * across ADD_TASK, DELETE_TASK, TOGGLE_STATUS, and RESET_TASKS.
   */
  const [tasks, dispatch] = useReducer(taskReducer, INITIAL_TASKS);

  /*
   * Hook 2 (useState): Manages welcome splash modal, courses directory,
   * active bottom navigation tab, selected date, calendar modal state,
   * search query, status filter tab, student settings toggles, and sheets.
   */
  const [isSplashOpen, setIsSplashOpen] = useState<boolean>(true);
  const [courses, setCourses] = useState<CourseDetail[]>(INITIAL_COURSES);
  const [bottomTab, setBottomTab] = useState<MainBottomTab>('tugas');
  const [selectedDayDate, setSelectedDayDate] = useState<string>('08 Nov 2026');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFilterTab, setActiveFilterTab] =
    useState<TaskFilterTab>('Semua');
  const [selectedCourseFilter, setSelectedCourseFilter] =
    useState<string>('Semua');
  const [preselectedCourseForAdd, setPreselectedCourseForAdd] =
    useState<string>(INITIAL_COURSES[0].name);

  const [isAddSheetOpen, setIsAddSheetOpen] = useState<boolean>(false);
  const [isAddCourseOpen, setIsAddCourseOpen] = useState<boolean>(false);
  const [isCalendarModalOpen, setIsCalendarModalOpen] =
    useState<boolean>(false);
  const [calendarModalMode, setCalendarModalMode] = useState<'view' | 'picker'>(
    'view'
  );
  const [calendarPickerCallback, setCalendarPickerCallback] = useState<
    ((pickedDate: string) => void) | null
  >(null);

  const [reminderEnabled, setReminderEnabled] = useState<boolean>(true);
  const [googleCalendarSync, setGoogleCalendarSync] = useState<boolean>(true);
  const [siakadAutoUpdate, setSiakadAutoUpdate] = useState<boolean>(true);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  /*
   * Hook 6 (useRef): References the task title input element inside the
   * creation modal to programmatically focus the cursor upon opening or submit.
   */
  const titleInputRef = useRef<HTMLInputElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  /*
   * Hook 3 (useEffect): Observes searchQuery transitions and outputs
   * debugging traces to the console terminal as mandated by FR-05.
   */
  useEffect(() => {
    const normalizedQuery = searchQuery.trim();
    console.log(
      '[Pemrograman Visual I - TI361] Kata kunci pencarian aktif:',
      normalizedQuery === '' ? '(kosong)' : normalizedQuery
    );
  }, [searchQuery]);

  /*
   * Hook 4 (useMemo): Computes derived task counts (total, pending, completed,
   * and completion percentage) exclusively when the tasks array mutates (FR-06).
   */
  const taskMetrics: TaskMetrics = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((task) => task.status === 'Selesai').length;
    const pending = total - completed;
    const completionRate =
      total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, pending, completed, completionRate };
  }, [tasks]);

  const totalCredits = useMemo(
    () => courses.reduce((sum, item) => sum + item.credits, 0),
    [courses]
  );

  const filteredTasks = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return tasks.filter((task) => {
      const matchesStatus =
        activeFilterTab === 'Semua' ? true : task.status === activeFilterTab;
      const matchesCourse =
        selectedCourseFilter === 'Semua'
          ? true
          : task.course.toLowerCase() === selectedCourseFilter.toLowerCase();
      const matchesKeyword =
        query === '' ||
        task.title.toLowerCase().includes(query) ||
        task.course.toLowerCase().includes(query);

      return matchesStatus && matchesCourse && matchesKeyword;
    });
  }, [tasks, activeFilterTab, selectedCourseFilter, searchQuery]);

  const showToastMessage = useCallback((message: string) => {
    setFeedbackToast(message);
    window.setTimeout(() => {
      setFeedbackToast((prev) => (prev === message ? null : prev));
    }, 2600);
  }, []);

  /*
   * Hook 5 (useCallback): Preserves handler reference stability across renders
   * when delegating callbacks to child TaskCard components via Props.
   */
  const handleToggleStatus = useCallback((taskId: string) => {
    dispatch({ type: 'TOGGLE_STATUS', payload: taskId });
  }, []);

  const handleDeleteTask = useCallback(
    (taskId: string) => {
      dispatch({ type: 'DELETE_TASK', payload: taskId });
      showToastMessage('Tugas berhasil dihapus.');
    },
    [showToastMessage]
  );

  const handleAddTask = useCallback(
    (payload: NewTaskPayload) => {
      dispatch({ type: 'ADD_TASK', payload });
      showToastMessage('Tugas baru berhasil ditambahkan.');
    },
    [showToastMessage]
  );

  const handleAddCourse = useCallback(
    (payload: NewCoursePayload) => {
      const chosenTheme =
        BENTO_COLOR_THEMES.find((t) => t.id === payload.colorThemeId) ||
        BENTO_COLOR_THEMES[0];
      const nextCodeNumber = 361 + courses.length;
      const newCourse: CourseDetail = {
        id: `course-${Date.now()}`,
        code: `TI${nextCodeNumber}`,
        name: payload.name,
        lecturer: payload.lecturer,
        credits: payload.credits,
        schedule: payload.schedule,
        room: payload.room,
        iconKey: payload.iconKey,
        pastelBg: chosenTheme.pastelBg,
        pastelBorder: chosenTheme.pastelBorder,
        accentColor: chosenTheme.accentColor,
        iconBg: chosenTheme.iconBg,
      };
      setCourses((prev) => [...prev, newCourse]);
      showToastMessage(`Mata kuliah ${payload.name} berhasil ditambahkan.`);
    },
    [courses.length, showToastMessage]
  );

  const handleResetTasks = useCallback(() => {
    dispatch({ type: 'RESET_TASKS' });
    setCourses(INITIAL_COURSES);
    setSearchQuery('');
    setActiveFilterTab('Semua');
    setSelectedCourseFilter('Semua');
    setSelectedDayDate('08 Nov 2026');
    showToastMessage('Data berhasil diatur ulang ke kondisi awal Semester 5.');
  }, [showToastMessage]);

  const handleOpenAddSheet = useCallback((courseName?: string) => {
    if (courseName) {
      setPreselectedCourseForAdd(courseName);
    }
    setIsAddSheetOpen(true);
    window.setTimeout(() => {
      titleInputRef.current?.focus();
    }, 60);
  }, []);

  const handleOpenCalendarView = useCallback(() => {
    setCalendarModalMode('view');
    setCalendarPickerCallback(null);
    setIsCalendarModalOpen(true);
  }, []);

  const handleRequestCalendarPicker = useCallback(
    (currentDate: string, onPick: (pickedDate: string) => void) => {
      setSelectedDayDate(currentDate);
      setCalendarModalMode('picker');
      setCalendarPickerCallback(() => onPick);
      setIsCalendarModalOpen(true);
    },
    []
  );

  const radialRadius = 44;
  const radialCircumference = 2 * Math.PI * radialRadius;
  const radialStrokeOffset =
    radialCircumference -
    (taskMetrics.completionRate / 100) * radialCircumference;

  const allTasksCompleted =
    taskMetrics.total > 0 && taskMetrics.pending === 0;

  return (
    <div
      className={`min-h-screen flex items-center justify-center sm:py-6 sm:px-4 transition-colors duration-200 ${
        isDarkMode ? 'bg-[#0B0F17]' : 'bg-[#E2E8F0]'
      }`}
    >
      {/* Pure Mobile Application Frame */}
      <main
        aria-label="Aplikasi Mobile Tugas Kuliah STIKOM Poltek Cirebon"
        className={`w-full max-w-[430px] min-h-screen sm:min-h-[852px] sm:max-h-[900px] sm:rounded-[44px] sm:border-[10px] sm:shadow-2xl flex flex-col relative overflow-hidden transition-colors duration-200 ${
          isDarkMode
            ? 'bg-[#111622] sm:border-[#1E293B] text-[#F8FAFC]'
            : 'bg-[#F8FAFC] sm:border-[#0F172A] text-[#0F172A]'
        }`}
      >
        {/* Top Mobile Status Pill (Visible on framed viewports) */}
        <div className="hidden sm:flex items-center justify-between px-7 pt-3 pb-1 text-[11px] font-bold tracking-tight select-none opacity-80">
          <span className="font-mono tabular-nums">09:41</span>
          <div className="w-24 h-5 rounded-full bg-[#0F172A]" />
          <span className="font-mono tabular-nums">5G · 100%</span>
        </div>

        {/* Toast Feedback Notification */}
        {feedbackToast && (
          <div
            role="status"
            className="absolute top-12 left-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl bg-[#0F172A] text-white text-xs font-semibold shadow-lg animate-in fade-in slide-in-from-top-2 duration-150"
          >
            <CheckCircle2
              className="w-4 h-4 text-[#34D399] shrink-0"
              aria-hidden="true"
            />
            <span className="truncate">{feedbackToast}</span>
          </div>
        )}

        {/* Tab 1: Tugas (Daily Task Manager) */}
        {bottomTab === 'tugas' && (
          <section
            aria-label="Daftar Tugas Harian"
            className="flex-1 flex flex-col min-h-0 overflow-hidden"
          >
            {/* Prominent Student Hero Card (STIKOM Crimson Red & White Identity) */}
            <div className="px-4 pt-2.5 pb-2">
              <div className="rounded-[28px] bg-gradient-to-br from-[#C41E3A] via-[#DC2626] to-[#9F1239] text-white p-4 shadow-md relative overflow-hidden">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <StudentMascotAvatar size="md" />
                    <div className="min-w-0">
                      <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/20 text-[10px] font-bold tracking-wide text-white mb-1">
                        <Sparkles className="w-3 h-3" aria-hidden="true" />
                        <span>STIKOM Poltek Cirebon · TI-1</span>
                      </div>
                      <h1 className="text-[17px] font-extrabold tracking-tight leading-snug truncate">
                        Semangat Belajar, {STUDENT_METADATA.shortName}!
                      </h1>
                      <p className="text-xs text-[#FFE4E6] font-medium truncate mt-0.5">
                        {taskMetrics.pending > 0
                          ? `${taskMetrics.pending} tugas menunggu diselesaikan`
                          : 'Semua tugas minggu ini sudah tuntas!'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bottom Row inside Hero Card: Motivational Progress Pill + 6-Day Streak Pill */}
                <div className="mt-3.5 pt-3 border-t border-white/15 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setBottomTab('progres')}
                    className="min-h-[36px] px-3 py-1 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold flex items-center gap-2 transition-colors"
                  >
                    <span className="font-mono tabular-nums bg-white text-[#C41E3A] px-1.5 py-0.5 rounded-md text-[11px] font-extrabold">
                      {taskMetrics.completionRate}%
                    </span>
                    <span>Target Semester 5</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBottomTab('progres')}
                    aria-label="Lihat rentetan belajar 6 hari aktif"
                    className="min-h-[36px] px-3 py-1 rounded-xl bg-white text-[#C41E3A] text-xs font-extrabold flex items-center gap-1.5 shadow-xs transition-transform active:scale-95"
                  >
                    <Flame
                      className="w-3.5 h-3.5 fill-[#C41E3A] text-[#C41E3A]"
                      aria-hidden="true"
                    />
                    <span className="font-mono tabular-nums">
                      {STUDENT_METADATA.streakDays} Hari Aktif
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* 7-Day Weekly Calendar Strip + Full Month Calendar Modal Button */}
            <div className="px-4 pb-2">
              <div className="flex items-center justify-between mb-1.5 px-1">
                <span
                  className={`text-xs font-bold ${
                    isDarkMode ? 'text-[#CBD5E1]' : 'text-[#334155]'
                  }`}
                >
                  Jadwal Minggu Ini ({selectedDayDate})
                </span>
                <button
                  type="button"
                  onClick={handleOpenCalendarView}
                  aria-label="Buka kalender bulan penuh"
                  className="min-h-[36px] px-2.5 py-1 rounded-xl bg-[#FFE4E6] hover:bg-[#FECDD3] text-[#C41E3A] text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Kalender Bulan</span>
                </button>
              </div>

              <div
                aria-label="Kalender Mingguan"
                className="grid grid-cols-7 gap-1.5"
              >
                {WEEKLY_CALENDAR_DAYS.map((dayItem) => {
                  const isSelected = selectedDayDate === dayItem.fullDateLabel;
                  const hasDeadlineOnDay = tasks.some(
                    (t) => t.deadline === dayItem.fullDateLabel
                  );

                  return (
                    <button
                      key={dayItem.fullDateLabel}
                      type="button"
                      onClick={() => setSelectedDayDate(dayItem.fullDateLabel)}
                      aria-label={`${dayItem.dayFull}, ${dayItem.fullDateLabel}`}
                      aria-pressed={isSelected}
                      className={`min-h-[52px] min-w-[44px] py-1.5 rounded-2xl flex flex-col items-center justify-center transition-all border ${
                        isSelected
                          ? 'bg-[#C41E3A] border-[#C41E3A] text-white shadow-xs'
                          : isDarkMode
                          ? 'bg-[#1F242D] border-[#2E3440] text-[#CBD5E1] hover:border-[#C41E3A]'
                          : 'bg-white border-[#E2E8F0] text-[#0F172A] hover:border-[#FECDD3]'
                      }`}
                    >
                      <span
                        className={`text-[10px] font-bold leading-none ${
                          isSelected
                            ? 'text-white/90'
                            : isDarkMode
                            ? 'text-[#94A3B8]'
                            : 'text-[#64748B]'
                        }`}
                      >
                        {dayItem.dayShort}
                      </span>
                      <span className="mt-1 text-xs font-extrabold font-mono tabular-nums leading-none">
                        {dayItem.dateNumber}
                      </span>
                      <span
                        className={`mt-1 w-1.5 h-1.5 rounded-full ${
                          hasDeadlineOnDay
                            ? isSelected
                              ? 'bg-white'
                              : 'bg-[#C41E3A]'
                            : 'bg-transparent'
                        }`}
                        aria-hidden="true"
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Real-Time Search Bar (FR-05 + useEffect observer) */}
            <div className="px-4 pb-2">
              <div
                className={`relative flex items-center rounded-2xl border transition-colors ${
                  isDarkMode
                    ? 'bg-[#1F242D] border-[#2E3440] focus-within:border-[#C41E3A]'
                    : 'bg-white border-[#E2E8F0] focus-within:border-[#C41E3A] shadow-2xs'
                }`}
              >
                <Search
                  className={`w-4 h-4 ml-3.5 shrink-0 pointer-events-none ${
                    isDarkMode ? 'text-[#94A3B8]' : 'text-[#64748B]'
                  }`}
                  aria-hidden="true"
                />
                <input
                  ref={searchInputRef}
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari judul tugas atau mata kuliah..."
                  aria-label="Cari tugas berdasarkan judul atau mata kuliah"
                  className="w-full min-h-[44px] pl-2.5 pr-11 py-2 bg-transparent text-sm outline-none placeholder:text-[#94A3B8]"
                />
                {searchQuery.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      searchInputRef.current?.focus();
                    }}
                    aria-label="Bersihkan kata kunci pencarian"
                    className="absolute right-1 min-w-[44px] min-h-[44px] flex items-center justify-center text-[#64748B] hover:text-[#C41E3A]"
                  >
                    <X className="w-4 h-4" aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>

            {/* Clean Status Filter Tabs: Semua, Belum Dikerjakan, Selesai */}
            <nav
              aria-label="Filter Status Tugas"
              className={`px-4 border-b grid grid-cols-3 ${
                isDarkMode ? 'border-[#262C3A]' : 'border-[#E2E8F0]'
              }`}
            >
              {FILTER_TABS.map((tab) => {
                const isActive = activeFilterTab === tab;
                const count =
                  tab === 'Semua'
                    ? taskMetrics.total
                    : tab === 'Belum Dikerjakan'
                    ? taskMetrics.pending
                    : taskMetrics.completed;

                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveFilterTab(tab)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`min-h-[44px] px-1 flex items-center justify-center gap-1 border-b-2 text-xs font-extrabold transition-colors whitespace-nowrap ${
                      isActive
                        ? 'border-[#C41E3A] text-[#C41E3A]'
                        : isDarkMode
                        ? 'border-transparent text-[#94A3B8] hover:text-white'
                        : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
                    }`}
                  >
                    <span className="truncate">{tab}</span>
                    <span className="font-mono tabular-nums text-[11px] opacity-80">
                      ({count})
                    </span>
                  </button>
                );
              })}
            </nav>

            {/* Active Course Filter Indicator */}
            {selectedCourseFilter !== 'Semua' && (
              <div
                className={`mx-4 mt-2.5 px-3.5 py-1.5 rounded-2xl flex items-center justify-between text-xs ${
                  isDarkMode
                    ? 'bg-[#1F242D] text-[#CBD5E1]'
                    : 'bg-[#FFE4E6] text-[#BE123C]'
                }`}
              >
                <span className="truncate">
                  Mata Kuliah: <strong>{selectedCourseFilter}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedCourseFilter('Semua')}
                  className="min-h-[44px] px-2 font-bold underline shrink-0"
                >
                  Semua Matkul
                </button>
              </div>
            )}

            {/* Scrollable Colorful Bento TaskCard List */}
            <div className="flex-1 overflow-y-auto px-4 pt-3 pb-28 space-y-3">
              {allTasksCompleted && activeFilterTab === 'Semua' && (
                <div
                  className={`p-3.5 rounded-3xl border-2 flex items-center gap-3 ${
                    isDarkMode
                      ? 'bg-[#064E3B]/30 border-[#059669]/50'
                      : 'bg-[#D1FAE5] border-[#A7F3D0]'
                  }`}
                >
                  <StudentMascotAvatar size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-extrabold text-[#047857] dark:text-[#34D399]">
                      Semua tugas kuliah sudah tuntas! Waktunya istirahat.
                    </p>
                    <p
                      className={`text-[11px] mt-0.5 ${
                        isDarkMode ? 'text-[#CBD5E1]' : 'text-[#065F46]'
                      }`}
                    >
                      Seluruh {taskMetrics.total} tugas Semester 5 selesai dikerjakan.
                    </p>
                  </div>
                </div>
              )}

              {filteredTasks.length > 0 ? (
                filteredTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    courses={courses}
                    onToggleStatus={handleToggleStatus}
                    onDeleteTask={handleDeleteTask}
                    isDarkMode={isDarkMode}
                  />
                ))
              ) : (
                <div
                  className={`py-8 px-5 text-center rounded-3xl border-2 ${
                    isDarkMode
                      ? 'border-[#262C3A] bg-[#1F242D]/50'
                      : 'border-[#FECDD3] bg-white shadow-xs'
                  }`}
                >
                  <CelebrationMascotIllustration />
                  <h3 className="mt-3 text-[15px] font-extrabold leading-snug max-w-[260px] mx-auto">
                    Semua tugas kuliah sudah tuntas! Waktunya istirahat.
                  </h3>
                  <p
                    className={`text-xs mt-1.5 max-w-[250px] mx-auto leading-relaxed ${
                      isDarkMode ? 'text-[#94A3B8]' : 'text-[#64748B]'
                    }`}
                  >
                    {searchQuery.trim() !== ''
                      ? `Tidak ditemukan tugas dengan kata kunci "${searchQuery}".`
                      : 'Tidak ada tugas yang menunggu pada tampilan ini.'}
                  </p>
                  <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                    {(searchQuery !== '' ||
                      activeFilterTab !== 'Semua' ||
                      selectedCourseFilter !== 'Semua') && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery('');
                          setActiveFilterTab('Semua');
                          setSelectedCourseFilter('Semua');
                        }}
                        className={`min-h-[44px] px-4 rounded-2xl text-xs font-bold transition-colors ${
                          isDarkMode
                            ? 'bg-[#232934] text-white border border-[#323A48]'
                            : 'bg-[#F1F5F9] text-[#0F172A]'
                        }`}
                      >
                        Lihat Semua Tugas
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleOpenAddSheet()}
                      className="min-h-[44px] px-4 rounded-2xl bg-[#C41E3A] hover:bg-[#A3162E] text-xs font-bold text-white transition-colors"
                    >
                      Tambah Tugas Baru
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Floating Action Button (+) above Bottom Nav */}
            <button
              type="button"
              onClick={() => handleOpenAddSheet()}
              aria-label="Tambah tugas baru"
              title="Tambah Tugas"
              className="absolute right-5 bottom-22 z-30 w-14 h-14 min-w-[56px] min-h-[56px] rounded-full bg-[#C41E3A] hover:bg-[#A3162E] text-white shadow-lg flex items-center justify-center transition-transform active:scale-95"
            >
              <Plus className="w-6 h-6 stroke-[2.75]" aria-hidden="true" />
            </button>
          </section>
        )}

        {/* Tab 2: Mata Kuliah (Visual Bento Course Directory + "+ Tambah Matkul") */}
        {bottomTab === 'matakuliah' && (
          <section
            aria-label="Direktori Mata Kuliah Semester 5"
            className="flex-1 flex flex-col min-h-0 overflow-hidden"
          >
            <header className="px-5 pt-4 pb-3 flex items-center justify-between gap-2">
              <div>
                <h1 className="text-xl font-extrabold tracking-tight">
                  Mata Kuliah
                </h1>
                <p
                  className={`text-xs mt-0.5 font-medium ${
                    isDarkMode ? 'text-[#94A3B8]' : 'text-[#64748B]'
                  }`}
                >
                  {courses.length} Matkul · {totalCredits} SKS Semester 5
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsAddCourseOpen(true)}
                className="min-h-[44px] px-3.5 rounded-2xl bg-[#C41E3A] hover:bg-[#A3162E] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
                <span>Tambah Matkul</span>
              </button>
            </header>

            <div className="flex-1 overflow-y-auto px-4 pt-1 pb-28 space-y-3.5">
              {courses.map((course) => {
                const courseTasks = tasks.filter(
                  (t) => t.course.toLowerCase() === course.name.toLowerCase()
                );
                const activeCourseTasks = courseTasks.filter(
                  (t) => t.status === 'Belum Dikerjakan'
                ).length;
                const completedCourseTasks =
                  courseTasks.length - activeCourseTasks;

                return (
                  <article
                    key={course.id}
                    style={
                      isDarkMode
                        ? undefined
                        : {
                            backgroundColor: course.pastelBg,
                            borderColor: course.pastelBorder,
                          }
                    }
                    className={`rounded-3xl border-2 p-4 transition-all ${
                      isDarkMode
                        ? 'bg-[#1F242D] border-[#2E3440]'
                        : 'shadow-xs'
                    }`}
                  >
                    {/* Bento Top Row: Large 48x48pt Subject Icon + Title + SKS Badge */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3.5 min-w-0">
                        <div
                          style={{ backgroundColor: course.iconBg }}
                          className="w-12 h-12 min-w-[48px] min-h-[48px] rounded-2xl flex items-center justify-center shrink-0 shadow-xs"
                        >
                          {renderSubjectIconByKey(course.iconKey)}
                        </div>

                        <div className="min-w-0">
                          <span
                            style={{
                              color: isDarkMode
                                ? '#CBD5E1'
                                : course.accentColor,
                            }}
                            className="text-xs font-extrabold font-mono"
                          >
                            {course.code}
                          </span>
                          <h2
                            className={`text-[16px] font-extrabold leading-snug ${
                              isDarkMode ? 'text-white' : 'text-[#0F172A]'
                            }`}
                          >
                            {course.name}
                          </h2>
                        </div>
                      </div>

                      <span
                        style={{
                          backgroundColor: isDarkMode
                            ? '#2E3440'
                            : course.iconBg,
                        }}
                        className="px-2.5 py-1 rounded-xl text-white text-xs font-extrabold font-mono tabular-nums shrink-0"
                      >
                        {course.credits} SKS
                      </span>
                    </div>

                    {/* Lecturer, Schedule & Room Bento Sub-box */}
                    <div
                      className={`mt-3 rounded-2xl p-3 space-y-1.5 text-xs ${
                        isDarkMode
                          ? 'bg-[#141821] text-[#CBD5E1]'
                          : 'bg-white/85 text-[#1E293B]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <UserCheck
                          className="w-3.5 h-3.5 shrink-0 opacity-75"
                          aria-hidden="true"
                        />
                        <span className="truncate">
                          Dosen: <strong>{course.lecturer}</strong>
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar
                          className="w-3.5 h-3.5 shrink-0 opacity-75"
                          aria-hidden="true"
                        />
                        <span className="font-mono tabular-nums truncate">
                          {course.schedule}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin
                          className="w-3.5 h-3.5 shrink-0 opacity-75"
                          aria-hidden="true"
                        />
                        <span className="truncate">Ruangan: {course.room}</span>
                      </div>
                    </div>

                    {/* Footer Row: Active Task Counter & Quick Actions */}
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <div className="text-xs font-extrabold">
                        <span
                          style={{
                            color: isDarkMode ? '#F8FAFC' : course.accentColor,
                          }}
                        >
                          {activeCourseTasks} Tugas Aktif
                        </span>
                        <span
                          className={`ml-1.5 font-semibold ${
                            isDarkMode ? 'text-[#94A3B8]' : 'text-[#475569]'
                          }`}
                        >
                          · {completedCourseTasks} Selesai
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenAddSheet(course.name)}
                          aria-label={`Tambah tugas untuk ${course.name}`}
                          className={`min-h-[44px] px-3 rounded-2xl text-xs font-bold flex items-center gap-1 transition-colors ${
                            isDarkMode
                              ? 'bg-[#141821] text-white hover:bg-[#2E3440]'
                              : 'bg-white text-[#0F172A] hover:bg-[#F8FAFC]'
                          }`}
                        >
                          <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Tugas</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCourseFilter(course.name);
                            setActiveFilterTab('Semua');
                            setBottomTab('tugas');
                          }}
                          style={{ backgroundColor: course.iconBg }}
                          className="min-h-[44px] px-3.5 rounded-2xl text-white text-xs font-bold flex items-center gap-1 shadow-2xs transition-opacity hover:opacity-95"
                        >
                          <span>Buka</span>
                          <ChevronRight
                            className="w-3.5 h-3.5"
                            aria-hidden="true"
                          />
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {/* Tab 3: Progres (Olympiad Radial Gauge, Colorful Stat Tiles & Podium Trophy Shelf) */}
        {bottomTab === 'progres' && (
          <section
            aria-label="Progres Akademik dan Pencapaian"
            className="flex-1 flex flex-col min-h-0 overflow-hidden"
          >
            <header className="px-5 pt-4 pb-3 flex items-center justify-between">
              <div>
                <h1 className="text-xl font-extrabold tracking-tight">
                  Progres & Statistik
                </h1>
                <p
                  className={`text-xs mt-0.5 font-medium ${
                    isDarkMode ? 'text-[#94A3B8]' : 'text-[#64748B]'
                  }`}
                >
                  Analitik capaian belajar Semester 5
                </p>
              </div>
              <div className="px-3 py-1.5 rounded-2xl bg-[#FFE4E6] text-[#C41E3A] text-xs font-extrabold flex items-center gap-1.5">
                <Flame
                  className="w-4 h-4 fill-[#C41E3A] text-[#C41E3A]"
                  aria-hidden="true"
                />
                <span className="font-mono tabular-nums">
                  {STUDENT_METADATA.streakDays} Hari
                </span>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto px-4 pt-1 pb-28 space-y-4">
              {/* 3 Colorful Bento Stat Tiles: Total Tugas, Tugas Selesai, Tugas Menunggu */}
              <div className="grid grid-cols-3 gap-2.5">
                <div className="rounded-3xl bg-[#EEF2FF] border-2 border-[#C7D2FE] p-3.5 flex flex-col justify-between">
                  <span className="text-[11px] font-extrabold text-[#4338CA]">
                    Total Tugas
                  </span>
                  <span className="mt-2 text-2xl font-extrabold font-mono tabular-nums text-[#312E81]">
                    {taskMetrics.total}
                  </span>
                  <span className="mt-1 text-[10px] font-bold text-[#4F46E5]">
                    {courses.length} Mata Kuliah
                  </span>
                </div>

                <div className="rounded-3xl bg-[#D1FAE5] border-2 border-[#A7F3D0] p-3.5 flex flex-col justify-between">
                  <span className="text-[11px] font-extrabold text-[#047857]">
                    Tugas Selesai
                  </span>
                  <span className="mt-2 text-2xl font-extrabold font-mono tabular-nums text-[#065F46]">
                    {taskMetrics.completed}
                  </span>
                  <span className="mt-1 text-[10px] font-bold text-[#059669]">
                    Tuntas Dikerjakan
                  </span>
                </div>

                <div className="rounded-3xl bg-[#FEE2E2] border-2 border-[#FECACA] p-3.5 flex flex-col justify-between">
                  <span className="text-[11px] font-extrabold text-[#BE123C]">
                    Tugas Menunggu
                  </span>
                  <span className="mt-2 text-2xl font-extrabold font-mono tabular-nums text-[#9F1239]">
                    {taskMetrics.pending}
                  </span>
                  <span className="mt-1 text-[10px] font-bold text-[#C41E3A]">
                    Prioritas Aktif
                  </span>
                </div>
              </div>

              {/* Olympiad-Style Circular Radial Completion Gauge Card */}
              <div
                className={`rounded-3xl border-2 p-5 flex items-center gap-5 ${
                  isDarkMode
                    ? 'bg-[#1F242D] border-[#2E3440]'
                    : 'bg-white border-[#E2E8F0] shadow-xs'
                }`}
              >
                <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
                  <svg
                    className="w-28 h-28 -rotate-90"
                    viewBox="0 0 108 108"
                    aria-hidden="true"
                  >
                    <circle
                      cx="54"
                      cy="54"
                      r={radialRadius}
                      fill="none"
                      stroke={isDarkMode ? '#2E3440' : '#FFE4E6'}
                      strokeWidth="10"
                    />
                    <circle
                      cx="54"
                      cy="54"
                      r={radialRadius}
                      fill="none"
                      stroke="#C41E3A"
                      strokeWidth="10"
                      strokeLinecap="round"
                      strokeDasharray={radialCircumference}
                      strokeDashoffset={radialStrokeOffset}
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-xl font-extrabold font-mono tabular-nums">
                      {taskMetrics.completionRate}%
                    </span>
                    <span
                      className={`text-[10px] font-bold ${
                        isDarkMode ? 'text-[#94A3B8]' : 'text-[#64748B]'
                      }`}
                    >
                      Tuntas
                    </span>
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <span className="text-[11px] font-extrabold text-[#C41E3A] uppercase tracking-wider">
                    Skor Ketuntasan
                  </span>
                  <h2 className="text-base font-extrabold mt-0.5 leading-snug">
                    Performa Akademik Semester 5
                  </h2>
                  <p
                    className={`text-xs mt-1 leading-relaxed ${
                      isDarkMode ? 'text-[#94A3B8]' : 'text-[#475569]'
                    }`}
                  >
                    {taskMetrics.completed} dari {taskMetrics.total} tugas telah diselesaikan tepat waktu.
                  </p>
                </div>
              </div>

              {/* Olympiad-Style Podium Trophy Shelf (01, 02, 03 Badges) */}
              <div
                className={`rounded-3xl border-2 p-5 ${
                  isDarkMode
                    ? 'bg-[#1F242D] border-[#2E3440]'
                    : 'bg-white border-[#E2E8F0] shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between mb-3.5">
                  <div>
                    <h3 className="text-sm font-extrabold">
                      Podium Pencapaian Semester
                    </h3>
                    <p
                      className={`text-[11px] mt-0.5 ${
                        isDarkMode ? 'text-[#94A3B8]' : 'text-[#64748B]'
                      }`}
                    >
                      Peringkat ketuntasan belajar mahasiswa TI-1
                    </p>
                  </div>
                  <Award
                    className="w-5 h-5 text-[#C41E3A]"
                    aria-hidden="true"
                  />
                </div>

                <div className="space-y-2.5">
                  {PODIUM_TROPHY_SHELF.map((podium) => (
                    <div
                      key={podium.id}
                      style={
                        isDarkMode
                          ? undefined
                          : {
                              backgroundColor: podium.cardBg,
                              borderColor: podium.cardBorder,
                            }
                      }
                      className={`rounded-2xl border-2 p-3 flex items-center justify-between gap-3 ${
                        isDarkMode ? 'bg-[#141821] border-[#2E3440]' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          style={{ backgroundColor: podium.rankBg }}
                          className="w-11 h-11 rounded-2xl text-white font-mono font-extrabold text-sm flex items-center justify-center shrink-0 shadow-xs"
                        >
                          #{podium.rank}
                        </div>
                        <div className="min-w-0">
                          <h4
                            className={`text-xs font-extrabold truncate flex items-center gap-1.5 ${
                              isDarkMode ? 'text-white' : 'text-[#0F172A]'
                            }`}
                          >
                            <span>
                              {podium.rank} {podium.title}
                            </span>
                            {renderPodiumVectorIcon(
                              podium.iconKey,
                              isDarkMode ? '#CBD5E1' : podium.accentColor
                            )}
                          </h4>
                          <p
                            className={`text-[11px] mt-0.5 truncate ${
                              isDarkMode ? 'text-[#94A3B8]' : 'text-[#475569]'
                            }`}
                          >
                            {podium.subtitle}
                          </p>
                        </div>
                      </div>

                      <span
                        style={{
                          backgroundColor: isDarkMode ? '#1F242D' : '#FFFFFF',
                          color: isDarkMode ? '#F8FAFC' : podium.accentColor,
                        }}
                        className="px-2.5 py-1 rounded-xl text-[11px] font-mono font-extrabold shrink-0 shadow-2xs"
                      >
                        {podium.metricBadge}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Per-Subject Colorful Progress Bars */}
              <div
                className={`rounded-3xl border-2 p-5 ${
                  isDarkMode
                    ? 'bg-[#1F242D] border-[#2E3440]'
                    : 'bg-white border-[#E2E8F0] shadow-xs'
                }`}
              >
                <h3 className="text-sm font-extrabold mb-3.5">
                  Capaian per Mata Kuliah
                </h3>
                <div className="space-y-3.5">
                  {courses.map((course) => {
                    const totalForCourse = tasks.filter(
                      (t) =>
                        t.course.toLowerCase() === course.name.toLowerCase()
                    ).length;
                    const doneForCourse = tasks.filter(
                      (t) =>
                        t.course.toLowerCase() === course.name.toLowerCase() &&
                        t.status === 'Selesai'
                    ).length;
                    const rate =
                      totalForCourse > 0
                        ? Math.round((doneForCourse / totalForCourse) * 100)
                        : 0;

                    return (
                      <div key={course.id} className="flex items-center gap-3">
                        <div
                          style={{ backgroundColor: course.iconBg }}
                          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        >
                          {renderSubjectIconByKey(course.iconKey)}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="font-bold truncate">
                              {course.name}
                            </span>
                            <span className="font-mono tabular-nums font-extrabold">
                              {doneForCourse}/{totalForCourse} ({rate}%)
                            </span>
                          </div>
                          <div
                            className={`h-2.5 rounded-full overflow-hidden ${
                              isDarkMode ? 'bg-[#141821]' : 'bg-[#F1F5F9]'
                            }`}
                          >
                            <div
                              style={{
                                width: `${rate}%`,
                                backgroundColor: course.iconBg,
                              }}
                              className="h-full rounded-full transition-all duration-300"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Tab 4: Profil (Student Identity & Operational Settings) */}
        {bottomTab === 'profil' && (
          <section
            aria-label="Profil Mahasiswa dan Pengaturan"
            className="flex-1 flex flex-col min-h-0 overflow-hidden"
          >
            <header className="px-5 pt-4 pb-3 flex items-center justify-between">
              <div>
                <h1 className="text-xl font-extrabold tracking-tight">
                  Profil Mahasiswa
                </h1>
                <p
                  className={`text-xs mt-0.5 font-medium ${
                    isDarkMode ? 'text-[#94A3B8]' : 'text-[#64748B]'
                  }`}
                >
                  Kartu identitas akademik STIKOM Poltek Cirebon
                </p>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto px-4 pt-1 pb-28 space-y-4">
              {/* STIKOM Crimson Red & White Student Identity Card */}
              <div
                className={`rounded-3xl border-2 overflow-hidden ${
                  isDarkMode
                    ? 'bg-[#1F242D] border-[#2E3440]'
                    : 'bg-white border-[#E2E8F0] shadow-xs'
                }`}
              >
                <div className="bg-gradient-to-r from-[#C41E3A] to-[#DC2626] px-5 pt-5 pb-10 text-white text-center">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full">
                    {STUDENT_METADATA.institution}
                  </span>
                </div>

                <div className="px-5 pb-5 -mt-8 text-center">
                  <div className="flex justify-center">
                    <StudentMascotAvatar size="lg" />
                  </div>

                  <h2 className="mt-2.5 text-lg font-extrabold tracking-tight">
                    {STUDENT_METADATA.name}
                  </h2>
                  <p className="text-xs font-mono tabular-nums font-extrabold text-[#C41E3A] mt-0.5">
                    NIM {STUDENT_METADATA.nim}
                  </p>
                  <p
                    className={`text-xs font-medium mt-1 ${
                      isDarkMode ? 'text-[#94A3B8]' : 'text-[#475569]'
                    }`}
                  >
                    Kelas {STUDENT_METADATA.classGroup} {STUDENT_METADATA.semester}{' '}
                    · {STUDENT_METADATA.program}
                  </p>

                  {/* Academic Stats Bar: 15 SKS | 5 Mata Kuliah Aktif | Kehadiran 100% */}
                  <div
                    className={`mt-4 pt-4 border-t grid grid-cols-3 ${
                      isDarkMode ? 'border-[#2E3440]' : 'border-[#F1F5F9]'
                    }`}
                  >
                    <div>
                      <span className="block text-base font-extrabold font-mono tabular-nums">
                        {totalCredits} SKS
                      </span>
                      <span
                        className={`text-[11px] font-medium ${
                          isDarkMode ? 'text-[#94A3B8]' : 'text-[#64748B]'
                        }`}
                      >
                        Beban Studi
                      </span>
                    </div>
                    <div
                      className={`border-x ${
                        isDarkMode ? 'border-[#2E3440]' : 'border-[#F1F5F9]'
                      }`}
                    >
                      <span className="block text-base font-extrabold font-mono tabular-nums text-[#C41E3A]">
                        {courses.length} Matkul
                      </span>
                      <span
                        className={`text-[11px] font-medium ${
                          isDarkMode ? 'text-[#94A3B8]' : 'text-[#64748B]'
                        }`}
                      >
                        Mata Kuliah Aktif
                      </span>
                    </div>
                    <div>
                      <span className="block text-base font-extrabold font-mono tabular-nums text-[#059669]">
                        100%
                      </span>
                      <span
                        className={`text-[11px] font-medium ${
                          isDarkMode ? 'text-[#94A3B8]' : 'text-[#64748B]'
                        }`}
                      >
                        Kehadiran
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Preview Welcome Splash Screen Button */}
              <button
                type="button"
                onClick={() => setIsSplashOpen(true)}
                className={`w-full min-h-[48px] px-4 rounded-3xl border-2 text-xs font-extrabold flex items-center justify-between transition-colors ${
                  isDarkMode
                    ? 'bg-[#1F242D] border-[#2E3440] text-white hover:border-[#C41E3A]'
                    : 'bg-[#FEE2E2] border-[#FECACA] text-[#C41E3A] hover:bg-[#FECDD3]'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" aria-hidden="true" />
                  <span>Buka Layar Sambutan</span>
                </span>
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
              </button>

              {/* Student-Focused Settings List */}
              <div
                className={`rounded-3xl border-2 p-3 space-y-1 ${
                  isDarkMode
                    ? 'bg-[#1F242D] border-[#2E3440]'
                    : 'bg-white border-[#E2E8F0] shadow-xs'
                }`}
              >
                {/* Setting 1: Pengingat Tugas H-1 */}
                <div className="flex items-center justify-between px-3 py-2 min-h-[52px]">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-2xl bg-[#FEE2E2] text-[#C41E3A] flex items-center justify-center shrink-0">
                      <Bell className="w-4 h-4" aria-hidden="true" />
                    </div>
                    <div>
                      <span className="text-sm font-bold block">
                        Pengingat Tugas H-1
                      </span>
                      <span
                        className={`text-[11px] block ${
                          isDarkMode ? 'text-[#94A3B8]' : 'text-[#64748B]'
                        }`}
                      >
                        {reminderEnabled
                          ? 'Notifikasi sehari sebelum tenggat aktif'
                          : 'Notifikasi pengingat dinonaktifkan'}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={reminderEnabled}
                    aria-label="Aktifkan atau nonaktifkan pengingat tugas H-1"
                    onClick={() => {
                      const next = !reminderEnabled;
                      setReminderEnabled(next);
                      showToastMessage(
                        next
                          ? 'Pengingat Tugas H-1 diaktifkan.'
                          : 'Pengingat Tugas H-1 dinonaktifkan.'
                      );
                    }}
                    className="min-w-[48px] min-h-[44px] flex items-center justify-end"
                  >
                    <span
                      className={`w-12 h-7 rounded-full p-1 transition-colors flex items-center ${
                        reminderEnabled
                          ? 'bg-[#C41E3A] justify-end'
                          : isDarkMode
                          ? 'bg-[#323A48] justify-start'
                          : 'bg-[#CBD5E1] justify-start'
                      }`}
                    >
                      <span className="w-5 h-5 rounded-full bg-white shadow-xs" />
                    </span>
                  </button>
                </div>

                {/* Setting 2: Sinkronisasi Google Calendar */}
                <div className="flex items-center justify-between px-3 py-2 min-h-[52px]">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-2xl bg-[#D1FAE5] text-[#059669] flex items-center justify-center shrink-0">
                      <Calendar className="w-4 h-4" aria-hidden="true" />
                    </div>
                    <div>
                      <span className="text-sm font-bold block">
                        Sinkronisasi Google Calendar
                      </span>
                      <span
                        className={`text-[11px] block ${
                          isDarkMode ? 'text-[#94A3B8]' : 'text-[#64748B]'
                        }`}
                      >
                        {googleCalendarSync
                          ? 'Tenggat tugas otomatis masuk kalender'
                          : 'Sinkronisasi kalender tidak aktif'}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={googleCalendarSync}
                    aria-label="Aktifkan atau nonaktifkan sinkronisasi Google Calendar"
                    onClick={() => {
                      const next = !googleCalendarSync;
                      setGoogleCalendarSync(next);
                      showToastMessage(
                        next
                          ? 'Sinkronisasi Google Calendar diaktifkan.'
                          : 'Sinkronisasi Google Calendar dinonaktifkan.'
                      );
                    }}
                    className="min-w-[48px] min-h-[44px] flex items-center justify-end"
                  >
                    <span
                      className={`w-12 h-7 rounded-full p-1 transition-colors flex items-center ${
                        googleCalendarSync
                          ? 'bg-[#C41E3A] justify-end'
                          : isDarkMode
                          ? 'bg-[#323A48] justify-start'
                          : 'bg-[#CBD5E1] justify-start'
                      }`}
                    >
                      <span className="w-5 h-5 rounded-full bg-white shadow-xs" />
                    </span>
                  </button>
                </div>

                {/* Setting 3: Pembaruan SIAKAD Otomatis */}
                <div className="flex items-center justify-between px-3 py-2 min-h-[52px]">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-2xl bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center shrink-0">
                      <RefreshCw className="w-4 h-4" aria-hidden="true" />
                    </div>
                    <div>
                      <span className="text-sm font-bold block">
                        Pembaruan SIAKAD Otomatis
                      </span>
                      <span
                        className={`text-[11px] block ${
                          isDarkMode ? 'text-[#94A3B8]' : 'text-[#64748B]'
                        }`}
                      >
                        {siakadAutoUpdate
                          ? 'Terhubung dengan portal SIAKAD STIKOM'
                          : 'Pembaruan otomatis SIAKAD dimatikan'}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={siakadAutoUpdate}
                    aria-label="Aktifkan atau nonaktifkan pembaruan SIAKAD otomatis"
                    onClick={() => {
                      const next = !siakadAutoUpdate;
                      setSiakadAutoUpdate(next);
                      showToastMessage(
                        next
                          ? 'Pembaruan SIAKAD Otomatis diaktifkan.'
                          : 'Pembaruan SIAKAD Otomatis dinonaktifkan.'
                      );
                    }}
                    className="min-w-[48px] min-h-[44px] flex items-center justify-end"
                  >
                    <span
                      className={`w-12 h-7 rounded-full p-1 transition-colors flex items-center ${
                        siakadAutoUpdate
                          ? 'bg-[#C41E3A] justify-end'
                          : isDarkMode
                          ? 'bg-[#323A48] justify-start'
                          : 'bg-[#CBD5E1] justify-start'
                      }`}
                    >
                      <span className="w-5 h-5 rounded-full bg-white shadow-xs" />
                    </span>
                  </button>
                </div>

                {/* Setting 4: Mode Tampilan */}
                <div className="flex items-center justify-between px-3 py-2 min-h-[52px]">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-2xl bg-[#CFFAFE] text-[#0891B2] flex items-center justify-center shrink-0">
                      {isDarkMode ? (
                        <Moon className="w-4 h-4" aria-hidden="true" />
                      ) : (
                        <Sun className="w-4 h-4" aria-hidden="true" />
                      )}
                    </div>
                    <div>
                      <span className="text-sm font-bold block">
                        Mode Tampilan
                      </span>
                      <span
                        className={`text-[11px] block ${
                          isDarkMode ? 'text-[#94A3B8]' : 'text-[#64748B]'
                        }`}
                      >
                        {isDarkMode ? 'Mode Gelap Aktif' : 'Mode Terang STIKOM'}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={isDarkMode}
                    aria-label="Ubah mode tampilan terang atau gelap"
                    onClick={() => {
                      const next = !isDarkMode;
                      setIsDarkMode(next);
                      showToastMessage(
                        next
                          ? 'Mode tampilan gelap diaktifkan.'
                          : 'Mode tampilan terang STIKOM diaktifkan.'
                      );
                    }}
                    className="min-w-[48px] min-h-[44px] flex items-center justify-end"
                  >
                    <span
                      className={`w-12 h-7 rounded-full p-1 transition-colors flex items-center ${
                        isDarkMode
                          ? 'bg-[#C41E3A] justify-end'
                          : 'bg-[#CBD5E1] justify-start'
                      }`}
                    >
                      <span className="w-5 h-5 rounded-full bg-white shadow-xs" />
                    </span>
                  </button>
                </div>
              </div>

              {/* Atur Ulang Data Button (Dispatches RESET_TASKS in useReducer) */}
              <button
                type="button"
                onClick={handleResetTasks}
                className="w-full min-h-[50px] rounded-3xl bg-[#C41E3A] hover:bg-[#A3162E] text-white text-sm font-extrabold flex items-center justify-center gap-2 shadow-sm transition-colors"
              >
                <RotateCcw className="w-4 h-4" aria-hidden="true" />
                <span>Atur Ulang Data</span>
              </button>
            </div>
          </section>
        )}

        {/* Persistent 4-Tab Bottom Navigation Bar (STIKOM Crimson Red Active Capsule) */}
        <nav
          aria-label="Navigasi Utama Aplikasi"
          className={`absolute bottom-3 left-4 right-4 z-30 rounded-[28px] border-2 p-1.5 flex items-center justify-between shadow-lg transition-colors ${
            isDarkMode
              ? 'bg-[#1F242D]/95 border-[#2E3440] backdrop-blur-md'
              : 'bg-white/95 border-[#E2E8F0] backdrop-blur-md'
          }`}
        >
          {(
            [
              {
                key: 'tugas',
                label: 'Tugas',
                icon: CheckSquare,
              },
              {
                key: 'matakuliah',
                label: 'Mata Kuliah',
                icon: BookOpen,
              },
              {
                key: 'progres',
                label: 'Progres',
                icon: PieChart,
              },
              {
                key: 'profil',
                label: 'Profil',
                icon: User,
              },
            ] as const
          ).map((item) => {
            const IconComponent = item.icon;
            const isSelected = bottomTab === item.key;

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setBottomTab(item.key)}
                aria-current={isSelected ? 'page' : undefined}
                aria-label={item.label}
                className={`min-h-[44px] min-w-[48px] px-3.5 rounded-[22px] flex items-center justify-center gap-1.5 text-xs font-extrabold transition-all duration-150 ${
                  isSelected
                    ? 'bg-[#C41E3A] text-white shadow-xs flex-1 max-w-[140px]'
                    : isDarkMode
                    ? 'text-[#94A3B8] hover:text-white'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                <IconComponent
                  className="w-4 h-4 shrink-0"
                  aria-hidden="true"
                />
                {isSelected && (
                  <span className="truncate whitespace-nowrap">
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Screen 0: Welcome Brand Splash Modal (STIKOM Poltek Cirebon) */}
        <WelcomeSplashModal
          isOpen={isSplashOpen}
          onStartLearning={() => setIsSplashOpen(false)}
          pendingCount={taskMetrics.pending}
          totalCourses={courses.length}
        />
      </main>

      {/* Slide-Up Add Task Bottom Sheet Modal */}
      <AddTaskSheet
        isOpen={isAddSheetOpen}
        onClose={() => setIsAddSheetOpen(false)}
        onAddTask={handleAddTask}
        titleInputRef={titleInputRef}
        courses={courses}
        initialCourse={preselectedCourseForAdd}
        onRequestCalendarPicker={handleRequestCalendarPicker}
        isDarkMode={isDarkMode}
      />

      {/* Slide-Up Add Course Bottom Sheet Modal */}
      <AddCourseSheet
        isOpen={isAddCourseOpen}
        onClose={() => setIsAddCourseOpen(false)}
        onAddCourse={handleAddCourse}
        isDarkMode={isDarkMode}
      />

      {/* Full Interactive Month & Year Calendar Modal */}
      <CalendarModal
        isOpen={isCalendarModalOpen}
        onClose={() => setIsCalendarModalOpen(false)}
        selectedDateLabel={selectedDayDate}
        onSelectDate={(dateLabel) => {
          setSelectedDayDate(dateLabel);
          if (calendarPickerCallback) {
            calendarPickerCallback(dateLabel);
          }
        }}
        tasks={tasks}
        mode={calendarModalMode}
        isDarkMode={isDarkMode}
      />
    </div>
  );
}
