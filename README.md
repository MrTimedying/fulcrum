# Fulcrum

Fulcrum is a comprehensive management software for movement science experts. It leverages flow diagrams for intervention creation and patient management, including a powerful data analysis component to track progress and outcomes.

## Key Features

- **Intervention Creation**: Design complex interventions using an intuitive flow-based interface.
- **Patient Management**: Maintain detailed records and track patient progress over time.
- **Data Analysis (v1.1.0)**:
    - **Explorer Panel**: Integrated intervention selection and hierarchical browsing of patient data.
    - **Guided Workflow**: A 3-step setup (Intervention → Focus → Metrics) using the `AnalysisWorkflowPlaceholder` for intuitive navigation.
    - **Dynamic Dashboard**: Modern, responsive UI with real-time reactivity and clean data visualization.
    - **Exercise Mapping**: Improved accuracy in exercise data representation.
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
