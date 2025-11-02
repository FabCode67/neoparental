# 🚀 Getting Started with NeoParental App on Expo

> **You're all set!** The hardcoded tokens have been removed and environment variables are configured. Follow this guide to run your app on a physical device.

## 📋 Prerequisites

- ✅ Node.js and npm installed
- ✅ Python 3.8+ (for backend)
- ✅ Expo Go app on your phone ([iOS](https://apps.apple.com/app/expo-go/id982107779) | [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))
- ✅ Phone and laptop on the same WiFi network

## 🎯 Quick Start (3 Steps)

### Step 1: Validate Your Setup

```bash
npm run validate
```

This checks if everything is configured correctly. If you see errors, follow the instructions provided.

### Step 2: Start Backend

Open a terminal and run:

```bash
cd backend
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

⚠️ **Important**: The `--host 0.0.0.0` flag is crucial! It makes your backend accessible from your phone.

### Step 3: Start Expo

Open another terminal and run:

```bash
npm start
```

A QR code will appear. Scan it with:
- **iOS**: Camera app (will open in Expo Go)
- **Android**: Expo Go app (has built-in QR scanner)

That's it! 🎉 The app should now be running on your device.

## 🔧 Configuration Details

Your `.env` file contains these settings:

```env
EXPO_PUBLIC_LAPTOP_IP=172.20.10.2          # ← Your current IP
EXPO_PUBLIC_BACKEND_URL=http://localhost:8000
EXPO_PUBLIC_PREDICTION_API_URL=https://neoparental-fast-api.onrender.com
EXPO_PUBLIC_API_TIMEOUT=10000
```

### When to Update Your IP

Your IP address changes when you:
- Switch WiFi networks
- Restart your router
- Use a different network

**To update**:
1. Find new IP: `ipconfig` (Windows) or `ifconfig` (Mac)
2. Edit `.env` file with new IP
3. Restart Expo: `Ctrl+C` then `npm start`

## 📱 Testing the Connection

Before running the app, verify your backend is accessible from your phone:

1. Make sure backend is running
2. On your phone's browser, visit: `http://172.20.10.2:8000/docs`
   - Replace `172.20.10.2` with your actual IP from `.env`
3. If you see the API documentation, you're good to go! ✅
4. If not, check:
   - Backend started with `--host 0.0.0.0`
   - Both devices on same WiFi
   - Firewall not blocking port 8000

## 🎮 Using the App

### First Time Use
1. **Register/Login**: Create an account or log in
2. **Permission**: Grant microphone permission when prompted
3. **Record**: Tap the record button to record baby sounds
4. **Upload**: Or upload an existing audio file
5. **Analyze**: Get instant predictions and recommendations

### Authentication
- Tokens are now stored securely in AsyncStorage
- No need to manually handle authentication
- Just login once, and you're set!

### Features
- 🎤 Record baby sounds in real-time
- 📁 Upload existing audio files
- 🤖 AI-powered cry analysis
- 📊 View prediction history
- 💡 Get actionable recommendations

## 🐛 Troubleshooting

### "Network request failed"

**Cause**: App can't reach backend

**Fix**:
```bash
# 1. Check backend is running with correct host
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000

# 2. Verify IP address
ipconfig  # Windows
ifconfig  # Mac/Linux

# 3. Update .env if IP changed
# 4. Restart Expo
```

### "Authentication required"

**Cause**: No token in AsyncStorage

**Fix**:
1. Make sure you're logged in
2. Try logging out and back in
3. Check backend is running
4. Clear app data (uninstall/reinstall if needed)

### App won't load on phone

**Cause**: Can't connect to Expo dev server

**Fix**:
```bash
# Try tunnel mode
npm start -- --tunnel

# Or clear cache
npm start -- --clear
```

### Environment variables not updating

**Cause**: Cached configuration

**Fix**:
```bash
# Stop Expo (Ctrl+C)
npm start -- --clear
# Reload app on device (shake → reload)
```

## 📚 Available Commands

| Command | Description |
|---------|-------------|
| `npm run validate` | Check if setup is correct |
| `npm start` | Start Expo development server |
| `npm run android` | Open on Android emulator |
| `npm run ios` | Open on iOS simulator |
| `npm run web` | Open in web browser |
| `npm start -- --clear` | Clear cache and start |
| `npm start -- --tunnel` | Use tunnel (for restricted networks) |

## 🔄 Daily Development Workflow

```bash
# Morning routine:
# 1. Check if IP changed (if you moved/switched networks)
ipconfig  # or ifconfig

# 2. Update .env if needed
nano .env  # or use any text editor

# 3. Start backend (Terminal 1)
cd backend
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000

# 4. Start Expo (Terminal 2)
npm start

# 5. Scan QR code with phone
# 6. Start coding! 💻
```

## 🎓 Additional Resources

### Documentation
- 📖 **[EXPO_SETUP_GUIDE.md](./EXPO_SETUP_GUIDE.md)** - Comprehensive setup guide
- 📝 **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** - Command reference
- ✅ **[CONFIGURATION_COMPLETE.md](./CONFIGURATION_COMPLETE.md)** - What was configured

### External Links
- [Expo Documentation](https://docs.expo.dev/)
- [Expo Go App](https://expo.dev/client)
- [React Native Docs](https://reactnative.dev/)

## 💡 Pro Tips

1. **Keep Backend Running**: Leave backend terminal open while developing
2. **Use Hot Reload**: Changes appear automatically (most of the time)
3. **Shake to Debug**: Shake device → Debug → Open DevTools
4. **Check Logs**: Watch terminal for errors and warnings
5. **Restart When Stuck**: `Ctrl+C` both terminals, then start again

## ✅ Success Checklist

You'll know everything is working when:
- [ ] `npm run validate` passes
- [ ] Backend accessible at `http://YOUR_IP:8000/docs` from phone
- [ ] Expo QR code appears
- [ ] App loads on phone
- [ ] Can login/register
- [ ] Can record/upload audio
- [ ] Predictions work
- [ ] History loads

## 🎊 You're Ready to Develop!

Everything is now configured for Expo development on physical devices:
- ✅ No hardcoded tokens
- ✅ Environment variables configured
- ✅ Platform-specific URLs
- ✅ Secure authentication with AsyncStorage
- ✅ Ready for both development and production

**Have fun building! 🚀**

---

### Need Help?

1. Run `npm run validate` for automated checks
2. Check `EXPO_SETUP_GUIDE.md` for detailed troubleshooting
3. Review `QUICK_REFERENCE.md` for command help
4. Ensure backend logs show no errors
5. Try restarting both Expo and backend

**Current Configuration:**
- Laptop IP: `172.20.10.2` (update if changed)
- Backend: `http://localhost:8000`
- Prediction API: `https://neoparental-fast-api.onrender.com`
- Platform: Automatic detection (iOS/Android)
