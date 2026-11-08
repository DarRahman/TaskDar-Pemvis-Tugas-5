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
  Code2,
  Cpu,
  Database,
  ShieldCheck,
  Layers,
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
} from 'lucide-react';
import {
  INITIAL_TASKS,
  STUDENT_METADATA,
  COURSE_DIRECTORY,
  ACHIEVEMENT_BADGES,
  taskReducer,
} from './data/initialTasks';
import {
  TaskFilterTab,
  MainBottomTab,
  NewTaskPayload,
  TaskMetrics,
  CourseDetail,
  AchievementBadge,
} from './types/task';
import { TaskCard } from './components/TaskCard';
import { AddTaskSheet } from './components/AddTaskSheet';
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
  isToday?: boolean;
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
    isToday: true,
  },
  {
    dayShort: 'Min',
    dayFull: 'Minggu',
    dateNumber: '09',
    fullDateLabel: '09 Nov 2026',
  },
];

function renderCourseVectorIcon(iconKey: CourseDetail['iconKey']) {
  switch (iconKey) {
    case 'code':
      return <Code2 className="w-5 h-5 text-white" aria-hidden="true" />;
    case 'cpu':
      return <Cpu className="w-5 h-5 text-white" aria-hidden="true" />;
    case 'database':
      return <Database className="w-5 h-5 text-white" aria-hidden="true" />;
    case 'shield':
      return <ShieldCheck className="w-5 h-5 text-white" aria-hidden="true" />;
    case 'layers':
      return <Layers className="w-5 h-5 text-white" aria-hidden="true" />;
  }
}

function renderBadgeVectorIcon(
  iconKey: AchievementBadge['iconKey'],
  color: string
) {
  switch (iconKey) {
    case 'clock':
      return <Clock className="w-5 h-5" style={{ color }} aria-hidden="true" />;
    case 'flame':
      return <Flame className="w-5 h-5" style={{ color }} aria-hidden="true" />;
    case 'terminal':
      return (
        <Terminal className="w-5 h-5" style={{ color }} aria-hidden="true" />
      );
    case 'award':
      return <Award className="w-5 h-5" style={{ color }} aria-hidden="true" />;
  }
}

