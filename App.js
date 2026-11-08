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
  Modal,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Switch,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

const STUDENT_METADATA = {
  name: 'Badar Rahman',
  nim: '14524303',
  classGroup: 'Kelas TI-1',
  semester: 'Semester 5',
  program: 'Teknik Informatika',
  institution: 'STIKOM Poltek Cirebon',
  streakDays: 6,
};

const COURSE_DIRECTORY = [
  {
    id: 'course-ti361',
    code: 'TI361',
    name: 'Pemrograman Visual I',
    lecturer: 'Kusnadi, M.Kom.',
    schedule: 'Senin, 08:00 - 10:30 WIB',
    room: 'Lab Mobile 1',
    credits: 3,
    icon: 'code',
    pastelBg: '#E6F4F1',
    accentColor: '#1E7A68',
    iconBg: '#2A9D8F',
  },
  {
    id: 'course-ti362',
    code: 'TI362',
    name: 'Robotika',
    lecturer: 'Bambang Sugiarto, M.T.',
    schedule: 'Selasa, 10:30 - 13:00 WIB',
    room: 'Lab IoT & Robotika',
    credits: 3,
    icon: 'cpu',
    pastelBg: '#EAF2FF',
    accentColor: '#2563EB',
    iconBg: '#3B82F6',
  },
  {
    id: 'course-ti363',
    code: 'TI363',
    name: 'Data Warehouse & Data Mining',
    lecturer: 'Dr. Rina Kurniawati, M.Kom.',
    schedule: 'Rabu, 08:00 - 10:30 WIB',
    room: 'Ruang 304',
    credits: 3,
    icon: 'database',
    pastelBg: '#F3EEFF',
    accentColor: '#6D28D9',
    iconBg: '#7C3AED',
  },
  {
    id: 'course-ti364',
    code: 'TI364',
    name: 'Keamanan Informasi & Jaringan',
    lecturer: 'Hendra Wijaya, S.Kom., M.T.',
    schedule: 'Kamis, 13:00 - 15:30 WIB',
    room: 'Lab Jaringan',
    credits: 3,
    icon: 'shield',
    pastelBg: '#FFF3E0',
    accentColor: '#C25E00',
    iconBg: '#EA8C28',
  },
  {
    id: 'course-ti365',
    code: 'TI365',
    name: 'Pemodelan Berorientasi Objek',
    lecturer: 'Dedi Pratama, M.Kom.',
    schedule: 'Jumat, 08:00 - 10:30 WIB',
    room: 'Lab Pemrograman 2',
    credits: 3,
    icon: 'layers',
    pastelBg: '#FFEAE6',
    accentColor: '#C84332',
    iconBg: '#EC6B56',
  },
];

const INITIAL_TASKS = [
  {
    id: 'task-ti361-01',
    title: 'Tugas Pertemuan 5 - Implementasi React Native Hooks',
    course: 'Pemrograman Visual I',
    description:
      'Membangun aplikasi to-do dengan Props, useState, useEffect, useMemo, useCallback, useRef, dan useReducer.',
    deadline: '09 Nov 2026',
    status: 'Belum Dikerjakan',
  },
  {
    id: 'task-rob-02',
    title: 'Latihan 4 - Kinematika Ruang dan Transformasi Koordinat',
    course: 'Robotika',
    description:
      'Konversi koordinat bola ke kartesian dan matriks rotasi end-effector robot manipulator.',
    deadline: '04 Nov 2026',
    status: 'Selesai',
  },
  {
    id: 'task-dwdm-03',
    title: 'Analisis 3V Big Data Tokopedia dan Shopee',
    course: 'Data Warehouse & Data Mining',
    description:
      'Arsitektur data lake, streaming kafka, dan pemisahan sistem OLTP vs OLAP.',
    deadline: '07 Nov 2026',
    status: 'Selesai',
  },
  {
    id: 'task-kij-04',
    title: 'Praktikum Modul 1.4.1 - Uji Port Nmap Kali Linux',
    course: 'Keamanan Informasi & Jaringan',
    description:
      'Pengujian network scanner Nmap 7.99 pada subsistem WSL Kali Linux.',
    deadline: '05 Nov 2026',
    status: 'Selesai',
  },
  {
    id: 'task-pbo-05',
    title: 'Analisis OOM Perancangan Sistem Pasar Cirebon',
    course: 'Pemodelan Berorientasi Objek',
    description:
      'Pemodelan class diagram dan use case spesifikasi harga pangan Cirebon.',
    deadline: '14 Nov 2026',
    status: 'Belum Dikerjakan',
  },
];

