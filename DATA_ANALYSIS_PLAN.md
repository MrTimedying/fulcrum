# Data Analysis Module - Implementation Roadmap

This document outlines the architecture, components, and implementation progress of the Data Analysis suite in Fulcrum.

## 1. Objective
Provide movement science experts with granular, hierarchical insights into training interventions, leveraging semantic tags and variant-based exercise data.

## 2. System Architecture

### A. Infrastructure Layers (The Engine)
- **`useAnalyticsStore.ts`**: Global state for tracking analysis focus (`focusNodeId`, `focusNodeType`) and UI preferences (`granularity`, `filters`).
- **`DataAggregator.js`**: Logic engine for parsing variant strings (e.g., `10;12;10;`) and calculating Volume Load/Intensity across the hierarchy.
- **`tagTreeUtils.js`**: Data transformation layer for hierarchical UI rendering.

### B. Modular Components (Frontend Suite)
- **`DataAnalysisSidebar`**: High-level control center with collapsible panels for Intervention Selection, Structural Navigation, and Metric Filtering.
- **`AnalysisDashboard`**: Context-aware main view that dynamically adjusts visualizations based on the selected focus level.
- **`TrendChart`**: Time-series visualization for volume and intensity progression.
- **`DistributionChart`**: Categorical breakdown of work using exercise tags (e.g., `#power`, `#leg`).
- **`SummaryGrid`**: KPI overview for the focused training block.

---

## 3. Implementation Roadmap

### Phase 0: Cleanup & Preparation 
- Removed legacy data analysis modules.
- Defined the unified directory structure for analytics.

### Phase 1: Core Navigation & State 
- Integrated "Data Analysis" into the global `IconBar`.
- Implemented `useNavigationStore` module switching.
- Created `useAnalyticsStore` for decoupled analysis focus.

### Phase 2: Structural Navigation Tree 
- Implemented recursive tree view in the sidebar.
- Added hierarchical selection logic (Intervention > Phase > Microcycle > Session > Exercise).

### Phase 3: Data Aggregation & Logic 
- Developed the `DataAggregator` for parsing complex exercise variables.
- Implemented hierarchical volume/intensity summation.
- Bound real training data to the `AnalysisDashboard` charts.

### Phase 4: Enhanced Control & UI 
- [x] Implement collapsible sidebar panels (VS Code style).
- [x] Restore Intervention Dropdown selector.
- [x] Implement Tag-based multi-filter logic.
- [x] Restore Metric-specific toggles.

### Phase 5: High-Performance Rust Offloading 
- [x] Offload heavy aggregation math to Tauri/Rust.
- [x] Implement Acute-to-Chronic Workload Ratio (ACWR) in Rust.
- [x] Longitudinal cross-intervention analysis.

---

## 4. Current Status
- **Core Engine**: 100% Functional (Rust-powered).
- **UI Shell**: 100% (Collapsible sidebar, hierarchical navigation).
- **Data Fidelity**: High (Handles variant strings, semantic tags, and ACWR).
- **Overall Completion**: 100% of the initial suite scope.
- **Last Updated**: 2024-05-24
