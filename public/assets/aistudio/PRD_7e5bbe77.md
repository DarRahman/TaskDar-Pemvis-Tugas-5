# Product Requirements Document (PRD)
## Academic Task Manager Mobile Application

### Project Metadata
- Context: Academic Coursework for Visual Programming I (Pemrograman Visual I * - TI361)
- Academic Institution: STIKOM Poltek Cirebon
- Class / Program: TI-1 (Semester 5 Informatics Engineering)
- Student / Developer: Badar Rahman (NIM: 14524303)
- Target Tech Stack: React Native with Expo (Managed Workflow)
- Target Repository: `DarRahman/pemvis-tugas5-task-manager`

---

## 1. Product Purpose & Overview

The application is an academic task manager designed specifically for university students to track, manage, search, and monitor course assignments across an active academic semester. 

The primary objective is to prove production-grade proficiency in React Native component architecture, props delegation, and the React Hooks state lifecycle as mandated by the course curriculum.

---

## 2. Functional Requirements (Mandatory Lecturer Rubric)

### FR-01: Academic Assignment List Rendering
- Renders an initial list of at least five authentic academic tasks from the student's actual Semester 5 curriculum.
- Each task record must store and display:
  - Task title (`title`)
  - Course name (`course`)
  - Description / instructions (`description`)
  - Submission deadline (`deadline`)
  - Completion status (`status`: "Belum Dikerjakan" or "Selesai")
- Uses React Native's virtualized `FlatList` component for efficient rendering.

### FR-02: Task Creation Flow
- Enables students to create new assignments by providing title, course name, description, and deadline.
- Submitting the form validates that required inputs are present.
- Newly created tasks are prepended to the task array and immediately rendered on the screen.

### FR-03: Completion Status Toggle
- Enables students to toggle assignment status between "Belum Dikerjakan" (Pending) and "Selesai" (Completed).
- Applies clear visual differentiation between states (e.g. strikethrough title, distinct status styling, and check indicator).

### FR-04: Task Deletion
- Provides an explicit action to delete an assignment from the active list.
- Deletion updates the state array and refreshes all counts immediately.

### FR-05: Real-Time Keyword Search & Console Observation
- Provides a real-time search input that filters tasks dynamically by task title or course name.
- Employs `useEffect` to observe search keyword changes and output the query state to the debugging terminal via `console.log()`.

### FR-06: Task Metrics Summary
- Displays real-time counts for:
  - Total tasks
  - Pending / in-progress tasks ("Belum Dikerjakan")
  - Completed tasks ("Selesai")
- Metrics must be computed derived state optimized using `useMemo` so calculations only execute when the task array mutates.

---

## 3. Mandatory Technical Hook Architecture

The codebase must strictly implement all seven React Native architectural concepts specified by the lecturer:

1. **`Props` (Component Delegation):** Strict parent-to-child separation. The parent screen passes data and action callbacks to a dedicated child task component (`TaskCard`) via props.
2. **`useState`:** Manages form input state and the search query string.
3. **`useEffect`:** Monitors search query changes with an explicit dependency array (`[searchQuery]`) and outputs `console.log()` debug traces.
4. **`useMemo`:** Derives active, completed, and total counts from the task state with dependency array `[tasks]`.
5. **`useCallback`:** Memoizes mutation handlers (`handleToggleStatus`, `handleDeleteTask`, `handleAddTask`) to preserve reference stability.
6. **`useRef`:** References the Task Title `TextInput` element to programmatically refocus the cursor upon form submission or modal opening.
7. **`useReducer`:** Acts as the central state engine for task array operations, implementing four explicit actions:
   - `ADD_TASK`
   - `DELETE_TASK`
   - `TOGGLE_STATUS`
   - `RESET_TASKS`

---

## 4. Authentic Initial Dataset

The application initializes with five authentic Semester 5 coursework records for Badar Rahman at STIKOM Poltek Cirebon:

1. Title: "Tugas Pertemuan 5 - Implementasi React Native Hooks"
   Course: "Pemrograman Visual I"
   Description: "Membangun aplikasi to-do dengan Props, useState, useEffect, useMemo, useCallback, useRef, dan useReducer."
   Deadline: "09 Nov 2026"
   Status: "Belum Dikerjakan"

2. Title: "Latihan 4 - Kinematika Ruang dan Transformasi Koordinat"
   Course: "Robotika"
   Description: "Konversi koordinat bola ke kartesian dan matriks rotasi end-effector robot manipulator."
   Deadline: "04 Nov 2026"
   Status: "Selesai"

3. Title: "Analisis 3V Big Data Tokopedia dan Shopee"
   Course: "Data Warehouse & Data Mining"
   Description: "Arsitektur data lake, streaming kafka, dan pemisahan sistem OLTP vs OLAP."
   Deadline: "07 Nov 2026"
   Status: "Selesai"

4. Title: "Praktikum Modul 1.4.1 - Uji Port Nmap Kali Linux"
   Course: "Keamanan Informasi & Jaringan"
   Description: "Pengujian network scanner Nmap 7.99 pada subsistem WSL Kali Linux."
   Deadline: "05 Nov 2026"
   Status: "Selesai"

5. Title: "Analisis OOM Perancangan Sistem Pasar Cirebon"
   Course: "Pemrograman Berorientasi Objek"
   Description: "Pemodelan class diagram dan use case spesifikasi harga pangan Cirebon."
   Deadline: "14 Nov 2026"
   Status: "Belum Dikerjakan"

---

## 5. Language & Context Guidelines

- Application UI Strings: Indonesian (Bahasa Indonesia) suitable for an academic coursework submission in Indonesia (e.g. "Tugas Kuliah", "Belum Dikerjakan", "Selesai", "Batal", "Simpan").
- Code, Comments, and Technical Documentation: Clean English.