const ACHIEVEMENT_BADGES = [
  {
    id: 'badge-ontime',
    title: 'Tepat Waktu',
    subtitle: 'Menyelesaikan tugas sebelum tenggat',
    icon: 'clock',
    tintBg: '#E6F4F1',
    tintColor: '#1E7A68',
  },
  {
    id: 'badge-consistent',
    title: 'Konsisten',
    subtitle: 'Aktif belajar 6 hari berturut-turut',
    icon: 'zap',
    tintBg: '#FFEAE6',
    tintColor: '#EC6B56',
  },
  {
    id: 'badge-lab',
    title: 'Modul Praktikum',
    subtitle: 'Menuntaskan latihan lab & jaringan',
    icon: 'terminal',
    tintBg: '#EAF2FF',
    tintColor: '#2563EB',
  },
  {
    id: 'badge-semester',
    title: 'Tuntas Semester',
    subtitle: 'Selesaikan seluruh tugas aktif',
    icon: 'award',
    tintBg: '#FFF3E0',
    tintColor: '#C25E00',
  },
];

/*
 * Central state reducer handling ADD_TASK, DELETE_TASK, TOGGLE_STATUS,
 * and RESET_TASKS with immutable array transitions.
 */
function taskReducer(state, action) {
  switch (action.type) {
    case 'ADD_TASK': {
      const newTask = {
        id: 'task-' + Date.now().toString(),
        title: action.payload.title.trim(),
        course: action.payload.course.trim(),
        description: action.payload.description.trim(),
        deadline: action.payload.deadline.trim(),
        status: 'Belum Dikerjakan',
      };
      return [newTask, ...state];
    }
    case 'DELETE_TASK':
      return state.filter((item) => item.id !== action.payload);
    case 'TOGGLE_STATUS':
      return state.map((item) =>
        item.id === action.payload
          ? {
              ...item,
              status: item.status === 'Selesai' ? 'Belum Dikerjakan' : 'Selesai',
            }
          : item
      );
    case 'RESET_TASKS':
      return INITIAL_TASKS.map((item) => ({ ...item }));
    default:
      return state;
  }
}

function getCourseStyle(courseName) {
  const found = COURSE_DIRECTORY.find(
    (c) => c.name.toLowerCase() === courseName.toLowerCase()
  );
  if (found) return found;
  return {
    icon: 'book-open',
    iconBg: '#EC6B56',
    pastelBg: '#FFEAE6',
    accentColor: '#C84332',
  };
}

/*
 * Pure child component receiving task data and callbacks via Props.
 */
