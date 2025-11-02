# 📱 Running NeoParental App on Expo

This guide will help you configure and run the NeoParental app on the Expo Go app on your physical device.

## ✅ What We've Fixed

1. **Removed Hardcoded Tokens** - All auth tokens now come from AsyncStorage
2. **Environment Variables** - API URLs and configuration now use `.env` file
3. **Dynamic Backend URL** - Automatically detects your network IP for physical devices

## 🚀 Quick Start

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Find your laptop's IP address:
   - **Windows**: Open Command Prompt and run `ipconfig`
   - **macOS/Linux**: Open Terminal and run `ifconfig` or `ip addr show`
   - Look for your IPv4 address (e.g., `192.168.1.100` or `172.20.10.2`)

3. Edit `.env` file and update `EXPO_PUBLIC_LAPTOP_IP`:
   ```env
   EXPO_PUBLIC_LAPTOP_IP=192.168.1.100  # ← Replace with YOUR IP
   EXPO_PUBLIC_BACKEND_URL=http://localhost:8000
   EXPO_PUBLIC_PREDICTION_API_URL=https://neoparental-fast-api.onrender.com
   EXPO_PUBLIC_API_TIMEOUT=10000
   ```

### Step 3: Start the Backend Server

Make sure your backend is running and accessible on your network:

```bash
cd backend
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Important**: Use `--host 0.0.0.0` to make it accessible from other devices on your network!

### Step 4: Start Expo

```bash
npm start
```

Or use the shortcuts:
- `npm run android` - Open on Android emulator
- `npm run ios` - Open on iOS simulator
- `npm run web` - Open in web browser

### Step 5: Connect Your Physical Device

1. **Install Expo Go** on your phone:
   - iOS: Download from App Store
   - Android: Download from Google Play Store

2. **Ensure Same WiFi Network**:
   - Your phone and laptop must be on the same WiFi network
   - Corporate/School networks may block this - use a personal hotspot if needed

3. **Scan QR Code**:
   - Open Expo Go app
   - Scan the QR code shown in your terminal
   - The app will load on your device

## 🔧 Configuration Details

### Environment Variables

The app uses the following environment variables (all prefixed with `EXPO_PUBLIC_`):

| Variable | Description | Example |
|----------|-------------|---------|
| `EXPO_PUBLIC_LAPTOP_IP` | Your local network IP | `192.168.1.100` |
| `EXPO_PUBLIC_BACKEND_URL` | Backend API URL (production) | `http://localhost:8000` |
| `EXPO_PUBLIC_PREDICTION_API_URL` | ML Prediction API URL | `https://neoparental-fast-api.onrender.com` |
| `EXPO_PUBLIC_API_TIMEOUT` | Request timeout (ms) | `10000` |

### Platform-Specific URLs

The app automatically selects the correct backend URL based on your platform:

- **iOS Simulator**: `http://localhost:8000`
- **iOS Physical Device**: `http://{LAPTOP_IP}:8000`
- **Android Emulator**: `http://10.0.2.2:8000`
- **Android Physical Device**: `http://{LAPTOP_IP}:8000`

### Authentication Flow

- Tokens are stored in AsyncStorage (secure, persistent storage)
- No more hardcoded tokens in the code
- Each user gets their own token after login
- Tokens are automatically included in API requests

## 🐛 Troubleshooting

### "Network request failed" Error

**Problem**: App can't connect to backend

**Solutions**:
1. Verify your IP address in `.env` is correct
2. Check that backend is running with `--host 0.0.0.0`
3. Ensure phone and laptop are on same WiFi
4. Try restarting Expo: Press `R` in terminal or shake device and select "Reload"
5. Check firewall settings - may need to allow port 8000

### "Cannot connect to Metro" Error

**Problem**: Expo can't connect to development server

**Solutions**:
1. Restart Expo: `Ctrl+C` then `npm start`
2. Clear cache: `npm start -- --clear`
3. Check if port 8081 is available
4. Try tunnel mode: `npm start -- --tunnel`

### Backend Not Accessible

**Problem**: Backend works on laptop but not on phone

**Solutions**:
1. Ensure backend started with `--host 0.0.0.0`
2. Check Windows Firewall / macOS Firewall settings
3. Test backend accessibility: 
   ```bash
   # On your phone's browser, visit:
   http://{YOUR_IP}:8000/docs
   ```
4. Try using your computer's hotspot instead of WiFi

### Environment Variables Not Loading

**Problem**: App still uses old hardcoded values

**Solutions**:
1. Ensure `.env` file is in project root (same level as `package.json`)
2. Restart Expo completely: `Ctrl+C` then `npm start`
3. Clear Expo cache: `npm start -- --clear`
4. Verify `.env` file is not in `.gitignore` (it should be!)

### Authentication Issues

**Problem**: Getting "Authentication required" errors

**Solutions**:
1. Login/Register through the app first
2. Check AsyncStorage has the token:
   - Open React Native Debugger
   - Check AsyncStorage for 'authToken' key
3. Clear app data and login again:
   - Uninstall and reinstall the app OR
   - Clear AsyncStorage from settings

## 📝 Important Notes

### Security

- `.env` file is in `.gitignore` - never commit it!
- Share `.env.example` with team members
- Each developer sets their own `LAPTOP_IP`
- Production builds should use proper backend URLs

### Network Setup

For development:
- Use local WiFi for best performance
- Mobile hotspot works if WiFi blocks device communication
- VPN may interfere - disconnect if having issues

For production:
- Update `EXPO_PUBLIC_BACKEND_URL` to production server
- Consider using EAS Build for production apps
- Use HTTPS for production APIs

## 🎯 Testing Checklist

Before running on physical device:

- [ ] `.env` file created with correct IP
- [ ] Backend running with `--host 0.0.0.0`
- [ ] Phone and laptop on same WiFi
- [ ] Expo Go app installed on phone
- [ ] Firewall allows port 8000 (backend) and 8081 (metro)
- [ ] Can access backend docs from phone browser: `http://{IP}:8000/docs`

## 🔄 Updating Configuration

When you change `.env`:
1. Stop Expo (`Ctrl+C`)
2. Edit `.env` file
3. Restart Expo: `npm start`
4. Reload app on device (shake device → Reload)

## 📚 Additional Resources

- [Expo Documentation](https://docs.expo.dev/)
- [Expo Go App](https://expo.dev/client)
- [React Native Networking](https://reactnative.dev/docs/network)
- [Expo Constants](https://docs.expo.dev/versions/latest/sdk/constants/)

## 🆘 Still Having Issues?

1. Check Expo logs in terminal
2. Check Metro bundler logs
3. Enable remote debugging (shake device → Debug)
4. Check backend logs for errors
5. Review network traffic in browser DevTools

---

**Happy Development! 🚀**
