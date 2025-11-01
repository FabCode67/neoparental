# iOS Setup Guide for NeoParental App

## Overview
This guide will help you run the NeoParental app on iOS Simulator and your physical iOS device.

## Prerequisites
- **Mac computer** (required for iOS development)
- **Node.js** and **npm** installed
- **Xcode** installed from Mac App Store
- **Expo Go** app installed on your iPhone (for physical device testing)

## Setup Steps

### 1. Install Xcode Command Line Tools
```bash
xcode-select --install
```

### 2. Install CocoaPods (if not already installed)
```bash
sudo gem install cocoapods
```

### 3. Install Project Dependencies
```bash
cd neoparentalapp
npm install
```

### 4. Start the Backend Server
Make sure your FastAPI backend is running:
```bash
cd backend
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Important:** For physical device testing, you need to update the backend URL in the app to use your computer's IP address.

## Running on iOS Simulator

### Option 1: Using Expo CLI
```bash
# Start Expo development server
npm start

# Press 'i' to open in iOS Simulator
# or select "Run on iOS Simulator" from the Expo Dev Tools
```

### Option 2: Direct iOS Command
```bash
npm run ios
```

This will:
1. Start the Expo development server
2. Build the app
3. Launch iOS Simulator
4. Install and run the app

### Troubleshooting iOS Simulator
If the simulator doesn't open:
```bash
# Open Simulator manually
open -a Simulator

# Then run the app again
npm run ios
```

## Running on Physical iPhone

### Method 1: Using Expo Go (Recommended for Development)

1. **Install Expo Go** on your iPhone from the App Store

2. **Ensure both devices are on the same WiFi network**
   - Your Mac and iPhone must be on the same network

3. **Find your Mac's IP address:**
   ```bash
   # On Mac, run:
   ipconfig getifaddr en0
   # or
   ifconfig | grep "inet " | grep -v 127.0.0.1
   ```

4. **Update backend URL** (if needed):
   - The app uses `localhost:8000` for simulator
   - For physical device, update to your Mac's IP in:
     - `app/login.tsx`
     - `app/register.tsx`
   
   Example:
   ```typescript
   const BACKEND_URL = Platform.select({
     ios: __DEV__ 
       ? 'http://192.168.1.100:8000'  // Replace with your Mac's IP
       : 'http://localhost:8000',
   });
   ```

5. **Start the Expo server:**
   ```bash
   npm start
   ```

6. **Scan the QR code** with your iPhone camera
   - This will open Expo Go
   - The app will load on your device

### Method 2: Building with Xcode (For Production)

1. **Generate native iOS project:**
   ```bash
   npx expo prebuild --platform ios
   ```

2. **Open in Xcode:**
   ```bash
   open ios/neoparentalapp.xcworkspace
   ```

3. **Configure signing:**
   - Select your project in Xcode
   - Go to "Signing & Capabilities"
   - Select your team/Apple ID
   - Xcode will automatically manage signing

4. **Connect your iPhone** via USB

5. **Select your device** in Xcode's device dropdown

6. **Click the Run button** (▶️) in Xcode

## Enhanced Features in New Screens

### 1. **Login Screen (`login.tsx`)**
- ✅ iOS-optimized keyboard handling
- ✅ Email validation with real-time feedback
- ✅ Password visibility toggle
- ✅ Improved error messages
- ✅ Better visual feedback for iOS
- ✅ Platform-specific URL configuration
- ✅ Automatic navigation after successful login

### 2. **Register Screen (`register.tsx`)**
- ✅ Multi-step validation
- ✅ Real-time password strength indicator
- ✅ Password matching validation
- ✅ Optional fields clearly marked
- ✅ Better form organization
- ✅ iOS-optimized keyboard types
- ✅ Improved error handling

### 3. **Navigation (`_layout.tsx`)**
- ✅ Protected routes - requires authentication
- ✅ Automatic redirection based on auth status
- ✅ Prevents back navigation to auth screens when logged in
- ✅ Clean routing structure
- ✅ Gesture-based navigation

### 4. **Home Screen (`index.tsx`)**
- ✅ Beautiful iOS-friendly design
- ✅ User account menu
- ✅ Logout functionality with confirmation
- ✅ Login prompts for unauthenticated users
- ✅ Enhanced UI with better shadows and spacing

### 5. **Authentication Utilities (`utils/auth.ts`)**
- ✅ Centralized auth management
- ✅ Token storage and retrieval
- ✅ Easy logout functionality
- ✅ User info helpers

## Backend URL Configuration

The app automatically selects the correct backend URL based on platform:

```typescript
const BACKEND_URL = Platform.select({
  ios: 'http://localhost:8000',      // For iOS Simulator
  android: 'http://10.0.2.2:8000',   // For Android Emulator
  default: 'http://localhost:8000',
});
```

### For Physical Device Testing:
Replace `localhost` with your computer's IP address:

```typescript
const BACKEND_URL = Platform.select({
  ios: __DEV__ 
    ? 'http://YOUR_IP_ADDRESS:8000'  // e.g., 'http://192.168.1.100:8000'
    : 'http://localhost:8000',
  android: 'http://10.0.2.2:8000',
  default: 'http://localhost:8000',
});
```

## Testing Checklist

- [ ] Backend server is running
- [ ] iOS Simulator launches successfully
- [ ] Login screen loads properly
- [ ] Can register new user
- [ ] Can login with existing user
- [ ] Redirects to home after login
- [ ] Cannot access tabs without login
- [ ] Can logout successfully
- [ ] Audio recording works (on physical device)
- [ ] Predictions are saved to database

## Common Issues & Solutions

### Issue: "Cannot connect to server"
**Solution:**
- Ensure backend is running on port 8000
- Check firewall settings
- For physical device, ensure both devices are on same WiFi
- Update backend URL to use IP address instead of localhost

### Issue: "Module not found" errors
**Solution:**
```bash
# Clear cache and reinstall
rm -rf node_modules
npm install
npx expo start -c
```

### Issue: iOS Simulator not opening
**Solution:**
```bash
# Reset Simulator
xcrun simctl erase all

