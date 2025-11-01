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
import { API_CONFIG, API_ENDPOINTS, getApiUrl, logApiConfig } from '@/utils/api-config';

export default function RegisterScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [country, setCountry] = useState('');
  const [district, setDistrict] = useState('');
  const [sector, setSector] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    // Log API configuration on mount (development only)
    logApiConfig();
  }, []);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 6;
  };

  const handleRegister = async () => {
    Keyboard.dismiss();

    // Validation
    if (!fullName.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert('Missing Information', 'Please fill in all required fields (marked with *)');
      return;
    }

    if (!validateEmail(email.trim())) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }

    if (!validatePassword(password)) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Password Mismatch', 'Passwords do not match. Please try again.');
      return;
    }

    if (!agreeToTerms) {
      Alert.alert('Terms Required', 'Please agree to terms and conditions to continue');
      return;
    }

    setLoading(true);

    try {
      const registerUrl = getApiUrl(API_ENDPOINTS.REGISTER);
      console.log('📝 Attempting registration to:', registerUrl);

      const response = await fetch(registerUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password: password,
          full_name: fullName.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('✅ Registration successful');
        Alert.alert(
          'Success! 🎉',
          'Your account has been created successfully. Please sign in to continue.',
          [
            {
              text: 'Sign In',
              onPress: () => router.replace('/login'),
            },
          ]
        );
      } else {
        console.error('❌ Registration failed:', data.detail);
        Alert.alert(
          'Registration Failed',
          data.detail || 'This email is already registered or invalid data provided'
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
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
              disabled={loading}
            >
              <Ionicons name="arrow-back" size={24} color="#8B0000" />
            </TouchableOpacity>
            <View style={styles.headerContent}>
              <Text style={styles.welcomeText}>Join</Text>
              <Text style={styles.appName}>NeoParental</Text>
              <Text style={styles.tagline}>Create your account today</Text>
            </View>
          </View>

          {/* Register Form */}
          <View style={styles.formContainer}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Fill in your information below</Text>

            {/* Server Info (Development Only) */}
            {__DEV__ && (
              <View style={styles.devInfo}>
                <Ionicons name="information-circle" size={14} color="#2196F3" />
                <Text style={styles.devInfoText}>
                  Server: {API_CONFIG.BASE_URL}
                </Text>
              </View>
            )}

            {/* Required Fields Notice */}
            <View style={styles.requiredNotice}>
              <Ionicons name="information-circle" size={16} color="#FF5722" />
              <Text style={styles.requiredText}>* Required fields</Text>
            </View>

            {/* Full Name */}
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Full Name *</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your full name"
                  placeholderTextColor="#999"
                  value={fullName}
                  onChangeText={setFullName}
                  autoComplete="name"
                  textContentType="name"
                  editable={!loading}
                  returnKeyType="next"
                />
              </View>
            </View>

            {/* Email */}
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Email *</Text>
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

            {/* Password */}
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Password *</Text>
              <View style={[
                styles.inputContainer,
                password.trim() && !validatePassword(password) && styles.inputError
              ]}>
                <Ionicons 
                  name="lock-closed-outline" 
                  size={20} 
                  color={password.trim() && !validatePassword(password) ? '#FF3B30' : '#666'} 
                  style={styles.inputIcon} 
                />
                <TextInput
                  style={styles.input}
                  placeholder="At least 6 characters"
                  placeholderTextColor="#999"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoComplete="password-new"
                  textContentType="newPassword"
                  editable={!loading}
                  returnKeyType="next"
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
              {password.trim() && !validatePassword(password) && (
                <Text style={styles.errorText}>Password must be at least 6 characters</Text>
              )}
            </View>

            {/* Confirm Password */}
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Confirm Password *</Text>
              <View style={[
                styles.inputContainer,
                confirmPassword.trim() && password !== confirmPassword && styles.inputError
              ]}>
                <Ionicons 
                  name="lock-closed-outline" 
                  size={20} 
                  color={confirmPassword.trim() && password !== confirmPassword ? '#FF3B30' : '#666'} 
                  style={styles.inputIcon} 
                />
                <TextInput
                  style={styles.input}
                  placeholder="Re-enter your password"
                  placeholderTextColor="#999"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  autoComplete="password-new"
                  textContentType="newPassword"
                  editable={!loading}
                  returnKeyType="next"
                />
                <TouchableOpacity 
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons 
                    name={showConfirmPassword ? "eye-outline" : "eye-off-outline"} 
                    size={20} 
                    color="#666" 
                  />
                </TouchableOpacity>
              </View>
              {confirmPassword.trim() && password !== confirmPassword && (
                <Text style={styles.errorText}>Passwords do not match</Text>
              )}
            </View>

            {/* Optional Fields Section */}
            <Text style={styles.sectionTitle}>Additional Information (Optional)</Text>

            {/* Phone Number */}
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Phone Number</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="call-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter phone number"
                  placeholderTextColor="#999"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  keyboardType="phone-pad"
                  autoComplete="tel"
                  textContentType="telephoneNumber"
                  editable={!loading}
                  returnKeyType="next"
                />
              </View>
            </View>

            {/* Country */}
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Country</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="flag-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter country"
                  placeholderTextColor="#999"
                  value={country}
                  onChangeText={setCountry}
                  autoComplete="country"
                  textContentType="countryName"
                  editable={!loading}
                  returnKeyType="next"
                />
              </View>
            </View>

            {/* District and Sector Row */}
            <View style={styles.rowContainer}>
              <View style={[styles.inputWrapper, styles.halfWidth]}>
                <Text style={styles.inputLabel}>District</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="location-outline" size={20} color="#666" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="District"
                    placeholderTextColor="#999"
                    value={district}
                    onChangeText={setDistrict}
                    editable={!loading}
                    returnKeyType="next"
                  />
                </View>
              </View>

              <View style={[styles.inputWrapper, styles.halfWidth]}>
                <Text style={styles.inputLabel}>Sector</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="map-outline" size={20} color="#666" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Sector"
                    placeholderTextColor="#999"
                    value={sector}
                    onChangeText={setSector}
                    editable={!loading}
                    returnKeyType="done"
                    onSubmitEditing={handleRegister}
                  />
                </View>
              </View>
            </View>

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
                {' '}and{' '}
                <Text style={styles.termsLink}>Privacy Policy</Text>
              </Text>
            </TouchableOpacity>

            {/* Register Button */}
            <TouchableOpacity
              style={[
                styles.registerButton, 
                loading && styles.registerButtonDisabled,
                (!fullName.trim() || !email.trim() || !password.trim() || 
                 !confirmPassword.trim() || !agreeToTerms || password !== confirmPassword) && 
                 styles.registerButtonDisabled
              ]}
              onPress={handleRegister}
              disabled={
                loading || 
                !fullName.trim() || 
                !email.trim() || 
                !password.trim() || 
                !confirmPassword.trim() || 
                !agreeToTerms || 
                password !== confirmPassword
              }
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.registerButtonText}>Create Account</Text>
                  <Ionicons name="arrow-forward" size={20} color="#fff" />
                </>
              )}
            </TouchableOpacity>

            {/* Sign In Link */}
            <View style={styles.signinContainer}>
              <Text style={styles.signinText}>Already have an account?</Text>
              <TouchableOpacity 
                onPress={() => router.back()}
                disabled={loading}
              >
                <Text style={styles.signinLink}>Sign In</Text>
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
    paddingBottom: 35,
    paddingHorizontal: 30,
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
    position: 'relative',
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
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 50,
    left: 20,
    zIndex: 10,
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 24,
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
    paddingTop: 30,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    marginBottom: 15,
  },
  devInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
    gap: 8,
  },
  devInfoText: {
    fontSize: 11,
    color: '#2196F3',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  requiredNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff5f0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    gap: 8,
  },
  requiredText: {
    fontSize: 13,
    color: '#FF5722',
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginTop: 20,
    marginBottom: 15,
  },
  inputWrapper: {
    marginBottom: 18,
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
  rowContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
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
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
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
    fontSize: 13,
    color: '#666',
    flex: 1,
    lineHeight: 20,
  },
  termsLink: {
    color: '#FF5722',
    fontWeight: '600',
  },
  registerButton: {
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
  registerButtonDisabled: {
    opacity: 0.5,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  signinContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
    marginTop: 10,
  },
  signinText: {
    color: '#666',
    fontSize: 15,
  },
  signinLink: {
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
