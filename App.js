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
  Image,
  Animated,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

/*
 * Paket Aset Visual Lokal (Tersedia di folder /public/assets/ proyek ini):
 * - mascot-splash.jpg
 * - sticker-coding.jpg
 * - sticker-robotics.jpg
 * - sticker-data.jpg
 * - sticker-security.jpg
 * - sticker-oop.jpg
 * - sticker-ai.jpg
 * - sticker-design.jpg
 * - olympiad-trophy.jpg
 */
const VISUAL_ASSETS = {
  mascotSplash: require('./public/assets/mascot-splash.jpg'),
  stickerCoding: require('./public/assets/sticker-coding.jpg'),
  stickerRobotics: require('./public/assets/sticker-robotics.jpg'),
  stickerData: require('./public/assets/sticker-data.jpg'),
  stickerSecurity: require('./public/assets/sticker-security.jpg'),
  stickerOop: require('./public/assets/sticker-oop.jpg'),
  stickerAi: require('./public/assets/sticker-ai.jpg'),
  stickerDesign: require('./public/assets/sticker-design.jpg'),
  olympiadTrophy: require('./public/assets/olympiad-trophy.jpg'),
};

const STUDENT_PROFILE = {
  name: 'Badar Rahman',
  shortName: 'Badar',
  nim: '14524303',
  classGroup: 'TI-1',
  semester: 'Semester 5',
  program: 'Teknik Informatika',
  institution: 'STIKOM Poltek Cirebon',
  email: 'badarrahman1905@gmail.com',
  streakDays: 6,
};

const STICKER_OPTIONS = [
  { id: 'coding', label: 'Koding', source: VISUAL_ASSETS.stickerCoding, iconKey: 'code' },
  { id: 'robotics', label: 'Robotik', source: VISUAL_ASSETS.stickerRobotics, iconKey: 'cpu' },
  { id: 'data', label: 'Data', source: VISUAL_ASSETS.stickerData, iconKey: 'database' },
  { id: 'security', label: 'Siber', source: VISUAL_ASSETS.stickerSecurity, iconKey: 'shield' },
  { id: 'oop', label: 'Sistem', source: VISUAL_ASSETS.stickerOop, iconKey: 'layers' },
  { id: 'ai', label: 'Pintar', source: VISUAL_ASSETS.stickerAi, iconKey: 'book-open' },
  { id: 'design', label: 'Visual', source: VISUAL_ASSETS.stickerDesign, iconKey: ' layout' },
  { id: 'mascot', label: 'Kampus', source: VISUAL_ASSETS.mascotSplash, iconKey: 'award' },
];

const BENTO_COLOR_THEMES = [
  {
    id: 'crimson',
    label: 'Merah Koral',
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
    accentColor: '#4F46E5',
    iconBg: '#4F46E5',
  },
  {
    id: 'amber',
    label: 'Jingga Amber',
    pastelBg: '#FEF3C7',
    pastelBorder: '#FDE68A',
    accentColor: '#D97706',
    iconBg: '#D97706',
  },
  {
    id: 'emerald',
    label: 'Hijau Zamrud',
    pastelBg: '#D1FAE5',
    pastelBorder: '#A7F3D0',
    accentColor: '#059669',
    iconBg: '#059669',
  },
  {
    id: 'cyan',
    label: 'Sian Elektrik',
    pastelBg: '#CFFAFE',
    pastelBorder: '#A5F3FC',
    accentColor: '#0891B2',
    iconBg: '#0891B2',
  },
];

const INITIAL_COURSES = [
  {
    id: 'course-ti361',
    code: 'TI361',
    name: 'Pemrograman Visual I',
    lecturer: 'Kusnadi, M.Kom.',
    credits: 3,
    schedule: 'Senin, 08:00 - 10:30 WIB',
    room: 'Lab Mobile 1',
    stickerSource: VISUAL_ASSETS.stickerCoding,
    pastelBg: '#FEE2E2',
    pastelBorder: '#FECACA',
    accentColor: '#C41E3A',
    iconBg: '#C41E3A',
  },
  {
    id: 'course-ti362',
    code: 'TI362',
    name: 'Robotika',
    lecturer: 'Bambang Sugiarto, M.T.',
    credits: 3,
    schedule: 'Selasa, 10:30 - 13:00 WIB',
    room: 'Lab IoT & Robotika',
    stickerSource: VISUAL_ASSETS.stickerRobotics,
    pastelBg: '#EEF2FF',
    pastelBorder: '#C7D2FE',
    accentColor: '#4F46E5',
    iconBg: '#4F46E5',
  },
  {
    id: 'course-ti363',
    code: 'TI363',
    name: 'Data Warehouse & Data Mining',
    lecturer: 'Dr. Rina Kurniawati, M.Kom.',
    credits: 3,
    schedule: 'Rabu, 08:00 - 10:30 WIB',
    room: 'Ruang 304',
    stickerSource: VISUAL_ASSETS.stickerData,
    pastelBg: '#FEF3C7',
    pastelBorder: '#FDE68A',
    accentColor: '#D97706',
    iconBg: '#D97706',
  },
  {
    id: 'course-ti364',
    code: 'TI364',
    name: 'Keamanan Informasi & Jaringan',
    lecturer: 'Hendra Wijaya, S.Kom., M.T.',
    credits: 3,
    schedule: 'Kamis, 13:00 - 15:30 WIB',
    room: 'Lab Jaringan',
    stickerSource: VISUAL_ASSETS.stickerSecurity,
    pastelBg: '#D1FAE5',
    pastelBorder: '#A7F3D0',
    accentColor: '#059669',
    iconBg: '#059669',
  },
  {
    id: 'course-ti365',
    code: 'TI365',
    name: 'Pemodelan Berorientasi Objek',
    lecturer: 'Dedi Pratama, M.Kom.',
    credits: 3,
    schedule: 'Jumat, 08:00 - 10:30 WIB',
    room: 'Lab Pemrograman 2',
    stickerSource: VISUAL_ASSETS.stickerOop,
    pastelBg: '#CFFAFE',
    pastelBorder: '#A5F3FC',
    accentColor: '#0891B2',
    iconBg: '#0891B2',
  },
];

