# 📱 Physical Device Setup - Quick Start Guide

## 🎯 Goal
Run your NeoParental app on your physical phone (iOS/Android) using Expo Go.

---

## ⚡ Quick Setup (5 minutes)

### Step 1: Find Your Laptop's IP Address

**Windows:**
```cmd
ipconfig
```
Look for "IPv4 Address" under WiFi adapter.  
Example: `192.168.1.100`

**macOS/Linux:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

### Step 2: Update App Configuration

1. Open: `utils/api-config.ts`
2. Find this line:
   ```typescript
   const LAPTOP_IP = '192.168.1.100'; // ← CHANGE THIS!
   ```
3. Replace `192.168.1.100` with YOUR laptop's IP address
4. Save the file

### Step 3: Start Backend with Network Access

**Windows:**
```cmd
# Option 1: Use the automated script
start-backend-network.bat

# Option 2: Manual command
cd backend
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**macOS/Linux:**
```bash
cd backend
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Important:** The `--host 0.0.0.0` flag allows connections from other devices!

### Step 4: Configure Firewall (Windows Only)

**Automatic (Run as Administrator):**
```cmd
start-backend-network.bat
```

**Manual:**
1. Open "Windows Defender Firewall"
2. Click "Advanced settings"
3. Click "Inbound Rules" → "New Rule"
4. Select "Port" → TCP → Port 8000
5. Select "Allow the connection"
6. Name it "Python Backend"

### Step 5: Test Backend Access

Open browser on your laptop and visit:
```
http://YOUR_IP:8000/docs
```

Example: `http://192.168.1.100:8000/docs`

If you see the FastAPI documentation, it's working! ✅

### Step 6: Start Expo App

```bash
# Make sure you're in the project root
npm start
```

### Step 7: Connect Your Phone

1. **Install Expo Go** on your phone (from App Store/Play Store)
2. **Ensure phone and laptop are on the SAME WiFi network**
3. **Scan QR code** shown in the terminal with:
   - iOS: Camera app
   - Android: Expo Go app
4. App will load on your phone!

---

## ✅ Verification Checklist

- [ ] Found laptop's IP address
- [ ] Updated `LAPTOP_IP` in `utils/api-config.ts`
- [ ] Backend running with `--host 0.0.0.0`
- [ ] Firewall allows port 8000 (Windows)
- [ ] Can access `http://YOUR_IP:8000/docs` in browser
- [ ] Phone and laptop on same WiFi
- [ ] Expo Go app installed on phone
- [ ] App loads on phone

---

## 🔍 Troubleshooting

### Issue: "Network request failed" on phone

**Check:**
1. Both devices on same WiFi?
   ```bash
   # On phone, check WiFi settings
   # On laptop, check network connection
   ```

2. IP address correct in `api-config.ts`?
   ```typescript
   // Should match your laptop's IP exactly
   const LAPTOP_IP = '192.168.1.100';
   ```

3. Backend running with `0.0.0.0`?
   ```bash
   # You should see:
   # Uvicorn running on http://0.0.0.0:8000
   ```

4. Firewall allows port 8000?
   ```cmd
   # Windows - Test if port is open
   Test-NetConnection -ComputerName YOUR_IP -Port 8000
   ```

5. Test from phone's browser:
   - Open browser on phone
   - Visit: `http://YOUR_IP:8000/docs`
   - Should see FastAPI docs

### Issue: "ERR_CONNECTION_REFUSED"

**Solutions:**
```bash
# 1. Check backend is running
# You should see output like:
# INFO: Uvicorn running on http://0.0.0.0:8000

# 2. Verify port 8000 isn't blocked
netstat -an | findstr :8000   # Windows
netstat -an | grep :8000      # macOS/Linux

# 3. Temporarily disable firewall (for testing)
# Windows: Control Panel → Firewall → Turn off
```

### Issue: "ERR_CONNECTION_TIMEOUT"

**Try:**
1. Check WiFi isolation setting on router (should be disabled)
2. Try different WiFi network
3. Use mobile hotspot as temporary solution
4. Check antivirus isn't blocking connection

### Issue: Can't find IP address

**Windows PowerShell:**
```powershell
(Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias Wi-Fi).IPAddress
```

**Alternative method:**
1. Open Command Prompt
2. Type: `ipconfig /all`
3. Find "Wireless LAN adapter Wi-Fi"
4. Look for "IPv4 Address"

