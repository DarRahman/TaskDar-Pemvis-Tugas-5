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
import { registerRootComponent } from 'expo';
import { WebView } from 'react-native-webview';

const VISUAL_ASSETS = {
  mascotSplash: require('./public/assets/mascot-splash.webp'),
  stickerCoding: require('./public/assets/sticker-coding.webp'),
  stickerRobotics: require('./public/assets/sticker-robotics.webp'),
  stickerData: require('./public/assets/sticker-data.webp'),
  stickerSecurity: require('./public/assets/sticker-security.webp'),
  stickerOop: require('./public/assets/sticker-oop.webp'),
  stickerAi: require('./public/assets/sticker-ai.webp'),
  stickerDesign: require('./public/assets/sticker-design.webp'),
  olympiadTrophy: require('./public/assets/olympiad-trophy.webp'),
};

const DEFAULT_STUDENT_PROFILE = {
  name: '',
  shortName: 'Mahasiswa',
  nim: '',
  classGroup: 'TI-1',
  semester: 'Semester 5',
  program: 'Teknik Informatika',
  institution: '',
  email: '',
  streakDays: 6,
};

const STICKER_OPTIONS = [
  { id: 'coding', label: 'Koding', source: VISUAL_ASSETS.stickerCoding },
  { id: 'robotics', label: 'Robotik', source: VISUAL_ASSETS.stickerRobotics },
  { id: 'data', label: 'Data', source: VISUAL_ASSETS.stickerData },
  { id: 'security', label: 'Siber', source: VISUAL_ASSETS.stickerSecurity },
  { id: 'oop', label: 'Sistem', source: VISUAL_ASSETS.stickerOop },
  { id: 'ai', label: 'Pintar', source: VISUAL_ASSETS.stickerAi },
  { id: 'design', label: 'Visual', source: VISUAL_ASSETS.stickerDesign },
  { id: 'mascot', label: 'Maskot', source: VISUAL_ASSETS.mascotSplash },
];

const BENTO_COLOR_THEMES = [
  {
    id: 'crimson',
    label: 'Merah',
    pastelBg: '#FEE2E2',
    pastelBorder: '#FECACA',
    accentColor: '#C41E3A',
    iconBg: '#C41E3A',
  },
  {
    id: 'indigo',
    label: 'Indigo',
    pastelBg: '#EEF2FF',
    pastelBorder: '#C7D2FE',
    accentColor: '#4F46E5',
    iconBg: '#4F46E5',
  },
  {
    id: 'amber',
    label: 'Jingga',
    pastelBg: '#FEF3C7',
    pastelBorder: '#FDE68A',
    accentColor: '#D97706',
    iconBg: '#D97706',
  },
  {
    id: 'emerald',
    label: 'Hijau',
    pastelBg: '#D1FAE5',
    pastelBorder: '#A7F3D0',
    accentColor: '#059669',
    iconBg: '#059669',
  },
  {
    id: 'cyan',
    label: 'Sian',
    pastelBg: '#CFFAFE',
    pastelBorder: '#A5F3FC',
    accentColor: '#0891B2',
    iconBg: '#0891B2',
  },
  {
    id: 'purple',
    label: 'Ungu RGB',
    pastelBg: '#F3E8FF',
    pastelBorder: '#E9D5FF',
    accentColor: '#7C3AED',
    iconBg: '#7C3AED',
  },
];

const INITIAL_COURSES = [
  {
    id: 'course-ti361',
    code: 'TI361',
    name: 'Pemrograman Visual I',
    lecturer: 'Rifky Hilmanudin, S.Kom., M.Kom.',
    credits: 3,
    schedule: 'Selasa, 08:00 - 10:30 WIB',
    room: 'Lab Multimedia',
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
    lecturer: 'Dr. Faisal Akbar, S.Kom., M.T.',
    credits: 2,
    schedule: 'Selasa, 10:30 - 11:40 WIB',
    room: 'Ruang 203',
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
    lecturer: 'Prio Wahono, M.Kom.',
    credits: 3,
    schedule: 'Sabtu, 08:00 - 10:30 WIB',
    room: 'Ruang 103',
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
    lecturer: 'Sergi Roseli, S.Kom., M.Kom.',
    credits: 3,
    schedule: 'Kamis, 13:00 - 15:30 WIB',
    room: 'Ruang 205',
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
    lecturer: 'Wahyu Ariandi, S.Kom., M.Cs.',
    credits: 3,
    schedule: 'Sabtu, 10:30 - 13:00 WIB',
    room: 'Ruang 103',
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
    description:
      'Merancang antarmuka aplikasi daftar tugas mahasiswa dengan fitur pencarian langsung, filter status penyelesaian, dan ringkasan progres.',
    deadline: '09 Nov 2026',
    status: 'Belum Dikerjakan',
  },
  {
    id: 'task-ti361-02',
    title: 'Tugas Pertemuan 3 & 4 - Komponen & State Management React Native',
    course: 'Pemrograman Visual I',
    category: 'Teori',
    description:
      'Implementasi hooks useState, useEffect, useMemo, useCallback, useRef, dan useReducer pada antarmuka mobile.',
    deadline: '02 Nov 2026',
    status: 'Selesai',
  },
  {
    id: 'task-ti361-03',
    title: 'Tugas Pertemuan 2 - Sintaks ES6, State, dan Props Dasar',
    course: 'Pemrograman Visual I',
    category: 'Teori',
    description:
      'Pengenalan props, immutable data, functional component, dan siklus render antarmuka React Native.',
    deadline: '19 Okt 2026',
    status: 'Selesai',
  },
  {
    id: 'task-rob-04',
    title: 'Tugas 2 Robotika 26/27 - Kinematika dan Transformasi Koordinat',
    course: 'Robotika',
    category: 'Praktikum',
    description:
      'Perhitungan kinematika maju, koordinat silinder, dan matriks rotasi 3D robot manipulator.',
    deadline: '15 Okt 2026',
    status: 'Selesai',
  },
  {
    id: 'task-dwdm-05',
    title: 'Tugas 2 - Analisis Fenomena 3V Big Data Tokopedia dan Shopee',
    course: 'Data Warehouse & Data Mining',
    category: 'Teori',
    description:
      'Karakteristik Volume, Velocity, Variety pada arsitektur data lake e-commerce dan pipeline analitik data.',
    deadline: '28 Okt 2026',
    status: 'Selesai',
  },
];

