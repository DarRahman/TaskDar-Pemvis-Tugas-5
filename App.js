import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
  useReducer,
} from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Modal,
  Switch,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

const STUDENT_PROFILE = {
  name: 'Badar Rahman',
  shortName: 'Badar',
  nim: '14524303',
  classGroup: 'TI-1',
  semester: 'Semester 5',
  program: 'Teknik Informatika',
  institution: 'STIKOM Poltek Cirebon',
  streakDays: 6,
};

const SUBJECT_ICON_OPTIONS = [
  { key: 'code', label: 'Kode' },
  { key: 'cpu', label: 'Robotik' },
  { key: 'database', label: 'Basis Data' },
  { key: 'shield', label: 'Keamanan' },
  { key: 'terminal', label: 'Terminal' },
  { key: 'book-open', label: 'Teori' },
  { key: 'bar-chart-2', label: 'Analitik' },
  { key: 'layers', label: 'Arsitektur' },
  { key: 'globe', label: 'Jaringan' },
  { key: 'smartphone', label: 'Mobile' },
  { key: 'palette', label: 'Desain' },
  { key: 'briefcase', label: 'Manajemen' },
];

const BENTO_COLOR_THEMES = [
  {
    id: 'crimson',
    label: 'Merah STIKOM',
    pastelBg: '#FEE2E2',
    pastelBorder: '#FECACA',
    accentColor: '#C41E3A',
    iconBg: '#C41E3A',
  },
  {
    id: 'indigo',
    label: 'Indigo Tekno',
    pastelBg: '#EEF2FF',
    pastelBorder: '#C7D2FE',
    accentColor: '#4338CA',
    iconBg: '#4F46E5',
  },
  {
    id: 'amber',
    label: 'Oranye Sains',
    pastelBg: '#FEF3C7',
    pastelBorder: '#FDE68A',
    accentColor: '#B45309',
    iconBg: '#D97706',
  },
  {
    id: 'emerald',
    label: 'Hijau Siber',
    pastelBg: '#D1FAE5',
    pastelBorder: '#A7F3D0',
    accentColor: '#047857',
    iconBg: '#059669',
  },
  {
    id: 'cyan',
    label: 'Biru Sistem',
    pastelBg: '#CFFAFE',
    pastelBorder: '#A5F3FC',
    accentColor: '#0E7490',
    iconBg: '#0891B2',
  },
];

const INITIAL_COURSES = [
  {
    id: 'course-pemvis',
    code: 'TI361',
    name: 'Pemrograman Visual I',
    lecturer: 'Arie Susetio Utami, S.Kom., M.Kom.',
    credits: 3,
    schedule: 'Senin, 08:00 - 10:30 WIB',
    room: 'Lab Komputer 2',
    iconKey: 'code',
    pastelBg: '#FEE2E2',
    pastelBorder: '#FECACA',
    accentColor: '#C41E3A',
    iconBg: '#C41E3A',
  },
  {
    id: 'course-robotika',
    code: 'TI362',
    name: 'Robotika',
    lecturer: 'Hendra Kusuma, S.T., M.T.',
    credits: 3,
    schedule: 'Selasa, 10:30 - 13:00 WIB',
    room: 'Lab Mikrokontroler',
    iconKey: 'cpu',
    pastelBg: '#EEF2FF',
    pastelBorder: '#C7D2FE',
    accentColor: '#4338CA',
    iconBg: '#4F46E5',
  },
  {
    id: 'course-dwdm',
    code: 'TI363',
    name: 'Data Warehouse & Data Mining',
    lecturer: 'Dr. Rina Kurniawati, M.Kom.',
    credits: 3,
    schedule: 'Rabu, 08:00 - 10:30 WIB',
    room: 'Ruang Teori 304',
    iconKey: 'database',
    pastelBg: '#FEF3C7',
    pastelBorder: '#FDE68A',
    accentColor: '#B45309',
    iconBg: '#D97706',
  },
  {
    id: 'course-kij',
    code: 'TI364',
    name: 'Keamanan Informasi & Jaringan',
    lecturer: 'Budi Santoso, S.Kom., M.Cs.',
    credits: 3,
    schedule: 'Kamis, 13:00 - 15:30 WIB',
    room: 'Lab Jaringan Terpadu',
    iconKey: 'shield',
    pastelBg: '#D1FAE5',
    pastelBorder: '#A7F3D0',
    accentColor: '#047857',
    iconBg: '#059669',
  },
  {
    id: 'course-pbo',
    code: 'TI365',
    name: 'Pemodelan Berorientasi Objek',
    lecturer: 'Dewi Lestari, S.Kom., M.Kom.',
    credits: 3,
    schedule: 'Jumat, 08:30 - 11:00 WIB',
    room: 'Ruang Teori 202',
    iconKey: 'layers',
    pastelBg: '#CFFAFE',
    pastelBorder: '#A5F3FC',
    accentColor: '#0E7490',
    iconBg: '#0891B2',
  },
];

const INITIAL_TASKS = [
  {
    id: 'task-1',
    title: 'Tugas 5: Aplikasi Pencatat Tugas Mahasiswa',
    course: 'Pemrograman Visual I',
    courseCode: 'TI361',
    deadline: '08 Nov 2026',
    status: 'Belum Dikerjakan',
    description:
      'Merancang antarmuka aplikasi pencatat tugas kuliah mahasiswa beserta fitur pencarian, filter status, dan manajemen mata kuliah.',
  },
  {
    id: 'task-2',
    title: 'Simulasi Kinematika Lengan Robot 3-DOF',
    course: 'Robotika',
    courseCode: 'TI362',
    deadline: '12 Nov 2026',
    status: 'Belum Dikerjakan',
    description:
      'Menghitung matriks transformasi Denavit-Hartenberg serta memvalidasi sudut servo pada simulator ruang kerja tiga dimensi.',
  },
  {
    id: 'task-3',
    title: 'Eksplorasi Skema Bintang Gudang Data Akademik',
    course: 'Data Warehouse & Data Mining',
    courseCode: 'TI363',
    deadline: '15 Nov 2026',
    status: 'Selesai',
    description:
      'Menyusun tabel fakta nilai semester beserta tabel dimensi mahasiswa, mata kuliah, dosen, dan periode akademik.',
  },
  {
    id: 'task-4',
    title: 'Audit Konfigurasi Firewall & Analisis Paket Jaringan',
    course: 'Keamanan Informasi & Jaringan',
    courseCode: 'TI364',
    deadline: '18 Nov 2026',
    status: 'Belum Dikerjakan',
    description:
      'Menguji aturan penyaringan paket menggunakan simulasi topologi kampus serta menyusun laporan mitigasi celah port terbuka.',
  },
  {
    id: 'task-5',
    title: 'Perancangan Diagram Kelas & Urutan Sistem Akademik',
    course: 'Pemodelan Berorientasi Objek',
    courseCode: 'TI365',
    deadline: '21 Nov 2026',
    status: 'Selesai',
    description:
      'Membuat pemodelan class diagram dan sequence diagram untuk modul pengisian Kartu Rencana Studi mahasiswa.',
  },
];

