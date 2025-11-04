# Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### Step 1: Install Dependencies
```bash
cd mobile
npm install
```

### Step 2: Create Assets
You need to add asset files to `assets/` directory:
- `icon.png` (1024x1024)
- `splash.png` (1242x2436)
- `adaptive-icon.png` (1024x1024)
- `favicon.png` (48x48)
- `notification-icon.png` (96x96)
- `emergency-alert.wav` (sound file)

**Quick option**: Use placeholder images for now, or generate them online.

### Step 3: Run the App
```bash
# Start Expo
npm start

# Then press:
# 'i' for iOS simulator
# 'a' for Android emulator
# Scan QR code with Expo Go on your phone
```

### Step 4: Test Mock Flow

1. **Login Screen** appears
2. Enter any username/password (or modify code to bypass)
3. **Code Entry Screen** - Use test code "123456" 
4. **Dashboard** - Main app loads

## 📱 Testing Features

### Dashboard
- View employee profile
- See location tracking status
- Check current work status

### Payroll
- View salary history
- See payment breakdown
- Mock currency display

### Schedule
- View assigned work hours
- Check working days
- See current shift

### Alerts
- View notification history
- Check emergency alerts
- Mock push notifications

### Profile
- Edit employee info
- Change settings
- Logout functionality

## 🔧 Configuration

### Update API URLs
In `src/stores/authStore.js`, replace:
```javascript
'YOUR_API_URL/login'
'YOUR_API_URL/employee/:code'
'YOUR_API_URL/request-code'
```

### Enable Features
Current features work with:
- ✅ UI/UX fully functional
- ✅ Navigation flows
- ✅ Mock data display
- ✅ Expo SDK 54 with latest features
- ⏳ API integration (pending)
- ⏳ Background tracking (needs config)

## 📦 Build for Production

**Note**: Use EAS Build with Expo SDK 54

```bash
# Setup EAS (one-time)
npm install -g eas-cli
eas login
eas build:configure

# Build
eas build --platform android  # Android
eas build --platform ios      # iOS
```

## 🐛 Common Issues

**"Module not found"**
```bash
rm -rf node_modules
npm install
npx expo install --fix  # Fix Expo SDK 54 dependencies
```

**"Expo not installed"**
```bash
npm install -g eas-cli  # Use EAS CLI
```

**"Can't find expo-linear-gradient"**
```bash
npx expo install expo-linear-gradient
```

**"Incompatible versions with Expo SDK 54"**
```bash
npx expo install --fix  # Auto-fix all dependencies
```

## 📚 Next Steps

1. Replace mock API calls with real endpoints
2. Add asset files
3. Test on physical device
4. Configure background location
5. Set up push notifications
6. Deploy to app stores

## 🆘 Need Help?

- Check `SETUP.md` for detailed setup
- Read `FEATURES.md` for full feature list
- See `README.md` for architecture details

## ✨ What's Working Now

✅ Complete UI with beautiful theme
✅ 8 fully functional screens
✅ Bottom tab navigation
✅ Mock data for all features
✅ Location permission handling
✅ Notification setup
✅ State management
✅ Profile management
✅ Payroll display
✅ Schedule view
✅ Alert history
✅ Request code flow

## 🎯 Ready for Development

The app is ready for:
- API integration
- Backend connection
- Testing on devices
- Feature additions
- Production builds

Happy coding! 🎉