const WEEKLY_DAYS = [
  { short: 'Sen', num: '3', fullDate: '03 Nov 2026', hours: 3.5 },
  { short: 'Sel', num: '4', fullDate: '04 Nov 2026', hours: 4.0 },
  { short: 'Rab', num: '5', fullDate: '05 Nov 2026', hours: 4.5 },
  { short: 'Kam', num: '6', fullDate: '06 Nov 2026', hours: 3.0 },
  { short: 'Jum', num: '7', fullDate: '07 Nov 2026', hours: 5.0 },
  { short: 'Sab', num: '8', fullDate: '08 Nov 2026', hours: 4.2 },
  { short: 'Min', num: '9', fullDate: '09 Nov 2026', hours: 2.5 },
];

const DAY_CHIPS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

const QUICK_DATE_CHIPS = [
  { label: 'Hari Ini', value: '08 Nov 2026' },
  { label: 'Besok', value: '09 Nov 2026' },
  { label: 'Rabu Depan', value: '11 Nov 2026' },
  { label: 'Senin Depan', value: '16 Nov 2026' },
];

function taskReducer(state, action) {
  switch (action.type) {
    case 'ADD_TASK': {
      const newTask = {
        id: `task-${Date.now()}`,
        title: action.payload.title.trim(),
        course: action.payload.course.trim(),
        category: action.payload.category || 'Praktikum',
        description: action.payload.description.trim(),
        deadline: action.payload.deadline.trim(),
        status: 'Belum Dikerjakan',
      };
      return [newTask, ...state];
    }
    case 'EDIT_TASK':
      return state.map((task) =>
        task.id === action.payload.id
          ? {
              ...task,
              title: action.payload.title.trim(),
              course: action.payload.course.trim(),
              category: action.payload.category,
              description: action.payload.description.trim(),
              deadline: action.payload.deadline.trim(),
            }
          : task
      );
    case 'DELETE_TASK':
      return state.filter((task) => task.id !== action.payload);
    case 'TOGGLE_STATUS':
      return state.map((task) =>
        task.id === action.payload
          ? {
              ...task,
              status:
                task.status === 'Selesai' ? 'Belum Dikerjakan' : 'Selesai',
            }
          : task
      );
    case 'RESET_TASKS':
      return INITIAL_TASKS.map((item) => ({ ...item }));
    default:
      return state;
  }
}

const TaskCard = React.memo(function TaskCard({
  task,
  courses,
  onToggleStatus,
  onDeleteTask,
  onEditTask,
}) {
  const [expanded, setExpanded] = useState(false);
  const isCompleted = task.status === 'Selesai';

  const matchedCourse =
    courses.find(
      (c) => c.name.toLowerCase() === task.course.toLowerCase()
    ) || INITIAL_COURSES[0];

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
      <View style={styles.taskCardTopRow}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => setExpanded((prev) => !prev)}
          style={[
            styles.taskStickerBox,
            isCompleted && styles.taskStickerBoxCompleted,
          ]}
        >
          <Image
            source={matchedCourse.stickerSource}
            style={styles.taskStickerImg}
            resizeMode="cover"
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.taskCenterArea}
          activeOpacity={0.85}
          onPress={() => setExpanded((prev) => !prev)}
        >
          <View style={styles.taskBadgeRow}>
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
              style={[
                styles.taskCourseLabel,
                { color: matchedCourse.accentColor },
              ]}
              numberOfLines={1}
            >
              {task.course}
            </Text>
          </View>

          <Text
            style={[
              styles.taskTitle,
              isCompleted && styles.taskTitleCompleted,
            ]}
            numberOfLines={expanded ? undefined : 2}
          >
            {task.title}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.taskFooterBar}>
        <View style={styles.taskFooterLeft}>
          <View style={styles.deadlineBadge}>
            <Feather
              name="calendar"
              size={12}
              color={isCompleted ? '#64748B' : matchedCourse.iconBg}
            />
            <Text style={styles.deadlineText}>{task.deadline}</Text>
          </View>

          <TouchableOpacity
            onPress={() => setExpanded((prev) => !prev)}
            style={styles.rincianBtn}
          >
            <Text style={styles.rincianText}>
              {expanded ? 'Tutup' : 'Rincian'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.taskActionRow}>
          <TouchableOpacity
            onPress={() => onToggleStatus(task.id)}
            style={[
              styles.checkPillBtn,
              isCompleted && styles.checkPillBtnActive,
            ]}
          >
            <Feather
              name="check"
              size={13}
              color={isCompleted ? '#FFFFFF' : '#0F172A'}
            />
            <Text
              style={[
                styles.checkPillText,
                isCompleted && { color: '#FFFFFF' },
              ]}
            >
              {isCompleted ? 'Selesai' : 'Tandai'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => onEditTask(task)}
            style={styles.iconActionBtn}
          >
            <Feather name="edit-2" size={14} color="#334155" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => onDeleteTask(task.id)}
            style={styles.iconActionBtn}
          >
            <Feather name="trash-2" size={14} color="#C41E3A" />
          </TouchableOpacity>
        </View>
      </View>

      {expanded && (
        <View style={styles.taskExpandedArea}>
          <Text style={styles.taskDescription}>{task.description}</Text>
        </View>
      )}
    </View>
  );
});