---

## 📊 Network Information

### Common IP Ranges
- **192.168.1.x** - Most common for home routers
- **192.168.0.x** - Some routers
- **10.0.0.x** - Some routers
- **172.16-31.x.x** - Less common

### Backend URLs by Platform

| Platform | Environment | URL |
|----------|-------------|-----|
| iOS Simulator | Development | `http://localhost:8000` |
| iOS Physical | Development | `http://YOUR_IP:8000` |
| Android Emulator | Development | `http://10.0.2.2:8000` |
| Android Physical | Development | `http://YOUR_IP:8000` |

---

## 🚀 Alternative: Using Expo Tunnel

If IP setup is problematic, use Expo's tunnel feature:

```bash
npx expo start --tunnel
```

**Pros:**
- No IP configuration needed
- Works through firewalls
- Works on different networks

**Cons:**
- Slower than LAN
- Requires internet
- May have latency

---

## 📱 Complete Workflow

### Terminal 1: Backend
```bash
cd backend
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Terminal 2: Expo
```bash
npm start
```

### Phone
1. Open Expo Go
2. Scan QR code
3. App loads
4. Test login/register

---

## 🔐 Security Note

⚠️ **Important:** Running with `--host 0.0.0.0` exposes your backend to your local network.

**For development:**
- ✅ Fine on home WiFi
- ❌ Don't use on public WiFi
- ❌ Don't leave running unnecessarily

**For production:**
- Use a proper hosting service
- Implement HTTPS
- Use environment variables
- Add proper authentication

---

## 💡 Pro Tips

1. **Static IP:** Configure router to assign static IP to your laptop
2. **Bookmark:** Save `http://YOUR_IP:8000/docs` for quick testing
3. **Reload:** After changing IP in config, restart Expo (`r` in terminal)
4. **Console:** Enable remote debugging to see console logs from phone
5. **Network Tools:** Use apps like "Fing" to verify device connectivity

---

## 📝 Quick Reference Commands

```bash
# Find IP (Windows)
ipconfig

# Find IP (macOS/Linux)
ifconfig | grep inet

# Start backend with network access
cd backend
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Start Expo
npm start

# Start Expo with tunnel (alternative)
npx expo start --tunnel

# Clear Expo cache
npx expo start -c

# View logs (iOS)
npx react-native log-ios

# View logs (Android)
npx react-native log-android
```

---

## ✨ What You'll See

### On Laptop (Backend Terminal):
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [12345] using WatchFiles
INFO:     Started server process [67890]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

### On Laptop (Expo Terminal):
```
› Metro waiting on exp://192.168.1.100:8081
› Scan the QR code above with Expo Go (Android) or the Camera app (iOS)
```

### In Phone App:
- Development mode indicator (blue bar)
- Server URL shown: `http://192.168.1.100:8000`
- Login/Register screens work
- Can create account and sign in

---

## 🎉 Success Indicators

✅ Backend shows: `Uvicorn running on http://0.0.0.0:8000`  
✅ Can access `http://YOUR_IP:8000/docs` in browser  
✅ Expo shows QR code  
✅ Phone app loads without errors  
✅ Can see server URL in app (dev mode)  
✅ Login/Register work  
✅ Data saves to database  

---

## 📞 Need Help?

1. **Check NETWORK_SETUP_GUIDE.md** for detailed troubleshooting
2. **Check AUTH_FLOW_REFERENCE.md** for authentication issues
3. **Check IOS_SETUP_GUIDE.md** for iOS-specific help
4. **View console logs** on phone using Expo Dev Tools
5. **Test backend** directly in browser first

---

## 🔄 Common Fixes

### "Cannot connect to server"
```bash
# 1. Verify IP in config
# 2. Restart backend with --host 0.0.0.0
# 3. Check firewall
# 4. Test in browser: http://YOUR_IP:8000/docs
```

### "Network request failed"
```bash
# 1. Verify same WiFi
# 2. Restart Expo: npm start
# 3. Reload app: Shake phone → Reload
```

### "ERR_NETWORK_CHANGED"
```bash
# IP address changed
# 1. Find new IP: ipconfig
# 2. Update api-config.ts
# 3. Restart Expo
```

---

**Last Updated:** November 2025  
**For:** Physical Device Testing  
**Platform:** iOS & Android via Expo Go
