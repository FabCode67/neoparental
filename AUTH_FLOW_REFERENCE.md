# Authentication Flow - Quick Reference

## 🎯 Current Implementation Status

### ✅ What's Working
1. **Registration** - Users can create accounts
2. **Login** - Users can sign in with email/password
3. **Protected Routes** - Tabs require authentication
4. **Persistent Login** - Users stay logged in after app restart
5. **Logout** - Clean logout with confirmation
6. **Auto-Redirect** - Logged-in users can't access auth screens
7. **iOS Optimization** - Native-feeling UI for iOS

---

## 📱 Screen Flow

```
App Launch
    ↓
Check Auth Status
    ↓
    ├─ Not Logged In → Login Screen
    │                      ↓
    │                  Enter Credentials
    │                      ↓
    │                  ✅ Success → Home (Tabs)
    │                      ↓
    │                  ❌ Failed → Show Error
    │
    └─ Logged In → Home (Tabs)
                      ↓
                  Can access all features
                      ↓
                  Logout → Login Screen
```

---

## 🔐 Authentication Files

### Core Files
1. **`app/_layout.tsx`** - Root layout with auth protection
2. **`app/login.tsx`** - Login screen
3. **`app/register.tsx`** - Registration screen
4. **`app/(tabs)/index.tsx`** - Home screen with logout
5. **`utils/auth.ts`** - Auth utility functions

### Key Functions in `utils/auth.ts`
```typescript
isAuthenticated()     // Check if user is logged in
getAuthToken()        // Get stored token
getUserEmail()        // Get stored email
saveAuthData()        // Save token and email
clearAuthData()       // Logout - clear all data
getUserInfo()         // Get token and email together
```

---

## 🎨 UI Features

### Login Screen
- ✅ Email validation with real-time feedback
- ✅ Password visibility toggle
- ✅ Terms & conditions checkbox
- ✅ "Forgot Password" link (UI only)
- ✅ Link to registration
- ✅ iOS-optimized keyboard handling
- ✅ Loading states

### Registration Screen
- ✅ All required fields marked with *
- ✅ Password matching validation
- ✅ Optional fields (phone, country, district, sector)
- ✅ Real-time validation feedback
- ✅ Back button to login
- ✅ Comprehensive error messages

### Home Screen
- ✅ Personalized greeting
- ✅ User profile menu
- ✅ Logout with confirmation
- ✅ Login prompts for guests
- ✅ Protected feature access

---

## 🔄 Navigation Rules

### When NOT Logged In
- ✅ Can access: Login, Register screens
- ❌ Cannot access: (tabs), listening, history
- 🔄 Attempting to access protected routes → Redirect to Login

### When Logged In
- ✅ Can access: All screens
- ❌ Cannot access: Login, Register (auto-redirect to home)
- 🔄 Logout → Clear data and redirect to Login

---

## 💾 Data Storage (AsyncStorage)

```typescript
// Stored Keys
'authToken'   // JWT token from backend
'userEmail'   // User's email address

// Usage
await AsyncStorage.setItem('authToken', token);
await AsyncStorage.getItem('authToken');
await AsyncStorage.removeItem('authToken');
```

---

## 🔧 Backend Integration

### API Endpoints Used
```
POST /auth/register
Body: { email, password, full_name }
Response: { message, user }

POST /auth/login
Body: { email, password }
Response: { access_token, token_type, user }
```

### Platform-Specific URLs
```typescript
Platform.select({
  ios: 'http://localhost:8000',      // Simulator
  android: 'http://10.0.2.2:8000',   // Emulator
  default: 'http://localhost:8000',
});
```

**For Physical Device:** Replace `localhost` with your computer's IP address (e.g., `http://192.168.1.100:8000`)

---

## 🐛 Common Issues & Fixes

### Issue: "Cannot connect to server"
```typescript
// Check:
1. Backend is running: python -m uvicorn main:app --reload
2. Correct URL in login.tsx and register.tsx
3. For physical device: Use IP address, not localhost
4. Both devices on same WiFi (for physical device)
```

