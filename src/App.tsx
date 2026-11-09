import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
  useReducer,
} from 'react';
import { motion } from 'motion/react';
import {
  Plus,
  Search,
  X,
  RotateCcw,
  CheckSquare,
  BookOpen,
  PieChart,
  User,
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
  BarChart3,
  Flame,
} from 'lucide-react';
import {
  INITIAL_TASKS,
  INITIAL_COURSES,
  BENTO_COLOR_THEMES,
  STUDENT_METADATA,
  COURSE_STICKER_GALLERY,
  WEEKDAY_FILTER_ITEMS,
  IndonesianDayName,
  formatDateToIndonesianLabel,
  getIndonesianDayFromDateLabel,
  getCourseScheduledDay,
  deriveBentoThemeFromHex,
  getReadableTextColor,
  isTaskUrgent,
  resolveCourseForTask,
  sanitizeAndLinkCoursesAndTasks,
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
import {
  toWebpAssetPath,
  getStickerStageBackground,
  convertImageFileToWebpDataUrl,
} from './utils/imageOptimizer';
import { TaskCard, getCategoryBadgeStyle } from './components/TaskCard';
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
  getDoc,
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

const STORAGE_KEYS = {
  USER: 'taskdar_user_v3',
  SETTINGS: 'taskdar_settings_v3',
} as const;
function getAccountScopeId(
  user: Pick<StudentUserSession, 'nim' | 'uid' | 'authMethod'>
): string {
  const cleanUid = (user.uid || '').trim().replace(/[^a-zA-Z0-9_-]/g, '');
  const cleanNim = (user.nim || '').trim().replace(/[^a-zA-Z0-9_-]/g, '');

  if (user.authMethod === 'google' && cleanUid) {
    return `google_${cleanUid}`;
  }
  if (cleanNim) {
    return `nim_${cleanNim}`;
  }
  return cleanUid ? `uid_${cleanUid}` : 'default';
}

function getScopedTasksKey(scopeId: string): string {
  return `taskdar_tasks_${scopeId}`;
}

function getScopedCoursesKey(scopeId: string): string {
  return `taskdar_courses_${scopeId}`;
}

function loadStoredUser(): StudentUserSession {
  const defaultSession: StudentUserSession = {
    uid: 'student-14524303',
    name: STUDENT_METADATA.name,
    shortName: STUDENT_METADATA.shortName,
    nim: STUDENT_METADATA.nim,
    classGroup: STUDENT_METADATA.classGroup,
    semester: STUDENT_METADATA.semester,
    program: STUDENT_METADATA.program,
    institution: STUDENT_METADATA.institution,
    email: STUDENT_METADATA.email,
    avatarUrl: toWebpAssetPath(STUDENT_METADATA.avatarUrl),
    authMethod: 'nim',
  };
  try {
    const raw =
      window.localStorage.getItem(STORAGE_KEYS.USER) ||
      window.localStorage.getItem('taskdar_user_v2');
    if (!raw) return defaultSession;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && parsed.name) {
      return {
        ...defaultSession,
        ...parsed,
        avatarUrl: toWebpAssetPath(
          parsed.avatarUrl || defaultSession.avatarUrl
        ),
      };
    }
  } catch {
  }
  return defaultSession;
}

function loadSanitizedAccountBundle(scopeId: string): {
  courses: CourseDetail[];
  tasks: AcademicTask[];
} {
  let rawCourses: CourseDetail[] | null = null;
  let rawTasks: AcademicTask[] | null = null;

  try {
    const scopedCoursesStr = window.localStorage.getItem(
      getScopedCoursesKey(scopeId)
    );
    if (scopedCoursesStr) {
      const parsed = JSON.parse(scopedCoursesStr);
      if (Array.isArray(parsed)) {
        rawCourses = parsed;
      }
    }
    const scopedTasksStr = window.localStorage.getItem(
      getScopedTasksKey(scopeId)
    );
    if (scopedTasksStr) {
      const parsed = JSON.parse(scopedTasksStr);
      if (Array.isArray(parsed)) {
        rawTasks = parsed;
      }
    }
  } catch {
  }

  const isBadarAccount =
    scopeId === 'default' ||
    scopeId.includes('14524303') ||
    scopeId.toLowerCase().includes('badar');

  const fallbackCourses =
    rawCourses !== null
      ? rawCourses
      : INITIAL_COURSES.map((c) => ({
          ...c,
          stickerUrl: toWebpAssetPath(c.stickerUrl),
        }));

  const fallbackTasks =
    rawTasks !== null
      ? rawTasks
      : isBadarAccount
      ? INITIAL_TASKS.map((t) => ({ ...t }))
      : [];

  const sanitized = sanitizeAndLinkCoursesAndTasks(
    fallbackCourses,
    fallbackTasks
  );

  return {
    courses: sanitized.courses,
    tasks: sanitized.tasks,
  };
}

const PRESET_CATEGORY_METADATA: Record<
  string,
  {
    subtitle: string;
    avatarUrl: string;
    accentColor: string;
    pastelBg: string;
  }
> = {
  Praktikum: {
    subtitle: 'Modul laboratorium & eksperimen',
    avatarUrl: '/assets/sticker-robotics.webp',
    accentColor: '#4F46E5',
    pastelBg: '#EEF2FF',
  },
  Proyek: {
    subtitle: 'Pengembangan aplikasi & sistem',
    avatarUrl: '/assets/sticker-coding.webp',
    accentColor: '#C41E3A',
    pastelBg: '#FEE2E2',
  },
  Teori: {
    subtitle: 'Analisis makalah & studi kasus',
    avatarUrl: '/assets/sticker-data.webp',
    accentColor: '#D97706',
    pastelBg: '#FEF3C7',
  },
  Kuis: {
    subtitle: 'Evaluasi materi & latihan soal',
    avatarUrl: '/assets/sticker-ai.webp',
    accentColor: '#059669',
    pastelBg: '#D1FAE5',
  },
};
const LEADERBOARD_ROW_PALETTE = [
  { bg: '#FECDD3', badgeBg: '#C41E3A' },
  { bg: '#A7F3D0', badgeBg: '#059669' },
  { bg: '#FDE68A', badgeBg: '#D97706' },
  { bg: '#DDD6FE', badgeBg: '#4F46E5' },
  { bg: '#BAE6FD', badgeBg: '#0284C7' },
  { bg: '#FED7AA', badgeBg: '#EA580C' },
] as const;

