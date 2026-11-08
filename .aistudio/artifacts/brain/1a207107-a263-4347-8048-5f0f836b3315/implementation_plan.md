# Tugas Kuliah: Academic Task Manager (Pemrograman Visual I - TI361)

An academic task management mobile application built for Semester 5 Informatics Engineering coursework at STIKOM Poltek Cirebon (Badar Rahman, NIM: 14524303). It delivers a distraction-free mobile experience modeled directly after the Slothy UI benchmark alongside a copyable React Native Expo source drawer that fulfills all lecturer rubric requirements.

### User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural and UX choices incorporate your confirmed preferences from the clarification step and strictly enforce the anti-slop quality gates in RULER.md.

- **Confirmed Decision 1 (Delivery Packaging)**: The workspace will render an interactive mobile preview optimized for both mobile viewports (390x844 pt) and responsive desktop inspection, paired with an accessible Expo `App.js` code drawer so you can copy or export the standalone React Native (Expo Managed Workflow) source code directly.
- **Confirmed Decision 2 (Task Creation Workflow)**: Adding a new assignment uses a slide-up bottom sheet modal triggered by a floating action button (`+`) in the natural thumb zone, complete with `Batal` and `Simpan` header actions and programmatic `useRef` focus on the task title input.
- **Confirmed Decision 3 (Filtering & Navigation)**: Clean bottom-border status filter tabs (`Semua`, `Belum Dikerjakan`, `Selesai`) sit directly below the header alongside a real-time keyword search input and reactive `useMemo` summary counters.

### 1. Overview & Core Concept

- **What It Does**: Allows university students to view, add, complete, delete, reset, and search Semester 5 academic coursework assignments with immediate visual feedback and real-time derived metrics.
- **Target Audience / Persona**: University students and academic evaluators for the Visual Programming I (TI361) course at STIKOM Poltek Cirebon.
- **Key Value**: Demonstrates production-grade mastery of React Native component delegation (`Props`) and the complete React Hooks lifecycle (`useState`, `useEffect`, `useMemo`, `useCallback`, `useRef`, `useReducer`) inside a calm, clutter-free interface with zero emojis and zero em-dashes.

### 2. User Experience & Visual Design

- **Key User Flows**:
  1. **Initial Academic List & Metrics**: Launches with the 5 authentic Semester 5 coursework records for Badar Rahman. The top summary area displays derived counts for Total Tugas, Belum Dikerjakan, and Selesai computed via `useMemo`.
  2. **Status Tab & Keyword Filtering**: Tapping `Semua`, `Belum Dikerjakan`, or `Selesai` filters the list by status, while typing in the search bar filters assignments in real time by task title or course name and logs the query transition via `useEffect` (`console.log`) to both the browser console and an optional inspectable console log drawer.
  3. **Status Toggling & Task Deletion**: Tapping the 44x44 pt circular completion toggle on any `TaskCard` switches its status between `Belum Dikerjakan` and `Selesai` with strikethrough typography and a high-contrast check indicator. Tapping the 44x44 pt delete button removes the record and updates all counters immediately.
  4. **Task Creation Bottom Sheet**: Tapping the bottom-right floating action button (`+`) opens the `Tambah Tugas` bottom sheet, automatically focuses the title `TextInput` via `useRef`, validates required fields (`Judul Tugas`, `Mata Kuliah`, `Deskripsi`, `Tenggat Waktu`), and prepends the new assignment upon tapping `Simpan`.
  5. **Dataset Reset & Expo Source Inspection**: Tapping the reset action (`Atur Ulang`) dispatches `RESET_TASKS` to restore the initial 5 authentic Semester 5 records. Tapping `Kode Expo (App.js)` opens the complete, ready-to-run React Native Expo code with one-click copy.