### Issue: User not staying logged in
```typescript
// Ensure token is saved:
await AsyncStorage.setItem('authToken', data.access_token);
await AsyncStorage.setItem('userEmail', email.trim().toLowerCase());

// Check in _layout.tsx that checkAuthStatus is called
```

### Issue: Can still access tabs without login
```typescript
// In _layout.tsx, the useProtectedRoute hook should redirect
// Check that it's being called with correct isAuthenticated state
```

### Issue: Stuck in redirect loop
```typescript
// Make sure you're using router.replace() not router.push()
router.replace('/login');  // ✅ Correct
router.push('/login');     // ❌ Wrong - can go back
```

---

## 📋 Testing Checklist

### Registration Flow
- [ ] Can create new account with valid data
- [ ] Shows error for existing email
- [ ] Shows error for invalid email format
- [ ] Shows error for password mismatch
- [ ] Shows error when terms not accepted
- [ ] Redirects to login after successful registration

### Login Flow
- [ ] Can login with valid credentials
- [ ] Shows error for invalid credentials
- [ ] Shows error when fields are empty
- [ ] Shows error when terms not accepted
- [ ] Redirects to home after successful login
- [ ] Token and email are saved

### Protected Routes
- [ ] Cannot access tabs when not logged in
- [ ] Redirected to login when trying to access tabs
- [ ] Can access all features when logged in
- [ ] Cannot navigate back to auth screens when logged in

### Logout Flow
- [ ] Logout button shows user email
- [ ] Confirmation dialog appears
- [ ] Data is cleared after logout
- [ ] Redirected to login screen
- [ ] Cannot access protected routes after logout

### Persistence
- [ ] User stays logged in after app restart
- [ ] User info is loaded on app launch
- [ ] Can logout and login as different user

---

## 🚀 Running on iOS

### iOS Simulator
```bash
# Option 1: Expo CLI
npm start
# Then press 'i' for iOS

# Option 2: Direct command
npm run ios
```

### Physical iPhone
```bash
# 1. Update backend URL to use your Mac's IP
# 2. Start Expo
npm start

# 3. Scan QR code with iPhone camera
# Opens in Expo Go app
```

---

## 📝 Code Examples

### Check if logged in (any component)
```typescript
import { isAuthenticated } from '@/utils/auth';

const checkAuth = async () => {
  const loggedIn = await isAuthenticated();
  if (!loggedIn) {
    router.push('/login');
  }
};
```

### Get user info (any component)
```typescript
import { getUserInfo } from '@/utils/auth';

const loadUser = async () => {
  const { token, email } = await getUserInfo();
  console.log('User:', email);
};
```

### Logout (any component)
```typescript
import { clearAuthData } from '@/utils/auth';
import { useRouter } from 'expo-router';

const handleLogout = async () => {
  await clearAuthData();
  router.replace('/login');
};
```

---

## 🎯 Next Features to Add

1. **Password Reset** - Forgot password functionality
2. **Profile Editing** - Update user information
3. **Email Verification** - Verify email after registration
4. **Remember Me** - Option to stay logged in
5. **Biometric Auth** - Face ID / Touch ID
6. **Social Login** - Google, Apple sign-in
7. **Session Timeout** - Auto-logout after inactivity
8. **Multi-device Support** - Login from multiple devices

---

## 📱 Platform Differences

### iOS
- Uses `localhost:8000` for Simulator
- Requires IP address for physical device
- Better keyboard handling with `KeyboardAvoidingView`
- Native shadow styles

### Android
- Uses `10.0.2.2:8000` for Emulator
- Different elevation for shadows
- Material Design patterns

---

## 🔍 Debugging Tips

### View stored data
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

const debugAuth = async () => {
  const token = await AsyncStorage.getItem('authToken');
  const email = await AsyncStorage.getItem('userEmail');
  console.log('Token:', token);
  console.log('Email:', email);
};
```

### Clear all data (testing)
```typescript
const resetApp = async () => {
  await AsyncStorage.clear();
  console.log('All data cleared');
};
```

### Check navigation state
```typescript
import { useRouter, useSegments } from 'expo-router';

const segments = useSegments();
console.log('Current route:', segments);
```

---

**Last Updated:** November 2025  
**Status:** ✅ Fully Functional for iOS Emulator