export default function App() {
  const [tasks, dispatch] = useReducer(taskReducer, INITIAL_TASKS);

  const [screenPhase, setScreenPhase] = useState('splash');
  const [studentUser, setStudentUser] = useState({
    ...DEFAULT_STUDENT_PROFILE,
    avatarSource: VISUAL_ASSETS.mascotSplash,
  });
  const [courses, setCourses] = useState(INITIAL_COURSES);
  const [bottomTab, setBottomTab] = useState('tugas');

  const [selectedDayDate, setSelectedDayDate] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilterTab, setActiveFilterTab] = useState('Semua');
  const [selectedCourseFilter, setSelectedCourseFilter] = useState('Semua');
  const [leaderboardMode, setLeaderboardMode] = useState('course');

  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskCategory, setTaskCategory] = useState('Praktikum');
  const [taskCourse, setTaskCourse] = useState(INITIAL_COURSES[0].name);
  const [taskDeadline, setTaskDeadline] = useState('08 Nov 2026');
  const [taskDesc, setTaskDesc] = useState('');

  const [isAddCourseOpen, setIsAddCourseOpen] = useState(false);
  const [courseName, setCourseName] = useState('');
  const [courseLecturer, setCourseLecturer] = useState('');
  const [courseCredits, setCourseCredits] = useState('3');
  const [courseDay, setCourseDay] = useState('Senin');
  const [courseTime, setCourseTime] = useState('08:00 - 10:30 WIB');
  const [courseRoom, setCourseRoom] = useState('Lab Mobile 2');
  const [courseSticker, setCourseSticker] = useState(STICKER_OPTIONS[0]);
  const [courseTheme, setCourseTheme] = useState(BENTO_COLOR_THEMES[0]);

  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [calendarSyncEnabled, setCalendarSyncEnabled] = useState(true);
  const [portalSyncEnabled, setPortalSyncEnabled] = useState(true);

  const titleInputRef = useRef(null);
  const splashTranslateY = useRef(new Animated.Value(180)).current;

  useEffect(() => {
    if (screenPhase === 'splash') {
      Animated.spring(splashTranslateY, {
        toValue: 0,
        friction: 6,
        tension: 50,
        useNativeDriver: true,
      }).start();

      const timer = setTimeout(() => {
        setScreenPhase('auth');
      }, 2300);
      return () => clearTimeout(timer);
    }
  }, [screenPhase, splashTranslateY]);

  useEffect(() => {
    console.log(
      '[TaskDar - Pencarian Langsung] Kata kunci aktif:',
      searchQuery.trim() === '' ? '(kosong)' : searchQuery.trim()
    );
  }, [searchQuery]);

  const taskMetrics = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === 'Selesai').length;
    const pending = total - completed;
    const completionRate =
      total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, pending, completed, completionRate };
  }, [tasks]);

  const personalLeaderboard = useMemo(() => {
    if (leaderboardMode === 'course') {
      return courses
        .map((c) => {
          const list = tasks.filter(
            (t) => t.course.toLowerCase() === c.name.toLowerCase()
          );
          const done = list.filter((t) => t.status === 'Selesai').length;
          const total = list.length;
          const rate = total > 0 ? Math.round((done / total) * 100) : 0;
          const xp = done * 85 + total * 20;
          return {
            id: c.id,
            title: c.name,
            subtitle: `${c.code} · ${done}/${total} Tugas Selesai`,
            stickerSource: c.stickerSource,
            rate,
            xp,
            accentColor: c.iconBg,
          };
        })
        .sort((a, b) => b.rate - a.rate || b.xp - a.xp);
    }

    const categories = ['Praktikum', 'Proyek', 'Teori', 'Kuis'];
    return categories
      .map((cat, idx) => {
        const list = tasks.filter((t) => (t.category || 'Praktikum') === cat);
        const done = list.filter((t) => t.status === 'Selesai').length;
        const total = list.length;
        const rate = total > 0 ? Math.round((done / total) * 100) : 0;
        const xp = done * 90 + total * 25;
        return {
          id: `cat-${cat}`,
          title: `Kategori ${cat}`,
          subtitle: `${done}/${total} Tugas Selesai`,
          stickerSource: STICKER_OPTIONS[idx % STICKER_OPTIONS.length].source,
          rate,
          xp,
          accentColor: BENTO_COLOR_THEMES[idx % BENTO_COLOR_THEMES.length].iconBg,
        };
      })
      .sort((a, b) => b.rate - a.rate || b.xp - a.xp);
  }, [leaderboardMode, courses, tasks]);

  const filteredTasks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return tasks.filter((t) => {
      const matchStatus =
        activeFilterTab === 'Semua' ? true : t.status === activeFilterTab;
      const matchCourse =
        selectedCourseFilter === 'Semua'
          ? true
          : t.course.toLowerCase() === selectedCourseFilter.toLowerCase();
      const matchDate =
        selectedDayDate === 'Semua' ? true : t.deadline === selectedDayDate;
      const matchKeyword =
        q === '' ||
        t.title.toLowerCase().includes(q) ||
        t.course.toLowerCase().includes(q);
      return matchStatus && matchCourse && matchDate && matchKeyword;
    });
  }, [
    tasks,
    activeFilterTab,
    selectedCourseFilter,
    selectedDayDate,
    searchQuery,
  ]);

  const handleToggleStatus = useCallback((id) => {
    dispatch({ type: 'TOGGLE_STATUS', payload: id });
  }, []);

  const handleDeleteTask = useCallback((id) => {
    dispatch({ type: 'DELETE_TASK', payload: id });
  }, []);

  const handleOpenEditTask = useCallback((taskItem) => {
    setEditingTask(taskItem);
    setTaskTitle(taskItem.title);
    setTaskCategory(taskItem.category || 'Praktikum');
    setTaskCourse(taskItem.course);
    setTaskDeadline(taskItem.deadline);
    setTaskDesc(taskItem.description);
    setIsAddTaskOpen(true);
  }, []);

  const handleAddTask = useCallback(() => {
    if (!taskTitle.trim()) return;
    dispatch({
      type: 'ADD_TASK',
      payload: {
        title: taskTitle,
        course: taskCourse,
        category: taskCategory,
        deadline: taskDeadline,
        description: taskDesc || `Tugas ${taskCourse}`,
      },
    });
    setTaskTitle('');
    setTaskDesc('');
    setIsAddTaskOpen(false);
    setTimeout(() => {
      titleInputRef.current?.focus();
    }, 150);
  }, [taskTitle, taskCourse, taskCategory, taskDeadline, taskDesc]);

  const handleSaveTask = useCallback(() => {
    if (!taskTitle.trim()) return;
    if (editingTask) {
      dispatch({
        type: 'EDIT_TASK',
        payload: {
          id: editingTask.id,
          title: taskTitle,
          course: taskCourse,
          category: taskCategory,
          deadline: taskDeadline,
          description: taskDesc || `Tugas ${taskCourse}`,
        },
      });
      setEditingTask(null);
      setTaskTitle('');
      setTaskDesc('');
      setIsAddTaskOpen(false);
    } else {
      handleAddTask();
    }
  }, [editingTask, taskTitle, taskCourse, taskCategory, taskDeadline, taskDesc, handleAddTask]);

  const handleSaveCourse = () => {
    if (!courseName.trim() || !courseLecturer.trim()) return;
    const newCourse = {
      id: `course-${Date.now()}`,
      code: `MK${361 + courses.length}`,
      name: courseName.trim(),
      lecturer: courseLecturer.trim(),
      credits: parseInt(courseCredits, 10) || 3,
      schedule: `${courseDay}, ${courseTime}`,
      room: courseRoom.trim(),
      stickerSource: courseSticker.source,
      pastelBg: courseTheme.pastelBg,
      pastelBorder: courseTheme.pastelBorder,
      accentColor: courseTheme.accentColor,
      iconBg: courseTheme.iconBg,
    };
    setCourses((prev) => [...prev, newCourse]);
    setCourseName('');
    setCourseLecturer('');
    setIsAddCourseOpen(false);
  };

  return (
    <SafeAreaView style={styles.flexOne}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFDF9" />
      <WebView
        source={{ uri: 'http://192.168.1.74:3000' }}
        style={styles.flexOne}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        allowsInlineMediaPlayback={true}
        scalesPageToFit={true}
        originWhitelist={['*']}
      />
    </SafeAreaView>
  );

  if (screenPhase === 'splash') {
    return (
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => setScreenPhase('auth')}
        style={styles.splashContainer}
      >
        <StatusBar barStyle="light-content" backgroundColor="#E85D56" />
        <Animated.View
          style={[
            styles.splashCenterWrap,
            { transform: [{ translateY: splashTranslateY }] },
          ]}
        >
          <View style={styles.eyesRow}>
            <View style={styles.eyeCircle}>
              <View style={styles.eyePupil} />
            </View>
            <View style={styles.eyeCircle}>
              <View style={styles.eyePupil} />
            </View>
          </View>
          <Text style={styles.splashWordmark}>TaskDar</Text>
          <Text style={styles.splashTagline}>
            Teman Belajar & Pengatur Tugas Kuliahmu
          </Text>
        </Animated.View>
      </TouchableOpacity>
    );
  }

    if (screenPhase === 'auth') {
    return (
      <SafeAreaView style={styles.authContainer}>
        <ScrollView contentContainerStyle={styles.authScroll}>
          <View style={styles.authMascotBox}>
            <Image
              source={VISUAL_ASSETS.mascotSplash}
              style={styles.authMascotImg}
            />
          </View>
          <Text style={styles.authTitle}>Selamat Datang di TaskDar</Text>
          <Text style={styles.authSubtitle}>
            Masuk dengan Akun Google atau isi identitas kampusmu
          </Text>

          <View style={styles.authCard}>
            <TouchableOpacity
              onPress={() => setScreenPhase('main')}
              style={styles.googleBtn}
            >
              <Feather name="globe" size={16} color="#0F172A" />
              <Text style={styles.googleBtnText}>
                Masuk Cepat dengan Akun Google
              </Text>
            </TouchableOpacity>

            <Text style={styles.inputLabel}>Nama Lengkap</Text>
            <TextInput
              value={studentUser.name}
              onChangeText={(v) =>
                setStudentUser((prev) => ({
                  ...prev,
                  name: v,
                  shortName: v.split(' ')[0] || v,
                }))
              }
              placeholder="Contoh: Badar Rahman"
              placeholderTextColor="#94A3B8"
              style={styles.textInput}
            />

            <Text style={styles.inputLabel}>NIM / NPM</Text>
            <TextInput
              value={studentUser.nim}
              onChangeText={(v) =>
                setStudentUser((prev) => ({ ...prev, nim: v }))
              }
              placeholder="Contoh: 14524303"
              placeholderTextColor="#94A3B8"
              style={styles.textInput}
            />

            <Text style={styles.inputLabel}>Nama Kampus / Perguruan Tinggi</Text>
            <TextInput
              value={studentUser.institution}
              onChangeText={(v) =>
                setStudentUser((prev) => ({ ...prev, institution: v }))
              }
              placeholder="Contoh: STIKOM Poltek Cirebon"
              placeholderTextColor="#94A3B8"
              style={styles.textInput}
            />

            <TouchableOpacity
              onPress={() => setScreenPhase('main')}
              style={styles.primaryBtn}
            >
              <Text style={styles.primaryBtnText}>Mulai Gunakan TaskDar</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.mainContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFDF9" />

      {}
      {bottomTab === 'tugas' && (
        <View style={styles.flexOne}>
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <Image
                source={studentUser.avatarSource}
                style={styles.headerAvatar}
              />
              <View>
                <Text style={styles.greetingTitle}>
                  Halo, {studentUser.shortName}!
                </Text>
                <Text style={styles.greetingSub}>
                  {taskMetrics.pending} tugas aktif · {taskMetrics.completionRate}% tuntas
                </Text>
              </View>
            </View>
            <View style={styles.streakBadge}>
              <Feather name="zap" size={14} color="#C41E3A" />
              <Text style={styles.streakText}>{studentUser.streakDays}h</Text>
            </View>
          </View>

          <View style={styles.calendarStripWrap}>
            <View style={styles.calendarTopBar}>
              <TouchableOpacity
                onPress={() => setSelectedDayDate('Semua')}
                style={[
                  styles.allDateChip,
                  selectedDayDate === 'Semua' && styles.allDateChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.allDateChipText,
                    selectedDayDate === 'Semua' && { color: '#FFFFFF' },
                  ]}
                >
                  Semua Tanggal ({tasks.length})
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.weekRow}>
              {WEEKLY_DAYS.map((d) => {
                const selected = selectedDayDate === d.fullDate;
                return (
                  <TouchableOpacity
                    key={d.fullDate}
                    onPress={() =>
                      setSelectedDayDate((prev) =>
                        prev === d.fullDate ? 'Semua' : d.fullDate
                      )
                    }
                    style={[
                      styles.dayPill,
                      selected && styles.dayPillSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayShortText,
                        selected && { color: '#FFFFFF' },
                      ]}
                    >
                      {d.short}
                    </Text>
                    <Text
                      style={[
                        styles.dayNumText,
                        selected && { color: '#FFFFFF' },
                      ]}
                    >
                      {d.num}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.searchWrap}>
            <Feather name="search" size={16} color="#64748B" />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Cari tugas, mata kuliah, atau kategori..."
              placeholderTextColor="#94A3B8"
              style={styles.searchInput}
            />
          </View>

          <View style={styles.filterTabsRow}>
            {['Semua', 'Belum Dikerjakan', 'Selesai'].map((tab) => {
              const active = activeFilterTab === tab;
              return (
                <TouchableOpacity
                  key={tab}
                  onPress={() => setActiveFilterTab(tab)}
                  style={[styles.filterTabBtn, active && styles.filterTabActive]}
                >
                  <Text
                    style={[
                      styles.filterTabText,
                      active && styles.filterTabTextActive,
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
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <TaskCard
                task={item}
                courses={courses}
                onToggleStatus={handleToggleStatus}
                onDeleteTask={handleDeleteTask}
                onEditTask={handleOpenEditTask}
              />
            )}
          />

          <TouchableOpacity
            onPress={() => {
              setEditingTask(null);
              setIsAddTaskOpen(true);
            }}
            style={styles.fabBtn}
          >
            <Feather name="plus" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      )}

      {}
      {bottomTab === 'matakuliah' && (
        <ScrollView contentContainerStyle={styles.listContent}>
          <View style={styles.sectionHeaderRow}>
            <View>
              <Text style={styles.sectionTitle}>Mata Kuliah</Text>
              <Text style={styles.greetingSub}>
                {courses.length} Mata Kuliah ({studentUser.semester})
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setIsAddCourseOpen(true)}
              style={styles.addCourseHeaderBtn}
            >
              <Feather name="plus" size={14} color="#FFFFFF" />
              <Text style={styles.addCourseHeaderText}>Matkul</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.bentoGridWrap}>
            {courses.map((course) => (
              <View
                key={course.id}
                style={[
                  styles.courseBentoCard,
                  { backgroundColor: course.pastelBg },
                ]}
              >
                <View
                  style={[
                    styles.courseCodeBadge,
                    { backgroundColor: course.iconBg },
                  ]}
                >
                  <Text style={styles.courseCodeText}>
                    {course.code} · {course.credits} SKS
                  </Text>
                </View>

                <View style={styles.courseArtBox}>
                  <Image
                    source={course.stickerSource}
                    style={styles.courseArtImg}
                    resizeMode="cover"
                  />
                </View>

                <Text style={styles.courseBentoTitle} numberOfLines={2}>
                  {course.name}
                </Text>
                <Text style={styles.courseBentoSub} numberOfLines={1}>
                  {course.lecturer}
                </Text>
                <Text style={styles.courseBentoSchedule} numberOfLines={1}>
                  {course.schedule}
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>
      )}

      {}
      {bottomTab === 'progres' && (
        <ScrollView contentContainerStyle={styles.listContent}>
          <Text style={styles.sectionTitle}>Progres & Capaianmu</Text>

          <View style={styles.olympiadHeroCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.olympiadRateText}>
                {taskMetrics.completionRate}% Tuntas
              </Text>
              <Text style={styles.olympiadSubText}>
                {taskMetrics.completed} dari {taskMetrics.total} tugas selesai
              </Text>
            </View>
            <Image
              source={VISUAL_ASSETS.olympiadTrophy}
              style={styles.trophyImg}
            />
          </View>

          <View style={styles.leaderboardContainer}>
            <View style={styles.leaderboardHeaderRow}>
              <Text style={styles.leaderboardTitle}>
                {leaderboardMode === 'course'
                  ? 'Leaderboard Mata Kuliahmu'
                  : 'Leaderboard Kategori Tugas'}
              </Text>
              <View style={styles.modeSwitchRow}>
                <TouchableOpacity
                  onPress={() => setLeaderboardMode('course')}
                  style={[
                    styles.modeSwitchBtn,
                    leaderboardMode === 'course' && styles.modeSwitchBtnActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.modeSwitchText,
                      leaderboardMode === 'course' && { color: '#134E4A' },
                    ]}
                  >
                    Matkul
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setLeaderboardMode('category')}
                  style={[
                    styles.modeSwitchBtn,
                    leaderboardMode === 'category' && styles.modeSwitchBtnActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.modeSwitchText,
                      leaderboardMode === 'category' && { color: '#134E4A' },
                    ]}
                  >
                    Kategori
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {personalLeaderboard.map((item, idx) => (
              <View key={item.id} style={styles.leaderboardRow}>
                <View style={styles.leaderboardLeft}>
                  <View
                    style={[
                      styles.rankCircle,
                      { backgroundColor: item.accentColor },
                    ]}
                  >
                    <Text style={styles.rankText}>#{idx + 1}</Text>
                  </View>
                  <Image
                    source={item.stickerSource}
                    style={styles.leaderAvatar}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.leaderName} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Text style={styles.leaderSub} numberOfLines={1}>
                      {item.subtitle} · {item.xp} XP
                    </Text>
                  </View>
                </View>
                <View style={styles.leaderRateBadge}>
                  <Text style={styles.leaderRateText}>{item.rate}%</Text>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      )}

      {}
      {bottomTab === 'profil' && (
        <ScrollView contentContainerStyle={styles.listContent}>
          <View style={styles.profileCard}>
            <TouchableOpacity
              onPress={() => setIsEditProfileOpen(true)}
              style={styles.campusBadge}
            >
              <Text style={styles.campusBadgeText}>
                {studentUser.institution} (Ubah)
              </Text>
            </TouchableOpacity>

            <Image
              source={studentUser.avatarSource}
              style={styles.profileBigAvatar}
            />
            <Text style={styles.profileName}>{studentUser.name}</Text>
            <Text style={styles.profileNim}>NIM / NPM: {studentUser.nim}</Text>
            <Text style={styles.greetingSub}>
              Kelas {studentUser.classGroup} · {studentUser.semester} ·{' '}
              {studentUser.program}
            </Text>

            <View style={styles.avatarGrid}>
              {STICKER_OPTIONS.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() =>
                    setStudentUser((prev) => ({
                      ...prev,
                      avatarSource: item.source,
                    }))
                  }
                  style={styles.avatarChoiceBtn}
                >
                  <Image source={item.source} style={styles.avatarChoiceImg} />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.googleAccountCard}>
            <View>
              <Text style={styles.googleAccountTitle}>
                Akun Google Terhubung
              </Text>
              <Text style={styles.greetingSub}>{studentUser.email}</Text>
            </View>
            <View style={styles.syncBadge}>
              <Text style={styles.syncBadgeText}>Aktif</Text>
            </View>
          </View>

          <View style={styles.settingsCard}>
            <View style={[styles.settingRow, { borderBottomWidth: 0 }]}>
              <View>
                <Text style={styles.settingLabel}>Pengingat Tugas H-1</Text>
                <Text style={styles.settingSubLabel}>Notifikasi sistem H-1 & hari ini</Text>
              </View>
              <Switch
                value={reminderEnabled}
                onValueChange={setReminderEnabled}
                trackColor={{ false: '#CBD5E1', true: '#C41E3A' }}
              />
            </View>
          </View>

          <View style={styles.profileActionsRow}>
            <TouchableOpacity
              onPress={() => dispatch({ type: 'RESET_TASKS' })}
              style={styles.resetBtn}
            >
              <Text style={styles.resetBtnText}>Atur Ulang Data</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setScreenPhase('auth')}
              style={styles.logoutBtn}
            >
              <Text style={styles.logoutBtnText}>Keluar Akun</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      {}
      <Modal visible={isAddTaskOpen} transparent animationType="slide">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalBackdrop}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {editingTask ? 'Edit Tugas Kuliah' : 'Tambah Tugas Baru'}
            </Text>
            <TextInput
              ref={titleInputRef}
              value={taskTitle}
              onChangeText={setTaskTitle}
              placeholder="Laporan praktikum robotik"
              style={styles.textInput}
            />
            <View style={styles.quickDateRow}>
              {QUICK_DATE_CHIPS.map((c) => (
                <TouchableOpacity
                  key={c.label}
                  onPress={() => setTaskDeadline(c.value)}
                  style={styles.quickChip}
                >
                  <Text style={styles.quickChipText}>{c.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              value={taskDeadline}
              onChangeText={setTaskDeadline}
              placeholder="Tanggal Tenggat"
              style={styles.textInput}
            />
            <View style={styles.modalActionRow}>
              <TouchableOpacity
                onPress={() => setIsAddTaskOpen(false)}
                style={styles.resetBtn}
              >
                <Text style={styles.resetBtnText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSaveTask}
                style={styles.logoutBtn}
              >
                <Text style={styles.logoutBtnText}>Simpan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {}
      <Modal visible={isAddCourseOpen} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <ScrollView contentContainerStyle={styles.modalCard}>
            <Text style={styles.modalTitle}>Tambah Mata Kuliah</Text>
            <TextInput
              value={courseName}
              onChangeText={setCourseName}
              placeholder="Pemvis 1"
              style={styles.textInput}
            />
            <TextInput
              value={courseLecturer}
              onChangeText={setCourseLecturer}
              placeholder="Dosen Pengampu"
              style={styles.textInput}
            />
            <TextInput
              value={courseCredits}
              onChangeText={setCourseCredits}
              keyboardType="numeric"
              placeholder="Jumlah SKS (Ketik angka)"
              style={styles.textInput}
            />
            <View style={styles.quickDateRow}>
              {DAY_CHIPS.map((d) => (
                <TouchableOpacity
                  key={d}
                  onPress={() => setCourseDay(d)}
                  style={[
                    styles.quickChip,
                    courseDay === d && { backgroundColor: '#FEE2E2' },
                  ]}
                >
                  <Text style={styles.quickChipText}>{d.slice(0, 3)}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              value={courseTime}
              onChangeText={setCourseTime}
              placeholder="Jam perkuliahan (08:00 - 10:30 WIB)"
              style={styles.textInput}
            />
            <View style={styles.modalActionRow}>
              <TouchableOpacity
                onPress={() => setIsAddCourseOpen(false)}
                style={styles.resetBtn}
              >
                <Text style={styles.resetBtnText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSaveCourse}
                style={styles.logoutBtn}
              >
                <Text style={styles.logoutBtnText}>Simpan</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {}
      <Modal visible={isEditProfileOpen} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Ubah Profil & Kampus</Text>
            <TextInput
              value={studentUser.name}
              onChangeText={(v) =>
                setStudentUser((prev) => ({
                  ...prev,
                  name: v,
                  shortName: v.split(' ')[0] || v,
                }))
              }
              placeholder="Nama Lengkap"
              style={styles.textInput}
            />
            <TextInput
              value={studentUser.nim}
              onChangeText={(v) =>
                setStudentUser((prev) => ({ ...prev, nim: v }))
              }
              placeholder="NIM / NPM"
              style={styles.textInput}
            />
            <TextInput
              value={studentUser.institution}
              onChangeText={(v) =>
                setStudentUser((prev) => ({ ...prev, institution: v }))
              }
              placeholder="Nama Kampus / Universitas"
              style={styles.textInput}
            />
            <TouchableOpacity
              onPress={() => setIsEditProfileOpen(false)}
              style={styles.primaryBtn}
            >
              <Text style={styles.primaryBtnText}>Simpan Profil</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {}
      <View style={styles.bottomNav}>
        {[
          { key: 'tugas', label: 'Tugas', icon: 'check-square' },
          { key: 'matakuliah', label: 'Mata Kuliah', icon: 'book-open' },
          { key: 'progres', label: 'Progres', icon: 'pie-chart' },
          { key: 'profil', label: 'Profil', icon: 'user' },
        ].map((item) => {
          const active = bottomTab === item.key;
          return (
            <TouchableOpacity
              key={item.key}
              onPress={() => setBottomTab(item.key)}
              style={[styles.navTabBtn, active && styles.navTabBtnActive]}
            >
              <Feather
                name={item.icon}
                size={16}
                color={active ? '#FFFFFF' : '#64748B'}
              />
              {active && <Text style={styles.navTabLabel}>{item.label}</Text>}
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flexOne: { flex: 1 },
  splashContainer: {
    flex: 1,
    backgroundColor: '#E85D56',
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashCenterWrap: { alignItems: 'center' },
  eyesRow: { flexDirection: 'row', gap: 14, marginBottom: 18 },
  eyeCircle: {
    width: 72,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#FFFFFF',
    borderWidth: 3.5,
    borderColor: '#18181B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyePupil: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#09090B',
  },
  splashWordmark: {
    fontSize: 46,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  splashTagline: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFF1F2',
    marginTop: 6,
  },
  authContainer: { flex: 1, backgroundColor: '#FFF7ED' },
  authScroll: { padding: 20, alignItems: 'center' },
  authMascotBox: {
    width: 104,
    height: 104,
    borderRadius: 28,
    borderWidth: 2.5,
    borderColor: '#0F172A',
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  authMascotImg: { width: '100%', height: '100%' },
  authTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
    marginTop: 12,
  },
  authSubtitle: {
    fontSize: 12,
    color: '#475569',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  authCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#0F172A',
    padding: 16,
  },
  googleBtn: {
    minHeight: 46,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#0F172A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 14,
  },
  googleBtnText: { fontSize: 12, fontWeight: '800', color: '#0F172A' },
  inputLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#334155',
    marginBottom: 4,
  },
  textInput: {
    minHeight: 44,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 10,
  },
  primaryBtn: {
    minHeight: 48,
    borderRadius: 16,
    backgroundColor: '#E85D56',
    borderWidth: 2,
    borderColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  primaryBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '900' },
  mainContainer: { flex: 1, backgroundColor: '#FFFDF9' },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#0F172A',
  },
  greetingTitle: { fontSize: 17, fontWeight: '900', color: '#0F172A' },
  greetingSub: { fontSize: 12, fontWeight: '600', color: '#64748B' },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEE2E2',
    borderWidth: 2,
    borderColor: '#0F172A',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
  },
  streakText: { fontSize: 12, fontWeight: '900', color: '#C41E3A' },
  calendarStripWrap: { paddingHorizontal: 16, paddingBottom: 8 },
  calendarTopBar: { flexDirection: 'row', marginBottom: 6 },
  allDateChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
  },
  allDateChipActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  allDateChipText: { fontSize: 11, fontWeight: '800', color: '#0F172A' },
  weekRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 6 },
  dayPill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  dayPillSelected: {
    backgroundColor: '#C41E3A',
    borderColor: '#0F172A',
  },
  dayShortText: { fontSize: 10, fontWeight: '700', color: '#64748B' },
  dayNumText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0F172A',
    marginTop: 2,
  },
  searchWrap: {
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    minHeight: 44,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 13, fontWeight: '600' },
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
  filterTabActive: { borderBottomColor: '#C41E3A' },
  filterTabText: { fontSize: 12, fontWeight: '800', color: '#64748B' },
  filterTabTextActive: { color: '#C41E3A' },
  listContent: { padding: 16, paddingBottom: 110, gap: 12 },
  taskCard: {
    borderRadius: 24,
    borderWidth: 2,
    padding: 14,
  },
  taskCardTopRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  taskStickerBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#0F172A',
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  taskStickerBoxCompleted: { opacity: 0.55 },
  taskStickerImg: { width: '100%', height: '100%' },
  taskCenterArea: { flex: 1 },
  taskBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  categoryBadgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '800' },
  taskCourseLabel: { fontSize: 11, fontWeight: '800', flex: 1 },
  taskTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 4,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#64748B',
  },
  taskFooterBar: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(15,23,42,0.1)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  taskFooterLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  deadlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#0F172A',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
  },
  deadlineText: { fontSize: 11, fontWeight: '800', color: '#0F172A' },
  rincianBtn: { paddingHorizontal: 6, paddingVertical: 4 },
  rincianText: { fontSize: 11, fontWeight: '700', color: '#334155' },
  taskActionRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  checkPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#0F172A',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  checkPillBtnActive: { backgroundColor: '#059669' },
  checkPillText: { fontSize: 11, fontWeight: '800', color: '#0F172A' },
  iconActionBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(15,23,42,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskExpandedArea: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(15,23,42,0.1)',
  },
  taskDescription: { fontSize: 12, color: '#1E293B', lineHeight: 18 },
  fabBtn: {
    position: 'absolute',
    right: 20,
    bottom: 84,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#C41E3A',
    borderWidth: 2,
    borderColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: { fontSize: 20, fontWeight: '900', color: '#0F172A' },
  addCourseHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#C41E3A',
    borderWidth: 2,
    borderColor: '#0F172A',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
  },
  addCourseHeaderText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  bentoGridWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  courseBentoCard: {
    width: '48%',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#0F172A',
    padding: 12,
  },
  courseCodeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  courseCodeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '800' },
  courseArtBox: {
    width: '100%',
    height: 100,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#0F172A',
    overflow: 'hidden',
    marginTop: 8,
  },
  courseArtImg: { width: '100%', height: '100%' },
  courseBentoTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#0F172A',
    marginTop: 8,
  },
  courseBentoSub: { fontSize: 11, fontWeight: '600', color: '#475569' },
  courseBentoSchedule: { fontSize: 10, fontWeight: '700', color: '#64748B' },
  olympiadHeroCard: {
    backgroundColor: '#EDE9FE',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#0F172A',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  olympiadRateText: { fontSize: 26, fontWeight: '900', color: '#1E1B4B' },
  olympiadSubText: { fontSize: 12, fontWeight: '600', color: '#3730A3' },
  trophyImg: {
    width: 76,
    height: 76,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#0F172A',
  },
  leaderboardContainer: {
    backgroundColor: '#134E4A',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#0F172A',
    padding: 14,
    gap: 8,
  },
  leaderboardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  leaderboardTitle: { fontSize: 15, fontWeight: '900', color: '#FFFFFF' },
  modeSwitchRow: {
    flexDirection: 'row',
    backgroundColor: '#0F766E',
    padding: 3,
    borderRadius: 12,
  },
  modeSwitchBtn: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 9 },
  modeSwitchBtnActive: { backgroundColor: '#FFFFFF' },
  modeSwitchText: { fontSize: 10, fontWeight: '800', color: '#CCFBF1' },
  leaderboardRow: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#0F172A',
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leaderboardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  rankCircle: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: { color: '#FFFFFF', fontSize: 11, fontWeight: '900' },
  leaderAvatar: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#0F172A',
  },
  leaderName: { fontSize: 12, fontWeight: '900', color: '#0F172A' },
  leaderSub: { fontSize: 10, fontWeight: '700', color: '#475569' },
  leaderRateBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#0F172A',
  },
  leaderRateText: { fontSize: 11, fontWeight: '900', color: '#0F172A' },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#0F172A',
    padding: 16,
    alignItems: 'center',
  },
  campusBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 10,
  },
  campusBadgeText: { color: '#C41E3A', fontSize: 11, fontWeight: '800' },
  profileBigAvatar: {
    width: 88,
    height: 88,
    borderRadius: 24,
    borderWidth: 2.5,
    borderColor: '#0F172A',
  },
  profileName: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
    marginTop: 8,
  },
  profileNim: { fontSize: 12, fontWeight: '800', color: '#C41E3A' },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
  },
  avatarChoiceBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    overflow: 'hidden',
  },
  avatarChoiceImg: { width: '100%', height: '100%' },
  googleAccountCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#0F172A',
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  googleAccountTitle: { fontSize: 13, fontWeight: '900', color: '#0F172A' },
  syncBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  syncBadgeText: { fontSize: 10, fontWeight: '800', color: '#065F46' },
  settingsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#0F172A',
    padding: 12,
    gap: 8,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 44,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  settingSubLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 1,
  },
  siakadSyncBtn: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#0F172A',
  },
  siakadSyncBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  settingLabel: { fontSize: 12, fontWeight: '800', color: '#0F172A' },
  profileActionsRow: { flexDirection: 'row', gap: 10 },
  resetBtn: {
    flex: 1,
    minHeight: 46,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#0F172A',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetBtnText: { fontSize: 12, fontWeight: '800', color: '#0F172A' },
  logoutBtn: {
    flex: 1,
    minHeight: 46,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#0F172A',
    backgroundColor: '#C41E3A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutBtnText: { fontSize: 12, fontWeight: '800', color: '#FFFFFF' },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 2,
    borderColor: '#0F172A',
    padding: 18,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 12,
  },
  quickDateRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
  },
  quickChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  quickChipText: { fontSize: 11, fontWeight: '700', color: '#0F172A' },
  modalActionRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
  bottomNav: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#0F172A',
    padding: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  navTabBtn: {
    minHeight: 42,
    paddingHorizontal: 14,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  navTabBtnActive: { backgroundColor: '#C41E3A', flex: 1 },
  navTabLabel: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
});

registerRootComponent(App);
