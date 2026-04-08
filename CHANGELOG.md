# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.8.0] - 2026-04-20

### Added
- **Session Editor UI/UX**: Integrated `ExerciseDataDisplay` and `ExerciseOverviewList` for an improved left panel experience.
- **Session Editor Legenda**: Added an interactive Legenda for better clarity during session editing.
- **Data Analysis Suite**: Completed the second iteration of the data analysis suite implementation, featuring significant UI and UX improvements.

### Changed
- **Sidebar Tree Logic**: Refactored the tree logic in sidebars to utilize custom components for better maintainability and performance.
- **Phase & Micro Panel**: Minor improvements to the phase and micro panel overviews.

### Fixed
- **Data Analysis State**: Fixed an important state bug in the Data Analysis layer and adjusted the UI manually.

## [1.7.0] - 2026-04-18

### Added
- **Session Editor - Field Guide**: Introduced a dynamic, collapsible "Field Guide" container in the Session Editor. This feature provides real-time tips, syntax rules, and descriptions for input fields based on user focus and hover events.
- **Interactive Guidance**: Updated the `Field` component to support focus/hover event bubbling, enabling a responsive and context-aware guidance system.
- **Schema-Driven Documentation**: The guide is populated with precise data derived from project validation schemas, including:
    - Semicolon-separated lists for repetitions.
    - Specific `HH:MM:SS` formats for durations.
    - Hashtag-prefixed tags for better organization.

## [1.6.2] - 2026-04-16

### Fixed
- **Exercise Data Schema**: Unified the exercise data schema between the Session Editor and the Domain Model.
    - `SessionEditor.jsx` now detects Domain Schema objects on load and automatically constructs a `fields` array for the UI to render them.
    - Updated `debouncedSave` in `SessionEditor.jsx` to save a unified schema containing top-level properties (`id`, `name`, `sets`, `reps`, `duration`, `intensity`) alongside the dynamic `fields` array.
    - Added a fallback in `DataAnalysisSidebar.jsx`'s `renderExercise` to extract the exercise name from the mangled key if the `name` property is missing, ensuring backward compatibility.

## [1.6.1] - 2026-04-14

### Fixed
- **react-complex-tree Migration**: Fixed Rules of Hooks violation in `NodeRenderer`.
- **Tree Reactivity**: Implemented `StaticTreeDataProvider` to ensure correct state synchronization and reactivity within the tree.

## [1.6.0] - 2026-04-12

### Changed
- **Tree Component Refactoring**: Refactored tree dependencies, replacing `@headless-tree` with `react-complex-tree` for `InterventionsSidebar` and `DataAnalysisSidebar`.
- **Data Structures**: Refactored `tagTreeUtils.js` to conform to the new `react-complex-tree` data structures.

## [1.5.0] - 2026-04-10

### Added
- **Headless Tree Integration**: Fully transitioned to `react-headless-tree` for sidebar management, replacing the legacy tree implementation.
- **Virtualization**: Implemented list virtualization in `InterventionsSidebar` and `DataAnalysisSidebar` to ensure smooth performance with large trees.
- **Inline Renaming**: Added support for inline renaming of Phases, Microcycles, and Sessions via double-click or context menu.
- **Context Menus**: Added comprehensive right-click context menus for all tree nodes, including:
    - **Duplicate**: Quickly clone existing structures (Phases, Microcycles, Sessions).
    - **Delete**: Remove nodes with confirmation.
    - **Save as Template**: Direct access to the hierarchical templating system.
- **Enhanced Drag & Drop**:
    - Added visual feedback for drop targets with insertion indicators.
    - Improved structural validation to maintain strict hierarchy (Intervention > Phase > Microcycle > Session).
- **Store Extensions**:
    - Added `renameNode` for atomic name updates in `useInterventionStore`.
    - Added `duplicateNode` for deep cloning of hierarchical nodes.
    - Added `addTemplateFromNode` to streamline creating reusable templates directly from the tree.

### Changed
- Optimized sidebar rendering logic for better responsiveness and lower memory overhead.
- Unified tree interaction patterns across both Interventions and Data Analysis sidebars.

## [1.4.1] - 2026-04-07

### Changed
- Improved performance and robustness of the tree drag-and-drop functionality.