const INITIAL_TASKS = [
  {
    id: 'task-ti361-01',
    title: 'Tugas Pertemuan 5 - Aplikasi Manajemen Tugas Mahasiswa',
    course: 'Pemrograman Visual I',
    category: 'Proyek',
    deadline: '08 Nov 2026',
    status: 'Belum Dikerjakan',
    description:
      'Merancang antarmuka aplikasi daftar tugas mahasiswa dengan fitur pencarian langsung, filter status penyelesaian, dan ringkasan progres.',
  },
  {
    id: 'task-rob-02',
    title: 'Latihan 4 - Kinematika Ruang dan Transformasi Koordinat',
    course: 'Robotika',
    category: 'Praktikum',
    deadline: '04 Nov 2026',
    status: 'Selesai',
    description:
      'Konversi koordinat bola ke kartesian dan matriks rotasi end-effector robot manipulator.',
  },
  {
    id: 'task-dwdm-03',
    title: 'Analisis 3V Big Data Tokopedia dan Shopee',
    course: 'Data Warehouse & Data Mining',
    category: 'Teori',
    deadline: '07 Nov 2026',
    status: 'Selesai',
    description:
      'Arsitektur data lake, pemrosesan aliran data, dan pemisahan sistem transaksi dengan analitik.',
  },
  {
    id: 'task-kij-04',
    title: 'Praktikum Modul 1.4.1 - Uji Port Nmap Kali Linux',
    course: 'Keamanan Informasi & Jaringan',
    category: 'Praktikum',
    deadline: '05 Nov 2026',
    status: 'Selesai',
    description:
      'Pengujian pemindaian port jaringan menggunakan Nmap 7.99 pada lingkungan Kali Linux.',
  },
  {
    id: 'task-pbo-05',
    title: 'Analisis OOM Perancangan Sistem Pasar Cirebon',
    course: 'Pemodelan Berorientasi Objek',
    category: 'Proyek',
    deadline: '09 Nov 2026',
    status: 'Belum Dikerjakan',
    description:
      'Pemodelan diagram kelas dan skenario kebutuhan spesifikasi harga pangan daerah Cirebon.',
  },
];

