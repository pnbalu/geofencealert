# Geofence Alert Desktop Application

A modern desktop application for monitoring geofences and tracking location-based alerts. Built with Electron, React, and modern web technologies.

> **Note**: This is the frontend (desktop) component of the Geofence Alert project. For the full project overview, see the root `README.md`.

## Quick Links

- [Quick Start Guide](./QUICKSTART.md) - Get up and running in minutes
- [Setup Instructions](./SETUP.md) - Detailed setup guide
- [Troubleshooting](./TROUBLESHOOTING.md) - Common issues and solutions
- [Project Root](../README.md) - Full project documentation

## Installation

1. Make sure you're in this directory (frontend):
```bash
# If you're in the root directory
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Configure map provider (optional):
   - Create a `.env` file in this directory (use `env.example` as a template)
   - Add the following configuration:
   ```
   VITE_MAP_PROVIDER=google
   VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
   ```
   - Options for `VITE_MAP_PROVIDER`: `google` (default) or `openstreetmap`
   - Default Google Maps API key: `AIzaSyC2dz15lOn8v9mFHT6YQ8bSi85WqRaK6oA`

4. Start development server:
```bash
npm run dev
```

> **Note**: On first run, default admin credentials are `admin` / `Admin@123`. You must change the password on first login.

## Building for Production

Build for all platforms:
```bash
npm run dist
```

Build for specific platforms:
```bash
npm run dist:win    # Windows
npm run dist:mac    # macOS
npm run dist:linux  # Linux
```

## Project Structure

```
frontend/
├── src/
│   ├── main/                 # Electron main process
│   │   ├── main.js          # Main process entry point
│   │   └── preload.cjs      # Preload script for secure IPC
│   ├── components/          # React components
│   │   ├── Dashboard.jsx    # Main dashboard view
│   │   ├── Geofences.jsx    # Geofence management
│   │   ├── AlertHistory.jsx # Alert history view
│   │   ├── AlertConfiguration.jsx # Alert configuration
│   │   ├── Groups.jsx       # User group management
│   │   ├── UserManager.jsx  # User management
│   │   └── ...              # Other components
│   ├── stores/              # Zustand state management
│   │   ├── geofenceStore.js
│   │   ├── locationStore.js
│   │   ├── authStore.js
│   │   └── ...              # Other stores
│   ├── utils/               # Utility functions
│   └── App.jsx              # Main React component
├── dist/                    # Built application
├── scripts/                 # Build scripts
├── package.json             # Dependencies and scripts
├── vite.config.js           # Vite configuration
└── tailwind.config.js       # Tailwind CSS configuration
```

## Features

- 🔐 **Authentication**: Secure login with admin-only access
- 🗺️ **Geofence Management**: Create, edit, and manage geofences
- 📍 **Location Tracking**: Real-time location monitoring
- 🔔 **Smart Alerts**: Configurable alerts for geofence events
- 👥 **User & Group Management**: Comprehensive user and group management
- 🏢 **Organization Management**: Multi-organization support
- 📊 **Dashboard**: Real-time statistics and insights
- 🎨 **Modern UI**: Beautiful interface with dark mode

For complete documentation, see the root [README.md](../README.md).
