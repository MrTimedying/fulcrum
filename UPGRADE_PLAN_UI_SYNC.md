# UI Synchronization Roadmap: Web to Tauri

This document outlines the steps required to synchronize the layout, navigation, and feedback systems of the `@fulcrumtauri` project with the modern UI/UX found in `@fulcrumproject`.

---

## 1. Global Navigation & Layout (`mainbody.jsx`)

### Current State (Tauri)
- Uses legacy top-tab navigation via `TabStructure()`.
- Lacks a unified `renderActiveView()` pattern.
- Relies on older `UtilityMenu` logic.

### Upgrade Path
- **Floating Mode Toggle:** Port `FloatingModeToggle.jsx` from the Web project and place it in the fixed top-right position.
- **View Refactor:** Implement the `renderActiveView()` pattern in `mainbody.jsx` to replace the `Tab.Group` based navigation. This simplifies the component tree and improves performance.
- **Menu Synchronization:** Update `GraphActionsMenu` to include the specialized `icfSetsMenu` and `bulkEditMenu` logic.

---

## 2. Advanced Data Previews (`templateModal.jsx` & `interventionModal.jsx`)

### Current State (Tauri)
- Previews are basic lists of labels or raw JSON fields.
- Lacks analytical summaries.

### Upgrade Path
- **Grid-Based Previews:** Update the preview section in both modals to use the new CSS grid layout (`Type`, `Label`, `Scope`, `Tags`).
- **Status Indicators:** Add the small, color-coded status circles for node types (Blue for Intervention, Green for Phase, Yellow for Micro, Purple for Session).
- **Analytical Summaries:** In `interventionModal.jsx`, implement the "Node Distribution" and "Session Data" statistics cards to provide immediate insight into the intervention's complexity.

---

## 3. Feedback & Notification System (`toaster.jsx`)

### Current State (Tauri)
- Uses MUI `Snackbar` and `Stack`, which can be rigid and lacks fluid transitions.

### Upgrade Path
- **Framer Motion Integration:** Replace the MUI stacking logic with the `framer-motion` (`AnimatePresence`) implementation.
- **Custom Stacking:** Implement the fixed-position `motion.div` container that manages toast entry/exit animations independently of the MUI portal system.
- **Visual Parity:** Ensure the `Alert` components use the `variant="filled"` style with the zinc-palette background colors.

---

## 4. Platform-Specific Synchronization (`OptionsModal.jsx`)

### Current State (Tauri)
- Already features native Tauri `updater` integration (more advanced than Electron version).

### Upgrade Path
- **Aesthetic Alignment:** Ensure the internal styling (colors, typography, and spacing) matches the new `zinc-900` / `zinc-800` theme used in the rest of the app.
- **Security Tab:** Sync the "Encrypt patient data" UI and logic, ensuring it interfaces correctly with the Tauri/Rust encryption backend.

---

## 5. Summary of Aesthetic Changes
- **Color Palette:** Strictly follow the `zinc` scale (`zinc-900` for backgrounds, `zinc-800` for cards, `zinc-700` for borders).
- **Typography:** Shift towards "thin" and "extralight" font weights for headers to maintain the professional, clinical feel of the Web version.
- **Animations:** Standardize spring-based animations for all modal entries and navigation toggles using `framer-motion`.
