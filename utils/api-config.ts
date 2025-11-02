import { Platform } from 'react-native';

/**
 * API Configuration for NeoParental App
 * 
 * 🔧 SETUP INSTRUCTIONS:
 * 1. Copy .env.example to .env
 * 2. Find your laptop's IP address:
 *    - Windows: Run 'ipconfig' in Command Prompt
 *    - macOS: Run 'ifconfig | grep "inet "' in Terminal
 *    - Look for IPv4 address (e.g., 192.168.1.100)
 * 3. Update EXPO_PUBLIC_LAPTOP_IP in .env file
 * 4. Start backend with:
 *    python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
 * 5. Ensure phone and laptop are on same WiFi network
 * 6. IMPORTANT: Restart Expo after changing .env (Ctrl+C then npm start)
 */

// Get environment variables - Expo automatically provides process.env for EXPO_PUBLIC_ prefixed vars
const LAPTOP_IP = process.env.EXPO_PUBLIC_LAPTOP_IP || '192.168.1.100';
const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8000';
const PREDICTION_API_URL = process.env.EXPO_PUBLIC_PREDICTION_API_URL || 'https://neoparental-fast-api.onrender.com';
const API_TIMEOUT = parseInt(process.env.EXPO_PUBLIC_API_TIMEOUT || '10000');

// Check if we're in development mode
const isDevelopment = __DEV__;

export const API_CONFIG = {
  /**
   * Base URL configuration based on platform
   * - iOS Simulator: Uses localhost
   * - iOS Physical Device: Uses laptop IP from .env
   * - Android Emulator: Uses 10.0.2.2 (special Android address)
   * - Android Physical Device: Uses laptop IP from .env
   */
  BASE_URL: Platform.select({
    // iOS Configuration
    ios: isDevelopment 
      ? `http://${LAPTOP_IP}:8000`     // Physical device in development
      : BACKEND_URL,                    // Production or simulator
    
    // Android Configuration
    android: isDevelopment
      ? `http://${LAPTOP_IP}:8000`     // Physical device in development
      : 'http://10.0.2.2:8000',         // Emulator
    
    // Web/Default fallback
    default: BACKEND_URL,
  }),
  
  // Prediction API URL
  PREDICTION_API_URL,
  
  // Request timeout in milliseconds
  TIMEOUT: API_TIMEOUT,
  
  // API version
  VERSION: 'v1',
  
  // Enable debug logging
  DEBUG: isDevelopment,
};

/**
 * API Endpoints
 */
export const API_ENDPOINTS = {
  // Authentication
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
  REFRESH_TOKEN: '/auth/refresh',
  
  // User
  USER_PROFILE: '/user/profile',
  UPDATE_PROFILE: '/user/update',
  
  // Audio
  PREDICT_AUDIO: '/predict',
  UPLOAD_AUDIO: '/audio/upload',
  GET_HISTORY: '/audio/history',
  GET_AUDIO_BY_ID: '/audio',
  
  // Feedback
  GET_FEEDBACK: '/feedback',
  SUBMIT_FEEDBACK: '/feedback/submit',
};

/**
 * Helper function to get full API URL for an endpoint
 * @param endpoint - The API endpoint (e.g., '/auth/login')
 * @returns Full URL with base URL
 */
export const getApiUrl = (endpoint: string): string => {
  const baseUrl = API_CONFIG.BASE_URL;
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}${cleanEndpoint}`;
};

/**
 * Helper function to log API configuration (debug only)
 */
export const logApiConfig = (): void => {
  if (API_CONFIG.DEBUG) {
    console.log('\n🌐 API Configuration:');
    console.log('═'.repeat(50));
    console.log(`   Base URL: ${API_CONFIG.BASE_URL}`);
    console.log(`   Prediction API: ${API_CONFIG.PREDICTION_API_URL}`);
    console.log(`   Platform: ${Platform.OS}`);
    console.log(`   Development: ${isDevelopment}`);
    console.log(`   Laptop IP: ${LAPTOP_IP}`);
    console.log(`   Timeout: ${API_CONFIG.TIMEOUT}ms`);
    console.log('═'.repeat(50));
    console.log('\n💡 To update configuration:');
    console.log('   1. Edit .env file in project root');
    console.log('   2. Update EXPO_PUBLIC_LAPTOP_IP with your IP');
    console.log('   3. Stop Expo (Ctrl+C)');
    console.log('   4. Restart: npm start');
    console.log('   5. Reload app on device\n');
  }
};

/**
 * Test if backend is reachable
 */
export const testConnection = async (): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(`${API_CONFIG.BASE_URL}/`, {
      method: 'GET',
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    console.error('❌ Backend connection test failed:', error);
    return false;
  }
};

// Export the laptop IP for reference
export { LAPTOP_IP };
