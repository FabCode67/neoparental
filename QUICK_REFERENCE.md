# 🚀 Quick Reference - Running on Expo

## One-Time Setup

```bash
# 1. Install dependencies
npm install

# 2. Create .env from template
cp .env.example .env

# 3. Find your IP address
# Windows:
ipconfig
# macOS/Linux:
ifconfig

# 4. Edit .env and update EXPO_PUBLIC_LAPTOP_IP
# nano .env  (or use any text editor)
```

## Every Time You Develop

```bash
# Terminal 1: Start Backend (IMPORTANT: use --host 0.0.0.0)
cd backend
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Terminal 2: Start Expo
npm start
```

## Quick Commands

| Command | Description |
|---------|-------------|
| `npm start` | Start Expo development server |
| `npm run android` | Open on Android emulator |
| `npm run ios` | Open on iOS simulator |
| `npm run web` | Open in web browser |
| `npm start -- --clear` | Clear cache and start |
| `npm start -- --tunnel` | Use tunnel mode (if WiFi blocks) |

## 📱 On Your Phone

1. **Install Expo Go** from App Store / Play Store
2. **Same WiFi** - Phone and laptop must be on same network
3. **Scan QR** - Use Expo Go to scan QR from terminal
4. **Reload** - Shake device → Reload if needed

## 🔧 Common Fixes

### "Network request failed"
```bash
# Check backend is running with correct host
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Verify your IP in .env matches your current IP
ipconfig  # or ifconfig
```

### Environment not updating
```bash
# Stop Expo (Ctrl+C) then:
npm start -- --clear
```

### Can't connect from phone
```bash
# Test backend from phone browser:
# Open: http://YOUR_IP:8000/docs
# If this doesn't work, check:
# 1. Firewall settings
# 2. Both devices on same WiFi
# 3. Backend started with --host 0.0.0.0
```

## 🎯 Pre-Flight Checklist

Before running on phone:
- [ ] `.env` file exists with your IP
- [ ] Backend running with `--host 0.0.0.0`
- [ ] Phone and laptop on same WiFi
- [ ] Expo Go installed
- [ ] Backend accessible: `http://YOUR_IP:8000/docs`

## 📝 File Locations

```
neoparentalapp/
├── .env                    # ← Your config (DO NOT COMMIT!)
├── .env.example            # ← Template to share
├── app.json                # Expo configuration
└── utils/
    ├── api-config.ts       # API URL configuration
    ├── api.ts              # API functions (no hardcoded tokens!)
    └── env-validator.ts    # Environment validator
```

## 🔄 When Changing Networks

Your IP address changes when you switch WiFi networks:

```bash
# 1. Find new IP
ipconfig  # or ifconfig

# 2. Update .env
nano .env  # Update EXPO_PUBLIC_LAPTOP_IP

# 3. Restart everything
# Stop backend (Ctrl+C)
# Stop Expo (Ctrl+C)
# Start backend again
# Start Expo again
```

## 🆘 Emergency Reset

If nothing works:
```bash
# 1. Stop everything (Ctrl+C in both terminals)

# 2. Clear all caches
npm start -- --clear

# 3. Uninstall app from phone and scan QR again

# 4. If still broken:
rm -rf node_modules
npm install
npm start -- --clear
```

## 💡 Pro Tips

1. **Use Watchman** (optional, for faster reload):
   ```bash
   # macOS:
   brew install watchman
   
   # Windows:
   choco install watchman
   ```

2. **Enable Hot Reload**: Press `r` in Expo terminal to reload

3. **Remote Debugging**: Shake device → Debug → Open Chrome DevTools

4. **Check Logs**: Watch terminal for errors and warnings

5. **Production Build**: Use EAS Build when ready for production
   ```bash
   npm install -g eas-cli
   eas build
   ```

---

**Quick Start**: `cp .env.example .env` → Update IP → `npm start` 🚀