### Fixed
- Fixed `SyntaxError` in `InterventionsSidebar.jsx` caused by an incorrect icon import.

## [1.4.0] - 2024-05-30

### Added
- **Hierarchical Templater**: Added support for saving and loading templates for Phases and Microcycles.
    - Users can now save a complete Phase or Microcycle structure (including all nested sessions and exercises) as a reusable template.
    - New "Save as Template" button in `PhasePanel` and `MicroPanel` overviews.
    - `TemplaterModal` updated to categorize and display Phase and Microcycle templates alongside existing exercise templates.
- **Tree Drag-and-Drop Improvements**:
    - Implemented strict hierarchical validation for the Interventions sidebar tree.
    - Sessions can now be moved between Microcycles or moved to a new "Unassigned Sessions" folder.
    - Microcycles can be moved between different Phases.
    - Phases can be reordered within an Intervention.
    - Added multi-select support for bulk operations within the tree.
    - Added an "Unassigned Sessions" folder to automatically collect sessions not yet linked to a Microcycle.

### Changed
- Improved `tagTreeUtils.js` with recursive building logic for complex hierarchical templates.
- Enhanced `InterventionsSidebar` with a height-aware layout using `ResizeObserver` for better tree rendering.

## [1.3.0] - 2026-04-07

### Added
- Implemented `IcfOverview.jsx` and `IcfDimensionCollapsible.jsx` components for the new Patient Profile.
- Added a stylized placeholder UI when no patient is selected.

### Changed
- Redesigned Patient Profile (`profile.jsx`) with a `SplitPane` layout to align with the Session Editor's UX.
- Updated Patient Profile layout to feature a vertical, collapsible ICF dimensions overview and a detailed personal data panel.
- Refined styling for `PatientDetails.jsx` and `profile.jsx` using a minimalistic dark theme (`zinc-900`) and improved typography.
- Restored and integrated access to `ICFSetsModal` within the new Profile interface.

### Fixed
- Fixed BMI calculation logic in `PatientDetails.jsx`.

## [1.2.0] - 2025-02-14

### Added
- Added patient information (name and surname) to the application title bar for better context during navigation.
- Implemented a placeholder in the Data Analysis Explorer for when no intervention is selected.

### Changed
- Refactored Data Analysis sidebar layout: the Explorer tree is now non-collapsible and occupies the full available height.
- The "Analytics Setup" panel in the Data Analysis sidebar is now collapsible at the bottom.
- Improved Data Analysis Explorer to show only the selected intervention's hierarchy, preventing state disruption when switching between patients.
- Implemented dynamic resizing for the Data Analysis tree component to adjust to the "Analytics Setup" panel's expansion state.

### Fixed
- Fixed a bug in Data Analysis where only session-level selection would trigger the dashboard. Metrics are now correctly aggregated and displayed when selecting an Intervention, Phase, or Microcycle.

## [1.1.0] - 2024-05-24

### Added
- Integrated intervention selection into the Explorer panel in the Data Analysis sidebar.
- Implemented `AnalysisWorkflowPlaceholder` for a guided 3-step setup (Intervention → Focus → Metrics) in the Data Analysis dashboard.

### Changed
- Renamed "Hierarchy" to "Explorer" in the Data Analysis sidebar.
- Removed "Granularity" control and separate "Intervention" panel from the Data Analysis sidebar for a more streamlined experience.
- Improved Data Analysis sidebar layout with flexbox and internal scrolling for better responsiveness.
- Compacted headers and updated styles for a cleaner UI in the Data Analysis sidebar.
- Updated Data Analysis dashboard color palette to `bg-zinc-900` for consistency with the overall app theme.
- Improved Data Analysis dashboard summary card and header styles with backdrop-blur.
- Improved tree selection reactivity and synchronization with `useAnalyticsStore`.
- Updated Data Analysis dashboard to display clean exercise names instead of internal keys.

### Fixed
- Fixed exercise node mapping in `tagTreeUtils.js` to correctly handle `session.exercises` as an object, ensuring accurate data representation in the explorer.

## [1.0.1] - 2024-03-20

### Fixed
- Internal bug fixes and stability improvements.

## [1.0.0] - 2024-03-01

### Added
- Initial release of Fulcrum.
- Intervention creation with flow diagrams.
- Patient management system.
- Basic data analysis component.
- Tauri-based desktop application.
