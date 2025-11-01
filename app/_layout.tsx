import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  initialRouteName: 'login',
};

function useProtectedRoute(isAuthenticated: boolean | null) {
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated === null) return; // Still checking auth status

    const inAuthGroup = segments[0] === '(tabs)';
    const inAuthScreens = segments[0] === 'login' || segments[0] === 'register';

    if (!isAuthenticated && inAuthGroup) {
      // Redirect to login if trying to access protected routes
      router.replace('/login');
    } else if (isAuthenticated && inAuthScreens) {
      // Redirect to home if authenticated and on login/register screens
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, segments]);
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    checkAuthStatus();
    
    // Set up an interval to check auth status periodically
    const interval = setInterval(checkAuthStatus, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const newAuthState = !!token;
      
      // Only update if auth state actually changed
      if (newAuthState !== isAuthenticated) {
        console.log('🔄 Auth state changed:', newAuthState ? 'logged in' : 'logged out');
        setIsAuthenticated(newAuthState);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setIsAuthenticated(false);
    }
  };

  useProtectedRoute(isAuthenticated);

  if (isAuthenticated === null) {
    // You could add a splash screen component here
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#fff' },
        }}
      >
        <Stack.Screen 
          name="login" 
          options={{ 
            headerShown: false,
            gestureEnabled: false,
          }} 
        />
        <Stack.Screen 
          name="register" 
          options={{ 
            headerShown: false,
            presentation: 'card',
            gestureDirection: 'horizontal',
          }} 
        />
        <Stack.Screen 
          name="(tabs)" 
          options={{ 
            headerShown: false,
            gestureEnabled: false,
          }} 
        />
        <Stack.Screen 
          name="listening" 
          options={{ 
            headerShown: false,
            presentation: 'card',
          }} 
        />
        <Stack.Screen 
          name="history" 
          options={{ 
            headerShown: false,
            presentation: 'card',
          }} 
        />
        <Stack.Screen 
          name="modal" 
          options={{ 
            presentation: 'modal', 
            title: 'Modal',
          }} 
        />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
