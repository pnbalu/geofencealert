# Geofence Alert Desktop Application

A modern desktop application for monitoring geofences and tracking location-based alerts. Built with Electron, React, TypeScript, and Tailwind CSS.

## Features

- 🗺️ **Geofence Management**: Create, edit, and delete geofences with different types (Factory, School, Construction, Custom)
- 📍 **Real-time Location Tracking**: Monitor your current location with configurable update intervals
- 🔔 **Smart Alerts**: Get notified when entering or exiting geofenced areas
- 📊 **Dashboard**: View real-time statistics and recent activity
- 🎨 **Modern UI**: Beautiful, responsive interface with dark mode support
- 💾 **Local Data Storage**: All data stored locally for privacy and security
- ⚙️ **Customizable Settings**: Configure tracking intervals, notifications, and more

## Use Cases

- **Factory Monitoring**: Track employee entry/exit from restricted areas
- **School Safety**: Monitor student movement within school boundaries
- **Construction Sites**: Ensure safety compliance and access control
- **Custom Applications**: Any scenario requiring location-based monitoring

## Technology Stack

- **Frontend**: React 18 + TypeScript
- **Desktop Framework**: Electron
- **Styling**: Tailwind CSS + Framer Motion
- **State Management**: Zustand
- **Build Tool**: Vite
- **Icons**: Lucide React

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd geofencealert
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

## Building for Production

### Build for all platforms:
```bash
npm run dist
```

### Build for specific platforms:
```bash
# Windows
npm run dist:win

# macOS
npm run dist:mac

# Linux
npm run dist:linux
```

## Project Structure

```
geofencealert/
├── src/
│   ├── main/                 # Electron main process
│   │   ├── main.ts          # Main process entry point
│   │   └── preload.ts       # Preload script for secure IPC
│   ├── components/          # React components
│   │   ├── Dashboard.tsx    # Main dashboard view
│   │   ├── GeofenceManager.tsx
│   │   ├── AlertHistory.tsx
│   │   ├── SettingsPanel.tsx
│   │   └── ...
│   ├── stores/              # Zustand state management
│   │   ├── geofenceStore.ts
│   │   └── locationStore.ts
│   ├── types/               # TypeScript type definitions
│   └── App.tsx              # Main React component
├── dist/                    # Built application
└── release/                 # Packaged executables
```

## Usage

### Creating Geofences

1. Navigate to the "Geofences" tab
2. Click "Add Geofence"
3. Fill in the details:
   - **Name**: Descriptive name for the geofence
   - **Type**: Choose from Factory, School, Construction, or Custom
   - **Location**: Set latitude and longitude coordinates
   - **Radius**: Define the geofence boundary in meters
   - **Color**: Choose a color for visual identification

### Monitoring

1. Start location tracking from the sidebar
2. The app will continuously monitor your location
3. Alerts will be generated when entering or exiting geofenced areas
4. View alerts in the "Alerts" tab

### Settings

Configure the application behavior in the "Settings" tab:
- **Update Interval**: How often to check location (1s - 1min)
- **Notifications**: Enable/disable desktop notifications
- **High Accuracy**: Use GPS for precise location data
- **Auto-start**: Automatically begin tracking when app opens

## Privacy & Security

- All location data is stored locally on your device
- No data is transmitted to external servers
- Location permissions are required for functionality
- You can revoke permissions at any time through system settings

## Development

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run dist` - Package for distribution
- `npm run dev:renderer` - Start Vite dev server
- `npm run dev:main` - Start Electron main process

### Code Style

The project uses:
- TypeScript for type safety
- ESLint for code linting
- Prettier for code formatting
- Tailwind CSS for styling

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and feature requests, please use the GitHub issue tracker.

---

Built with ❤️ using modern web technologies
