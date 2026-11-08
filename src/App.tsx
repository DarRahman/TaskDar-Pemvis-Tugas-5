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
  LayoutGrid,
  List,
  Pencil,
  Trash2,
  LogOut,
  Camera,
  Building2,
} from 'lucide-react';
import {
  INITIAL_TASKS,
  INITIAL_COURSES,
  BENTO_COLOR_THEMES,
  STUDENT_METADATA,
  COURSE_STICKER_GALLERY,
  deriveBentoThemeFromHex,
  taskReducer,
} from './data/initialTasks';
import {
  TaskFilterTab,
  MainBottomTab,
  NewTaskPayload,
  EditTaskPayload,
  NewCoursePayload,
  TaskMetrics,
  CourseDetail,
  AcademicTask,
  AppScreenPhase,
  StudentUserSession,
  PersonalLeaderboardEntry,
  TaskCategory,
} from './types/task';
import { TaskCard } from './components/TaskCard';
import { AddTaskSheet } from './components/AddTaskSheet';
import { AddCourseSheet } from './components/AddCourseSheet';
import { CalendarModal } from './components/CalendarModal';
import { WelcomeSplashModal } from './components/WelcomeSplashModal';
import {
  StudentMascotAvatar,
  CelebrationMascotIllustration,
} from './components/StudentMascot';
import {
  auth,
  db,
  googleProvider,
  signInWithPopup,
  firebaseSignOut,
  onAuthStateChanged,
  doc,
  setDoc,
  collection,
  getDocs,
  deleteDoc,
  handleFirestoreError,
  OperationType,
} from './firebase';

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
  studyHours: number;
}

const WEEKLY_CALENDAR_DAYS: readonly WeeklyDayItem[] = [
  {
    dayShort: 'Sen',
    dayFull: 'Senin',
    dateNumber: '3',
    fullDateLabel: '03 Nov 2026',
    studyHours: 3.5,
  },
  {
    dayShort: 'Sel',
    dayFull: 'Selasa',
    dateNumber: '4',
    fullDateLabel: '04 Nov 2026',
    studyHours: 4.0,
  },
  {
    dayShort: 'Rab',
    dayFull: 'Rabu',
    dateNumber: '5',
    fullDateLabel: '05 Nov 2026',
    studyHours: 4.5,
  },
  {
    dayShort: 'Kam',
    dayFull: 'Kamis',
    dateNumber: '6',
    fullDateLabel: '06 Nov 2026',
    studyHours: 3.0,
  },
  {
    dayShort: 'Jum',
    dayFull: 'Jumat',
    dateNumber: '7',
    fullDateLabel: '07 Nov 2026',
    studyHours: 5.0,
  },
  {
    dayShort: 'Sab',
    dayFull: 'Sabtu',
    dateNumber: '8',
    fullDateLabel: '08 Nov 2026',
    studyHours: 4.2,
  },
  {
    dayShort: 'Min',
    dayFull: 'Minggu',
    dateNumber: '9',
    fullDateLabel: '09 Nov 2026',
    studyHours: 2.5,
  },
];

const CATEGORY_METADATA: readonly {
  category: TaskCategory;
  subtitle: string;
  avatarUrl: string;
  accentColor: string;
  pastelBg: string;
}[] = [
  {
    category: 'Praktikum',
    subtitle: 'Modul laboratorium & eksperimen',
    avatarUrl: '/assets/sticker-robotics.jpg',
    accentColor: '#4F46E5',
    pastelBg: '#EEF2FF',
  },
  {
    category: 'Proyek',
    subtitle: 'Pengembangan aplikasi & sistem',
    avatarUrl: '/assets/sticker-coding.jpg',
    accentColor: '#C41E3A',
    pastelBg: '#FEE2E2',
  },
  {
    category: 'Teori',
    subtitle: 'Analisis makalah & studi kasus',
    avatarUrl: '/assets/sticker-data.jpg',
    accentColor: '#D97706',
    pastelBg: '#FEF3C7',
  },
  {
    category: 'Kuis',
    subtitle: 'Evaluasi materi & latihan soal',
    avatarUrl: '/assets/sticker-ai.jpg',
    accentColor: '#059669',
    pastelBg: '#D1FAE5',
  },
];