const PODIUM_TROPHY_SHELF = [
  {
    rank: '01',
    title: 'Tepat Waktu',
    subtitle: 'Pengumpulan tugas sebelum tenggat',
    scoreLabel: '96 Poin',
    badgeBg: '#C41E3A',
    surfaceBg: '#FEE2E2',
    borderColor: '#FECACA',
    textColor: '#991B1B',
  },
  {
    rank: '02',
    title: 'Pejuang Praktikum',
    subtitle: 'Penyelesaian modul laboratorium TI-1',
    scoreLabel: '88 Poin',
    badgeBg: '#4F46E5',
    surfaceBg: '#EEF2FF',
    borderColor: '#C7D2FE',
    textColor: '#3730A3',
  },
  {
    rank: '03',
    title: 'Konsisten Semester',
    subtitle: 'Aktif belajar 6 hari berturut-turut',
    scoreLabel: '82 Poin',
    badgeBg: '#D97706',
    surfaceBg: '#FEF3C7',
    borderColor: '#FDE68A',
    textColor: '#92400E',
  },
];

const WEEKLY_CALENDAR_DAYS = [
  { dayShort: 'Sen', dateNumber: '03', fullDateLabel: '03 Nov 2026' },
  { dayShort: 'Sel', dateNumber: '04', fullDateLabel: '04 Nov 2026' },
  { dayShort: 'Rab', dateNumber: '05', fullDateLabel: '05 Nov 2026' },
  { dayShort: 'Kam', dateNumber: '06', fullDateLabel: '06 Nov 2026' },
  { dayShort: 'Jum', dateNumber: '07', fullDateLabel: '07 Nov 2026' },
  { dayShort: 'Sab', dateNumber: '08', fullDateLabel: '08 Nov 2026' },
  { dayShort: 'Min', dateNumber: '09', fullDateLabel: '09 Nov 2026' },
];

const QUICK_DEADLINE_CHIPS = [
  { label: 'Hari Ini', value: '08 Nov 2026' },
  { label: 'Besok', value: '09 Nov 2026' },
  { label: 'Senin Depan', value: '16 Nov 2026' },
];

const MONTH_OPTIONS = [
  { short: 'Okt', full: 'Oktober', days: 31, startOffset: 3 },
  { short: 'Nov', full: 'November', days: 30, startOffset: 6 },
  { short: 'Des', full: 'Desember', days: 31, startOffset: 1 },
];

/*
 * Hook 7 (useReducer): Central state reducer handling task list mutations
 * across ADD_TASK, DELETE_TASK, TOGGLE_STATUS, and RESET_TASKS.
 */
function taskReducer(state, action) {
  switch (action.type) {
    case 'ADD_TASK': {
      const newTask = {
        id: `task-${Date.now()}`,
        title: action.payload.title.trim(),
        course: action.payload.course.trim(),
        courseCode: action.payload.courseCode || 'TI36X',
        deadline: action.payload.deadline.trim(),
        status: 'Belum Dikerjakan',
        description: action.payload.description.trim(),
      };
      return [newTask, ...state];
    }
    case 'TOGGLE_STATUS': {
      return state.map((task) => {
        if (task.id !== action.payload) return task;
        const nextStatus =
          task.status === 'Selesai' ? 'Belum Dikerjakan' : 'Selesai';
        return { ...task, status: nextStatus };
      });
    }
    case 'DELETE_TASK': {
      return state.filter((task) => task.id !== action.payload);
    }
    case 'RESET_TASKS': {
      return INITIAL_TASKS;
    }
    default:
      return state;
  }
}

/*
 * Component 1 (Props): Standalone Bento TaskCard child component receiving task
 * data and action handlers via Props, featuring an expandable description accordion.
 */
const TaskCard = React.memo(function TaskCard({
  task,
  courses,
  onToggleStatus,
  onDeleteTask,
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isCompleted = task.status === 'Selesai';

  const matchedCourse =
    courses.find((c) => c.name.toLowerCase() === task.course.toLowerCase()) ||
    INITIAL_COURSES[0];

  return (
    <View
      style={[
        styles.taskCard,
        {
          backgroundColor: isCompleted ? '#F8FAFC' : matchedCourse.pastelBg,
          borderColor: isCompleted ? '#E2E8F0' : matchedCourse.pastelBorder,
        },
      ]}
    >
      <View style={styles.taskCardRow}>
        {/* Left: 48x48pt Rounded Container in Course Accent Color */}
        <View
          style={[
            styles.taskCourseIconBox,
            {
              backgroundColor: isCompleted ? '#10B981' : matchedCourse.iconBg,
            },
          ]}
        >
          <Feather
            name={matchedCourse.iconKey || 'book-open'}
            size={20}
            color="#FFFFFF"
          />
        </View>

        {/* Center: 1-Line Bold Title (Truncated), Course Name, and Deadline */}
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() => setIsExpanded((prev) => !prev)}
          style={styles.taskCenterContent}
        >
          <Text
            numberOfLines={1}
            style={[
              styles.taskTitleText,
              isCompleted && styles.taskTitleCompleted,
            ]}
          >
            {task.title}
          </Text>
          <Text
            numberOfLines={1}
            style={[
              styles.taskCourseSubtitle,
              {
                color: isCompleted ? '#64748B' : matchedCourse.accentColor,
              },
            ]}
          >
            {task.course}
          </Text>
          <View style={styles.taskMetaInline}>
            <View style={styles.deadlinePill}>
              <Feather name="calendar" size={11} color="#475569" />
              <Text style={styles.deadlinePillText}>{task.deadline}</Text>
            </View>
            <View style={styles.accordionTriggerPill}>
              <Text style={styles.accordionTriggerText}>
                {isExpanded ? 'Tutup' : 'Detail'}
              </Text>
              <Feather
                name={isExpanded ? 'chevron-up' : 'chevron-down'}
                size={12}
                color="#475569"
              />
            </View>
          </View>
        </TouchableOpacity>

        {/* Right: 44x44pt Touch Targets for Checkmark Toggle and Delete Button */}
        <View style={styles.taskActionsRight}>
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => onToggleStatus(task.id)}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: isCompleted }}
            style={[
              styles.iconTouchTarget,
              isCompleted ? styles.checkBtnCompleted : styles.checkBtnPending,
            ]}
          >
            <Feather
              name="check"
              size={18}
              color={isCompleted ? '#FFFFFF' : '#64748B'}
            />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => onDeleteTask(task.id)}
            accessibilityRole="button"
            style={[styles.iconTouchTarget, styles.deleteBtnSurface]}
          >
            <Feather name="trash-2" size={16} color="#C41E3A" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Expandable Accordion Description (Collapsed by Default) */}
      {isExpanded && (
        <View style={styles.accordionBody}>
          <View style={styles.accordionHeaderRow}>
            <Text
              style={[
                styles.accordionCodeText,
                { color: matchedCourse.accentColor },
              ]}
            >
              {task.courseCode} · {task.status}
            </Text>
            <Text style={styles.accordionDeadlineText}>
              Tenggat: {task.deadline}
            </Text>
          </View>
          <Text style={styles.accordionDescText}>{task.description}</Text>
        </View>
      )}
    </View>
  );
});

