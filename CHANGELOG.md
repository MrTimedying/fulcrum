# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
