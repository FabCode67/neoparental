# NeoParental App - Command Cheat Sheet

## 🚀 Installation & Setup

```bash
# Install all dependencies
npm install

# Install specific packages (if needed separately)
npm install expo-av
npm install expo-document-picker
```

## 🏃 Running the App

```bash
# Start development server (choose platform after)
npm start

# Start with cache cleared
npm start -- --clear

# Start in specific mode
npm start -- --tunnel    # Use tunnel connection
npm start -- --lan       # Use LAN connection
npm start -- --localhost # Use localhost connection

# Direct platform launch
npm run android   # Launch on Android
npm run ios       # Launch on iOS
npm run web       # Launch in web browser
```

## 📱 Platform-Specific Commands

```bash
# Android
npm run android              # Run on connected device/emulator
npm run android -- --device  # Choose specific device

# iOS
npm run ios                  # Run on simulator
npm run ios -- --device      # Run on connected iPhone

# Web
npm run web
```

## 🧹 Cleaning & Maintenance

```bash
# Clear Expo cache
npm start -- --clear

# Clear all caches and node_modules
rm -rf node_modules
rm -rf .expo
npm install

# Reset Metro bundler cache
npx expo start -c

# Clear watchman cache (if using macOS/Linux)
watchman watch-del-all
```

## 🔍 Debugging

```bash
# Open developer menu in app
# iOS: Cmd + D (simulator) or shake device
# Android: Cmd + M (emulator) or shake device

# View logs
npx expo start --android --verbose
npx expo start --ios --verbose

# View React Native debugger
# Press 'j' in terminal after npm start
```

## 📦 Build Commands

```bash
# Create development build
npx expo build:android
npx expo build:ios

# EAS Build (recommended)
npm install -g eas-cli
eas build --platform android
eas build --platform ios
eas build --platform all
```

## 🔐 Permissions Testing

```bash
# Test on physical device for:
# - Microphone access (iOS/Android)
# - File system access (iOS/Android)
# - Audio recording (must use real device)

# iOS Simulator limitations:
# - No microphone
# - Limited audio capabilities

# Use physical device for full testing
```

## 📝 Code Quality

```bash
# Run linter
npm run lint

# Format code (if prettier is configured)
npx prettier --write .

# Type checking
npx tsc --noEmit
```

## 🔄 Updates & Dependencies

```bash
# Check for outdated packages
npm outdated

# Update Expo SDK
npx expo upgrade

# Update specific package
npm update expo-av
npm update expo-document-picker

# Update all packages
npm update
```

## 🐛 Common Issues & Fixes

```bash
# Module not found error
rm -rf node_modules
npm install

# Metro bundler issues
npx expo start -c

# iOS build issues
cd ios && pod install && cd ..

# Port already in use
npx kill-port 8081
npm start

# Permissions not working
# Uninstall app from device and reinstall
# Check app.json for proper configuration
```

## 📊 Project Information

```bash
# View project info
npx expo whoami
npx expo config

# View installed Expo version
npx expo --version

# View React Native version
npm list react-native
```

## 🎯 Quick Navigation

```bash
# Open project in VS Code
code .

# Open specific file
code app/(tabs)/index.tsx
code app/listening.tsx
code app/history.tsx
```

## 🔑 Key Files to Know

```bash
# Main screens
app/(tabs)/index.tsx      # Home screen
app/listening.tsx         # Recording/Upload screen
app/history.tsx          # History screen

# Configuration
app.json                 # Expo configuration
package.json            # Dependencies
tsconfig.json           # TypeScript config

# Utilities
utils/api.ts            # API functions
constants/app.ts        # App constants
```

## 📲 Testing on Physical Device

```bash
# Install Expo Go app from:
# iOS: App Store
# Android: Google Play Store

# Run app
npm start
# Scan QR code with:
# iOS: Camera app
# Android: Expo Go app
```

## 🚨 Emergency Commands

```bash
# Complete reset (nuclear option)
rm -rf node_modules
rm -rf .expo
rm package-lock.json
npm install
npm start -- --clear

# Force quit all Metro processes
killall node

# Reset iOS simulator
xcrun simctl erase all

# Reset Android emulator
# From Android Studio: Tools > AVD Manager > Wipe Data
```

## 💡 Tips

- Always test audio features on physical devices
- Use `--clear` flag if seeing cache issues
- Check permissions in device settings if features don't work
- Keep Expo CLI updated: `npm install -g expo-cli`
- Use EAS Build for production builds

## 📖 Documentation Links

- Expo Docs: https://docs.expo.dev/
- React Native: https://reactnative.dev/
- Expo Router: https://expo.github.io/router/
- Expo AV: https://docs.expo.dev/versions/latest/sdk/av/

---

**Quick Start:** `npm install && npm start`