export default function App() {
  const [tasks, dispatch] = useReducer(taskReducer, INITIAL_TASKS);

  const [isSplashOpen, setIsSplashOpen] = useState(true);
  const [courses, setCourses] = useState(INITIAL_COURSES);
  const [bottomTab, setBottomTab] = useState('tugas');
  const [selectedDayDate, setSelectedDayDate] = useState('08 Nov 2026');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilterTab, setActiveFilterTab] = useState('Semua');
  const [selectedCourseFilter, setSelectedCourseFilter] = useState('Semua');

  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [isAddCourseModalOpen, setIsAddCourseModalOpen] = useState(false);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [calendarModalMode, setCalendarModalMode] = useState('view');
  const [calendarMonthIdx, setCalendarMonthIdx] = useState(1);

  const [newTitle, setNewTitle] = useState('');
  const [newCourse, setNewCourse] = useState(INITIAL_COURSES[0].name);
  const [newDeadline, setNewDeadline] = useState('08 Nov 2026');
  const [newDescription, setNewDescription] = useState('');
  const [taskFormError, setTaskFormError] = useState('');

  const [courseNameInput, setCourseNameInput] = useState('');
  const [courseLecturerInput, setCourseLecturerInput] = useState('');
  const [courseCreditsInput, setCourseCreditsInput] = useState(3);
  const [courseScheduleInput, setCourseScheduleInput] = useState('');
  const [courseRoomInput, setCourseRoomInput] = useState('');
  const [courseIconKeyInput, setCourseIconKeyInput] = useState('code');
  const [courseThemeIdInput, setCourseThemeIdInput] = useState('crimson');
  const [courseFormError, setCourseFormError] = useState('');

  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [googleCalendarSync, setGoogleCalendarSync] = useState(true);
  const [siakadAutoUpdate, setSiakadAutoUpdate] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);

  /*
   * Hook 6 (useRef): Programmatically focuses the task title TextInput inside
   * the creation modal upon opening or after form submission.
   */
  const titleInputRef = useRef(null);

  /*
   * Hook 3 (useEffect): Observes searchQuery transitions and outputs
   * debugging logs to the console terminal (FR-05).
   */
  useEffect(() => {
    const trimmed = searchQuery.trim();
    console.log(
      '[Pemrograman Visual I - TI361] Kata kunci pencarian aktif:',
      trimmed === '' ? '(kosong)' : trimmed
    );
  }, [searchQuery]);

  /*
   * Hook 4 (useMemo): Reactive task metrics derived from the task list (FR-06).
   */
  const taskMetrics = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((item) => item.status === 'Selesai').length;
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
    const keyword = searchQuery.trim().toLowerCase();
    return tasks.filter((item) => {
      const matchesTab =
        activeFilterTab === 'Semua' ? true : item.status === activeFilterTab;
      const matchesCourse =
        selectedCourseFilter === 'Semua'
          ? true
          : item.course.toLowerCase() === selectedCourseFilter.toLowerCase();
      const matchesKeyword =
        keyword === '' ||
        item.title.toLowerCase().includes(keyword) ||
        item.course.toLowerCase().includes(keyword);
      return matchesTab && matchesCourse && matchesKeyword;
    });
  }, [tasks, activeFilterTab, selectedCourseFilter, searchQuery]);

  /*
   * Hook 5 (useCallback): Stable callback references passed down to TaskCard.
   */
  const handleToggleStatus = useCallback((taskId) => {
    dispatch({ type: 'TOGGLE_STATUS', payload: taskId });
  }, []);

  const handleDeleteTask = useCallback((taskId) => {
    dispatch({ type: 'DELETE_TASK', payload: taskId });
  }, []);

  const handleResetAllData = useCallback(() => {
    dispatch({ type: 'RESET_TASKS' });
    setCourses(INITIAL_COURSES);
    setSearchQuery('');
    setActiveFilterTab('Semua');
    setSelectedCourseFilter('Semua');
    setSelectedDayDate('08 Nov 2026');
  }, []);

  const handleOpenAddTask = useCallback((defaultCourseName) => {
    if (defaultCourseName) {
      setNewCourse(defaultCourseName);
    }
    setTaskFormError('');
    setIsAddTaskModalOpen(true);
    setTimeout(() => {
      if (titleInputRef.current) {
        titleInputRef.current.focus();
      }
    }, 100);
  }, []);

  const handleSubmitNewTask = useCallback(() => {
    if (!newTitle.trim()) {
      setTaskFormError('Judul tugas wajib diisi.');
      if (titleInputRef.current) titleInputRef.current.focus();
      return;
    }
    const selectedCourseObj =
      courses.find((c) => c.name === newCourse) || courses[0];

    dispatch({
      type: 'ADD_TASK',
      payload: {
        title: newTitle,
        course: selectedCourseObj.name,
        courseCode: selectedCourseObj.code,
        deadline: newDeadline.trim() || '25 Nov 2026',
        description:
          newDescription.trim() ||
          `Tugas mandiri mata kuliah ${selectedCourseObj.name}.`,
      },
    });

    setNewTitle('');
    setNewDeadline('08 Nov 2026');
    setNewDescription('');
    setTaskFormError('');
    setIsAddTaskModalOpen(false);
  }, [newTitle, newCourse, newDeadline, newDescription, courses]);

  const handleSubmitNewCourse = useCallback(() => {
    if (!courseNameInput.trim()) {
      setCourseFormError('Nama mata kuliah wajib diisi.');
      return;
    }
    const chosenTheme =
      BENTO_COLOR_THEMES.find((t) => t.id === courseThemeIdInput) ||
      BENTO_COLOR_THEMES[0];
    const nextCode = `TI${361 + courses.length}`;
    const createdCourse = {
      id: `course-${Date.now()}`,
      code: nextCode,
      name: courseNameInput.trim(),
      lecturer: courseLecturerInput.trim() || 'Dosen Pengampu STIKOM',
      credits: courseCreditsInput,
      schedule: courseScheduleInput.trim() || 'Senin, 13:00 - 15:30 WIB',
      room: courseRoomInput.trim() || 'Ruang Teori 301',
      iconKey: courseIconKeyInput,
      pastelBg: chosenTheme.pastelBg,
      pastelBorder: chosenTheme.pastelBorder,
      accentColor: chosenTheme.accentColor,
      iconBg: chosenTheme.iconBg,
    };

    setCourses((prev) => [...prev, createdCourse]);
    setCourseNameInput('');
    setCourseLecturerInput('');
    setCourseScheduleInput('');
    setCourseRoomInput('');
    setCourseIconKeyInput('code');
    setCourseFormError('');
    setIsAddCourseModalOpen(false);
  }, [
    courseNameInput,
    courseLecturerInput,
    courseCreditsInput,
    courseScheduleInput,
    courseRoomInput,
    courseIconKeyInput,
    courseThemeIdInput,
    courses.length,
  ]);

  const currentMonthMeta = MONTH_OPTIONS[calendarMonthIdx];
  const monthDaysArray = Array.from(
    { length: currentMonthMeta.days },
    (_, idx) => idx + 1
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      {/* TAB 1: TUGAS */}
      {bottomTab === 'tugas' && (
        <View style={styles.screenContainer}>
          {/* Prominent Student Hero Card (STIKOM Crimson Red & White) */}
          <View style={styles.heroCardCrimson}>
            <View style={styles.heroTopRow}>
              <View style={styles.mascotAvatarCircle}>
                <Feather name="smile" size={24} color="#C41E3A" />
              </View>
              <View style={styles.heroTextCol}>
                <View style={styles.heroCampusPill}>
                  <Text style={styles.heroCampusPillText}>
                    STIKOM Poltek Cirebon · TI-1
                  </Text>
                </View>
                <Text style={styles.heroGreetingTitle}>
                  Semangat Belajar, {STUDENT_PROFILE.shortName}!
                </Text>
                <Text style={styles.heroGreetingSub}>
                  {taskMetrics.pending > 0
                    ? `${taskMetrics.pending} tugas menunggu diselesaikan`
                    : 'Semua tugas minggu ini sudah tuntas!'}
                </Text>
              </View>
            </View>

            <View style={styles.heroBottomRow}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => setBottomTab('progres')}
                style={styles.heroProgressPill}
              >
                <Text style={styles.heroProgressBadgeText}>
                  {taskMetrics.completionRate}%
                </Text>
                <Text style={styles.heroProgressLabel}>Target Semester 5</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => setBottomTab('progres')}
                style={styles.heroStreakWhitePill}
              >
                <Feather name="zap" size={14} color="#C41E3A" />
                <Text style={styles.heroStreakWhiteText}>
                  {STUDENT_PROFILE.streakDays} Hari Aktif
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Weekly Strip Header + Full Month Calendar Modal Button */}
          <View style={styles.calendarHeaderRow}>
            <Text style={styles.calendarHeaderLabel}>
              Jadwal Minggu Ini ({selectedDayDate})
            </Text>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                setCalendarModalMode('view');
                setIsCalendarModalOpen(true);
              }}
              style={styles.openMonthCalendarBtn}
            >
              <Feather name="calendar" size={13} color="#C41E3A" />
              <Text style={styles.openMonthCalendarBtnText}>
                Kalender Bulan
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.weeklyStripRow}>
            {WEEKLY_CALENDAR_DAYS.map((dayItem) => {
              const isSelected = selectedDayDate === dayItem.fullDateLabel;
              const hasTaskOnDay = tasks.some(
                (t) => t.deadline === dayItem.fullDateLabel
              );
              return (
                <TouchableOpacity
                  key={dayItem.fullDateLabel}
                  activeOpacity={0.8}
                  onPress={() => setSelectedDayDate(dayItem.fullDateLabel)}
                  style={[
                    styles.weeklyDayCell,
                    isSelected && styles.weeklyDayCellActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.weeklyDayShort,
                      isSelected && styles.weeklyDayTextActive,
                    ]}
                  >
                    {dayItem.dayShort}
                  </Text>
                  <Text
                    style={[
                      styles.weeklyDayNumber,
                      isSelected && styles.weeklyDayTextActive,
                    ]}
                  >
                    {dayItem.dateNumber}
                  </Text>
                  <View
                    style={[
                      styles.weeklyDayDot,
                      hasTaskOnDay && {
                        backgroundColor: isSelected ? '#FFFFFF' : '#C41E3A',
                      },
                    ]}
                  />
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Search Bar */}
          <View style={styles.searchBarBox}>
            <Feather name="search" size={16} color="#64748B" />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Cari judul tugas atau mata kuliah..."
              placeholderTextColor="#94A3B8"
              style={styles.searchInput}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery('')}
                style={styles.clearSearchBtn}
              >
                <Feather name="x" size={16} color="#64748B" />
              </TouchableOpacity>
            )}
          </View>

          {/* Filter Tabs */}
          <View style={styles.filterTabsRow}>
            {['Semua', 'Belum Dikerjakan', 'Selesai'].map((tab) => {
              const isActive = activeFilterTab === tab;
              const count =
                tab === 'Semua'
                  ? taskMetrics.total
                  : tab === 'Belum Dikerjakan'
                  ? taskMetrics.pending
                  : taskMetrics.completed;
              return (
                <TouchableOpacity
                  key={tab}
                  onPress={() => setActiveFilterTab(tab)}
                  style={[
                    styles.filterTabBtn,
                    isActive && styles.filterTabBtnActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.filterTabText,
                      isActive && styles.filterTabTextActive,
                    ]}
                  >
                    {tab} ({count})
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Task FlatList */}
          <FlatList
            data={filteredTasks}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContentContainer}
            renderItem={({ item }) => (
              <TaskCard
                task={item}
                courses={courses}
                onToggleStatus={handleToggleStatus}
                onDeleteTask={handleDeleteTask}
              />
            )}
            ListEmptyComponent={
              <View style={styles.emptyStateBox}>
                <View style={styles.emptyStateMascotBadge}>
                  <Feather name="award" size={32} color="#C41E3A" />
                </View>
                <Text style={styles.emptyStateTitle}>
                  Semua tugas kuliah sudah tuntas! Waktunya istirahat.
                </Text>
                <Text style={styles.emptyStateSubtitle}>
                  Tidak ada tugas yang menunggu pada tampilan ini.
                </Text>
              </View>
            }
          />

          {/* Floating Action Button */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => handleOpenAddTask()}
            style={styles.fabCrimson}
          >
            <Feather name="plus" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      )}

      {/* TAB 2: MATA KULIAH */}
      {bottomTab === 'matakuliah' && (
        <ScrollView contentContainerStyle={styles.scrollTabContainer}>
          <View style={styles.tabHeaderRow}>
            <View>
              <Text style={styles.tabHeaderTitle}>Mata Kuliah</Text>
              <Text style={styles.tabHeaderSub}>
                {courses.length} Matkul · {totalCredits} SKS Semester 5
              </Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setIsAddCourseModalOpen(true)}
              style={styles.addCourseTopBtn}
            >
              <Feather name="plus" size={15} color="#FFFFFF" />
              <Text style={styles.addCourseTopBtnText}>Tambah Matkul</Text>
            </TouchableOpacity>
          </View>

          {courses.map((course) => {
            const activeCount = tasks.filter(
              (t) =>
                t.course.toLowerCase() === course.name.toLowerCase() &&
                t.status === 'Belum Dikerjakan'
            ).length;

            return (
              <View
                key={course.id}
                style={[
                  styles.courseBentoCard,
                  {
                    backgroundColor: course.pastelBg,
                    borderColor: course.pastelBorder,
                  },
                ]}
              >
                <View style={styles.courseTopRow}>
                  <View
                    style={[
                      styles.courseIconBadge,
                      { backgroundColor: course.iconBg },
                    ]}
                  >
                    <Feather
                      name={course.iconKey || 'book-open'}
                      size={22}
                      color="#FFFFFF"
                    />
                  </View>
                  <View style={styles.courseTitleWrap}>
                    <Text
                      style={[
                        styles.courseCodeLabel,
                        { color: course.accentColor },
                      ]}
                    >
                      {course.code}
                    </Text>
                    <Text style={styles.courseNameTitle}>{course.name}</Text>
                  </View>
                  <View
                    style={[
                      styles.sksPill,
                      { backgroundColor: course.iconBg },
                    ]}
                  >
                    <Text style={styles.sksPillText}>{course.credits} SKS</Text>
                  </View>
                </View>

                <View style={styles.courseInfoSubBox}>
                  <Text style={styles.courseInfoLine}>
                    Dosen: {course.lecturer}
                  </Text>
                  <Text style={styles.courseInfoLine}>
                    Jadwal: {course.schedule}
                  </Text>
                  <Text style={styles.courseInfoLine}>
                    Ruangan: {course.room}
                  </Text>
                </View>

                <View style={styles.courseFooterRow}>
                  <Text
                    style={[
                      styles.courseActiveTasksText,
                      { color: course.accentColor },
                    ]}
                  >
                    {activeCount} Tugas Aktif
                  </Text>
                  <View style={styles.courseFooterButtons}>
                    <TouchableOpacity
                      onPress={() => handleOpenAddTask(course.name)}
                      style={styles.courseAddTaskBtn}
                    >
                      <Feather name="plus" size={13} color="#0F172A" />
                      <Text style={styles.courseAddTaskBtnText}>Tugas</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        setSelectedCourseFilter(course.name);
                        setActiveFilterTab('Semua');
                        setBottomTab('tugas');
                      }}
                      style={[
                        styles.courseOpenTasksBtn,
                        { backgroundColor: course.iconBg },
                      ]}
                    >
                      <Text style={styles.courseOpenTasksBtnText}>Buka</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}

      {/* TAB 3: PROGRES */}
      {bottomTab === 'progres' && (
        <ScrollView contentContainerStyle={styles.scrollTabContainer}>
          <Text style={styles.tabHeaderTitle}>Progres & Statistik</Text>
          <Text style={styles.tabHeaderSub}>
            Analitik capaian belajar Semester 5
          </Text>

          {/* 3 Colorful Stat Tiles */}
          <View style={styles.bentoMetricsGrid}>
            <View
              style={[
                styles.bentoMetricTile,
                { backgroundColor: '#EEF2FF', borderColor: '#C7D2FE' },
              ]}
            >
              <Text style={[styles.bentoMetricLabel, { color: '#4338CA' }]}>
                Total Tugas
              </Text>
              <Text style={[styles.bentoMetricValue, { color: '#312E81' }]}>
                {taskMetrics.total}
              </Text>
            </View>

            <View
              style={[
                styles.bentoMetricTile,
                { backgroundColor: '#D1FAE5', borderColor: '#A7F3D0' },
              ]}
            >
              <Text style={[styles.bentoMetricLabel, { color: '#047857' }]}>
                Tugas Selesai
              </Text>
              <Text style={[styles.bentoMetricValue, { color: '#065F46' }]}>
                {taskMetrics.completed}
              </Text>
            </View>

            <View
              style={[
                styles.bentoMetricTile,
                { backgroundColor: '#FEE2E2', borderColor: '#FECACA' },
              ]}
            >
              <Text style={[styles.bentoMetricLabel, { color: '#BE123C' }]}>
                Tugas Menunggu
              </Text>
              <Text style={[styles.bentoMetricValue, { color: '#9F1239' }]}>
                {taskMetrics.pending}
              </Text>
            </View>
          </View>

          {/* Circular Radial Completion Gauge Card */}
          <View style={styles.radialScoreCard}>
            <View style={styles.radialCircleBadge}>
              <Text style={styles.radialPercentText}>
                {taskMetrics.completionRate}%
              </Text>
              <Text style={styles.radialSubText}>Tuntas</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.radialCardOverline}>SKOR KETUNTASAN</Text>
              <Text style={styles.radialCardTitle}>
                Performa Akademik Semester 5
              </Text>
              <Text style={styles.radialCardDesc}>
                {taskMetrics.completed} dari {taskMetrics.total} tugas telah
                diselesaikan tepat waktu.
              </Text>
            </View>
          </View>

          {/* Olympiad Podium Trophy Shelf (01, 02, 03) */}
          <View style={styles.podiumShelfCard}>
            <Text style={styles.podiumShelfTitle}>
              Podium Pencapaian Semester
            </Text>
            {PODIUM_TROPHY_SHELF.map((podium) => (
              <View
                key={podium.rank}
                style={[
                  styles.podiumRowItem,
                  {
                    backgroundColor: podium.surfaceBg,
                    borderColor: podium.borderColor,
                  },
                ]}
              >
                <View
                  style={[
                    styles.podiumRankBadge,
                    { backgroundColor: podium.badgeBg },
                  ]}
                >
                  <Text style={styles.podiumRankBadgeText}>#{podium.rank}</Text>
                </View>
                <View style={styles.podiumTextCol}>
                  <Text style={styles.podiumItemTitle}>
                    {podium.rank} {podium.title}
                  </Text>
                  <Text style={styles.podiumItemSub}>{podium.subtitle}</Text>
                </View>
                <View style={styles.podiumScorePill}>
                  <Text
                    style={[
                      styles.podiumScorePillText,
                      { color: podium.textColor },
                    ]}
                  >
                    {podium.scoreLabel}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      )}

      {/* TAB 4: PROFIL */}
      {bottomTab === 'profil' && (
        <ScrollView contentContainerStyle={styles.scrollTabContainer}>
          <View style={styles.profileCard}>
            <View style={styles.profileBannerCrimson}>
              <Text style={styles.profileInstitutionText}>
                {STUDENT_PROFILE.institution}
              </Text>
            </View>
            <View style={styles.profileAvatarLarge}>
              <Feather name="user" size={28} color="#C41E3A" />
            </View>
            <Text style={styles.profileName}>{STUDENT_PROFILE.name}</Text>
            <Text style={styles.profileNim}>NIM {STUDENT_PROFILE.nim}</Text>
            <Text style={styles.profileProgram}>
              Kelas {STUDENT_PROFILE.classGroup} {STUDENT_PROFILE.semester} ·{' '}
              {STUDENT_PROFILE.program}
            </Text>

            {/* Academic Stats Bar: 15 SKS | 5 Mata Kuliah Aktif | Kehadiran 100% */}
            <View style={styles.profileStatsBar}>
              <View style={styles.profileStatCol}>
                <Text style={styles.profileStatVal}>{totalCredits} SKS</Text>
                <Text style={styles.profileStatLabel}>Beban Studi</Text>
              </View>
              <View style={styles.profileStatCol}>
                <Text style={[styles.profileStatVal, { color: '#C41E3A' }]}>
                  {courses.length} Matkul
                </Text>
                <Text style={styles.profileStatLabel}>Mata Kuliah Aktif</Text>
              </View>
              <View style={styles.profileStatCol}>
                <Text style={[styles.profileStatVal, { color: '#059669' }]}>
                  100%
                </Text>
                <Text style={styles.profileStatLabel}>Kehadiran</Text>
              </View>
            </View>
          </View>

          {/* Preview Welcome Splash Screen Button */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setIsSplashOpen(true)}
            style={styles.openSplashPreviewBtn}
          >
            <Text style={styles.openSplashPreviewText}>
              Buka Layar Sambutan
            </Text>
            <Feather name="chevron-right" size={16} color="#C41E3A" />
          </TouchableOpacity>

          <View style={styles.settingsBox}>
            <View style={styles.settingItemRow}>
              <Text style={styles.settingLabel}>Pengingat Tugas H-1</Text>
              <Switch
                value={reminderEnabled}
                onValueChange={setReminderEnabled}
                trackColor={{ false: '#CBD5E1', true: '#C41E3A' }}
              />
            </View>
            <View style={styles.settingItemRow}>
              <Text style={styles.settingLabel}>
                Sinkronisasi Google Calendar
              </Text>
              <Switch
                value={googleCalendarSync}
                onValueChange={setGoogleCalendarSync}
                trackColor={{ false: '#CBD5E1', true: '#C41E3A' }}
              />
            </View>
            <View style={styles.settingItemRow}>
              <Text style={styles.settingLabel}>Pembaruan SIAKAD Otomatis</Text>
              <Switch
                value={siakadAutoUpdate}
                onValueChange={setSiakadAutoUpdate}
                trackColor={{ false: '#CBD5E1', true: '#C41E3A' }}
              />
            </View>
            <View style={styles.settingItemRow}>
              <Text style={styles.settingLabel}>Mode Tampilan</Text>
              <Switch
                value={isDarkMode}
                onValueChange={setIsDarkMode}
                trackColor={{ false: '#CBD5E1', true: '#C41E3A' }}
              />
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleResetAllData}
            style={styles.resetButtonCrimson}
          >
            <Feather name="rotate-ccw" size={16} color="#FFFFFF" />
            <Text style={styles.resetButtonText}>Atur Ulang Data</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* PERSISTENT 4-TAB BOTTOM NAVIGATION BAR */}
      <View style={styles.bottomNavContainer}>
        {[
          { key: 'tugas', label: 'Tugas', icon: 'check-square' },
          { key: 'matakuliah', label: 'Mata Kuliah', icon: 'book-open' },
          { key: 'progres', label: 'Progres', icon: 'pie-chart' },
          { key: 'profil', label: 'Profil', icon: 'user' },
        ].map((item) => {
          const isSelected = bottomTab === item.key;
          return (
            <TouchableOpacity
              key={item.key}
              onPress={() => setBottomTab(item.key)}
              style={[
                styles.bottomNavButton,
                isSelected && styles.bottomNavButtonActive,
              ]}
            >
              <Feather
                name={item.icon}
                size={17}
                color={isSelected ? '#FFFFFF' : '#64748B'}
              />
              {isSelected && (
                <Text style={styles.bottomNavLabelActive}>{item.label}</Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* SCREEN 0: WELCOME BRAND SPLASH MODAL */}
      <Modal visible={isSplashOpen} transparent animationType="fade">
        <View style={styles.splashOverlay}>
          <View style={styles.splashHeroCrimson}>
            <View style={styles.splashInstitutionBadge}>
              <Text style={styles.splashInstitutionBadgeText}>
                STIKOM POLTEK CIREBON
              </Text>
            </View>
            <View style={styles.splashMascotCircle}>
              <Feather name="award" size={54} color="#C41E3A" />
            </View>
          </View>
          <View style={styles.splashBottomCard}>
            <View style={styles.splashSemesterPill}>
              <Text style={styles.splashSemesterPillText}>
                Semester 5 · Teknik Informatika
              </Text>
            </View>
            <Text style={styles.splashTitleText}>
              Halo, {STUDENT_PROFILE.name}! Siap menuntaskan tugas Semester 5?
            </Text>
            <Text style={styles.splashSubtitleText}>
              NIM {STUDENT_PROFILE.nim} · Kelola jadwal kuliah, tenggat
              praktikum, dan target akademik dalam satu aplikasi.
            </Text>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setIsSplashOpen(false)}
              style={styles.splashStartBtn}
            >
              <Text style={styles.splashStartBtnText}>Mulai Belajar</Text>
              <Feather name="arrow-right" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* FULL INTERACTIVE MONTH & YEAR CALENDAR MODAL */}
      <Modal
        visible={isCalendarModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsCalendarModalOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.calendarModalSheet}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalSheetTitle}>
                {calendarModalMode === 'picker'
                  ? 'Pilih Tanggal Tenggat'
                  : 'Kalender Akademik'}
              </Text>
              <TouchableOpacity
                onPress={() => setIsCalendarModalOpen(false)}
                style={styles.closeModalBtn}
              >
                <Feather name="x" size={18} color="#475569" />
              </TouchableOpacity>
            </View>

            <View style={styles.monthSwitchRow}>
              <TouchableOpacity
                onPress={() =>
                  setCalendarMonthIdx((prev) => Math.max(0, prev - 1))
                }
                style={styles.monthNavBtn}
              >
                <Feather name="chevron-left" size={18} color="#0F172A" />
              </TouchableOpacity>
              <Text style={styles.monthTitleLabel}>
                {currentMonthMeta.full} 2026
              </Text>
              <TouchableOpacity
                onPress={() =>
                  setCalendarMonthIdx((prev) =>
                    Math.min(MONTH_OPTIONS.length - 1, prev + 1)
                  )
                }
                style={styles.monthNavBtn}
              >
                <Feather name="chevron-right" size={18} color="#0F172A" />
              </TouchableOpacity>
            </View>

            <View style={styles.monthGridWrap}>
              {monthDaysArray.map((dayNum) => {
                const padded = dayNum < 10 ? `0${dayNum}` : `${dayNum}`;
                const fullLabel = `${padded} ${currentMonthMeta.short} 2026`;
                const isSelected = selectedDayDate === fullLabel;
                return (
                  <TouchableOpacity
                    key={fullLabel}
                    onPress={() => {
                      setSelectedDayDate(fullLabel);
                      if (calendarModalMode === 'picker') {
                        setNewDeadline(fullLabel);
                        setIsCalendarModalOpen(false);
                      }
                    }}
                    style={[
                      styles.monthDayCell,
                      isSelected && styles.monthDayCellActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.monthDayNumText,
                        isSelected && { color: '#FFFFFF' },
                      ]}
                    >
                      {dayNum}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>

      {/* SLIDE-UP ADD TASK MODAL */}
      <Modal
        visible={isAddTaskModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsAddTaskModalOpen(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalBackdrop}
        >
          <View style={styles.bottomSheetCard}>
            <Text style={styles.modalSheetTitle}>Tambah Tugas Kuliah</Text>
            {taskFormError !== '' && (
              <Text style={styles.errorBannerText}>{taskFormError}</Text>
            )}
            <TextInput
              ref={titleInputRef}
              value={newTitle}
              onChangeText={setNewTitle}
              placeholder="Judul Tugas"
              style={styles.sheetInput}
            />
            <View style={styles.quickChipsRow}>
              {QUICK_DEADLINE_CHIPS.map((chip) => (
                <TouchableOpacity
                  key={chip.label}
                  onPress={() => setNewDeadline(chip.value)}
                  style={[
                    styles.quickChipBtn,
                    newDeadline === chip.value && styles.quickChipBtnActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.quickChipText,
                      newDeadline === chip.value && { color: '#FFFFFF' },
                    ]}
                  >
                    {chip.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              onPress={() => {
                setCalendarModalMode('picker');
                setIsCalendarModalOpen(true);
              }}
              style={styles.datePickerTriggerBtn}
            >
              <Text style={styles.datePickerTriggerText}>
                Tenggat: {newDeadline}
              </Text>
              <Feather name="calendar" size={16} color="#C41E3A" />
            </TouchableOpacity>

            <View style={styles.modalFooterActions}>
              <TouchableOpacity
                onPress={() => setIsAddTaskModalOpen(false)}
                style={styles.cancelBtn}
              >
                <Text style={styles.cancelBtnText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSubmitNewTask}
                style={styles.submitBtnCrimson}
              >
                <Text style={styles.submitBtnText}>Simpan Tugas</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* SLIDE-UP ADD COURSE MODAL (12 ICON PICKER + 5 BENTO COLOR CHIPS) */}
      <Modal
        visible={isAddCourseModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsAddCourseModalOpen(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalBackdrop}
        >
          <View style={styles.bottomSheetCard}>
            <Text style={styles.modalSheetTitle}>Tambah Mata Kuliah Baru</Text>
            {courseFormError !== '' && (
              <Text style={styles.errorBannerText}>{courseFormError}</Text>
            )}
            <TextInput
              value={courseNameInput}
              onChangeText={setCourseNameInput}
              placeholder="Nama Mata Kuliah"
              style={styles.sheetInput}
            />
            <TextInput
              value={courseLecturerInput}
              onChangeText={setCourseLecturerInput}
              placeholder="Dosen Pengampu"
              style={styles.sheetInput}
            />

            {/* 12 Subject Vector Icon Picker */}
            <Text style={styles.pickerSectionLabel}>Pilih Ikon Mata Kuliah</Text>
            <View style={styles.iconPickerGrid}>
              {SUBJECT_ICON_OPTIONS.map((item) => {
                const isSelected = courseIconKeyInput === item.key;
                return (
                  <TouchableOpacity
                    key={item.key}
                    onPress={() => setCourseIconKeyInput(item.key)}
                    style={[
                      styles.iconPickerCell,
                      isSelected && styles.iconPickerCellActive,
                    ]}
                  >
                    <Feather
                      name={item.key}
                      size={16}
                      color={isSelected ? '#FFFFFF' : '#0F172A'}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* 5 Bento Color Chips */}
            <Text style={styles.pickerSectionLabel}>Tema Warna Bento</Text>
            <View style={styles.colorThemesRow}>
              {BENTO_COLOR_THEMES.map((theme) => (
                <TouchableOpacity
                  key={theme.id}
                  onPress={() => setCourseThemeIdInput(theme.id)}
                  style={[
                    styles.colorSwatchCircle,
                    { backgroundColor: theme.iconBg },
                    courseThemeIdInput === theme.id &&
                      styles.colorSwatchSelected,
                  ]}
                />
              ))}
            </View>

            <View style={styles.modalFooterActions}>
              <TouchableOpacity
                onPress={() => setIsAddCourseModalOpen(false)}
                style={styles.cancelBtn}
              >
                <Text style={styles.cancelBtnText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSubmitNewCourse}
                style={styles.submitBtnCrimson}
              >
                <Text style={styles.submitBtnText}>Simpan Matkul</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  screenContainer: {
    flex: 1,
  },
  scrollTabContainer: {
    padding: 16,
    paddingBottom: 110,
  },
  heroCardCrimson: {
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 8,
    padding: 16,
    borderRadius: 28,
    backgroundColor: '#C41E3A',
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mascotAvatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  heroTextCol: {
    flex: 1,
  },
  heroCampusPill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginBottom: 4,
  },
  heroCampusPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  heroGreetingTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  heroGreetingSub: {
    fontSize: 12,
    color: '#FFE4E6',
    marginTop: 2,
  },
  heroBottomRow: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroProgressPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  heroProgressBadgeText: {
    backgroundColor: '#FFFFFF',
    color: '#C41E3A',
    fontWeight: '800',
    fontSize: 11,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginRight: 6,
  },
  heroProgressLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  heroStreakWhitePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  heroStreakWhiteText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#C41E3A',
    marginLeft: 5,
  },
  calendarHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    marginBottom: 6,
  },
  calendarHeaderLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  openMonthCalendarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFE4E6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  openMonthCalendarBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#C41E3A',
    marginLeft: 5,
  },
  weeklyStripRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  weeklyDayCell: {
    flex: 1,
    minHeight: 52,
    marginHorizontal: 2,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  weeklyDayCellActive: {
    backgroundColor: '#C41E3A',
    borderColor: '#C41E3A',
  },
  weeklyDayShort: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  weeklyDayNumber: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
  },
  weeklyDayTextActive: {
    color: '#FFFFFF',
  },
  weeklyDayDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginTop: 3,
  },
  searchBarBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 14,
    minHeight: 44,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#0F172A',
  },
  clearSearchBtn: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterTabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  filterTabBtn: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  filterTabBtnActive: {
    borderBottomColor: '#C41E3A',
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  filterTabTextActive: {
    color: '#C41E3A',
  },
  listContentContainer: {
    padding: 16,
    paddingBottom: 110,
  },
  taskCard: {
    borderRadius: 24,
    borderWidth: 2,
    padding: 14,
    marginBottom: 12,
  },
  taskCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskCourseIconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  taskCenterContent: {
    flex: 1,
    marginRight: 8,
  },
  taskTitleText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#94A3B8',
  },
  taskCourseSubtitle: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  taskMetaInline: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  deadlinePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.85)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginRight: 6,
  },
  deadlinePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
    marginLeft: 4,
  },
  accordionTriggerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.75)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  accordionTriggerText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    marginRight: 3,
  },
  taskActionsRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconTouchTarget: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  checkBtnPending: {
    backgroundColor: '#FFFFFF',
  },
  checkBtnCompleted: {
    backgroundColor: '#10B981',
  },
  deleteBtnSurface: {
    backgroundColor: '#FFFFFF',
  },
  accordionBody: {
    marginTop: 10,
    padding: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
  accordionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  accordionCodeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  accordionDeadlineText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  accordionDescText: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 18,
  },
  fabCrimson: {
    position: 'absolute',
    right: 20,
    bottom: 88,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#C41E3A',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
  },
  tabHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  tabHeaderTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  tabHeaderSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  addCourseTopBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#C41E3A',
    minHeight: 44,
    paddingHorizontal: 14,
    borderRadius: 16,
  },
  addCourseTopBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
    marginLeft: 6,
  },
  courseBentoCard: {
    borderRadius: 24,
    borderWidth: 2,
    padding: 16,
    marginBottom: 14,
  },
  courseTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  courseIconBadge: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  courseTitleWrap: {
    flex: 1,
  },
  courseCodeLabel: {
    fontSize: 11,
    fontWeight: '800',
  },
  courseNameTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  sksPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  sksPillText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  courseInfoSubBox: {
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 16,
    padding: 12,
    marginTop: 12,
  },
  courseInfoLine: {
    fontSize: 12,
    color: '#1E293B',
    marginBottom: 3,
  },
  courseFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  courseActiveTasksText: {
    fontSize: 12,
    fontWeight: '800',
  },
  courseFooterButtons: {
    flexDirection: 'row',
  },
  courseAddTaskBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    minHeight: 44,
    paddingHorizontal: 12,
    borderRadius: 14,
    marginRight: 8,
  },
  courseAddTaskBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
    marginLeft: 4,
  },
  courseOpenTasksBtn: {
    minHeight: 44,
    paddingHorizontal: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  courseOpenTasksBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  bentoMetricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    marginBottom: 14,
  },
  bentoMetricTile: {
    flex: 1,
    marginHorizontal: 3,
    padding: 12,
    borderRadius: 20,
    borderWidth: 2,
  },
  bentoMetricLabel: {
    fontSize: 11,
    fontWeight: '800',
  },
  bentoMetricValue: {
    fontSize: 22,
    fontWeight: '800',
    marginTop: 6,
  },
  radialScoreCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    padding: 18,
    marginBottom: 14,
  },
  radialCircleBadge: {
    width: 86,
    height: 86,
    borderRadius: 43,
    borderWidth: 8,
    borderColor: '#C41E3A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  radialPercentText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  radialSubText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  radialCardOverline: {
    fontSize: 10,
    fontWeight: '800',
    color: '#C41E3A',
  },
  radialCardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
  },
  radialCardDesc: {
    fontSize: 12,
    color: '#475569',
    marginTop: 4,
  },
  podiumShelfCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    padding: 16,
  },
  podiumShelfTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
  },
  podiumRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 2,
    padding: 12,
    marginBottom: 10,
  },
  podiumRankBadge: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  podiumRankBadgeText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  podiumTextCol: {
    flex: 1,
  },
  podiumItemTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  podiumItemSub: {
    fontSize: 11,
    color: '#475569',
    marginTop: 2,
  },
  podiumScorePill: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  podiumScorePillText: {
    fontSize: 11,
    fontWeight: '800',
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    alignItems: 'center',
    paddingBottom: 18,
    marginBottom: 12,
  },
  profileBannerCrimson: {
    width: '100%',
    backgroundColor: '#C41E3A',
    paddingVertical: 18,
    alignItems: 'center',
  },
  profileInstitutionText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
  },
  profileAvatarLarge: {
    width: 64,
    height: 64,
    borderRadius: 22,
    backgroundColor: '#FFE4E6',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -24,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  profileName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 8,
  },
  profileNim: {
    fontSize: 12,
    fontWeight: '800',
    color: '#C41E3A',
    marginTop: 2,
  },
  profileProgram: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  profileStatsBar: {
    flexDirection: 'row',
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    marginTop: 14,
    paddingTop: 12,
  },
  profileStatCol: {
    flex: 1,
    alignItems: 'center',
  },
  profileStatVal: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  profileStatLabel: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  openSplashPreviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FEE2E2',
    borderWidth: 2,
    borderColor: '#FECACA',
    borderRadius: 20,
    paddingHorizontal: 16,
    minHeight: 48,
    marginBottom: 12,
  },
  openSplashPreviewText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#C41E3A',
  },
  settingsBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    padding: 14,
    marginBottom: 14,
  },
  settingItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 48,
  },
  settingLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  resetButtonCrimson: {
    minHeight: 50,
    borderRadius: 24,
    backgroundColor: '#C41E3A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    marginLeft: 8,
  },
  bottomNavContainer: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    padding: 6,
  },
  bottomNavButton: {
    minHeight: 44,
    minWidth: 48,
    paddingHorizontal: 14,
    borderRadius: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomNavButtonActive: {
    backgroundColor: '#C41E3A',
  },
  bottomNavLabelActive: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
    marginLeft: 6,
  },
  splashOverlay: {
    flex: 1,
    backgroundColor: '#C41E3A',
    justifyContent: 'space-between',
  },
  splashHeroCrimson: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  splashInstitutionBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 24,
  },
  splashInstitutionBadgeText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
  },
  splashMascotCircle: {
    width: 128,
    height: 128,
    borderRadius: 42,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashBottomCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    padding: 24,
    alignItems: 'center',
  },
  splashSemesterPill: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
  },
  splashSemesterPillText: {
    color: '#C41E3A',
    fontWeight: '800',
    fontSize: 11,
  },
  splashTitleText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
  },
  splashSubtitleText: {
    fontSize: 12,
    color: '#475569',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 20,
    lineHeight: 18,
  },
  splashStartBtn: {
    width: '100%',
    minHeight: 54,
    borderRadius: 20,
    backgroundColor: '#C41E3A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashStartBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    marginRight: 8,
  },
  emptyStateBox: {
    padding: 28,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#FECDD3',
    alignItems: 'center',
  },
  emptyStateMascotBadge: {
    width: 64,
    height: 64,
    borderRadius: 22,
    backgroundColor: '#FFE4E6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyStateTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.55)',
    justifyContent: 'flex-end',
  },
  calendarModalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 20,
  },
  bottomSheetCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 20,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalSheetTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 10,
  },
  closeModalBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthSwitchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  monthNavBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthTitleLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  monthGridWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  monthDayCell: {
    width: '14.28%',
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthDayCellActive: {
    backgroundColor: '#C41E3A',
  },
  monthDayNumText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  sheetInput: {
    minHeight: 48,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 14,
    marginBottom: 10,
    fontSize: 14,
  },
  quickChipsRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  quickChipBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    marginRight: 8,
  },
  quickChipBtnActive: {
    backgroundColor: '#C41E3A',
  },
  quickChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  datePickerTriggerBtn: {
    minHeight: 48,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FECDD3',
    backgroundColor: '#FFF1F2',
    paddingHorizontal: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  datePickerTriggerText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#C41E3A',
  },
  pickerSectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  iconPickerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  iconPickerCell: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
    marginBottom: 6,
  },
  iconPickerCellActive: {
    backgroundColor: '#C41E3A',
  },
  colorThemesRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  colorSwatchCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  colorSwatchSelected: {
    borderWidth: 3,
    borderColor: '#0F172A',
  },
  modalFooterActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelBtn: {
    flex: 1,
    minHeight: 48,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  submitBtnCrimson: {
    flex: 1,
    minHeight: 48,
    borderRadius: 16,
    backgroundColor: '#C41E3A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  errorBannerText: {
    color: '#C41E3A',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
  },
});
