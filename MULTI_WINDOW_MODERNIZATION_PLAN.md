# Fulcrum Modernization Plan: Multi-Window & Rust-Synced State

This document outlines the architectural shift from a single-window React Flow diagram editor to a multi-window, VS Code-style desktop application.

## 🎯 Vision
- **UI Paradigm**: Replace the node-based React Flow canvas with a chronological "Side Bar" (using `react-complex-tree`) and a central, high-performance "Session Editor".
- **Window Management**: Support dragging tabs into independent OS windows (multi-WebView instances).
- **State Synchronization**: Maintain the speed of **Zustand** for React lifecycle updates while using the **Tauri Rust Backend** as the central event broadcaster and persistence layer to keep all windows in sync.

---

## 🏗️ Architecture: "Optimistic Zustand + Rust Broadcast"

### 1. Frontend (Zustand)
- **Role**: Immediate reactivity and local UI state.
- **Sync Logic**: When an action occurs (e.g., `updateSession`), the local Zustand store updates optimistically for instant UI feedback, then calls a Tauri command: `invoke('sync_update', payload)`.
- **Listeners**: Every window's Zustand store listens for a global `state-sync` event from Rust to patch its local state when changes occur in other windows.

### 2. Backend (Tauri / Rust)
- **Role**: The "Source of Truth" and State Router.
- **Sync Engine**: Receives `sync_update` commands and immediately executes `app.emit_all("state-sync", payload)` to notify every open window.
- **Persistence**: Handles synchronous and asynchronous save/load operations to the local file system (AppData), replacing the unreliable `localStorage` persistence in multi-window environments.

---

## ✅ POC Status (Completed)
We have successfully implemented and verified a Proof of Concept:
- **Rust Backend**: Implemented `PocState` with `Mutex` protection and event broadcasting.
- **Multi-Window**: Verified that spawned windows (`WebviewWindowBuilder`) receive events and update their local stores instantly.
- **Custom Framing**: Integrated `CustomFrame` with `decorations(false)` and `data-tauri-drag-region` for a native-feel frameless UI.
- **Lifecycle**: Main window closure correctly triggers a full application exit.

---

## 🚀 Next Phases

### Phase 1: Core Domain Migration
- **Modular Stores**: Break the monolithic `flowState.js` into domain-specific Zustand stores: `usePatientStore`, `useInterventionStore`, `useSessionStore`.
- **Rust Models**: Define robust Rust structs (using `serde`) for `Patient`, `Intervention`, and `Session` to support deep-syncing and validation.
- **Global Persistence**: Implement the Rust-based file saving system for these real models.

### Phase 2: Editor Rebuild
- **Sidebar Integration**: Implement `react-complex-tree` for intervention navigation.
- **Session Editor**: Build the main editing interface (replacing the current node inspectors).
- **Cleanup**: Remove `@xyflow/react` and all legacy node/edge logic once the tree-based navigation is stable.

### Phase 3: Docking & Tab Management
- Integrate a docking library (e.g., `flexlayout-react`) to handle the "drag-to-separate-window" UX.
- Implement the "Window Restoration" logic to remember window positions and open tabs across restarts.

---

## 🛠️ Technical Debt & Notes
- **Tauri Permissions**: Ensure `tauri.conf.json` continues to allow all windows (`"windows": ["*"]`) to access core window commands.
- **Concurrency**: Monitor `std::sync::Mutex` usage in Rust; if high-frequency edits cause lag, migrate to `tokio::sync::RwLock`.
- **Routing**: Use `?window=type` query parameters in `App.jsx` to route different window types (e.g., `editor`, `profile`, `sandbox`).
