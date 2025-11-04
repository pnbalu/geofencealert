# Geofence Alert Mobile Application

React Native mobile application for employee location tracking, geofence alerts, and payroll management.

## Features

- **Code-Based Authentication**: Admin provides access code to employees
- **GPS Tracking**: Background location tracking with configurable frequency
- **Schedule-Based Tracking**: Location only sent during working hours
- **Payroll Management**: View salary history and download payslips
- **Alert System**: Receive emergency alerts, salary notifications
- **Work Schedule**: View assigned working hours and days

## Technology Stack

- **Framework**: React Native with Expo SDK 54
- **React**: 18.3.1
- **React Native**: 0.76.3
- **Navigation**: React Navigation (Stack & Bottom Tabs)
- **State Management**: Zustand 5.0
- **UI Library**: React Native Paper 5.12
- **Icons**: Ionicons, Expo Vector Icons
- **Location**: Expo Location 18.0
- **Notifications**: Expo Notifications 0.29
- **Background Tasks**: Expo Task Manager 12.0, Expo Background Fetch 13.0
- **Storage**: Async Storage 1.25

## Installation

1. Install dependencies:
```bash
npm install
```

2. For iOS:
```bash
cd ios && pod install && cd ..
```

3. Start the development server:
```bash
npm start
```

4. Run on device/emulator:
```bash
npm run ios      # iOS
npm run android  # Android
```

## Project Structure

```
mobile/
├── App.js                 # Main app entry point
├── app.json              # Expo configuration
├── babel.config.js       # Babel configuration
├── package.json          # Dependencies
├── src/
│   ├── screens/          # Screen components
│   │   ├── LoginScreen.js
│   │   ├── CodeEntryScreen.js
│   │   ├── DashboardScreen.js
│   │   ├── PayrollScreen.js
│   │   ├── ScheduleScreen.js
│   │   ├── AlertsScreen.js
│   │   ├── ProfileScreen.js
│   │   └── RequestCodeScreen.js
│   └── stores/           # Zustand state stores
│       ├── authStore.js
│       └── settingsStore.js
├── assets/               # Images and fonts
└── README.md
```

## Core Functionality

### 1. Code-Based Access
- Admin generates and distributes unique codes
- Employee enters code to authenticate
- Code fetches employee profile and configuration

### 2. GPS Tracking
- Continuous background location tracking
- Configurable update frequency (from server)
- Sends coordinates based on work schedule
- Stops when new code is issued

### 3. Background Scheduler
- Runs in background using Expo Task Manager
- Respects update frequency setting
- Only tracks during scheduled hours
- Handles battery optimization

### 4. Notifications
- Emergency alerts with sound
- Salary credit notifications
- Schedule updates
- Push notification support

### 5. Payroll
- View monthly salary breakdown
- Download payslips (PDF)
- Track advances and deductions
- View payment history

## API Integration

The app expects the following API endpoints:

- `POST /login` - Employee authentication
- `GET /employee/:code` - Fetch employee details by code
- `POST /request-code` - Request code from admin
- `POST /location` - Send GPS coordinates
- `GET /payroll` - Fetch payroll history
- `GET /alerts` - Fetch alerts

## Environment Setup

Create a `.env` file:

```
API_URL=https://your-api-url.com
EXPO_PUBLIC_API_URL=https://your-api-url.com
```

## Build for Production

**Note**: Expo SDK 54 uses EAS Build for production builds.

### Setup EAS (one-time)
```bash
npm install -g eas-cli
eas login
eas build:configure
```

### Android
```bash
eas build --platform android
```

### iOS
```bash
eas build --platform ios
```

For more information: https://docs.expo.dev/build/introduction/

## Testing

```bash
npm test
```

## Development Status

🚧 UI Complete - Backend integration pending

## License

Proprietary - All rights reserved
