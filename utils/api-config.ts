import { Platform } from 'react-native';

/**
 * API Configuration for NeoParental App
 * 
 * 🔧 SETUP INSTRUCTIONS:
 * 1. Find your laptop's IP address:
 *    - Windows: Run 'ipconfig' in Command Prompt
 *    - macOS: Run 'ifconfig | grep "inet "' in Terminal
 *    - Look for IPv4 address (e.g., 192.168.1.100)
 * 
 * 2. Update LAPTOP_IP below with your IP address
 * 
 * 3. Start backend with:
 *    python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
 * 
 * 4. Ensure phone and laptop are on same WiFi network
 */

// 🔥 UPDATE THIS with your laptop's IP address!
// Find it using: ipconfig (Windows) or ifconfig (Mac/Linux)
const LAPTOP_IP = '172.20.10.2'; // ← CHANGE THIS TO YOUR LAPTOP'S IP!

// Check if we're in development mode and on a real device
const isDevelopment = __DEV__;

export const API_CONFIG = {
  /**
   * Base URL configuration based on platform
   * - iOS Simulator: Uses localhost
   * - iOS Physical Device: Uses laptop IP
   * - Android Emulator: Uses 10.0.2.2 (special Android address)
   * - Android Physical Device: Uses laptop IP
   */
  BASE_URL: Platform.select({
    // iOS Configuration
    ios: isDevelopment 
      ? `http://${LAPTOP_IP}:8000`     // Physical device in development
      : 'http://localhost:8000',        // Production or simulator
    
    // Android Configuration
    android: isDevelopment
      ? `http://${LAPTOP_IP}:8000`     // Physical device in development
      : 'http://10.0.2.2:8000',         // Emulator
    
    // Default fallback
    default: 'http://localhost:8000',
  }),
  
  // Request timeout in milliseconds (10 seconds)
  TIMEOUT: 10000,
  
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
    console.log('🌐 API Configuration:');
    console.log(`   Base URL: ${API_CONFIG.BASE_URL}`);
    console.log(`   Platform: ${Platform.OS}`);
    console.log(`   Development: ${isDevelopment}`);
    console.log(`   Laptop IP: ${LAPTOP_IP}`);
    console.log('');
    console.log('📝 To update:');
    console.log('   1. Find your IP: ipconfig (Windows) or ifconfig (Mac)');
    console.log('   2. Update LAPTOP_IP in utils/api-config.ts');
    console.log('   3. Restart Expo: npm start');
  }
};

/**
 * Test if backend is reachable
 */
export const testConnection = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/`, {
      method: 'GET',
    });
    return response.ok;
  } catch (error) {
    console.error('❌ Backend connection test failed:', error);
    return false;
  }
};

// Export the laptop IP for reference
export { LAPTOP_IP };