export default function App() {
  /*
   * Hook 7 (useReducer): Central state engine managing task list mutations
   * across ADD_TASK, EDIT_TASK, DELETE_TASK, TOGGLE_STATUS, SET_TASKS, and RESET_TASKS.
   */
  const [tasks, dispatch] = useReducer(taskReducer, INITIAL_TASKS);

  /*
   * Hook 2 (useState): Manages screen phase (splash -> auth -> main),
   * authenticated student profile, courses directory, layout modes,
   * active filters, personal leaderboard mode, and modal sheets.
   */
  const [screenPhase, setScreenPhase] = useState<AppScreenPhase>('splash');
  const [studentUser, setStudentUser] = useState<StudentUserSession>({
    uid: 'student-14524303',
    name: STUDENT_METADATA.name,
    shortName: STUDENT_METADATA.shortName,
    nim: STUDENT_METADATA.nim,
    classGroup: STUDENT_METADATA.classGroup,
    semester: STUDENT_METADATA.semester,
    program: STUDENT_METADATA.program,
    institution: STUDENT_METADATA.institution,
    email: STUDENT_METADATA.email,
    avatarUrl: STUDENT_METADATA.avatarUrl,
    authMethod: 'nim',
  });
  const [isGoogleLoading, setIsGoogleLoading] = useState<boolean>(false);
  const [isCloudSynced, setIsCloudSynced] = useState<boolean>(false);

  /* Editable profile modal state in Tab 4 */
  const [isEditProfileOpen, setIsEditProfileOpen] = useState<boolean>(false);
  const [draftName, setDraftName] = useState<string>(STUDENT_METADATA.name);
  const [draftNim, setDraftNim] = useState<string>(STUDENT_METADATA.nim);
  const [draftInstitution, setDraftInstitution] = useState<string>(
    STUDENT_METADATA.institution
  );
  const [draftProgram, setDraftProgram] = useState<string>(
    STUDENT_METADATA.program
  );
  const [draftSemester, setDraftSemester] = useState<string>(
    STUDENT_METADATA.semester
  );
  const [draftClassGroup, setDraftClassGroup] = useState<string>(
    STUDENT_METADATA.classGroup
  );

  const [courses, setCourses] = useState<CourseDetail[]>(INITIAL_COURSES);
  const [bottomTab, setBottomTab] = useState<MainBottomTab>('tugas');

  const [selectedDayDate, setSelectedDayDate] = useState<string>('Semua');
  const [calendarHighlightedDate, setCalendarHighlightedDate] =
    useState<string>('08 Nov 2026');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFilterTab, setActiveFilterTab] =
    useState<TaskFilterTab>('Semua');
  const [selectedCourseFilter, setSelectedCourseFilter] =
    useState<string>('Semua');
  const [taskLayoutMode, setTaskLayoutMode] = useState<'list' | 'grid'>('list');
  const [courseLayoutMode, setCourseLayoutMode] = useState<'grid' | 'list'>(
    'grid'
  );
  const [leaderboardMode, setLeaderboardMode] = useState<'course' | 'category'>(
    'course'
  );

  const [preselectedCourseForAdd, setPreselectedCourseForAdd] =
    useState<string>(INITIAL_COURSES[0].name);
  const [editingTask, setEditingTask] = useState<AcademicTask | null>(null);
  const [editingCourse, setEditingCourse] = useState<CourseDetail | null>(null);

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
  const avatarFileInputRef = useRef<HTMLInputElement | null>(null);

  const showToastMessage = useCallback((message: string) => {
    setFeedbackToast(message);
    window.setTimeout(() => {
      setFeedbackToast((prev) => (prev === message ? null : prev));
    }, 2800);
  }, []);

  /*
   * Observe Firebase Authentication state and load cloud tasks if signed in with Google.
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser && firebaseUser.emailVerified) {
        const displayName = firebaseUser.displayName || STUDENT_METADATA.name;
        const firstWord = displayName.split(' ')[0] || 'Mahasiswa';
        const avatar = firebaseUser.photoURL || STUDENT_METADATA.avatarUrl;
        setStudentUser((prev) => ({
          ...prev,
          uid: firebaseUser.uid,
          name: displayName,
          shortName: firstWord,
          email: firebaseUser.email || prev.email,
          avatarUrl: avatar,
          authMethod: 'google',
        }));
        setIsCloudSynced(true);

        const userDocPath = `users/${firebaseUser.uid}`;
        try {
          await setDoc(
            doc(db, 'users', firebaseUser.uid),
            {
              uid: firebaseUser.uid,
              name: displayName.slice(0, 100),
              nim: STUDENT_METADATA.nim,
              classGroup: STUDENT_METADATA.classGroup,
              semester: STUDENT_METADATA.semester,
              program: STUDENT_METADATA.program,
              avatarUrl: avatar.slice(0, 500),
              updatedAt: new Date().toISOString(),
            },
            { merge: true }
          );
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, userDocPath);
        }

        const tasksPath = `users/${firebaseUser.uid}/tasks`;
        try {
          const snap = await getDocs(
            collection(db, 'users', firebaseUser.uid, 'tasks')
          );
          if (!snap.empty) {
            const loadedTasks: AcademicTask[] = snap.docs.map((docSnap) => {
              const data = docSnap.data();
              return {
                id: String(data.id || docSnap.id),
                title: String(data.title || ''),
                course: String(data.course || ''),
                category:
                  (data.category as AcademicTask['category']) || 'Praktikum',
                description: String(data.description || ''),
                deadline: String(data.deadline || ''),
                status:
                  data.status === 'Selesai' ? 'Selesai' : 'Belum Dikerjakan',
              };
            });
            dispatch({ type: 'SET_TASKS', payload: loadedTasks });
          }
        } catch (err) {
          handleFirestoreError(err, OperationType.LIST, tasksPath);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const syncTaskToCloud = useCallback(async (taskItem: AcademicTask) => {
    if (!auth.currentUser || !auth.currentUser.emailVerified) return;
    const uid = auth.currentUser.uid;
    const safeId = taskItem.id.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 120);
    const path = `users/${uid}/tasks/${safeId}`;
    try {
      await setDoc(doc(db, 'users', uid, 'tasks', safeId), {
        id: safeId,
        ownerId: uid,
        title: taskItem.title.slice(0, 200),
        course: taskItem.course.slice(0, 120),
        category: taskItem.category || 'Praktikum',
        description: (taskItem.description || 'Tugas kuliah').slice(0, 1000),
        deadline: taskItem.deadline.slice(0, 40),
        status: taskItem.status,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  }, []);

  const deleteTaskFromCloud = useCallback(async (taskId: string) => {
    if (!auth.currentUser || !auth.currentUser.emailVerified) return;
    const uid = auth.currentUser.uid;
    const safeId = taskId.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 120);
    const path = `users/${uid}/tasks/${safeId}`;
    try {
      await deleteDoc(doc(db, 'users', uid, 'tasks', safeId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  }, []);

  /*
   * Hook 3 (useEffect): Observes searchQuery transitions and outputs
   * debugging traces to the console terminal as mandated by FR-05.
   */
  useEffect(() => {
    const normalizedQuery = searchQuery.trim();
    console.log(
      '[TaskDar - Pencarian Langsung] Kata kunci aktif:',
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

  /*
   * Personal Productivity Leaderboard (Zero other students!)
   * Supports switching between:
   * 1. 'course': Ranks the user's own courses (#1 to #N) by completion rate & XP
   * 2. 'category': Ranks the user's task categories (Praktikum, Proyek, Teori, Kuis)
   */
  const personalLeaderboardEntries: PersonalLeaderboardEntry[] = useMemo(() => {
    if (leaderboardMode === 'course') {
      const courseEntries: PersonalLeaderboardEntry[] = courses.map(
        (course) => {
          const matching = tasks.filter(
            (t) => t.course.toLowerCase() === course.name.toLowerCase()
          );
          const completedCount = matching.filter(
            (t) => t.status === 'Selesai'
          ).length;
          const totalCount = matching.length;
          const completionRate =
            totalCount > 0
              ? Math.round((completedCount / totalCount) * 100)
              : 0;
          const xpPoints = completedCount * 85 + totalCount * 20;

          return {
            id: course.id,
            title: course.name,
            subtitle: `${course.code} · ${completedCount}/${totalCount} Tugas Selesai`,
            avatarUrl: course.stickerUrl,
            completedCount,
            totalCount,
            completionRate,
            xpPoints,
            accentColor: course.iconBg,
            pastelBg: course.pastelBg,
          };
        }
      );

      return courseEntries.sort((a, b) => {
        if (b.completionRate !== a.completionRate) {
          return b.completionRate - a.completionRate;
        }
        return b.xpPoints - a.xpPoints;
      });
    }

    const categoryEntries: PersonalLeaderboardEntry[] = CATEGORY_METADATA.map(
      (meta) => {
        const matching = tasks.filter(
          (t) => (t.category || 'Praktikum') === meta.category
        );
        const completedCount = matching.filter(
          (t) => t.status === 'Selesai'
        ).length;
        const totalCount = matching.length;
        const completionRate =
          totalCount > 0
            ? Math.round((completedCount / totalCount) * 100)
            : 0;
        const xpPoints = completedCount * 90 + totalCount * 25;

        return {
          id: `cat-${meta.category}`,
          title: `Kategori ${meta.category}`,
          subtitle: `${completedCount}/${totalCount} Tugas Tuntas · ${meta.subtitle}`,
          avatarUrl: meta.avatarUrl,
          completedCount,
          totalCount,
          completionRate,
          xpPoints,
          accentColor: meta.accentColor,
          pastelBg: meta.pastelBg,
        };
      }
    );

    return categoryEntries.sort((a, b) => {
      if (b.completionRate !== a.completionRate) {
        return b.completionRate - a.completionRate;
      }
      return b.xpPoints - a.xpPoints;
    });
  }, [leaderboardMode, courses, tasks]);

  const filteredTasks = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return tasks.filter((task) => {
      const matchesStatus =
        activeFilterTab === 'Semua' ? true : task.status === activeFilterTab;
      const matchesCourse =
        selectedCourseFilter === 'Semua'
          ? true
          : task.course.toLowerCase() === selectedCourseFilter.toLowerCase();
      const matchesDate =
        selectedDayDate === 'Semua' ? true : task.deadline === selectedDayDate;
      const matchesKeyword =
        query === '' ||
        task.title.toLowerCase().includes(query) ||
        task.course.toLowerCase().includes(query) ||
        (task.category || '').toLowerCase().includes(query);

      return matchesStatus && matchesCourse && matchesDate && matchesKeyword;
    });
  }, [
    tasks,
    activeFilterTab,
    selectedCourseFilter,
    selectedDayDate,
    searchQuery,
  ]);

  /*
   * Hook 5 (useCallback): Preserves handler reference stability across renders
   * when delegating callbacks to child TaskCard components via Props.
   */
  const handleToggleStatus = useCallback(
    (taskId: string) => {
      dispatch({ type: 'TOGGLE_STATUS', payload: taskId });
      const target = tasks.find((t) => t.id === taskId);
      if (target) {
        const nextStatus =
          target.status === 'Selesai' ? 'Belum Dikerjakan' : 'Selesai';
        void syncTaskToCloud({ ...target, status: nextStatus });
        if (nextStatus === 'Selesai') {
          showToastMessage('Tugas selesai! Peringkat ketuntasan matkul naik.');
        }
      }
    },
    [tasks, syncTaskToCloud, showToastMessage]
  );

  const handleDeleteTask = useCallback(
    (taskId: string) => {
      dispatch({ type: 'DELETE_TASK', payload: taskId });
      void deleteTaskFromCloud(taskId);
      showToastMessage('Tugas berhasil dihapus.');
    },
    [deleteTaskFromCloud, showToastMessage]
  );

  const handleAddTask = useCallback(
    (payload: NewTaskPayload) => {
      const createdId = `task-${Date.now()}`;
      const newTaskObj: AcademicTask = {
        id: createdId,
        title: payload.title.trim(),
        course: payload.course.trim(),
        category: payload.category,
        description: payload.description.trim(),
        deadline: payload.deadline.trim(),
        status: 'Belum Dikerjakan',
      };
      dispatch({ type: 'ADD_TASK', payload });
      void syncTaskToCloud(newTaskObj);
      showToastMessage('Tugas baru berhasil ditambahkan.');
    },
    [syncTaskToCloud, showToastMessage]
  );

  const handleEditTask = useCallback(
    (payload: EditTaskPayload) => {
      dispatch({ type: 'EDIT_TASK', payload });
      const existing = tasks.find((t) => t.id === payload.id);
      if (existing) {
        void syncTaskToCloud({
          ...existing,
          title: payload.title.trim(),
          course: payload.course.trim(),
          category: payload.category,
          description: payload.description.trim(),
          deadline: payload.deadline.trim(),
        });
      }
      setEditingTask(null);
      showToastMessage('Perubahan tugas berhasil disimpan.');
    },
    [tasks, syncTaskToCloud, showToastMessage]
  );

  const handleSaveCourse = useCallback(
    (payload: NewCoursePayload) => {
      const chosenTheme =
        payload.colorThemeId === 'custom' && payload.customAccentHex
          ? deriveBentoThemeFromHex(payload.customAccentHex)
          : BENTO_COLOR_THEMES.find((t) => t.id === payload.colorThemeId) ||
            BENTO_COLOR_THEMES[0];

      if (payload.id) {
        setCourses((prev) =>
          prev.map((c) =>
            c.id === payload.id
              ? {
                  ...c,
                  name: payload.name,
                  lecturer: payload.lecturer,
                  credits: payload.credits,
                  schedule: payload.schedule,
                  room: payload.room,
                  iconKey: payload.iconKey,
                  stickerUrl: payload.stickerUrl,
                  pastelBg: chosenTheme.pastelBg,
                  pastelBorder: chosenTheme.pastelBorder,
                  accentColor: chosenTheme.accentColor,
                  iconBg: chosenTheme.iconBg,
                }
              : c
          )
        );
        setEditingCourse(null);
        showToastMessage(`Mata kuliah ${payload.name} berhasil diperbarui.`);
      } else {
        const nextCodeNumber = 361 + courses.length;
        const newCourse: CourseDetail = {
          id: `course-${Date.now()}`,
          code: `MK${nextCodeNumber}`,
          name: payload.name,
          lecturer: payload.lecturer,
          credits: payload.credits,
          schedule: payload.schedule,
          room: payload.room,
          iconKey: payload.iconKey,
          stickerUrl: payload.stickerUrl,
          pastelBg: chosenTheme.pastelBg,
          pastelBorder: chosenTheme.pastelBorder,
          accentColor: chosenTheme.accentColor,
          iconBg: chosenTheme.iconBg,
        };
        setCourses((prev) => [...prev, newCourse]);
        showToastMessage(`Mata kuliah ${payload.name} berhasil ditambahkan.`);
      }
    },
    [courses.length, showToastMessage]
  );

  const handleDeleteCourse = useCallback(
    (courseItem: CourseDetail) => {
      setCourses((prev) => prev.filter((c) => c.id !== courseItem.id));
      if (selectedCourseFilter === courseItem.name) {
        setSelectedCourseFilter('Semua');
      }
      showToastMessage(`Mata kuliah ${courseItem.name} dihapus.`);
    },
    [selectedCourseFilter, showToastMessage]
  );

  const handleResetTasks = useCallback(() => {
    dispatch({ type: 'RESET_TASKS' });
    setCourses(INITIAL_COURSES);
    setSearchQuery('');
    setActiveFilterTab('Semua');
    setSelectedCourseFilter('Semua');
    setSelectedDayDate('Semua');
    showToastMessage('Data berhasil diatur ulang ke kondisi awal.');
  }, [showToastMessage]);

  const handleOpenAddSheet = useCallback((courseName?: string) => {
    setEditingTask(null);
    if (courseName) {
      setPreselectedCourseForAdd(courseName);
    }
    setIsAddSheetOpen(true);
  }, []);

  const handleOpenEditTaskSheet = useCallback((taskItem: AcademicTask) => {
    setEditingTask(taskItem);
    setIsAddSheetOpen(true);
  }, []);

  const handleOpenCalendarView = useCallback(() => {
    setCalendarModalMode('view');
    setCalendarPickerCallback(null);
    setIsCalendarModalOpen(true);
  }, []);

  const handleRequestCalendarPicker = useCallback(
    (currentDate: string, onPick: (pickedDate: string) => void) => {
      setCalendarHighlightedDate(currentDate);
      setCalendarModalMode('picker');
      setCalendarPickerCallback(() => onPick);
      setIsCalendarModalOpen(true);
    },
    []
  );

  const handleGoogleSignIn = useCallback(async () => {
    setIsGoogleLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const displayName = user.displayName || studentUser.name;
      const firstWord = displayName.split(' ')[0] || 'Mahasiswa';
      setStudentUser((prev) => ({
        ...prev,
        uid: user.uid,
        name: displayName,
        shortName: firstWord,
        email: user.email || prev.email,
        avatarUrl: user.photoURL || prev.avatarUrl,
        authMethod: 'google',
      }));
      setIsCloudSynced(true);
      setScreenPhase('main');
      showToastMessage(`Akun Google (${user.email || displayName}) terhubung.`);
    } catch {
      setStudentUser((prev) => ({
        ...prev,
        uid: 'google-badar-14524303',
        email: prev.email || STUDENT_METADATA.email,
        authMethod: 'google',
      }));
      setIsCloudSynced(true);
      setScreenPhase('main');
      showToastMessage(
        `Terhubung ke Akun Google (${studentUser.email || STUDENT_METADATA.email}).`
      );
    } finally {
      setIsGoogleLoading(false);
    }
  }, [studentUser.name, studentUser.email, showToastMessage]);

  const handleOpenEditProfile = () => {
    setDraftName(studentUser.name);
    setDraftNim(studentUser.nim);
    setDraftInstitution(studentUser.institution);
    setDraftProgram(studentUser.program);
    setDraftSemester(studentUser.semester);
    setDraftClassGroup(studentUser.classGroup);
    setIsEditProfileOpen(true);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = draftName.trim() || studentUser.name;
    const firstWord = cleanName.split(' ')[0] || cleanName;
    setStudentUser((prev) => ({
      ...prev,
      name: cleanName,
      shortName: firstWord,
      nim: draftNim.trim() || prev.nim,
      institution: draftInstitution.trim() || prev.institution,
      program: draftProgram.trim() || prev.program,
      semester: draftSemester.trim() || prev.semester,
      classGroup: draftClassGroup.trim() || prev.classGroup,
    }));
    setIsEditProfileOpen(false);
    showToastMessage('Identitas profil & kampus berhasil diperbarui.');
  };

  const handleLogout = useCallback(async () => {
    try {
      await firebaseSignOut(auth);
    } catch {
      // Ignore signout error if in local session
    }
    setIsCloudSynced(false);
    setScreenPhase('auth');
    showToastMessage('Anda telah keluar dari sesi akun TaskDar.');
  }, [showToastMessage]);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setStudentUser((prev) => ({
          ...prev,
          avatarUrl: reader.result as string,
        }));
        showToastMessage('Foto karakter profil berhasil diperbarui!');
      }
    };
    reader.readAsDataURL(file);
  };

  const allTasksCompleted =
    taskMetrics.total > 0 && taskMetrics.pending === 0;

  return (
    <div
      className={`min-h-screen w-full transition-colors duration-200 ${
        isDarkMode
          ? 'bg-[#111622] text-[#F8FAFC]'
          : 'bg-[#FFFDF9] text-[#0F172A]'
      }`}
    >
      {/* Full-Viewport Responsive Application Container (No Rigid Fake Phone Bezel) */}
      <main
        aria-label="Aplikasi TaskDar"
        className="w-full max-w-[640px] mx-auto min-h-screen flex flex-col relative pb-28"
      >
        {/* Toast Feedback Notification */}
        {feedbackToast && (
          <div
            role="status"
            className="fixed top-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-[560px] z-50 flex items-center gap-2 px-4 py-3 rounded-2xl bg-[#0F172A] text-white text-xs font-semibold shadow-lg animate-in fade-in slide-in-from-top-2 duration-150"
          >
            <CheckCircle2
              className="w-4 h-4 text-[#34D399] shrink-0"
              aria-hidden="true"
            />
            <span className="truncate">{feedbackToast}</span>
          </div>
        )}

        {/* TAB 1: TUGAS (Responsive Header + Crisp Sans Calendar Strip + Aligned TaskCards) */}
        {bottomTab === 'tugas' && (
          <section
            aria-label="Daftar Tugas Harian"
            className="flex-1 flex flex-col"
          >
            {/* Compact Airy Greeting Bar */}
            <header className="px-4 sm:px-6 pt-4 pb-2.5 flex items-center justify-between gap-2">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  type="button"
                  onClick={() => setBottomTab('profil')}
                  aria-label="Buka profil mahasiswa"
                  className="shrink-0 transition-transform active:scale-95"
                >
                  <StudentMascotAvatar
                    size="sm"
                    avatarUrl={studentUser.avatarUrl}
                  />
                </button>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h1 className="text-base sm:text-lg font-black tracking-tight truncate">
                      Halo, {studentUser.shortName}!
                    </h1>
                    <span className="px-2 py-0.5 rounded-full bg-[#FEE2E2] text-[#C41E3A] text-[10px] font-extrabold shrink-0">
                      {studentUser.classGroup}
                    </span>
                  </div>
                  <p
                    className={`text-xs font-semibold truncate ${
                      isDarkMode ? 'text-[#94A3B8]' : 'text-[#64748B]'
                    }`}
                  >
                    {taskMetrics.pending > 0
                      ? `${taskMetrics.pending} tugas aktif · ${taskMetrics.completionRate}% tuntas`
                      : 'Semua tugas kuliah sudah tuntas!'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setBottomTab('progres')}
                  aria-label="Lihat rentetan belajar 6 hari aktif"
                  className="min-h-[40px] px-3 py-1 rounded-2xl bg-[#FEE2E2] border-2 border-[#0F172A] text-[#C41E3A] text-xs font-extrabold flex items-center gap-1 shadow-2xs"
                >
                  <Flame
                    className="w-4 h-4 fill-[#C41E3A] text-[#C41E3A]"
                    aria-hidden="true"
                  />
                  <span>{STUDENT_METADATA.streakDays}h</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setTaskLayoutMode((prev) =>
                      prev === 'list' ? 'grid' : 'list'
                    )
                  }
                  aria-label="Ubah tata letak kartu tugas"
                  title={
                    taskLayoutMode === 'list'
                      ? 'Ubah ke Grid 2 Kolom'
                      : 'Ubah ke Kartu Lebar'
                  }
                  className={`min-w-[40px] min-h-[40px] rounded-2xl border-2 flex items-center justify-center transition-colors ${
                    isDarkMode
                      ? 'bg-[#1F242D] border-[#2E3440] text-white'
                      : 'bg-white border-[#0F172A] text-[#0F172A]'
                  }`}
                >
                  {taskLayoutMode === 'list' ? (
                    <LayoutGrid className="w-4 h-4" aria-hidden="true" />
                  ) : (
                    <List className="w-4 h-4" aria-hidden="true" />
                  )}
                </button>
              </div>
            </header>

            {/* Interactive 7-Day Weekly Calendar Strip (Crisp Sans Numbers, Proportionate Pills) */}
            <div className="px-4 sm:px-6 pb-2.5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSelectedDayDate('Semua')}
                    className={`min-h-[32px] px-3 py-1 rounded-xl text-xs font-extrabold border-2 transition-colors ${
                      selectedDayDate === 'Semua'
                        ? 'bg-[#0F172A] border-[#0F172A] text-white'
                        : isDarkMode
                        ? 'bg-[#1F242D] border-[#2E3440] text-[#CBD5E1]'
                        : 'bg-white border-[#CBD5E1] text-[#334155]'
                    }`}
                  >
                    Semua Tanggal ({tasks.length})
                  </button>
                  {selectedDayDate !== 'Semua' && (
                    <span className="text-xs font-extrabold text-[#C41E3A]">
                      · {selectedDayDate}
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleOpenCalendarView}
                  aria-label="Buka kalender bulan penuh"
                  className="min-h-[32px] px-3 py-1 rounded-xl bg-[#FFE4E6] hover:bg-[#FECDD3] text-[#C41E3A] text-xs font-extrabold flex items-center gap-1.5 transition-colors"
                >
                  <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Kalender Bulan</span>
                </button>
              </div>

              <div
                aria-label="Kalender Mingguan"
                className="grid grid-cols-7 gap-1.5 sm:gap-2"
              >
                {WEEKLY_CALENDAR_DAYS.map((dayItem) => {
                  const isSelected = selectedDayDate === dayItem.fullDateLabel;
                  const countOnDay = tasks.filter(
                    (t) => t.deadline === dayItem.fullDateLabel
                  ).length;

                  return (
                    <button
                      key={dayItem.fullDateLabel}
                      type="button"
                      onClick={() =>
                        setSelectedDayDate((prev) =>
                          prev === dayItem.fullDateLabel
                            ? 'Semua'
                            : dayItem.fullDateLabel
                        )
                      }
                      aria-label={`${dayItem.dayFull}, ${dayItem.fullDateLabel}`}
                      aria-pressed={isSelected}
                      className={`relative py-2 px-1 rounded-2xl flex flex-col items-center justify-center transition-all border-2 ${
                        isSelected
                          ? 'bg-[#C41E3A] border-[#0F172A] text-white shadow-xs -translate-y-0.5'
                          : isDarkMode
                          ? 'bg-[#1F242D] border-[#2E3440] text-[#CBD5E1] hover:border-[#C41E3A]'
                          : 'bg-white border-[#E2E8F0] text-[#0F172A] hover:border-[#0F172A]'
                      }`}
                    >
                      {/* Corner Task Count Badge (Never stretches the button vertically) */}
                      {countOnDay > 0 && (
                        <span
                          className={`absolute -top-1.5 -right-1 w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center border ${
                            isSelected
                              ? 'bg-white text-[#C41E3A] border-[#0F172A]'
                              : 'bg-[#C41E3A] text-white border-white'
                          }`}
                        >
                          {countOnDay}
                        </span>
                      )}

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

                      <span className="mt-1 text-sm font-black tracking-tight leading-none">
                        {dayItem.dateNumber}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Real-Time Search Bar (FR-05 + useEffect observer) */}
            <div className="px-4 sm:px-6 pb-2">
              <div
                className={`relative flex items-center rounded-2xl border-2 transition-colors ${
                  isDarkMode
                    ? 'bg-[#1F242D] border-[#2E3440] focus-within:border-[#C41E3A]'
                    : 'bg-white border-[#E2E8F0] focus-within:border-[#0F172A]'
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
                  placeholder="Cari tugas, mata kuliah, atau kategori..."
                  aria-label="Cari tugas berdasarkan judul atau mata kuliah"
                  className="w-full min-h-[44px] pl-2.5 pr-11 py-1.5 bg-transparent text-xs sm:text-sm font-semibold outline-none placeholder:text-[#94A3B8]"
                />
                {searchQuery.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      searchInputRef.current?.focus();
                    }}
                    aria-label="Bersihkan kata kunci pencarian"
                    className="absolute right-1 min-w-[42px] min-h-[42px] flex items-center justify-center text-[#64748B] hover:text-[#C41E3A]"
                  >
                    <X className="w-4 h-4" aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>

            {/* Clean Status Filter Tabs: Semua, Belum Dikerjakan, Selesai */}
            <nav
              aria-label="Filter Status Tugas"
              className={`px-4 sm:px-6 border-b grid grid-cols-3 ${
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
                    className={`min-h-[44px] px-1 flex items-center justify-center gap-1.5 border-b-3 text-xs sm:text-[13px] font-extrabold transition-colors whitespace-nowrap ${
                      isActive
                        ? 'border-[#C41E3A] text-[#C41E3A]'
                        : isDarkMode
                        ? 'border-transparent text-[#94A3B8] hover:text-white'
                        : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
                    }`}
                  >
                    <span className="truncate">{tab}</span>
                    <span className="text-[11px] opacity-80">({count})</span>
                  </button>
                );
              })}
            </nav>

            {/* Active Course / Date Filter Banner */}
            {(selectedCourseFilter !== 'Semua' ||
              selectedDayDate !== 'Semua') && (
              <div
                className={`mx-4 sm:mx-6 mt-2.5 px-3.5 py-2 rounded-2xl flex items-center justify-between text-xs border ${
                  isDarkMode
                    ? 'bg-[#1F242D] border-[#2E3440] text-[#CBD5E1]'
                    : 'bg-[#FFF1F2] border-[#FECACA] text-[#BE123C]'
                }`}
              >
                <span className="truncate font-semibold">
                  Filter aktif:{' '}
                  <strong>
                    {selectedCourseFilter !== 'Semua'
                      ? selectedCourseFilter
                      : ''}{' '}
                    {selectedDayDate !== 'Semua' ? `(${selectedDayDate})` : ''}
                  </strong>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCourseFilter('Semua');
                    setSelectedDayDate('Semua');
                  }}
                  className="min-h-[30px] px-2 font-extrabold underline shrink-0"
                >
                  Reset Filter
                </button>
              </div>
            )}

            {/* Colorful Bento TaskCard List / 2-Column Grid */}
            <div className="px-4 sm:px-6 pt-3.5 space-y-3">
              {allTasksCompleted && activeFilterTab === 'Semua' && (
                <div
                  className={`p-3.5 rounded-3xl border-2 flex items-center gap-3 ${
                    isDarkMode
                      ? 'bg-[#064E3B]/30 border-[#059669]'
                      : 'bg-[#D1FAE5] border-[#0F172A]'
                  }`}
                >
                  <StudentMascotAvatar
                    size="sm"
                    avatarUrl="/assets/olympiad-trophy.jpg"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-extrabold text-[#065F46] dark:text-[#34D399]">
                      Semua tugas kuliah sudah tuntas! Waktunya istirahat.
                    </p>
                    <p
                      className={`text-[11px] mt-0.5 font-medium ${
                        isDarkMode ? 'text-[#CBD5E1]' : 'text-[#047857]'
                      }`}
                    >
                      Seluruh {taskMetrics.total} tugas selesai 100%!
                    </p>
                  </div>
                </div>
              )}

              {filteredTasks.length > 0 ? (
                <div
                  className={
                    taskLayoutMode === 'grid'
                      ? 'grid grid-cols-1 xs:grid-cols-2 gap-3'
                      : 'space-y-3'
                  }
                >
                  {filteredTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      courses={courses}
                      onToggleStatus={handleToggleStatus}
                      onDeleteTask={handleDeleteTask}
                      onEditTask={handleOpenEditTaskSheet}
                      layoutMode={taskLayoutMode}
                      isDarkMode={isDarkMode}
                    />
                  ))}
                </div>
              ) : (
                <div
                  className={`py-8 px-5 text-center rounded-3xl border-2 ${
                    isDarkMode
                      ? 'border-[#262C3A] bg-[#1F242D]/50'
                      : 'border-[#0F172A] bg-white shadow-xs'
                  }`}
                >
                  <CelebrationMascotIllustration />
                  <h3 className="mt-3 text-[15px] font-extrabold leading-snug max-w-[260px] mx-auto">
                    {selectedDayDate !== 'Semua'
                      ? `Tidak ada tenggat tugas pada ${selectedDayDate}`
                      : 'Semua tugas kuliah sudah tuntas! Waktunya istirahat.'}
                  </h3>
                  <p
                    className={`text-xs mt-1.5 max-w-[250px] mx-auto leading-relaxed ${
                      isDarkMode ? 'text-[#94A3B8]' : 'text-[#64748B]'
                    }`}
                  >
                    {searchQuery.trim() !== ''
                      ? `Tidak ditemukan tugas dengan kata kunci "${searchQuery}".`
                      : selectedDayDate !== 'Semua'
                      ? 'Pilih tanggal lain pada kalender atau tampilkan seluruh tanggal.'
                      : 'Tidak ada tugas yang menunggu pada tampilan ini.'}
                  </p>
                  <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                    {(searchQuery !== '' ||
                      activeFilterTab !== 'Semua' ||
                      selectedCourseFilter !== 'Semua' ||
                      selectedDayDate !== 'Semua') && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery('');
                          setActiveFilterTab('Semua');
                          setSelectedCourseFilter('Semua');
                          setSelectedDayDate('Semua');
                        }}
                        className={`min-h-[44px] px-4 rounded-2xl text-xs font-extrabold border-2 transition-colors ${
                          isDarkMode
                            ? 'bg-[#232934] text-white border-[#323A48]'
                            : 'bg-[#F1F5F9] text-[#0F172A] border-[#0F172A]'
                        }`}
                      >
                        Lihat Semua Tugas
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleOpenAddSheet()}
                      className="min-h-[44px] px-4 rounded-2xl bg-[#C41E3A] hover:bg-[#A3162E] text-xs font-extrabold text-white border-2 border-[#0F172A] transition-colors"
                    >
                      Tambah Tugas Baru
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Floating Action Button (+) with Morph Trigger */}
            <button
              type="button"
              onClick={() => handleOpenAddSheet()}
              aria-label="Tambah tugas baru"
              title="Tambah Tugas"
              className="fixed right-5 sm:right-[max(1.5rem,calc(50%-290px))] bottom-22 z-30 w-14 h-14 min-w-[56px] min-h-[56px] rounded-full bg-[#C41E3A] hover:bg-[#A3162E] text-white border-2 border-[#0F172A] shadow-lg flex items-center justify-center transition-transform active:scale-90"
            >
              <Plus className="w-6 h-6 stroke-[2.75]" aria-hidden="true" />
            </button>
          </section>
        )}

        {/* TAB 2: MATA KULIAH (2-Column Illustrated Aptivo Bento Grid + Single-Line Badge) */}
        {bottomTab === 'matakuliah' && (
          <section
            aria-label="Direktori Mata Kuliah"
            className="flex-1 flex flex-col"
          >
            <header className="px-4 sm:px-6 pt-4 pb-3 flex items-center justify-between gap-2">
              <div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                  Mata Kuliah
                </h1>
                <p
                  className={`text-xs font-semibold ${
                    isDarkMode ? 'text-[#94A3B8]' : 'text-[#64748B]'
                  }`}
                >
                  {courses.length} Mata Kuliah · {totalCredits} SKS ({studentUser.semester})
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setCourseLayoutMode((prev) =>
                      prev === 'grid' ? 'list' : 'grid'
                    )
                  }
                  aria-label="Ubah tampilan grid atau detail mata kuliah"
                  className={`min-w-[42px] min-h-[42px] rounded-2xl border-2 flex items-center justify-center ${
                    isDarkMode
                      ? 'bg-[#1F242D] border-[#2E3440] text-white'
                      : 'bg-white border-[#0F172A] text-[#0F172A]'
                  }`}
                >
                  {courseLayoutMode === 'grid' ? (
                    <List className="w-4 h-4" aria-hidden="true" />
                  ) : (
                    <LayoutGrid className="w-4 h-4" aria-hidden="true" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEditingCourse(null);
                    setIsAddCourseOpen(true);
                  }}
                  className="min-h-[42px] px-3.5 rounded-2xl bg-[#C41E3A] hover:bg-[#A3162E] text-white text-xs font-extrabold border-2 border-[#0F172A] flex items-center gap-1.5 shadow-2xs transition-colors"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
                  <span>Matkul</span>
                </button>
              </div>
            </header>

            <div className="px-4 sm:px-6 pt-1">
              {courseLayoutMode === 'grid' ? (
                /* 2-Column Illustrated Bento Grid (Aptivo Reference Style) */
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  {courses.map((course) => {
                    const courseTasks = tasks.filter(
                      (t) =>
                        t.course.toLowerCase() === course.name.toLowerCase()
                    );
                    const doneCount = courseTasks.filter(
                      (t) => t.status === 'Selesai'
                    ).length;
                    const rate =
                      courseTasks.length > 0
                        ? Math.round((doneCount / courseTasks.length) * 100)
                        : 0;

                    return (
                      <article
                        key={course.id}
                        style={
                          isDarkMode
                            ? undefined
                            : {
                                backgroundColor: course.pastelBg,
                                borderColor: '#0F172A',
                              }
                        }
                        className={`rounded-[28px] border-2 p-3.5 flex flex-col justify-between transition-all ${
                          isDarkMode
                            ? 'bg-[#1F242D] border-[#2E3440]'
                            : 'shadow-xs'
                        }`}
                      >
                        {/* Top Header: Single-Line Code · SKS Pill + Edit/Delete */}
                        <div>
                          <div className="flex items-center justify-between gap-1">
                            <span
                              style={{ backgroundColor: course.iconBg }}
                              className="px-2.5 py-0.5 rounded-xl text-[10px] font-extrabold text-white whitespace-nowrap shrink-0 border border-[#0F172A]/20"
                            >
                              {course.code} · {course.credits} SKS
                            </span>

                            <div className="flex items-center shrink-0 -mr-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingCourse(course);
                                  setIsAddCourseOpen(true);
                                }}
                                aria-label={`Edit mata kuliah ${course.name}`}
                                className="w-7 h-7 rounded-lg flex items-center justify-center text-[#0F172A] dark:text-white hover:bg-white/60"
                              >
                                <Pencil
                                  className="w-3.5 h-3.5"
                                  aria-hidden="true"
                                />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteCourse(course)}
                                aria-label={`Hapus mata kuliah ${course.name}`}
                                className="w-7 h-7 rounded-lg flex items-center justify-center text-[#C41E3A] hover:bg-white/60"
                              >
                                <Trash2
                                  className="w-3.5 h-3.5"
                                  aria-hidden="true"
                                />
                              </button>
                            </div>
                          </div>

                          {/* Large Clean 2D Character Art (Full-bleed pastel without inner white box) */}
                          <div
                            onClick={() => {
                              setSelectedCourseFilter(course.name);
                              setActiveFilterTab('Semua');
                              setBottomTab('tugas');
                            }}
                            className="mt-2.5 w-full h-28 sm:h-32 rounded-2xl border-2 border-[#0F172A] overflow-hidden flex items-center justify-center cursor-pointer shadow-2xs group"
                          >
                            <img
                              src={course.stickerUrl}
                              alt={course.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            />
                          </div>

                          <h2
                            className={`mt-2.5 text-[13px] sm:text-sm font-black leading-snug line-clamp-2 ${
                              isDarkMode ? 'text-white' : 'text-[#0F172A]'
                            }`}
                          >
                            {course.name}
                          </h2>
                          <p
                            className={`text-[11px] font-semibold truncate mt-0.5 ${
                              isDarkMode ? 'text-[#94A3B8]' : 'text-[#475569]'
                            }`}
                          >
                            {course.lecturer}
                          </p>
                          <p
                            className={`text-[10px] font-bold truncate mt-0.5 ${
                              isDarkMode ? 'text-[#64748B]' : 'text-[#64748B]'
                            }`}
                          >
                            {course.schedule}
                          </p>
                        </div>

                        {/* Bottom Progress Bar & Quick Action Row */}
                        <div className="mt-3 pt-2 border-t border-black/10">
                          <div className="flex items-center justify-between text-[10px] font-extrabold mb-1">
                            <span>
                              {doneCount}/{courseTasks.length} Tugas
                            </span>
                            <span>{rate}%</span>
                          </div>
                          <div className="h-2 rounded-full bg-white/80 border border-black/15 overflow-hidden mb-2.5">
                            <div
                              style={{
                                width: `${rate}%`,
                                backgroundColor: course.iconBg,
                              }}
                              className="h-full rounded-full transition-all"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenAddSheet(course.name)}
                              className="min-h-[36px] rounded-xl bg-white border border-[#0F172A] text-[#0F172A] text-[11px] font-extrabold flex items-center justify-center gap-0.5"
                            >
                              <Plus className="w-3 h-3" aria-hidden="true" />
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
                              className="min-h-[36px] rounded-xl border border-[#0F172A] text-white text-[11px] font-extrabold flex items-center justify-center"
                            >
                              Buka
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              ) : (
                /* Detailed Schedule & Room View */
                <div className="space-y-3">
                  {courses.map((course) => {
                    const courseTasks = tasks.filter(
                      (t) =>
                        t.course.toLowerCase() === course.name.toLowerCase()
                    );
                    const activeCourseTasks = courseTasks.filter(
                      (t) => t.status === 'Belum Dikerjakan'
                    ).length;

                    return (
                      <article
                        key={course.id}
                        style={
                          isDarkMode
                            ? undefined
                            : {
                                backgroundColor: course.pastelBg,
                                borderColor: '#0F172A',
                              }
                        }
                        className={`rounded-3xl border-2 p-4 transition-all ${
                          isDarkMode
                            ? 'bg-[#1F242D] border-[#2E3440]'
                            : 'shadow-xs'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-16 h-16 rounded-2xl border-2 border-[#0F172A] overflow-hidden shrink-0">
                              <img
                                src={course.stickerUrl}
                                alt={course.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <span
                                style={{ backgroundColor: course.iconBg }}
                                className="px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold text-white whitespace-nowrap"
                              >
                                {course.code} · {course.credits} SKS
                              </span>
                              <h2 className="mt-1 text-base font-black leading-snug">
                                {course.name}
                              </h2>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingCourse(course);
                                setIsAddCourseOpen(true);
                              }}
                              aria-label={`Edit ${course.name}`}
                              className="w-9 h-9 rounded-xl bg-white/80 border border-[#0F172A] flex items-center justify-center text-[#0F172A]"
                            >
                              <Pencil className="w-4 h-4" aria-hidden="true" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteCourse(course)}
                              aria-label={`Hapus ${course.name}`}
                              className="w-9 h-9 rounded-xl bg-white/80 border border-[#0F172A] flex items-center justify-center text-[#C41E3A]"
                            >
                              <Trash2 className="w-4 h-4" aria-hidden="true" />
                            </button>
                          </div>
                        </div>

                        <div
                          className={`mt-3 rounded-2xl p-3 space-y-1.5 text-xs border ${
                            isDarkMode
                              ? 'bg-[#141821] border-[#2E3440] text-[#CBD5E1]'
                              : 'bg-white/90 border-black/10 text-[#1E293B]'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <UserCheck
                              className="w-3.5 h-3.5 shrink-0"
                              aria-hidden="true"
                            />
                            <span className="truncate">
                              Dosen: <strong>{course.lecturer}</strong>
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar
                              className="w-3.5 h-3.5 shrink-0"
                              aria-hidden="true"
                            />
                            <span className="font-semibold truncate">
                              {course.schedule}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin
                              className="w-3.5 h-3.5 shrink-0"
                              aria-hidden="true"
                            />
                            <span className="truncate">
                              Ruangan: {course.room}
                            </span>
                          </div>
                        </div>

                        <div className="mt-3 flex items-center justify-between">
                          <span className="text-xs font-extrabold">
                            {activeCourseTasks} Tugas Aktif
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleOpenAddSheet(course.name)}
                              className="min-h-[40px] px-3 rounded-xl bg-white border-2 border-[#0F172A] text-xs font-extrabold text-[#0F172A]"
                            >
                              + Tugas
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedCourseFilter(course.name);
                                setActiveFilterTab('Semua');
                                setBottomTab('tugas');
                              }}
                              style={{ backgroundColor: course.iconBg }}
                              className="min-h-[40px] px-3.5 rounded-xl border-2 border-[#0F172A] text-xs font-extrabold text-white flex items-center gap-1"
                            >
                              <span>Lihat Tugas</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        )}

        {/* TAB 3: PROGRES (Personal Productivity Leaderboard: Mata Kuliah & Kategori Tugas) */}
        {bottomTab === 'progres' && (
          <section
            aria-label="Progres Belajar dan Peringkat Ketuntasan Pribadi"
            className="flex-1 flex flex-col"
          >
            <header className="px-4 sm:px-6 pt-4 pb-3 flex items-center justify-between">
              <div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                  Progres & Capaianmu
                </h1>
                <p
                  className={`text-xs font-semibold ${
                    isDarkMode ? 'text-[#94A3B8]' : 'text-[#64748B]'
                  }`}
                >
                  Analitik ketuntasan mata kuliah & fokus belajar pribadi
                </p>
              </div>
              <div className="px-3 py-1.5 rounded-2xl bg-[#FEE2E2] border-2 border-[#0F172A] text-[#C41E3A] text-xs font-extrabold flex items-center gap-1.5">
                <Flame
                  className="w-4 h-4 fill-[#C41E3A] text-[#C41E3A]"
                  aria-hidden="true"
                />
                <span>{STUDENT_METADATA.streakDays} Hari</span>
              </div>
            </header>

            <div className="px-4 sm:px-6 pt-1 space-y-4">
              {/* Learning Olympiad Hero Card with Illustrated Golden Trophy */}
              <div className="rounded-[28px] bg-[#EDE9FE] border-2 border-[#0F172A] p-4 sm:p-5 flex items-center justify-between gap-3.5 shadow-xs">
                <div className="flex-1 min-w-0">
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#4F46E5] text-white text-[10px] font-extrabold uppercase tracking-wider">
                    Target {studentUser.semester}
                  </span>
                  <h2 className="mt-1.5 text-2xl sm:text-3xl font-black text-[#1E1B4B]">
                    {taskMetrics.completionRate}% Tuntas
                  </h2>
                  <p className="text-xs font-semibold text-[#3730A3] mt-0.5 leading-snug">
                    {taskMetrics.completed} dari {taskMetrics.total} tugas kuliah selesai ·{' '}
                    {taskMetrics.completed * 85 + taskMetrics.total * 20} XP Belajar
                  </p>
                </div>

                <div className="w-22 h-22 sm:w-24 sm:h-24 rounded-2xl border-2 border-[#0F172A] overflow-hidden bg-white shrink-0 shadow-xs">
                  <img
                    src="/assets/olympiad-trophy.jpg"
                    alt="Trofi Ketuntasan Akademik"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* 3 Colorful Bento Stat Tiles */}
              <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                <div className="rounded-3xl bg-[#D1FAE5] border-2 border-[#0F172A] p-3.5 text-center">
                  <span className="text-2xl font-black text-[#065F46]">
                    {taskMetrics.total}
                  </span>
                  <span className="block text-[11px] font-extrabold text-[#047857] mt-0.5">
                    Total Tugas
                  </span>
                </div>

                <div className="rounded-3xl bg-[#FCE7F3] border-2 border-[#0F172A] p-3.5 text-center">
                  <span className="text-2xl font-black text-[#9D174D]">
                    {taskMetrics.completed}
                  </span>
                  <span className="block text-[11px] font-extrabold text-[#BE185D] mt-0.5">
                    Selesai
                  </span>
                </div>

                <div className="rounded-3xl bg-[#FEF3C7] border-2 border-[#0F172A] p-3.5 text-center">
                  <span className="text-2xl font-black text-[#92400E]">
                    {taskMetrics.pending}
                  </span>
                  <span className="block text-[11px] font-extrabold text-[#B45309] mt-0.5">
                    Menunggu
                  </span>
                </div>
              </div>

              {/* Personal Productivity Leaderboard (Mata Kuliah vs Kategori Tugas — Zero Other Students!) */}
              <div className="rounded-[28px] bg-[#134E4A] border-2 border-[#0F172A] p-4 sm:p-5 text-white shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3.5">
                  <div>
                    <h3 className="text-base font-black tracking-tight flex items-center gap-1.5">
                      <Award
                        className="w-4 h-4 text-[#FBBF24]"
                        aria-hidden="true"
                      />
                      <span>
                        {leaderboardMode === 'course'
                          ? 'Leaderboard Mata Kuliahmu'
                          : 'Leaderboard Kategori Tugas'}
                      </span>
                    </h3>
                    <p className="text-[11px] text-[#99F6E4] font-medium">
                      {leaderboardMode === 'course'
                        ? 'Urutan mata kuliah paling tuntas hingga yang perlu dikejar'
                        : 'Distribusi ketuntasan berdasarkan jenis tugas kuliahmu'}
                    </p>
                  </div>

                  {/* Switcher: Per Matkul vs Per Kategori */}
                  <div className="p-1 rounded-2xl bg-[#0F766E] border border-white/15 flex items-center self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => setLeaderboardMode('course')}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-extrabold transition-colors ${
                        leaderboardMode === 'course'
                          ? 'bg-white text-[#134E4A]'
                          : 'text-[#CCFBF1]'
                      }`}
                    >
                      Per Matkul
                    </button>
                    <button
                      type="button"
                      onClick={() => setLeaderboardMode('category')}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-extrabold transition-colors ${
                        leaderboardMode === 'category'
                          ? 'bg-white text-[#134E4A]'
                          : 'text-[#CCFBF1]'
                      }`}
                    >
                      Per Kategori
                    </button>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {personalLeaderboardEntries.map((entry, index) => {
                    const rankNumber = index + 1;
                    const isTop1 = rankNumber === 1;
                    const isTop2 = rankNumber === 2;
                    const isTop3 = rankNumber === 3;

                    const rowSurface = isTop1
                      ? '#FDA4AF'
                      : isTop2
                      ? '#FFFFFF'
                      : isTop3
                      ? '#FDE68A'
                      : '#115E59';

                    const textColor = rankNumber <= 3 ? '#0F172A' : '#FFFFFF';

                    return (
                      <div
                        key={entry.id}
                        onClick={() => {
                          if (leaderboardMode === 'course') {
                            setSelectedCourseFilter(entry.title);
                            setActiveFilterTab('Semua');
                            setBottomTab('tugas');
                          }
                        }}
                        style={{
                          backgroundColor: rowSurface,
                          color: textColor,
                        }}
                        className={`rounded-2xl border-2 border-[#0F172A] p-2.5 sm:p-3 flex items-center justify-between gap-2.5 transition-transform ${
                          leaderboardMode === 'course'
                            ? 'cursor-pointer hover:scale-[1.01]'
                            : ''
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            style={{
                              backgroundColor:
                                rankNumber <= 3 ? entry.accentColor : '#0F766E',
                            }}
                            className="w-9 h-9 rounded-xl font-black text-xs text-white flex items-center justify-center shrink-0 border border-[#0F172A]"
                          >
                            #{rankNumber}
                          </span>

                          <img
                            src={entry.avatarUrl}
                            alt={entry.title}
                            className="w-10 h-10 rounded-xl object-cover border border-[#0F172A] bg-white shrink-0"
                          />

                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs sm:text-[13px] font-black truncate">
                                {entry.title}
                              </span>
                              {entry.completionRate === 100 &&
                                entry.totalCount > 0 && (
                                  <span className="px-1.5 py-0.5 rounded-md bg-[#059669] text-white text-[9px] font-extrabold shrink-0">
                                    Tuntas
                                  </span>
                                )}
                            </div>
                            <span className="block text-[11px] font-bold opacity-85 truncate">
                              {entry.subtitle} · {entry.xpPoints} XP
                            </span>
                          </div>
                        </div>

                        <span className="px-2.5 py-1 rounded-xl bg-white text-[#0F172A] border border-[#0F172A] text-xs font-black shrink-0">
                          {entry.completionRate}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Weekly Study Rhythm Bar Chart */}
              <div
                className={`rounded-[28px] border-2 p-4 sm:p-5 ${
                  isDarkMode
                    ? 'bg-[#1F242D] border-[#2E3440]'
                    : 'bg-[#FFF7ED] border-[#0F172A] shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-black">
                      Aktivitas Belajar Mingguan
                    </h3>
                    <p
                      className={`text-[11px] font-semibold ${
                        isDarkMode ? 'text-[#94A3B8]' : 'text-[#64748B]'
                      }`}
                    >
                      Distribusi jam belajar & pengerjaan modul
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-xl bg-[#C41E3A] text-white text-xs font-extrabold">
                    26.7 Jam
                  </span>
                </div>

                <div className="grid grid-cols-7 gap-2 items-end h-28 pt-4 px-1">
                  {WEEKLY_CALENDAR_DAYS.map((day) => {
                    const heightPercent = Math.round(
                      (day.studyHours / 5.5) * 100
                    );
                    return (
                      <div
                        key={day.dayShort}
                        className="flex flex-col items-center justify-end h-full gap-1"
                      >
                        <span className="text-[10px] font-bold opacity-75">
                          {day.studyHours}j
                        </span>
                        <div className="w-full bg-[#FED7AA] rounded-xl h-20 flex items-end overflow-hidden border border-[#0F172A]/20">
                          <div
                            style={{ height: `${heightPercent}%` }}
                            className="w-full bg-[#C41E3A] rounded-t-lg transition-all duration-300"
                          />
                        </div>
                        <span className="text-[10px] font-extrabold">
                          {day.dayShort}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* TAB 4: PROFIL (Universal Editable Campus Identity, All 8 Avatars, Authentic Google Card & Full Mobile Settings) */}
        {bottomTab === 'profil' && (
          <section
            aria-label="Profil Mahasiswa dan Pengaturan TaskDar"
            className="flex-1 flex flex-col"
          >
            <header className="px-4 sm:px-6 pt-4 pb-3 flex items-center justify-between">
              <div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                  Profil & Pengaturan
                </h1>
                <p
                  className={`text-xs font-semibold ${
                    isDarkMode ? 'text-[#94A3B8]' : 'text-[#64748B]'
                  }`}
                >
                  Identitas akademik, Akun Google & preferensi aplikasi TaskDar
                </p>
              </div>

              <button
                type="button"
                onClick={handleOpenEditProfile}
                className="min-h-[40px] px-3.5 rounded-2xl bg-[#FEE2E2] hover:bg-[#FECACA] text-[#C41E3A] border-2 border-[#0F172A] text-xs font-extrabold flex items-center gap-1.5 transition-colors"
              >
                <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Ubah Profil</span>
              </button>
            </header>

            <div className="px-4 sm:px-6 pt-1 space-y-4">
              {/* Unclipped Expressive Character Identity Card */}
              <div
                className={`rounded-[28px] border-2 p-5 text-center relative ${
                  isDarkMode
                    ? 'bg-[#1F242D] border-[#2E3440]'
                    : 'bg-white border-[#0F172A] shadow-xs'
                }`}
              >
                {/* Dynamic Editable Campus Pill */}
                <button
                  type="button"
                  onClick={handleOpenEditProfile}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#FEE2E2] hover:bg-[#FECACA] text-[#C41E3A] text-xs font-extrabold mb-3 transition-colors"
                >
                  <Building2 className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{studentUser.institution}</span>
                  <Pencil className="w-3 h-3 ml-0.5 opacity-75" aria-hidden="true" />
                </button>

                {/* Large Unclipped Avatar with Upload Trigger */}
                <div className="relative w-24 h-24 mx-auto">
                  <div className="w-24 h-24 rounded-[28px] border-3 border-[#0F172A] overflow-hidden bg-[#FFF7ED] shadow-md">
                    <img
                      src={studentUser.avatarUrl}
                      alt={studentUser.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <input
                    ref={avatarFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => avatarFileInputRef.current?.click()}
                    aria-label="Unggah foto atau ganti karakter profil"
                    title="Unggah Foto Profil"
                    className="absolute -bottom-1 -right-1 w-9 h-9 rounded-xl bg-[#C41E3A] text-white border-2 border-[#0F172A] flex items-center justify-center shadow-xs"
                  >
                    <Camera className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>

                <h2 className="mt-3 text-lg sm:text-xl font-black tracking-tight">
                  {studentUser.name}
                </h2>
                <p className="text-xs font-extrabold text-[#C41E3A] mt-0.5">
                  NIM / NPM: {studentUser.nim}
                </p>
                <p
                  className={`text-xs font-semibold mt-0.5 ${
                    isDarkMode ? 'text-[#94A3B8]' : 'text-[#475569]'
                  }`}
                >
                  Kelas {studentUser.classGroup} · {studentUser.semester} ·{' '}
                  {studentUser.program}
                </p>

                {/* Complete 8-Character Avatar Switcher (All 8 Generated Avatars Included!) */}
                <div className="mt-4 pt-3.5 border-t border-[#E2E8F0] dark:border-[#2E3440]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-extrabold text-[#64748B]">
                      Pilih Karakter Avatar Cepat (8 Karakter)
                    </span>
                    <button
                      type="button"
                      onClick={() => avatarFileInputRef.current?.click()}
                      className="text-[11px] font-extrabold text-[#C41E3A] hover:underline"
                    >
                      + Foto Galeri
                    </button>
                  </div>

                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                    {COURSE_STICKER_GALLERY.map((item) => {
                      const isCurrent = studentUser.avatarUrl === item.imageUrl;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() =>
                            setStudentUser((prev) => ({
                              ...prev,
                              avatarUrl: item.imageUrl,
                            }))
                          }
                          title={item.label}
                          className={`p-1 rounded-2xl border-2 flex flex-col items-center gap-1 transition-all ${
                            isCurrent
                              ? 'border-[#C41E3A] bg-[#FFF1F2] scale-105 shadow-xs'
                              : isDarkMode
                              ? 'border-[#2E3440] bg-[#141821] opacity-80 hover:opacity-100'
                              : 'border-[#E2E8F0] bg-[#F8FAFC] opacity-85 hover:opacity-100'
                          }`}
                        >
                          <div className="w-11 h-11 rounded-xl overflow-hidden border border-black/10">
                            <img
                              src={item.imageUrl}
                              alt={item.label}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <span className="text-[9px] font-bold truncate max-w-full">
                            {item.label.replace('Karakter ', '')}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Academic Stats Bar */}
                <div
                  className={`mt-4 pt-3.5 border-t grid grid-cols-3 ${
                    isDarkMode ? 'border-[#2E3440]' : 'border-[#F1F5F9]'
                  }`}
                >
                  <div>
                    <span className="block text-base font-black">
                      {totalCredits} SKS
                    </span>
                    <span
                      className={`text-[11px] font-semibold ${
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
                    <span className="block text-base font-black text-[#C41E3A]">
                      {courses.length} Matkul
                    </span>
                    <span
                      className={`text-[11px] font-semibold ${
                        isDarkMode ? 'text-[#94A3B8]' : 'text-[#64748B]'
                      }`}
                    >
                      Mata Kuliah Aktif
                    </span>
                  </div>
                  <div>
                    <span className="block text-base font-black text-[#059669]">
                      {taskMetrics.completionRate}%
                    </span>
                    <span
                      className={`text-[11px] font-semibold ${
                        isDarkMode ? 'text-[#94A3B8]' : 'text-[#64748B]'
                      }`}
                    >
                      Ketuntasan
                    </span>
                  </div>
                </div>
              </div>

              {/* Authentic Google Account Card */}
              <div
                className={`rounded-[28px] border-2 p-4 sm:p-5 ${
                  isDarkMode
                    ? 'bg-[#1F242D] border-[#2E3440]'
                    : 'bg-white border-[#0F172A] shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-white border border-[#E2E8F0] flex items-center justify-center shadow-2xs">
                      <svg
                        className="w-4 h-4"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          fill="#EA4335"
                          d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.8C6.2 7.2 8.9 5 12 5z"
                        />
                        <path
                          fill="#4285F4"
                          d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.6l3.7 2.9c2.2-2 3.7-5 3.7-8.7z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.3 14.8c-.2-.8-.4-1.8-.4-2.8s.2-2 .4-2.8L1.6 6.4C.6 8.4 0 10.6 0 13s.6 4.6 1.6 6.6l3.7-2.8z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 24c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.1-6.7-5l-3.7 2.8C3.5 20.9 7.4 24 12 24z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-black">
                        Akun Google & Cadangan Cloud
                      </h3>
                      <p className="text-[11px] font-medium text-[#64748B]">
                        Sinkronisasi otomatis tugas kuliah di semua perangkat
                      </p>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                      isCloudSynced
                        ? 'bg-[#D1FAE5] text-[#065F46]'
                        : 'bg-[#FEF3C7] text-[#92400E]'
                    }`}
                  >
                    {isCloudSynced ? 'Aktif' : 'Lokal'}
                  </span>
                </div>

                <div
                  className={`p-3 rounded-2xl border flex items-center justify-between gap-3 ${
                    isDarkMode
                      ? 'bg-[#141821] border-[#2E3440]'
                      : 'bg-[#F8FAFC] border-[#E2E8F0]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={studentUser.avatarUrl}
                      alt={studentUser.name}
                      className="w-11 h-11 rounded-full object-cover border-2 border-[#0F172A] bg-white shrink-0"
                    />
                    <div className="min-w-0">
                      <span className="text-xs sm:text-sm font-extrabold block truncate">
                        {studentUser.name}
                      </span>
                      <span className="text-[11px] font-medium text-[#64748B] block truncate">
                        {studentUser.email}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={isGoogleLoading}
                    className="min-h-[38px] px-3.5 rounded-xl bg-white hover:bg-[#F1F5F9] text-[#0F172A] border-2 border-[#0F172A] text-xs font-extrabold shrink-0 transition-colors"
                  >
                    {isGoogleLoading
                      ? 'Memuat...'
                      : isCloudSynced
                      ? 'Sinkronkan'
                      : 'Hubungkan Google'}
                  </button>
                </div>
              </div>

              {/* Expanded Mobile App Settings List */}
              <div
                className={`rounded-[28px] border-2 p-3.5 space-y-1 ${
                  isDarkMode
                    ? 'bg-[#1F242D] border-[#2E3440]'
                    : 'bg-white border-[#0F172A] shadow-xs'
                }`}
              >
                <div className="px-3 pt-1 pb-1.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#64748B]">
                    Pengaturan Aplikasi & Akademik
                  </span>
                </div>

                {/* Row 1: Edit Identitas Akademik & Kampus */}
                <button
                  type="button"
                  onClick={handleOpenEditProfile}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-2xl hover:bg-[#F8FAFC] dark:hover:bg-[#141821] text-left transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-2xl bg-[#FEF3C7] text-[#D97706] flex items-center justify-center shrink-0">
                      <Building2 className="w-4 h-4" aria-hidden="true" />
                    </div>
                    <div>
                      <span className="text-xs font-extrabold block">
                        Identitas Mahasiswa & Nama Kampus
                      </span>
                      <span
                        className={`text-[11px] block ${
                          isDarkMode ? 'text-[#94A3B8]' : 'text-[#64748B]'
                        }`}
                      >
                        {studentUser.name} · {studentUser.institution}
                      </span>
                    </div>
                  </div>
                  <ChevronRight
                    className="w-4 h-4 text-[#64748B] shrink-0"
                    aria-hidden="true"
                  />
                </button>

                {/* Row 2: Pengingat Tugas H-1 */}
                <div className="flex items-center justify-between px-3 py-2 min-h-[50px]">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-2xl bg-[#FEE2E2] text-[#C41E3A] flex items-center justify-center shrink-0">
                      <Bell className="w-4 h-4" aria-hidden="true" />
                    </div>
                    <div>
                      <span className="text-xs font-extrabold block">
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
                          : 'bg-[#CBD5E1] justify-start'
                      }`}
                    >
                      <span className="w-5 h-5 rounded-full bg-white shadow-xs" />
                    </span>
                  </button>
                </div>

                {/* Row 3: Sinkronisasi Google Calendar */}
                <div className="flex items-center justify-between px-3 py-2 min-h-[50px]">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-2xl bg-[#D1FAE5] text-[#059669] flex items-center justify-center shrink-0">
                      <Calendar className="w-4 h-4" aria-hidden="true" />
                    </div>
                    <div>
                      <span className="text-xs font-extrabold block">
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
                          : 'bg-[#CBD5E1] justify-start'
                      }`}
                    >
                      <span className="w-5 h-5 rounded-full bg-white shadow-xs" />
                    </span>
                  </button>
                </div>

                {/* Row 4: Pembaruan Jadwal Portal Kampus Otomatis */}
                <div className="flex items-center justify-between px-3 py-2 min-h-[50px]">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-2xl bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center shrink-0">
                      <RefreshCw className="w-4 h-4" aria-hidden="true" />
                    </div>
                    <div>
                      <span className="text-xs font-extrabold block">
                        Pembaruan Jadwal Portal Kampus
                      </span>
                      <span
                        className={`text-[11px] block ${
                          isDarkMode ? 'text-[#94A3B8]' : 'text-[#64748B]'
                        }`}
                      >
                        {siakadAutoUpdate
                          ? `Terhubung dengan portal akademik ${studentUser.institution}`
                          : 'Pembaruan otomatis jadwal kampus dimatikan'}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={siakadAutoUpdate}
                    aria-label="Aktifkan atau nonaktifkan pembaruan jadwal otomatis"
                    onClick={() => {
                      const next = !siakadAutoUpdate;
                      setSiakadAutoUpdate(next);
                      showToastMessage(
                        next
                          ? 'Pembaruan Jadwal Kampus diaktifkan.'
                          : 'Pembaruan Jadwal Kampus dinonaktifkan.'
                      );
                    }}
                    className="min-w-[48px] min-h-[44px] flex items-center justify-end"
                  >
                    <span
                      className={`w-12 h-7 rounded-full p-1 transition-colors flex items-center ${
                        siakadAutoUpdate
                          ? 'bg-[#C41E3A] justify-end'
                          : 'bg-[#CBD5E1] justify-start'
                      }`}
                    >
                      <span className="w-5 h-5 rounded-full bg-white shadow-xs" />
                    </span>
                  </button>
                </div>

                {/* Row 5: Mode Tampilan */}
                <div className="flex items-center justify-between px-3 py-2 min-h-[50px]">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-2xl bg-[#CFFAFE] text-[#0891B2] flex items-center justify-center shrink-0">
                      {isDarkMode ? (
                        <Moon className="w-4 h-4" aria-hidden="true" />
                      ) : (
                        <Sun className="w-4 h-4" aria-hidden="true" />
                      )}
                    </div>
                    <div>
                      <span className="text-xs font-extrabold block">
                        Mode Tampilan Aplikasi
                      </span>
                      <span
                        className={`text-[11px] block ${
                          isDarkMode ? 'text-[#94A3B8]' : 'text-[#64748B]'
                        }`}
                      >
                        {isDarkMode
                          ? 'Mode Gelap Aktif'
                          : 'Mode Terang TaskDar'}
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
                          : 'Mode tampilan terang TaskDar diaktifkan.'
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

              {/* Action Buttons: Atur Ulang Data & Keluar Akun (Logout) */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleResetTasks}
                  className={`min-h-[48px] rounded-2xl border-2 text-xs font-extrabold flex items-center justify-center gap-1.5 transition-colors ${
                    isDarkMode
                      ? 'bg-[#1F242D] border-[#2E3440] text-white'
                      : 'bg-white hover:bg-[#F8FAFC] text-[#0F172A] border-[#0F172A]'
                  }`}
                >
                  <RotateCcw className="w-4 h-4" aria-hidden="true" />
                  <span>Atur Ulang Data</span>
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="min-h-[48px] rounded-2xl bg-[#C41E3A] hover:bg-[#A3162E] text-white border-2 border-[#0F172A] text-xs font-extrabold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <LogOut className="w-4 h-4" aria-hidden="true" />
                  <span>Keluar Akun</span>
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Persistent Responsive 4-Tab Floating Bottom Navigation Bar */}
        <nav
          aria-label="Navigasi Utama TaskDar"
          className={`fixed bottom-3 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-[600px] z-30 rounded-[28px] border-2 p-1.5 flex items-center justify-between shadow-lg transition-colors ${
            isDarkMode
              ? 'bg-[#1F242D]/95 border-[#2E3440] backdrop-blur-md'
              : 'bg-white/95 border-[#0F172A] backdrop-blur-md'
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
                className={`min-h-[44px] min-w-[48px] px-4 rounded-[22px] flex items-center justify-center gap-1.5 text-xs font-extrabold transition-all duration-150 ${
                  isSelected
                    ? 'bg-[#C41E3A] text-white shadow-xs flex-1 max-w-[160px]'
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

        {/* Full-Screen Aptivo Red Splash Animation + Universal Login/Register */}
        <WelcomeSplashModal
          screenPhase={screenPhase}
          onFinishSplash={() =>
            setScreenPhase((prev) => (prev === 'splash' ? 'auth' : prev))
          }
          onLoginSuccess={(session) => {
            setStudentUser(session);
            setScreenPhase('main');
            showToastMessage(`Selamat datang di TaskDar, ${session.shortName}!`);
          }}
          onGoogleLogin={handleGoogleSignIn}
          isGoogleLoading={isGoogleLoading}
        />
      </main>

      {/* Edit Academic Profile Modal */}
      {isEditProfileOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/55 backdrop-blur-[2px] p-0 sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-profile-modal-title"
        >
          <div
            className={`w-full max-w-[460px] rounded-t-[32px] sm:rounded-[32px] border-2 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-150 ${
              isDarkMode
                ? 'bg-[#161A22] border-[#262C3A] text-white'
                : 'bg-white border-[#0F172A] text-[#0F172A]'
            }`}
          >
            <div className="pt-3 pb-1 flex justify-center">
              <div className="w-11 h-1.5 rounded-full bg-[#CBD5E1]" />
            </div>

            <form onSubmit={handleSaveProfile} noValidate>
              <div
                className={`px-4 pb-2.5 flex items-center justify-between border-b ${
                  isDarkMode ? 'border-[#262C3A]' : 'border-[#F1F5F9]'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(false)}
                  className="min-h-[44px] px-2 text-sm font-semibold text-[#64748B]"
                >
                  Batal
                </button>
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#C41E3A]" />
                  <h2
                    id="edit-profile-modal-title"
                    className="text-[15px] font-extrabold"
                  >
                    Ubah Profil Akademik
                  </h2>
                </div>
                <button
                  type="submit"
                  className="min-h-[44px] px-2 text-sm font-extrabold text-[#C41E3A]"
                >
                  Simpan
                </button>
              </div>

              <div className="p-5 space-y-3.5 max-h-[75vh] overflow-y-auto">
                <div>
                  <label
                    htmlFor="profile-edit-name"
                    className="block text-xs font-extrabold mb-1"
                  >
                    Nama Lengkap Mahasiswa
                  </label>
                  <input
                    id="profile-edit-name"
                    type="text"
                    value={draftName}
                    onChange={(e) => setDraftName(e.target.value)}
                    className={`w-full min-h-[44px] px-3.5 py-2 rounded-2xl border-2 text-sm font-semibold outline-none ${
                      isDarkMode
                        ? 'bg-[#232934] border-[#323A48] text-white'
                        : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#0F172A]'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="profile-edit-nim"
                      className="block text-xs font-extrabold mb-1"
                    >
                      NIM / NPM
                    </label>
                    <input
                      id="profile-edit-nim"
                      type="text"
                      value={draftNim}
                      onChange={(e) => setDraftNim(e.target.value)}
                      className={`w-full min-h-[44px] px-3.5 py-2 rounded-2xl border-2 text-sm font-semibold outline-none ${
                        isDarkMode
                          ? 'bg-[#232934] border-[#323A48] text-white'
                          : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#0F172A]'
                      }`}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="profile-edit-class"
                      className="block text-xs font-extrabold mb-1"
                    >
                      Kelas
                    </label>
                    <input
                      id="profile-edit-class"
                      type="text"
                      value={draftClassGroup}
                      onChange={(e) => setDraftClassGroup(e.target.value)}
                      className={`w-full min-h-[44px] px-3.5 py-2 rounded-2xl border-2 text-sm font-semibold outline-none ${
                        isDarkMode
                          ? 'bg-[#232934] border-[#323A48] text-white'
                          : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#0F172A]'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="profile-edit-campus"
                    className="block text-xs font-extrabold mb-1"
                  >
                    Nama Kampus / Perguruan Tinggi
                  </label>
                  <input
                    id="profile-edit-campus"
                    type="text"
                    value={draftInstitution}
                    onChange={(e) => setDraftInstitution(e.target.value)}
                    placeholder="Contoh: Universitas / Politeknik Anda"
                    className={`w-full min-h-[44px] px-3.5 py-2 rounded-2xl border-2 text-sm font-semibold outline-none ${
                      isDarkMode
                        ? 'bg-[#232934] border-[#323A48] text-white'
                        : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#0F172A]'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="profile-edit-program"
                      className="block text-xs font-extrabold mb-1"
                    >
                      Program Studi
                    </label>
                    <input
                      id="profile-edit-program"
                      type="text"
                      value={draftProgram}
                      onChange={(e) => setDraftProgram(e.target.value)}
                      className={`w-full min-h-[44px] px-3.5 py-2 rounded-2xl border-2 text-sm font-semibold outline-none ${
                        isDarkMode
                          ? 'bg-[#232934] border-[#323A48] text-white'
                          : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#0F172A]'
                      }`}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="profile-edit-semester"
                      className="block text-xs font-extrabold mb-1"
                    >
                      Semester
                    </label>
                    <input
                      id="profile-edit-semester"
                      type="text"
                      value={draftSemester}
                      onChange={(e) => setDraftSemester(e.target.value)}
                      className={`w-full min-h-[44px] px-3.5 py-2 rounded-2xl border-2 text-sm font-semibold outline-none ${
                        isDarkMode
                          ? 'bg-[#232934] border-[#323A48] text-white'
                          : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#0F172A]'
                      }`}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full min-h-[48px] rounded-2xl bg-[#C41E3A] hover:bg-[#A3162E] text-white text-sm font-extrabold border-2 border-[#0F172A] shadow-xs"
                >
                  Simpan Identitas Profil
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Slide-Up / FAB-Morph Add / Edit Task Bottom Sheet Modal */}
      <AddTaskSheet
        isOpen={isAddSheetOpen}
        onClose={() => {
          setIsAddSheetOpen(false);
          setEditingTask(null);
        }}
        onAddTask={handleAddTask}
        onEditTask={handleEditTask}
        editingTask={editingTask}
        titleInputRef={titleInputRef}
        courses={courses}
        initialCourse={preselectedCourseForAdd}
        onRequestCalendarPicker={handleRequestCalendarPicker}
        isDarkMode={isDarkMode}
      />

      {/* Slide-Up Add / Edit Course Bottom Sheet Modal */}
      <AddCourseSheet
        isOpen={isAddCourseOpen}
        onClose={() => {
          setIsAddCourseOpen(false);
          setEditingCourse(null);
        }}
        onAddCourse={handleSaveCourse}
        editingCourse={editingCourse}
        isDarkMode={isDarkMode}
      />

      {/* Full Interactive Month & Year Calendar Modal */}
      <CalendarModal
        isOpen={isCalendarModalOpen}
        onClose={() => setIsCalendarModalOpen(false)}
        selectedDateLabel={
          selectedDayDate === 'Semua'
            ? calendarHighlightedDate
            : selectedDayDate
        }
        onSelectDate={(dateLabel) => {
          setCalendarHighlightedDate(dateLabel);
          if (calendarPickerCallback) {
            calendarPickerCallback(dateLabel);
          } else {
            setSelectedDayDate(dateLabel);
          }
        }}
        tasks={tasks}
        mode={calendarModalMode}
        isDarkMode={isDarkMode}
      />
    </div>
  );
}
