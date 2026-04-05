# Upgrade Plan: Editor Components Synchronization (Web to Tauri)

This document provides a detailed, step-by-step roadmap for upgrading the editor components in the `@fulcrumtauri` project to match the functionality and architectural improvements found in the `@fulcrumproject`.

---

## 1. Project Infrastructure Alignment

### Target Directory
`apps/frontend/src/components/editor/`

### Dependency Verification
Ensure the following packages are present in `apps/frontend/package.json`:
- `yup` (v1.3.x+)
- `react-rnd` (v10.1.x+)
- `motion` or `framer-motion` (v12.x+)
- `@mui/material` (v5.x+)
- `uuid` (v9.x+)

---

## 2. Phase 1: Shared Utilities & Infrastructure

### 1.1 New Directory: `bulk_node_modal/`
Create `apps/frontend/src/components/editor/bulk_node_modal/` and populate with:
- `BulkNodeDataModal.jsx`: Port the recursive descendant editing logic.
- `TagInput.jsx`: Integrate the MUI-based hashtag management component.
- `nodeValidationSchema.js`: Centralize validation logic for all node types.
- `MultiListBox.jsx`: Specialized component for bulk field selection.

### 1.2 Utility Synchronization
- **File:** `apps/frontend/src/components/editor/exercise_modal/helpers.js`
- **Action:** Sync `generateId` and `generateFieldNameFromLabel` with the Web version to ensure consistency in field naming and unique ID generation.

---

## 3. Phase 2: State Management Updates

### 2.1 Update `flowState.js`
- **File:** `apps/frontend/src/components/frontend/src/state/flowState.js`
- **Add Action:** `bulkUpdateNodeData(nodeId, propertyName, value)`
  ```javascript
  bulkUpdateNodeData: (nodeId, propertyName, value) => {
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, [propertyName]: value } }
          : node
      ),
    }));
  }
  ```
- **Review Persistence:** Ensure any bulk updates trigger the Tauri-specific persistence bridge (e.g., `invoke('save_intervention', ...)`).

---

## 4. Phase 3: Core Editor Component Upgrades

### 3.1 Template Updates (`editor.jsx`)
- **Action:** Update `dataTemplates` for `phase`, `micro`, and `session` nodes to include the `tags: ""` property.
- **Action:** Implement `getAllDescendants` helper function if missing.
- **Action:** Integrate `onOpenBulkEditRequest` prop to trigger the new `BulkNodeDataModal`.

### 3.2 Context Menu Enhancements
- **Action:** Update `NodeMenu.jsx` to include `inspectorConditional` logic and new menu items for "Inspect Node" and "Exercises/Activities".
- **Action:** Sync `PaneMenu.jsx` clipboard logic (Cut/Copy/Paste/Paste Special).

### 3.3 Node Rendering (`nodes.jsx`)
- **Action:** Ensure `SessionNode` supports dynamic rendering of activities/exercises based on the new mangled key structure.
- **Action:** Sync the `NodeToolbar` logic for toggling handle positions (`left` vs `top`).

---

## 5. Phase 4: Exercise Modal Sophistication

### 4.1 Tag Filtering Logic
- **File:** `apps/frontend/src/components/editor/exercise_modal/ExerciseModal.jsx`
- **Action:** Implement `nodeDataTags` extraction and `filteredExercises` memoized logic.
- **Action:** Add the tag-selection cloud UI for dynamic template filtering.

### 4.2 Bulk Assign in Exercise Modal
- **Action:** Implement `handleBulkApply` within the modal.
- **Action:** Port `bulkEditOperation` state ('replace' vs 'append').
- **Action:** Integrate the `AnimatePresence` wrapper for smooth UI transitions during bulk assignment.

### 4.3 Persistence Architecture (Persistence Sync)
- **Action:** Update `handleSubmit` to use `createMangledContainerKey` when saving exercise templates.
- **Important:** Ensure the Tauri version handles the `outputData` structure correctly when communicating with the Rust backend.

---

## 6. Phase 5: Verification & Validation

1. **Schema Validation:** Run manual tests to ensure `yup` validation blocks invalid data (e.g., non-numeric sets, invalid HH:MM:SS format).
2. **Recursive Edit Test:** Select an `intervention` node, open Bulk Edit, and verify changes propagate to all nested `sessions`.
3. **Persistence Test:** Save an intervention in Tauri, close the app, and re-open to ensure tags and exercise data are fully reconstructed from the `mangledKey` structure.
4. **Console Audit:** Review `[EditableCell DoubleClick]` and `[ExerciseModal Reconstructing]` logs for debugging synchronization.
