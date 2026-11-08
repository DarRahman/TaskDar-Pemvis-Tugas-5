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
  FileCode2,
  CheckSquare,
  Inbox,
  GraduationCap,
  BookMarked,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import {
  INITIAL_TASKS,
  STUDENT_METADATA,
  SEMESTER_5_COURSES,
  taskReducer,
} from './data/initialTasks';
import { TaskFilterTab, NewTaskPayload, TaskMetrics } from './types/task';
import { TaskCard } from './components/TaskCard';
import { AddTaskSheet } from './components/AddTaskSheet';
import { ExpoCodeDrawer } from './components/ExpoCodeDrawer';

const FILTER_TABS: readonly TaskFilterTab[] = [
  'Semua',
  'Belum Dikerjakan',
  'Selesai',
];

export default function App() {
  /*
   * Hook 7 (useReducer): Central state engine managing task list mutations
   * across ADD_TASK, DELETE_TASK, TOGGLE_STATUS, and RESET_TASKS.
   */
  const [tasks, dispatch] = useReducer(taskReducer, INITIAL_TASKS);

  /*
   * Hook 2 (useState): Manages controlled search keyword, active filter tab,
   * selected course filter, and modal sheet visibility.
   */
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<TaskFilterTab>('Semua');
  const [selectedCourse, setSelectedCourse] = useState<string>('Semua Mata Kuliah');
  const [isAddSheetOpen, setIsAddSheetOpen] = useState<boolean>(false);
  const [isCodeDrawerOpen, setIsCodeDrawerOpen] = useState<boolean>(false);

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
   * Hook 4 (useMemo): Computes derived task counts (total, pending, completed)
   * exclusively when the tasks state array mutates (FR-06).
   */
  const taskMetrics: TaskMetrics = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((task) => task.status === 'Selesai').length;
    const pending = total - completed;
    return { total, pending, completed };
  }, [tasks]);

  /*
   * Memoized filtering combining status tab, course selector, and real-time
   * keyword search across task title and course name.
   */
  const filteredTasks = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return tasks.filter((task) => {
      const matchesStatus =
        activeTab === 'Semua' ? true : task.status === activeTab;
      const matchesCourse =
        selectedCourse === 'Semua Mata Kuliah'
          ? true
          : task.course === selectedCourse;
      const matchesKeyword =
        query === '' ||
        task.title.toLowerCase().includes(query) ||
        task.course.toLowerCase().includes(query);

      return matchesStatus && matchesCourse && matchesKeyword;
    });
  }, [tasks, activeTab, selectedCourse, searchQuery]);

  /*
   * Hook 5 (useCallback): Preserves handler reference stability across renders
   * when delegating callbacks to child TaskCard components via Props.
   */
  const handleToggleStatus = useCallback((taskId: string) => {
    dispatch({ type: 'TOGGLE_STATUS', payload: taskId });
  }, []);

  const handleDeleteTask = useCallback((taskId: string) => {
    dispatch({ type: 'DELETE_TASK', payload: taskId });
  }, []);

  const handleAddTask = useCallback((payload: NewTaskPayload) => {
    dispatch({ type: 'ADD_TASK', payload });
  }, []);

  const handleResetTasks = useCallback(() => {
    dispatch({ type: 'RESET_TASKS' });
    setSearchQuery('');
    setActiveTab('Semua');
    setSelectedCourse('Semua Mata Kuliah');
  }, []);

  const handleOpenAddSheet = useCallback(() => {
    setIsAddSheetOpen(true);
    window.setTimeout(() => {
      titleInputRef.current?.focus();
    }, 60);
  }, []);

  return (
    <div className="min-h-screen bg-[#F5F5F3] lg:bg-[#1E5E4E] text-[#18181B] flex flex-col justify-between">
      {/* Main Responsive Workspace Container */}
      <main className="flex-1 w-full max-w-6xl mx-auto lg:py-8 lg:px-6 flex flex-col lg:flex-row items-stretch lg:items-start justify-center gap-8">
        {/* Left / Primary Column: Slothy-Benchmark Mobile Task Manager Viewport */}
        <section
          aria-label="Antarmuka Utama Tugas Kuliah"
          className="w-full max-w-[440px] mx-auto lg:mx-0 bg-[#F5F5F3] lg:rounded-[36px] lg:border-[8px] lg:border-[#18181B] lg:shadow-2xl flex flex-col min-h-screen lg:min-h-[812px] lg:max-h-[860px] relative overflow-hidden"
        >
          {/* Mobile Top Header */}
          <header className="px-5 pt-5 pb-3 bg-[#F5F5F3] flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-[#18181B] text-white flex items-center justify-center shrink-0">
                <CheckSquare className="w-4 h-4" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg font-bold tracking-tight text-[#18181B] truncate">
                  Tugas Kuliah
                </h1>
                <p className="text-xs text-[#52524E] truncate font-mono tabular-nums">
                  {STUDENT_METADATA.name} · {STUDENT_METADATA.nim}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => setIsCodeDrawerOpen(true)}
                title="Buka Kode React Native Expo (App.js)"
                aria-label="Buka Kode React Native Expo App.js"
                className="min-w-[44px] min-h-[44px] px-2.5 rounded-xl bg-[#EAE7E1] hover:bg-[#DFDCD4] text-[#18181B] flex items-center justify-center gap-1.5 text-xs font-semibold transition-colors"
              >
                <FileCode2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span className="hidden sm:inline">App.js</span>
              </button>

              <button
                type="button"
                onClick={handleResetTasks}
                title="Atur Ulang ke 5 Tugas Awal Semester 5"
                aria-label="Atur ulang daftar tugas ke data awal"
                className="min-w-[44px] min-h-[44px] rounded-xl bg-[#EAE7E1] hover:bg-[#DFDCD4] text-[#18181B] flex items-center justify-center transition-colors"
              >
                <RotateCcw className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </header>

          {/* Derived Task Metrics Summary Strip (useMemo) */}
          <div className="px-5 pb-3">
            <div
              aria-label="Ringkasan Jumlah Tugas"
              className="grid grid-cols-3 rounded-2xl bg-white border border-[#E4E2DD] py-3 px-2"
            >
              <div className="flex flex-col items-center justify-center border-r border-[#E4E2DD] px-2">
                <span className="text-lg font-bold font-mono tabular-nums text-[#18181B]">
                  {taskMetrics.total}
                </span>
                <span className="text-[11px] font-medium text-[#52524E] mt-0.5">
                  Total Tugas
                </span>
              </div>

              <div className="flex flex-col items-center justify-center border-r border-[#E4E2DD] px-2">
                <span className="text-lg font-bold font-mono tabular-nums text-[#854D0E]">
                  {taskMetrics.pending}
                </span>
                <span className="text-[11px] font-medium text-[#52524E] mt-0.5">
                  Belum Dikerjakan
                </span>
              </div>

              <div className="flex flex-col items-center justify-center px-2">
                <span className="text-lg font-bold font-mono tabular-nums text-[#1E5E4E]">
                  {taskMetrics.completed}
                </span>
                <span className="text-[11px] font-medium text-[#52524E] mt-0.5">
                  Selesai
                </span>
              </div>
            </div>
          </div>

          {/* Real-Time Keyword Search Bar (FR-05 + useEffect observer) */}
          <div className="px-5 pb-2">
            <div className="relative flex items-center bg-[#EAE7E1] rounded-2xl border border-transparent focus-within:border-[#18181B] focus-within:bg-white transition-colors">
              <Search
                className="w-4 h-4 text-[#64645E] ml-3.5 shrink-0 pointer-events-none"
                aria-hidden="true"
              />
              <input
                ref={searchInputRef}
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari judul tugas atau mata kuliah..."
                aria-label="Cari tugas berdasarkan judul atau mata kuliah"
                className="w-full min-h-[44px] pl-2.5 pr-11 py-2 bg-transparent text-sm text-[#18181B] placeholder:text-[#64645E] outline-none"
              />
              {searchQuery.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    searchInputRef.current?.focus();
                  }}
                  aria-label="Bersihkan kata kunci pencarian"
                  className="absolute right-1 min-w-[44px] min-h-[44px] flex items-center justify-center text-[#52524E] hover:text-[#18181B]"
                >
                  <X className="w-4 h-4" aria-hidden="true" />
                </button>
              )}
            </div>
          </div>

          {/* Slothy-Style Underlined Status Filter Tabs */}
          <nav
            aria-label="Filter Status Tugas"
            className="px-5 border-b border-[#E4E2DD] grid grid-cols-3"
          >
            {FILTER_TABS.map((tab) => {
              const isActive = activeTab === tab;
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
                  onClick={() => setActiveTab(tab)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`min-h-[44px] px-1 flex items-center justify-center gap-1.5 border-b-2 text-xs font-semibold transition-colors whitespace-nowrap ${
                    isActive
                      ? 'border-[#18181B] text-[#18181B]'
                      : 'border-transparent text-[#64645E] hover:text-[#18181B]'
                  }`}
                >
                  <span className="truncate">{tab}</span>
                  <span className="font-mono tabular-nums text-[11px] opacity-75">
                    ({count})
                  </span>
                </button>
              );
            })}
          </nav>

          {/* Active Course Filter Bar (when filtered from desktop sidebar) */}
          {selectedCourse !== 'Semua Mata Kuliah' && (
            <div className="px-5 pt-3 flex items-center justify-between text-xs text-[#484843]">
              <span className="truncate">
                Mata Kuliah: <strong className="text-[#18181B]">{selectedCourse}</strong>
              </span>
              <button
                type="button"
                onClick={() => setSelectedCourse('Semua Mata Kuliah')}
                className="min-h-[44px] px-2 font-semibold text-[#1E5E4E] hover:underline shrink-0"
              >
                Tampilkan Semua
              </button>
            </div>
          )}

          {/* Task List Container (FR-01) */}
          <div className="flex-1 overflow-y-auto px-5 pt-3.5 pb-24 space-y-3">
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggleStatus={handleToggleStatus}
                  onDeleteTask={handleDeleteTask}
                />
              ))
            ) : (
              <div className="py-14 px-4 text-center rounded-2xl border border-dashed border-[#D4D2CD] bg-white/60">
                <Inbox
                  className="w-8 h-8 text-[#64645E] mx-auto mb-2.5"
                  aria-hidden="true"
                />
                <p className="text-sm font-semibold text-[#18181B]">
                  Tidak ada tugas yang sesuai
                </p>
                <p className="text-xs text-[#52524E] mt-1 max-w-[260px] mx-auto leading-relaxed">
                  Tidak ditemukan tugas untuk filter atau kata kunci pencarian saat ini.
                </p>
                <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                  {(searchQuery !== '' ||
                    activeTab !== 'Semua' ||
                    selectedCourse !== 'Semua Mata Kuliah') && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setActiveTab('Semua');
                        setSelectedCourse('Semua Mata Kuliah');
                      }}
                      className="min-h-[44px] px-4 rounded-xl bg-[#EAE7E1] hover:bg-[#DFDCD4] text-xs font-semibold text-[#18181B] transition-colors"
                    >
                      Bersihkan Filter
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleOpenAddSheet}
                    className="min-h-[44px] px-4 rounded-xl bg-[#18181B] hover:bg-[#27272A] text-xs font-semibold text-white transition-colors"
                  >
                    Tambah Tugas Baru
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Floating Action Button (+) in Bottom-Right Natural Thumb Zone */}
          <div className="sticky lg:absolute bottom-5 right-5 ml-auto pr-5 lg:pr-0 pointer-events-none flex justify-end">
            <button
              type="button"
              onClick={handleOpenAddSheet}
              aria-label="Tambah tugas kuliah baru"
              title="Tambah Tugas Baru"
              className="pointer-events-auto w-14 h-14 min-w-[56px] min-h-[56px] rounded-full bg-[#18181B] hover:bg-[#27272A] text-white shadow-lg flex items-center justify-center transition-transform active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#18181B]"
            >
              <Plus className="w-6 h-6" aria-hidden="true" />
            </button>
          </div>
        </section>

        {/* Right Column (Desktop Companion): Coursework Context, Course Filter & Expo Code Export */}
        <aside
          aria-label="Informasi Akademik dan Navigasi Mata Kuliah"
          className="w-full max-w-[440px] lg:max-w-none lg:flex-1 mx-auto lg:mx-0 px-5 pb-8 lg:p-0 space-y-5"
        >
          {/* Academic Identity Card */}
          <div className="rounded-3xl bg-[#F5F5F3] border border-[#E4E2DD] p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-[#1E5E4E]">
                  <GraduationCap className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>{STUDENT_METADATA.institution}</span>
                </div>
                <h2 className="mt-1.5 text-xl font-bold tracking-tight text-[#18181B]">
                  {STUDENT_METADATA.coursework}
                </h2>
                <p className="mt-1 text-sm text-[#484843]">
                  Manajer Tugas Akademik Semester 5 dengan implementasi penuh React Native Hooks dan delegasi Props.
                </p>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-[#E4E2DD] grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[#64645E] block">Mahasiswa Pengembang</span>
                <span className="font-semibold text-[#18181B] mt-0.5 block">
                  {STUDENT_METADATA.name} (NIM: {STUDENT_METADATA.nim})
                </span>
              </div>
              <div>
                <span className="text-[#64645E] block">Kelas dan Program Studi</span>
                <span className="font-semibold text-[#18181B] mt-0.5 block">
                  {STUDENT_METADATA.program}
                </span>
              </div>
            </div>

            {/* Primary Actions on Desktop Companion */}
            <div className="mt-5 pt-4 border-t border-[#E4E2DD] flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={handleOpenAddSheet}
                className="min-h-[44px] px-4 rounded-xl bg-[#18181B] hover:bg-[#27272A] text-white text-xs font-semibold flex items-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" aria-hidden="true" />
                <span>Tambah Tugas Kuliah</span>
              </button>

              <button
                type="button"
                onClick={() => setIsCodeDrawerOpen(true)}
                className="min-h-[44px] px-4 rounded-xl bg-[#EAE7E1] hover:bg-[#DFDCD4] text-[#18181B] text-xs font-semibold flex items-center gap-2 transition-colors"
              >
                <FileCode2 className="w-4 h-4" aria-hidden="true" />
                <span>Lihat & Salin Kode Expo (App.js)</span>
              </button>

              <button
                type="button"
                onClick={handleResetTasks}
                className="min-h-[44px] px-3.5 rounded-xl bg-white border border-[#E4E2DD] hover:bg-[#EAE7E1] text-[#3F3F3B] text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Atur Ulang Data</span>
              </button>
            </div>
          </div>

          {/* Interactive Semester 5 Course Filter Card */}
          <div className="rounded-3xl bg-[#F5F5F3] border border-[#E4E2DD] p-6 shadow-sm">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <BookMarked className="w-4 h-4 text-[#18181B]" aria-hidden="true" />
                <h3 className="text-sm font-bold text-[#18181B]">
                  Filter Mata Kuliah Semester 5
                </h3>
              </div>
              <span className="text-xs font-mono tabular-nums text-[#52524E]">
                {SEMESTER_5_COURSES.length} Mata Kuliah
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSelectedCourse('Semua Mata Kuliah')}
                className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors ${
                  selectedCourse === 'Semua Mata Kuliah'
                    ? 'bg-[#18181B] text-white'
                    : 'bg-white border border-[#E4E2DD] text-[#3F3F3B] hover:bg-[#EAE7E1]'
                }`}
              >
                Semua Mata Kuliah ({tasks.length})
              </button>

              {SEMESTER_5_COURSES.map((courseName) => {
                const countForCourse = tasks.filter(
                  (t) => t.course === courseName
                ).length;
                const isSelected = selectedCourse === courseName;

                return (
                  <button
                    key={courseName}
                    type="button"
                    onClick={() =>
                      setSelectedCourse(
                        isSelected ? 'Semua Mata Kuliah' : courseName
                      )
                    }
                    className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-[#18181B] text-white'
                        : 'bg-white border border-[#E4E2DD] text-[#3F3F3B] hover:bg-[#EAE7E1]'
                    }`}
                  >
                    <span>{courseName}</span>
                    <span className="font-mono tabular-nums text-[11px] opacity-75">
                      ({countForCourse})
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* React Hooks Architecture Summary Card */}
          <div className="rounded-3xl bg-[#F5F5F3] border border-[#E4E2DD] p-6 shadow-sm">
            <h3 className="text-sm font-bold text-[#18181B] mb-3">
              Arsitektur 7 Komponen React Native Hooks & Props
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <div className="p-3 rounded-2xl bg-white border border-[#E4E2DD]">
                <div className="font-mono font-semibold text-[#18181B]">
                  1. Props (TaskCard)
                </div>
                <p className="text-[#52524E] mt-1 leading-relaxed">
                  Delegasi data tugas serta callback ubah status dan hapus ke komponen anak murni.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-white border border-[#E4E2DD]">
                <div className="font-mono font-semibold text-[#18181B]">
                  2. useState
                </div>
                <p className="text-[#52524E] mt-1 leading-relaxed">
                  Mengelola input formulir terkontrol, tab filter aktif, dan kata kunci pencarian.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-white border border-[#E4E2DD]">
                <div className="font-mono font-semibold text-[#18181B]">
                  3. useEffect ([searchQuery])
                </div>
                <p className="text-[#52524E] mt-1 leading-relaxed">
                  Memantau perubahan kata kunci pencarian secara real-time dan mencetak log ke konsol.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-white border border-[#E4E2DD]">
                <div className="font-mono font-semibold text-[#18181B]">
                  4. useMemo ([tasks])
                </div>
                <p className="text-[#52524E] mt-1 leading-relaxed">
                  Menghitung metrik total ({taskMetrics.total}), belum dikerjakan ({taskMetrics.pending}), dan selesai ({taskMetrics.completed}).
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-white border border-[#E4E2DD]">
                <div className="font-mono font-semibold text-[#18181B]">
                  5. useCallback
                </div>
                <p className="text-[#52524E] mt-1 leading-relaxed">
                  Memoisasi fungsi tambah, hapus, dan toggle status untuk menjaga stabilitas referensi.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-white border border-[#E4E2DD]">
                <div className="font-mono font-semibold text-[#18181B]">
                  6. useRef & 7. useReducer
                </div>
                <p className="text-[#52524E] mt-1 leading-relaxed">
                  Fokus otomatis pada input judul tugas dan mesin state ADD, DELETE, TOGGLE, RESET.
                </p>
              </div>
            </div>

            {/* Quick Status Bar */}
            <div className="mt-4 pt-3.5 border-t border-[#E4E2DD] flex flex-wrap items-center justify-between gap-2 text-xs text-[#52524E]">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#854D0E]" aria-hidden="true" />
                  <span>{taskMetrics.pending} Belum Dikerjakan</span>
                </span>
                <span aria-hidden="true">·</span>
                <span className="inline-flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#1E5E4E]" aria-hidden="true" />
                  <span>{taskMetrics.completed} Selesai</span>
                </span>
              </div>
              <span className="font-mono tabular-nums">
                Menampilkan {filteredTasks.length} dari {taskMetrics.total} tugas
              </span>
            </div>
          </div>
        </aside>
      </main>

      {/* Bottom Sheet Modal for Task Creation (FR-02 + useRef Focus) */}
      <AddTaskSheet
        isOpen={isAddSheetOpen}
        onClose={() => setIsAddSheetOpen(false)}
        onAddTask={handleAddTask}
        titleInputRef={titleInputRef}
      />

      {/* Standalone React Native Expo App.js Source Code Drawer */}
      <ExpoCodeDrawer
        isOpen={isCodeDrawerOpen}
        onClose={() => setIsCodeDrawerOpen(false)}
      />
    </div>
  );
}
