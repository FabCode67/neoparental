import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, API_ENDPOINTS, getApiUrl, logApiConfig } from '@/utils/api-config';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    // Log API configuration on mount (development only)
    logApiConfig();
  }, []);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async () => {
    // Dismiss keyboard
    Keyboard.dismiss();

    // Validation
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing Information', 'Please fill in all fields');
      return;
    }

    if (!validateEmail(email.trim())) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }

    if (!agreeToTerms) {
      Alert.alert('Terms Required', 'Please agree to terms and conditions to continue');
      return;
    }

    setLoading(true);

    try {
      const loginUrl = getApiUrl(API_ENDPOINTS.LOGIN);
      console.log('🔐 Attempting login to:', loginUrl);

      const response = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('✅ Login successful');
        
        // Save authentication data
        await AsyncStorage.setItem('authToken', data.access_token);
        await AsyncStorage.setItem('userEmail', email.trim().toLowerCase());
        
        console.log('📱 Token saved, navigating to home...');
        
        // Force immediate navigation
        router.replace('/(tabs)');
        
        // Also try push as backup
        setTimeout(() => {
          router.push('/(tabs)');
        }, 100);
      } else {
        console.error('❌ Login failed:', data.detail);
        Alert.alert(
          'Login Failed', 
          data.detail || 'Invalid email or password. Please try again.'
        );
      }
    } catch (error) {
      console.error('❌ Connection error:', error);
      Alert.alert(
        'Connection Error',
        `Could not connect to server.\n\n` +
        `Please check:\n` +
        `• Your internet connection\n` +
        `• Backend server is running\n` +
        `• Server URL: ${API_CONFIG.BASE_URL}\n\n` +
        `If using a physical device:\n` +
        `• Update LAPTOP_IP in utils/api-config.ts\n` +
        `• Ensure phone and laptop are on same WiFi\n` +
        `• Start backend with: uvicorn main:app --host 0.0.0.0`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          bounces={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Text style={styles.welcomeText}>Welcome</Text>
              <Text style={styles.welcomeText}>to</Text>
              <Text style={styles.appName}>NeoParental</Text>
              <Text style={styles.tagline}>Monitor. Protect. Connect.</Text>
            </View>
          </View>

          {/* Login Form */}
          <View style={styles.formContainer}>
            <Text style={styles.title}>Sign In</Text>
            <Text style={styles.subtitle}>Access your account</Text>

            {/* Server Info (Development Only) */}
            {__DEV__ && (
              <View style={styles.devInfo}>
                <Ionicons name="information-circle" size={14} color="#2196F3" />
                <Text style={styles.devInfoText}>
                  Server: {API_CONFIG.BASE_URL}
                </Text>
              </View>
            )}

            {/* Email Input */}
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Email</Text>
              <View style={[
                styles.inputContainer,
                email.trim() && !validateEmail(email.trim()) && styles.inputError
              ]}>
                <Ionicons 
                  name="mail-outline" 
                  size={20} 
                  color={email.trim() && !validateEmail(email.trim()) ? '#FF3B30' : '#666'} 
                  style={styles.inputIcon} 
                />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor="#999"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoComplete="email"
                  textContentType="emailAddress"
                  editable={!loading}
                  returnKeyType="next"
                />
              </View>
              {email.trim() && !validateEmail(email.trim()) && (
                <Text style={styles.errorText}>Please enter a valid email</Text>
              )}
            </View>

            {/* Password Input */}
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.inputContainer}>
                <Ionicons 
                  name="lock-closed-outline" 
                  size={20} 
                  color="#666" 
                  style={styles.inputIcon} 
                />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  placeholderTextColor="#999"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoComplete="password"
                  textContentType="password"
                  editable={!loading}
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                />
                <TouchableOpacity 
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons 
                    name={showPassword ? "eye-outline" : "eye-off-outline"} 
                    size={20} 
                    color="#666" 
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Forgot Password */}
            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Terms and Conditions */}
            <TouchableOpacity 
              style={styles.termsContainer}
              onPress={() => setAgreeToTerms(!agreeToTerms)}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, agreeToTerms && styles.checkboxChecked]}>
                {agreeToTerms && (
                  <Ionicons name="checkmark" size={16} color="#fff" />
                )}
              </View>
              <Text style={styles.termsText}>
                I agree to the{' '}
                <Text style={styles.termsLink}>Terms and Conditions</Text>
              </Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity
              style={[
                styles.loginButton, 
                loading && styles.loginButtonDisabled,
                (!email.trim() || !password.trim() || !agreeToTerms) && styles.loginButtonDisabled
              ]}
              onPress={handleLogin}
              disabled={loading || !email.trim() || !password.trim() || !agreeToTerms}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.loginButtonText}>Sign In</Text>
                  <Ionicons name="arrow-forward" size={20} color="#fff" />
                </>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Sign Up Link */}
            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>Don't have an account?</Text>
              <TouchableOpacity 
                onPress={() => router.push('/register')}
                disabled={loading}
              >
                <Text style={styles.signupLink}>Create Account</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.copyright}>© 2025 NeoParental. All rights reserved.</Text>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    backgroundColor: '#FF5722',
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingBottom: 40,
    paddingHorizontal: 30,
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  headerContent: {
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: '600',
    color: '#8B0000',
    letterSpacing: 0.5,
  },
  appName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#8B0000',
    marginTop: 5,
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 14,
    color: '#8B0000',
    marginTop: 8,
    opacity: 0.8,
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 35,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  devInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
    gap: 8,
  },
  devInfoText: {
    fontSize: 11,
    color: '#2196F3',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  inputWrapper: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: Platform.OS === 'ios' ? 15 : 12,
    backgroundColor: '#fafafa',
  },
  inputError: {
    borderColor: '#FF3B30',
    backgroundColor: '#fff5f5',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1a1a1a',
  },
  eyeIcon: {
    padding: 5,
  },
  errorText: {
    fontSize: 12,
    color: '#FF3B30',
    marginTop: 5,
    marginLeft: 5,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 25,
    marginTop: -5,
  },
  forgotPasswordText: {
    color: '#FF5722',
    fontSize: 14,
    fontWeight: '600',
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 6,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  checkboxChecked: {
    backgroundColor: '#FF5722',
    borderColor: '#FF5722',
  },
  termsText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  termsLink: {
    color: '#FF5722',
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: '#FF5722',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 20,
    gap: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#FF5722',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  loginButtonDisabled: {
    opacity: 0.5,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 25,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  dividerText: {
    marginHorizontal: 15,
    color: '#999',
    fontSize: 14,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
  },
  signupText: {
    color: '#666',
    fontSize: 15,
  },
  signupLink: {
    color: '#FF5722',
    fontSize: 15,
    fontWeight: '700',
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  copyright: {
    textAlign: 'center',
    color: '#999',
    fontSize: 12,
  },
});
