# Fulcrum Tauri: State Modernization & Feature Integration Roadmap

This document serves as the official implementation guide for upgrading the **Fulcrum Tauri** application's state management. It integrates functional improvements from the Electron version (like enhanced layout and bulk updates) with the architectural vision of the **Fulcrum Modernization Roadmap**.

## 🎯 Primary Goals
1.  **De-monolith**: Break the 1,600+ line `flowState.js` into modular, domain-specific stores.
2.  **Feature Injection**: Port missing Electron functionalities (`bulkUpdateNodeData`, `LR` hybrid layout, stable resequencing).
3.  **Type Safety**: Transition to TypeScript for all state definitions and actions.
4.  **Local-First Integrity**: Maintain synchronous, local-first operations critical for clinical workflows.

---

## 🏗️ Phase 1: Modular Infrastructure (0-1 Month)
**Objective**: Set up the new store structure and move non-diagram data out of the flow logic.

### 1.1 Store Directory Setup
Create the modular structure in `@fulcrumtauri/apps/frontend/src/state/`:
- `core/`: `usePatientStore.ts`, `useInterventionStore.ts`
- `flow/`: `useFlowDiagramStore.ts`, `useHistoryStore.ts`
- `utils/`: `layoutEngine.ts`, `resequence.ts`

### 1.2 Core Store Extraction
- **Patient Store**: Move `patients` object and CRUD operations.
- **Intervention Store**: Move `interventions` and exercise/phase management.
- **New Feature**: Implement `bulkUpdateNodeData(nodeId, property, value)` using Lodash path syntax for surgical data updates.

### 1.3 History System (Cross-Store)
- **Task**: Extract `contextualMemory` and `undo/redo` logic.
- **Strategy**: Implement a "Coordinated Undo" pattern where `useHistoryStore` can capture snapshots across multiple domain stores synchronously.

---

## 🚀 Phase 2: Flow Logic Modernization (1-2 Months)
**Objective**: Implement the advanced diagram features while keeping the store lean.

### 2.1 The New `useFlowDiagramStore`
Inject the following improvements from the Electron version:
- **Direction-Aware Hybrid Layout**: Update `hybridLayout` to support both `TB` (Top-Bottom) and `LR` (Left-Right) directions.
- **Stable Resequencing**: Port the improved `resequenceSiblingOrders` with strict null/undefined safety for the `data.order` property.
- **Smart Paste**: Include viewport-aware positioning and automatic order clearing for pasted nodes.

### 2.2 Layout Engine Extraction
Extract ELK configuration and layout logic into `@fulcrumtauri/apps/frontend/src/state/utils/layoutEngine.ts`. This removes heavy ELK dependencies from the primary store file.

---

## 🧪 Phase 3: Component & Architecture Refactoring (2-3 Months)
**Objective**: Transition components to the modular hooks and implement domain-driven folders.

### 3.1 Hook Migration
Refactor UI components to consume granular stores:
```javascript
// Migration Example
// FROM:
const { nodes, addPatient } = useFlowStore();

// TO:
const nodes = useFlowDiagramStore(s => s.nodes);
const addPatient = usePatientStore(s => s.addPatient);
```

### 3.2 Domain Restructuring
Organize the codebase by domain (Patients, Interventions, Flow) as outlined in the modernization roadmap:
- `src/domains/patients/` (Components, Hooks, Store)
- `src/domains/workflows/` (Diagram logic)

---

## 💾 Phase 4: Persistence & Data Safety
**Objective**: Ensure the transition doesn't lose user data.

### 4.1 Selective Persistence
Update the `persist` middleware for each new store:
- **PatientStore**: Full persistence.
- **FlowDiagramStore**: Persist `nodes`/`edges` keyed by `patientId`.
- **TransientStore**: Disable persistence for UI state (modals, toggles).

### 4.2 Migration Layer
Implement a one-time migration utility that detects the legacy `flow-store` localStorage key and redistributes the data into the new granular store keys (`patient-store`, `flow-diagram-store`).

---

## 📋 Technical Checklist

| Feature | Category | Implementation Priority |
| :--- | :--- | :--- |
| **`bulkUpdateNodeData`** | Node Data | High |
| **`LR` Hybrid Layout** | Visualization | High |
| **Modular Store Split** | Architecture | Critical |
| **TypeScript Migration** | Type Safety | Medium |
| **Auto-Resequencing** | Stability | Medium |
| **Cross-Store History** | UX | High |

---

## ⚠️ Tauri-Specific Implementation Notes
- **Performance**: ELK layout operations are asynchronous. Ensure they are handled as Promises to prevent blocking the Tauri main thread.
- **Storage**: Since Tauri utilizes `tauri-plugin-store` for some desktop-native persistence, ensure the Zustand `persist` middleware is correctly configured to interface with the Tauri storage backend if local storage is not preferred.