export default function App() {
  /*
   * Hook 7 (useReducer): Central state engine managing task list mutations
   * across ADD_TASK, DELETE_TASK, TOGGLE_STATUS, and RESET_TASKS.
   */
  const [tasks, dispatch] = useReducer(taskReducer, INITIAL_TASKS);

  /*
   * Hook 2 (useState): Manages active bottom navigation tab, selected weekly
   * calendar day, search query, status filter tab, course filter, student
   * settings toggles, and modal sheet visibility.
   */
  const [bottomTab, setBottomTab] = useState<MainBottomTab>('tugas');
  const [selectedDayDate, setSelectedDayDate] = useState<string>('08 Nov 2026');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFilterTab, setActiveFilterTab] =
    useState<TaskFilterTab>('Semua');
  const [selectedCourseFilter, setSelectedCourseFilter] =
    useState<string>('Semua');
  const [preselectedCourseForAdd, setPreselectedCourseForAdd] =
    useState<string>(COURSE_DIRECTORY[0].name);
  const [isAddSheetOpen, setIsAddSheetOpen] = useState<boolean>(false);

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

  const handleResetTasks = useCallback(() => {
    dispatch({ type: 'RESET_TASKS' });
    setSearchQuery('');
    setActiveFilterTab('Semua');
    setSelectedCourseFilter('Semua');
    setSelectedDayDate('08 Nov 2026');
    showToastMessage('Data tugas diatur ulang ke 5 tugas awal Semester 5.');
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

  const radialRadius = 46;
  const radialCircumference = 2 * Math.PI * radialRadius;
  const radialStrokeOffset =
    radialCircumference -
    (taskMetrics.completionRate / 100) * radialCircumference;

  const miniRadius = 21;
  const miniCircumference = 2 * Math.PI * miniRadius;
  const miniStrokeOffset =
    miniCircumference - (taskMetrics.completionRate / 100) * miniCircumference;

  const allTasksCompleted =
    taskMetrics.total > 0 && taskMetrics.pending === 0;

  return (
    <div
      className={`min-h-screen flex items-center justify-center sm:py-6 sm:px-4 transition-colors duration-200 ${
        isDarkMode ? 'bg-[#0F1319]' : 'bg-[#DFC59B]'
      }`}
    >
      {/* Pure Mobile Application Frame */}
      <main
        aria-label="Aplikasi Mobile Tugas Kuliah STIKOM Poltek Cirebon"
        className={`w-full max-w-[430px] min-h-screen sm:min-h-[844px] sm:max-h-[890px] sm:rounded-[44px] sm:border-[10px] sm:shadow-2xl flex flex-col relative overflow-hidden transition-colors duration-200 ${
          isDarkMode
            ? 'bg-[#161A22] sm:border-[#262C3A] text-[#F8FAFC]'
            : 'bg-[#FDFBF7] sm:border-[#2B2520] text-[#1E1B18]'
        }`}
      >
        {/* Top Mobile Status Pill (Visible on framed viewports) */}
        <div className="hidden sm:flex items-center justify-between px-7 pt-3 pb-1 text-[11px] font-bold tracking-tight select-none opacity-80">
          <span className="font-mono tabular-nums">09:41</span>
          <div className="w-24 h-5 rounded-full bg-[#1E1B18] dark:bg-black" />
          <span className="font-mono tabular-nums">5G · 100%</span>
        </div>

        {/* Toast Feedback Notification */}
        {feedbackToast && (
          <div
            role="status"
            className="absolute top-12 left-5 right-5 z-40 flex items-center gap-2 px-4 py-3 rounded-2xl bg-[#1E1B18] text-white text-xs font-semibold shadow-lg animate-in fade-in slide-in-from-top-2 duration-150"
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
            {/* Greeting Header with Student Mascot Avatar & 6-Day Streak Badge */}
            <header className="px-5 pt-3.5 pb-2.5 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setBottomTab('profil')}
                className="flex items-center gap-3 min-w-0 min-h-[44px] text-left group"
              >
                <StudentMascotAvatar size="sm" />
                <div className="min-w-0">
                  <h1 className="text-[16px] font-bold tracking-tight truncate">
                    Halo, {STUDENT_METADATA.name}
                  </h1>
                  <p
                    className={`text-xs truncate ${
                      isDarkMode ? 'text-[#94A3B8]' : 'text-[#6E6658]'
                    }`}
                  >
                    Apa target kuliahmu hari ini?
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setBottomTab('progres')}
                aria-label="Lihat progres dan rentetan hari aktif"
                className="min-h-[44px] px-3.5 rounded-full bg-[#FFEAE6] hover:bg-[#FCD5CE] text-[#C84332] flex items-center gap-1.5 text-xs font-bold shrink-0 transition-colors"
              >
                <Flame
                  className="w-4 h-4 fill-[#EC6B56] text-[#EC6B56]"
                  aria-hidden="true"
                />
                <span className="font-mono tabular-nums">
                  {STUDENT_METADATA.streakDays} Hari Aktif
                </span>
              </button>
            </header>

            {/* Horizontal 7-Day Weekly Calendar Strip (Mon to Sun with Active Day Indicator) */}
            <div className="px-5 pb-2.5">
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
                      className={`min-h-[54px] min-w-[44px] py-1.5 rounded-2xl flex flex-col items-center justify-center transition-all border ${
                        isSelected
                          ? 'bg-[#EC6B56] border-[#EC6B56] text-white shadow-xs'
                          : isDarkMode
                          ? 'bg-[#232934] border-[#323A48] text-[#CBD5E1] hover:border-[#EC6B56]/60'
                          : 'bg-white border-[#EFE8DC] text-[#4A4338] hover:border-[#DEC397]'
                      }`}
                    >
                      <span
                        className={`text-[10px] font-semibold leading-none ${
                          isSelected
                            ? 'text-white/90'
                            : isDarkMode
                            ? 'text-[#94A3B8]'
                            : 'text-[#8C8476]'
                        }`}
                      >
                        {dayItem.dayShort}
                      </span>
                      <span className="mt-1 text-xs font-bold font-mono tabular-nums leading-none">
                        {dayItem.dateNumber}
                      </span>
                      <span
                        className={`mt-1 w-1.5 h-1.5 rounded-full ${
                          hasDeadlineOnDay
                            ? isSelected
                              ? 'bg-white'
                              : 'bg-[#2A9D8F]'
                            : 'bg-transparent'
                        }`}
                        aria-hidden="true"
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Compact Progress Ring Summary Card */}
            <div className="px-5 pb-2.5">
              <div
                onClick={() => setBottomTab('progres')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    setBottomTab('progres');
                  }
                }}
                className={`rounded-3xl border p-3 flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                  isDarkMode
                    ? 'bg-[#232934] border-[#323A48] hover:border-[#EC6B56]/60'
                    : 'bg-white border-[#EFE8DC] hover:border-[#DEC397] shadow-xs'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                    <svg
                      className="w-12 h-12 -rotate-90"
                      viewBox="0 0 52 52"
                      aria-hidden="true"
                    >
                      <circle
                        cx="26"
                        cy="26"
                        r={miniRadius}
                        fill="none"
                        stroke={isDarkMode ? '#323A48' : '#F4EFE6'}
                        strokeWidth="5"
                      />
                      <circle
                        cx="26"
                        cy="26"
                        r={miniRadius}
                        fill="none"
                        stroke="#EC6B56"
                        strokeWidth="5"
                        strokeLinecap="round"
                        strokeDasharray={miniCircumference}
                        strokeDashoffset={miniStrokeOffset}
                      />
                    </svg>
                    <span className="absolute text-[11px] font-bold font-mono tabular-nums">
                      {taskMetrics.completionRate}%
                    </span>
                  </div>

                  <div className="min-w-0">
                    <h2 className="text-sm font-bold truncate">
                      Progres Tugas Semester 5
                    </h2>
                    <div
                      className={`mt-0.5 flex flex-wrap items-center gap-x-1.5 text-xs font-medium ${
                        isDarkMode ? 'text-[#94A3B8]' : 'text-[#6E6658]'
                      }`}
                    >
                      <span className="font-mono tabular-nums">
                        {taskMetrics.completed} selesai
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">
                        {taskMetrics.pending} belum dikerjakan
                      </span>
                    </div>
                  </div>
                </div>

                <div
                  className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 ${
                    isDarkMode ? 'bg-[#1A1F28]' : 'bg-[#F4EFE6]'
                  }`}
                >
                  <ChevronRight
                    className={`w-4 h-4 ${
                      isDarkMode ? 'text-[#CBD5E1]' : 'text-[#5C5549]'
                    }`}
                    aria-hidden="true"
                  />
                </div>
              </div>
            </div>

            {/* Real-Time Search Bar (FR-05 + useEffect observer) */}
            <div className="px-5 pb-2">
              <div
                className={`relative flex items-center rounded-2xl border transition-colors ${
                  isDarkMode
                    ? 'bg-[#232934] border-[#323A48] focus-within:border-[#EC6B56]'
                    : 'bg-[#F4EFE6] border-transparent focus-within:border-[#EC6B56] focus-within:bg-white'
                }`}
              >
                <Search
                  className={`w-4 h-4 ml-3.5 shrink-0 pointer-events-none ${
                    isDarkMode ? 'text-[#94A3B8]' : 'text-[#6E6658]'
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
                  className="w-full min-h-[44px] pl-2.5 pr-11 py-2 bg-transparent text-sm outline-none placeholder:text-[#8C8476]"
                />
                {searchQuery.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      searchInputRef.current?.focus();
                    }}
                    aria-label="Bersihkan kata kunci pencarian"
                    className="absolute right-1 min-w-[44px] min-h-[44px] flex items-center justify-center text-[#8C8476] hover:text-[#EC6B56]"
                  >
                    <X className="w-4 h-4" aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>

            {/* Clean Status Filter Tabs: Semua, Belum Dikerjakan, Selesai */}
            <nav
              aria-label="Filter Status Tugas"
              className={`px-5 border-b grid grid-cols-3 ${
                isDarkMode ? 'border-[#2E3440]' : 'border-[#EFE8DC]'
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
                    className={`min-h-[44px] px-1 flex items-center justify-center gap-1 border-b-2 text-xs font-bold transition-colors whitespace-nowrap ${
                      isActive
                        ? 'border-[#EC6B56] text-[#EC6B56]'
                        : isDarkMode
                        ? 'border-transparent text-[#94A3B8] hover:text-white'
                        : 'border-transparent text-[#8C8476] hover:text-[#1E1B18]'
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
                className={`mx-5 mt-2.5 px-3.5 py-1.5 rounded-2xl flex items-center justify-between text-xs ${
                  isDarkMode
                    ? 'bg-[#232934] text-[#CBD5E1]'
                    : 'bg-[#F4EFE6] text-[#4A4338]'
                }`}
              >
                <span className="truncate">
                  Filter: <strong>{selectedCourseFilter}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedCourseFilter('Semua')}
                  className="min-h-[44px] px-2 font-bold text-[#EC6B56] hover:underline shrink-0"
                >
                  Hapus Filter
                </button>
              </div>
            )}

            {/* Scrollable TaskCard List & Friendly Mascot Empty/Celebration State */}
            <div className="flex-1 overflow-y-auto px-5 pt-3 pb-28 space-y-3">
              {allTasksCompleted && activeFilterTab === 'Semua' && (
                <div
                  className={`p-4 rounded-3xl border flex items-center gap-3.5 ${
                    isDarkMode
                      ? 'bg-[#1F2928] border-[#2A9D8F]/40'
                      : 'bg-[#E6F4F1] border-[#BFE3DC]'
                  }`}
                >
                  <StudentMascotAvatar size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-[#1E7A68] dark:text-[#34D399]">
                      Semua tugas kuliah sudah tuntas. Waktunya istirahat!
                    </p>
                    <p
                      className={`text-[11px] mt-0.5 ${
                        isDarkMode ? 'text-[#CBD5E1]' : 'text-[#3D3830]'
                      }`}
                    >
                      Seluruh {taskMetrics.total} tugas Semester 5 telah selesai dikerjakan.
                    </p>
                  </div>
                </div>
              )}

              {filteredTasks.length > 0 ? (
                filteredTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onToggleStatus={handleToggleStatus}
                    onDeleteTask={handleDeleteTask}
                    isDarkMode={isDarkMode}
                  />
                ))
              ) : (
                <div
                  className={`py-8 px-5 text-center rounded-3xl border ${
                    isDarkMode
                      ? 'border-[#323A48] bg-[#232934]/50'
                      : 'border-[#EFE8DC] bg-white shadow-xs'
                  }`}
                >
                  <CelebrationMascotIllustration />
                  <h3 className="mt-3 text-[15px] font-bold leading-snug max-w-[260px] mx-auto">
                    Semua tugas kuliah sudah tuntas. Waktunya istirahat!
                  </h3>
                  <p
                    className={`text-xs mt-1.5 max-w-[250px] mx-auto leading-relaxed ${
                      isDarkMode ? 'text-[#94A3B8]' : 'text-[#6E6658]'
                    }`}
                  >
                    {searchQuery.trim() !== ''
                      ? `Tidak ada tugas untuk pencarian "${searchQuery}".`
                      : 'Tidak ada tugas yang tertunda pada daftar ini.'}
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
                            : 'bg-[#F4EFE6] text-[#1E1B18]'
                        }`}
                      >
                        Lihat Semua Tugas
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleOpenAddSheet()}
                      className="min-h-[44px] px-4 rounded-2xl bg-[#EC6B56] hover:bg-[#D95540] text-xs font-bold text-white transition-colors"
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
              className="absolute right-5 bottom-22 z-30 w-14 h-14 min-w-[56px] min-h-[56px] rounded-full bg-[#EC6B56] hover:bg-[#D95540] text-white shadow-lg flex items-center justify-center transition-transform active:scale-95"
            >
              <Plus className="w-6 h-6 stroke-[2.5]" aria-hidden="true" />
            </button>
          </section>
        )}

        {/* Tab 2: Mata Kuliah (Visual Course Directory) */}
        {bottomTab === 'matakuliah' && (
          <section
            aria-label="Direktori Mata Kuliah Semester 5"
            className="flex-1 flex flex-col min-h-0 overflow-hidden"
          >
            <header className="px-5 pt-4 pb-3 flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold tracking-tight">
                  Mata Kuliah
                </h1>
                <p
                  className={`text-xs mt-0.5 ${
                    isDarkMode ? 'text-[#94A3B8]' : 'text-[#6E6658]'
                  }`}
                >
                  {STUDENT_METADATA.semester} · {STUDENT_METADATA.classGroup} · 15 SKS
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleOpenAddSheet()}
                className="min-h-[44px] px-3.5 rounded-2xl bg-[#EC6B56] hover:bg-[#D95540] text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-4 h-4" aria-hidden="true" />
                <span>Tugas Baru</span>
              </button>
            </header>

            <div className="flex-1 overflow-y-auto px-5 pt-1 pb-28 space-y-3.5">
              {COURSE_DIRECTORY.map((course) => {
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
                    className={`rounded-3xl border p-4 transition-all ${
                      isDarkMode
                        ? 'bg-[#232934] border-[#323A48]'
                        : 'shadow-xs'
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      <div
                        style={{ backgroundColor: course.iconBg }}
                        className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-xs"
                      >
                        {renderCourseVectorIcon(course.iconKey)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div
                          className={`flex items-center gap-1.5 text-xs font-semibold ${
                            isDarkMode ? 'text-[#94A3B8]' : 'text-[#5C5549]'
                          }`}
                        >
                          <span className="font-mono">{course.code}</span>
                          <span aria-hidden="true">·</span>
                          <span>{course.credits} SKS</span>
                          <span aria-hidden="true">·</span>
                          <span className="truncate">{course.room}</span>
                        </div>

                        <h2
                          className={`mt-0.5 text-[16px] font-bold leading-snug ${
                            isDarkMode ? 'text-white' : 'text-[#1E1B18]'
                          }`}
                        >
                          {course.name}
                        </h2>
                      </div>
                    </div>

                    <div
                      className={`mt-3 rounded-2xl p-3 space-y-1.5 text-xs ${
                        isDarkMode
                          ? 'bg-[#1A1F28] text-[#CBD5E1]'
                          : 'bg-white/75 text-[#3D3830]'
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

                    <div className="mt-3 flex items-center justify-between gap-2">
                      <div className="text-xs font-bold">
                        <span
                          style={{
                            color: isDarkMode ? '#F8FAFC' : course.accentColor,
                          }}
                        >
                          {activeCourseTasks} Tugas Aktif
                        </span>
                        <span
                          className={`ml-1.5 font-normal ${
                            isDarkMode ? 'text-[#94A3B8]' : 'text-[#5C5549]'
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
                              ? 'bg-[#1A1F28] text-white hover:bg-[#2E3440]'
                              : 'bg-white/80 text-[#1E1B18] hover:bg-white'
                          }`}
                        >
                          <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Tambah</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCourseFilter(course.name);
                            setActiveFilterTab('Semua');
                            setBottomTab('tugas');
                          }}
                          className="min-h-[44px] px-3.5 rounded-2xl bg-[#1E1B18] hover:bg-[#332E27] text-white text-xs font-bold flex items-center gap-1 transition-colors"
                        >
                          <span>Lihat Tugas</span>
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

        {/* Tab 3: Progres (Academic Analytics and Badges) */}
        {bottomTab === 'progres' && (
          <section
            aria-label="Progres Akademik dan Pencapaian"
            className="flex-1 flex flex-col min-h-0 overflow-hidden"
          >
            <header className="px-5 pt-4 pb-3 flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold tracking-tight">
                  Progres Belajar
                </h1>
                <p
                  className={`text-xs mt-0.5 ${
                    isDarkMode ? 'text-[#94A3B8]' : 'text-[#6E6658]'
                  }`}
                >
                  Analitik penyelesaian tugas Semester 5
                </p>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-[#FFEAE6] flex items-center justify-center">
                <Flame
                  className="w-5 h-5 fill-[#EC6B56] text-[#EC6B56]"
                  aria-hidden="true"
                />
              </div>
            </header>

            <div className="flex-1 overflow-y-auto px-5 pt-1 pb-28 space-y-4">
              {/* Warm Coral Streak Banner */}
              <div className="rounded-3xl bg-[#EC6B56] text-white p-4.5 flex items-center gap-4 shadow-sm">
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                  <Flame
                    className="w-6 h-6 fill-white text-white"
                    aria-hidden="true"
                  />
                </div>
                <div>
                  <h2 className="text-base font-bold tracking-tight">
                    {STUDENT_METADATA.streakDays} Hari Aktif Berturut-turut!
                  </h2>
                  <p className="text-xs text-[#FFEAE6] mt-0.5 leading-relaxed">
                    Pertahankan ritme pengerjaan tugas kuliahmu minggu ini.
                  </p>
                </div>
              </div>

              {/* Circular Radial Progress Gauge + Metrics Breakdown (useMemo) */}
              <div
                className={`rounded-3xl border p-5 ${
                  isDarkMode
                    ? 'bg-[#232934] border-[#323A48]'
                    : 'bg-white border-[#EFE8DC] shadow-xs'
                }`}
              >
                <div className="flex items-center gap-5">
                  <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
                    <svg
                      className="w-28 h-28 -rotate-90"
                      viewBox="0 0 112 112"
                      aria-hidden="true"
                    >
                      <circle
                        cx="56"
                        cy="56"
                        r={radialRadius}
                        fill="none"
                        stroke={isDarkMode ? '#323A48' : '#F4EFE6'}
                        strokeWidth="10"
                      />
                      <circle
                        cx="56"
                        cy="56"
                        r={radialRadius}
                        fill="none"
                        stroke="#2A9D8F"
                        strokeWidth="10"
                        strokeLinecap="round"
                        strokeDasharray={radialCircumference}
                        strokeDashoffset={radialStrokeOffset}
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center">
                      <span className="text-xl font-bold font-mono tabular-nums">
                        {taskMetrics.completionRate}%
                      </span>
                      <span
                        className={`text-[10px] font-semibold ${
                          isDarkMode ? 'text-[#94A3B8]' : 'text-[#6E6658]'
                        }`}
                      >
                        Tuntas
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 space-y-2.5">
                    <div
                      className={`p-2.5 rounded-2xl flex items-center justify-between ${
                        isDarkMode ? 'bg-[#1A1F28]' : 'bg-[#FDFBF7]'
                      }`}
                    >
                      <span
                        className={`text-xs font-semibold ${
                          isDarkMode ? 'text-[#CBD5E1]' : 'text-[#5C5549]'
                        }`}
                      >
                        Total Tugas
                      </span>
                      <span className="text-sm font-bold font-mono tabular-nums">
                        {taskMetrics.total}
                      </span>
                    </div>

                    <div
                      className={`p-2.5 rounded-2xl flex items-center justify-between ${
                        isDarkMode ? 'bg-[#1A1F28]' : 'bg-[#E6F4F1]/70'
                      }`}
                    >
                      <span className="text-xs font-semibold text-[#1E7A68]">
                        Tugas Selesai
                      </span>
                      <span className="text-sm font-bold font-mono tabular-nums text-[#1E7A68]">
                        {taskMetrics.completed}
                      </span>
                    </div>

                    <div
                      className={`p-2.5 rounded-2xl flex items-center justify-between ${
                        isDarkMode ? 'bg-[#1A1F28]' : 'bg-[#FFF3E0]/80'
                      }`}
                    >
                      <span className="text-xs font-semibold text-[#C25E00]">
                        Tugas Tertunda
                      </span>
                      <span className="text-sm font-bold font-mono tabular-nums text-[#C25E00]">
                        {taskMetrics.pending}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Per-Subject Progress Breakdown */}
              <div
                className={`rounded-3xl border p-5 ${
                  isDarkMode
                    ? 'bg-[#232934] border-[#323A48]'
                    : 'bg-white border-[#EFE8DC] shadow-xs'
                }`}
              >
                <h3 className="text-sm font-bold mb-3.5">
                  Progres per Mata Kuliah
                </h3>
                <div className="space-y-3.5">
                  {COURSE_DIRECTORY.map((course) => {
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
                          className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                        >
                          {renderCourseVectorIcon(course.iconKey)}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="font-bold truncate">
                              {course.name}
                            </span>
                            <span className="font-mono tabular-nums font-semibold opacity-80">
                              {doneForCourse}/{totalForCourse} ({rate}%)
                            </span>
                          </div>
                          <div
                            className={`h-2 rounded-full overflow-hidden ${
                              isDarkMode ? 'bg-[#1A1F28]' : 'bg-[#F4EFE6]'
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

              {/* Academic Achievement Badges Shelf */}
              <div>
                <h3 className="text-sm font-bold mb-2.5 px-1">
                  Pencapaian Akademik
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {ACHIEVEMENT_BADGES.map((badge) => {
                    const isUnlocked =
                      badge.id === 'badge-semester'
                        ? taskMetrics.total > 0 && taskMetrics.pending === 0
                        : true;

                    return (
                      <div
                        key={badge.id}
                        className={`rounded-3xl border p-4 flex flex-col justify-between transition-opacity ${
                          isDarkMode
                            ? 'bg-[#232934] border-[#323A48]'
                            : 'bg-white border-[#EFE8DC] shadow-xs'
                        } ${isUnlocked ? 'opacity-100' : 'opacity-65'}`}
                      >
                        <div className="flex items-center justify-between mb-2.5">
                          <div
                            style={{ backgroundColor: badge.tintBg }}
                            className="w-10 h-10 rounded-2xl flex items-center justify-center"
                          >
                            {renderBadgeVectorIcon(
                              badge.iconKey,
                              badge.tintColor
                            )}
                          </div>
                          <span
                            className={`text-[11px] font-bold ${
                              isUnlocked ? 'text-[#1E7A68]' : 'text-[#8C8476]'
                            }`}
                          >
                            {isUnlocked ? 'Tercapai' : 'Proses'}
                          </span>
                        </div>

                        <div>
                          <h4 className="text-xs font-bold">{badge.title}</h4>
                          <p
                            className={`text-[11px] mt-0.5 leading-snug ${
                              isDarkMode ? 'text-[#94A3B8]' : 'text-[#6E6658]'
                            }`}
                          >
                            {badge.subtitle}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Tab 4: Profil (Student Identity and Settings) */}
        {bottomTab === 'profil' && (
          <section
            aria-label="Profil Mahasiswa dan Pengaturan"
            className="flex-1 flex flex-col min-h-0 overflow-hidden"
          >
            <header className="px-5 pt-4 pb-3 flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold tracking-tight">
                  Profil Mahasiswa
                </h1>
                <p
                  className={`text-xs mt-0.5 ${
                    isDarkMode ? 'text-[#94A3B8]' : 'text-[#6E6658]'
                  }`}
                >
                  Identitas akademik dan preferensi belajar
                </p>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto px-5 pt-1 pb-28 space-y-4">
              {/* Student Identity Card with Mascot Avatar */}
              <div
                className={`rounded-3xl border p-5 text-center ${
                  isDarkMode
                    ? 'bg-[#232934] border-[#323A48]'
                    : 'bg-white border-[#EFE8DC] shadow-xs'
                }`}
              >
                <div className="flex justify-center">
                  <StudentMascotAvatar size="lg" />
                </div>

                <h2 className="mt-3 text-lg font-bold tracking-tight">
                  {STUDENT_METADATA.name}
                </h2>
                <p className="text-xs font-mono tabular-nums font-semibold text-[#EC6B56] mt-0.5">
                  NIM {STUDENT_METADATA.nim}
                </p>
                <p
                  className={`text-xs mt-1 ${
                    isDarkMode ? 'text-[#94A3B8]' : 'text-[#5C5549]'
                  }`}
                >
                  {STUDENT_METADATA.classGroup} · {STUDENT_METADATA.semester} ·{' '}
                  {STUDENT_METADATA.program}
                </p>
                <p
                  className={`text-xs font-semibold mt-0.5 ${
                    isDarkMode ? 'text-[#CBD5E1]' : 'text-[#1E1B18]'
                  }`}
                >
                  {STUDENT_METADATA.institution}
                </p>

                {/* Academic Semester Stats Summary Row */}
                <div
                  className={`mt-4 pt-4 border-t grid grid-cols-3 ${
                    isDarkMode ? 'border-[#323A48]' : 'border-[#EFE8DC]'
                  }`}
                >
                  <div>
                    <span className="block text-base font-bold font-mono tabular-nums">
                      {COURSE_DIRECTORY.length}
                    </span>
                    <span
                      className={`text-[11px] ${
                        isDarkMode ? 'text-[#94A3B8]' : 'text-[#6E6658]'
                      }`}
                    >
                      Mata Kuliah
                    </span>
                  </div>
                  <div
                    className={`border-x ${
                      isDarkMode ? 'border-[#323A48]' : 'border-[#EFE8DC]'
                    }`}
                  >
                    <span className="block text-base font-bold font-mono tabular-nums">
                      {taskMetrics.completed}/{taskMetrics.total}
                    </span>
                    <span
                      className={`text-[11px] ${
                        isDarkMode ? 'text-[#94A3B8]' : 'text-[#6E6658]'
                      }`}
                    >
                      Tugas Selesai
                    </span>
                  </div>
                  <div>
                    <span className="block text-base font-bold font-mono tabular-nums">
                      {STUDENT_METADATA.streakDays}
                    </span>
                    <span
                      className={`text-[11px] ${
                        isDarkMode ? 'text-[#94A3B8]' : 'text-[#6E6658]'
                      }`}
                    >
                      Hari Aktif
                    </span>
                  </div>
                </div>
              </div>

              {/* Student-Focused Settings List */}
              <div
                className={`rounded-3xl border p-3 space-y-1 ${
                  isDarkMode
                    ? 'bg-[#232934] border-[#323A48]'
                    : 'bg-white border-[#EFE8DC] shadow-xs'
                }`}
              >
                {/* Setting 1: Pengingat Tugas */}
                <div className="flex items-center justify-between px-3 py-2 min-h-[52px]">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-2xl bg-[#FFEAE6] text-[#EC6B56] flex items-center justify-center shrink-0">
                      <Bell className="w-4 h-4" aria-hidden="true" />
                    </div>
                    <div>
                      <span className="text-sm font-bold block">
                        Pengingat Tugas
                      </span>
                      <span
                        className={`text-[11px] block ${
                          isDarkMode ? 'text-[#94A3B8]' : 'text-[#6E6658]'
                        }`}
                      >
                        {reminderEnabled
                          ? 'Notifikasi H-1 sebelum tenggat aktif'
                          : 'Notifikasi pengingat dinonaktifkan'}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={reminderEnabled}
                    aria-label="Aktifkan atau nonaktifkan pengingat tugas"
                    onClick={() => {
                      const next = !reminderEnabled;
                      setReminderEnabled(next);
                      showToastMessage(
                        next
                          ? 'Pengingat tugas diaktifkan.'
                          : 'Pengingat tugas dinonaktifkan.'
                      );
                    }}
                    className="min-w-[48px] min-h-[44px] flex items-center justify-end"
                  >
                    <span
                      className={`w-12 h-7 rounded-full p-1 transition-colors flex items-center ${
                        reminderEnabled
                          ? 'bg-[#2A9D8F] justify-end'
                          : isDarkMode
                          ? 'bg-[#323A48] justify-start'
                          : 'bg-[#DDD5C7] justify-start'
                      }`}
                    >
                      <span className="w-5 h-5 rounded-full bg-white shadow-xs" />
                    </span>
                  </button>
                </div>

                {/* Setting 2: Sinkronisasi Google Calendar */}
                <div className="flex items-center justify-between px-3 py-2 min-h-[52px]">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-2xl bg-[#E6F4F1] text-[#1E7A68] flex items-center justify-center shrink-0">
                      <Calendar className="w-4 h-4" aria-hidden="true" />
                    </div>
                    <div>
                      <span className="text-sm font-bold block">
                        Sinkronisasi Google Calendar
                      </span>
                      <span
                        className={`text-[11px] block ${
                          isDarkMode ? 'text-[#94A3B8]' : 'text-[#6E6658]'
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
                          ? 'bg-[#2A9D8F] justify-end'
                          : isDarkMode
                          ? 'bg-[#323A48] justify-start'
                          : 'bg-[#DDD5C7] justify-start'
                      }`}
                    >
                      <span className="w-5 h-5 rounded-full bg-white shadow-xs" />
                    </span>
                  </button>
                </div>

                {/* Setting 3: Pembaruan SIAKAD Otomatis */}
                <div className="flex items-center justify-between px-3 py-2 min-h-[52px]">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-2xl bg-[#F3EEFF] text-[#6D28D9] flex items-center justify-center shrink-0">
                      <RefreshCw className="w-4 h-4" aria-hidden="true" />
                    </div>
                    <div>
                      <span className="text-sm font-bold block">
                        Pembaruan SIAKAD Otomatis
                      </span>
                      <span
                        className={`text-[11px] block ${
                          isDarkMode ? 'text-[#94A3B8]' : 'text-[#6E6658]'
                        }`}
                      >
                        {siakadAutoUpdate
                          ? 'Terhubung dengan portal akademik kampus'
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
                          ? 'bg-[#2A9D8F] justify-end'
                          : isDarkMode
                          ? 'bg-[#323A48] justify-start'
                          : 'bg-[#DDD5C7] justify-start'
                      }`}
                    >
                      <span className="w-5 h-5 rounded-full bg-white shadow-xs" />
                    </span>
                  </button>
                </div>

                {/* Setting 4: Mode Tampilan */}
                <div className="flex items-center justify-between px-3 py-2 min-h-[52px]">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-2xl bg-[#EAF2FF] text-[#2563EB] flex items-center justify-center shrink-0">
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
                          isDarkMode ? 'text-[#94A3B8]' : 'text-[#6E6658]'
                        }`}
                      >
                        {isDarkMode ? 'Mode Gelap Aktif' : 'Mode Hangat (Krem)'}
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
                          : 'Mode tampilan hangat diaktifkan.'
                      );
                    }}
                    className="min-w-[48px] min-h-[44px] flex items-center justify-end"
                  >
                    <span
                      className={`w-12 h-7 rounded-full p-1 transition-colors flex items-center ${
                        isDarkMode
                          ? 'bg-[#EC6B56] justify-end'
                          : 'bg-[#DDD5C7] justify-start'
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
                className="w-full min-h-[50px] rounded-3xl bg-[#EC6B56] hover:bg-[#D95540] text-white text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-colors"
              >
                <RotateCcw className="w-4 h-4" aria-hidden="true" />
                <span>Atur Ulang Data</span>
              </button>
            </div>
          </section>
        )}

        {/* Persistent 4-Tab Bottom Navigation Bar */}
        <nav
          aria-label="Navigasi Utama Aplikasi"
          className={`absolute bottom-3 left-4 right-4 z-30 rounded-[28px] border p-1.5 flex items-center justify-between shadow-lg transition-colors ${
            isDarkMode
              ? 'bg-[#1F242D]/95 border-[#323A48] backdrop-blur-md'
              : 'bg-white/95 border-[#EFE8DC] backdrop-blur-md'
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
                className={`min-h-[44px] min-w-[48px] px-3.5 rounded-[22px] flex items-center justify-center gap-1.5 text-xs font-bold transition-all duration-150 ${
                  isSelected
                    ? 'bg-[#EC6B56] text-white shadow-xs flex-1 max-w-[140px]'
                    : isDarkMode
                    ? 'text-[#94A3B8] hover:text-white'
                    : 'text-[#8C8476] hover:text-[#1E1B18]'
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
      </main>

      {/* Slide-Up Add Task Bottom Sheet Modal (with useRef auto-focus & quick date chips) */}
      <AddTaskSheet
        isOpen={isAddSheetOpen}
        onClose={() => setIsAddSheetOpen(false)}
        onAddTask={handleAddTask}
        titleInputRef={titleInputRef}
        initialCourse={preselectedCourseForAdd}
        isDarkMode={isDarkMode}
      />
    </div>
  );
}