const CLASS_TI1_PEERS = [
  {
    id: 'peer-badar',
    name: 'Badar Rahman',
    nim: '14524303',
    avatar: VISUAL_ASSETS.mascotSplash,
    weeklyBase: 220,
    monthlyBase: 1150,
    weeklyComp: 88,
    monthlyComp: 92,
    isCurrentUser: true,
  },
  {
    id: 'peer-nadia',
    name: 'Nadia Putri Lestari',
    nim: '14524308',
    avatar: VISUAL_ASSETS.stickerAi,
    weeklyBase: 390,
    monthlyBase: 1340,
    weeklyComp: 90,
    monthlyComp: 94,
  },
  {
    id: 'peer-rizky',
    name: 'Rizky Pratama Wijaya',
    nim: '14524312',
    avatar: VISUAL_ASSETS.stickerRobotics,
    weeklyBase: 310,
    monthlyBase: 1190,
    weeklyComp: 76,
    monthlyComp: 84,
  },
  {
    id: 'peer-siti',
    name: 'Siti Nurhaliza Rahma',
    nim: '14524319',
    avatar: VISUAL_ASSETS.stickerDesign,
    weeklyBase: 280,
    monthlyBase: 1120,
    weeklyComp: 70,
    monthlyComp: 79,
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

/*
 * Hook 7 (useReducer): Central state reducer handling task list mutations
 * across ADD_TASK, EDIT_TASK, DELETE_TASK, TOGGLE_STATUS, and RESET_TASKS.
 */
function taskReducer(state, action) {
  switch (action.type) {
    case 'ADD_TASK': {
      const newTask = {
        id: `task-${Date.now()}`,
        title: action.payload.title.trim(),
        course: action.payload.course.trim(),
        category: action.payload.category || 'Praktikum',
        deadline: action.payload.deadline.trim(),
        status: 'Belum Dikerjakan',
        description: action.payload.description.trim(),
      };
      return [newTask, ...state];
    }
    case 'EDIT_TASK': {
      return state.map((task) =>
        task.id === action.payload.id
          ? {
              ...task,
              title: action.payload.title.trim(),
              course: action.payload.course.trim(),
              category: action.payload.category,
              deadline: action.payload.deadline.trim(),
              description: action.payload.description.trim(),
            }
          : task
      );
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
 * Component 1 (Props): Standalone Visual Bento TaskCard child component
 * displaying expressive 2D character stickers, category badge, edit & delete controls.
 */
const TaskCard = React.memo(function TaskCard({
  task,
  courses,
  onToggleStatus,
  onEditTask,
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
          borderColor: isCompleted ? '#CBD5E1' : '#0F172A',
        },
      ]}
    >
      <View style={styles.taskCardRow}>
        {/* Left: 56x56pt Character Sticker Container */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setIsExpanded((prev) => !prev)}
          style={styles.taskStickerFrame}
        >
          <Image
            source={matchedCourse.stickerSource}
            style={styles.taskStickerImg}
            resizeMode="cover"
          />
        </TouchableOpacity>

        {/* Center: Category Badge, 1-Line Bold Title, Course Name, and Deadline */}
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() => setIsExpanded((prev) => !prev)}
          style={styles.taskCenterContent}
        >
          <View style={styles.taskCategoryRow}>
            <View
              style={[
                styles.categoryBadge,
                { backgroundColor: matchedCourse.iconBg },
              ]}
            >
              <Text style={styles.categoryBadgeText}>
                {task.category || 'Praktikum'}
              </Text>
            </View>
            <Text
              numberOfLines={1}
              style={[
                styles.taskCourseSubtitle,
                { color: matchedCourse.accentColor },
              ]}
            >
              {task.course}
            </Text>
          </View>

          <Text
            numberOfLines={isExpanded ? 3 : 1}
            style={[
              styles.taskTitleText,
              isCompleted && styles.taskTitleCompleted,
            ]}
          >
            {task.title}
          </Text>

          <View style={styles.taskMetaInline}>
            <View style={styles.deadlinePill}>
              <Feather name="calendar" size={11} color="#0F172A" />
              <Text style={styles.deadlinePillText}>{task.deadline}</Text>
            </View>
            <Text style={styles.accordionTriggerText}>
              {isExpanded ? 'Tutup' : 'Rincian'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Right: Checkmark Toggle, Edit, and Delete */}
        <View style={styles.taskActionsRight}>
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => onToggleStatus(task.id)}
            style={[
              styles.iconTouchTarget,
              isCompleted ? styles.checkBtnCompleted : styles.checkBtnPending,
            ]}
          >
            <Feather
              name="check"
              size={16}
              color={isCompleted ? '#FFFFFF' : '#0F172A'}
            />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => onEditTask(task)}
            style={[styles.iconTouchTarget, styles.whiteActionBtn]}
          >
            <Feather name="edit-2" size={14} color="#0F172A" />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => onDeleteTask(task.id)}
            style={[styles.iconTouchTarget, styles.whiteActionBtn]}
          >
            <Feather name="trash-2" size={15} color="#C41E3A" />
          </TouchableOpacity>
        </View>
      </View>

      {isExpanded && (
        <View style={styles.accordionBody}>
          <Text style={styles.accordionDescText}>{task.description}</Text>
        </View>
      )}
    </View>
  );
});

