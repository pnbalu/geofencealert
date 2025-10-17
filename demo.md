# Geofence Alert Demo

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```

4. **Package for distribution:**
   ```bash
   npm run dist
   ```

## Features Demo

### 1. Dashboard
- View real-time statistics
- Monitor current location
- See recent alerts
- Track active geofences

### 2. Geofence Management
- Create new geofences with different types:
  - 🏭 Factory (100m radius)
  - 🏫 School (50m radius) 
  - 🚧 Construction (200m radius)
  - 📍 Custom (configurable)
- Edit existing geofences
- Enable/disable geofences
- Delete geofences

### 3. Location Tracking
- Start/stop location tracking
- Real-time location updates
- High accuracy GPS mode
- Configurable update intervals

### 4. Alert System
- Enter/exit notifications
- Desktop notifications
- Alert history with filtering
- Sound notifications (optional)

### 5. Settings
- Tracking interval configuration
- Notification preferences
- Privacy settings
- Auto-start options

## Use Cases

### Factory Monitoring
1. Create geofences around restricted areas
2. Set up alerts for unauthorized access
3. Monitor employee movement patterns
4. Ensure safety compliance

### School Safety
1. Define school boundaries
2. Set up alerts for student entry/exit
3. Monitor campus security
4. Track visitor access

### Construction Sites
1. Create safety zones
2. Monitor worker locations
3. Alert for restricted area access
4. Ensure compliance with safety protocols

## Technical Features

- **Modern UI**: Built with React 18, TypeScript, and Tailwind CSS
- **Smooth Animations**: Framer Motion for delightful interactions
- **State Management**: Zustand for efficient state handling
- **Local Storage**: All data stored locally for privacy
- **Cross-Platform**: Works on Windows, macOS, and Linux
- **Real-time Updates**: Live location tracking and geofence monitoring

## Privacy & Security

- ✅ All data stored locally
- ✅ No external server communication
- ✅ Location permissions required
- ✅ User can revoke permissions anytime
- ✅ Secure IPC communication

## Next Steps

1. Test the application with real location data
2. Customize geofence types for your use case
3. Configure notification preferences
4. Set up automated monitoring workflows
5. Deploy to production environment

---

**Note**: This is a demo application. For production use, consider additional security measures and compliance requirements.