# Try opening manually first
open -a Simulator

# Then run app
npm run ios
```

### Issue: "Command PhaseScriptExecution failed"
**Solution:**
```bash
cd ios
pod deintegrate
pod install
cd ..
npm run ios
```

### Issue: App crashes on physical device
**Solution:**
- Check Console app on Mac for crash logs
- Ensure Expo Go is updated to latest version
- Try restarting both devices
- Check that backend URL uses IP address, not localhost

## Development Workflow

1. **Start Backend:**
   ```bash
   cd backend
   python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

2. **Start Expo (in new terminal):**
   ```bash
   npm start
   ```

3. **Launch on iOS:**
   - Press `i` for iOS Simulator
   - Scan QR with iPhone camera for physical device

4. **Make Changes:**
   - Edit code
   - Expo will hot-reload automatically
   - Shake device or press `r` to reload manually

## Key Improvements Made

### Authentication Flow
- ✅ Protected routes with authentication checks
- ✅ Automatic redirection based on login status
- ✅ Persistent login with AsyncStorage
- ✅ Clean logout functionality

### User Experience
- ✅ iOS-native feel with proper shadows and animations
- ✅ Keyboard handling for text inputs
- ✅ Form validation with helpful error messages
- ✅ Loading states for all async operations
- ✅ Confirmation dialogs for important actions

### Visual Design
- ✅ Consistent color scheme (#FF5722 primary)
- ✅ iOS-optimized spacing and typography
- ✅ Platform-specific shadows (iOS vs Android)
- ✅ Smooth animations and transitions
- ✅ Better visual hierarchy

### Code Quality
- ✅ Centralized auth utilities
- ✅ Reusable validation functions
- ✅ Better error handling
- ✅ TypeScript for type safety
- ✅ Clean component structure

## Next Steps

1. **Test on physical device** to ensure audio recording works
2. **Test database integration** to verify predictions are saved
3. **Add more features** like password reset, profile editing
4. **Implement push notifications** for feedback alerts
5. **Add biometric authentication** (Face ID / Touch ID)

## Support Resources

- **Expo Documentation:** https://docs.expo.dev/
- **React Native iOS:** https://reactnative.dev/docs/running-on-device
- **Apple Developer:** https://developer.apple.com/documentation/

## Tips for iOS Development

1. **Keep Simulator running** - it's faster for subsequent launches
2. **Use Expo Go** for quick testing on physical device
3. **Check Console.app** on Mac for detailed error logs
4. **Enable debugging** with React Native Debugger
5. **Test on multiple iOS versions** if possible

---

**Need Help?** Check the error console or Expo documentation. Most issues are related to:
- Network connectivity (backend URL)
- Xcode/CocoaPods setup
- Expo Go app version mismatch