const TaskCard = React.memo(({ task, onToggleStatus, onDeleteTask }) => {
  const isCompleted = task.status === 'Selesai';
  const courseTheme = getCourseStyle(task.course);

  return (
    <View style={[styles.card, isCompleted && styles.cardCompleted]}>
      <View style={styles.cardRow}>
        <View
          style={[
            styles.iconBox,
            { backgroundColor: courseTheme.iconBg },
            isCompleted && styles.iconBoxCompleted,
          ]}
        >
          <Feather name={courseTheme.icon} size={18} color="#FFFFFF" />
        </View>

        <TouchableOpacity
          style={styles.cardBody}
          activeOpacity={0.75}
          onPress={() => onToggleStatus(task.id)}
          accessibilityRole="button"
        >
          <View style={styles.metaRow}>
            <Text style={styles.courseText} numberOfLines={1}>
              {task.course}
            </Text>
            <Text style={styles.metaDot}>·</Text>
            <Text
              style={[
                styles.statusText,
                isCompleted ? styles.statusDone : styles.statusPending,
              ]}
            >
              {task.status}
            </Text>
          </View>

          <Text style={[styles.titleText, isCompleted && styles.titleCompleted]}>
            {task.title}
          </Text>

          <Text
            style={[
              styles.descriptionText,
              isCompleted && styles.descriptionCompleted,
            ]}
          >
            {task.description}
          </Text>

          <View style={styles.deadlineRow}>
            <Feather name="calendar" size={13} color="#6E6658" />
            <Text style={styles.deadlineText}>Tenggat: {task.deadline}</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.actionsColumn}>
          <TouchableOpacity
            style={styles.touchTarget}
            onPress={() => onToggleStatus(task.id)}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: isCompleted }}
          >
            <View
              style={[
                styles.checkCircle,
                isCompleted && styles.checkCircleCompleted,
              ]}
            >
              {isCompleted && <Feather name="check" size={14} color="#FFFFFF" />}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.touchTarget}
            onPress={() => onDeleteTask(task.id)}
            accessibilityRole="button"
          >
            <Feather name="trash-2" size={16} color="#8C8476" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
});