- **Visual Identity & Theme**:
  - *Aesthetic Direction*: Calm, tactile utilitarian minimalism modeled after the Slothy reference benchmark. Prioritizes generous breathing room, soft rounded card surfaces, crisp hairline dividers, and zero decorative clutter.
  - *Color Palette & Mood*:
    - Dominant Canvas (60%): Warm alabaster neutral (`#F5F5F3` background field) with deep botanical forest green (`#1E5E4E`) outer framing on wide screens to echo the Slothy presentation canvas.
    - Structural Surfaces (30%): Pure crisp white (`#FFFFFF`) and soft stone (`#EFECE6`) task cards with subtle hairline borders (`#E4E2DD`) and charcoal ink (`#18181B`) plus muted slate (`#64645E`) for secondary text.
    - Accent Budget (10%): High-contrast obsidian (`#18181B`) for primary interactive controls (floating action button, active tab indicator, completed check circle) and semantic status accents passing WCAG AA contrast (minimum 4.5:1).
  - *Typography & Hierarchy*:
    - Display & Headings: `Plus Jakarta Sans` (SemiBold/Bold 600-700) for clean editorial authority and mobile legibility.
    - Body & UI Controls: `Plus Jakarta Sans` (Regular/Medium 400-500) for task titles, course subtitles, and descriptions.
    - Numeric Metrics & Deadlines: `JetBrains Mono` with `tabular-nums` for aligned counters, NIM metadata, and submission deadlines.
  - *Component Styling & Layout*:
    - Responsive mobile-first architecture: Renders full-bleed on mobile viewports (390x844 pt) and expands cleanly on desktop into a two-column academic showcase pairing the interactive mobile device viewport with an architectural rubric inspector and live `useEffect` console logger.
    - Unboxed metadata with subtle middot (`.`) separators instead of static pill badges.
    - Strict 44x44 pt minimum hitboxes on all checkboxes, delete buttons, filter tabs, and header actions.
- **Interactive Feedback & Motion**:
  - Fast, responsive transitions (150ms cubic-bezier settling curves) on card completion states, tab indicator shifts, and bottom sheet slide-up reveals.

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Dual Interactive Web Preview + Standalone Expo Code Export**
  - *Chosen Approach*: Build the interactive application using semantic React Native-aligned primitives and provide a dedicated drawer containing the complete, single-file and modular React Native + Expo (`react-native` `FlatList`, `StyleSheet`, `Modal`, `TextInput`, `TouchableOpacity`, `@expo/vector-icons`) source code.
  - *Why*: Allows immediate grading and verification of all 6 functional requirements and 7 hooks in the live browser preview while giving you 100% authentic, copy-ready React Native Expo code for your `DarRahman/pemvis-tugas5-task-manager` repository.
  - *Alternatives Considered*: Rendering only static code blocks (rejected because it prevents interactive testing) or web-only markup without Expo code export (rejected because the course targets React Native with Expo).
- **Decision 2: Centralized `useReducer` State Engine with Memoized Callbacks**
  - *Chosen Approach*: Manage the task collection exclusively through `useReducer` supporting `ADD_TASK`, `DELETE_TASK`, `TOGGLE_STATUS`, and `RESET_TASKS`, paired with `useCallback` action handlers passed via `Props` to `TaskCard`.
  - *Why*: Guarantees immutable state transitions, prevents unnecessary child re-renders in virtualized lists, and directly satisfies all 7 lecturer rubric criteria.
  - *Alternatives Considered*: Scattering multiple `useState` calls for list mutations (rejected because it violates requirement 7 and complicates reset and toggle logic).

### 4. Technical Architecture & Data Strategy *(Technical Reference)*

