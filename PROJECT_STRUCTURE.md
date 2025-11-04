# Project Structure Overview

This document describes the complete organization of the Geofence Alert multi-platform application.

## Directory Structure

```
geofencealert/
├── frontend/                  # Desktop Electron Application
│   ├── src/                   # Source code
│   │   ├── main/              # Electron main process
│   │   │   ├── main.js        # Main process entry point
│   │   │   └── preload.cjs    # Preload script for IPC
│   │   ├── components/        # React components
│   │   │   ├── Login.jsx      # Authentication
│   │   │   ├── Dashboard.jsx  # Main dashboard
│   │   │   ├── Geofences.jsx  # Geofence management
│   │   │   ├── AlertConfiguration.jsx
│   │   │   ├── AlertHistory.jsx
│   │   │   ├── Groups.jsx     # User groups
│   │   │   ├── UserManager.jsx
│   │   │   ├── LiveMap.jsx    # Interactive map
│   │   │   └── ...            # Other components
│   │   ├── stores/            # Zustand state management
│   │   │   ├── authStore.js
│   │   │   ├── geofenceStore.js
│   │   │   ├── employeeStore.js
│   │   │   ├── groupStore.js
│   │   │   └── ...            # Other stores
│   │   ├── utils/             # Utility functions
│   │   │   └── electronAPI.js # IPC wrapper
│   │   ├── constants/         # Constants and configurations
│   │   │   └── index.js       # User roles, departments, etc.
│   │   ├── App.jsx            # Main React component
│   │   ├── main.jsx           # React entry point
│   │   └── index.css          # Global styles
│   ├── dist/                  # Built application
│   ├── scripts/               # Build scripts
│   │   ├── dev.js             # Development runner
│   │   └── build-main.js      # Main process builder
│   ├── package.json           # Dependencies and scripts
│   ├── vite.config.js         # Vite configuration
│   ├── tailwind.config.js     # Tailwind CSS config
│   ├── .env                   # Environment variables
│   ├── README.md              # Frontend documentation
│   ├── QUICKSTART.md          # Quick start guide
│   ├── SETUP.md               # Setup instructions
│   └── TROUBLESHOOTING.md     # Troubleshooting guide
│
├── mobile/                    # Mobile Application (Future)
│   └── README.md              # Mobile documentation
│
├── package.json               # Workspace root
├── README.md                  # Project overview
├── QUICKSTART.md              # Quick start guide
├── SETUP.md                   # Setup instructions
├── TROUBLESHOOTING.md         # Troubleshooting guide
├── MIGRATION.md               # Migration notes
└── PROJECT_STRUCTURE.md       # This file
```

## Key Directories Explained

### `frontend/`
The desktop application built with Electron and React:
- **Source Code**: All application logic, components, and state management
- **Build Output**: Compiled and optimized files in `dist/`
- **Configuration**: Build configs, environment variables, and styling
- **Documentation**: Setup, quick start, and troubleshooting guides

### `mobile/`
Future mobile application (React Native, Flutter, or native):
- Currently contains placeholder documentation
- Will house mobile app source code when developed

### Root Level
- **Documentation**: High-level project docs
- **Workspace Config**: Root `package.json` for coordinating frontend/mobile
- **Migration Notes**: Information about project restructuring

## Development Workflow

### Frontend Development

```bash
# From root directory
npm run dev                    # Start dev server
npm run build                  # Build for production
npm run dist                   # Package for distribution
npm run install:frontend       # Install frontend dependencies

# Or from frontend directory
cd frontend
npm run dev                    # Start dev server
npm run build                  # Build for production
npm run dist                   # Package for distribution
```

### Mobile Development

Currently under development. See `mobile/README.md` for details.

## File Organization Principles

1. **Separation of Concerns**: Frontend and mobile are completely separate
2. **Self-Contained**: Each platform has its own dependencies and configuration
3. **Shared Documentation**: Root-level docs provide project overview
4. **Workspace Coordination**: Root `package.json` provides convenient scripts

## Important Notes

- **All dependencies** are installed in `frontend/node_modules/`
- **Environment files** (`.env`) go in `frontend/`
- **Build outputs** go to `frontend/dist/`
- **Data storage** goes to Electron's userData directory
- **No root-level dependencies** - root `package.json` is workspace-only

## Next Steps

1. Mobile app development in `mobile/` directory
2. Shared library for common logic (if needed)
3. Backend API (if cloud sync is needed)
4. Additional platforms as needed

