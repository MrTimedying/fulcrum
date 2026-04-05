# Fulcrum Electron to Tauri Migration Guide

## Overview

This document outlines the migration process from the legacy Electron-based Fulcrum application to a modern Tauri-based desktop application using a pnpm monorepo structure.

## Project Structure

```
fulcrumtauri/
├── legacy/                    # Original Electron application
│   ├── client/               # React frontend (legacy)
│   ├── electron/             # Electron main process
│   └── package.json          # Legacy dependencies
├── apps/
│   ├── frontend/             # New React frontend (Tauri-compatible)
│   │   ├── src/
│   │   │   ├── utils/
│   │   │   │   └── tauri-api.js  # Tauri API wrapper
│   │   │   ├── App.jsx       # Migration test interface
│   │   │   └── ...
│   │   ├── package.json      # Frontend dependencies
│   │   └── vite.config.js    # Vite configuration
│   └── tauri/                # Tauri desktop application
│       ├── src-tauri/        # Rust backend
│       │   ├── src/
│       │   │   ├── encryption.rs  # Encryption utilities
│       │   │   ├── state.rs       # State management
│       │   │   └── lib.rs          # Main Tauri commands
│       │   ├── Cargo.toml    # Rust dependencies
│       │   └── tauri.conf.json    # Tauri configuration
│       └── package.json      # Tauri build scripts
├── package.json              # Root workspace configuration
└── pnpm-workspace.yaml       # pnpm workspace definition
```

## Migration Status

### ✅ Completed

1. **Monorepo Setup**: pnpm workspace with `apps/frontend` and `apps/tauri`
2. **Tauri Backend**: Basic Rust backend with core commands
3. **Window Management**: Minimize, maximize, close functionality
4. **State Management**: Application state persistence
5. **Version API**: App version retrieval
6. **External URL Opening**: Shell integration for external links
7. **Encryption Module**: AES-256-CBC encryption with keyring storage
8. **Basic Configuration**: Tauri config matching legacy Electron settings

### 🔄 In Progress

1. **Auto-updater**: Basic structure in place, needs GitHub integration
2. **Frontend Migration**: Test interface created, legacy components need migration

### ⏳ Pending

1. **Complete Frontend Migration**: Copy and adapt all legacy React components
2. **IPC Command Completion**: Implement remaining Electron IPC equivalents
3. **Auto-updater Integration**: Full GitHub releases integration
4. **Testing**: Comprehensive testing of all migrated features
5. **Build & Distribution**: Production build configuration
6. **Documentation**: User migration guide

## Key API Mappings

### Electron → Tauri

| Electron API | Tauri Equivalent | Status |
|--------------|------------------|--------|
| `electronAPI.window.minimize()` | `tauriAPI.window.minimize()` | ✅ |
| `electronAPI.window.maximize()` | `tauriAPI.window.maximize()` | ✅ |
| `electronAPI.window.close()` | `tauriAPI.window.close()` | ✅ |
| `electronAPI.state.request()` | `tauriAPI.state.request()` | ✅ |
| `electronAPI.state.save()` | `tauriAPI.state.save()` | ✅ |
| `electronAPI.updater.check()` | `tauriAPI.updater.check()` | 🔄 |
| `electronAPI.updater.download()` | `tauriAPI.updater.download()` | 🔄 |
| `electronAPI.updater.install()` | `tauriAPI.updater.install()` | 🔄 |
| `shell.openExternal()` | `tauriAPI.external.openUrl()` | ✅ |

## Development Commands

### Install Dependencies
```bash
# Install all workspace dependencies
pnpm install:all

# Or install individually
pnpm install                    # Root dependencies
pnpm --filter=fulcrum-frontend install  # Frontend dependencies
pnpm --filter=fulcrum-tauri install     # Tauri dependencies
```

### Development
```bash
# Run frontend development server
pnpm dev

# Run Tauri development (builds frontend + launches desktop app)
pnpm dev:tauri
```

### Building
```bash
# Build frontend for production
pnpm build

# Build Tauri desktop application
pnpm build:tauri
```

## Next Steps for Complete Migration

### Phase 1: Frontend Component Migration
1. **Copy Legacy Components**: 
   - Copy `legacy/client/src/components/` to `apps/frontend/src/components/`
   - Copy `legacy/client/src/state/` to `apps/frontend/src/state/`
   - Copy `legacy/client/src/utils/` to `apps/frontend/src/utils/`

2. **Update API Calls**:
   - Replace all `window.electronAPI` calls with `tauriAPI` imports
   - Update event listeners to use Tauri's event system
   - Test each component individually

3. **Styling Migration**:
   - Copy CSS files and ensure Tailwind compatibility
   - Update any Electron-specific styling

### Phase 2: Advanced Features
1. **Auto-updater Enhancement**:
   - Implement proper GitHub releases integration
   - Add update progress tracking
   - Test update flow

2. **Encryption Integration**:
   - Add encryption commands to Tauri backend
   - Update frontend to use encryption for sensitive data

3. **Error Handling**:
   - Implement comprehensive error handling
   - Add user-friendly error messages

### Phase 3: Testing & Polish
1. **Comprehensive Testing**:
   - Test all migrated features
   - Performance testing
   - Cross-platform testing

2. **Build Optimization**:
   - Optimize bundle size
   - Configure proper app icons and metadata
   - Set up code signing (if needed)

3. **Documentation**:
   - Update user documentation
   - Create deployment guide

## Troubleshooting

### Common Issues

1. **Tauri Commands Not Found**:
   - Ensure commands are registered in `lib.rs`
   - Check command names match between Rust and JavaScript

2. **Build Failures**:
   - Verify Rust toolchain is installed
   - Check Cargo.toml dependencies
   - Ensure frontend builds successfully first

3. **API Errors**:
   - Check browser console for detailed error messages
   - Verify Tauri permissions in `tauri.conf.json`

### Development Tips

1. **Use Tauri Dev Tools**: Right-click in the app and select "Inspect Element"
2. **Check Rust Logs**: Use `log::info!()` in Rust code for debugging
3. **Test APIs Individually**: Use the migration test interface to verify each API

## Resources

- [Tauri Documentation](https://tauri.app/v1/guides/)
- [Tauri API Reference](https://tauri.app/v1/api/js/)
- [Migration from Electron](https://tauri.app/v1/guides/migration/from-electron)
- [pnpm Workspaces](https://pnpm.io/workspaces)

## Support

For migration-specific questions or issues, refer to:
1. This migration guide
2. Tauri community Discord
3. GitHub issues in the project repository 