- **Architecture & Component Diagram**:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     AcademicTaskManagerApp (Parent)                     │
│  ┌──────────────────────┐  ┌──────────────────────┐  ┌───────────────┐  │
│  │     useReducer       │  │       useState       │  │    useMemo    │  │
│  │  tasksState +        │  │  searchQuery,        │  │  totalCount,  │  │
│  │  dispatch(           │  │  activeTab,          │  │  pendingCount,│  │
│  │   ADD_TASK,          │  │  isSheetOpen,        │  │  doneCount    │  │
│  │   DELETE_TASK,       │  │  formInputs          │  │  ([tasks])    │  │
│  │   TOGGLE_STATUS,     │  └──────────┬───────────┘  └───────┬───────┘  │
│  │   RESET_TASKS)       │             │                      │          │
│  └──────────┬───────────┘             ▼                      │          │
│             │              ┌──────────────────────┐          │          │
│             │              │      useEffect       │          │          │
│             │              │  Watches             │          │          │
│             │              │  [searchQuery] ->    │          │          │
│             │              │  console.log()       │          │          │
│             │              └──────────────────────┘          │          │
│             ▼                                                ▼          │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │             useCallback Memoized Action Handlers                  │  │
│  │    handleAddTask · handleToggleStatus · handleDeleteTask          │  │
│  └──────────┬────────────────────────────────────────┬───────────────┘  │
└─────────────┼────────────────────────────────────────┼──────────────────┘
              │ Props Delegation                       │ useRef(titleInput)
              ▼                                        ▼
┌──────────────────────────────────────┐ ┌────────────────────────────────┐
│       TaskCard (Pure Child)          │ │   AddTaskBottomSheet (Modal)   │
│  Props:                              │ │  Controlled Inputs (useState)  │
│  - task (id, title, course,          │ │  Auto-focus Title (useRef)     │
│    description, deadline, status)    │ │  Validation & Submit           │
│  - onToggleStatus(id) [44x44pt]      │ │  Actions: Batal / Simpan       │
│  - onDeleteTask(id)   [44x44pt]      │ └────────────────────────────────┘
└──────────────────────────────────────┘
```

- **Data Model & State**:
  - `AcademicTask`:
    - `id`: Unique string identifier
    - `title`: Assignment title in Indonesian
    - `course`: Semester 5 course name (`Pemrograman Visual I`, `Robotika`, `Data Warehouse & Data Mining`, `Keamanan Informasi & Jaringan`, `Pemrograman Berorientasi Objek`)
    - `description`: Detailed coursework scope and instructions
    - `deadline`: Submission date string (e.g., `09 Nov 2026`)
    - `status`: Union of `"Belum Dikerjakan"` and `"Selesai"`
- **Interactive Component & State Mapping**:
  - **Search Bar Input**: Updates `searchQuery` via `useState`. Triggers `useEffect` with dependency `[searchQuery]` to log `[Search Debug] Kata kunci pencarian: "<query>"` via `console.log()`. Filters the displayed list across `title` and `course` case-insensitively.
  - **Status Filter Tabs (`Semua`, `Belum Dikerjakan`, `Selesai`)**: Updates `activeFilter` via `useState` and combines with `searchQuery` to compute the visible list. Displays a clean empty state with a reset filter button when no assignments match.
  - **TaskCard Component**: Receives `task`, `onToggleStatus`, and `onDeleteTask` via `Props`. Tapping the completion button invokes `onToggleStatus(task.id)` which dispatches `{ type: 'TOGGLE_STATUS', payload: id }`. Tapping the trash icon button invokes `onDeleteTask(task.id)` which dispatches `{ type: 'DELETE_TASK', payload: id }`.
  - **Bottom Sheet Form (`Tambah Tugas`)**: Opened via the `+` floating action button. Triggers `titleInputRef.current?.focus()` via `useRef`. Validates that `title`, `course`, `description`, and `deadline` are non-empty (displaying inline validation feedback in Indonesian if any field is blank), dispatches `{ type: 'ADD_TASK', payload: newTask }`, clears the form, and refocuses or closes cleanly.
  - **Reset Action (`Atur Ulang`)**: Dispatches `{ type: 'RESET_TASKS' }` to restore the 5 authentic Semester 5 records and clears active search filters.
