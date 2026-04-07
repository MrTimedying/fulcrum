# Fulcrum

Fulcrum is a comprehensive management software for movement science experts. It leverages flow diagrams for intervention creation and patient management, including a powerful data analysis component to track progress and outcomes.

## Key Features

- **Intervention Creation**: Design complex interventions using an intuitive flow-based interface.
- **Session Editor & Data Analysis (v1.6.2)**: 
    - **Unified Exercise Data Schema**: Improved backward compatibility for manually created and generated plans, ensuring seamless loading in the Session Editor and correct rendering in the Data Analysis tree.
- **Intervention Explorer (v1.6.0)**:
    - **Tree Component Migration**: Transitioned to `react-complex-tree` for improved tree management and stability.
    - **Virtualization**: Integrated list virtualization in sidebars to handle hundreds of nodes without performance degradation.
    - **Inline Management**: Support for double-click renaming of all hierarchical nodes (Phases, Microcycles, Sessions).
    - **Context Actions**: Right-click menus for Duplicate, Delete, and "Save as Template" directly from the tree view.
    - **Visual Drag & Drop**: Enhanced D&D with visual insertion indicators and robust hierarchical validation.
    - **Optimized organization**: Multi-select support and "Unassigned Sessions" auto-folder for efficient intervention planning.
- **Patient Profile (v1.3.0)**:
    - **Refined Layout**: Switched to a `SplitPane` design with a vertical, collapsible ICF dimensions overview and a detailed personal data panel.
    - **Consistent UX**: Redesigned interface to align with the Session Editor's look and feel.
    - **Dark Theme**: Enhanced styling with a minimalistic `zinc-900` dark theme and refined typography.
    - **ICF Integration**: Streamlined access to ICF dimensions and sets management within the profile.
- **Data Analysis**:
    - **Enhanced Explorer**: Updated sidebar with a non-collapsible Explorer tree showing only the selected intervention's hierarchy for better state management.
    - **Hierarchical Aggregation**: Fixed dashboard triggers to correctly aggregate and display metrics across Interventions, Phases, and Microcycles.
    - **Improved UI/UX**: Responsive sidebar layout with dynamic resizing and a collapsible "Analytics Setup" panel.
    - **Context-Aware Title Bar**: Application title bar now displays the active patient's name and surname for better navigation context.
    - **Guided Workflow**: A 3-step setup (Intervention → Focus → Metrics) using the `AnalysisWorkflowPlaceholder` for intuitive navigation.
- **Desktop Application**: Built with Tauri for a performant and secure desktop experience.

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, Headless UI, Heroicons, Recharts, Zustand.
- **Backend/Desktop**: Tauri (Rust), SQLite (via Tauri plugins/Rust).
- **Monorepo Management**: pnpm.

## Getting Started

### Prerequisites

- Node.js (v18+)
- pnpm
- Rust and Cargo (for Tauri development)

### Installation

```bash
pnpm install
```

### Development

To run the app in development mode:

```bash
pnpm dev
```

To run the Tauri desktop application:

```bash
pnpm tauri:dev
```

### Building

To build the frontend:

```bash
pnpm build
```

To build the Tauri application:

```bash
pnpm tauri:build
```

## License

Copyright © 2024 Antonio Logarzo. Licensed under **CC BY-NC-ND 4.0 Deed**.
