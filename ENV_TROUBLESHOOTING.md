# 🔧 Environment Variables Troubleshooting

## Issue: Environment Variables Not Loading

If you see URLs like `http://${EXPO_PUBLIC_LAPTOP_IP}:8000` in logs (with the `${}` literally), your environment variables aren't being loaded correctly.

## ✅ Solution Steps

### 1. Verify .env File Exists

Check that `.env` file is in the project root:

```bash
# Windows
dir .env

# Mac/Linux
ls -la .env
```

**Expected location**: `C:\Users\fab\Documents\neoparentalapp\.env`

### 2. Check .env File Format

Your `.env` file should look like this (NO quotes, NO spaces around `=`):

```env
EXPO_PUBLIC_LAPTOP_IP=172.20.10.2
EXPO_PUBLIC_BACKEND_URL=http://localhost:8000
EXPO_PUBLIC_PREDICTION_API_URL=https://neoparental-fast-api.onrender.com
EXPO_PUBLIC_API_TIMEOUT=10000
```

**❌ WRONG:**
```env
EXPO_PUBLIC_LAPTOP_IP = "172.20.10.2"    # Has quotes and spaces
EXPO_PUBLIC_LAPTOP_IP= 172.20.10.2       # Space before value
```

**✅ CORRECT:**
```env
EXPO_PUBLIC_LAPTOP_IP=172.20.10.2        # No quotes, no spaces
```

### 3. Restart Expo Completely

Environment variables are loaded when Expo starts, so you MUST restart:

```bash
# 1. Stop Expo (press Ctrl+C in terminal)
# 2. Clear cache and restart:
npm start -- --clear
```

**Important**: Just reloading the app on your device is NOT enough! You must restart the Expo development server.

### 4. Verify Environment Variables Are Loaded

After restarting, check the console output. You should see:

```
🌐 API Configuration:
══════════════════════════════════════════════════
   Base URL: http://172.20.10.2:8000
   Prediction API: https://neoparental-fast-api.onrender.com
   Platform: ios
   Development: true
   Laptop IP: 172.20.10.2
   Timeout: 10000ms
══════════════════════════════════════════════════
```

### 5. Common Mistakes

#### Mistake #1: Wrong File Location
```
❌ backend/.env          # This is for backend only
❌ app/.env              # Wrong directory
✅ .env                  # Must be in project root
```

#### Mistake #2: Missing Prefix
```
❌ LAPTOP_IP=192.168.1.100           # Missing EXPO_PUBLIC_ prefix
✅ EXPO_PUBLIC_LAPTOP_IP=192.168.1.100
```

#### Mistake #3: Not Restarting Expo
```
❌ Changed .env → Reload app on device
✅ Changed .env → Stop Expo (Ctrl+C) → npm start → Reload app
```

#### Mistake #4: Incorrect Format
```
❌ EXPO_PUBLIC_LAPTOP_IP = "172.20.10.2"
❌ EXPO_PUBLIC_LAPTOP_IP='172.20.10.2'
✅ EXPO_PUBLIC_LAPTOP_IP=172.20.10.2
```

## 🔍 Debugging Steps

### Step 1: Check What Expo Sees

Add this to your login screen temporarily to see what values are loaded:

```typescript
useEffect(() => {
  console.log('ENV CHECK:', {
    LAPTOP_IP: process.env.EXPO_PUBLIC_LAPTOP_IP,
    BACKEND_URL: process.env.EXPO_PUBLIC_BACKEND_URL,
    PREDICTION_API: process.env.EXPO_PUBLIC_PREDICTION_API_URL,
  });
}, []);
```

### Step 2: Expected Output

You should see:
```
ENV CHECK: {
  LAPTOP_IP: "172.20.10.2",
  BACKEND_URL: "http://localhost:8000",
  PREDICTION_API: "https://neoparental-fast-api.onrender.com"
}
```

### Step 3: If You See `undefined`

If any value is `undefined`:
1. Check `.env` file exists in project root
2. Check variable name has `EXPO_PUBLIC_` prefix
3. Restart Expo completely
4. Check for typos in variable names

## 🚀 Quick Fix Checklist

- [ ] `.env` file exists in project root (same level as `package.json`)
- [ ] All variables start with `EXPO_PUBLIC_`
- [ ] No quotes around values
- [ ] No spaces around `=` sign
- [ ] Expo completely restarted (Ctrl+C then `npm start`)
- [ ] App reloaded on device (shake → reload)

## 📝 Verify Your Setup

Run this command to check everything:

```bash
npm run validate
```

This will:
- ✅ Check if `.env` exists
- ✅ Verify all required variables are set
- ✅ Validate IP address format
- ✅ Check if dependencies are installed

## 🔄 Complete Reset (If Nothing Works)

If you're still having issues, try a complete reset:

```bash
# 1. Stop Expo (Ctrl+C)

# 2. Verify .env file
cat .env  # Mac/Linux
type .env # Windows

# 3. Clear Metro bundler cache
npx expo start --clear

# 4. Or clear everything
rm -rf node_modules/.cache
npx expo start --clear

# 5. If still broken, reinstall
rm -rf node_modules
npm install
npm start
```

## 💡 Working Example

Here's a complete working `.env` file:

```env
# NeoParental App Environment Variables
EXPO_PUBLIC_LAPTOP_IP=172.20.10.2
EXPO_PUBLIC_BACKEND_URL=http://localhost:8000
EXPO_PUBLIC_PREDICTION_API_URL=https://neoparental-fast-api.onrender.com
EXPO_PUBLIC_API_TIMEOUT=10000
```

## 🎯 Testing Your Configuration

After fixing, test by attempting to login. The console should show:

```
🌐 API Configuration:
...
🔐 Attempting login to: http://172.20.10.2:8000/auth/login
```

**NOT**:
```
🔐 Attempting login to: http://${EXPO_PUBLIC_LAPTOP_IP}:8000/auth/login
```

## ⚠️ Platform-Specific Notes

### iOS
- Simulator uses `localhost`
- Physical device uses your laptop IP
- Must restart Xcode simulator if issues persist

### Android
- Emulator uses `10.0.2.2` (special Android address)
- Physical device uses your laptop IP
- May need to clear app data in device settings

### Web
- Always uses `localhost`
- Open DevTools to check network requests

## 🆘 Still Not Working?

If you've tried everything:

1. **Check file encoding**: `.env` should be UTF-8, not UTF-16
2. **Check line endings**: Use LF, not CRLF (especially on Windows)
3. **Check permissions**: Ensure `.env` is readable
4. **Try absolute path**: 
   ```typescript
   // Temporary debug
   console.log('Working directory:', __dirname);
   ```

## 📚 Related Files

- `.env` - Your local configuration
- `.env.example` - Template file
- `utils/api-config.ts` - Reads environment variables
- `app.json` - Expo configuration
- `.gitignore` - Ensures .env is not committed

---

**Remember**: Every time you change `.env`, you MUST restart Expo! Just reloading the app is not enough.
