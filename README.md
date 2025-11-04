# Geofence Alert - Multi-Platform Application

A comprehensive geofence monitoring and alert system with desktop and mobile applications. Built with Electron, React, and modern web technologies.

## Project Structure

```
geofencealert/
├── frontend/              # Desktop Electron Application
│   ├── src/               # Source code
│   ├── dist/              # Built application
│   ├── package.json       # Dependencies and scripts
│   └── README.md          # Frontend documentation
├── mobile/                # Mobile Application (Coming Soon)
│   └── README.md          # Mobile documentation
├── README.md              # This file - Project overview
├── QUICKSTART.md          # Quick setup guide
├── SETUP.md               # Detailed setup instructions
├── TROUBLESHOOTING.md     # Common issues and solutions
└── MIGRATION.md           # Project restructuring guide
```

> **Note**: This project has been restructured! If you're upgrading from an older version, see [MIGRATION.md](./MIGRATION.md) for details.

## Features

- 🔐 **Authentication System**: Secure login with role-based access control (Admin only for desktop app)
- 🏢 **Organization Management**: Multi-organization support with user assignments
- 👥 **User Management**: Invite users with auto-generated passwords and first-time password change
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

### Desktop Application (Frontend)
- **Framework**: React 18 + JavaScript
- **Desktop**: Electron
- **Maps**: Leaflet with Google Maps or OpenStreetMap tiles (configurable via .env)
- **Authentication**: Zustand with persistent storage
- **Styling**: Tailwind CSS + Framer Motion
- **State Management**: Zustand
- **Build Tool**: Vite
- **Icons**: Lucide React

### Mobile Application
- Coming soon

## Quick Start

### Desktop Application (Frontend)

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Configure map provider (optional):
   - Create a `.env` file in the `frontend` directory
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

### Mobile Application

The mobile application is currently under development. See `mobile/README.md` for details.

## Building for Production

### Desktop Application

Navigate to the frontend directory and run:

```bash
cd frontend

# Build for all platforms
npm run dist

# Build for specific platforms
npm run dist:win    # Windows
npm run dist:mac    # macOS
npm run dist:linux  # Linux
```

## Project Structure (Detailed)

### Frontend (Desktop Application)

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
│   │   ├── AlertConfiguration.jsx
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

### Mobile

```
mobile/
├── README.md                # Mobile documentation
└── (Coming soon...)        # Mobile app source code
```

## Authentication & First Time Setup

### Initial Login

**Default Credentials (First Launch Only):**
- **Username:** `admin`
- **Password:** `Admin@123`

1. On first launch, the app will automatically create a default admin user
2. Use the credentials above to log in
3. You'll be prompted to change your password immediately
4. Create a strong password (min 8 chars, uppercase, lowercase, number, special char)

> **Important:** Change the default password immediately after first login for security!

### Authentication Features

- **Admin-Only Access**: Only users with "admin" role can access the desktop application
- **Secure Password Storage**: Passwords are hashed before storage
- **First-Time Password Change**: Invited users must change their password on first login
- **Session Persistence**: Login state persists across app restarts
- **Logout**: Use the logout button in the header to sign out

### User Invitation

To invite a new admin user:

1. Navigate to Users page (after logging in)
2. Click "Invite User" button
3. Fill in user details:
   - Name and Email (required)
   - Role: Select "Administrator"
   - Department: Select appropriate department
4. Click "Send Invite"
5. **Important**: Save the generated credentials shown
6. Share credentials securely with the new user
7. User must change password on first login

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

### Available Scripts (Frontend)

From the `frontend` directory:

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run dist` - Package for distribution
- `npm run dev:renderer` - Start Vite dev server
- `npm run dev:main` - Start Electron main process

### Code Style

The project uses:
- JavaScript for desktop application
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
