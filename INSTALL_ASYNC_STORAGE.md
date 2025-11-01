# Quick Fix for Web Storage Issue

## The Problem
`expo-secure-store` doesn't work on web browser. You need `AsyncStorage` instead.

## Quick Fix (3 Steps)

### 1. Install AsyncStorage
```bash
npx expo install @react-native-async-storage/async-storage
```

### 2. Restart Expo
```bash
npx expo start --clear
```

### 3. Start Backend
```bash
cd backend
python main.py
```

## That's it!

The code has already been updated to use AsyncStorage.

## Next: Test Login

Add this button temporarily to `listening.tsx` to test:

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

// Add this button in your UI
<TouchableOpacity 
  style={styles.actionButton}
  onPress={async () => {
    // Register
    await fetch('http://localhost:8000/auth/register', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'test123',
        full_name: 'Test User'
      })
    });
    
    // Login
    const res = await fetch('http://localhost:8000/auth/login', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'test123'
      })
    });
    
    const data = await res.json();
    await AsyncStorage.setItem('authToken', data.access_token);
    Alert.alert('✅ Logged in!');
  }}
>
  <Text style={styles.actionButtonText}>🔐 Login</Text>
</TouchableOpacity>
```

Then try making a prediction!