export default function App() {
  const [tasks, dispatch] = useReducer(taskReducer, INITIAL_TASKS);

  const [bottomTab, setBottomTab] = useState('tugas');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilterTab, setActiveFilterTab] = useState('Semua');
  const [selectedCourseFilter, setSelectedCourseFilter] = useState('Semua');
  const [isModalVisible, setIsModalVisible] = useState(false);

  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);

  const [title, setTitle] = useState('');
  const [course, setCourse] = useState(COURSE_DIRECTORY[0].name);
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('20 Nov 2026');
  const [formError, setFormError] = useState('');

  const titleInputRef = useRef(null);

  useEffect(() => {
    console.log(
      '[Search Debug] Kata kunci pencarian aktif:',
      searchQuery.trim() === '' ? '(kosong)' : searchQuery
    );
  }, [searchQuery]);

  const taskMetrics = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((item) => item.status === 'Selesai').length;
    const pending = total - completed;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, pending, completed, completionRate };
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase();
    return tasks.filter((item) => {
      const matchesStatus =
        activeFilterTab === 'Semua' ? true : item.status === activeFilterTab;
      const matchesCourse =
        selectedCourseFilter === 'Semua'
          ? true
          : item.course === selectedCourseFilter;
      const matchesSearch =
        keyword === '' ||
        item.title.toLowerCase().includes(keyword) ||
        item.course.toLowerCase().includes(keyword);
      return matchesStatus && matchesCourse && matchesSearch;
    });
  }, [tasks, activeFilterTab, selectedCourseFilter, searchQuery]);

  const handleToggleStatus = useCallback((taskId) => {
    dispatch({ type: 'TOGGLE_STATUS', payload: taskId });
  }, []);

  const handleDeleteTask = useCallback((taskId) => {
    dispatch({ type: 'DELETE_TASK', payload: taskId });
  }, []);

  const handleResetTasks = useCallback(() => {
    dispatch({ type: 'RESET_TASKS' });
    setSearchQuery('');
    setActiveFilterTab('Semua');
    setSelectedCourseFilter('Semua');
  }, []);

  const handleOpenAddModal = useCallback((defaultCourse) => {
    if (typeof defaultCourse === 'string') {
      setCourse(defaultCourse);
    }
    setFormError('');
    setIsModalVisible(true);
    setTimeout(() => {
      if (titleInputRef.current) {
        titleInputRef.current.focus();
      }
    }, 100);
  }, []);

  const handleAddTask = useCallback(() => {
    if (!title.trim() || !course.trim() || !description.trim() || !deadline.trim()) {
      setFormError('Semua kolom wajib diisi sebelum menyimpan tugas.');
      if (titleInputRef.current) {
        titleInputRef.current.focus();
      }
      return;
    }

    dispatch({
      type: 'ADD_TASK',
      payload: { title, course, description, deadline },
    });

    setTitle('');
    setDescription('');
    setFormError('');
    if (titleInputRef.current) {
      titleInputRef.current.focus();
    }
    setIsModalVisible(false);
  }, [title, course, description, deadline]);

  const renderTaskItem = useCallback(
    ({ item }) => (
      <TaskCard
        task={item}
        onToggleStatus={handleToggleStatus}
        onDeleteTask={handleDeleteTask}
      />
    ),
    [handleToggleStatus, handleDeleteTask]
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FDFBF7" />

      <View style={styles.container}>
        {bottomTab === 'tugas' && (
          <View style={styles.screenBody}>
            <View style={styles.greetingHeader}>
              <View style={styles.avatarRow}>
                <View style={styles.avatarCircle}>
                  <Feather name="user" size={20} color="#FFFFFF" />
                </View>
                <View>
                  <Text style={styles.greetingTitle}>
                    Halo, {STUDENT_METADATA.name}
                  </Text>
                  <Text style={styles.greetingSubtitle}>
                    Apa target kuliahmu hari ini?
                  </Text>
                </View>
              </View>

              <View style={styles.streakBadge}>
                <Feather name="zap" size={14} color="#EC6B56" />
                <Text style={styles.streakText}>
                  {STUDENT_METADATA.streakDays} Hari Aktif
                </Text>
              </View>
            </View>

            <View style={styles.progressSummaryCard}>
              <View style={styles.progressRingBox}>
                <Text style={styles.progressRingPercent}>
                  {taskMetrics.completionRate}%
                </Text>
              </View>
              <View style={styles.progressSummaryTextCol}>
                <Text style={styles.progressSummaryTitle}>
                  Progres Tugas Semester 5
                </Text>
                <Text style={styles.progressSummarySub}>
                  {taskMetrics.completed} selesai · {taskMetrics.pending} belum dikerjakan
                </Text>
              </View>
            </View>

            <View style={styles.searchWrapper}>
              <Feather name="search" size={16} color="#6E6658" />
              <TextInput
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Cari judul tugas atau mata kuliah..."
                placeholderTextColor="#8C8476"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  style={styles.clearSearchButton}
                  onPress={() => setSearchQuery('')}
                >
                  <Feather name="x" size={16} color="#5C5549" />
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.tabsRow}>
              {['Semua', 'Belum Dikerjakan', 'Selesai'].map((tab) => {
                const isActive = activeFilterTab === tab;
                return (
                  <TouchableOpacity
                    key={tab}
                    style={[styles.tabButton, isActive && styles.tabButtonActive]}
                    onPress={() => setActiveFilterTab(tab)}
                  >
                    <Text
                      style={[styles.tabLabel, isActive && styles.tabLabelActive]}
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
              renderItem={renderTaskItem}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Feather name="inbox" size={28} color="#8C8476" />
                  <Text style={styles.emptyTitle}>Tidak ada tugas ditemukan</Text>
                  <Text style={styles.emptySubtitle}>
                    Ubah filter pencarian atau tambah tugas kuliah baru.
                  </Text>
                </View>
              }
            />

            <TouchableOpacity
              style={styles.fab}
              onPress={() => handleOpenAddModal(COURSE_DIRECTORY[0].name)}
              accessibilityRole="button"
              accessibilityLabel="Tambah tugas baru"
            >
              <Feather name="plus" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        )}

        {bottomTab === 'matakuliah' && (
          <ScrollView
            style={styles.screenBody}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.screenHeading}>Mata Kuliah Semester 5</Text>
            <Text style={styles.screenSubheading}>
              Daftar 5 mata kuliah aktif Kelas TI-1 beserta jadwal dan jumlah tugas
            </Text>

            {COURSE_DIRECTORY.map((item) => {
              const activeCount = tasks.filter(
                (t) =>
                  t.course === item.name && t.status === 'Belum Dikerjakan'
              ).length;
              const totalCourseTasks = tasks.filter(
                (t) => t.course === item.name
              ).length;

              return (
                <View
                  key={item.id}
                  style={[
                    styles.courseCard,
                    { backgroundColor: item.pastelBg },
                  ]}
                >
                  <View style={styles.courseHeaderRow}>
                    <View
                      style={[
                        styles.courseIconBadge,
                        { backgroundColor: item.iconBg },
                      ]}
                    >
                      <Feather name={item.icon} size={20} color="#FFFFFF" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.courseCodeText}>
                        {item.code} · {item.credits} SKS · {item.room}
                      </Text>
                      <Text style={styles.courseTitleText}>{item.name}</Text>
                    </View>
                  </View>

                  <View style={styles.courseInfoBox}>
                    <Text style={styles.courseDetailLine}>
                      Dosen: {item.lecturer}
                    </Text>
                    <Text style={styles.courseDetailLine}>
                      Jadwal: {item.schedule}
                    </Text>
                  </View>

                  <View style={styles.courseFooterRow}>
                    <Text
                      style={[
                        styles.courseTaskCount,
                        { color: item.accentColor },
                      ]}
                    >
                      {activeCount} tugas aktif dari {totalCourseTasks} tugas
                    </Text>

                    <TouchableOpacity
                      style={styles.courseActionButton}
                      onPress={() => {
                        setSelectedCourseFilter(item.name);
                        setBottomTab('tugas');
                      }}
                    >
                      <Text style={styles.courseActionText}>Lihat Tugas</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        )}

        {bottomTab === 'progres' && (
          <ScrollView
            style={styles.screenBody}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.streakHeroCard}>
              <View style={styles.streakHeroIcon}>
                <Feather name="zap" size={24} color="#EC6B56" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.streakHeroTitle}>
                  {STUDENT_METADATA.streakDays} Hari Aktif Berturut-turut!
                </Text>
                <Text style={styles.streakHeroSubtitle}>
                  Pertahankan konsistensi pengerjaan tugas kuliahmu.
                </Text>
              </View>
            </View>

            <View style={styles.analyticsCard}>
              <Text style={styles.sectionTitle}>Tingkat Penyelesaian</Text>
              <View style={styles.gaugeBarTrack}>
                <View
                  style={[
                    styles.gaugeBarFill,
                    { width: taskMetrics.completionRate + '%' },
                  ]}
                />
              </View>

              <View style={styles.metricsThreeCol}>
                <View style={styles.metricItem}>
                  <Text style={styles.metricNumber}>{taskMetrics.total}</Text>
                  <Text style={styles.metricCaption}>Total Tugas</Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={[styles.metricNumber, { color: '#1E7A68' }]}>
                    {taskMetrics.completed}
                  </Text>
                  <Text style={styles.metricCaption}>Tugas Selesai</Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={[styles.metricNumber, { color: '#C25E00' }]}>
                    {taskMetrics.pending}
                  </Text>
                  <Text style={styles.metricCaption}>Tugas Tertunda</Text>
                </View>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Pencapaian Akademik</Text>
            <View style={styles.badgesGrid}>
              {ACHIEVEMENT_BADGES.map((badge) => (
                <View key={badge.id} style={styles.badgeCard}>
                  <View
                    style={[
                      styles.badgeIconCircle,
                      { backgroundColor: badge.tintBg },
                    ]}
                  >
                    <Feather
                      name={badge.icon}
                      size={20}
                      color={badge.tintColor}
                    />
                  </View>
                  <Text style={styles.badgeTitle}>{badge.title}</Text>
                  <Text style={styles.badgeSubtitle}>{badge.subtitle}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        )}

        {bottomTab === 'profil' && (
          <ScrollView
            style={styles.screenBody}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.profileCard}>
              <View style={styles.profileAvatarLarge}>
                <Feather name="user" size={32} color="#FFFFFF" />
              </View>
              <Text style={styles.profileName}>{STUDENT_METADATA.name}</Text>
              <Text style={styles.profileNim}>
                NIM {STUDENT_METADATA.nim} · {STUDENT_METADATA.classGroup}
              </Text>
              <Text style={styles.profileInstitution}>
                {STUDENT_METADATA.semester} · {STUDENT_METADATA.institution}
              </Text>
            </View>

            <View style={styles.settingsCard}>
              <View style={styles.settingRow}>
                <View style={styles.settingLabelRow}>
                  <Feather name="bell" size={18} color="#1E1B18" />
                  <Text style={styles.settingLabel}>Pengingat Tugas</Text>
                </View>
                <Switch
                  value={reminderEnabled}
                  onValueChange={setReminderEnabled}
                />
              </View>

              <View style={styles.settingRow}>
                <View style={styles.settingLabelRow}>
                  <Feather name="moon" size={18} color="#1E1B18" />
                  <Text style={styles.settingLabel}>Mode Tampilan</Text>
                </View>
                <Switch
                  value={darkModeEnabled}
                  onValueChange={setDarkModeEnabled}
                />
              </View>

              <TouchableOpacity
                style={styles.resetDataButton}
                onPress={handleResetTasks}
              >
                <Feather name="rotate-ccw" size={16} color="#FFFFFF" />
                <Text style={styles.resetDataButtonText}>Atur Ulang Data</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}

        <View style={styles.bottomNav}>
          {[
            { key: 'tugas', label: 'Tugas', icon: 'check-square' },
            { key: 'matakuliah', label: 'Mata Kuliah', icon: 'book-open' },
            { key: 'progres', label: 'Progres', icon: 'pie-chart' },
            { key: 'profil', label: 'Profil', icon: 'user' },
          ].map((nav) => {
            const isSelected = bottomTab === nav.key;
            return (
              <TouchableOpacity
                key={nav.key}
                style={[
                  styles.bottomNavItem,
                  isSelected && styles.bottomNavItemActive,
                ]}
                onPress={() => setBottomTab(nav.key)}
                accessibilityRole="tab"
                accessibilityState={{ selected: isSelected }}
              >
                <Feather
                  name={nav.icon}
                  size={18}
                  color={isSelected ? '#FFFFFF' : '#6E6658'}
                />
                {isSelected && (
                  <Text style={styles.bottomNavLabelActive}>{nav.label}</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <Modal
          visible={isModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setIsModalVisible(false)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalBackdrop}
          >
            <View style={styles.modalSheet}>
              <View style={styles.grabHandle} />

              <View style={styles.modalHeader}>
                <TouchableOpacity
                  style={styles.modalHeaderAction}
                  onPress={() => setIsModalVisible(false)}
                >
                  <Text style={styles.cancelText}>Batal</Text>
                </TouchableOpacity>

                <Text style={styles.modalTitle}>Tambah Tugas</Text>

                <TouchableOpacity
                  style={styles.modalHeaderAction}
                  onPress={handleAddTask}
                >
                  <Text style={styles.saveText}>Simpan</Text>
                </TouchableOpacity>
              </View>

              <ScrollView contentContainerStyle={styles.modalBody}>
                {formError !== '' && (
                  <View style={styles.errorBanner}>
                    <Feather name="alert-circle" size={15} color="#991B1B" />
                    <Text style={styles.errorText}>{formError}</Text>
                  </View>
                )}

                <Text style={styles.fieldLabel}>Judul Tugas</Text>
                <TextInput
                  ref={titleInputRef}
                  style={styles.textInput}
                  value={title}
                  onChangeText={setTitle}
                  placeholder="Contoh: Tugas Pertemuan 6"
                  placeholderTextColor="#8C8476"
                />

                <Text style={styles.fieldLabel}>Mata Kuliah</Text>
                <View style={styles.courseChipsWrap}>
                  {COURSE_DIRECTORY.map((c) => (
                    <TouchableOpacity
                      key={c.id}
                      style={[
                        styles.courseOptionButton,
                        course === c.name && styles.courseOptionActive,
                      ]}
                      onPress={() => setCourse(c.name)}
                    >
                      <Text
                        style={[
                          styles.courseOptionText,
                          course === c.name && styles.courseOptionTextActive,
                        ]}
                      >
                        {c.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.fieldLabel}>Deskripsi Tugas</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Rincian instruksi pengerjaan tugas..."
                  placeholderTextColor="#8C8476"
                  multiline
                />

                <Text style={styles.fieldLabel}>Tenggat Waktu</Text>
                <TextInput
                  style={styles.textInput}
                  value={deadline}
                  onChangeText={setDeadline}
                  placeholder="Contoh: 20 Nov 2026"
                  placeholderTextColor="#8C8476"
                />
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FDFBF7' },
  container: { flex: 1 },
  screenBody: { flex: 1, paddingHorizontal: 18, paddingTop: 12 },
  scrollContent: { paddingBottom: 110 },
  greetingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EC6B56',
    alignItems: 'center',
    justifyContent: 'center',
  },
  greetingTitle: { fontSize: 16, fontWeight: '700', color: '#1E1B18' },
  greetingSubtitle: { fontSize: 12, color: '#6E6658', marginTop: 2 },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFEAE6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  streakText: { fontSize: 12, fontWeight: '700', color: '#C84332' },
  progressSummaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#EFE8DC',
    padding: 14,
    marginBottom: 12,
    gap: 14,
  },
  progressRingBox: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 4,
    borderColor: '#EC6B56',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressRingPercent: { fontSize: 13, fontWeight: '700', color: '#1E1B18' },
  progressSummaryTextCol: { flex: 1 },
  progressSummaryTitle: { fontSize: 14, fontWeight: '700', color: '#1E1B18' },
  progressSummarySub: { fontSize: 12, color: '#6E6658', marginTop: 2 },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4EFE6',
    borderRadius: 18,
    paddingHorizontal: 14,
    minHeight: 44,
    marginBottom: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1E1B18',
    marginLeft: 8,
    paddingVertical: 8,
  },
  clearSearchButton: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabsRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#EFE8DC',
    marginBottom: 12,
  },
  tabButton: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabButtonActive: { borderBottomColor: '#EC6B56' },
  tabLabel: { fontSize: 13, fontWeight: '600', color: '#8C8476' },
  tabLabelActive: { color: '#1E1B18', fontWeight: '700' },
  listContent: { paddingBottom: 120 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#EFE8DC',
    padding: 14,
    marginBottom: 10,
  },
  cardCompleted: { backgroundColor: '#F4EFE6' },
  cardRow: { flexDirection: 'row', alignItems: 'flex-start' },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconBoxCompleted: { opacity: 0.55 },
  cardBody: { flex: 1 },
  metaRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  courseText: { fontSize: 12, fontWeight: '600', color: '#5C5549' },
  metaDot: { marginHorizontal: 6, color: '#A39B8B' },
  statusText: { fontSize: 12, fontWeight: '700' },
  statusPending: { color: '#C25E00' },
  statusDone: { color: '#1E7A68' },
  titleText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E1B18',
    marginTop: 4,
  },
  titleCompleted: { textDecorationLine: 'line-through', color: '#8C8476' },
  descriptionText: {
    fontSize: 12,
    color: '#5C5549',
    marginTop: 5,
    lineHeight: 18,
  },
  descriptionCompleted: { color: '#968E80' },
  deadlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  deadlineText: { fontSize: 12, color: '#6E6658' },
  actionsColumn: { flexDirection: 'row', alignItems: 'center', marginLeft: 4 },
  touchTarget: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#B5AC9C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircleCompleted: {
    backgroundColor: '#2A9D8F',
    borderColor: '#2A9D8F',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 44,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E1B18',
    marginTop: 10,
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#6E6658',
    marginTop: 4,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 90,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#EC6B56',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
  },
  screenHeading: { fontSize: 20, fontWeight: '700', color: '#1E1B18' },
  screenSubheading: {
    fontSize: 13,
    color: '#6E6658',
    marginTop: 4,
    marginBottom: 14,
  },
  courseCard: {
    borderRadius: 24,
    padding: 16,
    marginBottom: 12,
  },
  courseHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  courseIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  courseCodeText: { fontSize: 11, fontWeight: '600', color: '#5C5549' },
  courseTitleText: { fontSize: 16, fontWeight: '700', color: '#1E1B18' },
  courseInfoBox: {
    backgroundColor: 'rgba(255,255,255,0.65)',
    borderRadius: 16,
    padding: 10,
    marginBottom: 10,
  },
  courseDetailLine: { fontSize: 12, color: '#3D3830', marginBottom: 2 },
  courseFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  courseTaskCount: { fontSize: 12, fontWeight: '700' },
  courseActionButton: {
    minHeight: 44,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  courseActionText: { fontSize: 12, fontWeight: '700', color: '#1E1B18' },
  streakHeroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EC6B56',
    borderRadius: 24,
    padding: 18,
    marginBottom: 16,
    gap: 14,
  },
  streakHeroIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakHeroTitle: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  streakHeroSubtitle: { fontSize: 12, color: '#FFEAE6', marginTop: 2 },
  analyticsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#EFE8DC',
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E1B18',
    marginBottom: 10,
  },
  gaugeBarTrack: {
    height: 12,
    borderRadius: 6,
    backgroundColor: '#F4EFE6',
    overflow: 'hidden',
    marginBottom: 14,
  },
  gaugeBarFill: {
    height: '100%',
    backgroundColor: '#2A9D8F',
    borderRadius: 6,
  },
  metricsThreeCol: { flexDirection: 'row', justifyContent: 'space-between' },
  metricItem: { alignItems: 'center', flex: 1 },
  metricNumber: { fontSize: 20, fontWeight: '700', color: '#1E1B18' },
  metricCaption: { fontSize: 11, color: '#6E6658', marginTop: 2 },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  badgeCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#EFE8DC',
    padding: 14,
  },
  badgeIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  badgeTitle: { fontSize: 13, fontWeight: '700', color: '#1E1B18' },
  badgeSubtitle: { fontSize: 11, color: '#6E6658', marginTop: 2 },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#EFE8DC',
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  profileAvatarLarge: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#EC6B56',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  profileName: { fontSize: 18, fontWeight: '700', color: '#1E1B18' },
  profileNim: { fontSize: 13, fontWeight: '600', color: '#5C5549', marginTop: 2 },
  profileInstitution: { fontSize: 12, color: '#6E6658', marginTop: 2 },
  settingsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#EFE8DC',
    padding: 16,
    gap: 12,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
  },
  settingLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  settingLabel: { fontSize: 14, fontWeight: '600', color: '#1E1B18' },
  resetDataButton: {
    minHeight: 48,
    borderRadius: 18,
    backgroundColor: '#EC6B56',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 6,
  },
  resetDataButtonText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
  bottomNav: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#EFE8DC',
    paddingVertical: 8,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 6,
  },
  bottomNavItem: {
    minHeight: 44,
    minWidth: 48,
    paddingHorizontal: 12,
    borderRadius: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  bottomNavItemActive: { backgroundColor: '#EC6B56' },
  bottomNavLabelActive: { fontSize: 12, fontWeight: '700', color: '#FFFFFF' },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FDFBF7',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '85%',
    paddingBottom: 24,
  },
  grabHandle: {
    width: 42,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#DDD5C7',
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EFE8DC',
  },
  modalHeaderAction: { minWidth: 64, minHeight: 44, justifyContent: 'center' },
  cancelText: { fontSize: 14, color: '#6E6658', fontWeight: '600' },
  modalTitle: { fontSize: 15, fontWeight: '700', color: '#1E1B18' },
  saveText: {
    fontSize: 14,
    color: '#EC6B56',
    fontWeight: '700',
    textAlign: 'right',
  },
  modalBody: { padding: 16 },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEAE6',
    padding: 12,
    borderRadius: 14,
    marginBottom: 12,
    gap: 8,
  },
  errorText: { fontSize: 12, color: '#991B1B', fontWeight: '600', flex: 1 },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4A4338',
    marginBottom: 6,
    marginTop: 10,
  },
  textInput: {
    backgroundColor: '#F4EFE6',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1E1B18',
    minHeight: 44,
  },
  textArea: { minHeight: 84, textAlignVertical: 'top' },
  courseChipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  courseOptionButton: {
    minHeight: 44,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: '#F4EFE6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  courseOptionActive: { backgroundColor: '#EC6B56' },
  courseOptionText: { fontSize: 12, fontWeight: '600', color: '#4A4338' },
  courseOptionTextActive: { color: '#FFFFFF' },
});
