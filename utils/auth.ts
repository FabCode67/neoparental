import AsyncStorage from '@react-native-async-storage/async-storage';

export const AUTH_TOKEN_KEY = 'authToken';
export const USER_EMAIL_KEY = 'userEmail';

/**
 * Check if user is authenticated
 */
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    return !!token;
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
};

/**
 * Get authentication token
 */
export const getAuthToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(AUTH_TOKEN_KEY);
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

/**
 * Get user email
 */
export const getUserEmail = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(USER_EMAIL_KEY);
  } catch (error) {
    console.error('Error getting user email:', error);
    return null;
  }
};

/**
 * Save authentication data
 */
export const saveAuthData = async (token: string, email: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
    await AsyncStorage.setItem(USER_EMAIL_KEY, email);
  } catch (error) {
    console.error('Error saving auth data:', error);
    throw error;
  }
};

/**
 * Clear authentication data (logout)
 */
export const clearAuthData = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, USER_EMAIL_KEY]);
  } catch (error) {
    console.error('Error clearing auth data:', error);
    throw error;
  }
};

/**
 * Get user info
 */
export const getUserInfo = async (): Promise<{ token: string | null; email: string | null }> => {
  try {
    const token = await getAuthToken();
    const email = await getUserEmail();
    return { token, email };
  } catch (error) {
    console.error('Error getting user info:', error);
    return { token: null, email: null };
  }
};