export default function App() {
  const [tasks, dispatch] = useReducer(taskReducer, INITIAL_TASKS);

  const [screenPhase, setScreenPhase] = useState('splash');
  const [studentName, setStudentName] = useState(STUDENT_PROFILE.name);
  const [studentNim, setStudentNim] = useState(STUDENT_PROFILE.nim);
  const [studentClass, setStudentClass] = useState(STUDENT_PROFILE.classGroup);
  const [isGoogleLinked, setIsGoogleLinked] = useState(false);

  const [courses, setCourses] = useState(INITIAL_COURSES);
  const [bottomTab, setBottomTab] = useState('tugas');
  const [selectedDayDate, setSelectedDayDate] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilterTab, setActiveFilterTab] = useState('Semua');
  const [selectedCourseFilter, setSelectedCourseFilter] = useState('Semua');
  const [leaderboardPeriod, setLeaderboardPeriod] = useState('weekly');

  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [editingTaskItem, setEditingTaskItem] = useState(null);
  const [isAddCourseModalOpen, setIsAddCourseModalOpen] = useState(false);

  const [newTitle, setNewTitle] = useState('');
  const [newCourse, setNewCourse] = useState(INITIAL_COURSES[0].name);
  const [newCategory, setNewCategory] = useState('Praktikum');
  const [newDeadline, setNewDeadline] = useState('08 Nov 2026');
  const [newDescription, setNewDescription] = useState('');

  const [courseNameInput, setCourseNameInput] = useState('');
  const [courseLecturerInput, setCourseLecturerInput] = useState('');
  const [courseCreditsInput, setCourseCreditsInput] = useState(3);
  const [courseStickerIdx, setCourseStickerIdx] = useState(0);
  const [courseThemeIdInput, setCourseThemeIdInput] = useState('crimson');

  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [googleCalendarSync, setGoogleCalendarSync] = useState(true);
  const [siakadAutoUpdate, setSiakadAutoUpdate] = useState(true);

  const splashTranslateY = useRef(new Animated.Value(260)).current;
  const titleInputRef = useRef(null);

  /*
   * Aptivo-style rising character splash animation from bottom to top on launch.
   */
  useEffect(() => {
    if (screenPhase === 'splash') {
      Animated.spring(splashTranslateY, {
        toValue: 0,
        friction: 7,
        tension: 60,
        useNativeDriver: true,
      }).start();

      const timer = setTimeout(() => {
        setScreenPhase('auth');
      }, 2200);
      return () => clearTimeout(timer);
    }
  }, [screenPhase, splashTranslateY]);

  /*
   * Hook 3 (useEffect): Observes searchQuery transitions and logs to console (FR-05).
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

  const rankedLeaderboard = useMemo(() => {
    const bonus = taskMetrics.completed * 45;
    const items = CLASS_TI1_PEERS.map((peer) => {
      if (peer.isCurrentUser) {
        return {
          ...peer,
          name: studentName,
          nim: studentNim,
          score:
            leaderboardPeriod === 'weekly'
              ? peer.weeklyBase + bonus
              : peer.monthlyBase + bonus,
          completion: taskMetrics.completionRate,
        };
      }
      return {
        ...peer,
        score:
          leaderboardPeriod === 'weekly' ? peer.weeklyBase : peer.monthlyBase,
        completion:
          leaderboardPeriod === 'weekly' ? peer.weeklyComp : peer.monthlyComp,
      };
    });
    return items.sort((a, b) => b.score - a.score);
  }, [taskMetrics, leaderboardPeriod, studentName, studentNim]);

  const filteredTasks = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase();
    return tasks.filter((item) => {
      const matchesTab =
        activeFilterTab === 'Semua' ? true : item.status === activeFilterTab;
      const matchesCourse =
        selectedCourseFilter === 'Semua'
          ? true
          : item.course.toLowerCase() === selectedCourseFilter.toLowerCase();
      const matchesDate =
        selectedDayDate === 'Semua' ? true : item.deadline === selectedDayDate;
      const matchesKeyword =
        keyword === '' ||
        item.title.toLowerCase().includes(keyword) ||
        item.course.toLowerCase().includes(keyword);
      return matchesTab && matchesCourse && matchesDate && matchesKeyword;
    });
  }, [
    tasks,
    activeFilterTab,
    selectedCourseFilter,
    selectedDayDate,
    searchQuery,
  ]);

  /*
   * Hook 5 (useCallback): Stable callback references passed down to TaskCard.
   */
  const handleToggleStatus = useCallback((taskId) => {
    dispatch({ type: 'TOGGLE_STATUS', payload: taskId });
  }, []);

  const handleDeleteTask = useCallback((taskId) => {
    dispatch({ type: 'DELETE_TASK', payload: taskId });
  }, []);

  const handleOpenEditTask = useCallback((task) => {
    setEditingTaskItem(task);
    setNewTitle(task.title);
    setNewCourse(task.course);
    setNewCategory(task.category || 'Praktikum');
    setNewDeadline(task.deadline);
    setNewDescription(task.description);
    setIsAddTaskModalOpen(true);
  }, []);

  const handleSubmitTask = useCallback(() => {
    if (!newTitle.trim()) return;
    if (editingTaskItem) {
      dispatch({
        type: 'EDIT_TASK',
        payload: {
          id: editingTaskItem.id,
          title: newTitle,
          course: newCourse,
          category: newCategory,
          deadline: newDeadline,
          description: newDescription,
        },
      });
    } else {
      dispatch({
        type: 'ADD_TASK',
        payload: {
          title: newTitle,
          course: newCourse,
          category: newCategory,
          deadline: newDeadline,
          description:
            newDescription.trim() || `Tugas ${newCategory} ${newCourse}.`,
        },
      });
    }
    setEditingTaskItem(null);
    setNewTitle('');
    setIsAddTaskModalOpen(false);
  }, [
    editingTaskItem,
    newTitle,
    newCourse,
    newCategory,
    newDeadline,
    newDescription,
  ]);

  const handleSubmitNewCourse = useCallback(() => {
    if (!courseNameInput.trim()) return;
    const chosenTheme =
      BENTO_COLOR_THEMES.find((t) => t.id === courseThemeIdInput) ||
      BENTO_COLOR_THEMES[0];
    const chosenSticker =
      STICKER_OPTIONS[courseStickerIdx] || STICKER_OPTIONS[0];
    const createdCourse = {
      id: `course-${Date.now()}`,
      code: `TI${361 + courses.length}`,
      name: courseNameInput.trim(),
      lecturer: courseLecturerInput.trim() || 'Dosen Pengampu STIKOM',
      credits: courseCreditsInput,
      schedule: 'Senin, 08:00 - 10:30 WIB',
      room: 'Lab Mobile 2',
      stickerSource: chosenSticker.source,
      pastelBg: chosenTheme.pastelBg,
      pastelBorder: chosenTheme.pastelBorder,
      accentColor: chosenTheme.accentColor,
      iconBg: chosenTheme.iconBg,
    };
    setCourses((prev) => [...prev, createdCourse]);
    setCourseNameInput('');
    setCourseLecturerInput('');
    setIsAddCourseModalOpen(false);
  }, [
    courseNameInput,
    courseLecturerInput,
    courseCreditsInput,
    courseStickerIdx,
    courseThemeIdInput,
    courses.length,
  ]);

  if (screenPhase === 'splash') {
    return (
      <SafeAreaView style={styles.splashScreenCream}>
        <View style={styles.splashTopBrand}>
          <Text style={styles.splashBrandSubtitle}>STIKOM POLTEK CIREBON</Text>
          <Text style={styles.splashBrandLogo}>stikom.app</Text>
        </View>
        <Animated.View
          style={[
            styles.splashRisingCharacterWrap,
            { transform: [{ translateY: splashTranslateY }] },
          ]}
        >
          <Image
            source={VISUAL_ASSETS.mascotSplash}
            style={styles.splashCharacterImg}
            resizeMode="cover"
          />
          <Text style={styles.splashLoadingHint}>
            Menyiapkan ruang belajar Semester 5...
          </Text>
        </Animated.View>
      </SafeAreaView>
    );
  }

  if (screenPhase === 'auth') {
    return (
      <SafeAreaView style={styles.splashScreenCream}>
        <ScrollView contentContainerStyle={styles.authScrollContent}>
          <Image
            source={VISUAL_ASSETS.mascotSplash}
            style={styles.authMascotImg}
            resizeMode="cover"
          />
          <Text style={styles.authGreetingTitle}>
            Halo! Siapa nama & NIM kamu?
          </Text>
          <Text style={styles.authGreetingSub}>
            Masuk dengan Akun Google kampus atau identitas mahasiswa STIKOM.
          </Text>

          <View style={styles.authFormCard}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => {
                setIsGoogleLinked(true);
                setScreenPhase('main');
              }}
              style={styles.googleAuthBtn}
            >
              <Feather name="globe" size={16} color="#FFFFFF" />
              <Text style={styles.googleAuthBtnText}>
                Lanjutkan dengan Akun Google
              </Text>
            </TouchableOpacity>

            <TextInput
              value={studentName}
              onChangeText={setStudentName}
              placeholder="Nama Lengkap Mahasiswa"
              style={styles.sheetInput}
            />
            <TextInput
              value={studentNim}
              onChangeText={setStudentNim}
              placeholder="NIM STIKOM (14524303)"
              style={styles.sheetInput}
            />

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setScreenPhase('main')}
              style={styles.submitBtnCrimson}
            >
              <Text style={styles.submitBtnText}>Mulai Belajar Sekarang</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFDF9" />

      {/* TAB 1: TUGAS */}
      {bottomTab === 'tugas' && (
        <View style={styles.screenContainer}>
          {/* Compact Airy Greeting Bar */}
          <View style={styles.airyHeaderRow}>
            <View style={styles.airyHeaderLeft}>
              <Image
                source={VISUAL_ASSETS.mascotSplash}
                style={styles.headerMascotAvatar}
              />
              <View>
                <Text style={styles.headerGreetingTitle}>
                  Halo, {studentName.split(' ')[0]}!
                </Text>
                <Text style={styles.headerGreetingSub}>
                  {taskMetrics.pending} tugas aktif ·{' '}
                  {taskMetrics.completionRate}% tuntas
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => setBottomTab('progres')}
              style={styles.streakBadgePill}
            >
              <Feather name="zap" size={14} color="#C41E3A" />
              <Text style={styles.streakBadgeText}>
                {STUDENT_PROFILE.streakDays} Hari
              </Text>
            </TouchableOpacity>
          </View>

          {/* Active Date Filter Strip */}
          <View style={styles.calendarHeaderRow}>
            <TouchableOpacity
              onPress={() => setSelectedDayDate('Semua')}
              style={[
                styles.allDatesChip,
                selectedDayDate === 'Semua' && styles.allDatesChipActive,
              ]}
            >
              <Text
                style={[
                  styles.allDatesChipText,
                  selectedDayDate === 'Semua' && { color: '#FFFFFF' },
                ]}
              >
                Semua Tanggal ({tasks.length})
              </Text>
            </TouchableOpacity>
            {selectedDayDate !== 'Semua' && (
              <Text style={styles.activeDateLabel}>
                Filter: {selectedDayDate}
              </Text>
            )}
          </View>

          <View style={styles.weeklyStripRow}>
            {WEEKLY_CALENDAR_DAYS.map((dayItem) => {
              const isSelected = selectedDayDate === dayItem.fullDateLabel;
              const countOnDay = tasks.filter(
                (t) => t.deadline === dayItem.fullDateLabel
              ).length;
              return (
                <TouchableOpacity
                  key={dayItem.fullDateLabel}
                  onPress={() =>
                    setSelectedDayDate((prev) =>
                      prev === dayItem.fullDateLabel
                        ? 'Semua'
                        : dayItem.fullDateLabel
                    )
                  }
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
                  {countOnDay > 0 && (
                    <Text
                      style={[
                        styles.weeklyCountBadge,
                        isSelected && { color: '#FFFFFF' },
                      ]}
                    >
                      {countOnDay}
                    </Text>
                  )}
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
              placeholder="Cari tugas, mata kuliah, atau praktikum..."
              placeholderTextColor="#94A3B8"
              style={styles.searchInput}
            />
          </View>

          {/* Filter Tabs */}
          <View style={styles.filterTabsRow}>
            {['Semua', 'Belum Dikerjakan', 'Selesai'].map((tab) => {
              const isActive = activeFilterTab === tab;
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
                    {tab}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <FlatList
            data={filteredTasks}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContentContainer}
            renderItem={({ item }) => (
              <TaskCard
                task={item}
                courses={courses}
                onToggleStatus={handleToggleStatus}
                onEditTask={handleOpenEditTask}
                onDeleteTask={handleDeleteTask}
              />
            )}
          />

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => {
              setEditingTaskItem(null);
              setNewTitle('');
              setIsAddTaskModalOpen(true);
            }}
            style={styles.fabCrimson}
          >
            <Feather name="plus" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      )}

      {/* TAB 2: MATA KULIAH (2-COLUMN ILLUSTRATED BENTO GRID) */}
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
              onPress={() => setIsAddCourseModalOpen(true)}
              style={styles.addCourseTopBtn}
            >
              <Feather name="plus" size={15} color="#FFFFFF" />
              <Text style={styles.addCourseTopBtnText}>Matkul</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.bentoGrid2Col}>
            {courses.map((course) => (
              <View
                key={course.id}
                style={[
                  styles.bentoCourseGridCard,
                  { backgroundColor: course.pastelBg },
                ]}
              >
                <View style={styles.bentoCourseStickerWrap}>
                  <Image
                    source={course.stickerSource}
                    style={styles.bentoCourseStickerImg}
                    resizeMode="cover"
                  />
                </View>
                <Text style={styles.bentoCourseCode}>
                  {course.code} · {course.credits} SKS
                </Text>
                <Text numberOfLines={2} style={styles.bentoCourseTitle}>
                  {course.name}
                </Text>
                <Text numberOfLines={1} style={styles.bentoCourseLecturer}>
                  {course.lecturer}
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>
      )}

      {/* TAB 3: PROGRES & LEADERBOARD KELAS TI-1 */}
      {bottomTab === 'progres' && (
        <ScrollView contentContainerStyle={styles.scrollTabContainer}>
          <View style={styles.olympiadHeroCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.olympiadOverline}>OLIMPIADE SEMESTER 5</Text>
              <Text style={styles.olympiadBigPercent}>
                {taskMetrics.completionRate}% Tuntas
              </Text>
              <Text style={styles.olympiadSubText}>
                {taskMetrics.completed} dari {taskMetrics.total} tugas selesai
              </Text>
            </View>
            <Image
              source={VISUAL_ASSETS.olympiadTrophy}
              style={styles.olympiadTrophyImg}
            />
          </View>

          <View style={styles.leaderboardContainer}>
            <View style={styles.leaderboardHeader}>
              <Text style={styles.leaderboardTitle}>
                Leaderboard Kelas TI-1
              </Text>
              <TouchableOpacity
                onPress={() =>
                  setLeaderboardPeriod((prev) =>
                    prev === 'weekly' ? 'monthly' : 'weekly'
                  )
                }
                style={styles.periodSwitchBtn}
              >
                <Text style={styles.periodSwitchText}>
                  {leaderboardPeriod === 'weekly' ? 'Mingguan' : 'Bulanan'}
                </Text>
              </TouchableOpacity>
            </View>

            {rankedLeaderboard.map((peer, idx) => (
              <View key={peer.id} style={styles.leaderboardRow}>
                <Text style={styles.leaderboardRank}>#{idx + 1}</Text>
                <Image source={peer.avatar} style={styles.leaderboardAvatar} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.leaderboardPeerName}>{peer.name}</Text>
                  <Text style={styles.leaderboardPeerScore}>
                    NIM {peer.nim} · {peer.score} XP
                  </Text>
                </View>
                <Text style={styles.leaderboardPercentBadge}>
                  {peer.completion}%
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>
      )}

      {/* TAB 4: PROFIL */}
      {bottomTab === 'profil' && (
        <ScrollView contentContainerStyle={styles.scrollTabContainer}>
          <View style={styles.profileCard}>
            <Image
              source={VISUAL_ASSETS.mascotSplash}
              style={styles.profileUnclippedAvatar}
            />
            <Text style={styles.profileName}>{studentName}</Text>
            <Text style={styles.profileNim}>NIM {studentNim}</Text>
            <Text style={styles.profileProgram}>
              Kelas {studentClass} · {STUDENT_PROFILE.semester} ·{' '}
              {STUDENT_PROFILE.program}
            </Text>
          </View>

          <View style={styles.settingsBox}>
            <View style={styles.settingItemRow}>
              <Text style={styles.settingLabel}>Pengingat Tugas H-1</Text>
              <Switch
                value={reminderEnabled}
                onValueChange={setReminderEnabled}
              />
            </View>
            <View style={styles.settingItemRow}>
              <Text style={styles.settingLabel}>
                Sinkronisasi Google Calendar
              </Text>
              <Switch
                value={googleCalendarSync}
                onValueChange={setGoogleCalendarSync}
              />
            </View>
            <View style={styles.settingItemRow}>
              <Text style={styles.settingLabel}>Pembaruan SIAKAD Otomatis</Text>
              <Switch
                value={siakadAutoUpdate}
                onValueChange={setSiakadAutoUpdate}
              />
            </View>
          </View>

          <TouchableOpacity
            onPress={() => setScreenPhase('auth')}
            style={styles.resetButtonCrimson}
          >
            <Feather name="log-out" size={16} color="#FFFFFF" />
            <Text style={styles.resetButtonText}>Keluar Akun</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* BOTTOM NAVIGATION */}
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

      {/* MODAL TAMBAH / EDIT TUGAS */}
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
            <Text style={styles.modalSheetTitle}>
              {editingTaskItem ? 'Edit Tugas Kuliah' : 'Tambah Tugas Kuliah'}
            </Text>
            <TextInput
              ref={titleInputRef}
              value={newTitle}
              onChangeText={setNewTitle}
              placeholder="Judul Tugas"
              style={styles.sheetInput}
            />
            <View style={styles.modalFooterActions}>
              <TouchableOpacity
                onPress={() => setIsAddTaskModalOpen(false)}
                style={styles.cancelBtn}
              >
                <Text style={styles.cancelBtnText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSubmitTask}
                style={styles.submitBtnCrimson}
              >
                <Text style={styles.submitBtnText}>Simpan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* MODAL TAMBAH MATKUL */}
      <Modal
        visible={isAddCourseModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsAddCourseModalOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.bottomSheetCard}>
            <Text style={styles.modalSheetTitle}>Tambah Mata Kuliah</Text>
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
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFDF9' },
  screenContainer: { flex: 1 },
  scrollTabContainer: { padding: 16, paddingBottom: 110 },
  splashScreenCream: {
    flex: 1,
    backgroundColor: '#FFF7ED',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 40,
  },
  splashTopBrand: { alignItems: 'center', marginTop: 20 },
  splashBrandSubtitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#C41E3A',
    letterSpacing: 1,
  },
  splashBrandLogo: {
    fontSize: 38,
    fontWeight: '900',
    color: '#C41E3A',
    marginTop: 4,
  },
  splashRisingCharacterWrap: { alignItems: 'center', marginBottom: 30 },
  splashCharacterImg: {
    width: 240,
    height: 240,
    borderRadius: 42,
    borderWidth: 3,
    borderColor: '#0F172A',
  },
  splashLoadingHint: {
    marginTop: 16,
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  authScrollContent: {
    padding: 20,
    alignItems: 'center',
  },
  authMascotImg: {
    width: 130,
    height: 130,
    borderRadius: 32,
    borderWidth: 3,
    borderColor: '#0F172A',
    marginTop: 20,
  },
  authGreetingTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
    marginTop: 14,
  },
  authGreetingSub: {
    fontSize: 12,
    color: '#475569',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 18,
  },
  authFormCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#0F172A',
    padding: 16,
  },
  googleAuthBtn: {
    minHeight: 48,
    borderRadius: 16,
    backgroundColor: '#0F172A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  googleAuthBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
    marginLeft: 8,
  },
  airyHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  airyHeaderLeft: { flexDirection: 'row', alignItems: 'center' },
  headerMascotAvatar: {
    width: 44,
    height: 44,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#0F172A',
    marginRight: 10,
  },
  headerGreetingTitle: { fontSize: 16, fontWeight: '900', color: '#0F172A' },
  headerGreetingSub: { fontSize: 11, fontWeight: '600', color: '#64748B' },
  streakBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    borderWidth: 2,
    borderColor: '#0F172A',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  streakBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#C41E3A',
    marginLeft: 4,
  },
  calendarHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 6,
  },
  allDatesChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
  },
  allDatesChipActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  allDatesChipText: { fontSize: 11, fontWeight: '800', color: '#0F172A' },
  activeDateLabel: {
    marginLeft: 8,
    fontSize: 11,
    fontWeight: '800',
    color: '#C41E3A',
  },
  weeklyStripRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  weeklyDayCell: {
    flex: 1,
    minHeight: 54,
    marginHorizontal: 2,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  weeklyDayCellActive: {
    backgroundColor: '#C41E3A',
    borderColor: '#0F172A',
  },
  weeklyDayShort: { fontSize: 10, fontWeight: '700', color: '#64748B' },
  weeklyDayNumber: {
    fontSize: 12,
    fontWeight: '900',
    color: '#0F172A',
    marginTop: 2,
  },
  weeklyDayTextActive: { color: '#FFFFFF' },
  weeklyCountBadge: {
    fontSize: 9,
    fontWeight: '800',
    color: '#C41E3A',
    marginTop: 2,
  },
  searchBarBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 14,
    minHeight: 42,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 13, color: '#0F172A' },
  filterTabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  filterTabBtn: {
    flex: 1,
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  filterTabBtnActive: { borderBottomColor: '#C41E3A' },
  filterTabText: { fontSize: 12, fontWeight: '800', color: '#64748B' },
  filterTabTextActive: { color: '#C41E3A' },
  listContentContainer: { padding: 16, paddingBottom: 110 },
  taskCard: {
    borderRadius: 26,
    borderWidth: 2,
    padding: 12,
    marginBottom: 12,
  },
  taskCardRow: { flexDirection: 'row', alignItems: 'center' },
  taskStickerFrame: {
    width: 56,
    height: 56,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#0F172A',
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    marginRight: 12,
  },
  taskStickerImg: { width: '100%', height: '100%' },
  taskCenterContent: { flex: 1, marginRight: 6 },
  taskCategoryRow: { flexDirection: 'row', alignItems: 'center' },
  categoryBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginRight: 6,
  },
  categoryBadgeText: { fontSize: 9, fontWeight: '800', color: '#FFFFFF' },
  taskCourseSubtitle: { fontSize: 11, fontWeight: '800', flex: 1 },
  taskTitleText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#0F172A',
    marginTop: 2,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#64748B',
  },
  taskMetaInline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  deadlinePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.85)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  deadlinePillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0F172A',
    marginLeft: 4,
  },
  accordionTriggerText: { fontSize: 10, fontWeight: '700', color: '#475569' },
  taskActionsRight: { flexDirection: 'row', alignItems: 'center' },
  iconTouchTarget: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
    borderWidth: 1.5,
    borderColor: '#0F172A',
  },
  checkBtnPending: { backgroundColor: '#FFFFFF' },
  checkBtnCompleted: { backgroundColor: '#059669' },
  whiteActionBtn: { backgroundColor: '#FFFFFF' },
  accordionBody: {
    marginTop: 10,
    padding: 10,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
  accordionDescText: { fontSize: 12, color: '#1E293B', lineHeight: 18 },
  fabCrimson: {
    position: 'absolute',
    right: 20,
    bottom: 88,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#C41E3A',
    borderWidth: 2,
    borderColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  tabHeaderTitle: { fontSize: 20, fontWeight: '900', color: '#0F172A' },
  tabHeaderSub: { fontSize: 12, color: '#64748B', marginTop: 2 },
  addCourseTopBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#C41E3A',
    borderWidth: 2,
    borderColor: '#0F172A',
    minHeight: 42,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  addCourseTopBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
    marginLeft: 4,
  },
  bentoGrid2Col: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  bentoCourseGridCard: {
    width: '48%',
    borderRadius: 26,
    borderWidth: 2,
    borderColor: '#0F172A',
    padding: 12,
    marginBottom: 12,
  },
  bentoCourseStickerWrap: {
    width: '100%',
    height: 100,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#0F172A',
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    marginBottom: 8,
  },
  bentoCourseStickerImg: { width: '100%', height: '100%' },
  bentoCourseCode: { fontSize: 10, fontWeight: '800', color: '#C41E3A' },
  bentoCourseTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#0F172A',
    marginTop: 2,
  },
  bentoCourseLecturer: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
    marginTop: 2,
  },
  olympiadHeroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDE9FE',
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#0F172A',
    padding: 16,
    marginBottom: 14,
  },
  olympiadOverline: { fontSize: 10, fontWeight: '800', color: '#4F46E5' },
  olympiadBigPercent: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1E1B4B',
    marginTop: 4,
  },
  olympiadSubText: { fontSize: 12, fontWeight: '600', color: '#3730A3' },
  olympiadTrophyImg: {
    width: 84,
    height: 84,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#0F172A',
  },
  leaderboardContainer: {
    backgroundColor: '#134E4A',
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#0F172A',
    padding: 16,
  },
  leaderboardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  leaderboardTitle: { fontSize: 16, fontWeight: '900', color: '#FFFFFF' },
  periodSwitchBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  periodSwitchText: { fontSize: 11, fontWeight: '800', color: '#134E4A' },
  leaderboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#0F172A',
    padding: 10,
    marginBottom: 8,
  },
  leaderboardRank: {
    fontSize: 13,
    fontWeight: '900',
    color: '#C41E3A',
    width: 28,
  },
  leaderboardAvatar: {
    width: 36,
    height: 36,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#0F172A',
    marginRight: 10,
  },
  leaderboardPeerName: { fontSize: 13, fontWeight: '800', color: '#0F172A' },
  leaderboardPeerScore: { fontSize: 11, color: '#475569' },
  leaderboardPercentBadge: {
    fontSize: 12,
    fontWeight: '900',
    color: '#0F172A',
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#0F172A',
    padding: 20,
    alignItems: 'center',
    marginBottom: 14,
  },
  profileUnclippedAvatar: {
    width: 96,
    height: 96,
    borderRadius: 28,
    borderWidth: 3,
    borderColor: '#0F172A',
  },
  profileName: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
    marginTop: 10,
  },
  profileNim: {
    fontSize: 12,
    fontWeight: '800',
    color: '#C41E3A',
    marginTop: 2,
  },
  profileProgram: { fontSize: 12, color: '#64748B', marginTop: 4 },
  settingsBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#0F172A',
    padding: 14,
    marginBottom: 14,
  },
  settingItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 48,
  },
  settingLabel: { fontSize: 13, fontWeight: '800', color: '#0F172A' },
  resetButtonCrimson: {
    minHeight: 50,
    borderRadius: 22,
    backgroundColor: '#C41E3A',
    borderWidth: 2,
    borderColor: '#0F172A',
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
    borderColor: '#0F172A',
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
  bottomNavButtonActive: { backgroundColor: '#C41E3A' },
  bottomNavLabelActive: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
    marginLeft: 6,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.55)',
    justifyContent: 'flex-end',
  },
  bottomSheetCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderWidth: 2,
    borderColor: '#0F172A',
    padding: 20,
  },
  modalSheetTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 12,
  },
  sheetInput: {
    width: '100%',
    minHeight: 46,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    marginBottom: 10,
    fontSize: 13,
    fontWeight: '700',
  },
  modalFooterActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
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
  cancelBtnText: { fontSize: 13, fontWeight: '800', color: '#334155' },
  submitBtnCrimson: {
    flex: 1,
    minHeight: 48,
    borderRadius: 16,
    backgroundColor: '#C41E3A',
    borderWidth: 2,
    borderColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnText: { fontSize: 13, fontWeight: '800', color: '#FFFFFF' },
});
