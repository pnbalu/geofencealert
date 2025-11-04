# Mobile App Setup Instructions

## Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn
- Expo CLI: `npm install -g expo-cli` (or use npx)
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

## Initial Setup

1. **Install dependencies:**
```bash
npm install
```

2. **Set up Expo:**
```bash
npx expo install --fix
```

**Note**: This project uses Expo SDK 54 (latest). Ensure you have the latest Expo tools.

3. **Create required asset files:**

You need to create the following asset files in the `assets/` directory:

- `icon.png` (1024x1024px) - App icon
- `splash.png` (1242x2436px) - Splash screen
- `adaptive-icon.png` (1024x1024px) - Android adaptive icon
- `favicon.png` (48x48px) - Web favicon
- `notification-icon.png` (96x96px) - Notification icon
- `emergency-alert.wav` - Emergency alert sound

You can use online tools to generate these assets or create them manually.

## Running the App

### Development Mode

```bash
# Start the Expo development server
npm start

# Or with specific platform
npm run ios      # iOS simulator
npm run android  # Android emulator
```

### Test on Physical Device

1. Install Expo Go app on your phone
2. Scan the QR code from terminal
3. App will load on your device

## Configuration

1. **Update API endpoints:**

Edit the following files and replace `YOUR_API_URL` with your actual API URL:

- `src/stores/authStore.js`
- All screen files that make API calls

2. **Configure environment variables:**

Create a `.env` file:
```
API_URL=https://your-api-url.com
EXPO_PUBLIC_API_URL=https://your-api-url.com
```

## Testing Features

### 1. Code Authentication
- Mock API responses for testing
- Use test code: "123456"

### 2. Location Tracking
- Grant location permissions when prompted
- Check console for location updates

### 3. Notifications
- Test push notifications
- Check notification permissions

### 4. Background Tasks
- Test background location tracking
- Verify scheduler runs during work hours

## Build for Production

**Note**: Expo SDK 54 uses EAS Build (Expo Application Services) for production builds.

### Setup EAS Build (one-time)

```bash
npm install -g eas-cli
eas login
eas build:configure
```

### Android APK/AAB

```bash
eas build --platform android
```

### iOS IPA

```bash
eas build --platform ios
```

For more information, visit: https://docs.expo.dev/build/introduction/

## Troubleshooting

### Common Issues

1. **"Module not found" errors:**
   - Run `npm install` again
   - Clear cache: `npx expo start -c`
   - Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`

2. **Location not working:**
   - Check app permissions in device settings
   - Ensure location services are enabled
   - For iOS: Check Info.plist permissions
   - For Android: Check manifest permissions

3. **Notifications not showing:**
   - Check notification permissions
   - For Android, check battery optimization settings
   - Ensure notification channel is configured (Android 8+)

4. **Background tasks not running:**
   - Ensure app is not force-closed
   - Check background app refresh is enabled
   - Android: Add app to exception list in battery optimization
   - iOS: Ensure background modes are configured

5. **Expo SDK 54 specific issues:**
   - Ensure Node.js version is 18+
   - Use `npx expo install --fix` to ensure compatible versions
   - Check for breaking changes at: https://expo.dev/changelog

## Next Steps

1. Implement actual API integration
2. Add proper error handling
3. Implement offline support
4. Add analytics
5. Set up push notification certificates
6. Configure app store listings

## Support

For issues or questions, check the Expo documentation:
- https://docs.expo.dev/
- https://reactnative.dev/docs/getting-started

