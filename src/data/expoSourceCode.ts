/*
 * Standalone React Native (Expo Managed Workflow) source code for
 * Pemrograman Visual I (TI361) at STIKOM Poltek Cirebon.
 * Ready to run directly in App.js inside an Expo project.
 */
export const EXPO_APP_JS_SOURCE = `import React, {
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
} from 'react-native';
import { Feather } from '@expo/vector-icons';

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
    course: 'Pemrograman Berorientasi Objek',
    description:
      'Pemodelan class diagram dan use case spesifikasi harga pangan Cirebon.',
    deadline: '14 Nov 2026',
    status: 'Belum Dikerjakan',
  },
];

const SEMESTER_5_COURSES = [
  'Pemrograman Visual I',
  'Robotika',
  'Data Warehouse & Data Mining',
  'Keamanan Informasi & Jaringan',
  'Pemrograman Berorientasi Objek',
];

/*
 * Central state engine using useReducer to guarantee predictable, immutable
 * transitions across task creation, deletion, status toggling, and reset.
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

function getCourseIconName(courseName) {
  const lower = courseName.toLowerCase();
  if (lower.includes('visual')) return 'code';
  if (lower.includes('robot')) return 'cpu';
  if (lower.includes('data')) return 'database';
  if (lower.includes('keamanan')) return 'shield';
  if (lower.includes('objek')) return 'layers';
  return 'book-open';
}

/*
 * Pure child component receiving data and action callbacks strictly via Props.
 * Enforces 44x44pt minimum touch targets and WCAG AA contrast ratios.
 */
const TaskCard = React.memo(({ task, onToggleStatus, onDeleteTask }) => {
  const isCompleted = task.status === 'Selesai';
  const iconName = getCourseIconName(task.course);

  return (
    <View style={[styles.card, isCompleted && styles.cardCompleted]}>
      <View style={styles.cardRow}>
        <View style={[styles.iconBox, isCompleted && styles.iconBoxCompleted]}>
          <Feather name={iconName} size={16} color="#18181B" />
        </View>

        <TouchableOpacity
          style={styles.cardBody}
          activeOpacity={0.75}
          onPress={() => onToggleStatus(task.id)}
          accessibilityRole="button"
          accessibilityLabel={
            isCompleted
              ? 'Ubah status ' + task.title + ' ke belum dikerjakan'
              : 'Tandai ' + task.title + ' selesai'
          }
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
            <Feather name="calendar" size={13} color="#64645E" />
            <Text style={styles.deadlineText}>Tenggat: {task.deadline}</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.actionsColumn}>
          <TouchableOpacity
            style={styles.touchTarget}
            onPress={() => onToggleStatus(task.id)}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: isCompleted }}
            accessibilityLabel="Ubah status tugas"
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
            accessibilityLabel={'Hapus tugas ' + task.title}
          >
            <Feather name="trash-2" size={16} color="#64645E" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
});

export default function App() {
  const [tasks, dispatch] = useReducer(taskReducer, INITIAL_TASKS);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('Semua');
  const [isModalVisible, setIsModalVisible] = useState(false);

  const [title, setTitle] = useState('');
  const [course, setCourse] = useState(SEMESTER_5_COURSES[0]);
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('20 Nov 2026');
  const [formError, setFormError] = useState('');

  const titleInputRef = useRef(null);

  /*
   * Observes searchQuery transitions and outputs debug traces to the terminal
   * as required by FR-05 and Hook Requirement 3.
   */
  useEffect(() => {
    console.log(
      '[Search Debug] Kata kunci pencarian aktif:',
      searchQuery.trim() === '' ? '(kosong)' : searchQuery
    );
  }, [searchQuery]);

  /*
   * Computes derived task metrics only when the tasks array mutates,
   * fulfilling FR-06 and Hook Requirement 4.
   */
  const taskMetrics = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((item) => item.status === 'Selesai').length;
    const pending = total - completed;
    return { total, pending, completed };
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase();
    return tasks.filter((item) => {
      const matchesTab =
        activeTab === 'Semua' ? true : item.status === activeTab;
      const matchesSearch =
        keyword === '' ||
        item.title.toLowerCase().includes(keyword) ||
        item.course.toLowerCase().includes(keyword);
      return matchesTab && matchesSearch;
    });
  }, [tasks, activeTab, searchQuery]);

  /*
   * Memoizes action handlers via useCallback so child TaskCard instances
   * keep stable function references across renders.
   */
  const handleToggleStatus = useCallback((taskId) => {
    dispatch({ type: 'TOGGLE_STATUS', payload: taskId });
  }, []);

  const handleDeleteTask = useCallback((taskId) => {
    dispatch({ type: 'DELETE_TASK', payload: taskId });
  }, []);

  const handleResetTasks = useCallback(() => {
    dispatch({ type: 'RESET_TASKS' });
    setSearchQuery('');
    setActiveTab('Semua');
  }, []);

  const handleOpenAddModal = useCallback(() => {
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
      <StatusBar barStyle="dark-content" backgroundColor="#F5F5F3" />

      <View style={styles.container}>
        {/* Top App Bar */}
        <View style={styles.header}>
          <View style={styles.brandRow}>
            <View style={styles.brandBadge}>
              <Feather name="check-square" size={18} color="#FFFFFF" />
            </View>
            <View>
              <Text style={styles.brandTitle}>Tugas Kuliah</Text>
              <Text style={styles.brandSubtitle}>
                Badar Rahman · 14524303 · TI-1
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.resetButton}
            onPress={handleResetTasks}
            accessibilityRole="button"
            accessibilityLabel="Atur ulang daftar tugas ke data awal"
          >
            <Feather name="rotate-ccw" size={16} color="#18181B" />
          </TouchableOpacity>
        </View>

        {/* Derived Task Metrics Summary (useMemo) */}
        <View style={styles.metricsRow}>
          <View style={styles.metricBlock}>
            <Text style={styles.metricValue}>{taskMetrics.total}</Text>
            <Text style={styles.metricLabel}>Total Tugas</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metricBlock}>
            <Text style={styles.metricValue}>{taskMetrics.pending}</Text>
            <Text style={styles.metricLabel}>Belum Dikerjakan</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metricBlock}>
            <Text style={styles.metricValue}>{taskMetrics.completed}</Text>
            <Text style={styles.metricLabel}>Selesai</Text>
          </View>
        </View>

        {/* Real-Time Keyword Search Bar */}
        <View style={styles.searchWrapper}>
          <Feather name="search" size={16} color="#64645E" />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Cari judul tugas atau mata kuliah..."
            placeholderTextColor="#71716A"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              style={styles.clearSearchButton}
              onPress={() => setSearchQuery('')}
              accessibilityRole="button"
              accessibilityLabel="Bersihkan pencarian"
            >
              <Feather name="x" size={16} color="#52524E" />
            </TouchableOpacity>
          )}
        </View>

        {/* Slothy-Style Underlined Status Filter Tabs */}
        <View style={styles.tabsRow}>
          {['Semua', 'Belum Dikerjakan', 'Selesai'].map((tab) => {
            const isActive = activeTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                style={[styles.tabButton, isActive && styles.tabButtonActive]}
                onPress={() => setActiveTab(tab)}
                accessibilityRole="tab"
                accessibilityState={{ selected: isActive }}
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

        {/* Virtualized FlatList */}
        <FlatList
          data={filteredTasks}
          keyExtractor={(item) => item.id}
          renderItem={renderTaskItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Feather name="inbox" size={28} color="#71716A" />
              <Text style={styles.emptyTitle}>Tidak ada tugas ditemukan</Text>
              <Text style={styles.emptySubtitle}>
                Ubah kata kunci pencarian atau tambah tugas kuliah baru.
              </Text>
            </View>
          }
        />

        {/* Floating Action Button (+) in Natural Thumb Zone */}
        <TouchableOpacity
          style={styles.fab}
          onPress={handleOpenAddModal}
          accessibilityRole="button"
          accessibilityLabel="Tambah tugas baru"
        >
          <Feather name="plus" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Bottom Sheet Modal for Adding Tasks */}
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
                  placeholderTextColor="#71716A"
                />

                <Text style={styles.fieldLabel}>Mata Kuliah</Text>
                <View style={styles.courseChipsWrap}>
                  {SEMESTER_5_COURSES.map((item) => (
                    <TouchableOpacity
                      key={item}
                      style={[
                        styles.courseOptionButton,
                        course === item && styles.courseOptionActive,
                      ]}
                      onPress={() => setCourse(item)}
                    >
                      <Text
                        style={[
                          styles.courseOptionText,
                          course === item && styles.courseOptionTextActive,
                        ]}
                      >
                        {item}
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
                  placeholderTextColor="#71716A"
                  multiline
                />

                <Text style={styles.fieldLabel}>Tenggat Waktu</Text>
                <TextInput
                  style={styles.textInput}
                  value={deadline}
                  onChangeText={setDeadline}
                  placeholder="Contoh: 20 Nov 2026"
                  placeholderTextColor="#71716A"
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
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F5F3',
  },
  container: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#18181B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#18181B',
  },
  brandSubtitle: {
    fontSize: 12,
    color: '#52524E',
    marginTop: 1,
  },
  resetButton: {
    minWidth: 44,
    minHeight: 44,
    borderRadius: 12,
    backgroundColor: '#EAE7E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E4E2DD',
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  metricBlock: {
    flex: 1,
    alignItems: 'center',
  },
  metricDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#E4E2DD',
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#18181B',
    fontVariant: ['tabular-nums'],
  },
  metricLabel: {
    fontSize: 11,
    color: '#52524E',
    marginTop: 2,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAE7E1',
    borderRadius: 14,
    paddingHorizontal: 12,
    minHeight: 44,
    marginBottom: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#18181B',
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
    borderBottomColor: '#E4E2DD',
    marginBottom: 14,
  },
  tabButton: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabButtonActive: {
    borderBottomColor: '#18181B',
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64645E',
  },
  tabLabelActive: {
    color: '#18181B',
    fontWeight: '700',
  },
  listContent: {
    paddingBottom: 96,
    gap: 10,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E4E2DD',
    padding: 14,
    marginBottom: 10,
  },
  cardCompleted: {
    backgroundColor: '#EFECE6',
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F5F5F3',
    borderWidth: 1,
    borderColor: '#E4E2DD',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconBoxCompleted: {
    backgroundColor: '#E6E3DC',
    opacity: 0.7,
  },
  cardBody: {
    flex: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  courseText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#52524E',
  },
  metaDot: {
    marginHorizontal: 6,
    color: '#64645E',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusPending: {
    color: '#854D0E',
  },
  statusDone: {
    color: '#1E5E4E',
  },
  titleText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#18181B',
    marginTop: 4,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: '#64645E',
  },
  descriptionText: {
    fontSize: 13,
    color: '#484843',
    marginTop: 6,
    lineHeight: 19,
  },
  descriptionCompleted: {
    color: '#71716A',
  },
  deadlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  deadlineText: {
    fontSize: 12,
    color: '#52524E',
    fontVariant: ['tabular-nums'],
  },
  actionsColumn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 4,
  },
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
    borderColor: '#71716A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircleCompleted: {
    backgroundColor: '#18181B',
    borderColor: '#18181B',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#18181B',
    marginTop: 10,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64645E',
    marginTop: 4,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#18181B',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#F5F5F3',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    paddingBottom: 24,
  },
  grabHandle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#D4D2CD',
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
    borderBottomColor: '#E4E2DD',
  },
  modalHeaderAction: {
    minWidth: 64,
    minHeight: 44,
    justifyContent: 'center',
  },
  cancelText: {
    fontSize: 14,
    color: '#52524E',
    fontWeight: '500',
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#18181B',
  },
  saveText: {
    fontSize: 14,
    color: '#18181B',
    fontWeight: '700',
    textAlign: 'right',
  },
  modalBody: {
    padding: 16,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    gap: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#991B1B',
    fontWeight: '500',
    flex: 1,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3F3F3B',
    marginBottom: 6,
    marginTop: 10,
  },
  textInput: {
    backgroundColor: '#EAE7E1',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#18181B',
    minHeight: 44,
  },
  textArea: {
    minHeight: 84,
    textAlignVertical: 'top',
  },
  courseChipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  courseOptionButton: {
    minHeight: 44,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#EAE7E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  courseOptionActive: {
    backgroundColor: '#18181B',
  },
  courseOptionText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#3F3F3B',
  },
  courseOptionTextActive: {
    color: '#FFFFFF',
  },
});
`;
