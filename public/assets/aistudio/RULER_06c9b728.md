# Engineering & Quality Standards (RULER.md)

This document establishes the quality, engineering, and craftsmanship standards for the Academic Task Manager project. Every model and agent implementing this project must adhere to these directives.

---

## 1. Zero Tolerance Anti-Slop Hard Gates

- **HG-01 (No Raw Emojis):** Strictly no raw Unicode emojis in user interface components, buttons, labels, code comments, or documentation. All visual markers must use proper vector icons (e.g. `@expo/vector-icons` Ionicons or Feather).
- **HG-02 (No Em-Dashes):** The em-dash character (`—`) is strictly forbidden across all user interface copy, labels, and documentation. Use natural punctuation (periods, commas, colons, or parentheses) instead.
- **HG-03 (No Fabricated Data):** All initial records must represent authentic academic coursework from Semester 5. Never fabricate generic filler data (like "Task 1", "Lorem ipsum", or fake reviews).
- **HG-04 (No Dead Controls):** Every button, toggle, and input field must have an active, functional handler. Do not render non-functional dummy buttons.
- **HG-05 (Accessibility & Ergonomics):** All interactive touch targets must meet a minimum bounding box of 44x44 pt. All text must pass WCAG AA contrast standards (minimum 4.5:1 for normal text).
- **HG-06 (Mobile-First Responsiveness):** Layout must reflow seamlessly on mobile viewports (e.g. 390x844 pt) with zero horizontal overflow or clipping.

---

## 2. Visual Craftsmanship Directive

- **Visual Reference Benchmark:** Directly inspect the provided visual reference image (`reference_slothy_clean_ui.png`). Emulate its high level of visual restraint, typographic hierarchy, clean whitespace, and distraction-free mobile simplicity.
- **Avoid Generic AI Defaults:**
  - No purple/cyan neon glow or loud gradient backgrounds.
  - No dense, cramped web dashboard widgets or multi-layer box-in-box nesting.
  - No heavy or colored drop shadows.
  - Ensure every component feels purposeful, lightweight, and native to mobile ergonomics.

---

## 3. Code Cleanliness & Architecture Standards

- **CH-01 (Comment Hygiene):** Comments must explain architectural intent (*why*), never narrate trivial syntax line by line (*what*).
- **CH-02 (No Decorative Banners):** No banner comments (`// =======`), box drawing, or all-caps separator labels in code.
- **CH-03 (State Integrity):** State mutations must follow immutable React best practices. Handlers must be memoized where appropriate.
- **CH-04 (Component Delegation):** Adhere strictly to the Props pattern: keep the task item component as a dedicated, pure child component receiving data and callbacks from its parent.