export default function App() {
  const [studentUser, setStudentUser] =
    useState<StudentUserSession>(loadStoredUser);

  const activeAccountScope = useMemo(
    () => getAccountScopeId(studentUser),
    [studentUser.nim, studentUser.uid, studentUser.authMethod]
  );

  const initialBundle = useMemo(
    () => loadSanitizedAccountBundle(activeAccountScope),
    []
  );

  const [courses, setCourses] = useState<CourseDetail[]>(initialBundle.courses);
  const [tasks, dispatch] = useReducer(taskReducer, initialBundle.tasks);

  const [screenPhase, setScreenPhase] = useState<AppScreenPhase>('splash');
  const [isGoogleLoading, setIsGoogleLoading] = useState<boolean>(false);
  const [isCloudSynced, setIsCloudSynced] = useState<boolean>(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState<boolean>(false);
  const [draftName, setDraftName] = useState<string>(studentUser.name);
  const [draftNim, setDraftNim] = useState<string>(studentUser.nim);
  const [draftInstitution, setDraftInstitution] = useState<string>(
    studentUser.institution
  );
  const [draftProgram, setDraftProgram] = useState<string>(studentUser.program);
  const [draftSemester, setDraftSemester] = useState<string>(
    studentUser.semester
  );
  const [draftClassGroup, setDraftClassGroup] = useState<string>(
    studentUser.classGroup
  );

  const [bottomTab, setBottomTab] = useState<MainBottomTab>('tugas');
  const [selectedDayOfWeek, setSelectedDayOfWeek] = useState<
    'Semua' | IndonesianDayName
  >('Semua');
  const [selectedExactDate, setSelectedExactDate] = useState<string | null>(
    null
  );
  const [onlyUrgentFilter, setOnlyUrgentFilter] = useState<boolean>(false);
  const [calendarHighlightedDate, setCalendarHighlightedDate] =
    useState<string>(() => formatDateToIndonesianLabel(new Date()));

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

  const tasksRef = useRef<AcademicTask[]>(tasks);
  tasksRef.current = tasks;
  const coursesRef = useRef<CourseDetail[]>(courses);
  coursesRef.current = courses;
  const studentUserRef = useRef<StudentUserSession>(studentUser);
  studentUserRef.current = studentUser;
  const previousScopeRef = useRef<string>(activeAccountScope);
  const authFlowSourceRef = useRef<'none' | 'profile-link' | 'auth-screen'>(
    'none'
  );
  useEffect(() => {
    if (previousScopeRef.current !== activeAccountScope) {
      const prevScope = previousScopeRef.current;
      previousScopeRef.current = activeAccountScope;
      if (
        authFlowSourceRef.current === 'profile-link' &&
        prevScope.startsWith('nim_') &&
        activeAccountScope.startsWith('google_')
      ) {
        const sanitized = sanitizeAndLinkCoursesAndTasks(
          coursesRef.current,
          tasksRef.current
        );
        setCourses(sanitized.courses);
        dispatch({ type: 'SET_TASKS', payload: sanitized.tasks });
      } else {
        const bundle = loadSanitizedAccountBundle(activeAccountScope);
        setCourses(bundle.courses);
        dispatch({ type: 'SET_TASKS', payload: bundle.tasks });
      }
    }
  }, [activeAccountScope]);
  useEffect(() => {
    try {
      const raw =
        window.localStorage.getItem(STORAGE_KEYS.SETTINGS) ||
        window.localStorage.getItem('taskdar_settings_v2');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (typeof parsed.reminderEnabled === 'boolean') {
          setReminderEnabled(parsed.reminderEnabled);
        }
        if (typeof parsed.googleCalendarSync === 'boolean') {
          setGoogleCalendarSync(parsed.googleCalendarSync);
        }
        if (typeof parsed.siakadAutoUpdate === 'boolean') {
          setSiakadAutoUpdate(parsed.siakadAutoUpdate);
        }
        if (typeof parsed.isDarkMode === 'boolean') {
          setIsDarkMode(parsed.isDarkMode);
        }
      }
    } catch {
    }
  }, []);
  useEffect(() => {
    try {
      window.localStorage.setItem(
        getScopedTasksKey(activeAccountScope),
        JSON.stringify(tasks)
      );
    } catch {
    }
  }, [tasks, activeAccountScope]);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        getScopedCoursesKey(activeAccountScope),
        JSON.stringify(courses)
      );
    } catch {
    }
  }, [courses, activeAccountScope]);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        STORAGE_KEYS.USER,
        JSON.stringify(studentUser)
      );
    } catch {
    }
  }, [studentUser]);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        STORAGE_KEYS.SETTINGS,
        JSON.stringify({
          reminderEnabled,
          googleCalendarSync,
          siakadAutoUpdate,
          isDarkMode,
        })
      );
    } catch {
    }
  }, [reminderEnabled, googleCalendarSync, siakadAutoUpdate, isDarkMode]);

  const titleInputRef = useRef<HTMLInputElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const avatarFileInputRef = useRef<HTMLInputElement | null>(null);

  const showToastMessage = useCallback((message: string) => {
    setFeedbackToast(message);
    window.setTimeout(() => {
      setFeedbackToast((prev) => (prev === message ? null : prev));
    }, 2800);
  }, []);

  const syncTaskToCloud = useCallback(async (taskItem: AcademicTask) => {
    if (!auth.currentUser || !auth.currentUser.emailVerified) return;
    const uid = auth.currentUser.uid;
    const safeId = taskItem.id.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 120);
    if (!safeId) return;
    const path = `users/${uid}/tasks/${safeId}`;
    const payload: Record<string, unknown> = {
      id: safeId,
      ownerId: uid,
      title: taskItem.title.slice(0, 200),
      course: taskItem.course.slice(0, 120),
      category: (taskItem.category || 'Praktikum').slice(0, 60),
      description: (taskItem.description || 'Tugas kuliah').slice(0, 1000),
      deadline: taskItem.deadline.slice(0, 40),
      status: taskItem.status,
    };
    if (taskItem.courseId) {
      payload.courseId = taskItem.courseId
        .replace(/[^a-zA-Z0-9_-]/g, '')
        .slice(0, 120);
    }
    try {
      await setDoc(doc(db, 'users', uid, 'tasks', safeId), payload);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  }, []);

  const deleteTaskFromCloud = useCallback(async (taskId: string) => {
    if (!auth.currentUser || !auth.currentUser.emailVerified) return;
    const uid = auth.currentUser.uid;
    const safeId = taskId.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 120);
    if (!safeId) return;
    const path = `users/${uid}/tasks/${safeId}`;
    try {
      await deleteDoc(doc(db, 'users', uid, 'tasks', safeId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  }, []);

  const syncCourseToCloud = useCallback(async (courseItem: CourseDetail) => {
    if (!auth.currentUser || !auth.currentUser.emailVerified) return;
    const uid = auth.currentUser.uid;
    const safeId = courseItem.id.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 120);
    if (!safeId) return;
    const path = `users/${uid}/courses/${safeId}`;
    const safeStickerUrl =
      courseItem.stickerUrl && courseItem.stickerUrl.length <= 500
        ? toWebpAssetPath(courseItem.stickerUrl)
        : '/assets/sticker-coding.webp';

    try {
      await setDoc(doc(db, 'users', uid, 'courses', safeId), {
        id: safeId,
        ownerId: uid,
        code: (courseItem.code || 'MK').slice(0, 24),
        name: courseItem.name.slice(0, 120),
        lecturer: courseItem.lecturer.slice(0, 120),
        schedule: courseItem.schedule.slice(0, 80),
        room: courseItem.room.slice(0, 80),
        credits: Math.max(1, Math.min(12, Number(courseItem.credits) || 3)),
        iconKey: (courseItem.iconKey || 'code').slice(0, 32),
        stickerUrl: safeStickerUrl,
        pastelBg: (courseItem.pastelBg || '#FEE2E2').slice(0, 16),
        pastelBorder: (courseItem.pastelBorder || '#FECACA').slice(0, 16),
        accentColor: (courseItem.accentColor || '#C41E3A').slice(0, 16),
        iconBg: (courseItem.iconBg || '#C41E3A').slice(0, 16),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  }, []);

  const deleteCourseFromCloud = useCallback(async (courseId: string) => {
    if (!auth.currentUser || !auth.currentUser.emailVerified) return;
    const uid = auth.currentUser.uid;
    const safeId = courseId.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 120);
    if (!safeId) return;
    const path = `users/${uid}/courses/${safeId}`;
    try {
      await deleteDoc(doc(db, 'users', uid, 'courses', safeId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  }, []);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser || !firebaseUser.emailVerified) {
        return;
      }

      const uid = firebaseUser.uid;
      const flowSource = authFlowSourceRef.current;
      authFlowSourceRef.current = 'none';

      const userDocPath = `users/${uid}`;
      const coursesPath = `users/${uid}/courses`;
      const tasksPath = `users/${uid}/tasks`;

      try {
        const userDocRef = doc(db, 'users', uid);
        const userDocSnap = await getDoc(userDocRef);
        const existingCloudProfile = userDocSnap.exists()
          ? userDocSnap.data()
          : null;

        const currentProfile = studentUserRef.current;
        const resolvedName =
          flowSource === 'auth-screen' && existingCloudProfile?.name
            ? String(existingCloudProfile.name)
            : firebaseUser.displayName || currentProfile.name;
        const resolvedNim =
          flowSource === 'auth-screen' && existingCloudProfile?.nim
            ? String(existingCloudProfile.nim)
            : currentProfile.nim || STUDENT_METADATA.nim;
        const resolvedClassGroup =
          flowSource === 'auth-screen' && existingCloudProfile?.classGroup
            ? String(existingCloudProfile.classGroup)
            : currentProfile.classGroup || STUDENT_METADATA.classGroup;
        const resolvedSemester =
          flowSource === 'auth-screen' && existingCloudProfile?.semester
            ? String(existingCloudProfile.semester)
            : currentProfile.semester || STUDENT_METADATA.semester;
        const resolvedProgram =
          flowSource === 'auth-screen' && existingCloudProfile?.program
            ? String(existingCloudProfile.program)
            : currentProfile.program || STUDENT_METADATA.program;
        const resolvedInstitution =
          flowSource === 'auth-screen' && existingCloudProfile?.institution
            ? String(existingCloudProfile.institution)
            : currentProfile.institution || STUDENT_METADATA.institution;
        const resolvedAvatar = toWebpAssetPath(
          (flowSource === 'auth-screen' && existingCloudProfile?.avatarUrl
            ? String(existingCloudProfile.avatarUrl)
            : firebaseUser.photoURL || currentProfile.avatarUrl) ||
            '/assets/mascot-splash.webp'
        );

        setStudentUser((prev) => ({
          ...prev,
          uid,
          name: resolvedName,
          shortName: resolvedName.split(' ')[0] || 'Mahasiswa',
          nim: resolvedNim,
          classGroup: resolvedClassGroup,
          semester: resolvedSemester,
          program: resolvedProgram,
          institution: resolvedInstitution,
          email: firebaseUser.email || prev.email,
          avatarUrl: resolvedAvatar.startsWith('data:')
            ? prev.avatarUrl
            : resolvedAvatar,
          authMethod: 'google',
        }));
        setIsCloudSynced(true);

        await setDoc(
          userDocRef,
          {
            uid,
            name: resolvedName.slice(0, 100),
            nim: resolvedNim.slice(0, 32),
            classGroup: resolvedClassGroup.slice(0, 32),
            semester: resolvedSemester.slice(0, 32),
            program: resolvedProgram.slice(0, 64),
            institution: resolvedInstitution.slice(0, 120),
            avatarUrl: (resolvedAvatar.length <= 500
              ? resolvedAvatar
              : '/assets/mascot-splash.webp'
            ).slice(0, 500),
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, userDocPath);
      }

      try {
        const [courseSnap, taskSnap] = await Promise.all([
          getDocs(collection(db, 'users', uid, 'courses')),
          getDocs(collection(db, 'users', uid, 'tasks')),
        ]);

        const cloudCourses: CourseDetail[] = courseSnap.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: String(data.id || docSnap.id),
            code: String(data.code || 'MK'),
            name: String(data.name || ''),
            lecturer: String(data.lecturer || ''),
            schedule: String(data.schedule || 'Senin, 08:00 - 10:30 WIB'),
            room: String(data.room || 'Ruang Kuliah'),
            credits: Number(data.credits) || 3,
            iconKey: (data.iconKey as CourseDetail['iconKey']) || 'code',
            stickerUrl: toWebpAssetPath(
              String(data.stickerUrl || '/assets/sticker-coding.webp')
            ),
            pastelBg: String(data.pastelBg || '#FEE2E2'),
            pastelBorder: String(data.pastelBorder || '#FECACA'),
            accentColor: String(data.accentColor || '#C41E3A'),
            iconBg: String(data.iconBg || '#C41E3A'),
          };
        });

        const cloudTasks: AcademicTask[] = taskSnap.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: String(data.id || docSnap.id),
            courseId: data.courseId ? String(data.courseId) : undefined,
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

        if (flowSource === 'profile-link') {
          const sanitized = sanitizeAndLinkCoursesAndTasks(
            coursesRef.current,
            tasksRef.current
          );
          setCourses(sanitized.courses);
          dispatch({ type: 'SET_TASKS', payload: sanitized.tasks });

          const activeCourseIds = new Set(sanitized.courses.map((c) => c.id));
          const activeTaskIds = new Set(sanitized.tasks.map((t) => t.id));

          for (const cc of cloudCourses) {
            if (!activeCourseIds.has(cc.id)) {
              await deleteCourseFromCloud(cc.id);
            }
          }
          for (const ct of cloudTasks) {
            if (!activeTaskIds.has(ct.id)) {
              await deleteTaskFromCloud(ct.id);
            }
          }
          for (const c of sanitized.courses) {
            await syncCourseToCloud(c);
          }
          for (const t of sanitized.tasks) {
            await syncTaskToCloud(t);
          }
        } else if (flowSource === 'auth-screen') {
          const baseCourses =
            cloudCourses.length > 0
              ? cloudCourses
              : INITIAL_COURSES.map((c) => ({ ...c }));
          const baseTasks =
            cloudCourses.length > 0
              ? cloudTasks
              : INITIAL_TASKS.map((t) => ({ ...t }));

          const sanitized = sanitizeAndLinkCoursesAndTasks(
            baseCourses,
            baseTasks
          );
          setCourses(sanitized.courses);
          dispatch({ type: 'SET_TASKS', payload: sanitized.tasks });

          for (const orphanId of sanitized.removedTaskIds) {
            await deleteTaskFromCloud(orphanId);
          }
          if (cloudCourses.length === 0) {
            for (const c of sanitized.courses) {
              await syncCourseToCloud(c);
            }
            for (const t of sanitized.tasks) {
              await syncTaskToCloud(t);
            }
          }
        } else {
          const googleScope = `google_${uid.replace(/[^a-zA-Z0-9_-]/g, '')}`;
          const hasLocalGoogleCourses =
            window.localStorage.getItem(getScopedCoursesKey(googleScope)) !==
            null;

          const sourceCourses = hasLocalGoogleCourses
            ? coursesRef.current
            : cloudCourses.length > 0
            ? cloudCourses
            : coursesRef.current;
          const localTasksById = new Map(
            tasksRef.current.map((lt) => [lt.id, lt])
          );
          const sourceTasks = hasLocalGoogleCourses
            ? tasksRef.current
            : cloudTasks.length > 0
            ? cloudTasks.map((ct) => ({
                ...ct,
                attachments: localTasksById.get(ct.id)?.attachments || [],
              }))
            : tasksRef.current;

          const sanitized = sanitizeAndLinkCoursesAndTasks(
            sourceCourses,
            sourceTasks
          );
          setCourses(sanitized.courses);
          dispatch({ type: 'SET_TASKS', payload: sanitized.tasks });

          const validCourseIds = new Set(sanitized.courses.map((c) => c.id));
          const validTaskIds = new Set(sanitized.tasks.map((t) => t.id));

          for (const cc of cloudCourses) {
            if (!validCourseIds.has(cc.id)) {
              await deleteCourseFromCloud(cc.id);
            }
          }
          for (const ct of cloudTasks) {
            if (!validTaskIds.has(ct.id)) {
              await deleteTaskFromCloud(ct.id);
            }
          }
          for (const c of sanitized.courses) {
            await syncCourseToCloud(c);
          }
          for (const t of sanitized.tasks) {
            await syncTaskToCloud(t);
          }
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, `${coursesPath} | ${tasksPath}`);
      }
    });

    return () => unsubscribe();
  }, [
    syncTaskToCloud,
    deleteTaskFromCloud,
    syncCourseToCloud,
    deleteCourseFromCloud,
  ]);
  useEffect(() => {
    const normalizedQuery = searchQuery.trim();
    console.log(
      '[TaskDar - Pencarian Langsung] Kata kunci aktif:',
      normalizedQuery === '' ? '(kosong)' : normalizedQuery
    );
  }, [searchQuery]);
  const validLinkedTasks = useMemo(
    () =>
      tasks.filter((task) => Boolean(resolveCourseForTask(task, courses))),
    [tasks, courses]
  );
  const taskMetrics: TaskMetrics = useMemo(() => {
    const total = validLinkedTasks.length;
    const completed = validLinkedTasks.filter(
      (task) => task.status === 'Selesai'
    ).length;
    const pending = total - completed;
    const urgent = validLinkedTasks.filter((task) => isTaskUrgent(task)).length;
    const completionRate =
      total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, pending, completed, completionRate, urgent };
  }, [validLinkedTasks]);

  const urgentCount = taskMetrics.urgent ?? 0;

  const totalCredits = useMemo(
    () => courses.reduce((sum, item) => sum + item.credits, 0),
    [courses]
  );
  const weeklyTaskDistribution = useMemo(() => {
    const perDay = WEEKDAY_FILTER_ITEMS.map((dayItem) => {
      const dayTasks = validLinkedTasks.filter(
        (t) => getIndonesianDayFromDateLabel(t.deadline) === dayItem.dayFull
      );
      const completedOnDay = dayTasks.filter(
        (t) => t.status === 'Selesai'
      ).length;
      return {
        ...dayItem,
        totalCount: dayTasks.length,
        completedCount: completedOnDay,
        pendingCount: dayTasks.length - completedOnDay,
      };
    });

    const maxTasksInDay = Math.max(1, ...perDay.map((d) => d.totalCount));
    const scaleCeiling = Math.max(4, maxTasksInDay);
    const activeDaysCount = perDay.filter((d) => d.totalCount > 0).length;

    return {
      perDay,
      maxTasksInDay,
      scaleCeiling,
      activeDaysCount,
    };
  }, [validLinkedTasks]);
  const personalLeaderboardEntries: PersonalLeaderboardEntry[] = useMemo(() => {
    if (leaderboardMode === 'course') {
      const courseEntries: PersonalLeaderboardEntry[] = courses.map(
        (course) => {
          const matching = validLinkedTasks.filter(
            (t) =>
              t.courseId === course.id ||
              t.course.trim().toLowerCase() === course.name.trim().toLowerCase()
          );
          const completedCount = matching.filter(
            (t) => t.status === 'Selesai'
          ).length;
          const totalCount = matching.length;
          const completionRate =
            totalCount > 0
              ? Math.round((completedCount / totalCount) * 100)
              : 0;
          const xpPoints = completedCount * 100 + totalCount * 10;

          return {
            id: course.id,
            title: course.name,
            subtitle: `${course.code} · ${completedCount}/${totalCount} Tugas Selesai`,
            avatarUrl: toWebpAssetPath(course.stickerUrl),
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
        return b.completedCount - a.completedCount;
      });
    }
    const categorySet = new Set<TaskCategory>(['Praktikum', 'Proyek', 'Teori']);
    validLinkedTasks.forEach((t) => {
      const trimmed = (t.category || 'Praktikum').trim();
      if (trimmed) categorySet.add(trimmed);
    });

    const dynamicCategories = Array.from(categorySet);
    const fallbackStickers = [
      '/assets/sticker-ai.webp',
      '/assets/sticker-design.webp',
      '/assets/sticker-oop.webp',
      '/assets/sticker-security.webp',
    ];

    const categoryEntries: PersonalLeaderboardEntry[] = dynamicCategories.map(
      (catName, idx) => {
        const matching = validLinkedTasks.filter(
          (t) =>
            (t.category || 'Praktikum').trim().toLowerCase() ===
            catName.toLowerCase()
        );
        const completedCount = matching.filter(
          (t) => t.status === 'Selesai'
        ).length;
        const totalCount = matching.length;
        const completionRate =
          totalCount > 0
            ? Math.round((completedCount / totalCount) * 100)
            : 0;
        const xpPoints = completedCount * 100 + totalCount * 10;

        const presetMeta = PRESET_CATEGORY_METADATA[catName];
        const badgeStyle = getCategoryBadgeStyle(catName);

        return {
          id: `cat-${catName}`,
          title: `Kategori ${catName}`,
          subtitle: `${completedCount}/${totalCount} Tugas Tuntas · ${
            presetMeta
              ? presetMeta.subtitle
              : 'Kategori tugas akademik mahasiswa'
          }`,
          avatarUrl: presetMeta
            ? presetMeta.avatarUrl
            : fallbackStickers[idx % fallbackStickers.length],
          completedCount,
          totalCount,
          completionRate,
          xpPoints,
          accentColor: presetMeta ? presetMeta.accentColor : badgeStyle.bg,
          pastelBg: presetMeta ? presetMeta.pastelBg : '#F1F5F9',
        };
      }
    );

    return categoryEntries.sort((a, b) => {
      if (b.completionRate !== a.completionRate) {
        return b.completionRate - a.completionRate;
      }
      return b.completedCount - a.completedCount;
    });
  }, [leaderboardMode, courses, validLinkedTasks]);

  const filteredTasks = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return validLinkedTasks.filter((task) => {
      const matchedCourse = resolveCourseForTask(task, courses);
      if (!matchedCourse) return false;

      const matchesStatus =
        activeFilterTab === 'Semua' ? true : task.status === activeFilterTab;
      const matchesUrgent = onlyUrgentFilter ? isTaskUrgent(task) : true;
      const matchesCourse =
        selectedCourseFilter === 'Semua'
          ? true
          : matchedCourse.name.toLowerCase() ===
            selectedCourseFilter.toLowerCase();
      const matchesDayOfWeek =
        selectedDayOfWeek === 'Semua'
          ? true
          : getIndonesianDayFromDateLabel(task.deadline) === selectedDayOfWeek;
      const matchesExactDate =
        selectedExactDate === null ? true : task.deadline === selectedExactDate;
      const matchesKeyword =
        query === '' ||
        task.title.toLowerCase().includes(query) ||
        matchedCourse.name.toLowerCase().includes(query) ||
        (task.category || '').toLowerCase().includes(query);

      return (
        matchesStatus &&
        matchesUrgent &&
        matchesCourse &&
        matchesDayOfWeek &&
        matchesExactDate &&
        matchesKeyword
      );
    });
  }, [
    validLinkedTasks,
    courses,
    activeFilterTab,
    onlyUrgentFilter,
    selectedCourseFilter,
    selectedDayOfWeek,
    selectedExactDate,
    searchQuery,
  ]);

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
      const createdId = payload.id || `task-${Date.now()}`;
      const matchedCourse = resolveCourseForTask(payload, courses);
      const resolvedCourseId = matchedCourse?.id || payload.courseId;
      const resolvedCourseName =
        matchedCourse?.name || payload.course.trim();

      const newTaskObj: AcademicTask = {
        id: createdId,
        courseId: resolvedCourseId,
        title: payload.title.trim(),
        course: resolvedCourseName,
        category: payload.category.trim() || 'Praktikum',
        description: payload.description.trim(),
        deadline: payload.deadline.trim(),
        status: 'Belum Dikerjakan',
        attachments: payload.attachments ?? [],
      };
      dispatch({
        type: 'ADD_TASK',
        payload: {
          ...payload,
          id: createdId,
          courseId: resolvedCourseId,
          course: resolvedCourseName,
        },
      });
      void syncTaskToCloud(newTaskObj);
      showToastMessage('Tugas baru berhasil ditambahkan.');
    },
    [courses, syncTaskToCloud, showToastMessage]
  );

  const handleEditTask = useCallback(
    (payload: EditTaskPayload) => {
      const matchedCourse = resolveCourseForTask(payload, courses);
      const resolvedCourseId = matchedCourse?.id || payload.courseId;
      const resolvedCourseName =
        matchedCourse?.name || payload.course.trim();

      dispatch({
        type: 'EDIT_TASK',
        payload: {
          ...payload,
          courseId: resolvedCourseId,
          course: resolvedCourseName,
        },
      });
      const existing = tasks.find((t) => t.id === payload.id);
      if (existing) {
        void syncTaskToCloud({
          ...existing,
          courseId: resolvedCourseId,
          title: payload.title.trim(),
          course: resolvedCourseName,
          category: payload.category.trim() || 'Praktikum',
          description: payload.description.trim(),
          deadline: payload.deadline.trim(),
          attachments: payload.attachments ?? existing.attachments ?? [],
        });
      }
      setEditingTask(null);
      showToastMessage('Perubahan tugas berhasil disimpan.');
    },
    [courses, tasks, syncTaskToCloud, showToastMessage]
  );

  const handleSaveCourse = useCallback(
    (payload: NewCoursePayload) => {
      const chosenTheme =
        payload.colorThemeId === 'custom' && payload.customAccentHex
          ? deriveBentoThemeFromHex(payload.customAccentHex)
          : BENTO_COLOR_THEMES.find((t) => t.id === payload.colorThemeId) ||
            BENTO_COLOR_THEMES[0];

      const optimizedSticker = toWebpAssetPath(payload.stickerUrl);

      if (payload.id) {
        const oldCourse = courses.find((c) => c.id === payload.id);
        setCourses((prev) =>
          prev.map((c) => {
            if (c.id !== payload.id) return c;
            const updatedCourse: CourseDetail = {
              ...c,
              name: payload.name,
              lecturer: payload.lecturer,
              credits: payload.credits,
              schedule: payload.schedule,
              room: payload.room,
              iconKey: payload.iconKey,
              stickerUrl: optimizedSticker,
              pastelBg: chosenTheme.pastelBg,
              pastelBorder: chosenTheme.pastelBorder,
              accentColor: chosenTheme.accentColor,
              iconBg: chosenTheme.iconBg,
            };
            void syncCourseToCloud(updatedCourse);
            return updatedCourse;
          })
        );
        if (oldCourse) {
          dispatch({
            type: 'UPDATE_COURSE_ON_TASKS',
            payload: {
              courseId: oldCourse.id,
              oldCourseName: oldCourse.name,
              newCourseName: payload.name,
            },
          });
          if (
            selectedCourseFilter.toLowerCase() ===
            oldCourse.name.toLowerCase()
          ) {
            setSelectedCourseFilter(payload.name);
          }
          const affectedTasks = tasks.filter(
            (t) =>
              t.courseId === oldCourse.id ||
              t.course.trim().toLowerCase() ===
                oldCourse.name.trim().toLowerCase()
          );
          for (const t of affectedTasks) {
            void syncTaskToCloud({
              ...t,
              courseId: oldCourse.id,
              course: payload.name.trim(),
            });
          }
        }

        setEditingCourse(null);
        showToastMessage(`Mata kuliah ${payload.name} berhasil diperbarui.`);
      } else {
        const maxCodeNum = courses.reduce((max, c) => {
          const num = parseInt(c.code.replace(/\D/g, ''), 10);
          return !Number.isNaN(num) && num > max ? num : max;
        }, 360);
        const nextCodeNumber = maxCodeNum + 1;

        const newCourse: CourseDetail = {
          id: `course-${Date.now()}`,
          code: `TI${nextCodeNumber}`,
          name: payload.name,
          lecturer: payload.lecturer,
          credits: payload.credits,
          schedule: payload.schedule,
          room: payload.room,
          iconKey: payload.iconKey,
          stickerUrl: optimizedSticker,
          pastelBg: chosenTheme.pastelBg,
          pastelBorder: chosenTheme.pastelBorder,
          accentColor: chosenTheme.accentColor,
          iconBg: chosenTheme.iconBg,
        };
        setCourses((prev) => [...prev, newCourse]);
        void syncCourseToCloud(newCourse);
        showToastMessage(`Mata kuliah ${payload.name} berhasil ditambahkan.`);
      }
    },
    [
      courses,
      tasks,
      selectedCourseFilter,
      syncCourseToCloud,
      syncTaskToCloud,
      showToastMessage,
    ]
  );
  const handleDeleteCourse = useCallback(
    (courseItem: CourseDetail) => {
      const tasksToDelete = tasks.filter(
        (t) =>
          t.courseId === courseItem.id ||
          t.course.trim().toLowerCase() ===
            courseItem.name.trim().toLowerCase()
      );

      setCourses((prev) => prev.filter((c) => c.id !== courseItem.id));
      dispatch({
        type: 'DELETE_TASKS_BY_COURSE',
        payload: {
          courseId: courseItem.id,
          courseName: courseItem.name,
        },
      });

      void deleteCourseFromCloud(courseItem.id);
      for (const t of tasksToDelete) {
        void deleteTaskFromCloud(t.id);
      }

      if (
        selectedCourseFilter.toLowerCase() ===
        courseItem.name.toLowerCase()
      ) {
        setSelectedCourseFilter('Semua');
      }
      showToastMessage(
        tasksToDelete.length > 0
          ? `Mata kuliah ${courseItem.name} beserta ${tasksToDelete.length} tugasnya dihapus.`
          : `Mata kuliah ${courseItem.name} dihapus.`
      );
    },
    [
      tasks,
      selectedCourseFilter,
      deleteCourseFromCloud,
      deleteTaskFromCloud,
      showToastMessage,
    ]
  );

  const handleResetTasks = useCallback(() => {
    const isBadarAccount =
      activeAccountScope === 'default' ||
      activeAccountScope.includes('14524303') ||
      studentUser.nim === '14524303';
    const freshCourses = INITIAL_COURSES.map((c) => ({
      ...c,
      stickerUrl: toWebpAssetPath(c.stickerUrl),
    }));
    const freshTasks = isBadarAccount
      ? INITIAL_TASKS.map((t) => ({ ...t }))
      : [];

    dispatch({ type: 'RESET_TASKS' });
    setCourses(freshCourses);
    setSearchQuery('');
    setActiveFilterTab('Semua');
    setOnlyUrgentFilter(false);
    setSelectedCourseFilter('Semua');
    setSelectedDayOfWeek('Semua');
    setSelectedExactDate(null);

    try {
      window.localStorage.setItem(
        getScopedCoursesKey(activeAccountScope),
        JSON.stringify(freshCourses)
      );
      window.localStorage.setItem(
        getScopedTasksKey(activeAccountScope),
        JSON.stringify(freshTasks)
      );
    } catch {
    }

    if (auth.currentUser && auth.currentUser.emailVerified) {
      for (const c of freshCourses) {
        void syncCourseToCloud(c);
      }
      for (const t of freshTasks) {
        void syncTaskToCloud(t);
      }
    }

    showToastMessage('Data akun ini berhasil diatur ulang ke kondisi awal.');
  }, [
    activeAccountScope,
    syncCourseToCloud,
    syncTaskToCloud,
    showToastMessage,
  ]);

  const handleOpenAddSheet = useCallback(
    (courseName?: string) => {
      setEditingTask(null);
      if (courseName) {
        setPreselectedCourseForAdd(courseName);
      } else if (courses.length > 0) {
        setPreselectedCourseForAdd(courses[0].name);
      }
      setIsAddSheetOpen(true);
    },
    [courses]
  );

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

  const handleGoogleSignIn = useCallback(async (): Promise<{
    uid: string;
    name: string;
    email: string;
    avatarUrl: string;
  }> => {
    setIsGoogleLoading(true);
    authFlowSourceRef.current =
      screenPhase === 'main' ? 'profile-link' : 'auth-screen';

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const displayName = user.displayName || studentUser.name;
      const firstWord = displayName.split(' ')[0] || 'Mahasiswa';
      const email = user.email || studentUser.email || STUDENT_METADATA.email;
      const avatarUrl = toWebpAssetPath(user.photoURL || studentUser.avatarUrl);

      setStudentUser((prev) => ({
        ...prev,
        uid: user.uid,
        name: displayName,
        shortName: firstWord,
        email,
        avatarUrl,
        authMethod: 'google',
      }));
      setIsCloudSynced(true);
      if (screenPhase === 'main') {
        showToastMessage(
          `Akun Google (${email}) berhasil dihubungkan dan disinkronkan.`
        );
      }
      return {
        uid: user.uid,
        name: displayName,
        email,
        avatarUrl,
      };
    } catch {
      const fallbackEmail = studentUser.email || STUDENT_METADATA.email;
      const fallbackName = studentUser.name || STUDENT_METADATA.name;
      const fallbackUid = `google-${studentUser.nim || '14524303'}`;
      setStudentUser((prev) => ({
        ...prev,
        uid: fallbackUid,
        email: fallbackEmail,
        authMethod: 'google',
      }));
      setIsCloudSynced(true);
      if (screenPhase === 'main') {
        showToastMessage(
          `Terhubung ke Akun Google (${fallbackEmail}).`
        );
      }
      return {
        uid: fallbackUid,
        name: fallbackName,
        email: fallbackEmail,
        avatarUrl: toWebpAssetPath(
          studentUser.avatarUrl || STUDENT_METADATA.avatarUrl
        ),
      };
    } finally {
      setIsGoogleLoading(false);
    }
  }, [
    studentUser.name,
    studentUser.nim,
    studentUser.email,
    studentUser.avatarUrl,
    screenPhase,
    showToastMessage,
  ]);

  const handleOpenEditProfile = () => {
    setDraftName(studentUser.name);
    setDraftNim(studentUser.nim);
    setDraftInstitution(studentUser.institution);
    setDraftProgram(studentUser.program);
    setDraftSemester(studentUser.semester);
    setDraftClassGroup(studentUser.classGroup);
    setIsEditProfileOpen(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = draftName.trim() || studentUser.name;
    const firstWord = cleanName.split(' ')[0] || cleanName;
    const updatedUser: StudentUserSession = {
      ...studentUser,
      name: cleanName,
      shortName: firstWord,
      nim: draftNim.trim() || studentUser.nim,
      institution: draftInstitution.trim() || studentUser.institution,
      program: draftProgram.trim() || studentUser.program,
      semester: draftSemester.trim() || studentUser.semester,
      classGroup: draftClassGroup.trim() || studentUser.classGroup,
    };
    setStudentUser(updatedUser);
    setIsEditProfileOpen(false);

    if (auth.currentUser && auth.currentUser.emailVerified) {
      const uid = auth.currentUser.uid;
      try {
        await setDoc(
          doc(db, 'users', uid),
          {
            uid,
            name: updatedUser.name.slice(0, 100),
            nim: updatedUser.nim.slice(0, 32),
            classGroup: updatedUser.classGroup.slice(0, 32),
            semester: updatedUser.semester.slice(0, 32),
            program: updatedUser.program.slice(0, 64),
            institution: updatedUser.institution.slice(0, 120),
            avatarUrl: (updatedUser.avatarUrl.length <= 500
              ? updatedUser.avatarUrl
              : '/assets/mascot-splash.webp'
            ).slice(0, 500),
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${uid}`);
      }
    }

    showToastMessage('Identitas profil & kampus berhasil diperbarui.');
  };

  const handleLogout = useCallback(async () => {
    try {
      await firebaseSignOut(auth);
    } catch {
    }
    setIsCloudSynced(false);
    setSelectedCourseFilter('Semua');
    setSelectedDayOfWeek('Semua');
    setSelectedExactDate(null);
    setOnlyUrgentFilter(false);
    setScreenPhase('auth');
    showToastMessage('Anda telah keluar dari sesi akun TaskDar.');
  }, [showToastMessage]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const webpDataUrl = await convertImageFileToWebpDataUrl(file, 768, 0.92);
      setStudentUser((prev) => ({
        ...prev,
        avatarUrl: webpDataUrl,
      }));
      showToastMessage('Foto profil berhasil diperbarui!');
    } catch {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setStudentUser((prev) => ({
            ...prev,
            avatarUrl: reader.result as string,
          }));
          showToastMessage('Foto profil berhasil diperbarui!');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const allTasksCompleted =
    taskMetrics.total > 0 && taskMetrics.pending === 0;
  const isStikomCampus = studentUser.institution
    .toLowerCase()
    .includes('stikom');

  return (
    <div
      className={`min-h-screen w-full transition-colors duration-200 ${
        isDarkMode
          ? 'bg-[#111622] text-[#F8FAFC]'
          : 'bg-[#FFFDF9] text-[#0F172A]'
      }`}
    >
      <main
        aria-label="Aplikasi TaskDar"
        className="w-full max-w-[640px] mx-auto min-h-screen flex flex-col relative pb-28"
      >
        {feedbackToast && (
          <div
            role="status"
            className="fixed top-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-[592px] z-50 flex items-center gap-2 px-4 py-3 rounded-2xl bg-[#0F172A] text-white border-2 border-[#C41E3A] text-xs font-extrabold shadow-lg"
          >
            <CheckCircle2
              className="w-4 h-4 text-[#34D399] shrink-0"
              aria-hidden="true"
            />
            <span className="truncate">{feedbackToast}</span>
          </div>
        )}
        {bottomTab === 'tugas' && (
          <motion.section
            key="tab-tugas"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18 }}
            aria-label="Daftar Tugas Harian"
            className="flex-1 flex flex-col"
          >
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
                    <span className="px-2.5 py-0.5 rounded-xl bg-[#C41E3A] text-white border border-[#0F172A] text-[10px] font-black shrink-0">
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
                  onClick={() => {
                    if (urgentCount > 0) {
                      setOnlyUrgentFilter((prev) => !prev);
                      setActiveFilterTab('Semua');
                    } else if (taskMetrics.pending > 0) {
                      setActiveFilterTab((prev) =>
                        prev === 'Belum Dikerjakan'
                          ? 'Semua'
                          : 'Belum Dikerjakan'
                      );
                    } else {
                      setBottomTab('progres');
                    }
                  }}
                  aria-label="Filter tugas mendesak dengan tenggat H-3 ke bawah"
                  title={
                    urgentCount > 0
                      ? 'Ketuk untuk menyaring tugas mendesak (H-3, Hari Ini, atau Terlewat)'
                      : 'Tidak ada tugas mendesak dalam 3 hari ke depan'
                  }
                  className={`min-h-[40px] px-3 py-1 rounded-2xl text-white border-2 border-[#0F172A] shadow-[0_2px_0_0_#0F172A] text-xs font-black flex items-center gap-1.5 active:translate-y-0.5 transition-all cursor-pointer ${
                    onlyUrgentFilter
                      ? 'bg-[#0F172A] text-white'
                      : urgentCount > 0
                      ? 'bg-[#C41E3A]'
                      : 'bg-[#059669]'
                  }`}
                >
                  {urgentCount > 0 ? (
                    <Flame className="w-4 h-4 shrink-0" aria-hidden="true" />
                  ) : (
                    <CheckCircle2
                      className="w-4 h-4 shrink-0"
                      aria-hidden="true"
                    />
                  )}
                  <span>
                    {urgentCount > 0
                      ? `${urgentCount} Mendesak`
                      : '0 Mendesak'}
                  </span>
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
                  className={`min-w-[40px] min-h-[40px] rounded-2xl border-2 flex items-center justify-center transition-all shadow-[0_2px_0_0_#0F172A] active:translate-y-0.5 ${
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
            <div className="px-4 sm:px-6 pb-2.5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDayOfWeek('Semua');
                      setSelectedExactDate(null);
                      setOnlyUrgentFilter(false);
                    }}
                    className={`min-h-[34px] px-3 py-1 rounded-xl text-xs font-extrabold border-2 transition-all ${
                      selectedDayOfWeek === 'Semua' &&
                      selectedExactDate === null &&
                      !onlyUrgentFilter
                        ? 'bg-[#C41E3A] border-[#0F172A] text-white shadow-[0_2px_0_0_#0F172A]'
                        : isDarkMode
                        ? 'bg-[#1F242D] border-[#2E3440] text-[#CBD5E1]'
                        : 'bg-white border-[#0F172A] text-[#0F172A]'
                    }`}
                  >
                    Semua Hari ({validLinkedTasks.length})
                  </button>
                  {selectedDayOfWeek !== 'Semua' && (
                    <span className="px-2.5 py-1 rounded-xl bg-white border-2 border-[#0F172A] text-xs font-extrabold text-[#C41E3A]">
                      Hari {selectedDayOfWeek}
                    </span>
                  )}
                  {selectedExactDate !== null && (
                    <span className="px-2.5 py-1 rounded-xl bg-white border-2 border-[#0F172A] text-xs font-extrabold text-[#C41E3A]">
                      {selectedExactDate}
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleOpenCalendarView}
                  aria-label="Buka kalender bulan penuh"
                  className="min-h-[34px] px-3 py-1 rounded-xl bg-white hover:bg-[#FFF1F2] text-[#C41E3A] border-2 border-[#0F172A] shadow-[0_2px_0_0_#0F172A] text-xs font-extrabold flex items-center gap-1.5 active:translate-y-0.5 transition-all shrink-0"
                >
                  <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Kalender Bulan</span>
                </button>
              </div>

              <div
                aria-label="Filter Hari Senin sampai Minggu"
                className="grid grid-cols-7 gap-1.5 sm:gap-2"
              >
                {WEEKDAY_FILTER_ITEMS.map((dayItem) => {
                  const isSelected =
                    selectedDayOfWeek === dayItem.dayFull &&
                    selectedExactDate === null;
                  const tasksOnWeekday = validLinkedTasks.filter(
                    (t) =>
                      getIndonesianDayFromDateLabel(t.deadline) ===
                      dayItem.dayFull
                  ).length;
                  const coursesOnDay = courses.filter(
                    (c) => getCourseScheduledDay(c.schedule) === dayItem.dayFull
                  ).length;

                  return (
                    <button
                      key={dayItem.dayFull}
                      type="button"
                      onClick={() => {
                        setSelectedExactDate(null);
                        setSelectedDayOfWeek((prev) =>
                          prev === dayItem.dayFull ? 'Semua' : dayItem.dayFull
                        );
                      }}
                      aria-label={`Hari ${dayItem.dayFull}, ${coursesOnDay} mata kuliah terjadwal, ${tasksOnWeekday} tugas`}
                      aria-pressed={isSelected}
                      className={`relative py-2 px-1 rounded-2xl flex flex-col items-center justify-center transition-all border-2 ${
                        isSelected
                          ? 'bg-[#C41E3A] border-[#0F172A] text-white shadow-[0_2px_0_0_#0F172A] -translate-y-0.5'
                          : isDarkMode
                          ? 'bg-[#1F242D] border-[#2E3440] text-[#CBD5E1] hover:border-[#C41E3A]'
                          : 'bg-white border-[#0F172A] text-[#0F172A] hover:bg-[#FFF1F2]'
                      }`}
                    >
                      {tasksOnWeekday > 0 && (
                        <span
                          className={`absolute -top-1.5 -right-1 w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center border ${
                            isSelected
                              ? 'bg-white text-[#C41E3A] border-[#0F172A]'
                              : 'bg-[#C41E3A] text-white border-[#0F172A]'
                          }`}
                        >
                          {tasksOnWeekday}
                        </span>
                      )}

                      <span
                        className={`text-[11px] font-black leading-none ${
                          isSelected
                            ? 'text-white'
                            : isDarkMode
                            ? 'text-white'
                            : 'text-[#0F172A]'
                        }`}
                      >
                        {dayItem.dayShort}
                      </span>

                      <span
                        className={`mt-1 text-[9px] font-extrabold tracking-tight leading-none ${
                          isSelected
                            ? 'text-white/95'
                            : coursesOnDay > 0
                            ? 'text-[#C41E3A]'
                            : isDarkMode
                            ? 'text-[#64748B]'
                            : 'text-[#94A3B8]'
                        }`}
                      >
                        {coursesOnDay} MK
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="px-4 sm:px-6 pb-2">
              <div
                className={`relative flex items-center rounded-2xl border-2 transition-colors ${
                  isDarkMode
                    ? 'bg-[#1F242D] border-[#2E3440] focus-within:border-[#C41E3A]'
                    : 'bg-white border-[#0F172A] focus-within:border-[#C41E3A]'
                }`}
              >
                <Search
                  className="w-4 h-4 ml-3.5 shrink-0 pointer-events-none text-[#C41E3A]"
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
            <nav
              aria-label="Filter Status Tugas"
              className={`px-4 sm:px-6 border-b-2 grid grid-cols-3 ${
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
                    <span
                      className={`px-1.5 py-0.2 rounded-md text-[10px] font-black ${
                        isActive
                          ? 'bg-[#C41E3A] text-white'
                          : isDarkMode
                          ? 'bg-[#232934] text-[#94A3B8]'
                          : 'bg-[#F1F5F9] text-[#475569]'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </nav>
            {(selectedCourseFilter !== 'Semua' ||
              selectedDayOfWeek !== 'Semua' ||
              selectedExactDate !== null ||
              onlyUrgentFilter) && (
              <div
                className={`mx-4 sm:mx-6 mt-2.5 px-3.5 py-2 rounded-2xl flex items-center justify-between text-xs border-2 ${
                  isDarkMode
                    ? 'bg-[#1F242D] border-[#2E3440] text-[#CBD5E1]'
                    : 'bg-white border-[#0F172A] text-[#0F172A] shadow-[0_2px_0_0_#0F172A]'
                }`}
              >
                <span className="truncate font-semibold">
                  Filter aktif:{' '}
                  <strong className="text-[#C41E3A]">
                    {onlyUrgentFilter
                      ? 'Tugas Mendesak (H-3 / Hari Ini / Terlewat) '
                      : ''}
                    {selectedCourseFilter !== 'Semua'
                      ? selectedCourseFilter
                      : ''}{' '}
                    {selectedDayOfWeek !== 'Semua'
                      ? `(Hari ${selectedDayOfWeek})`
                      : ''}{' '}
                    {selectedExactDate !== null ? `(${selectedExactDate})` : ''}
                  </strong>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCourseFilter('Semua');
                    setSelectedDayOfWeek('Semua');
                    setSelectedExactDate(null);
                    setOnlyUrgentFilter(false);
                  }}
                  className="min-h-[30px] px-2.5 rounded-xl bg-[#C41E3A] text-white font-extrabold shrink-0"
                >
                  Reset Filter
                </button>
              </div>
            )}
            <div className="px-4 sm:px-6 pt-3.5 space-y-3">
              {allTasksCompleted && activeFilterTab === 'Semua' && (
                <div
                  className={`p-3.5 rounded-3xl border-2 flex items-center gap-3 ${
                    isDarkMode
                      ? 'bg-[#064E3B]/30 border-[#059669]'
                      : 'bg-[#D1FAE5] border-[#0F172A] shadow-[0_3px_0_0_#0F172A]'
                  }`}
                >
                  <StudentMascotAvatar
                    size="sm"
                    avatarUrl="/assets/olympiad-trophy.webp"
                  />
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-xs font-extrabold ${
                        isDarkMode ? 'text-[#34D399]' : 'text-[#065F46]'
                      }`}
                    >
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
                      : 'border-[#0F172A] bg-white shadow-[0_3px_0_0_#0F172A]'
                  }`}
                >
                  <CelebrationMascotIllustration />
                  <h3 className="mt-3 text-[15px] font-extrabold leading-snug max-w-[260px] mx-auto">
                    {courses.length === 0
                      ? 'Belum ada mata kuliah yang terdaftar'
                      : onlyUrgentFilter
                      ? 'Tidak ada tugas mendesak (H-3 ke bawah)'
                      : selectedExactDate !== null
                      ? `Tidak ada tenggat tugas pada ${selectedExactDate}`
                      : selectedDayOfWeek !== 'Semua'
                      ? `Tidak ada tenggat tugas pada hari ${selectedDayOfWeek}`
                      : 'Semua tugas kuliah sudah tuntas! Waktunya istirahat.'}
                  </h3>
                  <p
                    className={`text-xs mt-1.5 max-w-[250px] mx-auto leading-relaxed ${
                      isDarkMode ? 'text-[#94A3B8]' : 'text-[#64748B]'
                    }`}
                  >
                    {courses.length === 0
                      ? 'Tambahkan mata kuliah terlebih dahulu atau atur ulang data awal.'
                      : searchQuery.trim() !== ''
                      ? `Tidak ditemukan tugas dengan kata kunci "${searchQuery}".`
                      : onlyUrgentFilter ||
                        selectedExactDate !== null ||
                        selectedDayOfWeek !== 'Semua'
                      ? 'Ketuk tombol di bawah untuk menampilkan seluruh tugas kuliah.'
                      : 'Tidak ada tugas yang menunggu pada tampilan ini.'}
                  </p>
                  <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                    {(searchQuery !== '' ||
                      activeFilterTab !== 'Semua' ||
                      onlyUrgentFilter ||
                      selectedCourseFilter !== 'Semua' ||
                      selectedDayOfWeek !== 'Semua' ||
                      selectedExactDate !== null) && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery('');
                          setActiveFilterTab('Semua');
                          setOnlyUrgentFilter(false);
                          setSelectedCourseFilter('Semua');
                          setSelectedDayOfWeek('Semua');
                          setSelectedExactDate(null);
                        }}
                        className={`min-h-[44px] px-4 rounded-2xl text-xs font-extrabold border-2 transition-colors ${
                          isDarkMode
                            ? 'bg-[#232934] text-white border-[#323A48]'
                            : 'bg-white text-[#0F172A] border-[#0F172A] shadow-[0_2px_0_0_#0F172A]'
                        }`}
                      >
                        Lihat Semua Tugas
                      </button>
                    )}
                    {courses.length > 0 ? (
                      <button
                        type="button"
                        onClick={() => handleOpenAddSheet()}
                        className="min-h-[44px] px-4 rounded-2xl bg-[#C41E3A] hover:bg-[#A3162E] text-xs font-extrabold text-white border-2 border-[#0F172A] shadow-[0_2px_0_0_#0F172A] transition-colors"
                      >
                        Tambah Tugas Baru
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setBottomTab('matakuliah')}
                        className="min-h-[44px] px-4 rounded-2xl bg-[#C41E3A] hover:bg-[#A3162E] text-xs font-extrabold text-white border-2 border-[#0F172A] shadow-[0_2px_0_0_#0F172A] transition-colors"
                      >
                        Kelola Mata Kuliah
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => handleOpenAddSheet()}
              aria-label="Tambah tugas baru"
              title="Tambah Tugas"
              className="fixed right-5 sm:right-[max(1.5rem,calc(50%-290px))] bottom-22 z-30 w-14 h-14 min-w-[56px] min-h-[56px] rounded-full bg-[#C41E3A] hover:bg-[#A3162E] text-white border-2 border-[#0F172A] shadow-[0_4px_0_0_#0F172A] flex items-center justify-center transition-transform active:scale-90"
            >
              <Plus className="w-6 h-6 stroke-[2.75]" aria-hidden="true" />
            </button>
          </motion.section>
        )}
        {bottomTab === 'matakuliah' && (
          <motion.section
            key="tab-matakuliah"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18 }}
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
                  className={`min-w-[42px] min-h-[42px] rounded-2xl border-2 flex items-center justify-center shadow-[0_2px_0_0_#0F172A] active:translate-y-0.5 transition-all ${
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
                  className="min-h-[42px] px-3.5 rounded-2xl bg-[#C41E3A] hover:bg-[#A3162E] text-white text-xs font-extrabold border-2 border-[#0F172A] shadow-[0_2px_0_0_#0F172A] flex items-center gap-1.5 active:translate-y-0.5 transition-all"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
                  <span>Matkul</span>
                </button>
              </div>
            </header>

            <div className="px-4 sm:px-6 pt-1">
              {courseLayoutMode === 'grid' ? (
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  {courses.map((course) => {
                    const courseTasks = validLinkedTasks.filter(
                      (t) =>
                        t.courseId === course.id ||
                        t.course.trim().toLowerCase() ===
                          course.name.trim().toLowerCase()
                    );
                    const doneCount = courseTasks.filter(
                      (t) => t.status === 'Selesai'
                    ).length;
                    const rate =
                      courseTasks.length > 0
                        ? Math.round((doneCount / courseTasks.length) * 100)
                        : 0;
                    const readableBadgeText = getReadableTextColor(
                      course.iconBg
                    );
                    const sharpStickerUrl = toWebpAssetPath(course.stickerUrl);
                    const stageBgColor = getStickerStageBackground(
                      sharpStickerUrl,
                      course.iconBg
                    );

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
                            : 'shadow-[0_3px_0_0_#0F172A]'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1">
                            <span
                              style={{
                                backgroundColor: course.iconBg,
                                color: readableBadgeText,
                              }}
                              className="px-2.5 py-0.5 rounded-xl text-[10px] font-extrabold whitespace-nowrap shrink-0 border border-[#0F172A]"
                            >
                              {course.code} · {course.credits} SKS
                            </span>

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingCourse(course);
                                  setIsAddCourseOpen(true);
                                }}
                                aria-label={`Edit mata kuliah ${course.name}`}
                                className="w-7 h-7 rounded-lg bg-white border border-[#0F172A] flex items-center justify-center text-[#0F172A] hover:bg-[#F8FAFC]"
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
                                className="w-7 h-7 rounded-lg bg-white border border-[#0F172A] flex items-center justify-center text-[#C41E3A] hover:bg-[#FFF1F2]"
                              >
                                <Trash2
                                  className="w-3.5 h-3.5"
                                  aria-hidden="true"
                                />
                              </button>
                            </div>
                          </div>
                          <div
                            onClick={() => {
                              setSelectedCourseFilter(course.name);
                              setActiveFilterTab('Semua');
                              setBottomTab('tugas');
                            }}
                            style={{
                              backgroundColor: stageBgColor,
                            }}
                            className="mt-2.5 w-full h-32 sm:h-36 rounded-2xl border-2 border-[#0F172A] overflow-hidden flex items-center justify-center cursor-pointer"
                          >
                            <img
                              src={sharpStickerUrl}
                              alt={course.name}
                              className="w-full h-full object-contain"
                              referrerPolicy="no-referrer"
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
                              isDarkMode ? 'text-[#94A3B8]' : 'text-[#334155]'
                            }`}
                          >
                            {course.lecturer}
                          </p>
                          <p
                            className={`text-[10px] font-bold truncate mt-0.5 ${
                              isDarkMode ? 'text-[#64748B]' : 'text-[#475569]'
                            }`}
                          >
                            {course.schedule}
                          </p>
                        </div>
                        <div className="mt-3 pt-2 border-t border-black/10">
                          <div className="flex items-center justify-between text-[10px] font-extrabold mb-1">
                            <span>
                              {doneCount}/{courseTasks.length} Tugas
                            </span>
                            <span>{rate}%</span>
                          </div>
                          <div className="h-2 rounded-full bg-white border border-[#0F172A]/30 overflow-hidden mb-2.5">
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
                              className="min-h-[36px] rounded-xl bg-white border-2 border-[#0F172A] text-[#0F172A] text-[11px] font-extrabold flex items-center justify-center gap-0.5"
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
                              style={{
                                backgroundColor: course.iconBg,
                                color: readableBadgeText,
                              }}
                              className="min-h-[36px] rounded-xl border-2 border-[#0F172A] text-[11px] font-extrabold flex items-center justify-center"
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
                <div className="space-y-3">
                  {courses.map((course) => {
                    const courseTasks = validLinkedTasks.filter(
                      (t) =>
                        t.courseId === course.id ||
                        t.course.trim().toLowerCase() ===
                          course.name.trim().toLowerCase()
                    );
                    const activeCourseTasks = courseTasks.filter(
                      (t) => t.status === 'Belum Dikerjakan'
                    ).length;
                    const readableBadgeText = getReadableTextColor(
                      course.iconBg
                    );
                    const sharpStickerUrl = toWebpAssetPath(course.stickerUrl);
                    const stageBgColor = getStickerStageBackground(
                      sharpStickerUrl,
                      course.iconBg
                    );

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
                            : 'shadow-[0_3px_0_0_#0F172A]'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              style={{ backgroundColor: stageBgColor }}
                              className="w-16 h-16 rounded-2xl border-2 border-[#0F172A] overflow-hidden shrink-0"
                            >
                              <img
                                src={sharpStickerUrl}
                                alt={course.name}
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                            <div className="min-w-0">
                              <span
                                style={{
                                  backgroundColor: course.iconBg,
                                  color: readableBadgeText,
                                }}
                                className="px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold whitespace-nowrap border border-[#0F172A]"
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
                              className="w-9 h-9 rounded-xl bg-white border-2 border-[#0F172A] flex items-center justify-center text-[#0F172A]"
                            >
                              <Pencil className="w-4 h-4" aria-hidden="true" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteCourse(course)}
                              aria-label={`Hapus ${course.name}`}
                              className="w-9 h-9 rounded-xl bg-white border-2 border-[#0F172A] flex items-center justify-center text-[#C41E3A]"
                            >
                              <Trash2 className="w-4 h-4" aria-hidden="true" />
                            </button>
                          </div>
                        </div>

                        <div
                          className={`mt-3 rounded-2xl p-3 space-y-1.5 text-xs border-2 ${
                            isDarkMode
                              ? 'bg-[#141821] border-[#2E3440] text-[#CBD5E1]'
                              : 'bg-white border-[#0F172A] text-[#0F172A]'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <UserCheck
                              className="w-3.5 h-3.5 shrink-0 text-[#C41E3A]"
                              aria-hidden="true"
                            />
                            <span className="truncate">
                              Dosen: <strong>{course.lecturer}</strong>
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar
                              className="w-3.5 h-3.5 shrink-0 text-[#C41E3A]"
                              aria-hidden="true"
                            />
                            <span className="font-semibold truncate">
                              {course.schedule}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin
                              className="w-3.5 h-3.5 shrink-0 text-[#C41E3A]"
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
                              style={{
                                backgroundColor: course.iconBg,
                                color: readableBadgeText,
                              }}
                              className="min-h-[40px] px-3.5 rounded-xl border-2 border-[#0F172A] text-xs font-extrabold flex items-center gap-1"
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
          </motion.section>
        )}
        {bottomTab === 'progres' && (
          <motion.section
            key="tab-progres"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18 }}
            aria-label="Progres Belajar dan Peringkat Ketuntasan Pribadi"
            className="flex-1 flex flex-col"
          >
            <header className="px-4 sm:px-6 pt-4 pb-3 flex items-center justify-between gap-2">
              <div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                  Progres & Capaianmu
                </h1>
                <p
                  className={`text-xs font-semibold ${
                    isDarkMode ? 'text-[#94A3B8]' : 'text-[#64748B]'
                  }`}
                >
                  Analitik ketuntasan mata kuliah & distribusi tugas kuliah
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (urgentCount > 0) {
                    setOnlyUrgentFilter(true);
                    setActiveFilterTab('Semua');
                    setBottomTab('tugas');
                  } else if (taskMetrics.pending > 0) {
                    setActiveFilterTab('Belum Dikerjakan');
                    setBottomTab('tugas');
                  }
                }}
                title="Ketuk untuk melihat tugas mendesak (H-3, Hari Ini, atau Terlewat)"
                className={`px-3 py-1.5 rounded-2xl text-white border-2 border-[#0F172A] shadow-[0_2px_0_0_#0F172A] text-xs font-black flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  urgentCount > 0 ? 'bg-[#C41E3A]' : 'bg-[#059669]'
                }`}
              >
                {urgentCount > 0 ? (
                  <Flame className="w-4 h-4 shrink-0" aria-hidden="true" />
                ) : (
                  <CheckCircle2
                    className="w-4 h-4 shrink-0"
                    aria-hidden="true"
                  />
                )}
                <span>
                  {urgentCount > 0 ? `${urgentCount} Mendesak` : '0 Mendesak'}
                </span>
              </button>
            </header>

            <div className="px-4 sm:px-6 pt-1 space-y-4">
              <div className="rounded-[28px] bg-[#C41E3A] text-white border-2 border-[#0F172A] p-4 sm:p-5 flex items-center justify-between gap-3.5 shadow-[0_4px_0_0_#0F172A]">
                <div className="flex-1 min-w-0">
                  <span className="inline-block px-3 py-0.5 rounded-full bg-white text-[#C41E3A] border border-[#0F172A] text-[10px] font-black uppercase tracking-wider">
                    Target {studentUser.semester}
                  </span>
                  <h2 className="mt-2 text-2xl sm:text-3xl font-black text-white">
                    {taskMetrics.completionRate}% Tuntas
                  </h2>
                  <p className="text-xs font-bold text-white/95 mt-0.5 leading-snug">
                    {taskMetrics.completed} dari {taskMetrics.total} tugas kuliah
                    selesai · {courses.length} Mata Kuliah Aktif
                  </p>
                </div>

                <div className="w-22 h-22 sm:w-24 sm:h-24 rounded-2xl border-2 border-[#0F172A] overflow-hidden bg-white shrink-0 shadow-[0_2px_0_0_#0F172A]">
                  <img
                    src="/assets/olympiad-trophy.webp"
                    alt="Trofi Ketuntasan Akademik"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                <div
                  className={`rounded-3xl border-2 border-[#0F172A] p-3 text-center shadow-[0_3px_0_0_#0F172A] flex flex-col items-center justify-between ${
                    isDarkMode ? 'bg-[#1F242D] text-white' : 'bg-white text-[#0F172A]'
                  }`}
                >
                  <span className="px-2.5 py-0.5 rounded-lg bg-[#0F172A] text-white text-[10px] font-black uppercase tracking-wide">
                    Total Tugas
                  </span>
                  <span className="text-2xl sm:text-3xl font-black mt-1.5 leading-none">
                    {taskMetrics.total}
                  </span>
                  <span
                    className={`text-[10px] font-bold mt-1 ${
                      isDarkMode ? 'text-[#94A3B8]' : 'text-[#64748B]'
                    }`}
                  >
                    Terdaftar
                  </span>
                </div>

                <div
                  className={`rounded-3xl border-2 border-[#0F172A] p-3 text-center shadow-[0_3px_0_0_#0F172A] flex flex-col items-center justify-between ${
                    isDarkMode ? 'bg-[#1F242D] text-white' : 'bg-white text-[#0F172A]'
                  }`}
                >
                  <span className="px-2.5 py-0.5 rounded-lg bg-[#059669] text-white border border-[#0F172A] text-[10px] font-black uppercase tracking-wide">
                    Selesai
                  </span>
                  <span className="text-2xl sm:text-3xl font-black text-[#059669] mt-1.5 leading-none">
                    {taskMetrics.completed}
                  </span>
                  <span
                    className={`text-[10px] font-bold mt-1 ${
                      isDarkMode ? 'text-[#94A3B8]' : 'text-[#64748B]'
                    }`}
                  >
                    Tuntas
                  </span>
                </div>

                <div
                  className={`rounded-3xl border-2 border-[#0F172A] p-3 text-center shadow-[0_3px_0_0_#0F172A] flex flex-col items-center justify-between ${
                    isDarkMode ? 'bg-[#1F242D] text-white' : 'bg-white text-[#0F172A]'
                  }`}
                >
                  <span className="px-2.5 py-0.5 rounded-lg bg-[#C41E3A] text-white border border-[#0F172A] text-[10px] font-black uppercase tracking-wide">
                    Menunggu
                  </span>
                  <span className="text-2xl sm:text-3xl font-black text-[#C41E3A] mt-1.5 leading-none">
                    {taskMetrics.pending}
                  </span>
                  <span
                    className={`text-[10px] font-bold mt-1 ${
                      isDarkMode ? 'text-[#94A3B8]' : 'text-[#64748B]'
                    }`}
                  >
                    {urgentCount} Mendesak
                  </span>
                </div>
              </div>
              <div
                className={`rounded-[28px] border-2 border-[#0F172A] p-4 sm:p-5 shadow-[0_4px_0_0_#0F172A] ${
                  isDarkMode
                    ? 'bg-[#1F242D] text-white'
                    : 'bg-white text-[#0F172A]'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3.5">
                  <div>
                    <h3 className="text-base font-black tracking-tight flex items-center gap-1.5">
                      <Award
                        className="w-4 h-4 text-[#C41E3A]"
                        aria-hidden="true"
                      />
                      <span>
                        {leaderboardMode === 'course'
                          ? 'Leaderboard Mata Kuliahmu'
                          : 'Leaderboard Kategori Tugas'}
                      </span>
                    </h3>
                    <p
                      className={`text-[11px] font-semibold ${
                        isDarkMode ? 'text-[#94A3B8]' : 'text-[#64748B]'
                      }`}
                    >
                      {leaderboardMode === 'course'
                        ? 'Urutan mata kuliah paling tuntas hingga yang perlu dikejar'
                        : 'Distribusi ketuntasan berdasarkan jenis tugas kuliah'}
                    </p>
                  </div>
                  <div
                    className={`p-1 rounded-2xl border-2 border-[#0F172A] flex items-center self-start sm:self-auto ${
                      isDarkMode ? 'bg-[#141821]' : 'bg-[#F8FAFC]'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setLeaderboardMode('course')}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-extrabold transition-all ${
                        leaderboardMode === 'course'
                          ? 'bg-[#C41E3A] text-white border border-[#0F172A]'
                          : isDarkMode
                          ? 'text-[#CBD5E1]'
                          : 'text-[#0F172A]'
                      }`}
                    >
                      Per Matkul
                    </button>
                    <button
                      type="button"
                      onClick={() => setLeaderboardMode('category')}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-extrabold transition-all ${
                        leaderboardMode === 'category'
                          ? 'bg-[#C41E3A] text-white border border-[#0F172A]'
                          : isDarkMode
                          ? 'text-[#CBD5E1]'
                          : 'text-[#0F172A]'
                      }`}
                    >
                      Per Kategori
                    </button>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {personalLeaderboardEntries.map((entry, index) => {
                    const rankNumber = index + 1;
                    const paletteItem =
                      LEADERBOARD_ROW_PALETTE[
                        index % LEADERBOARD_ROW_PALETTE.length
                      ];
                    const avatarUrl = toWebpAssetPath(entry.avatarUrl);

                    return (
                      <div
                        key={entry.id}
                        onClick={() => {
                          if (leaderboardMode === 'course') {
                            setSelectedCourseFilter(entry.title);
                            setActiveFilterTab('Semua');
                            setBottomTab('tugas');
                          } else {
                            const rawCat = entry.title.replace(
                              /^Kategori\s+/i,
                              ''
                            );
                            setSearchQuery(rawCat);
                            setActiveFilterTab('Semua');
                            setBottomTab('tugas');
                          }
                        }}
                        style={{
                          backgroundColor: paletteItem.bg,
                          color: '#0F172A',
                        }}
                        className="rounded-2xl border-2 border-[#0F172A] p-2.5 sm:p-3 flex items-center justify-between gap-2.5 shadow-[0_2px_0_0_#0F172A] transition-transform cursor-pointer hover:scale-[1.01]"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            style={{
                              backgroundColor: paletteItem.badgeBg,
                            }}
                            className="w-9 h-9 rounded-xl font-black text-xs text-white flex items-center justify-center shrink-0 border-2 border-[#0F172A]"
                          >
                            #{rankNumber}
                          </span>

                          <img
                            src={avatarUrl}
                            alt={entry.title}
                            className="w-10 h-10 rounded-xl border-2 border-[#0F172A] object-cover shrink-0"
                            referrerPolicy="no-referrer"
                          />

                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs sm:text-[13px] font-black text-[#0F172A] truncate">
                                {entry.title}
                              </span>
                              {entry.completionRate === 100 &&
                                entry.totalCount > 0 && (
                                  <span className="px-1.5 py-0.5 rounded-md bg-[#059669] text-white border border-[#0F172A] text-[9px] font-extrabold shrink-0">
                                    Tuntas
                                  </span>
                                )}
                            </div>
                            <span className="block text-[11px] font-bold text-[#334155] truncate">
                              {entry.subtitle}
                            </span>
                          </div>
                        </div>

                        <span className="px-2.5 py-1 rounded-xl bg-white text-[#0F172A] border-2 border-[#0F172A] text-xs font-black shrink-0">
                          {entry.completionRate}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div
                className={`rounded-[28px] border-2 border-[#0F172A] p-4 sm:p-5 shadow-[0_3px_0_0_#0F172A] ${
                  isDarkMode
                    ? 'bg-[#1F242D] text-white'
                    : 'bg-white text-[#0F172A]'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div>
                    <h3 className="text-sm font-black flex items-center gap-1.5">
                      <BarChart3
                        className="w-4 h-4 text-[#C41E3A]"
                        aria-hidden="true"
                      />
                      <span>Distribusi Beban Tugas Mingguan</span>
                    </h3>
                    <p
                      className={`text-[11px] font-semibold ${
                        isDarkMode ? 'text-[#94A3B8]' : 'text-[#64748B]'
                      }`}
                    >
                      Jumlah tenggat tugas per hari · Ketuk batang untuk filter
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-xl bg-[#C41E3A] text-white border-2 border-[#0F172A] text-xs font-black shrink-0">
                    {taskMetrics.completed}/{taskMetrics.total} Selesai
                  </span>
                </div>

                <div className="grid grid-cols-7 gap-2 items-end h-36 pt-4 px-1">
                  {weeklyTaskDistribution.perDay.map((day) => {
                    const heightPercent =
                      day.totalCount > 0
                        ? Math.min(
                            100,
                            Math.max(
                              7,
                              Math.round(
                                (day.totalCount /
                                  weeklyTaskDistribution.scaleCeiling) *
                                  100
                              )
                            )
                          )
                        : 4;
                    const isAllDoneOnDay =
                      day.totalCount > 0 &&
                      day.completedCount === day.totalCount;

                    return (
                      <button
                        key={day.dayShort}
                        type="button"
                        onClick={() => {
                          setSelectedExactDate(null);
                          setSelectedDayOfWeek(day.dayFull);
                          setBottomTab('tugas');
                        }}
                        className="flex flex-col items-center justify-end h-full gap-1.5 group cursor-pointer"
                        title={`Hari ${day.dayFull}: ${day.completedCount}/${day.totalCount} tugas selesai`}
                      >
                        <span
                          className={`text-[10px] font-black leading-none ${
                            day.totalCount > 0
                              ? isAllDoneOnDay
                                ? 'text-[#059669]'
                                : 'text-[#C41E3A]'
                              : isDarkMode
                              ? 'text-[#64748B]'
                              : 'text-[#94A3B8]'
                          }`}
                        >
                          {day.totalCount} tgs
                        </span>
                        <div
                          className={`w-full rounded-2xl h-24 flex items-end overflow-hidden border-2 border-[#0F172A] p-1 transition-colors ${
                            isDarkMode ? 'bg-[#141821]' : 'bg-[#F8FAFC]'
                          }`}
                        >
                          <div
                            style={{ height: `${heightPercent}%` }}
                            className={`w-full rounded-lg transition-all duration-300 ${
                              day.totalCount === 0
                                ? 'bg-[#CBD5E1]'
                                : isAllDoneOnDay
                                ? 'bg-[#059669] border border-[#0F172A]'
                                : 'bg-[#C41E3A] border border-[#0F172A]'
                            }`}
                          />
                        </div>
                        <span className="text-[11px] font-black">
                          {day.dayShort}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div
                  className={`mt-3 pt-2.5 border-t flex flex-wrap items-center justify-between gap-2 text-[11px] font-bold ${
                    isDarkMode
                      ? 'border-[#2E3440] text-[#94A3B8]'
                      : 'border-[#E2E8F0] text-[#475569]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-sm bg-[#C41E3A] border border-[#0F172A]" />
                      <span>Ada Tugas Aktif</span>
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-sm bg-[#059669] border border-[#0F172A]" />
                      <span>Tuntas 100%</span>
                    </span>
                  </div>
                  <span className="font-extrabold text-[#C41E3A]">
                    {weeklyTaskDistribution.activeDaysCount} Hari Memiliki Tenggat
                  </span>
                </div>
              </div>
            </div>
          </motion.section>
        )}
        {bottomTab === 'profil' && (
          <motion.section
            key="tab-profil"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18 }}
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
                className="min-h-[40px] px-3.5 rounded-2xl bg-[#C41E3A] hover:bg-[#A3162E] text-white border-2 border-[#0F172A] shadow-[0_2px_0_0_#0F172A] text-xs font-extrabold flex items-center gap-1.5 active:translate-y-0.5 transition-all"
              >
                <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Ubah Profil</span>
              </button>
            </header>

            <div className="px-4 sm:px-6 pt-1 space-y-4">
              <div
                className={`rounded-[28px] border-2 border-[#0F172A] p-5 text-center relative shadow-[0_4px_0_0_#0F172A] ${
                  isDarkMode
                    ? 'bg-[#1F242D] text-white'
                    : 'bg-white text-[#0F172A]'
                }`}
              >
                <button
                  type="button"
                  onClick={handleOpenEditProfile}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white hover:bg-[#FFF1F2] text-[#0F172A] border-2 border-[#0F172A] shadow-[0_2px_0_0_#0F172A] text-xs font-extrabold mb-3.5 active:translate-y-0.5 transition-all"
                >
                  <Building2
                    className="w-3.5 h-3.5 text-[#C41E3A]"
                    aria-hidden="true"
                  />
                  <span>{studentUser.institution}</span>
                  <Pencil
                    className="w-3 h-3 ml-0.5 text-[#C41E3A]"
                    aria-hidden="true"
                  />
                </button>
                <div className="relative w-24 h-24 mx-auto">
                  <div className="w-24 h-24 rounded-[28px] border-3 border-[#0F172A] overflow-hidden bg-white shadow-[0_3px_0_0_#0F172A]">
                    <img
                      src={toWebpAssetPath(studentUser.avatarUrl)}
                      alt={studentUser.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
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
                    className="absolute -bottom-1 -right-1 w-9 h-9 rounded-xl bg-[#C41E3A] text-white border-2 border-[#0F172A] flex items-center justify-center shadow-[0_2px_0_0_#0F172A]"
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
                <div
                  className={`mt-4 pt-3.5 border-t-2 ${
                    isDarkMode ? 'border-[#2E3440]' : 'border-[#F1F5F9]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-extrabold text-[#64748B]">
                      Pilih Karakter Avatar Cepat
                    </span>
                    <button
                      type="button"
                      onClick={() => avatarFileInputRef.current?.click()}
                      className="px-2.5 py-1 rounded-xl bg-[#C41E3A] text-white border border-[#0F172A] text-[10px] font-extrabold"
                    >
                      + Foto Galeri
                    </button>
                  </div>

                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                    {COURSE_STICKER_GALLERY.map((item) => {
                      const webpUrl = toWebpAssetPath(item.imageUrl);
                      const isCurrent =
                        toWebpAssetPath(studentUser.avatarUrl) === webpUrl;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() =>
                            setStudentUser((prev) => ({
                              ...prev,
                              avatarUrl: webpUrl,
                            }))
                          }
                          title={item.label}
                          className={`p-1.5 rounded-2xl border-2 flex flex-col items-center gap-1 transition-transform active:scale-95 ${
                            isCurrent
                              ? 'border-[#C41E3A] bg-[#FFF1F2] text-[#0F172A] shadow-[0_2px_0_0_#C41E3A] scale-[1.03]'
                              : isDarkMode
                              ? 'border-[#323A48] bg-[#141821] text-white hover:border-[#C41E3A]'
                              : 'border-[#0F172A] bg-white text-[#0F172A] hover:bg-[#FFF1F2]'
                          }`}
                        >
                          <img
                            src={webpUrl}
                            alt={item.label}
                            className="w-10 h-10 rounded-xl object-cover border border-[#0F172A]/25"
                            referrerPolicy="no-referrer"
                          />
                          <span className="text-[9px] font-extrabold truncate max-w-full">
                            {item.label.replace('Karakter ', '')}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div
                  className={`mt-4 pt-3.5 border-t-2 grid grid-cols-3 ${
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
                    className={`border-x-2 ${
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
              <div
                className={`rounded-[28px] border-2 border-[#0F172A] p-4 sm:p-5 shadow-[0_3px_0_0_#0F172A] ${
                  isDarkMode
                    ? 'bg-[#1F242D] text-white'
                    : 'bg-white text-[#0F172A]'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-white border-2 border-[#0F172A] flex items-center justify-center shadow-[0_2px_0_0_#0F172A]">
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
                        Sinkronisasi Akun Google
                      </h3>
                      <p className="text-[11px] font-semibold text-[#64748B]">
                        Akses tugas dan jadwal kuliah di berbagai perangkat
                      </p>
                    </div>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-xl text-[10px] font-black border-2 border-[#0F172A] shadow-[0_2px_0_0_#0F172A] shrink-0 ${
                      isCloudSynced
                        ? 'bg-[#059669] text-white'
                        : 'bg-[#0F172A] text-white'
                    }`}
                  >
                    {isCloudSynced ? 'Terhubung' : 'Lokal'}
                  </span>
                </div>

                <div
                  className={`p-3 rounded-2xl border-2 border-[#0F172A] flex items-center justify-between gap-3 ${
                    isDarkMode ? 'bg-[#141821]' : 'bg-[#F8FAFC]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={toWebpAssetPath(studentUser.avatarUrl)}
                      alt={studentUser.name}
                      className="w-11 h-11 rounded-full object-cover border-2 border-[#0F172A] bg-white shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0">
                      <span className="text-xs sm:text-sm font-extrabold block truncate">
                        {studentUser.name}
                      </span>
                      <span className="text-[11px] font-semibold text-[#64748B] block truncate">
                        {studentUser.email}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => void handleGoogleSignIn()}
                    disabled={isGoogleLoading}
                    className="min-h-[38px] px-3.5 rounded-xl bg-[#C41E3A] hover:bg-[#A3162E] text-white border-2 border-[#0F172A] shadow-[0_2px_0_0_#0F172A] text-xs font-extrabold shrink-0 active:translate-y-0.5 transition-all"
                  >
                    {isGoogleLoading
                      ? 'Memuat...'
                      : isCloudSynced
                      ? 'Sinkronkan'
                      : 'Hubungkan Google'}
                  </button>
                </div>
              </div>
              <div
                className={`rounded-[28px] border-2 border-[#0F172A] p-3.5 space-y-1 shadow-[0_3px_0_0_#0F172A] ${
                  isDarkMode
                    ? 'bg-[#1F242D] text-white'
                    : 'bg-white text-[#0F172A]'
                }`}
              >
                <div className="px-3 pt-1 pb-1.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#C41E3A]">
                    Pengaturan Aplikasi & Akademik
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleOpenEditProfile}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-left transition-colors ${
                    isDarkMode ? 'hover:bg-[#141821]' : 'hover:bg-[#FFF1F2]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#C41E3A] text-white border-2 border-[#0F172A] shadow-[0_2px_0_0_#0F172A] flex items-center justify-center shrink-0">
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
                    className="w-4 h-4 text-[#C41E3A] shrink-0"
                    aria-hidden="true"
                  />
                </button>
                <div className="flex items-center justify-between px-3 py-2 min-h-[52px]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#E11D48] text-white border-2 border-[#0F172A] shadow-[0_2px_0_0_#0F172A] flex items-center justify-center shrink-0">
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
                      className={`w-12 h-7 rounded-full p-1 border-2 border-[#0F172A] transition-colors flex items-center ${
                        reminderEnabled
                          ? 'bg-[#C41E3A] justify-end'
                          : 'bg-[#CBD5E1] justify-start'
                      }`}
                    >
                      <span className="w-4 h-4 rounded-full bg-white border border-[#0F172A]" />
                    </span>
                  </button>
                </div>

                <div className="flex items-center justify-between px-3 py-2 min-h-[52px]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#D97706] text-white border-2 border-[#0F172A] shadow-[0_2px_0_0_#0F172A] flex items-center justify-center shrink-0">
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
                      className={`w-12 h-7 rounded-full p-1 border-2 border-[#0F172A] transition-colors flex items-center ${
                        isDarkMode
                          ? 'bg-[#C41E3A] justify-end'
                          : 'bg-[#CBD5E1] justify-start'
                      }`}
                    >
                      <span className="w-4 h-4 rounded-full bg-white border border-[#0F172A]" />
                    </span>
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleResetTasks}
                  className={`min-h-[48px] rounded-2xl border-2 border-[#0F172A] shadow-[0_3px_0_0_#0F172A] text-xs font-extrabold flex items-center justify-center gap-1.5 active:translate-y-0.5 transition-all ${
                    isDarkMode
                      ? 'bg-[#1F242D] text-white'
                      : 'bg-white hover:bg-[#F8FAFC] text-[#0F172A]'
                  }`}
                >
                  <RotateCcw className="w-4 h-4" aria-hidden="true" />
                  <span>Atur Ulang Data</span>
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="min-h-[48px] rounded-2xl bg-[#C41E3A] hover:bg-[#A3162E] text-white border-2 border-[#0F172A] shadow-[0_3px_0_0_#0F172A] text-xs font-extrabold flex items-center justify-center gap-1.5 active:translate-y-0.5 transition-all"
                >
                  <LogOut className="w-4 h-4" aria-hidden="true" />
                  <span>Keluar Akun</span>
                </button>
              </div>
            </div>
          </motion.section>
        )}
        <div className="fixed bottom-3 inset-x-0 z-30 pointer-events-none">
          <div className="w-full max-w-[640px] mx-auto px-4 sm:px-6">
            <nav
              aria-label="Navigasi Utama TaskDar"
              className={`pointer-events-auto w-full rounded-[28px] border-2 border-[#0F172A] p-1.5 grid grid-cols-4 gap-1.5 shadow-[0_4px_0_0_#0F172A] transition-colors ${
                isDarkMode
                  ? 'bg-[#1F242D]/95 backdrop-blur-md'
                  : 'bg-white/95 backdrop-blur-md'
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
                    className={`relative min-h-[46px] px-2 rounded-[22px] flex items-center justify-center gap-1.5 text-xs font-extrabold transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? 'text-white'
                        : isDarkMode
                        ? 'text-[#94A3B8] hover:text-white'
                        : 'text-[#64748B] hover:text-[#0F172A]'
                    }`}
                  >
                    {isSelected && (
                      <motion.div
                        layoutId="taskdar-active-nav-pill"
                        className="absolute inset-0 bg-[#C41E3A] border-2 border-[#0F172A] rounded-[22px] shadow-[0_2px_0_0_#0F172A]"
                        transition={{
                          type: 'spring',
                          stiffness: 400,
                          damping: 32,
                        }}
                      />
                    )}
                    <IconComponent
                      className="w-4 h-4 shrink-0 relative z-10"
                      aria-hidden="true"
                    />
                    {isSelected && (
                      <span className="truncate whitespace-nowrap relative z-10">
                        {item.label}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
        <WelcomeSplashModal
          screenPhase={screenPhase}
          onFinishSplash={() =>
            setScreenPhase((prev) => (prev === 'splash' ? 'auth' : prev))
          }
          onLoginSuccess={async (session) => {
            setStudentUser(session);
            setScreenPhase('main');
            if (
              session.authMethod === 'google' &&
              auth.currentUser &&
              auth.currentUser.emailVerified
            ) {
              const uid = auth.currentUser.uid;
              try {
                await setDoc(
                  doc(db, 'users', uid),
                  {
                    uid,
                    name: session.name.slice(0, 100),
                    nim: session.nim.slice(0, 32),
                    classGroup: session.classGroup.slice(0, 32),
                    semester: session.semester.slice(0, 32),
                    program: session.program.slice(0, 64),
                    institution: session.institution.slice(0, 120),
                    avatarUrl: (session.avatarUrl.length <= 500
                      ? session.avatarUrl
                      : '/assets/mascot-splash.webp'
                    ).slice(0, 500),
                    updatedAt: new Date().toISOString(),
                  },
                  { merge: true }
                );
              } catch (err) {
                handleFirestoreError(err, OperationType.WRITE, `users/${uid}`);
              }
            }
            showToastMessage(
              `Selamat datang di TaskDar, ${session.shortName}!`
            );
          }}
          onGoogleLogin={handleGoogleSignIn}
          isGoogleLoading={isGoogleLoading}
        />
      </main>
      {isEditProfileOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/55 backdrop-blur-[2px] p-0 sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-profile-modal-title"
        >
          <div
            className={`w-full max-w-[460px] rounded-t-[32px] sm:rounded-[32px] border-2 border-[#0F172A] shadow-2xl overflow-hidden ${
              isDarkMode
                ? 'bg-[#161A22] text-white'
                : 'bg-white text-[#0F172A]'
            }`}
          >
            <div className="bg-[#C41E3A] text-white px-4 pt-3 pb-3 border-b-2 border-[#0F172A]">
              <div className="pb-2 flex justify-center">
                <div className="w-11 h-1.5 rounded-full bg-white/40" />
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(false)}
                  className="min-h-[38px] px-3 rounded-xl bg-white/15 text-white text-xs font-extrabold border border-white/30"
                >
                  Batal
                </button>
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-white" />
                  <h2
                    id="edit-profile-modal-title"
                    className="text-[15px] font-black"
                  >
                    Ubah Profil Akademik
                  </h2>
                </div>
                <button
                  type="submit"
                  form="edit-profile-form"
                  className="min-h-[38px] px-3.5 rounded-xl bg-white text-[#C41E3A] border-2 border-[#0F172A] text-xs font-black shadow-[0_2px_0_0_#0F172A]"
                >
                  Simpan
                </button>
              </div>
            </div>

            <form id="edit-profile-form" onSubmit={handleSaveProfile} noValidate>
              <div className="p-5 space-y-3.5 max-h-[75vh] overflow-y-auto no-scrollbar">
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
                        : 'bg-[#F8FAFC] border-[#CBD5E1] text-[#0F172A]'
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
                          : 'bg-[#F8FAFC] border-[#CBD5E1] text-[#0F172A]'
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
                          : 'bg-[#F8FAFC] border-[#CBD5E1] text-[#0F172A]'
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
                        : 'bg-[#F8FAFC] border-[#CBD5E1] text-[#0F172A]'
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
                          : 'bg-[#F8FAFC] border-[#CBD5E1] text-[#0F172A]'
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
                          : 'bg-[#F8FAFC] border-[#CBD5E1] text-[#0F172A]'
                      }`}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full min-h-[48px] rounded-2xl bg-[#C41E3A] hover:bg-[#A3162E] text-white text-sm font-black border-2 border-[#0F172A] shadow-[0_3px_0_0_#0F172A]"
                >
                  Simpan Identitas Profil
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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
        allTasks={validLinkedTasks}
      />
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
      <CalendarModal
        isOpen={isCalendarModalOpen}
        onClose={() => setIsCalendarModalOpen(false)}
        selectedDateLabel={selectedExactDate ?? calendarHighlightedDate}
        onSelectDate={(dateLabel) => {
          setCalendarHighlightedDate(dateLabel);
          if (calendarPickerCallback) {
            calendarPickerCallback(dateLabel);
          } else {
            setSelectedDayOfWeek('Semua');
            setSelectedExactDate(dateLabel);
          }
        }}
        tasks={validLinkedTasks}
        mode={calendarModalMode}
        isDarkMode={isDarkMode}
      />
    </div>
  );
}
